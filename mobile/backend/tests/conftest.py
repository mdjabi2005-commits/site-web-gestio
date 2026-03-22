"""
conftest.py — Fixtures partagées pour tous les tests Gestio V4 Mobile.

Stratégie DB :
- Tests avec mock de la connexion Capacitor
- Pas de vrai SQLite en test (CapacitorConnection fonctionne uniquement dans le navigateur)
"""

import pytest
from datetime import date
from unittest.mock import MagicMock, patch

from domains.transactions.database.model import Transaction
from shared.database import set_test_mode


# Active le mode test pour CapacitorConnection
set_test_mode(True)


# ─────────────────────────────────────────────────────────────────────────────
# Mock CapacitorConnection pour les tests
# ─────────────────────────────────────────────────────────────────────────────


class MockCursor:
    def __init__(self, results=None):
        self._results = results or []
        self._index = 0

    @property
    def description(self):
        if self._results:
            return [(k, None) for k in self._results[0].keys()]
        return []

    def fetchall(self):
        return self._results

    def fetchone(self):
        if self._index < len(self._results):
            result = self._results[self._index]
            self._index += 1
            return result
        return None


class MockConnection:
    def __init__(self, results=None, insert_id=None):
        self._results = results or []
        self._commits = []
        self._insert_id = insert_id

    def execute(self, query, params=()):
        return MockCursor(self._results)

    def fetch_one(self, query, params=()):
        return self._results[0] if self._results else None

    def fetch_all(self, query, params=()):
        return self._results

    def commit(self):
        self._commits.append("commit")

    def close(self):
        pass


@pytest.fixture
def mock_connection():
    """Mock de CapacitorConnection."""
    return MockConnection(results=[], insert_id=1)


@pytest.fixture
def repo(mock_connection):
    """Repository avec mock de connexion."""
    with patch(
        "shared.database.database.get_db_connection", return_value=mock_connection
    ):
        from domains.transactions.database.repository import TransactionRepository

        r = TransactionRepository()
        yield r


# ─────────────────────────────────────────────────────────────────────────────
# Fixtures : données d'exemple
# ─────────────────────────────────────────────────────────────────────────────


@pytest.fixture
def transaction_depense() -> Transaction:
    """Transaction de dépense valide."""
    return Transaction(
        type="Dépense",
        categorie="Alimentation",
        sous_categorie="Supermarché",
        description="CoursesCarrefour",
        montant=42.50,
        date=date(2026, 1, 15),
        source="Manuel",
        recurrence=None,
        date_fin=None,
        compte_id=None,
        external_id=None,
        id=None,
    )


@pytest.fixture
def transaction_revenu() -> Transaction:
    """Transaction de revenu valide."""
    return Transaction(
        type="Revenu",
        categorie="Salaire",
        sous_categorie=None,
        description="Salaire janvier",
        montant=2500.00,
        date=date(2026, 1, 31),
        source="Manuel",
        recurrence=None,
        date_fin=None,
        compte_id=None,
        external_id=None,
        id=None,
    )


@pytest.fixture
def transactions_batch() -> list[Transaction]:
    """Lot de 5 transactions pour tester les opérations en masse."""
    return [
        Transaction(
            type="Dépense",
            categorie="Transport",
            montant=25.0,
            date=date(2026, 1, i + 1),
            source="Manuel",
            sous_categorie=None,
            description=f"Ticket métro {i + 1}",
            recurrence=None,
            date_fin=None,
            compte_id=None,
            external_id=None,
            id=None,
        )
        for i in range(5)
    ]
