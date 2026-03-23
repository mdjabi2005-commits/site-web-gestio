// webapp/frontend/bridge/sql_bridge.ts
// Bridge SQLite utilisant sql.js (WebAssembly) - persistence dans IndexedDB

import initSqlJs, { type Database } from "sql.js"

const DB_NAME = "finances"
const SQL_WASM_URL = "/mobile/sql-wasm.wasm"

class SqlBridge {
    private db: Database | null = null
    private isInitialized = false
    private initPromise: Promise<void> | null = null

    async init(): Promise<void> {
        if (this.isInitialized) return
        if (this.initPromise) return this.initPromise

        this.initPromise = (async () => {
            console.log("[SqlBridge] Starting sql.js initialization...")

            try {
                const SQL = await initSqlJs({
                    locateFile: () => SQL_WASM_URL,
                })

                const savedDb = await this.loadFromIndexedDB()
                if (savedDb) {
                    const uint8Array = new Uint8Array(savedDb)
                    this.db = new SQL.Database(uint8Array)
                    console.log("[SqlBridge] Database loaded from IndexedDB")
                } else {
                    this.db = new SQL.Database()
                    console.log("[SqlBridge] New database created")
                }

                const tables = this.db.exec("SELECT name FROM sqlite_master WHERE type='table'")
                console.log("[SqlBridge] Tables found:", tables.length > 0 ? tables[0].values.map((r) => r[0]).join(", ") : "none")

                if (!this.hasTable("transactions")) {
                    await this.createSchema()
                } else {
                    await this.runMigrations()
                }

                this.isInitialized = true
                console.log("[SqlBridge] Bridge initialization complete.")
            } catch (err) {
                console.error("[SqlBridge] Init failed:", err)
                this.initPromise = null
                throw err
            }
        })()

        return this.initPromise
    }

    private hasTable(name: string): boolean {
        if (!this.db) return false
        try {
            const result = this.db.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${name}'`)
            return result.length > 0 && result[0].values.length > 0
        } catch {
            return false
        }
    }

