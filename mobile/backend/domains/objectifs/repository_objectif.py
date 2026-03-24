"""
Objectif Repository
CRUD sur la table objectifs via CapacitorConnection.
"""

import logging
from typing import List, Optional, Dict

from shared.database import get_db_connection, close_connection
from .model_objectif import Objectif

logger = logging.getLogger(__name__)


class ObjectifRepository:
    def _validate(self, data: dict) -> Objectif:
        from pydantic import ValidationError

        try:
            return Objectif.parse_obj(data)
        except ValidationError as exc:
            errors = "; ".join(e["msg"] for e in exc.errors())
            raise ValueError(f"Validation échouée: {errors}")

    async def add(self, data: dict) -> Optional[int]:
        conn = None
        try:
            objectif = self._validate(data)
            db_data = objectif.to_db_dict()

            conn = get_db_connection()
            from datetime import date

            today = date.today().isoformat()
            db_data["created_at"] = db_data.get("created_at") or today
            await conn.execute(
                """
                INSERT INTO objectifs
                    (nom, montant_cible, icone, couleur, date_limite,
                     progression_actuelle, statut, created_at, derniere_modification)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    db_data["nom"],
                    db_data["montant_cible"],
                    db_data["icone"],
                    db_data["couleur"],
                    db_data["date_limite"],
                    db_data["progression_actuelle"],
                    db_data["statut"],
                    db_data["created_at"],
                    db_data["derniere_modification"],
                ),
            )
            conn.commit()

            result = await conn.fetch_one("SELECT last_insert_rowid() as id")
            new_id = result["id"] if result else None
            logger.info(f"Objectif ajouté: ID {new_id}")
            return new_id

        except ValueError as e:
            logger.error(f"Validation échouée: {e}")
            return None
        except Exception as e:
            logger.error(f"Erreur SQL add objectif: {e}")
            return None
        finally:
            close_connection(conn)

    async def update(self, data: Dict) -> bool:
        obj_id = data.get("id")
        if not obj_id:
            logger.error("ID manquant pour update objectif")
            return False

        conn = None
        try:
            objectif = self._validate(data)
            db_data = objectif.to_db_dict()

            conn = get_db_connection()
            await conn.execute(
                """
                UPDATE objectifs
                SET nom = ?, montant_cible = ?, icone = ?, couleur = ?,
                    date_limite = ?, progression_actuelle = ?, statut = ?,
                    derniere_modification = ?
                WHERE id = ?
            """,
                (
                    db_data["nom"],
                    db_data["montant_cible"],
                    db_data["icone"],
                    db_data["couleur"],
                    db_data["date_limite"],
                    db_data["progression_actuelle"],
                    db_data["statut"],
                    db_data["derniere_modification"],
                    obj_id,
                ),
            )
            conn.commit()
            return True

        except ValueError as e:
            logger.error(f"Validation échouée update: {e}")
            return False
        except Exception as e:
            logger.error(f"Erreur SQL update objectif: {e}")
            return False
        finally:
            close_connection(conn)

    async def delete(self, objectif_id: int) -> bool:
        conn = None
        try:
            conn = get_db_connection()
            await conn.execute("DELETE FROM objectifs WHERE id = ?", (objectif_id,))
            conn.commit()
            logger.info(f"Objectif {objectif_id} supprimé")
            return True
        except Exception as e:
            logger.error(f"Erreur delete objectif: {e}")
            return False
        finally:
            close_connection(conn)

    async def get_by_id(self, objectif_id: int) -> Optional[dict]:
        conn = None
        try:
            conn = get_db_connection()
            result = await conn.fetch_one(
                "SELECT * FROM objectifs WHERE id = ?", (objectif_id,)
            )
            return result
        except Exception as e:
            logger.error(f"Erreur get_by_id objectif: {e}")
            return None
        finally:
            close_connection(conn)

    async def get_all(self) -> List[dict]:
        conn = None
        try:
            conn = get_db_connection()
            try:
                cols = await conn.fetch_all("PRAGMA table_info(objectifs)")
                col_names = [r["name"] for r in cols]
            except Exception:
                col_names = []

            if "created_at" in col_names:
                return await conn.fetch_all(
                    "SELECT * FROM objectifs ORDER BY created_at DESC"
                )
            return await conn.fetch_all("SELECT * FROM objectifs")
        except Exception as e:
            logger.error(f"Erreur get_all objectifs: {e}")
            return []
        finally:
            close_connection(conn)


objectif_repository = ObjectifRepository()
