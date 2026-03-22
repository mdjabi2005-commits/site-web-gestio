"""
Budget Repository
CRUD sur la table budgets via CapacitorConnection.
"""

import logging
from typing import List, Optional, Dict

from shared.database import get_db_connection, close_connection
from .model_budget import Budget

logger = logging.getLogger(__name__)


class BudgetRepository:
    def _validate(self, data: dict) -> Budget:
        from pydantic import ValidationError

        try:
            return Budget.parse_obj(data)
        except ValidationError as exc:
            errors = "; ".join(e["msg"] for e in exc.errors())
            raise ValueError(f"Validation échouée: {errors}")

    async def add(self, data: dict) -> Optional[int]:
        conn = None
        try:
            budget = self._validate(data)
            db_data = budget.to_db_dict()

            conn = get_db_connection()
            await conn.execute(
                """
                INSERT INTO budgets
                    (categorie, montant_limite, periode, date_debut, date_fin, alert_seuil, actif)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    db_data["categorie"],
                    db_data["montant_limite"],
                    db_data["periode"],
                    db_data["date_debut"],
                    db_data["date_fin"],
                    db_data["alert_seuil"],
                    db_data["actif"],
                ),
            )
            conn.commit()

            result = await conn.fetch_one("SELECT last_insert_rowid() as id")
            new_id = result["id"] if result else None
            logger.info(f"Budget ajouté: ID {new_id}")
            return new_id

        except ValueError as e:
            logger.error(f"Validation échouée: {e}")
            return None
        except Exception as e:
            logger.error(f"Erreur SQL add budget: {e}")
            return None
        finally:
            close_connection(conn)

    async def update(self, budget_data: Dict) -> bool:
        budget_id = budget_data.get("id")
        if not budget_id:
            logger.error("ID manquant pour update budget")
            return False

        conn = None
        try:
            budget = self._validate(budget_data)
            db_data = budget.to_db_dict()

            conn = get_db_connection()
            await conn.execute(
                """
                UPDATE budgets
                SET categorie = ?, montant_limite = ?, periode = ?,
                    date_debut = ?, date_fin = ?, alert_seuil = ?, actif = ?
                WHERE id = ?
            """,
                (
                    db_data["categorie"],
                    db_data["montant_limite"],
                    db_data["periode"],
                    db_data["date_debut"],
                    db_data["date_fin"],
                    db_data["alert_seuil"],
                    db_data["actif"],
                    budget_id,
                ),
            )
            conn.commit()
            return True

        except ValueError as e:
            logger.error(f"Validation échouée update: {e}")
            return False
        except Exception as e:
            logger.error(f"Erreur SQL update budget: {e}")
            return False
        finally:
            close_connection(conn)

    async def delete(self, budget_id: int) -> bool:
        conn = None
        try:
            conn = get_db_connection()
            await conn.execute("DELETE FROM budgets WHERE id = ?", (budget_id,))
            conn.commit()
            logger.info(f"Budget {budget_id} supprimé")
            return True
        except Exception as e:
            logger.error(f"Erreur delete budget: {e}")
            return False
        finally:
            close_connection(conn)

    async def get_by_id(self, budget_id: int) -> Optional[dict]:
        conn = None
        try:
            conn = get_db_connection()
            return await conn.fetch_one(
                "SELECT * FROM budgets WHERE id = ?", (budget_id,)
            )
        except Exception as e:
            logger.error(f"Erreur get_by_id budget: {e}")
            return None
        finally:
            close_connection(conn)

    async def get_all(self, actifs_seulement: bool = True) -> List[dict]:
        conn = None
        try:
            conn = get_db_connection()
            query = "SELECT * FROM budgets"
            if actifs_seulement:
                query += " WHERE actif = 1"
            query += " ORDER BY created_at DESC"
            return await conn.fetch_all(query)
        except Exception as e:
            logger.error(f"Erreur get_all budgets: {e}")
            return []
        finally:
            close_connection(conn)

    async def get_by_categorie(self, categorie: str) -> Optional[dict]:
        conn = None
        try:
            conn = get_db_connection()
            return await conn.fetch_one(
                "SELECT * FROM budgets WHERE categorie = ? AND actif = 1",
                (categorie,),
            )
        except Exception as e:
            logger.error(f"Erreur get_by_categorie: {e}")
            return None
        finally:
            close_connection(conn)


budget_repository = BudgetRepository()
