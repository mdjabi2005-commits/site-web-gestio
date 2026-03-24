"""
Modèle Objectif
Compatible Pyodide (Pydantic v1).
"""

from typing import Optional, Any

from pydantic import BaseModel, Field, validator


STATUTS = ["En cours", "Atteint", "Abandonné"]


class Objectif(BaseModel):
    id: Optional[int] = Field(None, description="ID unique de l'objectif")
    nom: str = Field(..., description="Nom de l'objectif")
    montant_cible: float = Field(..., gt=0, description="Montant cible à atteindre")
    icone: Optional[str] = Field(None, description="Icône (ex: Car, Home, PiggyBank)")
    couleur: Optional[str] = Field(None, description="Couleur hex (ex: #10B981)")
    date_limite: Optional[str] = Field(None, description="Date limite (ISO)")
    progression_actuelle: float = Field(0.0, ge=0, description="Progression actuelle")
    statut: str = Field("En cours", description="Statut (En cours, Atteint, Abandonné)")
    created_at: Optional[str] = Field(None, description="Date de création")
    derniere_modification: Optional[str] = Field(
        None, description="Date de dernière modification auto"
    )

    @validator("nom", pre=True)
    @classmethod
    def normalize_nom(cls, v: Any) -> str:
        if not v or not str(v).strip():
            return "Objectif sans nom"
        return str(v).strip()

    @validator("montant_cible", pre=True)
    @classmethod
    def normalize_montant(cls, v: Any) -> float:
        try:
            value = abs(float(v))
        except (ValueError, TypeError):
            raise ValueError(f"Montant invalide: {v!r}")
        return round(value, 2)

    @validator("progression_actuelle", pre=True)
    @classmethod
    def normalize_progression(cls, v: Any) -> float:
        try:
            value = float(v)
        except (ValueError, TypeError):
            return 0.0
        return max(0.0, round(value, 2))

    @validator("statut", pre=True)
    @classmethod
    def normalize_statut(cls, v: Any) -> str:
        if not v or not str(v).strip():
            return "En cours"
        normalized = str(v).strip()
        if normalized not in STATUTS:
            return "En cours"
        return normalized

    @validator("date_limite", pre=True)
    @classmethod
    def empty_string_to_none(cls, v: Any) -> Optional[str]:
        if v is None or (isinstance(v, str) and not v.strip()):
            return None
        return str(v).strip()

    def to_db_dict(self) -> dict:
        return {
            "nom": self.nom,
            "montant_cible": self.montant_cible,
            "icone": self.icone,
            "couleur": self.couleur,
            "date_limite": self.date_limite,
            "progression_actuelle": self.progression_actuelle,
            "statut": self.statut,
            "derniere_modification": self.derniere_modification,
        }

    class Config:
        json_schema_extra = {
            "example": {
                "nom": "Vacances d'été",
                "montant_cible": 2000.0,
                "icone": "PiggyBank",
                "couleur": "#10B981",
                "date_limite": "2026-08-01",
                "progression_actuelle": 450.0,
                "statut": "En cours",
            }
        }
