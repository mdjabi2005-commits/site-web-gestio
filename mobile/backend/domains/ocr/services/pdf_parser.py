"""
PDF Parser - Extraction de texte depuis fichiers PDF
Utilise pypdf (pure Python, compatible Pyodide) au lieu de pdfminer.six
"""

import logging
import base64
from typing import Optional

logger = logging.getLogger(__name__)


def extract_text_from_base64(pdf_base64: str) -> str:
    """
    Extrait le texte brut depuis un PDF encodé en base64.

    Args:
        pdf_base64: Contenu PDF encodé en base64 (avec ou sans préfixe data:)

    Returns:
        Texte brut extrait du PDF
    """
    try:
        # Supprimer le préfixe data URI si présent
        if "base64," in pdf_base64:
            pdf_base64 = pdf_base64.split("base64,")[1]

        pdf_bytes = base64.b64decode(pdf_base64)
        return extract_text_from_bytes(pdf_bytes)
    except Exception as e:
        logger.error(f"Error decoding base64 PDF: {e}")
        return ""


def extract_text_from_bytes(pdf_bytes: bytes) -> str:
    """
    Extrait le texte brut depuis les bytes d'un PDF via pypdf.
    """
    try:
        from io import BytesIO
        from pypdf import PdfReader

        pdf_stream = BytesIO(pdf_bytes)
        reader = PdfReader(pdf_stream)

        pages_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text)

        extracted_text = "\n".join(pages_text).strip()
        logger.info(f"=== PDF EXTRACTION SUCCESS ===")
        logger.info(f"Extracted {len(extracted_text)} characters.")
        logger.info(f"PREVIEW: {extracted_text[:500]}...")
        logger.info(f"==============================")
        return extracted_text
    except ImportError:
        logger.error("pypdf not installed or not compatible with Pyodide")
        return ""
    except Exception as e:
        logger.error(f"Error extracting PDF text: {e}")
        return ""


def extract_text(pdf_data: str) -> str:
    """
    Point d'entrée unique pour extraction PDF.
    Accepte du base64 (avec ou sans préfixe data:) ou un chemin de fichier.

    Args:
        pdf_data: Base64 ou chemin vers PDF

    Returns:
        Texte brut extrait
    """
    if not pdf_data:
        return ""

    # Si ça ressemble à du base64 (préfixe data: ou grosse chaîne)
    if pdf_data.startswith("data:") or (len(pdf_data) > 500 and "/" not in pdf_data[:10]):
        return extract_text_from_base64(pdf_data)
    else:
        # Chemin de fichier (non supporté en Pyodide, fallback gracieux)
        try:
            with open(pdf_data, "rb") as f:
                return extract_text_from_bytes(f.read())
        except Exception as e:
            logger.error(f"Error reading PDF file: {e}")
            return ""
