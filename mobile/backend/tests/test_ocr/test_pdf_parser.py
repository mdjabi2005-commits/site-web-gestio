import pytest
from unittest.mock import patch
from domains.ocr.services.pdf_parser import extract_text_from_bytes

def test_extract_text_from_bytes_integration():
    """
    Test simple de l'intégration avec pdfminer.six.
    On mocke l'appel à pdfminer pour vérifier la logique interne.
    """
    mock_pdf_bytes = b"fake pdf content"
    expected_text = "Extracted Text Content"
    
    with patch("pdfminer.high_level.extract_text") as mock_extract:
        mock_extract.return_value = expected_text
        
        result = extract_text_from_bytes(mock_pdf_bytes)
        
        assert result == expected_text
        mock_extract.assert_called_once()
