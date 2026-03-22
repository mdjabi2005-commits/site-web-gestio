# Backend API - Recurrences
# Point d'entrée pour les récurrences via Pyodide

import json
import logging
from datetime import date

from config.logging_config import get_logger

logger = get_logger(__name__)




async def add_recurrence(data: dict) -> str:
    """Ajoute une nouvelle récurrence."""
    try:
        from domains.transactions.database.repository_recurrence import RecurrenceRepository
        from domains.transactions.database.model_recurrence import Recurrence
        repo = RecurrenceRepository()
        recurrence = Recurrence(**data)
        new_id = await repo.add_recurrence(recurrence)
        if new_id:
            return json.dumps({"id": new_id})
        return json.dumps({"error": "Ajout échoué"})

    except Exception as e:
        logger.error(f"Erreur add_recurrence: {e}")
        return json.dumps({"error": str(e)})


async def update_recurrence(rec_id: int, data: dict) -> str:
    """Met à jour une récurrence."""
    try:
        from domains.transactions.database.repository_recurrence import RecurrenceRepository
        from domains.transactions.database.model_recurrence import Recurrence
        repo = RecurrenceRepository()
        data["id"] = rec_id
        recurrence = Recurrence(**data)
        success = await repo.update_recurrence(recurrence)
        return json.dumps({"success": success})

    except Exception as e:
        logger.error(f"Erreur update_recurrence: {e}")
        return json.dumps({"success": False, "error": str(e)})


async def delete_recurrence(rec_id: int) -> str:
    """Supprime une récurrence."""
    try:
        from domains.transactions.database.repository_recurrence import RecurrenceRepository
        repo = RecurrenceRepository()
        success = await repo.delete_recurrence(rec_id)
        return json.dumps({"success": success})

    except Exception as e:
        logger.error(f"Erreur delete_recurrence: {e}")
        return json.dumps({"success": False, "error": str(e)})


async def backfill_recurrences() -> str:
    """Génère les transactions récurrentes manquantes jusqu'à aujourd'hui."""
    try:
        from domains.transactions.recurrence.recurrence_service import backfill_all_recurrences
        count = await backfill_all_recurrences()
        return json.dumps({"count": count})

    except Exception as e:
        logger.error(f"Erreur backfill_recurrences: {e}")
        return json.dumps({"count": 0, "error": str(e)})


async def refresh_echeances() -> str:
    """Rafraîchit les échéances."""
    try:
        from domains.transactions.recurrence.recurrence_service import refresh_echeances as refresh_echeances_service
        await refresh_echeances_service()
        return json.dumps({"success": True})

    except Exception as e:
        logger.error(f"Erreur refresh_echeances: {e}")
        return json.dumps({"success": False, "error": str(e)})
