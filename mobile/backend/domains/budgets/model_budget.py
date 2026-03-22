"""
Modèle Budget
Compatible Pyodide (Pydantic v1).
"""

from datetime import date
from typing import Optional, Any

from pydantic import BaseModel, Field, validator


PERIODES = ["Mensuel", "Annuel", "Hebdomadaire"]


class Budget(BaseModel):
    id: Optional[int] = Field(None, description="ID unique du budget")
    categorie: str = Field(..., description="Catégorie du budget")
    montant_limite: float = Field(..., gt=0, description="Montant limite du budget")
    periode: str = Field(
        "Mensuel", description="Période (Mensuel, Annuel, Hebdomadaire)"
    )
    date_debut: str = Field(..., description="Date de début (ISO)")
    date_fin: Optional[str] = Field(
        None, description="Date de fin (ISO), peut être NULL"
    )
    alert_seuil: float = Field(80.0, ge=0, le=100, description="Seuil d'alerte en %")
    actif: int = Field(1, description="1 = actif, 0 = inactif")
    created_at: Optional[str] = Field(None, description="Date de création")

    @validator("categorie", pre=True)
    @classmethod
    def normalize_categorie(cls, v: Any) -> str:
        if not v or not str(v).strip():
            return "Autre"
        return str(v).strip().capitalize()

    @validator("periode", pre=True)
    @classmethod
    def normalize_periode(cls, v: Any) -> str:
        if not v or not str(v).strip():
            return "Mensuel"
        normalized = str(v).strip().capitalize()
        if normalized not in PERIODES:
            return "Mensuel"
        return normalized

    @validator("montant_limite", pre=True)
    @classmethod
    def normalize_montant(cls, v: Any) -> float:
        try:
            value = abs(float(v))
        except (ValueError, TypeError):
            raise ValueError(f"Montant invalide: {v!r}")
        return round(value, 2)

    @validator("alert_seuil", pre=True)
    @classmethod
    def normalize_seuil(cls, v: Any) -> float:
        try:
            value = float(v)
        except (ValueError, TypeError):
            return 80.0
        return max(0.0, min(100.0, value))

    @validator("date_fin", pre=True)
    @classmethod
    def empty_string_to_none(cls, v: Any) -> Optional[str]:
        if v is None or (isinstance(v, str) and not v.strip()):
            return None
        return str(v).strip()

    def to_db_dict(self) -> dict:
        return {
            "categorie": self.categorie,
            "montant_limite": self.montant_limite,
            "periode": self.periode,
            "date_debut": self.date_debut,
            "date_fin": self.date_fin,
            "alert_seuil": self.alert_seuil,
            "actif": self.actif,
        }

    class Config:
        json_schema_extra = {
            "example": {
                "categorie": "Alimentation",
                "montant_limite": 500.0,
                "periode": "Mensuel",
                "date_debut": "2026-03-01",
                "date_fin": None,
                "alert_seuil": 80.0,
            }
        }
