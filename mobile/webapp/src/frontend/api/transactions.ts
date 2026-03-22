// Frontend API - Transactions
// Appels directs à SQLite via sql.js

import { sqlBridge } from "../bridge/sql_bridge"

export interface Transaction {
    id: number
    type: "dépense" | "revenu"
    categorie: string
    sous_categorie: string | null
    description: string | null
    montant: number
    date: string
    source: string
    recurrence: string | null
    date_fin: string | null
    compte_id: number | null
    external_id: string | null
}

export interface TransactionFilters {
    start_date?: string
    end_date?: string
    category?: string
}

export interface MonthlySummary {
    total_revenus: number
    total_depenses: number
    solde: number
}

export async function getTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
    let query = "SELECT * FROM transactions WHERE 1=1"
    const params: unknown[] = []

    if (filters.start_date) {
        query += " AND date >= ?"
        params.push(filters.start_date)
    }
    if (filters.end_date) {
        query += " AND date <= ?"
        params.push(filters.end_date)
    }
    if (filters.category) {
        query += " AND categorie = ?"
        params.push(filters.category)
    }

    query += " ORDER BY date DESC LIMIT 100"

    const results = await sqlBridge.execute(query, params)
    return (results as Record<string, unknown>[]).map((r) => ({
        ...r,
        type: String(r.type || "").toLowerCase().includes("revenu") ? "revenu" : "dépense",
    })) as Transaction[]
}

export async function addTransaction(data: Partial<Transaction>): Promise<number | null> {
    const fields = ["montant", "type", "categorie", "sous_categorie", "description", "date", "compte_id", "recurrence_id"]
    const placeholders = fields.map(() => "?").join(", ")
    const values = fields.map((f) => (data as Record<string, unknown>)[f] ?? null)

    const result = await sqlBridge.execute(
        `INSERT INTO transactions (${fields.join(", ")}) VALUES (${placeholders})`,
        values
    )
    if (result && (result as Record<string, unknown>[]).length > 0) {
        return Number((result as Record<string, unknown>[])[0].id) || null
    }
    const all = await sqlBridge.execute("SELECT last_insert_rowid() as id", [])
    return Number((all as Record<string, unknown>[])[0]?.id) || null
}

export async function updateTransaction(txId: number, data: Partial<Transaction>): Promise<boolean> {
    const updates: string[] = []
    const values: unknown[] = []

    for (const [key, value] of Object.entries(data)) {
        if (key !== "id") {
            updates.push(`${key} = ?`)
            values.push(value)
        }
    }

    if (updates.length === 0) return false
    values.push(txId)

    await sqlBridge.execute(
        `UPDATE transactions SET ${updates.join(", ")}, updated_at = datetime('now') WHERE id = ?`,
        values
    )
    return true
}

export async function deleteTransaction(txId: number): Promise<boolean> {
    await sqlBridge.execute("DELETE FROM transactions WHERE id = ?", [txId])
    return true
}

export async function getStructuredCategories(): Promise<Record<string, string[]>> {
    return {
        "Alimentation": ["Supermarché", "Restaurant", "Café", "Fast-food"],
        "Transport": ["Carburant", "Métro/Bus", "Taxi", "Parking", "Essence"],
        "Loisirs": ["Cinéma", "Sport", "Jeux", "Musique", "Lecture"],
        "Santé": ["Pharmacie", "Médecin", "Opticien", "Dentiste"],
        "Logement": ["Loyer", "Électricité", "Eau", "Internet", "Assurance"],
        "Shopping": ["Vêtements", "Électronique", "Décoration"],
        "Revenus": ["Salaire", "Freelance", "Investissement", "Remboursement"],
        "Divers": ["Autre"],
    }
}
