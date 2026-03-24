// webapp/src/frontend/bridge/budget_store.ts
// Gestion centralisée de l'état des budgets
import { getBudgetsStatus, getBudgetsSummary, addBudget, updateBudget, deleteBudget } from "../api/budgets"
import type { BudgetStatus, BudgetSummary, Budget } from "../api/budgets"
import { sqlBridge } from "./sql_bridge"

type Listener = (statuses: BudgetStatus[], summary: BudgetSummary | null) => void

class BudgetStore {
    private budgetStatuses: BudgetStatus[] = []
    private budgetSummary: BudgetSummary | null = null
    
    private lastFetch: number = 0
    private listeners: Set<Listener> = new Set()
    
    private isFetching: boolean = false
    private fetchPromise: Promise<{statuses: BudgetStatus[], summary: BudgetSummary | null}> | null = null
    
    private isHydratedFromSql: boolean = false
    private needsPythonRefresh: boolean = true

    private currentYear: number = new Date().getFullYear()
    private currentMonth: number = new Date().getMonth() + 1

    private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

    subscribe(listener: Listener) {
        this.listeners.add(listener)
        if (this.budgetStatuses.length > 0) listener(this.budgetStatuses, this.budgetSummary)
        return () => this.listeners.delete(listener)
    }

    getStatuses() { return this.budgetStatuses }
    getSummary() { return this.budgetSummary }

    private setData(statuses: BudgetStatus[], summary: BudgetSummary | null) {
        this.budgetStatuses = statuses
        this.budgetSummary = summary
        this.lastFetch = Date.now()
        console.debug("[BudgetStore] setData called with", statuses.length, "budgets, notifying", this.listeners.size, "listeners")
        this.notify()
    }

    private notify() {
        console.debug("[BudgetStore] Notifying", this.listeners.size, "listeners with", this.budgetStatuses.length, "budgets")
        this.listeners.forEach(listener => listener(this.budgetStatuses, this.budgetSummary))
    }

    invalidate() {
        this.lastFetch = 0
        this.isHydratedFromSql = false
        this.needsPythonRefresh = true
    }

    setPeriod(year: number, month: number) {
        if (this.currentYear !== year || this.currentMonth !== month) {
            this.currentYear = year
            this.currentMonth = month
            this.invalidate()
        }
    }

    isCacheValid() {
        return this.budgetStatuses.length > 0 && (Date.now() - this.lastFetch < this.CACHE_TTL || this.isHydratedFromSql)
    }

    async fetchFromSql(): Promise<{statuses: BudgetStatus[], summary: BudgetSummary | null}> {
        if (this.isHydratedFromSql) {
            return { statuses: this.budgetStatuses, summary: this.budgetSummary }
        }

        console.info("[BudgetStore] Fetching from SQL fallback...")
        // Construct naive SQL fetch for Cold Start
        // We fetch budgets and we fetch transactions for the month, and join them manually
        
        const monthStr = this.currentMonth.toString().padStart(2, '0')
        const periodRegex = `${this.currentYear}-${monthStr}` // Pour SQL LIKE '2026-03-%'
        
        try {
            // We fetch all budgets and filter in JS to be resilient to missing 'actif' column
            // before migrations have run.
            const budgetsResult = await sqlBridge.execute("SELECT * FROM budgets")
            const txResult = await sqlBridge.execute(`SELECT categorie, SUM(montant) as total FROM transactions WHERE date LIKE '${periodRegex}%' AND type = 'dépense' GROUP BY categorie`)
            
            if (budgetsResult) {
                const budgets = (budgetsResult as any[]).filter(b => b.actif === undefined || b.actif === 1)
                const txSums = (txResult as any[]) || []
                
                const txMap = new Map<string, number>()
                txSums.forEach(t => txMap.set(t.categorie, t.total))

                let totalBugdet = 0
                let totalDepense = 0

                const statuses: BudgetStatus[] = budgets.map(b => {
                    const depense = txMap.get(b.categorie) || 0
                    const restant = b.montant_limite - depense
                    const depassement = restant < 0
                    const pourcentage = b.montant_limite > 0 ? (depense / b.montant_limite) * 100 : 0
                    
                    totalBugdet += b.montant_limite
                    totalDepense += depense

                    return {
                        id: b.id,
                        categorie: b.categorie,
                        montant_limite: b.montant_limite,
                        periode: b.periode,
                        compte_id: b.compte_id || 1,
                        date_debut: b.date_debut,
                        date_fin: b.date_fin,
                        alert_seuil: b.alert_seuil,
                        actif: b.actif,
                        depense,
                        restant,
                        depassement,
                        pourcentage
                    }
                })

                const summary: BudgetSummary = {
                    total_budget: totalBugdet,
                    total_depense: totalDepense,
                    total_restant: totalBugdet - totalDepense,
                    pourcentage_global: totalBugdet > 0 ? (totalDepense / totalBugdet) * 100 : 0,
                    depassement_global: totalDepense > totalBugdet
                }

                this.setData(statuses, summary)
                this.isHydratedFromSql = true
                return { statuses, summary }
            }
        } catch (e: any) {
            console.error("[BudgetStore] SQL fetch failed:", e)
        }
        
        return { statuses: this.budgetStatuses, summary: this.budgetSummary }
    }

