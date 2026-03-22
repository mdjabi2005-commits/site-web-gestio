import pytest
import json

from domains.ocr.api.ocr import scan_text, extract_pdf


class TestScanTextAPI:
    @pytest.mark.asyncio
    async def test_scan_text_returns_json(self):
        result = await scan_text("Carrefour\n15/03/2026\nTotal: 42.50€")
        data = json.loads(result)
        assert "amount" in data
        assert "categorie" in data

    @pytest.mark.asyncio
    async def test_scan_text_with_error(self):
        result = await scan_text("")
        data = json.loads(result)
        # full_pipeline renvoie un dict avec "amount": None si text est vide
        assert "amount" in data
        assert data["amount"] is None


class TestExtractPDFAPI:
    @pytest.mark.asyncio
    async def test_extract_pdf_error(self):
        result = await extract_pdf("invalid_base64")
        data = json.loads(result)
        assert "error" in data
