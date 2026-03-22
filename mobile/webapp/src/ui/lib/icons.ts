import {
    Laptop, Smartphone, Car, Plane, Home, Gamepad2,
    Heart, GraduationCap, Coffee, ShoppingBag, PiggyBank, Target,
} from "lucide-react"

export const OBJECTIF_TYPES = [
    { id: "laptop", icon: Laptop, label: "Informatique", placeholder: "Nouvel Ordinateur" },
    { id: "smartphone", icon: Smartphone, label: "Téléphone", placeholder: "Nouvel iPhone / Android" },
    { id: "car", icon: Car, label: "Transport / Voiture", placeholder: "Ma future voiture" },
    { id: "plane", icon: Plane, label: "Voyage", placeholder: "Mes vacances" },
    { id: "home", icon: Home, label: "Maison / Déco", placeholder: "Maison de rêve" },
    { id: "gamepad", icon: Gamepad2, label: "Loisir / Gaming", placeholder: "Console / Jeux" },
    { id: "heart", icon: Heart, label: "Santé / Bien-être", placeholder: "Cure / Spa" },
    { id: "education", icon: GraduationCap, label: "Études", placeholder: "Prépa / Formation" },
    { id: "coffee", icon: Coffee, label: "Petits plaisirs", placeholder: "Café / Sortie" },
    { id: "shopping", icon: ShoppingBag, label: "Shopping", placeholder: "Garde-robe" },
    { id: "piggy", icon: PiggyBank, label: "Épargne", placeholder: "Épargne de précaution" },
    { id: "target", icon: Target, label: "Autre / Projet", placeholder: "Mon projet" },
]

export const ICON_MAP: Record<string, any> = Object.fromEntries(
    OBJECTIF_TYPES.map((t) => [t.id, t.icon])
)
