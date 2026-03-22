// Frontend API - Budgets
// Appels directs à SQLite via sql.js

import { sqlBridge } from "../bridge/sql_bridge"

export interface Budget {
    id: number
    categorie: string
    montant_limite: number
    periode: string
    account_id: number
    date_debut?: string
    date_fin?: string | null
    alert_seuil?: number | null
    actif?: number
    created_at?: string
}

export interface BudgetStatus extends Budget {
    depense: number
    restant: number
    depassement: boolean
    pourcentage: number
}

export interface BudgetSummary {
    total_budget: number
    total_depense: number
    total_restant: number
    pourcentage_global: number
    depassement_global: boolean
}

export async function getBudgets(): Promise<Budget[]> {
    const results = await sqlBridge.execute("SELECT * FROM budgets WHERE 1=1")
    return results as Budget[]
}

export async function addBudget(data: Partial<Budget>): Promise<number | null> {
    await sqlBridge.execute(
        "INSERT INTO budgets (categorie, montant, montant_limite, periode, account_id, date_debut, date_fin, alert_seuil, actif) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [data.categorie, data.montant_limite, data.montant_limite, data.periode || "monthly", data.account_id || 1, data.date_debut || null, data.date_fin || null, data.alert_seuil || null, data.actif ?? 1]
    )
    const all = await sqlBridge.execute("SELECT last_insert_rowid() as id", [])
    return Number((all as Record<string, unknown>[])[0]?.id) || null
}

export async function updateBudget(id: number, data: Partial<Budget>): Promise<boolean> {
    const fields = Object.entries(data).filter(([k]) => k !== "id").map(([k]) => `${k} = ?`)
    if (fields.length === 0) return false
    const values = Object.entries(data).filter(([k]) => k !== "id").map(([, v]) => v)
    await sqlBridge.execute(`UPDATE budgets SET ${fields.join(", ")} WHERE id = ?`, [...values, id])
    return true
}

export async function deleteBudget(id: number): Promise<boolean> {
    await sqlBridge.execute("DELETE FROM budgets WHERE id = ?", [id])
    return true
}

export async function getBudgetsStatus(annee: number, mois: number): Promise<BudgetStatus[]> {
    const budgets = await getBudgets()
    const startDate = `${annee}-${String(mois).padStart(2, "0")}-01`
    const endDate = `${annee}-${String(mois).padStart(2, "0")}-31`

    const statuses: BudgetStatus[] = []
    for (const b of budgets) {
        const spent = await sqlBridge.execute(
            "SELECT COALESCE(SUM(montant), 0) as total FROM transactions WHERE categorie = ? AND type = 'dépense' AND date >= ? AND date <= ?",
            [b.categorie, startDate, endDate]
        )
        const totalSpent = Number((spent as Record<string, unknown>[])[0]?.total || 0)
        const restant = b.montant_limite - totalSpent
        statuses.push({
            ...b,
            depense: totalSpent,
            restant,
            depassement: totalSpent > b.montant_limite,
            pourcentage: b.montant_limite > 0 ? Math.round((totalSpent / b.montant_limite) * 100) : 0,
        })
    }
    return statuses
}

export async function getBudgetsSummary(annee: number, mois: number): Promise<BudgetSummary | null> {
    const statuses = await getBudgetsStatus(annee, mois)
    if (statuses.length === 0) return null
    const totalBudget = statuses.reduce((sum, b) => sum + b.montant_limite, 0)
    const totalDepense = statuses.reduce((sum, b) => sum + b.depense, 0)
    return {
        total_budget: totalBudget,
        total_depense: totalDepense,
        total_restant: totalBudget - totalDepense,
        pourcentage_global: totalBudget > 0 ? Math.round((totalDepense / totalBudget) * 100) : 0,
        depassement_global: totalDepense > totalBudget,
    }
}
