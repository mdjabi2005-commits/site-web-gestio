// webapp/src/ui/components/transactions/transaction-form.tsx
import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/ui/components/ui/button"
import { Input } from "@/ui/components/ui/input"
import { Label } from "@/ui/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/components/ui/select"
import { getStructuredCategories, updateTransaction, type Transaction } from "@/frontend/api/transactions"
import { transactionStore } from "@/frontend/bridge/transaction_store"

const formSchema = z.object({
    type: z.enum(["dépense", "revenu"]),
    montant: z.number().positive("Le montant doit être positif"),
    date: z.string().min(10, "Date requise"),
    categorie: z.string().min(1, "Catégorie requise"),
    sous_categorie: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
})

type FormData = z.infer<typeof formSchema>

interface TransactionFormProps {
    transactionToEdit?: Transaction | null
    onSuccess: () => void
    onClose: () => void
}

export function TransactionForm({ transactionToEdit, onSuccess, onClose }: TransactionFormProps) {
    const [structuredCategories, setStructuredCategories] = useState<Record<string, string[]>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "dépense", montant: 0, date: new Date().toISOString().split('T')[0],
            categorie: "", sous_categorie: null, description: "",
        }
    })

    const watchCategory = form.watch("categorie")

    useEffect(() => {
        getStructuredCategories().then(setStructuredCategories).catch(err => console.error("Categories load failed", err))
    }, [])

    useEffect(() => {
        if (transactionToEdit) {
            form.reset({
                type: String(transactionToEdit.type).toLowerCase().includes('revenu') ? 'revenu' : 'dépense',
                montant: transactionToEdit.montant,
                date: transactionToEdit.date.split('T')[0],
                categorie: transactionToEdit.categorie,
                sous_categorie: transactionToEdit.sous_categorie,
                description: transactionToEdit.description || "",
            })
        }
    }, [transactionToEdit, form])

    const onSubmit = async (values: FormData) => {
        setIsSubmitting(true)
        try {
            const payload: Partial<Transaction> = {
                ...values, sous_categorie: values.sous_categorie || null, description: values.description || null, source: "manuel"
            }
            const success = transactionToEdit 
                ? await updateTransaction(transactionToEdit.id, payload) 
                : await transactionStore.addTransaction(payload)
            if (success) { onSuccess(); onClose(); } else { alert("Erreur lors de l'enregistrement."); }
        } finally { setIsSubmitting(false) }
    }

    const availableCategories = Object.keys(structuredCategories).filter(cat => cat?.trim()).sort()
    const availableSubCategories = (watchCategory && structuredCategories[watchCategory]) ? structuredCategories[watchCategory].filter(sub => sub?.trim()) : []

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <Controller control={form.control} name="type" render={({ field }) => (
                    <div className="flex p-1 bg-muted/30 rounded-full scale-90 origin-right">
                        {['dépense', 'revenu'].map(t => (
                            <button key={t} type="button" onClick={() => field.onChange(t)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${field.value === t ? (t === 'dépense' ? 'bg-destructive' : 'bg-emerald-500') + ' text-white shadow-lg' : 'text-muted-foreground'}`}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                )} />
            </div>

            <div className="relative group animate-in fade-in zoom-in-95 duration-300">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 text-3xl font-serif text-muted-foreground/30 px-3">€</div>
                <Input type="number" step="0.01" autoFocus placeholder="0.00" 
                    className="text-4xl font-black h-20 pl-10 border-none bg-transparent focus-visible:ring-0 text-foreground text-center"
                    {...form.register("montant", { valueAsNumber: true })} />
                <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                {form.formState.errors.montant && <p className="text-center text-xs text-destructive mt-1">{form.formState.errors.montant.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">Description</Label>
                    <Input placeholder="Description..." className="rounded-xl bg-muted/20 border-border/50 h-11" {...form.register("description")} />
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">Date</Label>
                    <Input type="date" className="rounded-xl bg-muted/20 border-border/50 h-11" {...form.register("date")} />
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">Catégorie</Label>
                    <Controller control={form.control} name="categorie" render={({ field }) => (
                        <Select value={field.value} onValueChange={(v) => { field.onChange(v); form.setValue("sous_categorie", null); }}>
                            <SelectTrigger className="rounded-xl bg-muted/20 border-border/50 h-11"><SelectValue placeholder="..." /></SelectTrigger>
                            <SelectContent>{availableCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                        </Select>
                    )} />
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">Sous-catégorie</Label>
                    <Controller control={form.control} name="sous_categorie" render={({ field }) => (
                        <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? null : v)} disabled={availableSubCategories.length === 0}>
                            <SelectTrigger className="rounded-xl bg-muted/20 border-border/50 h-11 disabled:opacity-30"><SelectValue placeholder="..." /></SelectTrigger>
                            <SelectContent><SelectItem value="none">Aucune</SelectItem>{availableSubCategories.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}</SelectContent>
                        </Select>
                    )} />
                </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all">
                {isSubmitting ? "..." : "Confirmer"}
            </Button>
        </form>
    )
}
