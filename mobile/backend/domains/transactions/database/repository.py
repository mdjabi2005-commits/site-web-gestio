"""
Transaction Repository
Gestion des données pour le domaine Transactions.
Compatible avec CapacitorConnection (Pyodide + mobile).
"""

import logging
from datetime import date
from typing import List, Optional, Dict

from shared.database import get_db_connection, close_connection
from .model import Transaction

logger = logging.getLogger(__name__)


class TransactionRepository:


    @staticmethod
    def _to_validated_db_dict(transaction) -> dict:
        """
        Valide, normalise et prépare les données pour la DB en une seule étape.
        """
        from pydantic import ValidationError

        if isinstance(transaction, Transaction):
            validated = transaction
        else:
            try:
                validated = Transaction.parse_obj(transaction)
            except ValidationError as exc:
                errors = "; ".join(e["msg"] for e in exc.errors())
                raise ValueError(f"Validation échouée: {errors}") from exc

        return validated.to_db_dict()

    async def add(self, transaction) -> Optional[int]:
        """
        Ajoute une transaction.
        Accepte un objet Transaction (Pydantic) ou un dict avec clés FR.
        """
        conn = None
        try:
            data = self._to_validated_db_dict(transaction)

            # Doublon par external_id
            if data.get("external_id"):
                conn = get_db_connection()
                result = await conn.fetch_one(
                    "SELECT id FROM transactions WHERE external_id = ?",
                    (data["external_id"],),
                )
                if result:
                    logger.info(f"Doublon ignoré: {data['external_id']}")
                    return None

            # Insertion
            if conn is None:
                conn = get_db_connection()

            await conn.execute(
                """
                INSERT INTO transactions
                    (type, categorie, sous_categorie, description, montant, date,
                     source, recurrence, date_fin, compte_id, external_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    data["type"],
                    data["categorie"],
                    data["sous_categorie"],
                    data["description"],
                    data["montant"],
                    data["date"],
                    data["source"],
                    data["recurrence"],
                    data["date_fin"],
                    data["compte_id"],
                    data["external_id"],
                ),
            )
            conn.commit()

            # Récupérer le dernier ID inserté (Sur sqlite natif via plugin JS il se peut qu'il faille checker resultats de js plugin, on check la compat plugin si possible)
            # Sinon on peut contourner via rowid max
            result = await conn.fetch_one("SELECT last_insert_rowid() as id")
            new_id = result["id"] if result else None

            logger.info(f"Transaction ajoutée: ID {new_id}")
            return new_id

        except ValueError as e:
            logger.error(f"Validation échouée: {e}")
            return None
        except Exception as e:
            logger.error(f"Erreur SQL add: {e}")
            return None
        finally:
            close_connection(conn)

    async def update(self, transaction: Dict) -> bool:
        """
        Met à jour une transaction existante.
        """
        tx_id = transaction.get("id")
        if not tx_id:
            logger.error("ID manquant pour update")
            return False

        conn = None
        try:
            data = self._to_validated_db_dict(transaction)

            conn = get_db_connection()
            await conn.execute(
                """
                UPDATE transactions
                SET type           = ?,
                    categorie      = ?,
                    sous_categorie = ?,
                    description    = ?,
                    montant        = ?,
                    date           = ?,
                    source         = ?,
                    recurrence     = ?,
                    date_fin       = ?,
                    compte_id      = ?,
                    external_id    = ?
                WHERE id = ?
            """,
                (
                    data["type"],
                    data["categorie"],
                    data["sous_categorie"],
                    data["description"],
                    data["montant"],
                    data["date"],
                    data["source"],
                    data["recurrence"],
                    data["date_fin"],
                    data["compte_id"],
                    data["external_id"],
                    tx_id,
                ),
            )
            conn.commit()
            return True

        except ValueError as e:
            logger.error(f"Validation échouée update: {e}")
            return False
        except Exception as e:
            logger.error(f"Erreur SQL update: {e}")
            return False
        finally:
            close_connection(conn)

    async def get_by_id(self, tx_id: int) -> Optional[dict]:
        """Récupère une transaction par son ID."""
        conn = None
        try:
            conn = get_db_connection()
            result = await conn.fetch_one("SELECT * FROM transactions WHERE id = ?", (tx_id,))
            return result
        except Exception as e:
            logger.error(f"Erreur get_by_id: {e}")
            return None
        finally:
            close_connection(conn)

    async def get_filtered(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        category: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> List[dict]:
        """Récupère les transactions filtrées."""
        logger.info(f"Repository: get_filtered(start={start_date}, end={end_date}, cat={category}, limit={limit})")
        query = "SELECT * FROM transactions WHERE source != 'template_recurrence'"
        params = []

        if start_date:
            query += " AND date >= ?"
            params.append(start_date.isoformat())

        if end_date:
            query += " AND date <= ?"
            params.append(end_date.isoformat())

        if category:
            query += " AND categorie = ?"
            params.append(category)

        query += " ORDER BY date DESC"
        
        if limit:
            query += " LIMIT ?"
            params.append(limit)

        results = await self._fetch_all(query, tuple(params))
        logger.info(f"Repository: Found {len(results)} transactions")
        return results

    async def delete(self, transaction_id: int | List[int]) -> bool:
        """
        Supprime une ou plusieurs transactions.
        """
        conn = None
        try:
            # Normaliser en liste
            if isinstance(transaction_id, int):
                ids = [transaction_id]
            else:
                ids = transaction_id

            if not ids:
                return True

            conn = get_db_connection()

            # Utiliser IN clause
            placeholders = ",".join("?" * len(ids))
            query = f"DELETE FROM transactions WHERE id IN ({placeholders})"
            await conn.execute(query, tuple(ids))
            conn.commit()

            logger.info(f"{len(ids)} transaction(s) supprimée(s)")
            return True

        except Exception as e:
            logger.error(f"Erreur delete: {e}")
            return False
        finally:
            close_connection(conn)


# Instance unique
transaction_repository = TransactionRepository()
