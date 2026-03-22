"""
Tests du TransactionRepository — CRUD complet avec mock.
"""

import pytest
from datetime import date
from unittest.mock import MagicMock, patch

from domains.transactions.database.model import Transaction


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────


class MockCursor:
    def __init__(self, results=None, columns=None):
        # results doit être une liste de tuples/listes de valeurs
        self._results = results or []
        self._columns = columns or ["id", "type", "categorie", "montant", "date"]
        self._index = 0

    @property
    def description(self):
        return [(k, None) for k in self._columns]

    def fetchall(self):
        return self._results  # Retourne une liste de tuples

    def fetchone(self):
        if self._index < len(self._results):
            result = self._results[self._index]
            self._index += 1
            return result
        return None


class MockConnection:
    def __init__(self, results=None, insert_id=1):
        # results doit être une liste de tuples
        self._results = results or []
        self._commits = []
        self._insert_id = insert_id
        self._last_query = None

    async def execute(self, query, params=()):
        self._last_query = query
        columns = [
            "id",
            "type",
            "categorie",
            "sous_categorie",
            "description",
            "montant",
            "date",
            "source",
            "recurrence",
            "date_fin",
            "compte_id",
            "external_id",
        ]
        # Si c'est un INSERT, retourner un cursor factice
        if "INSERT" in query.upper():
            return MockCursor([(self._insert_id,)], columns=["id"])
        return MockCursor(self._results, columns=columns)

    async def fetch_one(self, query, params=()):
        self._last_query = query
        # Si on demande le last_insert_rowid
        if "last_insert_rowid" in query.lower():
            return {"id": self._insert_id}
        if self._results:
            # Retourner un dict pour fetch_one
            columns = [
                "id",
                "type",
                "categorie",
                "sous_categorie",
                "description",
                "montant",
                "date",
                "source",
                "recurrence",
                "date_fin",
                "compte_iban",
                "external_id",
            ]
            return dict(zip(columns, self._results[0]))
        return None

    async def fetch_all(self, query, params=()):
        self._last_query = query
        # Retourner une liste de dicts pour fetch_all
        columns = [
            "id",
            "type",
            "categorie",
            "sous_categorie",
            "description",
            "montant",
            "date",
            "source",
            "recurrence",
            "date_fin",
            "compte_id",
            "external_id",
        ]
        return [dict(zip(columns, row)) for row in self._results]

    def commit(self):
        self._commits.append("commit")

    def close(self):
        pass


# ─────────────────────────────────────────────────────────────────────────────
# Tests
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_add_retourne_un_id():
    """Ajouter une transaction valide doit retourner un ID."""
    mock_conn = MockConnection(results=[], insert_id=42)

    # Patch où c'est utilisé, pas où c'est défini
    with patch(
        "domains.transactions.database.repository.get_db_connection",
        return_value=mock_conn,
    ):
        with patch("domains.transactions.database.repository.close_connection"):
            from domains.transactions.database.repository import TransactionRepository

            repo = TransactionRepository()

            t = Transaction(
                type="Dépense",
                categorie="Alimentation",
                montant=42.50,
                date=date(2026, 1, 15),
                source="Manuel",
                sous_categorie="Supermarché",
                description="Courses",
                recurrence=None,
                date_fin=None,
                compte_id=None,
                external_id=None,
                id=None,
            )
            new_id = await repo.add(t)
            assert new_id == 42


@pytest.mark.asyncio
async def test_add_transaction_retrouvable():
    """La transaction ajoutée doit être retrouvable par son ID."""
    mock_conn = MockConnection(results=[], insert_id=1)

    with patch(
        "domains.transactions.database.repository.get_db_connection",
        return_value=mock_conn,
    ):
        with patch("domains.transactions.database.repository.close_connection"):
            from domains.transactions.database.repository import TransactionRepository

            repo = TransactionRepository()

            t = Transaction(
                type="Dépense",
                categorie="Alimentation",
                montant=42.50,
                date=date(2026, 1, 15),
                source="Manuel",
                sous_categorie="Supermarché",
                description="Courses",
                recurrence=None,
                date_fin=None,
                compte_id=None,
                external_id=None,
                id=None,
            )
            new_id = await repo.add(t)

            # Mock get_by_id result
            mock_conn._results = [
                {
                    "id": 1,
                    "type": "Dépense",
                    "categorie": "Alimentation",
                    "montant": 42.50,
                    "date": "2026-01-15",
                    "description": "Courses",
                    "source": "Manuel",
                    "sous_categorie": "Supermarché",
                    "recurrence": None,
                    "date_fin": None,
                    "compte_id": None,
                    "external_id": None,
                }
            ]

            row = await repo.get_by_id(new_id)
            assert row is not None


