"""
Recurrence Service - Unified recurrence operations

Handles automatic generation of recurring transactions and echeances management.
Consolidates recurrence.py + recurrence_generation.py for better maintainability.
"""

from datetime import timedelta, date, datetime

from config.logging_config import get_logger
from shared.database import get_db_connection, close_connection
from shared.utils.converters import add_months

logger = get_logger(__name__)


def get_next_date(current_date: date, frequence: str) -> date:
    """Calculte la prochaine date selon la fréquence."""
    freq = frequence.lower()
    if freq in ("quotidien", "quotidienne"):
        return current_date + timedelta(days=1)
    if freq == "hebdomadaire":
        return current_date + timedelta(weeks=1)
    if freq in ("mensuel", "mensuelle"):
        return add_months(current_date, 1)
    if freq in ("trimestriel", "trimestrielle"):
        return add_months(current_date, 3)
    if freq in ("semestriel", "semestrielle"):
        return add_months(current_date, 6)
    if freq in ("annuel", "annuelle"):
        return add_months(current_date, 12)
    return current_date


# ==============================
# 🔄 RECURRENCE GENERATION
# ==============================


async def generate_occurrences_for_recurrence(
    recurrence_id: int, start_date: date, end_date: date
) -> list:
    """
    Génère les occurrences d'une récurrence entre deux dates.

    IMPORTANT : Génère SEULEMENT les occurrences passées (<=aujourd'hui),
    pas les futures.
    """
    conn = get_db_connection()

    # Récupérer la récurrence
    rec = await conn.fetch_one(
        """
                         SELECT t.type,
                                t.categorie,
                                t.sous_categorie,
                                t.montant,
                                t.date as date_debut,
                                t.date_fin,
                                r.frequence,
                                t.description
                         FROM recurrences r
                         JOIN transactions t ON r.transaction_id = t.id
                         WHERE r.id = ?
                           AND r.actif = 1
                         """,
        (recurrence_id,),
    )

    if not rec:
        return []

    type_rec = rec["type"]
    categorie = rec["categorie"]
    sous_categorie = rec["sous_categorie"]
    montant = rec["montant"]
    date_debut_str = rec["date_debut"]
    date_fin_str = rec["date_fin"]
    frequence = rec["frequence"]
    description = rec["description"]

    # Convertir dates sans dateutil
    try:
        date_debut = date.fromisoformat(date_debut_str[:10])
        date_fin_rec = date.fromisoformat(date_fin_str[:10]) if date_fin_str else None
    except (ValueError, TypeError):
        logger.error(f"Erreur parsing dates pour récurrence {recurrence_id}")
        return []

    # IMPORTANT : Ne générer que jusqu'à aujourd'hui (pas de futures)
    today = date.today()
    end_date = min(end_date, today)

    # Générer occurrences
    occurrences = []
    current_date = max(date_debut, start_date)

    while current_date <= end_date:
        # Vérifier si on dépasse la date de fin de la récurrence
        if date_fin_rec and current_date > date_fin_rec:
            break

        occurrences.append(
            {
                "type": type_rec,
                "categorie": categorie,
                "sous_categorie": sous_categorie or "",
                "montant": montant,
                "date": current_date.isoformat(),
                "source": "récurrente_auto",
                "description": description or f"Récurrence auto - {categorie}",
            }
        )

        if frequence.lower() == "unique":
            break

        next_date = get_next_date(current_date, frequence)
        if next_date <= current_date:  # Eviter boucle infinie
            break
        current_date = next_date

    return occurrences


