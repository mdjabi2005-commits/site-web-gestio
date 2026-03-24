"""
Settings Repository - PWA Version
Les paramètres sont stockés côté JavaScript (sql.js / IndexedDB).
Python charge la config depuis un fichier JSON embarqué.
"""

import json
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

_SETTINGS_FILE = "/backend/settings.json"
_settings_cache: dict = {}


def _load_settings() -> dict:
    global _settings_cache
    if _settings_cache:
        return _settings_cache
    try:
        with open(_SETTINGS_FILE, "r", encoding="utf-8") as f:
            _settings_cache = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        _settings_cache = {}
    return _settings_cache


async def get_setting(key: str, default: Optional[str] = None) -> Optional[str]:
    settings = _load_settings()
    value = settings.get(key, default)
    if value is None:
        env_value = os.environ.get(key.upper())
        if env_value:
            return env_value
    return value


async def set_setting(key: str, value: str) -> bool:
    settings = _load_settings()
    settings[key] = value
    _settings_cache[key] = value
    return True
