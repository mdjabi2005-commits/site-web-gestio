# Backend API - Transactions
# Point d'entrée pour les transactions via Pyodide

import json
import logging
from datetime import date
from typing import Optional

from config.logging_config import get_logger
from domains.transactions.database.repository import TransactionRepository

logger = get_logger(__name__)

repository = TransactionRepository()


def _serialize_transaction(tx: dict) -> dict:
    """Sérialise une transaction pour JSON."""
    result = {}
    for key, value in tx.items():
        if isinstance(value, date):
            result[key] = value.isoformat()
        elif value is None:
            result[key] = None
        else:
            result[key] = value
    return result




async def add_transaction(data: dict) -> str:
    """Ajoute une nouvelle transaction."""
    try:
        new_id = await repository.add(data)
        if new_id:
            return json.dumps({"id": new_id})
        return json.dumps({"error": "Ajout échoué"})

    except Exception as e:
        logger.error(f"Erreur add_transaction: {e}")
        return json.dumps({"error": str(e)})


async def update_transaction(tx_id: int, data: dict) -> str:
    """Met à jour une transaction existante."""
    try:
        data["id"] = tx_id
        success = await repository.update(data)
        return json.dumps({"success": success})

    except Exception as e:
        logger.error(f"Erreur update_transaction: {e}")
        return json.dumps({"success": False, "error": str(e)})


async def delete_transaction(tx_id: int) -> str:
    """Supprime une transaction."""
    try:
        success = await repository.delete(tx_id)
        return json.dumps({"success": success})

    except Exception as e:
        logger.error(f"Erreur delete_transaction: {e}")
        return json.dumps({"success": False, "error": str(e)})


async def get_structured_categories() -> str:
    """Récupère l'arbre des catégories depuis categories.yaml."""
    try:
        from pathlib import Path
        import yaml
        import json
        
        # Le fichier est dans backend/domains/transactions/database/categories.yaml
        # On est dans backend/api/transactions.py
        current_dir = Path(__file__).parent
        yaml_path = current_dir.parent / "domains" / "transactions" / "database" / "categories.yaml"
        
        if not yaml_path.exists():
            logger.error(f"Fichier categories.yaml non trouvé à : {yaml_path}")
            return json.dumps({})
            
        with open(yaml_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
            
        result = {}
        for cat in data.get("categories", []):
            name = cat.get("name")
            subs = cat.get("subcategories", [])
            if name:
                result[name] = subs
        return json.dumps(result, ensure_ascii=False)
        
    except Exception as e:
        logger.error(f"Erreur get_structured_categories: {e}")
        return json.dumps({})


