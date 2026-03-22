"""
Repository pour les pièces jointes des transactions.
"""

import logging
from typing import Optional, List

from shared.database import get_db_connection, close_connection
from .model_attachment import TransactionAttachment

logger = logging.getLogger(__name__)


class AttachmentRepository:

    def __init__(self):
        pass

    async def _fetch_all(self, query: str, params: tuple = ()) -> List[dict]:
        """Exécute une requête SELECT et retourne les résultats comme liste de dictionnaires."""
        conn = None
        try:
            conn = get_db_connection()
            return await conn.fetch_all(query, params)
        except Exception as e:
            logger.error(f"Erreur SQL: {e}")
            return []
        finally:
            close_connection(conn)

    async def get_all_attachments(self) -> List[dict]:
        """Récupère toutes les pièces jointes."""
        return await self._fetch_all("SELECT * FROM transaction_attachments ORDER BY upload_date DESC")


    async def add_attachment(self, attachment: TransactionAttachment) -> Optional[int]:
        conn = None
        try:
            conn = get_db_connection()
            await conn.execute(
                "INSERT INTO transaction_attachments (transaction_id, file_name, file_path, file_type, upload_date) "
                "VALUES (?, ?, ?, ?, ?)",
                (attachment.transaction_id, attachment.file_name, attachment.file_path,
                 attachment.file_type, attachment.upload_date.isoformat())
            )
            result = await conn.fetch_one("SELECT last_insert_rowid() as id")
            new_id = result["id"] if result else None
            conn.commit()
            return new_id
        except Exception as e:
            logger.error(f"Erreur add_attachment: {e}")
            return None
        finally:
            close_connection(conn)

    async def delete_attachment(self, attachment_id: int) -> bool:
        conn = None
        try:
            conn = get_db_connection()
            
            # 1. Obtenir le chemin du fichier avant suppression
            result = await conn.fetch_one("SELECT file_path FROM transaction_attachments WHERE id = ?", (attachment_id,))
            file_path = result["file_path"] if result else None
            
            # 2. Supprimer l'entrée en base
            await conn.execute("DELETE FROM transaction_attachments WHERE id = ?", (attachment_id,))
            # Impossible to trust cursor.rowcount using the JS bridge nicely, we assume success if no exception or file_path was found
            deleted = file_path is not None
            conn.commit()
            
            # 3. Supprimer le fichier physiquement (si l'entrée a bien été supprimée)
            if deleted and file_path:
                try:
                    import os
                    if os.path.exists(file_path):
                        os.remove(file_path)
                        logger.info(f"Fichier physique supprimé: {file_path}")
                except OSError as e:
                    logger.warning(f"Impossible de supprimer le fichier physique {file_path}: {e}")
                    
            return deleted
        except Exception as e:
            logger.error(f"Erreur delete_attachment: {e}")
            return False
        finally:
            close_connection(conn)


attachment_repository = AttachmentRepository()
