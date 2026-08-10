"""
error_tracker.py

Persists every pronunciation attempt to SQLite and answers the question
your resume bullet claims: "which phonetic errors keep recurring for this
user, across different words and sessions?"

Single-user scope for now (no auth in this project) — everything is
tracked under a default user_id.
"""

import sqlite3
from datetime import datetime
from contextlib import contextmanager

DB_PATH = "speechease.db"
DEFAULT_USER = "default_user"


@contextmanager
def _connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with _connect() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                target_word TEXT NOT NULL,
                transcribed_word TEXT,
                correct INTEGER NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS phoneme_errors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                attempt_id INTEGER NOT NULL,
                error_type TEXT NOT NULL,
                expected_phoneme TEXT,
                actual_phoneme TEXT,
                FOREIGN KEY (attempt_id) REFERENCES attempts (id)
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS library_words (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                word TEXT NOT NULL,
                category TEXT NOT NULL,
                created_at TEXT NOT NULL,
                UNIQUE(user_id, word, category)
            )
        """)


def log_attempt(analysis_result: dict, user_id: str = DEFAULT_USER) -> int:
    with _connect() as conn:
        cur = conn.execute(
            """INSERT INTO attempts
               (user_id, target_word, transcribed_word, correct, created_at)
               VALUES (?, ?, ?, ?, ?)""",
            (
                user_id,
                analysis_result["target_word"],
                analysis_result.get("transcribed_word"),
                int(analysis_result["correct"]),
                datetime.utcnow().isoformat(),
            ),
        )
        attempt_id = cur.lastrowid

        for err in analysis_result.get("errors", []):
            conn.execute(
                """INSERT INTO phoneme_errors
                   (attempt_id, error_type, expected_phoneme, actual_phoneme)
                   VALUES (?, ?, ?, ?)""",
                (attempt_id, err["type"], err.get("expected"), err.get("actual")),
            )
        return attempt_id


def get_recurring_errors(user_id: str = DEFAULT_USER, min_occurrences: int = 2, limit: int = 5):
    """Phoneme substitution patterns that recur across ALL past attempts."""
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT pe.expected_phoneme, pe.actual_phoneme, COUNT(*) as cnt
            FROM phoneme_errors pe
            JOIN attempts a ON pe.attempt_id = a.id
            WHERE a.user_id = ? AND pe.error_type = 'sub'
            GROUP BY pe.expected_phoneme, pe.actual_phoneme
            HAVING cnt >= ?
            ORDER BY cnt DESC
            LIMIT ?
            """,
            (user_id, min_occurrences, limit),
        ).fetchall()

    return [
        {"expected": r["expected_phoneme"], "actual": r["actual_phoneme"], "count": r["cnt"]}
        for r in rows
    ]


def generate_personalized_feedback(user_id: str = DEFAULT_USER) -> str:
    from phonetic import describe_phoneme

    recurring = get_recurring_errors(user_id)
    if not recurring:
        return "Not enough data yet to spot a pattern — keep practicing!"

    top = recurring[0]
    lines = [
        f"You most often substitute {describe_phoneme(top['actual'])} "
        f"for {describe_phoneme(top['expected'])} ({top['count']} times so far)."
    ]
    if len(recurring) > 1:
        others = ", ".join(
            f"{describe_phoneme(r['expected'])} → {describe_phoneme(r['actual'])}"
            for r in recurring[1:]
        )
        lines.append(f"Other recurring patterns: {others}.")
    return " ".join(lines)


def get_words_needing_practice(user_id: str = DEFAULT_USER, limit: int = 10):
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT target_word, COUNT(*) as miss_count
            FROM attempts
            WHERE user_id = ? AND correct = 0
            GROUP BY target_word
            ORDER BY miss_count DESC
            LIMIT ?
            """,
            (user_id, limit),
        ).fetchall()
    return [{"word": r["target_word"], "misses": r["miss_count"]} for r in rows]


def add_library_word(word: str, category: str, user_id: str = DEFAULT_USER):
    with _connect() as conn:
        conn.execute(
            """INSERT OR IGNORE INTO library_words (user_id, word, category, created_at)
               VALUES (?, ?, ?, ?)""",
            (user_id, word.strip(), category, datetime.utcnow().isoformat()),
        )


def get_library(user_id: str = DEFAULT_USER):
    with _connect() as conn:
        rows = conn.execute(
            "SELECT word, category FROM library_words WHERE user_id = ? ORDER BY created_at",
            (user_id,),
        ).fetchall()
    library = {"Overcome": [], "Achievement": [], "Special Care": []}
    for r in rows:
        library.setdefault(r["category"], []).append(r["word"])
    return library