"use client"

import { useState } from "react"
import { 
  Plus, Calendar, RefreshCw, CreditCard, Trash2, 
  Zap, Smartphone, Wifi, Shield, Home, Car, GraduationCap, 
  AlertTriangle, Clock, Filter, AlertCircle, CalendarClock,
  Utensils, Gamepad2, Heart, ShoppingCart
} from "lucide-react"
import { useRecurrences } from "@/frontend/hooks/useRecurrences"
import { QuickEcheanceNotif } from "../components/dashboard/quick-echeance-notif"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount)
}

function getIconForCategory(category: string, type: string) {
    const cat = category.toLowerCase()
    if (cat.includes("energie") || cat.includes("electri")) return Zap
    if (cat.includes("telecom") || cat.includes("mobile") || cat.includes("téléphone")) return Smartphone
    if (cat.includes("internet") || cat.includes("wifi")) return Wifi
    if (cat.includes("assurance")) return Shield
    if (cat.includes("logement") || cat.includes("loyer")) return Home
    if (cat.includes("transport") || cat.includes("auto") || cat.includes("voiture")) return Car
    if (cat.includes("impot") || cat.includes("tax") || cat.includes("étude")) return GraduationCap
    if (cat.includes("banque") || cat.includes("credit") || cat.includes("crédit")) return CreditCard
    if (cat.includes("aliment") || cat.includes("food") || cat.includes("course")) return Utensils
    if (cat.includes("loisir") || cat.includes("cafe") || cat.includes("café") || cat.includes("restau")) return Gamepad2
    if (cat.includes("achat") || cat.includes("shopping")) return ShoppingCart
    if (cat.includes("santé") || cat.includes("sante") || cat.includes("médic")) return Heart
    return type === "revenu" ? RefreshCw : CalendarClock
}

const filterOptions: { label: string; value: string }[] = [
  { label: "Tous", value: "all" },
  { label: "Dépenses", value: "dépense" },
  { label: "Revenus", value: "revenu" },
]

