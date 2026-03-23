// Frontend API - Recurrences
// Appels directs à SQLite via sql.js

import { sqlBridge } from "../bridge/sql_bridge"
import { addDays, addMonths, addWeeks, addYears, format, parseISO } from "date-fns"

export interface Recurrence {
    id: number
    nom: string
    montant: number
    type: string
    categorie: string
    sous_categorie: string | null
    account_id: number
    frequence: string
    jour: number | null
    date_debut: string
    date_fin: string | null
    actif: number
    statut: string
    prochaine_occurrence: string | null
    description: string | null
    transaction_id: number | null
    created_at?: string
}

function getNextOccurrence(dateDebut: string, frequence: string, jour: number | null): string {
    const base = parseISO(dateDebut)
    const today = new Date()
    let next = base
    while (next <= today) {
        switch (frequence) {
            case "weekly": next = addWeeks(next, 1); break
            case "monthly": next = addMonths(next, 1); break
            case "yearly": next = addYears(next, 1); break
            default: next = addMonths(next, 1)
        }
    }
    if (jour !== null && jour > 0) {
        next = addDays(next.setDate(jour), 0)
    }
    return format(next, "yyyy-MM-dd")
}

export async function addRecurrence(data: Partial<Recurrence>): Promise<number | null> {
    await sqlBridge.execute(
        "INSERT INTO recurrences (nom, montant, type, categorie, sous_categorie, account_id, frequence, jour, date_debut, date_fin, actif) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [data.nom, data.montant, data.type || "dépense", data.categorie, data.sous_categorie, data.account_id || 1, data.frequence, data.jour, data.date_debut, data.date_fin, data.actif ?? 1]
    )
    return 1
}

export async function updateRecurrence(id: number, data: Partial<Recurrence>): Promise<boolean> {
    const fields = Object.entries(data).filter(([k]) => k !== "id").map(([k]) => `${k} = ?`)
    if (fields.length === 0) return false
    const values = Object.entries(data).filter(([k]) => k !== "id").map(([, v]) => v)
    await sqlBridge.execute(`UPDATE recurrences SET ${fields.join(", ")} WHERE id = ?`, [...values, id])
    return true
}

export async function deleteRecurrence(id: number): Promise<boolean> {
    await sqlBridge.execute("DELETE FROM recurrences WHERE id = ?", [id])
    return true
}

export async function backfillRecurrences(): Promise<number> {
    const recurrences = await sqlBridge.execute("SELECT * FROM recurrences WHERE actif = 1") as Recurrence[]
    let count = 0
    for (const r of recurrences) {
        const nextOcc = getNextOccurrence(r.date_debut, r.frequence, r.jour)
        await sqlBridge.execute(
            "INSERT INTO transactions (type, montant, categorie, sous_categorie, description, date, compte_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [r.type, r.montant, r.categorie, r.sous_categorie, r.nom, nextOcc, r.account_id]
        )
        count++
    }
    return count
}

export async function refreshEcheances(): Promise<boolean> {
    await backfillRecurrences()
    return true
}
