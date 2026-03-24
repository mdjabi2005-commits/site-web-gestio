"""
Utilitaire de normalisation des données pour la base de données.
Permet d'uniformiser la casse des types et des catégories.
"""

import logging
from shared.database import get_db_connection, close_connection

logger = logging.getLogger(__name__)

async def normalize_transactions():
    """
    Parcourt les transactions et normalise :
    - type : minuscules (ex: Dépense -> dépense)
    - categorie : Title Case (ex: alimentation -> Alimentation)
    - sous_categorie : Title Case
    """
    conn = None
    try:
        conn = get_db_connection()
        
        # 1. Récupérer toutes les transactions qui ont besoin d'être normalisées
        # (On pourrait tout faire en SQL, mais passer par Python permet de réutiliser la logique de validation si besoin)
        rows = await conn.fetch_all("SELECT id, type, categorie, sous_categorie FROM transactions")
        
        count = 0
        for row in rows:
            tx_id = row['id']
            curr_type = str(row['type'] or "")
            curr_cat = str(row['categorie'] or "")
            curr_scat = str(row['sous_categorie'] or "")
            
            # Normalisation
            new_type = curr_type.strip().lower()
            new_cat = curr_cat.strip().capitalize()
            new_scat = curr_scat.strip().capitalize() if curr_scat else None
            
            # Si changement nécessaire
            if new_type != curr_type or new_cat != curr_cat or new_scat != curr_scat:
                await conn.execute(
                    "UPDATE transactions SET type = ?, categorie = ?, sous_categorie = ? WHERE id = ?",
                    (new_type, new_cat, new_scat, tx_id)
                )
                count += 1
        
        if count > 0:
            conn.commit()
            logger.info(f"✅ Normalisation terminée : {count} transactions mises à jour.")
        else:
            logger.info("ℹ️ Aucune transaction n'a nécessité de normalisation.")
            
        return count

    except Exception as e:
        logger.error(f"❌ Erreur lors de la normalisation : {e}")
        return -1
    finally:
        close_connection(conn)
