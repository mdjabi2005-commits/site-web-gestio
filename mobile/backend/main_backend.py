"""
API Layer pour Pyodide - PWA Version
Point d'entrée unique pour le frontend React.
Seul l'OCR est géré côté Python. Tout le reste (transactions, budgets, etc.) est géré côté JS via sql.js.
"""

from api import (
    initialize_backend,
    scan_text,
    scan_document,
    process_pdf,
)

__all__ = [
    "initialize_backend",
    "scan_text",
    "scan_document",
    "process_pdf",
]
