"""
Vendor Cache Service - PWA Version
Le cache des marchands est stocké dans IndexedDB via sql.js (côté JS).
Pour Pyodide, on utilise un simple fichier JSON embarqué.
"""

import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)

_CACHE_FILE = "/backend/vendor_cache.json"
_cache: dict = {}


def _load_cache() -> dict:
    global _cache
    if _cache:
        return _cache
    try:
        with open(_CACHE_FILE, "r", encoding="utf-8") as f:
            _cache = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        _cache = {}
    return _cache


def _save_cache() -> None:
    global _cache
    try:
        with open(_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(_cache, f, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Error saving vendor cache: {e}")


async def get_category(merchant_name: str) -> Optional[dict]:
    if not merchant_name:
        return None
    cache = _load_cache()
    normalized = merchant_name.strip().lower()
    entry = cache.get(normalized)
    if entry:
        logger.info(f"Cache hit for vendor: {merchant_name}")
    return entry


async def set_category(
    merchant_name: str, categorie: str, sous_categorie: Optional[str] = None
) -> bool:
    if not merchant_name or not categorie:
        return False
    cache = _load_cache()
    cache[merchant_name.strip().lower()] = {
        "categorie": categorie,
        "sous_categorie": sous_categorie,
    }
    _save_cache()
    logger.info(f"Cached vendor: {merchant_name} -> {categorie}/{sous_categorie}")
    return True
