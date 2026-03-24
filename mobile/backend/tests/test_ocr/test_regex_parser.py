import pytest
from datetime import date

from domains.ocr.services.regex_parser import (
    extract_amount,
    extract_date,
    extract_merchant,
    extract_all,
)


class TestExtractAmount:
    def test_extract_amount_with_euro(self):
        assert extract_amount("Total: 42,50 €") == 42.50
        assert extract_amount("42.50 EUR") == 42.50
        assert extract_amount("Prix: 15,99€") == 15.99

    def test_extract_amount_with_label(self):
        assert extract_amount("Montant: 100.00") == 100.00
        assert extract_amount("TOTAL 50,25") == 50.25
        assert extract_amount("AMOUNT: 75.50") == 75.50

    def test_extract_amount_simple(self):
        assert extract_amount("42,50") == 42.50
        assert extract_amount("100.00") == 100.00

    def test_extract_amount_not_found(self):
        assert extract_amount("Pas de montant ici") is None
        assert extract_amount("") is None

    def test_extract_amount_typos_v1(self):
        assert extract_amount("Tota7 5 articles: 42,50") == 42.50
        assert extract_amount("TOTAL TTC: 100,00") == 100.00
        assert extract_amount("NET A PAYER: 50,25") == 50.25
        assert extract_amount("NET PAYER EN EUROS: 75,50") == 75.50
        assert extract_amount("MONTANT TTC: 25,99") == 25.99
        assert extract_amount("MONTANT REEL: 10,00") == 10.00

    def test_extract_amount_confusion_o_0(self):
        assert extract_amount("TOTAL: 5O,OO") == 50.00
        assert extract_amount("Montant: 42,5O") == 42.50

    def test_extract_amount_cb(self):
        assert extract_amount("CB: 42.50") == 42.50


class TestExtractDate:
    def test_extract_date_slash_format(self):
        result = extract_date("Date: 15/03/2026")
        assert result == date(2026, 3, 15)

    def test_extract_date_dash_format(self):
        result = extract_date("15-03-2026")
        assert result == date(2026, 3, 15)

    def test_extract_date_dot_format(self):
        result = extract_date("15.03.2026")
        assert result == date(2026, 3, 15)

    def test_extract_date_with_label(self):
        result = extract_date("Ticket du 25/12/2025")
        assert result == date(2025, 12, 25)

    def test_extract_date_not_found(self):
        assert extract_date("Pas de date") is None
        assert extract_date("") is None


class TestExtractMerchant:
    def test_extract_merchant_simple(self):
        result = extract_merchant("Carrefour Market\n15/03/2026\nTotal: 42.50€")
        assert result == "Carrefour Market"

    def test_extract_merchant_with_skip_words(self):
        result = extract_merchant("Ticket de caisse\nCarrefour\nTotal: 10.00€")
        assert result == "Carrefour"

    def test_merchant_not_found(self):
        assert extract_merchant("") is None
        assert extract_merchant("    ") is None


class TestExtractAll:
    def test_extract_all_complete(self):
        text = """Carrefour Market
15/03/2026
Total: 42,50€"""
        result = extract_all(text)
        assert result["amount"] == 42.50
        assert result["date"] == date(2026, 3, 15)
        assert result["merchant"] == "Carrefour Market"

    def test_extract_all_partial(self):
        text = "Total: 25.00€"
        result = extract_all(text)
        assert result["amount"] == 25.00
        assert result["date"] is None
        assert result["merchant"] is None
