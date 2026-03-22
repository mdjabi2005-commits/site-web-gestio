import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, Target } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/ui/components/ui/input"
import { Button } from "@/ui/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/components/ui/select"
import { useObjectifs } from "@/frontend/hooks/useObjectifs"
import { OBJECTIF_TYPES } from "@/ui/lib/icons"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    titre: z.string().min(1, "Titre requis"),
    montant_cible: z.number().positive("Montant requis"),
    icone: z.string().min(1, "Icône requise"),
    date_cible: z.string().min(10, "Date requise"),
})

type FormData = z.infer<typeof formSchema>

interface QuickObjectifNotifProps {
    open?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export function QuickObjectifNotif({ open, onConfirm, onCancel }: QuickObjectifNotifProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { addObjectif } = useObjectifs()

    const isVisible = open === true

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: { titre: "", montant_cible: 0, icone: "target", date_cible: new Date().toISOString().split("T")[0] },
    })

    const watchIcon = form.watch("icone")

    useEffect(() => {
        if (open === true) {
            form.reset({ titre: "", montant_cible: 0, icone: "target", date_cible: new Date().toISOString().split("T")[0] })
        }
    }, [open, form])

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true)
        try {
            const success = await addObjectif({
                nom: data.titre,
                montant_cible: data.montant_cible,
                date_limite: data.date_cible,
                compte_id: 1
            }) !== null
            
            if (success) onConfirm()
        } catch (err) {
            console.error("Failed to save objectif:", err)
        } finally { setIsSubmitting(false) }
    }

    const handleCancel = () => { form.reset(); onCancel() }

    const ActiveIcon = OBJECTIF_TYPES.find(i => i.id === watchIcon)?.icon || Target

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -80, opacity: 0, scale: 0.92 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -50, opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", damping: 22, stiffness: 320 }}
                    style={{ top: "calc(1rem + env(safe-area-inset-top, 0px))" }}
                    className={cn(
                        "fixed left-4 right-4 z-[60]",
                        "bg-background/85 backdrop-blur-3xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
                        "rounded-[2.5rem] p-3 flex flex-col gap-2.5"
                    )}
                >
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                        <div className="flex flex-col gap-2">
                            {/* Ligne 1 : Type de projet (Dropdown Selection) */}
                            <div className="flex items-center gap-2">
                                <Controller
                                    name="icone"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select 
                                            onValueChange={(val) => {
                                                field.onChange(val)
                                                // Pre-fill name if empty
                                                const type = OBJECTIF_TYPES.find(t => t.id === val)
                                                if (type && !form.getValues("titre")) {
                                                    form.setValue("titre", type.placeholder)
                                                }
                                            }} 
                                            value={field.value}
                                        >
                                            <SelectTrigger className="h-9 rounded-2xl bg-white/5 border-white/10 text-xs font-bold uppercase tracking-wider text-amber-500">
                                                <div className="flex items-center gap-2">
                                                    <ActiveIcon className="w-3.5 h-3.5" />
                                                    <SelectValue placeholder="Type de projet..." />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10 rounded-2xl">
                                                {OBJECTIF_TYPES.map((type) => {
                                                    const Icon = type.icon
                                                    return (
                                                        <SelectItem 
                                                            key={type.id} 
                                                            value={type.id}
                                                            className="text-xs font-medium focus:bg-amber-500/10 focus:text-amber-500"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Icon className="w-3.5 h-3.5" />
                                                                {type.label}
                                                            </div>
                                                        </SelectItem>
                                                    )
                                                })}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />

                                <div className="flex-1">
                                    <Input 
                                        placeholder="Nom de votre objectif..." 
                                        className="h-9 text-xs font-bold border-white/10 bg-white/5 rounded-2xl px-4 placeholder:text-muted-foreground/30 uppercase tracking-tight"
                                        {...form.register("titre")} 
                                    />
                                </div>
                            </div>

                            {/* Ligne 2 : Montant & Date */}
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-2xl border border-white/10">
                                <div className="relative flex items-center w-32 border-r border-white/10 pr-2">
                                    <span className="text-sm font-serif italic font-black text-amber-500 mr-2">€</span>
                                    <Input 
                                        type="number" 
                                        step="0.01" 
                                        className="h-8 text-lg font-black border-none bg-transparent focus-visible:ring-0 p-0"
                                        placeholder="0"
                                        {...form.register("montant_cible", { valueAsNumber: true })} 
                                    />
                                </div>

                                <div className="flex-1">
                                    <Input 
                                        type="date" 
                                        className="h-8 border-none bg-transparent focus-visible:ring-0 text-[10px] font-bold text-muted-foreground/80 text-right px-0"
                                        {...form.register("date_cible")} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 px-1">
                            <Button type="button" variant="ghost" size="icon" onClick={handleCancel} className="h-9 w-9 rounded-full border border-white/10 hover:bg-white/5">
                                <X className="w-4 h-4 opacity-50" />
                            </Button>
                            <Button type="submit" disabled={isSubmitting}
                                className="h-9 px-6 rounded-full text-[11px] font-black uppercase tracking-[0.18em] bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 active:scale-95 flex-1">
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "CRÉER L'OBJECTIF"}
                            </Button>
                        </div>

                        {form.formState.errors.montant_cible && (
                            <p className="text-[10px] text-destructive font-black uppercase tracking-widest px-4 animate-pulse">{form.formState.errors.montant_cible.message}</p>
                        )}
                        {form.formState.errors.titre && (
                            <p className="text-[10px] text-destructive font-black uppercase tracking-widest px-4 animate-pulse">{form.formState.errors.titre.message}</p>
                        )}
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
