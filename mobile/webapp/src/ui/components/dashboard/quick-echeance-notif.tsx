import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tag, X, Loader2, CalendarClock } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/ui/components/ui/input"
import { Button } from "@/ui/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/components/ui/select"
import { getStructuredCategories } from "@/frontend/api/transactions"
import { useRecurrences } from "@/frontend/hooks/useRecurrences"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    type: z.enum(["dépense", "revenu"]),
    categorie: z.string().min(1, "Catégorie requise"),
    sous_categorie: z.string().nullable().optional(),
    montant: z.number().positive("Montant requis"),
    frequence: z.enum(["Mensuel", "Annuel", "Hebdomadaire", "Unique"]),
    date_debut: z.string().min(10, "Date requise"),
    description: z.string().optional()
})

type FormData = z.infer<typeof formSchema>

interface QuickEcheanceNotifProps {
    open?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export function QuickEcheanceNotif({ open, onConfirm, onCancel }: QuickEcheanceNotifProps) {
    const [structured, setStructured] = useState<Record<string, string[]>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { addRecurrence } = useRecurrences()

    const isVisible = open === true

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: { 
            type: "dépense", 
            categorie: "", 
            sous_categorie: "",
            montant: 0, 
            frequence: "Mensuel", 
            date_debut: new Date().toISOString().split("T")[0], 
            description: "" 
        },
    })

    useEffect(() => {
        if (open === true) {
            form.reset({ 
                type: "dépense", 
                categorie: "", 
                sous_categorie: "",
                montant: 0, 
                frequence: "Mensuel", 
                date_debut: new Date().toISOString().split("T")[0], 
                description: "" 
            })
        }
    }, [open, form])

    useEffect(() => { getStructuredCategories().then(setStructured) }, [])

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true)
        try {
            const success = await addRecurrence({
                nom: data.description || data.categorie,
                type: data.type,
                categorie: data.categorie,
                sous_categorie: data.sous_categorie || null,
                montant: data.montant,
                frequence: data.frequence,
                date_debut: data.date_debut,
                actif: 1,
                account_id: 1
            }) !== null
            if (success) { onConfirm() }
        } catch (err) {
            console.error("Failed to save echeance:", err)
        } finally { setIsSubmitting(false) }
    }

    const handleCancel = () => { form.reset(); onCancel() }
    const categories = Object.keys(structured).filter(c => c?.trim()).sort()
    const selectedCategory = form.watch("categorie")
    const subCategories = selectedCategory ? (structured[selectedCategory] || []) : []

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
                        {/* Ligne 1 : icon + montant + description */}
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-full border border-white/10">
                            <Controller control={form.control} name="type" render={({ field }) => {
                                const isExpense = field.value === "dépense"
                                return (
                                    <button type="button" onClick={() => field.onChange(isExpense ? "revenu" : "dépense")}
                                        className={cn(
                                            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300",
                                            isExpense ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                                        )}>
                                        <CalendarClock className="w-4 h-4" />
                                    </button>
                                )
                            }} />

                            <div className="relative flex-shrink-0 w-24">
                                <span className={cn(
                                    "absolute left-2 top-1/2 -translate-y-1/2 text-sm font-serif italic font-black transition-colors",
                                    form.watch("type") === "dépense" ? "text-rose-400/60" : "text-emerald-400/60"
                                )}>€</span>
                                <Input type="number" step="0.01" autoFocus
                                    className={cn(
                                        "h-9 text-lg font-black pl-6 border-none bg-transparent focus-visible:ring-0 transition-colors",
                                        form.watch("type") === "dépense" ? "text-rose-400 placeholder:text-rose-400/30" : "text-emerald-400 placeholder:text-emerald-400/30"
                                    )}
                                    placeholder="0.00"
                                    {...form.register("montant", { valueAsNumber: true })} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <Input placeholder="Description..." className="h-8 text-xs font-bold border-none bg-transparent focus-visible:ring-0 truncate p-0 placeholder:text-muted-foreground/30 tracking-tight"
                                    {...form.register("description")} />
                            </div>
                        </div>

                        {/* Ligne 2 : catégorie + sous-catégorie + période + date + boutons */}
                        <div className="flex items-center gap-1.5 px-1 flex-wrap">
                            <Controller control={form.control} name="categorie" render={({ field }) => (
                                <Select value={field.value} onValueChange={(val) => {
                                    field.onChange(val)
                                    form.setValue("sous_categorie", "") // Reset sub-cat
                                }}>
                                    <SelectTrigger className="h-8 text-[10px] rounded-full bg-white/5 border-white/10 font-black px-3 w-auto min-w-[90px] uppercase tracking-widest flex-shrink-0">
                                        <Tag className="w-3 h-3 mr-1.5 opacity-40" /><SelectValue placeholder="CATÉGORIE" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[100] rounded-2xl border-white/20 bg-background/95 backdrop-blur-xl">
                                        {categories.map(cat => <SelectItem key={cat} value={cat} className="text-[10px] font-bold uppercase tracking-widest py-2.5">{cat}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )} />

                            {subCategories.length > 0 && (
                                <Controller control={form.control} name="sous_categorie" render={({ field }) => (
                                    <Select value={field.value || ""} onValueChange={field.onChange}>
                                        <SelectTrigger className="h-8 text-[10px] rounded-full bg-white/5 border-white/10 font-bold px-3 w-auto min-w-[80px] uppercase tracking-widest flex-shrink-0 opacity-80">
                                            <SelectValue placeholder="S-CAT" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[100] rounded-2xl border-white/20 bg-background/95 backdrop-blur-xl">
                                            {subCategories.map(sub => <SelectItem key={sub} value={sub} className="text-[10px] font-medium uppercase tracking-widest py-2">{sub}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )} />
                            )}

                            <Controller control={form.control} name="frequence" render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="h-8 text-[10px] rounded-full bg-white/5 border-white/10 font-black px-3 w-auto min-w-[75px] uppercase tracking-widest opacity-60 flex-shrink-0">
                                        <SelectValue placeholder="FRÉQ." />
                                    </SelectTrigger>
                                    <SelectContent className="z-[100] rounded-2xl border-white/20 bg-background/95 backdrop-blur-xl">
                                        <SelectItem value="Mensuel" className="text-[10px] font-bold uppercase tracking-widest py-2.5">Mensuel</SelectItem>
                                        <SelectItem value="Unique" className="text-[10px] font-bold uppercase tracking-widest py-2.5">Unique</SelectItem>
                                        <SelectItem value="Annuel" className="text-[10px] font-bold uppercase tracking-widest py-2.5">Annuel</SelectItem>
                                        <SelectItem value="Hebdomadaire" className="text-[10px] font-bold uppercase tracking-widest py-2.5">Hebdo</SelectItem>
                                    </SelectContent>
                                </Select>
                            )} />

                            <div className="flex-shrink-0">
                                <Input type="date" className="h-8 w-[6.5rem] px-2 text-[10px] bg-white/5 border border-white/10 rounded-full font-bold text-muted-foreground/80 text-center flex-shrink-0"
                                    {...form.register("date_debut")} />
                            </div>

                            <div className="flex items-center gap-1.5 ml-auto">
                                <button type="button" onClick={handleCancel}
                                    className="p-2 text-muted-foreground/50 hover:text-foreground transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                                <Button type="submit" disabled={isSubmitting} size="sm"
                                    className="h-8 rounded-full bg-primary px-4 text-[10px] font-black uppercase tracking-widest shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-primary/20">
                                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Créer"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
