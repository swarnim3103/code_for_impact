"""
auth.py

Handles user signup, login, and JWT verification.
"""

import bcrypt
import jwt
import os
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify
import sqlite3
from contextlib import contextmanager

DB_PATH = "speechease.db"
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-this-in-production")
JWT_ALGO = "HS256"
JWT_EXPIRY_HOURS = 24 * 7  # 7 days


@contextmanager
def _connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_auth_db():
    with _connect() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _check_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def _make_token(user_id: int, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def signup(email: str, password: str):
    email = email.strip().lower()
    if not email or "@" not in email:
        return {"error": "Valid email is required"}, 400
    if len(password) < 8:
        return {"error": "Password must be at least 8 characters"}, 400

    with _connect() as conn:
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if existing:
            return {"error": "An account with this email already exists"}, 409

        password_hash = _hash_password(password)
        cur = conn.execute(
            "INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)",
            (email, password_hash, datetime.now(timezone.utc).isoformat()),
        )
        user_id = cur.lastrowid

    token = _make_token(user_id, email)
    return {"token": token, "user": {"id": user_id, "email": email}}, 201


def login(email: str, password: str):
    email = email.strip().lower()
    with _connect() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

    if not row or not _check_password(password, row["password_hash"]):
        return {"error": "Invalid email or password"}, 401

    token = _make_token(row["id"], row["email"])
    return {"token": token, "user": {"id": row["id"], "email": row["email"]}}, 200


def decode_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def require_auth(f):
    """Rejects with 401 if no valid Bearer token. Use for save/write routes."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authentication required"}), 401

        token = auth_header.split(" ", 1)[1]
        payload = decode_token(token)
        if payload is None:
            return jsonify({"error": "Invalid or expired token"}), 401

        request.user_id = payload["user_id"]
        request.user_email = payload["email"]
        return f(*args, **kwargs)
    return wrapper


def optional_auth(f):
    """Attaches user info if a valid token is present, else request.user_id = None.
    Never rejects — use for routes guests can browse."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        request.user_id = None
        request.user_email = None
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
            payload = decode_token(token)
            if payload:
                request.user_id = payload["user_id"]
                request.user_email = payload["email"]
        return f(*args, **kwargs)
    return wrapper