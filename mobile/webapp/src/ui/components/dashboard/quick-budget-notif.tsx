import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tag, X, Loader2, Wallet } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/ui/components/ui/input"
import { Button } from "@/ui/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/components/ui/select"
import { getStructuredCategories } from "@/frontend/api/transactions"
import { useBudgets } from "@/frontend/hooks/useBudgets"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    categorie: z.string().min(1, "Catégorie requise"),
    montant_limite: z.number().positive("Montant requis"),
    periode: z.enum(["Mensuel", "Annuel", "Hebdomadaire"]),
    date_debut: z.string().min(10, "Date requise"),
})

type FormData = z.infer<typeof formSchema>

interface QuickBudgetNotifProps {
    open?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export function QuickBudgetNotif({ open, onConfirm, onCancel }: QuickBudgetNotifProps) {
    const [structured, setStructured] = useState<Record<string, string[]>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { addBudget } = useBudgets()

    const isVisible = open === true

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: { categorie: "", montant_limite: 0, periode: "Mensuel", date_debut: new Date().toISOString().split("T")[0] },
    })

    useEffect(() => {
        if (open === true) {
            form.reset({ categorie: "", montant_limite: 0, periode: "Mensuel", date_debut: new Date().toISOString().split("T")[0] })
        }
    }, [open, form])

    useEffect(() => { getStructuredCategories().then(setStructured) }, [])

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true)
        try {
            const success = await addBudget({ ...data }) !== null
            if (success) { onConfirm() }
        } catch (err) {
            console.error("Failed to save budget:", err)
        } finally { setIsSubmitting(false) }
    }

    const handleCancel = () => { form.reset(); onCancel() }
    const categories = Object.keys(structured).filter(c => c?.trim()).sort()

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
                        {/* Ligne 1 : icon + montant */}
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-full border border-white/10">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-400">
                                <Wallet className="w-4 h-4" />
                            </div>

                            <div className="relative flex-1">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-serif italic font-black text-blue-400/60">€</span>
                                <Input type="number" step="0.01" autoFocus
                                    className="h-9 text-lg font-black pl-6 border-none bg-transparent focus-visible:ring-0"
                                    placeholder="Limite"
                                    {...form.register("montant_limite", { valueAsNumber: true })} />
                            </div>
                        </div>

                        {/* Ligne 2 : catégorie + période + boutons */}
                        <div className="flex items-center gap-2 px-1 flex-wrap">
                            <Controller control={form.control} name="categorie" render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="h-8 text-[10px] rounded-full bg-white/5 border-white/10 font-black px-3 w-auto min-w-[110px] uppercase tracking-widest">
                                        <Tag className="w-3 h-3 mr-1.5 opacity-40" /><SelectValue placeholder="CATÉGORIE" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[100] rounded-2xl border-white/20 bg-background/95 backdrop-blur-xl">
                                        {categories.map(cat => <SelectItem key={cat} value={cat} className="text-[10px] font-bold uppercase tracking-widest py-2.5">{cat}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )} />

                            <Controller control={form.control} name="periode" render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="h-8 text-[10px] rounded-full bg-white/5 border-white/10 font-black px-3 w-auto min-w-[100px] uppercase tracking-widest opacity-70">
                                        <SelectValue placeholder="PÉRIODE" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[100] rounded-2xl border-white/20 bg-background/95 backdrop-blur-xl">
                                        <SelectItem value="Mensuel" className="text-[10px] font-bold uppercase tracking-widest py-2.5">Mensuel</SelectItem>
                                        <SelectItem value="Annuel" className="text-[10px] font-bold uppercase tracking-widest py-2.5">Annuel</SelectItem>
                                        <SelectItem value="Hebdomadaire" className="text-[10px] font-bold uppercase tracking-widest py-2.5">Hebdo</SelectItem>
                                    </SelectContent>
                                </Select>
                            )} />

                            <div className="flex-shrink-0">
                                <Input type="date" className="h-8 w-[6.5rem] px-2 text-[10px] bg-white/5 border border-white/10 rounded-full font-bold text-muted-foreground/80 text-center flex-shrink-0"
                                    {...form.register("date_debut")} />
                            </div>

                            <div className="flex gap-2 ml-auto">
                                <Button type="button" variant="ghost" size="icon" onClick={handleCancel} className="h-9 w-9 rounded-full border border-white/10 hover:bg-white/5">
                                    <X className="w-4 h-4 opacity-50" />
                                </Button>
                                <Button type="submit" disabled={isSubmitting}
                                    className="h-9 px-5 rounded-full text-[11px] font-black uppercase tracking-[0.18em] bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 active:scale-95">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "VALIDER"}
                                </Button>
                            </div>
                        </div>

                        {form.formState.errors.montant_limite && (
                            <p className="text-[10px] text-destructive font-black uppercase tracking-widest px-4 animate-pulse">{form.formState.errors.montant_limite.message}</p>
                        )}
                        {form.formState.errors.categorie && (
                            <p className="text-[10px] text-destructive font-black uppercase tracking-widest px-4 animate-pulse">{form.formState.errors.categorie.message}</p>
                        )}
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
