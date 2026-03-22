// webapp/src/ui/components/diagnostics/log-terminal.tsx
import { Terminal, Trash2 } from "lucide-react"
import { debugLogger, type LogEntry } from "@/frontend/utils/debug-logger"

interface LogTerminalProps {
    logs: LogEntry[]
}

export function LogTerminal({ logs }: LogTerminalProps) {
    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Journaux (Logs)</h2>
                <div className="flex items-center gap-1">
                    <button
                        onClick={async () => {
                            const md = debugLogger.formatLogsAsMarkdown()
                            if (navigator.share) {
                                try {
                                    await navigator.share({ title: 'Gestio Logs', text: md })
                                } catch (e) { console.error("Share failed", e) }
                            } else {
                                await navigator.clipboard.writeText(md)
                                alert("Logs copiés dans le presse-papier !")
                            }
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                        title="Exporter en Markdown"
                    >
                        <span className="text-[10px] font-bold mr-1">MD</span>
                        <Terminal className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => debugLogger.clearLogs()}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                        title="Effacer les logs"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <div className="bg-black/90 rounded-2xl border border-white/10 overflow-hidden flex flex-col h-[400px]">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-white/5">
                    <Terminal className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">Real-time Terminal</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] leading-relaxed flex flex-col gap-1">
                    {logs.length === 0 ? (
                        <p className="text-white/20 italic">Aucun log capturé...</p>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="flex gap-2 text-left">
                                <span className="text-white/30 shrink-0">[{log.timestamp}]</span>
                                <span className={
                                    log.level === 'error' ? 'text-rose-400' :
                                    log.level === 'warn' ? 'text-amber-400' :
                                    'text-emerald-400'
                                }>
                                    {log.message}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    )
}
