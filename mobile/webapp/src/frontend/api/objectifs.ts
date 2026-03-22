// Frontend API - Objectifs
// Appels directs à SQLite via sql.js

import { sqlBridge } from "../bridge/sql_bridge"

export interface Objectif {
    id: number
    nom: string
    montant_cible: number
    montant_actuel: number
    date_limite: string | null
    compte_id: number
    icone?: string
    couleur?: string | null
    statut?: string
    progression_actuelle?: number
    derniere_modification?: string | null
    created_at?: string
}

export async function refreshObjectifs(): Promise<{ updated: number; reached: number; abandoned: number }> {
    const objectifs = await getObjectifs()
    let reached = 0, abandoned = 0
    for (const obj of objectifs) {
        const transactions = await sqlBridge.execute(
            "SELECT COALESCE(SUM(montant), 0) as total FROM transactions WHERE description LIKE ? AND type = 'revenu'",
            [`%${obj.nom}%`]
        )
        const total = Number((transactions as Record<string, unknown>[])[0]?.total || 0)
        const statut = total >= obj.montant_cible ? "Atteint" : "En cours"
        if (statut === "Atteint" && obj.montant_actuel < obj.montant_cible) reached++
        if (obj.date_limite && new Date(obj.date_limite) < new Date() && total < obj.montant_cible) abandoned++
        await sqlBridge.execute(
            "UPDATE objectifs SET montant_actuel = ?, statut = ? WHERE id = ?",
            [total, statut, obj.id]
        )
    }
    return { updated: objectifs.length, reached, abandoned }
}

export async function getObjectifs(): Promise<Objectif[]> {
    const results = await sqlBridge.execute("SELECT * FROM objectifs WHERE 1=1")
    return results as Objectif[]
}

export async function addObjectif(data: Partial<Objectif>): Promise<number | null> {
    await sqlBridge.execute(
        "INSERT INTO objectifs (nom, montant_cible, montant_actuel, date_limite, compte_id) VALUES (?, ?, ?, ?, ?)",
        [data.nom, data.montant_cible, data.montant_actuel || 0, data.date_limite, data.compte_id || 1]
    )
    const all = await sqlBridge.execute("SELECT last_insert_rowid() as id", [])
    return Number((all as Record<string, unknown>[])[0]?.id) || null
}

export async function updateObjectif(id: number, data: Partial<Objectif>): Promise<boolean> {
    const fields = Object.entries(data).filter(([k]) => k !== "id").map(([k]) => `${k} = ?`)
    if (fields.length === 0) return false
    const values = Object.entries(data).filter(([k]) => k !== "id").map(([, v]) => v)
    await sqlBridge.execute(`UPDATE objectifs SET ${fields.join(", ")} WHERE id = ?`, [...values, id])
    return true
}

export async function deleteObjectif(id: number): Promise<boolean> {
    await sqlBridge.execute("DELETE FROM objectifs WHERE id = ?", [id])
    return true
}
