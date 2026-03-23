// webapp/src/frontend/bridge/objectif_store.ts
import { getObjectifs, addObjectif, updateObjectif, deleteObjectif, refreshObjectifs } from "../api/objectifs"
import { sqlBridge } from "./sql_bridge"
import type { Objectif } from "../api/objectifs"

type Listener = (objectifs: Objectif[]) => void

class ObjectifStore {
    private objectifs: Objectif[] = []

    private lastFetch: number = 0
    private listeners: Set<Listener> = new Set()

    private isFetching: boolean = false
    private fetchPromise: Promise<Objectif[]> | null = null

    private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

    subscribe(listener: Listener) {
        this.listeners.add(listener)
        if (this.objectifs.length > 0) listener(this.objectifs)
        return () => { this.listeners.delete(listener) }
    }

    get() { return this.objectifs }

    private setData(objectifs: Objectif[]) {
        this.objectifs = objectifs
        this.lastFetch = Date.now()
        console.debug("[ObjectifStore] setData called with", objectifs.length, "objectifs, notifying", this.listeners.size, "listeners")
        this.notify()
    }

    private notify() {
        console.debug("[ObjectifStore] Notifying", this.listeners.size, "listeners with", this.objectifs.length, "objectifs")
        this.listeners.forEach(listener => listener(this.objectifs))
    }

    invalidate() {
        this.lastFetch = 0
    }

    isCacheValid() {
        return this.objectifs.length > 0 && Date.now() - this.lastFetch < this.CACHE_TTL
    }

    async fetchFromSql(): Promise<Objectif[]> {
        try {
            const rows = await sqlBridge.execute("SELECT * FROM objectifs") as any[]
            return rows.map(row => ({
                id: row.id,
                nom: row.nom || row.titre || "Sans nom",
                montant_cible: row.montant_cible || 0,
                montant_actuel: row.montant_actuel || 0,
                compte_id: row.compte_id || 1,
                icone: row.icone || "target",
                couleur: row.couleur || null,
                date_limite: row.date_limite || null,
                progression_actuelle: row.progression_actuelle || 0,
                statut: row.statut || "En cours",
                created_at: row.created_at || row.date_creation || null,
                derniere_modification: row.derniere_modification || row.date_modification || null,
            }))
        } catch (e) {
            console.error("[ObjectifStore] SQL fetch failed:", e)
            return []
        }
    }

    async fetchIfNeeded(): Promise<Objectif[]> {
        if (this.isCacheValid()) {
            return this.objectifs
        }

        if (this.isFetching && this.fetchPromise) return this.fetchPromise

        this.isFetching = true
        this.fetchPromise = (async () => {
            try {
                // Phase 1: Lecture SQL instantanée
                const sqlData = await this.fetchFromSql()
                this.setData(sqlData)

                // Phase 2: Python background pour refresh progression
                try {
                    const pythonData = await getObjectifs()
                    if (pythonData.length >= 0) {
                        this.setData(pythonData)
                    }
                } catch (err) {
                    console.warn("[ObjectifStore] Python sync failed (data from SQL):", err)
                }

                return this.objectifs
            } finally {
                this.isFetching = false
                this.fetchPromise = null
            }
        })()

        return this.fetchPromise
    }

    async addObjectif(data: Partial<Objectif>): Promise<number | null> {
        try {
            console.info("[ObjectifStore] Adding objectif...", data)
            const newId = await addObjectif(data)
            console.debug("[ObjectifStore] addObjectif result:", newId)
            if (newId) {
                this.invalidate()
                console.debug("[ObjectifStore] Calling fetchFromSql after invalidate...")
                const data = await this.fetchFromSql()
                this.setData(data)
                console.debug("[ObjectifStore] fetchFromSql completed, setData called with", data.length, "items")
                return newId
            }
            return null
        } catch (err) {
            console.error("[ObjectifStore] Failed to add:", err)
            return null
        }
    }

    async updateObjectif(id: number, data: Partial<Objectif>): Promise<boolean> {
        try {
            const success = await updateObjectif(id, data)
            if (success) {
                this.invalidate()
                const sqlData = await this.fetchFromSql()
                this.setData(sqlData)
            }
            return success
        } catch (err) {
            console.error("[ObjectifStore] Failed to update:", err)
            return false
        }
    }

    async deleteObjectif(id: number): Promise<boolean> {
        try {
            const success = await deleteObjectif(id)
            if (success) {
                this.invalidate()
                const sqlData = await this.fetchFromSql()
                this.setData(sqlData)
            }
            return success
        } catch (err) {
            console.error("[ObjectifStore] Failed to delete:", err)
            return false
        }
    }

    async refreshObjectifs(): Promise<{ updated: number; reached: number; abandoned: number }> {
        try {
            const res = await refreshObjectifs()
            this.invalidate()
            const sqlData = await this.fetchFromSql()
            this.setData(sqlData)
            return res
        } catch (err) {
            console.error("[ObjectifStore] Refresh failed:", err)
            return { updated: 0, reached: 0, abandoned: 0 }
        }
    }
}

export const objectifStore = new ObjectifStore()
