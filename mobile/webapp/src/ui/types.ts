// shared/ui/types.ts
// Types et utilitaires partag├®s entre les domaines

import React from "react"

export type TabId = "home" | "transactions" | "budgets" | "echeances" | "objectifs" | "comptes" | "scan" | "settings" | "analytics"

export interface Transaction {
    id: string
    name: string
    label: string
    category: string
    parentCategory: string
    icon: React.ElementType
    amount: number
    date: string
    type: "revenu" | "dépense"
}

export function fmt(amount: number, decimals = 2) {
    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(amount)
}
export interface TransactionJS {
    id: string
    montant: number
    categorie: string
    type: string
}


