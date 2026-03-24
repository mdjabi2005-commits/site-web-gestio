# LOGIC_FLOW - OCR Domain

> Documentation complète du flux de données pour le domaine OCR.

## Vue d'ensemble

```mermaid
flowchart TD
    subgraph "Frontend (React)"
        ML["ML Kit\n(Text Recognition)"]
        Camera["Capacitor Camera\n(Image Capture)"]
    end

    subgraph "Pyodide Worker"
        API["api/ocr.py\nEndpoints"]
        Pipeline["ocr_service.py\nFull Pipeline"]
    end

    subgraph "OCR Services"
        Regex["regex_parser.py\nExtract amount/date/merchant"]
        Cache["cache_service.py\nVendor Cache"]
        Groq["ocr_service.py\nGroq API"]
        PDF["pdf_parser.py\nPDF Extraction"]
    end

    subgraph "Database"
        VCache["vendor_cache\nSQLite"]
    end

    subgraph "External"
        GroqAPI["Groq API\nLlama-3-8b"]
    end

    Camera -->|image| ML
    ML -->|raw_text| API

    API --> Pipeline

    PDF -.->|pdf_base64| Pipeline

    Pipeline --> Regex
    Regex -->|merchant| Cache
    Cache -->|categorie| Pipeline
    Cache -.->|miss| VCache

    Pipeline -->|no cache| Groq
    Groq -->|categorie| Pipeline

    Pipeline -->|result| API

    Groq --> GroqAPI
    Cache --> VCache
```

## Pipelines détaillées

### Pipeline: Scan ticket (Image)

```mermaid
sequenceDiagram
    participant User
    participant Front as Frontend (ML Kit)
    participant API as api/ocr.py
    participant Pipeline as ocr_service.py
    participant Regex as regex_parser.py
    participant Cache as cache_service.py
    participant Groq as Groq API

    User->>Front: Prend photo
    Front->>Front: ML Kit OCR
    Front->>API: scan_document(image_base64)
    API->>Pipeline: full_pipeline(raw_text)
    Pipeline->>Regex: extract_all(text)
    Regex-->>Pipeline: {amount, date, merchant}

    alt Merchant en cache
        Pipeline->>Cache: get_category(merchant)
        Cache-->>Pipeline: {categorie, sous_categorie}
    else Pas en cache
        Pipeline->>Groq: parse_with_groq(text, merchant)
        Groq-->>Pipeline: {categorie, sous_categorie}
        Pipeline->>Cache: set_category(merchant, cat)
    end

    Pipeline-->>API: {amount, date, categorie, sous_categorie}
    API-->>User: JSON result
```

### Pipeline: Scan PDF

```mermaid
sequenceDiagram
    participant User
    participant Front as Frontend
    participant API as api/ocr.py
    participant PDF as pdf_parser.py
    participant Pipeline as ocr_service.py

    User->>Front: Upload PDF
    Front->>API: extract_pdf(pdf_base64)
    API->>PDF: extract_text(pdf_base64)
    PDF-->>API: raw_text
    API->>Pipeline: full_pipeline(raw_text)
    Pipeline-->>API: {amount, date, categorie, sous_categorie}
    API-->>User: JSON result
```

## Composants clés

| Couche | Fichier | Rôle |
|--------|---------|------|
| API | `api/ocr.py` | Endpoints Pyodide |
| Service | `services/ocr_service.py` | Orchestration pipeline |
| Parser | `services/regex_parser.py` | Extraction montant/date/merchant |
| Cache | `services/cache_service.py` | Vendor cache SQLite |
| Parser | `services/pdf_parser.py` | Extraction PDF (pdfminer) |

## Formats d'entrée/sortie

### Entrée API

```python
scan_text(raw_text: str)           # Texte brut OCR
scan_document(image_base64: str)    # Image (non implémenté)
extract_pdf(pdf_base64: str)        # PDF base64
```

### Sortie

```python
{
    "amount": 42.50,           # float ou None
    "date": "2026-03-15",     # ISO date ou None
    "merchant": "Carrefour",  # str ou None
    "categorie": "Alimentation",
    "sous_categorie": "Supermarché"
}
```

## Vendor Cache

Table SQLite: `vendor_cache`

```sql
CREATE TABLE vendor_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    merchant_name TEXT UNIQUE NOT NULL,
    categorie TEXT NOT NULL,
    sous_categorie TEXT,
    last_updated TEXT NOT NULL
);
```

## Configuration

- **Groq API Key**: Variable d'environnement `GROQ_API_KEY`
- **pdfminer.six**: Dépendance optionnelle pour PDF (test Pyodide requis)

## Notes

- ML Kit côté frontend fait l'extraction texte
- Backend Python fait: regex → cache → Groq → result
- vendor_cache réduit les appels Groq de ~90%
