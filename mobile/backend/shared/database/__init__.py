# Database Connection pour PWA (sql.js - géré côté JS)
# Toutes les données sont dans IndexedDB via sql.js côté JavaScript.
# Python ne fait que de l'OCR via Pyodide.

import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)


class Error(Exception):
    pass


class OperationalError(Error):
    pass


class IntegrityError(Error):
    pass


class NoOpConnection:
    """
    Connexion no-op pour PWA.
    Toutes les données sont gérées côté JavaScript via sql.js.
    Les appels Python au "database" sont des no-ops.
    """

    def __init__(self):
        pass

    def cursor(self):
        return self

    async def execute(self, query: str, params: tuple = ()) -> Any:
        logger.debug(f"[NoOp DB] Ignoring execute: {query[:50]}")
        return NoOpCursor([])

    async def _execute_async(self, query: str, params: tuple = ()) -> list:
        return []

    def commit(self) -> None:
        pass

    def rollback(self) -> None:
        pass

    def close(self) -> None:
        pass

    async def fetch_all(self, query: str, params: tuple = ()) -> list:
        return []

    async def fetch_one(self, query: str, params: tuple = ()) -> Optional[dict]:
        return None


class NoOpCursor:
    def __init__(self, results: list):
        self.results = results

    @property
    def description(self):
        return []

    def fetchall(self) -> list:
        return self.results

    def fetchone(self) -> Optional[Any]:
        return None

    def __iter__(self):
        return iter(self.results)


def get_connection() -> NoOpConnection:
    return NoOpConnection()


get_db_connection = get_connection
close_connection = lambda conn: None if conn else None


__all__ = [
    "Error",
    "OperationalError",
    "IntegrityError",
    "NoOpConnection",
    "get_connection",
    "get_db_connection",
    "close_connection",
]