@pytest.mark.asyncio
async def test_add_doublon_external_id_ignore():
    """Deux transactions avec le même external_id : la 2e doit être ignorée."""
    mock_conn = MockConnection(results=[], insert_id=1)

    # Premier appel: pas de résultat (pas de doublon)
    # Deuxième appel: retourne un résultat (doublon détecté)
    check_doublon = [False, True]  # False = pas de doublon, True = doublon

    original_fetch_one = mock_conn.fetch_one

    def custom_fetch_one(query, params=()):
        if check_doublon and "external_id" in query:
            if check_doublon.pop(0):
                return {"id": 1}  # Doublon trouvé
        return original_fetch_one(query, params)

    mock_conn.fetch_one = custom_fetch_one

    with patch(
        "domains.transactions.database.repository.get_db_connection",
        return_value=mock_conn,
    ):
        with patch("domains.transactions.database.repository.close_connection"):
            from domains.transactions.database.repository import TransactionRepository

            repo = TransactionRepository()

            t = Transaction(
                type="Dépense",
                categorie="Transport",
                montant=10.0,
                date=date(2026, 1, 1),
                external_id="EXT-001",
                source="Manuel",
                sous_categorie=None,
                description=None,
                recurrence=None,
                date_fin=None,
                compte_iban=None,
                id=None,
            )
            id1 = await repo.add(t)
            id2 = await repo.add(t)  # doublon
            assert id1 is not None
            assert id2 is None  # ignoré


@pytest.mark.asyncio
async def test_update_modifie_le_montant():
    """Modifier le montant d'une transaction existante doit persister."""
    mock_conn = MockConnection(results=[], insert_id=1)

    with patch(
        "domains.transactions.database.repository.get_db_connection",
        return_value=mock_conn,
    ):
        with patch("domains.transactions.database.repository.close_connection"):
            from domains.transactions.database.repository import TransactionRepository

            repo = TransactionRepository()

            updated = {
                "id": 1,
                "type": "Dépense",
                "categorie": "Alimentation",
                "montant": 99.99,
                "date": date(2026, 1, 15),
                "source": "Manuel",
            }
            success = await repo.update(updated)
            assert success is True


@pytest.mark.asyncio
async def test_update_sans_id_retourne_false():
    """Un update sans ID doit retourner False sans exception."""
    mock_conn = MockConnection(results=[], insert_id=1)

    with patch(
        "domains.transactions.database.repository.get_db_connection",
        return_value=mock_conn,
    ):
        with patch("domains.transactions.database.repository.close_connection"):
            from domains.transactions.database.repository import TransactionRepository

            repo = TransactionRepository()

            result = await repo.update(
                {"type": "Dépense", "categorie": "Test", "montant": 1.0}
            )
            assert result is False


@pytest.mark.asyncio
async def test_delete_supprime_la_transaction():
    """Supprimer une transaction : elle ne doit plus être retrouvable."""
    mock_conn = MockConnection(results=[], insert_id=1)

    with patch(
        "domains.transactions.database.repository.get_db_connection",
        return_value=mock_conn,
    ):
        with patch("domains.transactions.database.repository.close_connection"):
            from domains.transactions.database.repository import TransactionRepository

            repo = TransactionRepository()

            t = Transaction(
                type="Dépense",
                categorie="Transport",
                montant=10.0,
                date=date(2026, 1, 1),
                source="Manuel",
                sous_categorie=None,
                description=None,
                recurrence=None,
                date_fin=None,
                compte_iban=None,
                id=None,
            )
            new_id = await repo.add(t)
            success = await repo.delete(new_id)
            assert success is True





@pytest.mark.asyncio
async def test_get_filtered_par_categorie():
    """Le filtre par catégorie doit n'exposer que les transactions correspondantes."""
    mock_conn = MockConnection(
        results=[
            (
                1,
                "Dépense",
                "Alimentation",
                None,
                None,
                42.50,
                "2026-01-15",
                "Manuel",
                None,
                None,
                None,
                None,
            )
        ]
    )

    with patch(
        "domains.transactions.database.repository.get_db_connection",
        return_value=mock_conn,
    ):
        with patch("domains.transactions.database.repository.close_connection"):
            from domains.transactions.database.repository import TransactionRepository

            repo = TransactionRepository()

            result = await repo.get_filtered(category="Alimentation")
            assert len(result) == 1
            assert result[0]["categorie"] == "Alimentation"


