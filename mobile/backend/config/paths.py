import os
import sys
from pathlib import Path

# Racine du projet
APP_ROOT = Path(__file__).parent.parent

# Detection du mode
IS_PYODIDE = os.environ.get("PYODIDE_MODE") == "1"

if IS_PYODIDE:
    # --- MODE VMOBILE (PYODIDE) ---
    DB_PATH = "finances"  # Nom logique pour le bridge JS
    DATA_DIR = "/analyse"
    TO_SCAN_DIR = "/analyse/tickets_a_scanner"
    SORTED_DIR = "/analyse/tickets_tries"
    APP_LOG_DIR = "/analyse/logs"
    CSV_EXPORT_DIR = "/analyse/exports"
    ENV_PATH = "/analyse/.env"
    print("[Paths] VMobile detected - virtual filesystem mode")
else:
    # --- MODE LOCAL (PC / TESTS) ---
    _home = Path.home()

    # Mode test (ex: pytest)
    _pytest_running = "pytest" in sys.modules or any(
        "pytest" in arg for arg in sys.argv
    )
    if _pytest_running:
        DATA_DIR = str(_home / "test_gestio")
    else:
        DATA_DIR = str(_home / "analyse")

    DB_PATH = os.path.join(DATA_DIR, "finances.db")
    TO_SCAN_DIR = os.path.join(DATA_DIR, "tickets_a_scanner")
    SORTED_DIR = os.path.join(DATA_DIR, "tickets_tries")
    APP_LOG_DIR = os.path.join(DATA_DIR, "logs")
    CSV_EXPORT_DIR = os.path.join(DATA_DIR, "exports")
    ENV_PATH = os.path.join(DATA_DIR, ".env")

    # Creation des dossiers physiques (uniquement sur PC)
    for directory in [DATA_DIR, TO_SCAN_DIR, SORTED_DIR, APP_LOG_DIR, CSV_EXPORT_DIR]:
        os.makedirs(directory, exist_ok=True)

    print(f"[Paths] PC/Dev detected - Data directory: {DATA_DIR}")

# Common paths
APP_LOG_PATH = os.path.join(APP_LOG_DIR, "gestio_app.log")
CSV_TRANSACTIONS_SANS_TICKETS = os.path.join(
    CSV_EXPORT_DIR, "transactions_sans_tickets.csv"
)
REVENUS_A_TRAITER = os.path.join(DATA_DIR, "revenus_a_traiter")
REVENUS_TRAITES = os.path.join(DATA_DIR, "revenus_traites")
