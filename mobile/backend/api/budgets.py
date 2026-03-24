"""
API Budgets — Point d'entrée Pyodide
"""

import json
import logging
from typing import Optional

from config.logging_config import get_logger
from domains.budgets.repository_budget import budget_repository
from domains.budgets.budget_service import get_budgets_status, get_budgets_summary

logger = get_logger(__name__)


async def get_budgets() -> str:
    """Récupère tous les budgets."""
    try:
        budgets = await budget_repository.get_all(actifs_seulement=False)
        return json.dumps(budgets, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Erreur get_budgets: {e}")
        return json.dumps({"error": str(e)})


async def get_budget(id: int) -> str:
    """Récupère un budget par ID."""
    try:
        budget = await budget_repository.get_by_id(id)
        if budget:
            return json.dumps(budget, ensure_ascii=False)
        return json.dumps({"error": "Budget non trouvé"})
    except Exception as e:
        logger.error(f"Erreur get_budget: {e}")
        return json.dumps({"error": str(e)})


async def add_budget(data: dict) -> str:
    """Ajoute un nouveau budget."""
    try:
        new_id = await budget_repository.add(data)
        if new_id:
            return json.dumps({"id": new_id})
        return json.dumps({"error": "Ajout échoué"})
    except Exception as e:
        logger.error(f"Erreur add_budget: {e}")
        return json.dumps({"error": str(e)})


async def update_budget(id: int, data: dict) -> str:
    """Met à jour un budget existant."""
    try:
        data["id"] = id
        success = await budget_repository.update(data)
        return json.dumps({"success": success})
    except Exception as e:
        logger.error(f"Erreur update_budget: {e}")
        return json.dumps({"success": False, "error": str(e)})


async def delete_budget(id: int) -> str:
    """Supprime un budget."""
    try:
        success = await budget_repository.delete(id)
        return json.dumps({"success": success})
    except Exception as e:
        logger.error(f"Erreur delete_budget: {e}")
        return json.dumps({"success": False, "error": str(e)})


async def get_budgets_status_api(annee: int, mois: int) -> str:
    """Statut des budgets pour un mois (croisé avec transactions)."""
    try:
        result = await get_budgets_status(annee, mois)
        return json.dumps(result, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Erreur get_budgets_status_api: {e}")
        return json.dumps({"error": str(e)})


async def get_budgets_summary_api(annee: int, mois: int) -> str:
    """Résumé global des budgets pour un mois."""
    try:
        result = await get_budgets_summary(annee, mois)
        return json.dumps(result, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Erreur get_budgets_summary_api: {e}")
        return json.dumps({"error": str(e)})
