// webapp/frontend/utils/debug-logger.ts
// Task List:
// - [x] Script Python cross-platform générant `backend.zip` avec des "/"
// - [x] Ajout d'un scan de tous les noms de fichiers possibles (`finances.db`, `finance.sqlite`, etc.)
// - [x] Logs exhaustifs du contenu du dossier de données Capacitor
// - [/] Vérification de la connexion réelle (À tester par l'utilisateur)
// - [ ] Connexion complète des vues Accueil et Transactions aux données réelles (Prochaines étapes)

type LogLevel = "info" | "warn" | "error" | "debug"

interface LogEntry {
    timestamp: string
    level: LogLevel
    message: string
}

class DebugLogger {
    private logs: LogEntry[] = []
    private maxLogs = 200
    private listeners: ((logs: LogEntry[]) => void)[] = []

    constructor() {
        this.interceptConsole()
    }

    private interceptConsole() {
        const originalLog = console.log
        const originalWarn = console.warn
        const originalError = console.error

        console.log = (...args: any[]) => {
            originalLog.apply(console, args)
            this.addLog("info", args.map(String).join(" "))
        }

        console.warn = (...args: any[]) => {
            originalWarn.apply(console, args)
            this.addLog("warn", args.map(String).join(" "))
        }

        console.error = (...args: any[]) => {
            originalError.apply(console, args)
            this.addLog("error", args.map(String).join(" "))
        }
    }

    private addLog(level: LogLevel, message: string) {
        const entry: LogEntry = {
            timestamp: new Date().toLocaleTimeString(),
            level,
            message
        }

        this.logs = [entry, ...this.logs].slice(0, this.maxLogs)
        this.notify()
    }

    info(message: string) {
        this.addLog("info", message)
    }

    warn(message: string) {
        this.addLog("warn", message)
    }

    error(message: string) {
        this.addLog("error", message)
    }

    getLogs(): LogEntry[] {
        return this.logs
    }

    clearLogs() {
        this.logs = []
        this.notify()
    }

    subscribe(listener: (logs: LogEntry[]) => void) {
        this.listeners.push(listener)
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener)
        }
    }

    private notify() {
        this.listeners.forEach(l => l(this.logs))
    }

    formatLogsAsMarkdown(): string {
        const header = `# Gestio Mobile Debug Logs\n` +
            `Generated: ${new Date().toLocaleString()}\n` +
            `Total: ${this.logs.length} entries\n\n` +
            `| Timestamp | Level | Message |\n` +
            `|-----------|-------|---------|\n`

        const body = this.logs
            .map(log => `| ${log.timestamp} | ${log.level.toUpperCase()} | ${log.message} |`)
            .join("\n")

        return header + body
    }
}

export const debugLogger = new DebugLogger()
export type { LogEntry, LogLevel }
