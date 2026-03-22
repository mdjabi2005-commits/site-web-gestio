// webapp/frontend/bridge/settings_store.ts
import { sqlBridge } from "./sql_bridge"

type Listener = (settings: Record<string, string>) => void

class SettingsStore {
    private settings: Record<string, string> = {}
    private listeners: Set<Listener> = new Set()
    private isHydrated: boolean = false
    private hydrationPromise: Promise<Record<string, string>> | null = null

    subscribe(listener: Listener) {
        this.listeners.add(listener)
        if (this.isHydrated) {
            listener(this.settings)
        }
        return () => this.listeners.delete(listener)
    }

    getSettings() {
        return this.settings
    }

    getSetting(key: string, defaultValue: string = "") {
        return this.settings[key] || defaultValue
    }
    
    invalidate() {
        this.isHydrated = false;
        this.hydrationPromise = null;
    }

    async hydrate(): Promise<Record<string, string>> {
        if (this.isHydrated) return this.settings
        if (this.hydrationPromise) return this.hydrationPromise

        this.hydrationPromise = (async () => {
            try {
                console.log("[SettingsStore] Hydrating from SQL...")
                const results = await sqlBridge.execute("SELECT key, value FROM app_settings") as { key: string, value: string }[]
                
                const newSettings: Record<string, string> = {}
                if (results && results.length > 0) {
                    results.forEach(row => {
                        newSettings[row.key] = row.value
                    })
                }
                
                this.settings = newSettings
                this.isHydrated = true
                this.notify()
                return this.settings
            } catch (e: any) {
                const msg = e?.message || String(e);
                if (msg.includes("no such table")) {
                    console.info("[SettingsStore] app_settings table missing, will re-hydrate later");
                } else {
                    console.warn("[SettingsStore] Hydration failed:", e);
                }
                return this.settings
            } finally {
                this.hydrationPromise = null
            }
        })()

        return this.hydrationPromise
    }

    async setSetting(key: string, value: string) {
        try {
            await sqlBridge.execute(
                "INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)",
                [key, value, new Date().toISOString()]
            )
            this.settings[key] = value
            this.notify()
        } catch (e) {
            console.error(`[SettingsStore] Failed to save setting ${key}:`, e)
            throw e
        }
    }

    private notify() {
        this.listeners.forEach(listener => listener(this.settings))
    }
}

export const settingsStore = new SettingsStore()
