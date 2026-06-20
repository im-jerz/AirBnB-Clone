import json
import os
import secrets
import time

_SESSION_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    ".sessions.json",
)
_MAX_AGE = 86400


def generate_token() -> str:
    return secrets.token_urlsafe(32)


def save_session(token: str, admin_id: str) -> None:
    sessions = _load()
    sessions[token] = {
        "admin_id": admin_id,
        "created_at": time.time(),
    }
    _save(sessions)


def load_session(token: str) -> dict | None:
    sessions = _load()
    data = sessions.get(token)
    if data is None:
        return None
    age = time.time() - data["created_at"]
    if age > _MAX_AGE:
        del sessions[token]
        _save(sessions)
        return None
    return data


def _load() -> dict:
    if not os.path.exists(_SESSION_FILE):
        return {}
    try:
        with open(_SESSION_FILE) as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return {}


def _save(sessions: dict) -> None:
    try:
        with open(_SESSION_FILE, "w") as f:
            json.dump(sessions, f)
    except OSError:
        pass
