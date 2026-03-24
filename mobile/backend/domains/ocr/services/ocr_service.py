"""
OCR Service - Orchestration du pipeline OCR complet
Combine: regex_parser -> cache -> Groq
"""

import logging
import os
import re
from typing import Optional

from .regex_parser import extract_all
from .cache_service import get_category, set_category
from .pdf_parser import extract_text as extract_pdf_text
from shared.database.settings_repository import get_setting
from domains.transactions.database.constants import TRANSACTION_CATEGORIES

logger = logging.getLogger(__name__)


async def process_pdf(pdf_base64: str) -> dict:
    """
    Traite un fichier PDF : extraction de texte via PdfReader puis pipeline OCR.
    """
    logger.info("Processing PDF report...")

    # 1. Extraction du texte
    raw_text = extract_pdf_text(pdf_base64)
    if not raw_text or not raw_text.strip():
        logger.error("Failed to extract text from PDF (empty or whitespace only)")
        return {
            "error": "Ce PDF ne contient aucun texte lisible (il s'agit peut-être d'une image scannée). Veuillez essayer avec un 'vrai' PDF ou prendre une photo."
        }

    # 2. Pipeline complet (Regex + Cache + Groq)
    return await full_pipeline(raw_text)


async def parse_with_groq(raw_text: str, merchant: Optional[str] = None) -> dict:
    """
    Appelle Groq API pour catégoriser le texte brut en utilisant les catégories définies.
    """
    api_key = await get_setting("groq_api_key")

    if not api_key:
        logger.warning("GROQ_API_KEY not configured in settings")
        return {"categorie": "Divers", "sous_categorie": "Autre"}

    try:
        from groq import Groq

        client = Groq(api_key=api_key)

        # On injecte la liste des catégories valides
        categories_str = ", ".join(TRANSACTION_CATEGORIES)

        prompt = f"""Tu es un expert en comptabilité personnelle. Analyse ce texte de ticket de caisse et retourne UNQUEMENT un objet JSON.

LISTE DES CATÉGORIES AUTORISÉES (choisis-en UNE seule) :
{categories_str}

CONSIGNES :
1. "categorie": Doit être l'une des catégories de la liste ci-dessus.
2. "sous_categorie": Trouve une sous-catégorie pertinente (ex: Essence, Supermarché, Restaurant, etc.).
3. Si tu hésites, utilise "Divers" / "Autre".

Texte du ticket :
{raw_text[:1200]}

{"Marchand identifié : " + merchant if merchant else ""}

RÉPONSES JSON UNIQUEMENT :
{{"categorie": "...", "sous_categorie": "..."}}"""

        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {
                    "role": "system",
                    "content": "Tu es un assistant spécialisé dans l'extraction de données de tickets de caisse. Tu réponds exclusivement en JSON.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            max_tokens=150,
        )

        import json

        content = response.choices[0].message.content or ""

        # Nettoyage minimal pour extraire le JSON si Groq a ajouté du texte blabla
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group(0))
            cat = result.get("categorie")
            # Validation sommaire pour s'assurer que la catégorie existe
            if cat not in TRANSACTION_CATEGORIES:
                cat = "Divers"

            return {
                "categorie": cat,
                "sous_categorie": result.get("sous_categorie", "Autre"),
            }

        return {"categorie": "Divers", "sous_categorie": "Autre"}

    except ImportError:
        logger.error("groq library not installed")
        return {"categorie": "Autre", "sous_categorie": None}
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        return {"categorie": "Autre", "sous_categorie": None}


async def full_pipeline(raw_text: str) -> dict:
    """
    Pipeline complet d'extraction OCR.

    Étapes:
    1. Regex extraction (montant, date, merchant)
    2. Cache check (si merchant connu -> catégorie immédiate)
    3. Groq (si pas en cache) -> catégorisation

    Args:
        raw_text: Texte brut depuis OCR/PDF

    Returns:
        dict {amount, date, merchant, categorie, sous_categorie}
    """
    extracted = extract_all(raw_text)

    amount = extracted.get("amount")
    tx_date = extracted.get("date")
    merchant = extracted.get("merchant")

    categorie = None
    sous_categorie = None

    if merchant:
        cached = await get_category(merchant)
        if cached:
            categorie = cached.get("categorie")
            sous_categorie = cached.get("sous_categorie")
            logger.info(f"Cache hit for merchant: {merchant}")

    if not categorie:
        groq_result = await parse_with_groq(raw_text, merchant)
        categorie = groq_result.get("categorie", "Autre")
        sous_categorie = groq_result.get("sous_categorie")

        if merchant and categorie:
            await set_category(merchant, categorie, sous_categorie)
            logger.info(f"Cached new vendor: {merchant} -> {categorie}")

    return {
        "montant": amount,
        "date": tx_date.isoformat() if tx_date else None,
        "merchant": merchant,
        "description": merchant or (raw_text[:30] + "...") if raw_text else None,
        "categorie": categorie,
        "sous_categorie": sous_categorie,
    }


async def process_image(image_base64: str) -> dict:
    """
    Traite une image via le pipeline OCR.
    Note: L'extraction du texte de l'image doit être faite côté frontend (ML Kit).

    Args:
        image_base64: Image encodée en base64

    Returns:
        dict {amount, date, categorie, sous_categorie}
    """
    return {"error": "Image processing not implemented - use ML Kit on frontend"}

    # La deuxième fonction process_pdf a été supprimée pour éviter d'écraser la première!
