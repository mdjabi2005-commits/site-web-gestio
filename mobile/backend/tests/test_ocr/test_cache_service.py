import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from domains.ocr.services.cache_service import (
    init_vendor_cache,
    get_category,
    set_category,
)


class TestVendorCache:
    @pytest.mark.asyncio
    @patch("domains.ocr.services.cache_service.get_db_connection")
    async def test_init_vendor_cache(self, mock_get_conn):
        mock_conn = MagicMock()
        mock_conn.execute = AsyncMock()
        mock_get_conn.return_value = mock_conn

        result = await init_vendor_cache()

        mock_conn.execute.assert_called_once()
        assert result is True

    @pytest.mark.asyncio
    @patch("domains.ocr.services.cache_service.get_db_connection")
    async def test_get_category_found(self, mock_get_conn):
        mock_conn = MagicMock()
        mock_conn.fetch_one = AsyncMock(
            return_value={"categorie": "Alimentation", "sous_categorie": "Supermarché"}
        )
        mock_get_conn.return_value = mock_conn

        result = await get_category("Carrefour")

        assert result == {"categorie": "Alimentation", "sous_categorie": "Supermarché"}

    @pytest.mark.asyncio
    @patch("domains.ocr.services.cache_service.get_db_connection")
    async def test_get_category_not_found(self, mock_get_conn):
        mock_conn = MagicMock()
        mock_conn.fetch_one = AsyncMock(return_value=None)
        mock_get_conn.return_value = mock_conn

        result = await get_category("Unknown")

        assert result is None

    @pytest.mark.asyncio
    @patch("domains.ocr.services.cache_service.get_db_connection")
    async def test_set_category(self, mock_get_conn):
        mock_conn = MagicMock()
        mock_conn.execute = AsyncMock()
        mock_get_conn.return_value = mock_conn

        result = await set_category("Carrefour", "Alimentation", "Supermarché")

        mock_conn.execute.assert_called_once()
        assert result is True

    @pytest.mark.asyncio
    async def test_get_category_empty_merchant(self):
        result = await get_category("")
        assert result is None

    @pytest.mark.asyncio
    async def test_set_category_missing_params(self):
        result = await set_category("", "Alimentation")
        assert result is False
