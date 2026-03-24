import sqlite3
import sys
import os


def get_balance_info(db_path):
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at {db_path}")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Calculate sum of Income
        cursor.execute("SELECT SUM(montant) FROM transactions WHERE type = 'revenu'")
        revenu_sum = cursor.fetchone()[0] or 0
        
        # Calculate sum of Expenses
        cursor.execute("SELECT SUM(montant) FROM transactions WHERE type = 'dépense'")
        depense_sum = cursor.fetchone()[0] or 0
        
        balance = revenu_sum - depense_sum
        
        print(f"\n--- Statistics for {db_path} ---")
        print(f"Total Income: {revenu_sum:,.2f} €")
        print(f"Total Expenses: {depense_sum:,.2f} €")
        print(f"Calculated Balance: {balance:,.2f} €")
        
        
        conn.close()
    except Exception as e:
        print(f"Error reading database: {e}")



if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: uv run python scripts/db_maintenance.py <path_to_db>")
        print("Example: uv run python scripts/db_maintenance.py financesSQLite.db")
    else:
        path = sys.argv[1]
        get_balance_info(path)
        
