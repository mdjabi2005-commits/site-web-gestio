import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tag, X, Loader2, TrendingDown, TrendingUp } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/ui/components/ui/input"
import { Button } from "@/ui/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/components/ui/select"
import { getStructuredCategories, updateTransaction, type Transaction } from "@/frontend/api/transactions"
import { cn } from "@/lib/utils"
import { transactionStore } from "@/frontend/bridge/transaction_store"

const formSchema = z.object({
    id: z.number().optional(),
    type: z.enum(["dépense", "revenu"]),
    montant: z.number().positive("Montant requis"),
    date: z.string().min(10, "Date requise"),
    categorie: z.string().min(1, "Catégorie requise"),
    sous_categorie: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
})

type FormData = z.infer<typeof formSchema>

interface QuickTransactionNotifProps {
    transaction?: Partial<Transaction> | null
    open?: boolean
    onConfirm: () => void
    onCancel: () => void
    source?: "scan" | "manuel" | "pdf"
}

export function QuickTransactionNotif({ transaction, open, onConfirm, onCancel, source = "scan" }: QuickTransactionNotifProps) {
    const [structured, setStructured] = useState<Record<string, string[]>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isVisible = open !== undefined ? open : !!transaction

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: { id: undefined, type: "dépense", montant: 0, date: new Date().toISOString().split("T")[0], categorie: "", sous_categorie: null, description: "" },
    })

    const watchType = form.watch("type")
    const watchCategorie = form.watch("categorie")
    const subCategories = (watchCategorie && structured[watchCategorie] ? structured[watchCategorie] : []).filter(s => s?.trim())

    useEffect(() => {
        if (transaction) {
            form.reset({ id: transaction.id, type: "dépense", montant: transaction.montant || 0, date: transaction.date || new Date().toISOString().split("T")[0], categorie: transaction.categorie || "", sous_categorie: null, description: transaction.description || "" })
        }
    }, [transaction, form])

    useEffect(() => {
        if (open === true && !transaction) {
            form.reset({ id: undefined, type: "dépense", montant: 0, date: new Date().toISOString().split("T")[0], categorie: "", sous_categorie: null, description: "" })
        }
    }, [open, transaction, form])

    useEffect(() => { getStructuredCategories().then(setStructured) }, [])

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true)
        try {
            const payload = { ...data, source: transaction?.source || source }
            const success = data.id 
                ? await updateTransaction(data.id, payload) 
                : await transactionStore.addTransaction(payload)
            if (success) { onConfirm() }
        } catch (err) {
            console.error("Failed to save transaction:", err)
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
                        {/* Ligne 1 : type + montant + description + date */}
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-full border border-white/10">
                            <Controller control={form.control} name="type" render={({ field }) => (
                                <button type="button" onClick={() => field.onChange(field.value === "dépense" ? "revenu" : "dépense")}
                                    className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90",
                                        field.value === "dépense" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400")}
                                    title={field.value === "dépense" ? "Dépense" : "Revenu"}>
                                    {field.value === "dépense" ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                                </button>
                            )} />

                            <div className="relative flex-shrink-0 w-24">
                                <span className={cn("absolute left-2 top-1/2 -translate-y-1/2 text-sm font-serif italic font-black",
                                    watchType === "dépense" ? "text-red-400/60" : "text-emerald-500/60")}>€</span>
                                <Input type="number" step="0.01" autoFocus
                                    className="h-9 text-lg font-black pl-6 border-none bg-transparent focus-visible:ring-0"
                                    {...form.register("montant", { valueAsNumber: true })} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <Input placeholder="Description..." className="h-8 text-xs font-bold border-none bg-transparent focus-visible:ring-0 truncate p-0 placeholder:text-muted-foreground/30 uppercase tracking-tight"
                                    {...form.register("description")} />
                            </div>
                        </div>

                        {/* Ligne 2 : catégorie + sous-catégorie + boutons */}
                        <div className="flex items-center gap-2 px-1 flex-wrap">
                            <Controller control={form.control} name="categorie" render={({ field }) => (
                                <Select value={field.value} onValueChange={(v) => { field.onChange(v); form.setValue("sous_categorie", null) }}>
                                    <SelectTrigger className="h-8 text-[10px] rounded-full bg-white/5 border-white/10 font-black px-3 w-auto min-w-[110px] uppercase tracking-widest">
                                        <Tag className="w-3 h-3 mr-1.5 opacity-40" /><SelectValue placeholder="CATÉGORIE" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[100] rounded-2xl border-white/20 bg-background/95 backdrop-blur-xl">
                                        {categories.map(cat => <SelectItem key={cat} value={cat} className="text-[10px] font-bold uppercase tracking-widest py-2.5">{cat}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )} />

                            {subCategories.length > 0 && (
                                <Controller control={form.control} name="sous_categorie" render={({ field }) => (
                                    <Select value={field.value ?? "none"} onValueChange={(v) => field.onChange(v === "none" ? null : v)}>
                                        <SelectTrigger className="h-8 text-[10px] rounded-full bg-white/5 border-white/10 font-black px-3 w-auto min-w-[100px] uppercase tracking-widest opacity-70">
                                            <SelectValue placeholder="SOUS-CAT." />
                                        </SelectTrigger>
                                        <SelectContent className="z-[100] rounded-2xl border-white/20 bg-background/95 backdrop-blur-xl">
                                            <SelectItem value="none" className="text-[10px] font-bold uppercase tracking-widest py-2.5">Aucune</SelectItem>
                                            {subCategories.map(sub => <SelectItem key={sub} value={sub} className="text-[10px] font-bold uppercase tracking-widest py-2.5">{sub}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )} />
                            )}

                            <div className="flex-shrink-0">
                                <Input type="date" className="h-8 w-[6.5rem] px-2 text-[10px] bg-white/5 border border-white/10 rounded-full font-bold text-muted-foreground/80 text-center flex-shrink-0"
                                    {...form.register("date")} />
                            </div>

                            <div className="flex gap-2 ml-auto">
                                <Button type="button" variant="ghost" size="icon" onClick={handleCancel} className="h-9 w-9 rounded-full border border-white/10 hover:bg-white/5">
                                    <X className="w-4 h-4 opacity-50" />
                                </Button>
                                <Button type="submit" disabled={isSubmitting}
                                    className="h-9 px-5 rounded-full text-[11px] font-black uppercase tracking-[0.18em] bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 active:scale-95">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "VALIDER"}
                                </Button>
                            </div>
                        </div>

                        {form.formState.errors.montant && (
                            <p className="text-[10px] text-destructive font-black uppercase tracking-widest px-4 animate-pulse">{form.formState.errors.montant.message}</p>
                        )}
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
