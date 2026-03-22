"""
Transaction Service
Gère la logique métier et les requêtes complexes pour les transactions.
Délègue toute la persistance au Repository.

Convention : toutes les clés sont en FRANÇAIS (FR) — pas de mapping FR↔EN dans ce service.
Les colonnes retournées correspondent exactement au modèle Transaction.
"""

import logging
from datetime import date
from typing import Optional, Union, List

from ..database.model import Transaction
from ..database.repository import transaction_repository

logger = logging.getLogger(__name__)


class TransactionService:
    """
    Service couche métier pour les transactions.
    Point d'entrée unique pour toutes les opérations — les pages UI ne doivent
    jamais appeler le repository directement.
    """

    def __init__(self):
        self.repository = transaction_repository

    # LECTURE (Supprimée car gérée par le SQL Bridge au front)
    # ----------------------------------------------------------





    # ----------------------------------------------------------
    # ÉCRITURE
    # ----------------------------------------------------------

    async def add(self, transaction: Union[Transaction, dict]) -> Optional[int]:
        """
        Ajoute une nouvelle transaction.

        Args:
            transaction: Objet Transaction (Pydantic) ou dict avec clés FR.

        Returns:
            ID de la nouvelle transaction, ou None en cas d'erreur.
        """
        try:
            new_id = await self.repository.add(transaction)
            if new_id:
                logger.info(f"TransactionService: transaction ajoutée ID={new_id}")
            return new_id
        except Exception as e:
            logger.error(f"Erreur TransactionService.add: {e}")
            return None

    async def update(self, transaction: dict) -> bool:
        """
        Met à jour une transaction existante.

        Args:
            transaction: Dict avec clés FR, doit contenir 'id'.

        Returns:
            True si succès, False sinon.
        """
        try:
            return await self.repository.update(transaction)
        except Exception as e:
            logger.error(f"Erreur TransactionService.update: {e}")
            return False

    async def delete(self, transaction_id: Union[int, List[int]]) -> bool:
        """
        Supprime une ou plusieurs transactions en base de données.
        Les entrées transaction_attachments sont retirées automatiquement via FK ON DELETE CASCADE.
        Les fichiers physiques ne sont PAS supprimés ici — c'est à l'UI de demander confirmation.

        Args:
            transaction_id: Un seul ID ou une liste d'IDs.
        """
        try:
            return await self.repository.delete(transaction_id)

        except Exception as e:
            logger.error(f"Erreur TransactionService.delete: {e}")
            return False



# Instance singleton
transaction_service = TransactionService()
