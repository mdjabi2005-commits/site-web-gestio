// webapp/src/frontend/bridge/transaction_store.ts
// Gestion centralisée de l'état des transactions
import { type Transaction as BackendTransaction, getTransactions as sqlGetTransactions } from "@/frontend/api/transactions"
import { sqlBridge } from "./sql_bridge"
import { calculateMonthlySummary } from "@/frontend/api/transaction_utils"

type Listener = (transactions: BackendTransaction[]) => void

class TransactionStore {
    private transactions: BackendTransaction[] = []
    private lastFetch: number = 0
    private listeners: Set<Listener> = new Set()
    private isFetching: boolean = false
    private fetchPromise: Promise<BackendTransaction[]> | null = null
    private isHydratedFromSql: boolean = false
    private isInitializingFromSql: boolean = false

    private readonly CACHE_TTL = 5 * 60 * 1000

    subscribe(listener: Listener) {
        this.listeners.add(listener)
        if (this.transactions.length > 0) listener(this.transactions)
        return () => this.listeners.delete(listener)
    }

    getTransactions() { return this.transactions }

    setTransactions(data: BackendTransaction[]) {
        this.transactions = data
        this.lastFetch = Date.now()
        this.notify()
    }

    private notify() {
        this.listeners.forEach(listener => listener(this.transactions))
    }

    invalidate() {
        this.lastFetch = 0
        this.isHydratedFromSql = false
    }

    isCacheValid() {
        return this.transactions.length > 0 && (Date.now() - this.lastFetch < this.CACHE_TTL || this.isHydratedFromSql)
    }

    async fetchFromSql(filters: { limit?: number, force?: boolean } = {}): Promise<BackendTransaction[]> {
        if ((this.isHydratedFromSql && !filters.force) || this.isInitializingFromSql) {
            return this.transactions
        }

        this.isInitializingFromSql = true
        console.info("[TransactionStore] Fetching from sql.js...")

        try {
            const results = await sqlGetTransactions()
            if (results) {
                this.setTransactions(results)
                this.isHydratedFromSql = true
                return results
            }
        } catch (e: any) {
            const msg = e?.message || String(e)
            if (msg.includes("no such table")) {
                console.info("[TransactionStore] Tables missing, waiting for schema init...")
            } else {
                console.error("[TransactionStore] SQL fetch failed:", e)
            }
        } finally {
            this.isInitializingFromSql = false
        }
        return this.transactions
    }

    async fetchIfNeeded(): Promise<BackendTransaction[]> {
        if (this.transactions.length > 0 && this.isCacheValid()) {
            return this.transactions
        }

        if (this.isFetching && this.fetchPromise) return this.fetchPromise

        this.isFetching = true
        this.fetchPromise = (async () => {
            try {
                return await this.fetchFromSql()
            } finally {
                this.isFetching = false
                this.fetchPromise = null
            }
        })()

        return this.fetchPromise
    }

    getMonthlySummary(year: number, month: number) {
        return calculateMonthlySummary(this.transactions, year, month)
    }

    updateLocal(updatedList: BackendTransaction[]) {
        this.transactions = updatedList
        this.notify()
    }

    async addTransaction(data: Partial<BackendTransaction>): Promise<number | null> {
        try {
            await sqlBridge.execute(
                "INSERT INTO transactions (montant, type, categorie, sous_categorie, description, date, source, recurrence, compte_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [data.montant, data.type, data.categorie, data.sous_categorie || null, data.description || null, data.date, data.source || "Manuel", data.recurrence || null, data.compte_id || 1]
            )
            this.isHydratedFromSql = false
            await this.fetchFromSql({ force: true })
            return null
        } catch (err) {
            console.error("[TransactionStore] Failed to add transaction:", err)
            return null
        }
    }
}

export const transactionStore = new TransactionStore()
