// webapp/src/ui/components/diagnostics/groq-settings.tsx
import { useState } from "react"
import { Key } from "lucide-react"
import { settingsStore } from "@/frontend/bridge/settings_store"
import { toast } from "sonner" // Supposant que sonner est dispo, sinon on utilisera alert

interface GroqSettingsProps {
    initialKey: string
}

export function GroqSettings({ initialKey }: GroqSettingsProps) {
    const [groqKey, setGroqKey] = useState(initialKey)
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await settingsStore.setSetting("groq_api_key", groqKey)
            toast?.success ? toast.success("Configuration Groq enregistrée !") : alert("Configuration Groq enregistrée !")
        } catch (e) {
            console.error("Save failed", e)
            alert("Erreur lors de l'enregistrement")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Composants IA</h2>
            <div className="p-4 rounded-3xl bg-card border border-border flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-primary" />
                        <label className="text-xs font-bold uppercase tracking-wide">Clé API Groq</label>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Nécessaire pour l'OCR intelligent et la catégorisation automatique.
                    </p>
                    <input
                        type="password"
                        value={groqKey}
                        onChange={(e) => setGroqKey(e.target.value)}
                        placeholder="gsk_..."
                        className="bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {isSaving ? "Enregistrement..." : "Sauvegarder"}
                </button>
            </div>
        </section>
    )
}
