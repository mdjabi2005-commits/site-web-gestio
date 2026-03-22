# Backend API Package - PWA Version
# Seul l'OCR est géré côté Python. Tout le reste (transactions, budgets, etc.) est géré côté JS via sql.js.

from .setup import initialize_backend
from domains.ocr.api.ocr import scan_text, scan_document, process_pdf

__all__ = [
    "initialize_backend",
    "scan_text",
    "scan_document",
    "process_pdf",
]
