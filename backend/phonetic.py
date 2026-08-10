"""
phonetic_analysis.py

Compares the phonemes of a target (expected) word against the phonemes of
what the user actually said (as transcribed by the Web Speech API), and
returns a structured list of phoneme-level errors: substitutions,
deletions, and insertions.

Honest scope note (say this in interviews):
This compares TEXT-level transcription phonemes, not raw audio phonemes.
We look up the expected word's pronunciation and the transcribed word's
pronunciation in the CMU Pronouncing Dictionary, then diff the phoneme
sequences. This is a legitimate, explainable technique for lightweight
pronunciation feedback, but it is downstream of the browser's speech
recognizer, not a from-scratch acoustic phoneme classifier.
"""

import pronouncing

PHONEME_DESCRIPTIONS = {
    "TH": "the 'th' sound (as in 'think')",
    "DH": "the soft 'th' sound (as in 'this')",
    "S": "the 's' sound",
    "Z": "the 'z' sound",
    "SH": "the 'sh' sound",
    "CH": "the 'ch' sound",
    "R": "the 'r' sound",
    "L": "the 'l' sound",
    "F": "the 'f' sound",
    "V": "the 'v' sound",
    "K": "the 'k' sound",
    "G": "the hard 'g' sound",
}


def _strip_stress(phones: str) -> list[str]:
    """'TH IH1 NG K' -> ['TH', 'IH', 'NG', 'K'] (drop stress digits)."""
    return [p.rstrip("012") for p in phones.split()]


def get_phonemes(word: str) -> list[str] | None:
    """Look up a word's phoneme sequence. Returns None if not in the CMU dict
    (this happens for typos, made-up words, or misrecognized garbage)."""
    word = word.strip().lower()
    candidates = pronouncing.phones_for_word(word)
    if not candidates:
        return None
    return _strip_stress(candidates[0])


def _align(expected: list[str], actual: list[str]):
    """
    Edit-distance alignment (Levenshtein with traceback) between two
    phoneme sequences. Returns a list of ops:
    ('match', ph, ph) | ('sub', expected_ph, actual_ph) |
    ('del', expected_ph, None) | ('ins', None, actual_ph)
    """
    n, m = len(expected), len(actual)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if expected[i - 1] == actual[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j],
                    dp[i][j - 1],
                    dp[i - 1][j - 1]
                )

    ops = []
    i, j = n, m
    while i > 0 or j > 0:
        if i > 0 and j > 0 and expected[i - 1] == actual[j - 1]:
            ops.append(("match", expected[i - 1], actual[j - 1]))
            i, j = i - 1, j - 1
        elif i > 0 and j > 0 and dp[i][j] == dp[i - 1][j - 1] + 1:
            ops.append(("sub", expected[i - 1], actual[j - 1]))
            i, j = i - 1, j - 1
        elif i > 0 and dp[i][j] == dp[i - 1][j] + 1:
            ops.append(("del", expected[i - 1], None))
            i -= 1
        else:
            ops.append(("ins", None, actual[j - 1]))
            j -= 1

    ops.reverse()
    return ops


def describe_phoneme(ph: str) -> str:
    return PHONEME_DESCRIPTIONS.get(ph, f"the '{ph}' sound")


def analyze_pronunciation(target_word: str, transcribed_word: str) -> dict:
    """Main entry point: compare expected vs actual pronunciation."""
    expected_phonemes = get_phonemes(target_word)
    actual_phonemes = get_phonemes(transcribed_word)

    if expected_phonemes is None:
        return {
            "target_word": target_word,
            "transcribed_word": transcribed_word,
            "error": f"'{target_word}' not found in pronunciation dictionary",
            "errors": [],
            "correct": False,
            "feedback": "Couldn't find a reference pronunciation for that word.",
        }

    if actual_phonemes is None:
        return {
            "target_word": target_word,
            "transcribed_word": transcribed_word,
            "errors": [{"type": "unrecognized", "expected": p} for p in expected_phonemes],
            "correct": False,
            "feedback": f"We couldn't clearly make out '{target_word}' — try again a bit slower.",
        }

    ops = _align(expected_phonemes, actual_phonemes)
    errors = [
        {"type": op, "expected": exp, "actual": act}
        for op, exp, act in ops
        if op != "match"
    ]

    correct = len(errors) == 0

    if correct:
        feedback = f"Nice! '{target_word}' was pronounced correctly."
    else:
        sub_errors = [e for e in errors if e["type"] == "sub"]
        if sub_errors:
            e = sub_errors[0]
            feedback = (
                f"You said {describe_phoneme(e['actual'])} instead of "
                f"{describe_phoneme(e['expected'])} in '{target_word}'."
            )
        else:
            feedback = f"'{target_word}' wasn't quite right — some sounds were missing or extra."

    return {
        "target_word": target_word,
        "transcribed_word": transcribed_word,
        "expected_phonemes": expected_phonemes,
        "actual_phonemes": actual_phonemes,
        "errors": errors,
        "correct": correct,
        "feedback": feedback,
    }