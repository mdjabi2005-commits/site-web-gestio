// webapp/src/frontend/api/transaction_utils.ts
import { type Transaction as BackendTransaction } from "@/frontend/api/transactions"

/**
 * Normalise le type de transaction (dépense/revenu) en gérant les variations
 * de casse, d'accentuation et de langue.
 */
export function normalizeType(t: string): 'dépense' | 'revenu' {
    const s = String(t || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (s.includes('revenu') || s.includes('income')) return 'revenu';
    return 'dépense';
}

/**
 * Calcule les totaux mensuels et globaux à partir d'une liste de transactions.
 */
export function calculateMonthlySummary(transactions: BackendTransaction[], year: number, month: number) {
    if (!transactions || transactions.length === 0) {
        return { total_revenus: 0, total_depenses: 0, solde: 0, solde_global: 0 }
    }

    const filtered = transactions.filter(tx => {
        if (!tx.date) return false
        const parts = tx.date.split('-')
        if (parts.length < 2) return false
        const txYear = parseInt(parts[0], 10)
        const txMonth = parseInt(parts[1], 10)
        return txYear === year && txMonth === month
    })

    const sumBy = (txs: BackendTransaction[], type: string) => {
        const normalizedTarget = normalizeType(type);
        return txs
            .filter(tx => normalizeType(tx.type) === normalizedTarget)
            .reduce((sum, tx) => {
                const val = typeof tx.montant === 'number' ? tx.montant : parseFloat(tx.montant)
                return sum + (isNaN(val) ? 0 : val)
            }, 0)
    }

    const totalRevenus = sumBy(filtered, "revenu")
    const totalDepenses = sumBy(filtered, "dépense")
    const solde = totalRevenus - totalDepenses

    const globalRevenus = sumBy(transactions, 'revenu')
    const globalDepenses = sumBy(transactions, 'dépense')
    const soldeGlobal = globalRevenus - globalDepenses

    return {
        total_revenus: Math.round(totalRevenus * 100) / 100,
        total_depenses: Math.round(totalDepenses * 100) / 100,
        solde: Math.round(solde * 100) / 100,
        solde_global: Math.round(soldeGlobal * 100) / 100
    }
}
