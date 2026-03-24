"""
Regex Parser - Extraction de données depuis texte brut OCR
Extrait: montant, date, nom du marchand
"""

import re
from datetime import date
from typing import Optional


def extract_amount(text: Optional[str]) -> Optional[float]:
    """
    Extrait le montant d'un texte OCR.

    Patterns haute priorité (avec mots-clés):
    - "TOTAL: 42.50"
    - "NET A PAYER: 42.50"
    - "MONTANT TTC: 42.50"
    - "Tota7 5 articles: 42.50" (typo supportée)
    - "CB: 42.50"

    Patterns fallback (sans mot-clé):
    - "42.50 €" ou "€ 42.50"
    - "42,50" (dernier recours)

    Gère les typos courantes: O→0, Tota7→Total, etc.
    """
    if not text:
        return None

    text = text.replace("\n", " ").replace("\t", " ")

    patterns = [
        r"TOTAL\s*:?\s*([\dOo]+[.,][\dOo]{2})",
        r"NET\s*A?\s*PAYER\s*(?:EN\s*EUROS)?\s*:?\s*([\dOo]+[.,][\dOo]{2})",
        r"MONTANT\s*(?:TTC|REEL)?\s*:?\s*([\dOo]+[.,][\dOo]{2})",
        r"TOTAL\s+TTC\s*:?\s*([\dOo]+[.,][\dOo]{2})",
        r"Tota[l7]\s+\d+\s+articles\s*:?\s*([\dOo]+[.,][\dOo]{2})",
        r"CB\s*:?\s*([\dOo]+[.,][\dOo]{2})",
        r"(?:total|montant|amount|sum|ttl|prix)\s*:?\s*([\dOo]+[.,][\dOo]{2})",
        r"([\dOo]+[.,][\dOo]{2})\s*€",
        r"€\s*([\dOo]+[.,][\dOo]{2})",
        r"([\dOo]+[.,][\dOo]{2})\s*(?:EUR|EUROS?)",
        r"^\s*([\dOo]+[.,][\dOo]{2})\s*$",
    ]

    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
        if matches:
            last_match = matches[-1]
            try:
                amount_str = str(last_match)
                amount_str = amount_str.replace("O", "0").replace("o", "0")
                amount_str = amount_str.replace(",", ".").replace(" ", "")
                return float(amount_str)
            except (ValueError, IndexError):
                continue

    return None


def extract_date(text: Optional[str]) -> Optional[date]:
    """
    Extrait la date d'un texte.

    Formats supportés:
    - "15/03/2026"
    - "15-03-2026"
    - "15.03.2026"
    - "2026-03-15"
    - "15 mars 2026"
    """
    if not text:
        return None

    text = text.replace("\n", " ").replace("\t", " ")

    day_month_year = r"(?:(\d{1,2})[\s/.\-]+(\d{1,2})[\s/.\-]+(\d{2,4}))"
    year_month_day = r"(?:(\d{4})[\s/.\-]+(\d{1,2})[\s/.\-]+(\d{1,2}))"

    day_name = r"(?:(\d{1,2})\s+(?:jan|fév|mar|avr|mai|juin|juil|aoû|sep|oct|nov|déc)[a-z]*\s+(\d{2,4}))"

    year_month_day_names = r"((?:\d{4})[\s-]+(?:\d{1,2})[\s-]+(?:\d{1,2}))"

    patterns = [
        (f"{day_month_year}", "dmy"),
        (f"{year_month_day}", "ymd"),
        (f"{day_name}", "dmy_name"),
    ]

    for pattern, fmt in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            match = matches[-1]
            try:
                if fmt == "dmy" and len(match) == 3:
                    d, m, y = int(match[0]), int(match[1]), int(match[2])
                    if y < 100:
                        y += 2000
                    return date(y, m, d)
                elif fmt == "ymd" and len(match) == 3:
                    y, m, d = int(match[0]), int(match[1]), int(match[2])
                    return date(y, m, d)
                elif fmt == "dmy_name" and len(match) == 2:
                    d, y = int(match[0]), int(match[1])
                    if y < 100:
                        y += 2000
                    month_map = {
                        "jan": 1,
                        "fév": 2,
                        "feb": 2,
                        "mar": 3,
                        "avr": 4,
                        "may": 4,
                        "mai": 5,
                        "jun": 6,
                        "juin": 6,
                        "jul": 7,
                        "juil": 7,
                        "aug": 8,
                        "aoû": 8,
                        "sep": 9,
                        "oct": 10,
                        "nov": 11,
                        "déc": 12,
                        "dec": 12,
                    }
                    month_match = re.search(
                        r"(jan|fév|feb|mar|avr|apr|may|mai|jun|juin|jul|juil|aug|aoû|sep|oct|nov|déc|dec)",
                        text,
                        re.IGNORECASE,
                    )
                    if month_match:
                        m = month_map.get(month_match.group(1)[:3].lower(), 1)
                        return date(y, m, d)
            except (ValueError, IndexError):
                continue

    return None


def extract_merchant(text: str) -> Optional[str]:
    """
    Extrait le nom du marchand.
    Prend généralement la première ligne non vide significative.
    """
    if not text:
        return None

    lines = text.split("\n")
    lines = [line.strip() for line in lines if line.strip()]

    keywords_skip = [
        "ticket",
        "reçu",
        "recu",
        "facture",
        "invoice",
        "date",
        "heure",
        "total",
        "montant",
        "merci",
        "welcome",
        "au revoir",
        "magasin",
    ]

    for line in lines[:5]:
        line_lower = line.lower()
        if any(kw in line_lower for kw in keywords_skip):
            continue
        if re.match(r"^\d+[\s:.\-]?", line):
            continue
        if len(line) > 3:
            return line[:50]

    return None


def extract_all(text: str) -> dict:
    """
    Extrait montant, date et merchant depuis un texte brut.

    Returns:
        dict avec clés: amount, date, merchant
    """
    return {
        "amount": extract_amount(text),
        "date": extract_date(text),
        "merchant": extract_merchant(text),
    }