export function EcheancesView() {
    const { recurrences, isLoading, deleteRecurrence } = useRecurrences()
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [activeFilter, setActiveFilter] = useState("all")

    const activeRecurrences = recurrences.filter(r => r.statut === 'Actif')
    const filtered = activeFilter === "all" ? activeRecurrences : activeRecurrences.filter((r) => r.type === activeFilter)

    const totalExpenses = activeRecurrences.filter(r => r.type === 'dépense').reduce((sum, r) => sum + r.montant, 0)
    const totalIncomes = activeRecurrences.filter(r => r.type === 'revenu').reduce((sum, r) => sum + r.montant, 0)

    const today = new Date()
    today.setHours(0,0,0,0)

    return (
        <main className="flex flex-col gap-4 px-4 pb-20 md:gap-5 md:px-6 md:pb-8 pt-4">
            {/* Page title + action */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-chart-3/20 md:h-10 md:w-10">
                        <Calendar className="h-4 w-4 text-chart-3 md:h-5 md:w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Échéances</h1>
                        <p className="text-xs text-muted-foreground md:text-sm">
                            Factures et prélèvements à venir
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsAddOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    Ajouter une échéance
                </button>
            </div>

            <QuickEcheanceNotif 
                open={isAddOpen} 
                onConfirm={() => setIsAddOpen(false)} 
                onCancel={() => setIsAddOpen(false)} 
            />

            <div className="flex flex-col gap-4">
                {/* Summary strip - Forced 3 columns for mobile efficiency */}
                <div className="grid grid-cols-3 gap-2.5 md:gap-4">
                    <div className="rounded-2xl border border-border bg-card p-3 md:p-5 flex flex-col justify-between shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 truncate">
                            Dépenses
                        </p>
                        <p className="mt-1 text-base md:text-3xl font-black tracking-tight text-rose-500 truncate font-serif">
                            {formatCurrency(totalExpenses)}
                        </p>
                        <div className="mt-1 hidden md:block">
                            <p className="text-[10px] text-muted-foreground truncate">
                                {activeRecurrences.filter(r => r.type === 'dépense').length} échéances
                            </p>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-3 md:p-5 flex flex-col justify-between shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 truncate">
                            Revenus
                        </p>
                        <p className="mt-1 text-base md:text-3xl font-black tracking-tight text-emerald-500 truncate font-serif">
                            {formatCurrency(totalIncomes)}
                        </p>
                        <div className="mt-1 hidden md:block">
                            <p className="text-[10px] text-muted-foreground truncate">
                                À recevoir
                            </p>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 md:p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-full opacity-30" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 truncate">
                            Solde
                        </p>
                        <p className="mt-1 text-base md:text-3xl font-black tracking-tight text-foreground truncate font-serif">
                            {formatCurrency(totalIncomes - totalExpenses)}
                        </p>
                        <div className="mt-1 hidden md:block">
                            <p className="text-[10px] text-muted-foreground truncate">
                                Reste estimé
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {filterOptions.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setActiveFilter(opt.value)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                                activeFilter === opt.value
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Echeance rows */}
                <div className="flex flex-col gap-3">
                    {isLoading && activeRecurrences.length === 0 && (
                        <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground/50">
                            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                            <p className="text-xs italic">Chargement des échéances...</p>
                        </div>
                    )}

                    {!isLoading && filtered.length === 0 && (
                        <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
                            <p className="text-xs text-muted-foreground italic">Aucune échéance trouvée</p>
                        </div>
                    )}

                    {filtered.map((ech) => {
                        const Icon = getIconForCategory(ech.categorie, ech.type)
                        
                        let daysLeft = 0
                        let displayDate = ech.prochaine_occurrence ? new Date(ech.prochaine_occurrence) : new Date(ech.date_debut)
                        
                        if (ech.prochaine_occurrence) {
                            const diffTime = displayDate.getTime() - today.getTime()
                            daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        }
                        
                        const isUrgent = daysLeft >= 0 && daysLeft <= 3 && ech.type === 'dépense'
                        const isLate = daysLeft < 0
                        
                        const dayStr = displayDate.getDate().toString().padStart(2, '0')
                        const monthStr = displayDate.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')

                        return (
                            <div
                                key={ech.id}
                                className={`flex items-center justify-between rounded-2xl border bg-card px-5 py-4 transition-all hover:border-primary/20 border-border`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Date block */}
                                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-secondary text-center">
                                        <span className="text-xs font-medium text-muted-foreground capitalize">
                                            {monthStr}
                                        </span>
                                        <span className="text-lg font-bold leading-none text-foreground">
                                            {dayStr}
                                        </span>
                                    </div>

                                    {/* Icon + info */}
                                    <div className="flex items-center gap-3 max-w-[150px] sm:max-w-xs">
                                        <div
                                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-sm ${
                                                isLate ? "bg-red-500/15" : isUrgent ? "bg-amber-500/15" : "bg-primary/10"
                                            }`}
                                        >
                                            <Icon
                                                className={`h-5 w-5 ${
                                                    isLate ? "text-red-500" : isUrgent ? "text-amber-500" : "text-primary"
                                                }`}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-semibold text-foreground truncate">{ech.description || "Sans description"}</h3>
                                                {isUrgent && <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-chart-3" />}
                                                {isLate && <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-red-500" />}
                                            </div>
                                            
                                            {/* Détails Catégorie / Sous-cat */}
                                            <div className="mt-0.5 flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground/80 uppercase tracking-tighter">
                                                    <span>{ech.categorie}</span>
                                                    {ech.sous_categorie && (
                                                        <>
                                                            <span className="opacity-30">/</span>
                                                            <span className="text-foreground/70">{ech.sous_categorie}</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 italic font-medium">
                                                    <CalendarClock className="w-3 h-3 opacity-40" />
                                                    <span>Échéance le {displayDate.toLocaleDateString('fr-FR')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1.5 pl-2 flex-shrink-0">
                                    <p className={`text-base font-black tracking-tighter font-serif whitespace-nowrap ${ech.type === 'revenu' ? 'text-emerald-500' : 'text-foreground'}`}>
                                        {ech.type === 'revenu' ? '+' : '-'}{formatCurrency(ech.montant)}
                                    </p>
                                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary/10 text-[8px] font-black uppercase tracking-widest text-primary/80 border border-primary/10">
                                            {ech.frequence}
                                        </span>
                                        <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest border ${
                                            isLate 
                                                ? "bg-rose-500/10 text-rose-500 border-rose-500/10" 
                                                : isUrgent 
                                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/10" 
                                                    : "bg-secondary text-muted-foreground border-border/50"
                                        }`}>
                                            <Clock className="h-2.5 w-2.5" />
                                            {isLate ? "Retard" : `J-${daysLeft}`}
                                        </span>
                                        <button 
                                            onClick={() => deleteRecurrence(ech.id)}
                                            className="p-1 hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive rounded-md transition-colors ml-1"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </main>
    )
}