    private async createSchema(): Promise<void> {
        if (!this.db) return
        console.log("[SqlBridge] Creating database schema...")

        this.db.run(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                montant REAL NOT NULL,
                type TEXT NOT NULL,
                categorie TEXT,
                sous_categorie TEXT,
                description TEXT,
                date TEXT NOT NULL,
                compte_id INTEGER DEFAULT 1,
                recurrence_id INTEGER,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        `)

        this.db.run(`
            CREATE TABLE IF NOT EXISTS recurrences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL,
                montant REAL NOT NULL,
                type TEXT NOT NULL,
                categorie TEXT,
                sous_categorie TEXT,
                account_id INTEGER DEFAULT 1,
                frequence TEXT NOT NULL,
                jour INTEGER,
                date_debut TEXT NOT NULL,
                date_fin TEXT,
                actif INTEGER DEFAULT 1,
                statut TEXT DEFAULT 'Actif',
                prochaine_occurrence TEXT,
                description TEXT,
                transaction_id INTEGER,
                intervalle INTEGER,
                created_at TEXT DEFAULT (datetime('now'))
            )
        `)

        this.db.run(`
            CREATE TABLE IF NOT EXISTS budgets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                categorie TEXT NOT NULL,
                montant REAL NOT NULL,
                montant_limite REAL NOT NULL,
                periode TEXT NOT NULL DEFAULT 'monthly',
                account_id INTEGER DEFAULT 1,
                date_debut TEXT,
                date_fin TEXT,
                alert_seuil REAL,
                actif INTEGER DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now'))
            )
        `)

        this.db.run(`
            CREATE TABLE IF NOT EXISTS objectifs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL,
                montant_cible REAL NOT NULL,
                montant_actuel REAL DEFAULT 0,
                date_limite TEXT,
                compte_id INTEGER DEFAULT 1,
                icone TEXT DEFAULT 'target',
                couleur TEXT,
                statut TEXT DEFAULT 'En cours',
                progression_actuelle REAL DEFAULT 0,
                derniere_modification TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )
        `)

        this.db.run(`
            CREATE TABLE IF NOT EXISTS accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL,
                type TEXT NOT NULL DEFAULT 'compte_courant',
                solde_initial REAL DEFAULT 0,
                couleur TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )
        `)

        this.db.run(`INSERT INTO accounts (nom, type, solde_initial) VALUES ('Compte courant', 'compte_courant', 0)`)

        this.db.run(`
            CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        `)

        this.db.run(`
            CREATE TABLE IF NOT EXISTS vendor_cache (
                merchant TEXT PRIMARY KEY,
                categorie TEXT,
                sous_categorie TEXT
            )
        `)

        await this.saveToIndexedDB()
        console.log("[SqlBridge] Schema created successfully")
    }

    private async runMigrations(): Promise<void> {
        if (!this.db) return
        try {
            const columnsInfo = this.db.exec("PRAGMA table_info(transactions)")
            if (columnsInfo.length > 0 && columnsInfo[0].values) {
                const columns = columnsInfo[0].values.map((col: any) => col[1] as string)
                if (columns.includes("account_id") && !columns.includes("compte_id")) {
                    console.log("[SqlBridge] Migrating transactions.account_id to compte_id...")
                    this.db.run("ALTER TABLE transactions RENAME COLUMN account_id TO compte_id")
                    await this.saveToIndexedDB()
                }
            }
        } catch (e) {
            console.warn("[SqlBridge] Migration failed (ignored):", e)
        }
    }

    async execute(query: string, params: unknown[] = []): Promise<unknown[]> {
        if (!this.db) await this.init()
        if (!this.db) return []

        try {
            const isSelect = query.trim().toUpperCase().startsWith("SELECT")

            if (isSelect) {
                const result = this.db.exec(query, params as (string | number | null)[])
                if (result.length === 0) return []

                const columns = result[0].columns
                return result[0].values.map((row) => {
                    const obj: Record<string, unknown> = {}
                    columns.forEach((col, i) => {
                        obj[col] = row[i]
                    })
                    return obj
                })
            } else {
                this.db.run(query, params as (string | number | null)[])
                await this.saveToIndexedDB()
                return []
            }
        } catch (err) {
            console.error("[SqlBridge] Query error:", err)
            throw err
        }
    }

    async deleteDatabase(): Promise<void> {
        console.log("[SqlBridge] Deleting database...")
        if (this.db) {
            this.db.close()
            this.db = null
        }
        indexedDB.deleteDatabase(DB_NAME)
        this.isInitialized = false
        this.initPromise = null
    }

    async hasTables(): Promise<boolean> {
        if (!this.db) return false
        return this.hasTable("transactions")
    }

    async close(): Promise<void> {
        if (this.db) {
            await this.saveToIndexedDB()
            this.db.close()
            this.db = null
        }
    }

    private async saveToIndexedDB(): Promise<void> {
        if (!this.db) return
        const data = this.db.export()
        const buffer = new Uint8Array(data)
        await new Promise<void>((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1)
            request.onerror = () => reject(request.error)
            request.onsuccess = () => {
                const db = request.result
                const tx = db.transaction("data", "readwrite")
                const store = tx.objectStore("data")
                store.put(buffer, "db")
                tx.oncomplete = () => {
                    db.close()
                    resolve()
                }
                tx.onerror = () => reject(tx.error)
            }
            request.onupgradeneeded = () => {
                const db = request.result
                if (!db.objectStoreNames.contains("data")) {
                    db.createObjectStore("data")
                }
            }
        })
    }

    private async loadFromIndexedDB(): Promise<ArrayBuffer | null> {
        return new Promise((resolve) => {
            const request = indexedDB.open(DB_NAME, 1)
            request.onerror = () => resolve(null)
            request.onsuccess = () => {
                try {
                    const db = request.result
                    const tx = db.transaction("data", "readonly")
                    const store = tx.objectStore("data")
                    const getReq = store.get("db")
                    getReq.onsuccess = () => {
                        db.close()
                        resolve(getReq.result ? getReq.result.buffer : null)
                    }
                    getReq.onerror = () => resolve(null)
                } catch {
                    resolve(null)
                }
            }
            request.onupgradeneeded = () => {
                const db = request.result
                if (!db.objectStoreNames.contains("data")) {
                    db.createObjectStore("data")
                }
            }
        })
    }
}

export const sqlBridge = new SqlBridge()
