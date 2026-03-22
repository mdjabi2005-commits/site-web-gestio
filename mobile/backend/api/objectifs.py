"""
API Objectifs — Point d'entrée Pyodide
"""

import json
import logging
from datetime import date

from config.logging_config import get_logger
from domains.objectifs.repository_objectif import objectif_repository
from domains.objectifs.objectifs_service import (
    refresh_objectifs as refresh_objectifs_service,
    get_objectif_progress,
)

logger = get_logger(__name__)


async def get_objectifs() -> str:
    """Récupère tous les objectifs."""
    try:
        objectifs = await objectif_repository.get_all()
        return json.dumps(objectifs, ensure_ascii=False)
    except Exception as e:
        err_msg = str(e).lower()
        # Si colonnes manquantes, retourner liste vide (migrations en cours)
        if "no such column" in err_msg:
            logger.warning(f"⚠️ get_objectifs: colonnes manquantes (migration en cours?): {e}")
            return json.dumps([], ensure_ascii=False)
        logger.error(f"Erreur get_objectifs: {e}")
        return json.dumps({"error": str(e)})


async def add_objectif(data: dict) -> str:
    """Ajoute un nouvel objectif."""
    try:
        today = date.today().isoformat()
        data["derniere_modification"] = today
        new_id = await objectif_repository.add(data)
        if new_id:
            return json.dumps({"id": new_id})
        return json.dumps({"error": "Ajout échoué"})
    except Exception as e:
        logger.error(f"Erreur add_objectif: {e}")
        return json.dumps({"error": str(e)})


async def update_objectif(id: int, data: dict) -> str:
    """Met à jour un objectif existant."""
    try:
        today = date.today().isoformat()
        data["id"] = id
        data["derniere_modification"] = today
        success = await objectif_repository.update(data)
        return json.dumps({"success": success})
    except Exception as e:
        logger.error(f"Erreur update_objectif: {e}")
        return json.dumps({"success": False, "error": str(e)})


async def delete_objectif(id: int) -> str:
    """Supprime un objectif."""
    try:
        success = await objectif_repository.delete(id)
        return json.dumps({"success": success})
    except Exception as e:
        logger.error(f"Erreur delete_objectif: {e}")
        return json.dumps({"success": False, "error": str(e)})


async def refresh_objectifs() -> str:
    """Recalcule la progression depuis les transactions. Appelé au démarrage."""
    try:
        result = await refresh_objectifs_service()
        return json.dumps(result, ensure_ascii=False)
    except Exception as e:
        err_msg = str(e).lower()
        # Détecter les erreurs de colonnes manquantes
        if "no such column" in err_msg:
            logger.warning(f"⚠️ refresh_objectifs: colonne manquante ({e})")
            return json.dumps({"updated": 0, "reached": 0, "abandoned": 0, "error": "Schema migration pending"})
        logger.error(f"Erreur refresh_objectifs: {e}")
        return json.dumps({"error": str(e)})
