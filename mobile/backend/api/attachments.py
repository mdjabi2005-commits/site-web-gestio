# Backend API - Attachments
# Point d'entrée pour les pièces jointes via Pyodide

import json
import logging

from config.logging_config import get_logger

logger = get_logger(__name__)




async def delete_attachment(attachment_id: int) -> str:
    """Supprime une pièce jointe."""
    try:
        from domains.transactions.services.attachment_service import attachment_service
        success = await attachment_service.delete_attachment(attachment_id)
        return json.dumps({"success": success})

    except Exception as e:
        logger.error(f"Erreur delete_attachment: {e}")
        return json.dumps({"success": False, "error": str(e)})
