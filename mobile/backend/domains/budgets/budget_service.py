"""
Budget Service
Logique métier pour les budgets.
"""

import logging
from datetime import date
from typing import List, Optional

from shared.database import get_db_connection, close_connection
from .repository_budget import budget_repository

logger = logging.getLogger(__name__)


async def get_budgets_status(annee: int, mois: int) -> List[dict]:
    """
    Retourne le statut de chaque budget pour un mois donné.
    Croise la table budgets avec la somme des transactions du mois.

    Returns une liste de dicts avec:
      - toutes les colonnes du budget
      - depense: somme des transactions "dépense" du mois
      - reste: montant_limite - depense
      - pct_utilisation: % du budget dépensé
      - en_alerte: True si depense >= (montant_limite * alert_seuil / 100)
    """
    conn = None
    try:
        budgets = await budget_repository.get_all(actifs_seulement=True)
        if not budgets:
            return []

        start_date = f"{annee}-{mois:02d}-01"
        year = annee
        month = mois
        if month == 12:
            end_year = year + 1
            end_month = 1
        else:
            end_year = year
            end_month = month + 1
        end_date = f"{end_year}-{end_month:02d}-01"

        conn = get_db_connection()
        spent_rows = await conn.fetch_all(
            """
            SELECT categorie, SUM(montant) as total_depense
            FROM transactions
            WHERE type = 'dépense'
              AND date >= ?
              AND date < ?
            GROUP BY categorie
            """,
            (start_date, end_date),
        )
        close_connection(conn)

        spent_map = {
            row["categorie"].lower(): row["total_depense"] for row in spent_rows
        }

        result = []
        for budget in budgets:
            budget_cat = budget["categorie"].lower()
            depense = spent_map.get(budget_cat, 0.0) or 0.0
            limite = budget["montant_limite"] or 0.0
            reste = max(0.0, limite - depense)
            pct = (depense / limite * 100) if limite > 0 else 0.0
            seuil = budget["alert_seuil"] or 80.0
            en_alerte = depense >= (limite * seuil / 100)

            status = "ok"
            if pct >= 100:
                status = "depassé"
            elif pct >= seuil:
                status = "alerte"

            result.append(
                {
                    **budget,
                    "depense": round(depense, 2),
                    "reste": round(reste, 2),
                    "pct_utilisation": round(pct, 1),
                    "en_alerte": en_alerte,
                    "status": status,
                }
            )

        return result

    except Exception as e:
        logger.error(f"Erreur get_budgets_status: {e}")
        return []
    finally:
        close_connection(conn)


async def get_budgets_summary(annee: int, mois: int) -> dict:
    """Résumé global: total budgets, total dépensé, nb alertes."""
    statuses = await get_budgets_status(annee, mois)
    if not statuses:
        return {
            "total_budgets": 0,
            "total_limite": 0.0,
            "total_depense": 0.0,
            "nb_alertes": 0,
        }

    return {
        "total_budgets": len(statuses),
        "total_limite": round(sum(b["montant_limite"] for b in statuses), 2),
        "total_depense": round(sum(b["depense"] for b in statuses), 2),
        "nb_alertes": sum(1 for b in statuses if b["en_alerte"]),
    }
