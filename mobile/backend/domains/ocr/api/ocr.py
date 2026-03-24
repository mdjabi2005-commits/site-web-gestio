"""
OCR API - Endpoints Pyodide
Points d'entrée pour le frontend via le Worker Pyodide
"""

import json
import logging

from config.logging_config import get_logger
from ..services.ocr_service import full_pipeline, process_pdf as ocr_service_process_pdf, process_image

logger = get_logger(__name__)


async def scan_text(raw_text: str) -> str:
    """
    Endpoint: Texte brut -> Transaction structurée
    Utilise le pipeline complet (regex + cache + Groq)
    """
    try:
        result = await full_pipeline(raw_text)
        return json.dumps(result, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Error in scan_text: {e}")
        return json.dumps({"error": str(e)})


async def scan_document(image_data: str) -> str:
    """
    Endpoint: Image base64 -> Transaction structurée
    Note: L'extraction du texte doit être faite côté frontend avec ML Kit
    """
    try:
        result = await process_image(image_data)
        return json.dumps(result, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Error in scan_document: {e}")
        return json.dumps({"error": str(e)})


async def process_pdf(pdf_data: str) -> str:
    """
    Endpoint: PDF base64 -> Transaction structurée
    """
    try:
        result = await ocr_service_process_pdf(pdf_data)
        return json.dumps(result, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Error in process_pdf: {e}")
        return json.dumps({"error": str(e)})
