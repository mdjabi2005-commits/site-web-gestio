"use client"

import { useState } from "react"
import { 
  Plus, Wallet, Trash2,
  ShoppingCart, Home, Gamepad2, Car, Utensils,
  Shirt, Heart, GraduationCap, Wifi, Dumbbell, Receipt
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useBudgets } from "@/frontend/hooks/useBudgets"
import { QuickBudgetNotif } from "../components/dashboard/quick-budget-notif"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(amount)
}

function getIconForCategory(category: string): LucideIcon {
  const cat = category.toLowerCase()
  if (cat.includes("loyer") || cat.includes("logement")) return Home
  if (cat.includes("course") || cat.includes("aliment")) return ShoppingCart
  if (cat.includes("resto") || cat.includes("restaurant") || cat.includes("sorti")) return Utensils
  if (cat.includes("transport") || cat.includes("auto") || cat.includes("voiture")) return Car
  if (cat.includes("loisir") || cat.includes("divert")) return Gamepad2
  if (cat.includes("shop") || cat.includes("vetement") || cat.includes("habit")) return Shirt
  if (cat.includes("sante") || cat.includes("medic")) return Heart
  if (cat.includes("form") || cat.includes("educ") || cat.includes("ecole")) return GraduationCap
  if (cat.includes("abo") || cat.includes("internet") || cat.includes("telecom")) return Wifi
  if (cat.includes("sport") || cat.includes("bien")) return Dumbbell
  return Receipt
}

function getStatusColor(percentage: number) {
  if (percentage >= 100) return { bar: "bg-destructive", text: "text-destructive", label: "Dépassement" }
  if (percentage > 80) return { bar: "bg-chart-3", text: "text-chart-3", label: "Attention" }
  return { bar: "bg-primary", text: "text-primary", label: "Sain" }
}

export function BudgetsView() {
    const { statuses, summary, isLoading, deleteBudget } = useBudgets()
    const [isAddOpen, setIsAddOpen] = useState(false)

    const totalSpent = summary?.total_depense || 0
    const totalBudget = summary?.total_budget || 0
    // To handle initial empty state gracefully
    const totalPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

    return (
        <main className="flex flex-col gap-4 px-4 pb-20 md:gap-5 md:px-6 md:pb-8 pt-4">
            {/* Page title + action */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 md:h-10 md:w-10">
                        <Wallet className="h-4 w-4 text-primary md:h-5 md:w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Budgets</h1>
                        <p className="text-xs text-muted-foreground md:text-sm">
                            Suivi mensuel de vos dépenses
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsAddOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    Ajouter un budget
                </button>
            </div>
            
            <QuickBudgetNotif 
                open={isAddOpen} 
                onConfirm={() => setIsAddOpen(false)} 
                onCancel={() => setIsAddOpen(false)} 
            />

            <div className="flex flex-col gap-5">
                {/* Summary header */}
                <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total consommé ce mois</p>
                            <p className="mt-1 text-4xl font-bold tracking-tight text-foreground">
                                {formatCurrency(totalSpent)}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                sur {formatCurrency(totalBudget)} prévus
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <span
                                    className={`text-2xl font-bold ${totalPercentage >= 100 ? "text-destructive" : totalPercentage > 80 ? "text-chart-3" : "text-primary"}`}
                                >
                                    {totalPercentage}%
                                </span>
                                <span className="text-xs text-muted-foreground">du budget</span>
                            </div>
                            <div className="h-12 w-12">
                                <svg viewBox="0 0 36 36" className="-rotate-90">
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="15.5"
                                        fill="none"
                                        className="stroke-muted"
                                        strokeWidth="3"
                                    />
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="15.5"
                                        fill="none"
                                        className={`${totalPercentage >= 100 ? "stroke-destructive" : totalPercentage > 80 ? "stroke-chart-3" : "stroke-primary"}`}
                                        strokeWidth="3"
                                        strokeDasharray={`${Math.min(totalPercentage, 100)} ${100 - Math.min(totalPercentage, 100)}`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className={`h-full rounded-full transition-all ${totalPercentage >= 100 ? "bg-destructive" : totalPercentage > 80 ? "bg-chart-3" : "bg-primary"}`}
                            style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                        />
                    </div>
                </div>

                {isLoading && statuses.length === 0 && (
                    <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground/50">
                        <p className="text-xs italic">Chargement des budgets...</p>
                    </div>
                )}

                {!isLoading && statuses.length === 0 && (
                    <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
                        <p className="text-xs text-muted-foreground italic">Aucun budget configuré</p>
                    </div>
                )}

                {/* Category cards grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {statuses.map((cat) => {
                        const Icon = getIconForCategory(cat.categorie)
                        const percentage = Math.round(cat.pourcentage)
                        const isOver = cat.depassement
                        const cappedPercentage = Math.min(percentage, 100)
                        const status = getStatusColor(percentage)
                        const remaining = Math.abs(cat.restant)

                        return (
                            <div
                                key={cat.id}
                                className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/20"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 pr-8">
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                                isOver ? "bg-destructive/10" : "bg-secondary"
                                            }`}
                                        >
                                            <Icon
                                                className={`h-5 w-5 ${isOver ? "text-destructive" : "text-muted-foreground"}`}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-foreground truncate max-w-[140px]">{cat.categorie}</h3>
                                            <p className="text-[10px] text-muted-foreground capitalize">
                                                {cat.periode}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                                            isOver
                                                ? "bg-destructive/10 text-destructive"
                                                : status.text === "text-primary"
                                                    ? "bg-primary/10 text-primary"
                                                    : "bg-chart-3/10 text-chart-3"
                                        }`}
                                    >
                                        {status.label}
                                    </span>
                                </div>

                                <button 
                                    onClick={() => deleteBudget(cat.id)}
                                    className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>

                                <div className="mt-4 flex items-baseline justify-between">
                                    <p className="text-xl font-bold font-serif text-foreground">{formatCurrency(cat.depense)}</p>
                                    <p className="text-xs text-muted-foreground">/ {formatCurrency(cat.montant_limite)}</p>
                                </div>

                                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className={`h-full rounded-full transition-all ${isOver ? "bg-destructive" : status.bar}`}
                                        style={{ width: `${cappedPercentage}%` }}
                                    />
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                    <p className={`text-[11px] font-medium ${isOver ? "text-destructive" : status.text}`}>
                                        {percentage}%
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {isOver
                                            ? `${formatCurrency(remaining)} de dépassement`
                                            : `${formatCurrency(remaining)} restant`}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </main>
    )
}
