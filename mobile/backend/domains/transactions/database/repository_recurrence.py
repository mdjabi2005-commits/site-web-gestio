"""
Repository pour les Récurrences
Gère l'accès aux données de la table 'recurrences' jointe à 'transactions'
"""

import logging
from typing import List

from shared.database import get_db_connection, close_connection
from .model_recurrence import Recurrence

logger = logging.getLogger(__name__)


class RecurrenceRepository:
    def __init__(self):
        pass

    async def get_all_recurrences(self) -> List[Recurrence]:
        """Récupère toutes les récurrences (jointure avec transactions)."""
        conn = None
        recurrences = []
        try:
            conn = get_db_connection()
            rows = await conn.fetch_all("""
                SELECT 
                    r.id, 
                    t.type, 
                    t.categorie, 
                    t.sous_categorie, 
                    t.montant, 
                    r.frequence, 
                    t.date as date_debut, 
                    t.date_fin, 
                    t.description, 
                    CASE WHEN r.actif = 1 THEN 'Actif' ELSE 'Inactif' END as statut
                FROM recurrences r
                JOIN transactions t ON r.transaction_id = t.id
                ORDER BY t.montant DESC
            """)

            for row in rows:
                recurrences.append(Recurrence(**row))

            logger.info(f"Récupération de {len(recurrences)} récurrences réussie")
            return recurrences
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des récurrences: {e}")
            return []
        finally:
            close_connection(conn)

    async def add_recurrence(self, recurrence: Recurrence) -> bool:
        """Ajoute une nouvelle récurrence (crée d'abord une transaction template)."""
        conn = None
        try:
            logger.info(f"Ajout d'une récurrence : {recurrence.description} ({recurrence.montant}€)")
            conn = get_db_connection()

            # 1. Insertion dans transactions (template)
            await conn.execute("""
                INSERT INTO transactions 
                    (type, categorie, sous_categorie, description, montant, date, source, recurrence, date_fin)
                VALUES (?, ?, ?, ?, ?, ?, 'template_recurrence', ?, ?)
            """, (
                recurrence.type,
                recurrence.categorie,
                recurrence.sous_categorie,
                recurrence.description,
                recurrence.montant,
                recurrence.date_debut.isoformat() if recurrence.date_debut else None,
                recurrence.frequence,
                recurrence.date_fin.isoformat() if recurrence.date_fin else None
            ))

            res = await conn.fetch_one("SELECT last_insert_rowid() as id")
            tx_id = res["id"]

            # 2. Insertion dans recurrences
            actif = 1 if (recurrence.statut and recurrence.statut.lower() in ('actif', 'active')) else 0
            
            await conn.execute("""
                INSERT INTO recurrences (transaction_id, frequence, intervalle, prochaine_occurrence, actif)
                VALUES (?, ?, 1, ?, ?)
            """, (
                tx_id,
                recurrence.frequence,
                recurrence.date_debut.isoformat() if recurrence.date_debut else None,
                actif
            ))

            conn.commit()
            logger.info(f"✅ Récurrence ajoutée avec succès (Tx ID: {tx_id})")
            return True
        except Exception as e:
            from config.logging_config import log_error
            log_error(e, "Erreur lors de l'ajout de la récurrence")
            return False
        finally:
            close_connection(conn)

    async def update_recurrence(self, recurrence: Recurrence) -> bool:
        """Met à jour une récurrence existante et sa transaction liée."""
        if not recurrence.id:
            logger.warning("Tentative de mise à jour sans ID")
            return False

        conn = None
        try:
            logger.info(f"Mise à jour de la récurrence ID {recurrence.id}")
            conn = get_db_connection()

            res = await conn.fetch_one("SELECT transaction_id FROM recurrences WHERE id = ?", (recurrence.id,))
            if not res:
                return False
            tx_id = res["transaction_id"]

            await conn.execute("""
                UPDATE transactions
                SET type = ?,
                    categorie = ?,
                    sous_categorie = ?,
                    description = ?,
                    montant = ?,
                    date = ?,
                    recurrence = ?,
                    date_fin = ?
                WHERE id = ?
            """, (
                recurrence.type,
                recurrence.categorie,
                recurrence.sous_categorie,
                recurrence.description,
                recurrence.montant,
                recurrence.date_debut.isoformat() if recurrence.date_debut else None,
                recurrence.frequence,
                recurrence.date_fin.isoformat() if recurrence.date_fin else None,
                tx_id
            ))

            actif = 1 if (recurrence.statut and recurrence.statut.lower() in ('actif', 'active')) else 0
            await conn.execute("""
                UPDATE recurrences
                SET frequence = ?,
                    prochaine_occurrence = ?,
                    actif = ?
                WHERE id = ?
            """, (
                recurrence.frequence,
                recurrence.date_debut.isoformat() if recurrence.date_debut else None,
                actif,
                recurrence.id
            ))

            conn.commit()
            logger.info(f"✅ Récurrence ID {recurrence.id} mise à jour avec succès")
            return True
        except Exception as e:
            from config.logging_config import log_error
            log_error(e, f"Erreur lors de la mise à jour de la récurrence (ID: {recurrence.id})")
            return False
        finally:
            close_connection(conn)

    async def delete_recurrence(self, recurrence_id: int) -> bool:
        """Supprime une récurrence en supprimant la transaction liée (CASCADE)."""
        conn = None
        try:
            logger.info(f"Suppression de la récurrence ID {recurrence_id}")
            conn = get_db_connection()

            res = await conn.fetch_one("SELECT transaction_id FROM recurrences WHERE id = ?", (recurrence_id,))
            if res:
                await conn.execute("DELETE FROM transactions WHERE id = ?", (res["transaction_id"],))
            else:
                await conn.execute("DELETE FROM recurrences WHERE id = ?", (recurrence_id,))

            conn.commit()
            logger.info(f"✅ Récurrence ID {recurrence_id} supprimée avec succès")
            return True
        except Exception as e:
            from config.logging_config import log_error
            log_error(e, f"Erreur lors de la suppression de la récurrence (ID: {recurrence_id})")
            return False
        finally:
            close_connection(conn)

    async def migrate_from_echeances(self) -> dict:
        """Conservé pour conformité. Ne rien faire si echeances n'existe plus."""
        return {"migrated": 0, "errors": 0, "skipped": 0}

recurrence_repository = RecurrenceRepository()
