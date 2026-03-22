// webapp/src/ui/components/diagnostics/system-status.tsx
import { Database, FileCode } from "lucide-react"

interface SystemStatusProps {
    isNative: boolean
    dbFiles: string[]
}

export function SystemStatus({ isNative, dbFiles }: SystemStatusProps) {
    return (
        <>
            <section className="flex flex-col gap-3 text-left">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">État Système</h2>
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-2xl bg-card border border-border flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">Plateforme</span>
                        <span className="text-sm font-bold">{isNative ? "📱 Native" : "🌐 Web / Dev"}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-card border border-border flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Database className="w-3 h-3 text-primary" />
                            <span className="text-[10px] text-muted-foreground font-medium uppercase">Base ciblée</span>
                        </div>
                        <span className="text-sm font-bold leading-none mt-1">finances</span>
                        <span className="text-[8px] text-muted-foreground italic">(financesSQLite.db)</span>
                    </div>
                </div>
            </section>

            <section className="flex flex-col gap-3 text-left">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Fichiers SQLite</h2>
                <div className="flex flex-col gap-2">
                    {dbFiles.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-muted/20 border border-dashed border-border text-center">
                            <p className="text-[10px] text-muted-foreground italic">Aucun fichier détecté</p>
                        </div>
                    ) : (
                        dbFiles.map((file, i) => (
                            <div key={i} className="p-3 rounded-2xl bg-card border border-border flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10">
                                    <FileCode className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-mono font-bold tracking-tight">{file}</span>
                                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">Capacitor Auto-gen</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </>
    )
}