    async fetchIfNeeded(): Promise<{statuses: BudgetStatus[], summary: BudgetSummary | null}> {
        if (this.budgetStatuses.length > 0 && !this.needsPythonRefresh && this.isCacheValid()) {
            return { statuses: this.budgetStatuses, summary: this.budgetSummary }
        }

        if (this.isFetching && this.fetchPromise) return this.fetchPromise

        this.isFetching = true
        this.fetchPromise = (async () => {
            try {
                // Etape 1 : Instant SQL
                const sqlData = await this.fetchFromSql()
                
                // Etape 2 : Python background pour la logique métier parfaite
                if (this.needsPythonRefresh) {
                    console.debug("[BudgetStore] Background Python sync starting...")
                    Promise.all([
                        getBudgetsStatus(this.currentYear, this.currentMonth),
                        getBudgetsSummary(this.currentYear, this.currentMonth)
                    ]).then(([statuses, summary]) => {
                        // The Python response takes priority if successful
                        if (statuses && statuses.length >= 0) {
                            this.setData(statuses, summary)
                            this.needsPythonRefresh = false
                            this.isHydratedFromSql = false
                        }
                    }).catch(err => console.warn("[BudgetStore] Python sync failed:", err))
                }

                this.needsPythonRefresh = false
                return sqlData
            } finally {
                this.isFetching = false
                this.fetchPromise = null
            }
        })()

        return this.fetchPromise
    }

    async addBudget(data: Partial<Budget>): Promise<number | null> {
        try {
            console.info("[BudgetStore] Adding budget...", data)
            const newId = await addBudget(data)
            console.debug("[BudgetStore] addBudget result:", newId)
            if (newId) {
                this.invalidate()
                console.debug("[BudgetStore] Calling fetchIfNeeded after invalidate...")
                await this.fetchIfNeeded()
                console.debug("[BudgetStore] fetchIfNeeded completed, listeners should be notified")
                return newId
            }
            return null
        } catch (err) {
            console.error("[BudgetStore] Failed to add budget:", err)
            return null
        }
    }

    async updateBudget(id: number, data: Partial<Budget>): Promise<boolean> {
        try {
            const success = await updateBudget(id, data)
            if (success) {
                this.invalidate()
                await this.fetchIfNeeded()
            }
            return success
        } catch (err) {
            console.error("[BudgetStore] Failed to update budget:", err)
            return false
        }
    }

    async deleteBudget(id: number): Promise<boolean> {
        try {
            const success = await deleteBudget(id)
            if (success) {
                this.invalidate()
                await this.fetchIfNeeded()
            }
            return success
        } catch (err) {
            console.error("[BudgetStore] Failed to delete budget:", err)
            return false
        }
    }
}

export const budgetStore = new BudgetStore()
