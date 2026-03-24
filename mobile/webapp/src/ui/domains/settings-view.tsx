import { useEffect, useState } from "react"
import { debugLogger, type LogEntry } from "@/frontend/utils/debug-logger"
import { settingsStore } from "@/frontend/bridge/settings_store"
import { GroqSettings } from "../components/diagnostics/groq-settings"
import { SystemStatus } from "../components/diagnostics/system-status"
import { LogTerminal } from "../components/diagnostics/log-terminal"

export function SettingsView() {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [dbFiles] = useState<string[]>(["finances (IndexedDB)"])
    const [groqKey, setGroqKey] = useState<string>(settingsStore.getSetting("groq_api_key"))

    useEffect(() => {
        setLogs(debugLogger.getLogs())

        const fetchData = async () => {
            await settingsStore.hydrate()
            setGroqKey(settingsStore.getSetting("groq_api_key"))
        }

        fetchData()

        const unsubscribeLogs = debugLogger.subscribe(setLogs)
        const unsubscribeSettings = settingsStore.subscribe((s) => {
            setGroqKey(s["groq_api_key"] || "")
        })

        return () => {
            unsubscribeLogs()
            unsubscribeSettings()
        }
    }, [])

    return (
        <div className="flex flex-col gap-6 px-3 pt-6 pb-24">
            <header className="flex flex-col gap-1 text-center">
                <h1 className="text-2xl font-black tracking-tight text-foreground">Diagnostics</h1>
                <p className="text-xs text-muted-foreground">Outils de débogage pour la version mobile</p>
            </header>

            <GroqSettings initialKey={groqKey} />

            <SystemStatus isNative={false} dbFiles={dbFiles} />

            <LogTerminal logs={logs} />

            <section className="flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-muted/30 border border-border text-center">
                    <p className="text-[10px] text-muted-foreground">
                        Gestio V4 | Version 1.0.0-debug
                    </p>
                </div>
            </section>
        </div>
    )
}