async def backfill_all_recurrences() -> int:
    """
    Génère toutes les occurrences manquantes pour toutes les récurrences actives.
    """
    conn = get_db_connection()

    recurrences = await conn.fetch_all("""
                                 SELECT r.id, t.date as date_debut, t.date_fin
                                 FROM recurrences r
                                 JOIN transactions t ON r.transaction_id = t.id
                                 WHERE r.actif = 1
                                 """)

    today = date.today()
    total_created = 0

    for rec in recurrences:
        rec_id = rec["id"]
        date_debut_str = rec["date_debut"]
        try:
            date_debut = date.fromisoformat(date_debut_str[:10])
        except (ValueError, TypeError):
            continue

        occurrences = await generate_occurrences_for_recurrence(
            rec_id, date_debut, today
        )

        for occ in occurrences:
            existing = await conn.fetch_one(
                """
                                      SELECT id
                                      FROM transactions
                                      WHERE categorie = ?
                                        AND sous_categorie = ?
                                        AND date = ?
                                        AND source = 'récurrente_auto'
                                      """,
                (occ["categorie"], occ["sous_categorie"], occ["date"]),
            )

            if not existing:
                await conn.execute(
                    """
                                INSERT INTO transactions
                                    (type, categorie, sous_categorie, montant, date, source, description)
                                VALUES (?, ?, ?, ?, ?, 'récurrente_auto', ?)
                                """,
                    (
                        occ["type"],
                        occ["categorie"],
                        occ["sous_categorie"],
                        occ["montant"],
                        occ["date"],
                        occ["description"],
                    ),
                )
                total_created += 1

    await conn.commit()

    logger.info(f"Backfill completed: {total_created} transactions created")
    return total_created


async def backfill_recurrences_to_today() -> None:
    """Génère automatiquement toutes les transactions récurrentes jusqu'à aujourd'hui."""
    count = await backfill_all_recurrences()
    logger.info(f"Recurrence backfill completed: {count} transactions created")


async def process_due_recurrences() -> dict:
    """Traite les récurrences dont la date est échue."""
    today = date.today()
    conn = get_db_connection()

    recurrences = await conn.fetch_all("""
                                 SELECT r.id, t.type, t.categorie, t.sous_categorie,
                                        t.montant, t.date as date_debut, t.date_fin, r.frequence,
                                        t.description, r.prochaine_occurrence
                                 FROM recurrences r
                                 JOIN transactions t ON r.transaction_id = t.id
                                 WHERE r.actif = 1
                                 """)

    created = 0
    deactivated = 0
    updated = 0

    for rec in recurrences:
        rec_id = rec["id"]
        type_rec = rec["type"]
        categorie = rec["categorie"]
        sous_cat = rec["sous_categorie"]
        montant = rec["montant"]
        date_debut_str = rec["date_debut"]
        date_fin_str = rec["date_fin"]
        frequence = rec["frequence"]
        description = rec["description"]
        prochaine_str = rec.get("prochaine_occurrence")

        try:
            date_debut = date.fromisoformat(date_debut_str[:10])
            date_fin_rec = date.fromisoformat(date_fin_str[:10]) if date_fin_str else None
            prochaine = date.fromisoformat(prochaine_str[:10]) if prochaine_str else date_debut
        except (ValueError, TypeError):
            continue

        if prochaine > today:
            continue

        if date_fin_rec and prochaine > date_fin_rec:
            await conn.execute(
                "UPDATE recurrences SET actif = 0 WHERE id = ?", (rec_id,)
            )
            deactivated += 1
            continue

        existing = await conn.fetch_one(
            """SELECT id FROM transactions
               WHERE categorie = ? AND sous_categorie = ? AND date = ?
                  AND source = 'récurrente_auto'""",
            (categorie, sous_cat or "", prochaine.isoformat()),
        )

        if not existing:
            await conn.execute(
                """INSERT INTO transactions
                   (type, categorie, sous_categorie, montant, date, source, description)
                   VALUES (?, ?, ?, ?, ?, 'récurrente_auto', ?)""",
                (
                    type_rec,
                    categorie,
                    sous_cat or "",
                    montant,
                    prochaine.isoformat(),
                    description or f"Récurrence {categorie}",
                ),
            )
            created += 1

        if frequence.lower() == "unique":
            await conn.execute(
                "UPDATE recurrences SET actif = 0 WHERE id = ?", (rec_id,)
            )
            deactivated += 1
        else:
            next_date = get_next_date(prochaine, frequence)
            if next_date <= prochaine:
                continue
            
            await conn.execute(
                "UPDATE recurrences SET prochaine_occurrence = ? WHERE id = ?",
                (next_date.isoformat(), rec_id),
            )
            updated += 1

    await conn.commit()
    close_connection(conn)

    result = {"created": created, "deactivated": deactivated, "updated": updated}
    logger.info(f"process_due_recurrences: {result}")
    return result


async def refresh_echeances() -> dict:
    """Rafraîchit les récurrences échues."""
    return await process_due_recurrences()
