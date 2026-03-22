"""
Objectif Service
Logique métier pour les objectifs — calcul de progression depuis transactions.
"""

import logging
from datetime import date, datetime
from shared.database import get_db_connection, close_connection
from domains.objectifs.repository_objectif import objectif_repository

logger = logging.getLogger(__name__)


async def calculate_progression_from_transactions(
    start_date: str, end_date: str
) -> float:
    """
    Calcule la somme des soldes mensuels positifs entre deux dates.

    Pour chaque mois dans la période :
      solde_mois = SUM(revenus) - SUM(dépenses)
    On ne compte que les mois où solde_mois > 0.

    Returns:
        Somme totale des soldes positifs (progression en euros).
    """
    conn = get_db_connection()
    try:
        rows = await conn.fetch_all(
            """
            SELECT
                strftime('%Y-%m', date) as mois,
                COALESCE(SUM(CASE WHEN type = 'revenu' THEN montant ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN type = 'dépense' THEN montant ELSE 0 END), 0) as solde_mois
            FROM transactions
            WHERE date >= ? AND date <= ?
            GROUP BY mois
            HAVING solde_mois > 0
            """,
            (start_date, end_date),
        )

        total = sum(row["solde_mois"] for row in rows)
        return round(total, 2)

    except Exception as e:
        logger.error(f"Erreur calculate_progression: {e}")
        return 0.0
    finally:
        close_connection(conn)


async def refresh_objectifs() -> dict:
    """
    Rafraîchit la progression de tous les objectifs depuis les transactions.
    Appelé au démarrage de l'application.

    Logique :
      Pour chaque objectif actif :
        1. Déterminer la date de départ (derniere_modification ou created_at)
        2. Calculer la somme des soldes positifs depuis cette date
        3. Si somme_calculée > progression_actuelle :
             → progression_actuelle = max(progression_actuelle, somme_calculée)
             → derniere_modification = today
        4. Si progression_actuelle >= montant_cible : statut = 'Atteint'
        5. Si date_limite dépassée et statut = 'En cours' : statut = 'Abandonné'

    Returns:
        dict avec 'updated', 'reached', 'abandoned'
    """
    today = date.today()
    today_str = today.isoformat()

    objectifs = await objectif_repository.get_all()
    if not objectifs:
        logger.info("Aucun objectif à rafraîchir (liste vide ou erreur)")
        return {"updated": 0, "reached": 0, "abandoned": 0}

    updated = 0
    reached = 0
    abandoned = 0

    for obj in objectifs:
        obj_id = obj["id"]
        progression = obj.get("progression_actuelle", 0.0) or 0.0
        montant_cible = obj.get("montant_cible", 0.0) or 0.0
        statut = obj.get("statut", "En cours")
        date_limite = obj.get("date_limite")
        last_mod = obj.get("derniere_modification")
        created_at = obj.get("created_at", today_str)

        start_date = last_mod if last_mod else created_at

        somme_calculee = await calculate_progression_from_transactions(
            start_date, today_str
        )

        changed = False

        if statut == "En cours":
            try:
                if date_limite:
                    # ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)
                    dl_str = date_limite[:10] if len(date_limite) >= 10 else None
                    if dl_str:
                        dl = date.fromisoformat(dl_str)
                        if dl < today:
                            await objectif_repository.update(
                                {
                                    "id": obj_id,
                                    "statut": "Abandonné",
                                    "derniere_modification": today_str,
                                }
                            )
                            abandoned += 1
                            changed = True
                            logger.info(
                                f"Objectif {obj_id} → Abandonné (date limite dépassée)"
                            )
                            continue
            except Exception as e:
                logger.error(f"Erreur parsing date_limite {obj_id}: {e}")

            if somme_calculee > progression:
                progression = round(somme_calculee, 2)
                changed = True
                logger.info(
                    f"Objectif {obj_id}: progression mise à jour → {progression}"
                )

                new_statut = "Atteint" if progression >= montant_cible else "En cours"
                if new_statut == "Atteint" and statut != "Atteint":
                    reached += 1
                    logger.info(f"Objectif {obj_id} → Atteint !")

                await objectif_repository.update(
                    {
                        "id": obj_id,
                        "progression_actuelle": progression,
                        "statut": new_statut,
                        "derniere_modification": today_str,
                    }
                )
                updated += 1

    result = {"updated": updated, "reached": reached, "abandoned": abandoned}
    logger.info(f"refresh_objectifs: {result}")
    return result


async def get_objectif_progress(id: int) -> dict:
    """
    Retourne la progression calculée d'un objectif spécifique.
    """
    obj = await objectif_repository.get_by_id(id)
    if not obj:
        return {"error": "Objectif non trouvé"}

    today = date.today()
    today_str = today.isoformat()
    last_mod = obj.get("derniere_modification")
    created_at = obj.get("created_at", today_str)
    start_date = last_mod if last_mod else created_at

    somme = await calculate_progression_from_transactions(start_date, today_str)

    progression = max(obj.get("progression_actuelle", 0.0) or 0.0, somme)
    pct = (
        round((progression / obj["montant_cible"]) * 100, 1)
        if obj["montant_cible"] > 0
        else 0.0
    )

    return {
        "id": id,
        "progression_calculee": somme,
        "progression_actuelle": obj.get("progression_actuelle", 0.0),
        "progression_max": round(progression, 2),
        "pct": min(pct, 100.0),
        "montant_cible": obj["montant_cible"],
        "statut": obj.get("statut", "En cours"),
    }
