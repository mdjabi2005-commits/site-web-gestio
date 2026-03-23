// webapp/src/frontend/bridge/recurrence_store.ts
// Gestion centralisée de l'état des récurrences
import { addRecurrence, updateRecurrence, deleteRecurrence, refreshEcheances } from "../api/recurrences"
import type { Recurrence } from "../api/recurrences"
import { sqlBridge } from "./sql_bridge"

type Listener = (recurrences: Recurrence[]) => void

class RecurrenceStore {
    private recurrences: Recurrence[] = []
    private lastFetch: number = 0
    private listeners: Set<Listener> = new Set()
    private isFetching: boolean = false
    private fetchPromise: Promise<Recurrence[]> | null = null
    private isHydratedFromSql: boolean = false
    private needsPythonRefresh: boolean = true

    private readonly CACHE_TTL = 5 * 60 * 1000

    subscribe(listener: Listener) {
        this.listeners.add(listener)
        if (this.recurrences.length > 0) listener(this.recurrences)
        return () => this.listeners.delete(listener)
    }

    getRecurrences() { return this.recurrences }

    private setRecurrences(data: Recurrence[]) {
        this.recurrences = data
        this.lastFetch = Date.now()
        console.debug("[RecurrenceStore] setRecurrences called with", data.length, "items, notifying", this.listeners.size, "listeners")
        this.notify()
    }

    private notify() {
        console.debug("[RecurrenceStore] Notifying", this.listeners.size, "listeners with", this.recurrences.length, "recurrences")
        this.listeners.forEach(listener => listener(this.recurrences))
    }

    invalidate() {
        this.lastFetch = 0
        this.isHydratedFromSql = false
        this.needsPythonRefresh = true
    }

    isCacheValid() {
        return this.recurrences.length > 0 && (Date.now() - this.lastFetch < this.CACHE_TTL || this.isHydratedFromSql)
    }

    async fetchFromSql(): Promise<Recurrence[]> {
        if (this.isHydratedFromSql) return this.recurrences

        console.info("[RecurrenceStore] Fetching from SQL...")
        const query = `SELECT r.id, t.type, t.categorie, t.sous_categorie, t.montant, 
                              t.date as date_debut, r.date_fin, r.frequence, t.description, 
                              CASE WHEN r.actif = 1 THEN 'Actif' ELSE 'Inactif' END as statut,
                              r.prochaine_occurrence, r.intervalle, r.transaction_id
                       FROM recurrences r 
                       LEFT JOIN transactions t ON r.transaction_id = t.id 
                       ORDER BY r.prochaine_occurrence ASC`
        
        try {
            const results = await sqlBridge.execute(query)
            console.debug("[RecurrenceStore] SQL results count:", results?.length || 0)
            if (results) {
                const mapped = (results as any[]).map(r => ({
                    id: r.id,
                    type: String(r.type || '').toLowerCase().includes('revenu') ? 'revenu' : 'dépense',
                    categorie: r.categorie,
                    sous_categorie: r.sous_categorie,
                    montant: r.montant,
                    date_debut: r.date_debut,
                    date_fin: r.date_fin,
                    frequence: r.frequence,
                    description: r.description,
                    statut: r.statut,
                    prochaine_occurrence: r.prochaine_occurrence,
                    intervalle: r.intervalle,
                    transaction_id: r.transaction_id
                })) as any[]
                
                this.setRecurrences(mapped)
                this.isHydratedFromSql = true
                return mapped
            }
        } catch (e: any) {
            const msg = e?.message || String(e);
            if (msg.includes("no such table") || msg.includes("no such column")) {
                console.info("[RecurrenceStore] Tables missing or outdated schema, waiting for backend init...");
            } else {
                console.error("[RecurrenceStore] SQL fetch failed:", e)
            }
        }
        return this.recurrences
    }

    async fetchIfNeeded(): Promise<Recurrence[]> {
        if (this.recurrences.length > 0 && !this.needsPythonRefresh && this.isCacheValid()) {
            return this.recurrences
        }

        if (this.isFetching && this.fetchPromise) return this.fetchPromise

        this.isFetching = true
        this.fetchPromise = (async () => {
            try {
                const sqlData = await this.fetchFromSql()
                this.needsPythonRefresh = false
                return sqlData
            } finally {
                this.isFetching = false
                this.fetchPromise = null
            }
        })()

        return this.fetchPromise
    }

    async addRecurrence(data: Partial<Recurrence>): Promise<number | null> {
        try {
            console.info("[RecurrenceStore] Adding recurrence...", data)
            const newId = await addRecurrence(data)
            console.debug("[RecurrenceStore] addRecurrence result:", newId)
            if (newId) {
                this.invalidate()
                console.debug("[RecurrenceStore] Calling fetchIfNeeded after invalidate...")
                await this.fetchIfNeeded()
                console.debug("[RecurrenceStore] fetchIfNeeded completed, listeners should be notified")
                return newId
            }
            return null
        } catch (err) {
            console.error("[RecurrenceStore] Failed to add recurrence:", err)
            return null
        }
    }

    async updateRecurrence(id: number, data: Partial<Recurrence>): Promise<boolean> {
        try {
            const success = await updateRecurrence(id, data)
            if (success) {
                this.invalidate()
                await this.fetchIfNeeded()
            }
            return success
        } catch (err) {
            console.error("[RecurrenceStore] Failed to update recurrence:", err)
            return false
        }
    }

    async deleteRecurrence(id: number): Promise<boolean> {
        try {
            const success = await deleteRecurrence(id)
            if (success) {
                this.setRecurrences(this.recurrences.filter(r => r.id !== id))
                this.invalidate()
            }
            return success
        } catch (err) {
            console.error("[RecurrenceStore] Failed to delete recurrence:", err)
            return false
        }
    }

    async refreshEcheances(): Promise<boolean> {
        try {
            const success = await refreshEcheances()
            if (success) {
                // Notifier le store des transactions qu'il doit se rafraîchir
                const { transactionStore } = await import("./transaction_store")
                transactionStore.invalidate()
                transactionStore.fetchIfNeeded()
            }
            return success
        } catch (err) {
            console.error("[RecurrenceStore] Failed to refresh echeances:", err)
            return false
        }
    }
}

export const recurrenceStore = new RecurrenceStore()
