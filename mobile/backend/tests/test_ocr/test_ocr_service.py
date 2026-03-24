import pytest
from unittest.mock import AsyncMock, patch
from domains.ocr.services.ocr_service import full_pipeline, parse_with_groq

@pytest.mark.asyncio
async def test_full_pipeline_with_cached_merchant():
    raw_text = "Carrefour\nTotal: 42.50€"
    with patch("domains.ocr.services.ocr_service.extract_all") as mock_extract:
        mock_extract.return_value = {"amount": 42.50, "date": None, "merchant": "Carrefour"}
        with patch("domains.ocr.services.ocr_service.get_category", new_callable=AsyncMock) as mock_get_cat:
            mock_get_cat.return_value = {"categorie": "Alimentation", "sous_categorie": "Supermarché"}
            
            result = await full_pipeline(raw_text)
            
            assert result["amount"] == 42.50
            assert result["categorie"] == "Alimentation"
            assert result["sous_categorie"] == "Supermarché"
            assert result["merchant"] == "Carrefour"

@pytest.mark.asyncio
async def test_full_pipeline_with_new_merchant_groq():
    raw_text = "NouveauMagasin\nTotal: 10.00€"
    with patch("domains.ocr.services.ocr_service.extract_all") as mock_extract:
        mock_extract.return_value = {"amount": 10.00, "date": None, "merchant": "NouveauMagasin"}
        with patch("domains.ocr.services.ocr_service.get_category", new_callable=AsyncMock) as mock_get_cat:
            mock_get_cat.return_value = None
            with patch("domains.ocr.services.ocr_service.parse_with_groq", new_callable=AsyncMock) as mock_parse_groq:
                mock_parse_groq.return_value = {"categorie": "Shopping", "sous_categorie": "Vêtements"}
                with patch("domains.ocr.services.ocr_service.set_category", new_callable=AsyncMock) as mock_set_cat:
                    
                    result = await full_pipeline(raw_text)
                    
                    assert result["categorie"] == "Shopping"
                    assert result["sous_categorie"] == "Vêtements"
                    mock_set_cat.assert_called_once_with("NouveauMagasin", "Shopping", "Vêtements")

@pytest.mark.asyncio
async def test_parse_with_groq_fallback():
    # Test fallback when Groq fails or API key is missing
    with patch("domains.ocr.services.ocr_service.get_setting", new_callable=AsyncMock) as mock_get_setting:
        mock_get_setting.return_value = None # No API key
        
        result = await parse_with_groq("some text")
        
        assert result["categorie"] == "Divers"
        assert result["sous_categorie"] == "Autre"
from unittest.mock import AsyncMock, patch, MagicMock

from domains.ocr.services.ocr_service import (
    parse_with_groq,
    full_pipeline,
    process_pdf,
)


class TestOcrService:
    @pytest.mark.asyncio
    @patch("domains.ocr.services.ocr_service.GROQ_API_KEY", None)
    async def test_parse_with_groq_no_api_key(self):
        result = await parse_with_groq("some text", "merchant")

        assert result == {"categorie": "Autre", "sous_categorie": None}

    @pytest.mark.asyncio
    @patch("domains.ocr.services.ocr_service.GROQ_API_KEY", "")
    async def test_parse_with_groq_empty_api_key(self):
        result = await parse_with_groq("some text", "merchant")

        assert result == {"categorie": "Autre", "sous_categorie": None}


class TestFullPipeline:
    @pytest.mark.asyncio
    @patch("domains.ocr.services.ocr_service.GROQ_API_KEY", None)
    async def test_full_pipeline_with_cache_hit(self):
        with patch("domains.ocr.services.ocr_service.get_category") as mock_get:
            mock_get.return_value = {
                "categorie": "Alimentation",
                "sous_categorie": "Supermarché",
            }

            result = await full_pipeline("Carrefour\n42.50€\n15/03/2026")

            assert result["categorie"] == "Alimentation"
            assert result["amount"] == 42.50

    @pytest.mark.asyncio
    @patch("domains.ocr.services.ocr_service.GROQ_API_KEY", None)
    async def test_full_pipeline_with_cache_miss(self):
        with (
            patch("domains.ocr.services.ocr_service.get_category") as mock_get,
            patch("domains.ocr.services.ocr_service.set_category") as mock_set,
        ):
            mock_get.return_value = None
            mock_set.return_value = True

            result = await full_pipeline("Unknown shop\n50.00€\n20/03/2026")

            assert result["amount"] == 50.00
            assert result["categorie"] == "Autre"


class TestProcessPdf:
    pass
