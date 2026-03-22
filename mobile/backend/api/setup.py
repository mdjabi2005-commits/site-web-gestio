"""
Initialisation du backend - PWA Version
Le schéma de base de données est créé côté JavaScript (sql.js).
Cette fonction est un no-op pour la compatibilité.
"""

import logging

logger = logging.getLogger(__name__)


async def initialize_backend():
    """
    PWA: Le schéma est créé par sql.js côté JavaScript.
    Cette fonction ne fait rien.
    """
    logger.info("Backend prêt (PWA - données gérées par sql.js)")
    return True
