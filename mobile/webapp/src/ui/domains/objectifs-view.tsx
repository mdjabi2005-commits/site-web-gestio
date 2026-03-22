"use client"

import { useState, useEffect } from "react"
import {
    Plus, Target, TrendingUp, CalendarDays, Trash2, RefreshCw, PiggyBank
} from "lucide-react"
import { useObjectifs } from "@/frontend/hooks/useObjectifs"
import { QuickObjectifNotif } from "../components/dashboard/quick-objectif-notif"
import { ICON_MAP } from "@/ui/lib/icons"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(amount)
}

function CircularGauge({
  percentage,
  colorClass,
  size = 80,
}: {
  percentage: number
  colorClass: string
  size?: number
}) {
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" className="-rotate-90" width={size} height={size}>
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth="5"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          className={colorClass}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-foreground">{percentage}%</span>
      </div>
    </div>
  )
}


export function ObjectifsView() {
    const { objectifs, isLoading, deleteObjectif, refreshObjectifs } = useObjectifs()
    const [isAddOpen, setIsAddOpen] = useState(false)

    useEffect(() => {
        // Trigger background refresh of progression on mount
        // Attendre un peu que les migrations soient terminées
        const timeout = setTimeout(() => {
            refreshObjectifs().catch(err => console.error("Auto-refresh failed:", err))
        }, 1000)
        return () => clearTimeout(timeout)
    }, [])

    const totalSaved = objectifs.reduce((sum, g) => sum + (g.progression_actuelle || 0), 0)
    const totalTarget = objectifs.reduce((sum, g) => sum + (g.montant_cible || 0), 0)
    const activeGoals = objectifs.filter((g) => g.statut !== "Atteint").length
    const doneGoals = objectifs.filter((g) => g.statut === "Atteint").length
    const globalProgression = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

    return (
        <main className="flex flex-col gap-4 px-4 pb-20 md:gap-5 md:px-6 md:pb-8 pt-4">
            {/* Page title + action */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 md:h-10 md:w-10">
                        <Target className="h-4 w-4 text-amber-500 md:h-5 md:w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Objectifs</h1>
                        <p className="text-xs text-muted-foreground md:text-sm">
                            Suivi de vos projets d'épargne
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsAddOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    Ajouter un objectif
                </button>
            </div>

            <QuickObjectifNotif 
                open={isAddOpen} 
                onCancel={() => setIsAddOpen(false)} 
                onConfirm={() => setIsAddOpen(false)} 
            />

            <div className="flex flex-col gap-4">                {/* Summary grid 3+1 as requested */}
                <div className="flex flex-col gap-3 md:gap-4">
                    <div className="grid grid-cols-3 gap-2.5 md:gap-4">
                        <div className="rounded-2xl border border-border bg-card p-3 md:p-5 flex flex-col justify-between shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 truncate">
                                Épargne
                            </p>
                            <p className="mt-1 text-sm md:text-3xl font-black tracking-tight text-foreground truncate font-serif">
                                {formatCurrency(totalSaved)}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border bg-card p-3 md:p-5 flex flex-col justify-between text-center shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 truncate">
                                Actifs
                            </p>
                            <p className="mt-1 text-sm md:text-3xl font-black tracking-tight text-amber-500 truncate font-serif">
                                {activeGoals}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border bg-card p-3 md:p-5 flex flex-col justify-between text-center shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 truncate">
                                Atteints
                            </p>
                            <p className="mt-1 text-sm md:text-3xl font-black tracking-tight text-emerald-500 truncate font-serif">
                                {doneGoals}
                            </p>
                        </div>
                    </div>
                    
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] -mr-10 -mt-10" />
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1">
                                Progression globale
                            </p>
                            <p className="text-xl md:text-2xl font-black tracking-tighter text-foreground font-serif">
                                {globalProgression}%
                            </p>
                        </div>
                        <div className="flex-1 max-w-[200px] h-2 bg-background/50 rounded-full overflow-hidden border border-white/5">
                            <div 
                                className="h-full bg-primary transition-all duration-1000 ease-out"
                                style={{ width: `${globalProgression}%` }}
                            />
                        </div>
                    </div>
                </div>

                {isLoading && objectifs.length === 0 && (
                    <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground/50">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                        <p className="text-xs italic">Chargement des objectifs...</p>
                    </div>
                )}

                {!isLoading && objectifs.length === 0 && (
                    <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center mt-4">
                        <p className="text-xs text-muted-foreground italic">Aucun objectif d'épargne</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">Créez votre premier projet via le bouton ci-dessus.</p>
                    </div>
                )}

                {/* Goal cards grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {objectifs.map((goal) => {
                        const Icon = ICON_MAP[goal.icone?.toLowerCase() ?? ""] || Target
                        const progression = goal.progression_actuelle || 0
                        const percentage = goal.montant_cible > 0 ? Math.round((progression / goal.montant_cible) * 100) : 0
                        const remaining = Math.max(0, goal.montant_cible - progression)
                        const isDone = goal.statut === "Atteint" || percentage >= 100
                        
                        // Handle Stagnation calculation
                        let daysStagnant = 0
                        const lastMod = goal.derniere_modification || goal.created_at
                        if (lastMod) {
                            const lastModDate = new Date(lastMod)
                            const today = new Date()
                            today.setHours(0,0,0,0)
                            const diffTime = today.getTime() - lastModDate.getTime()
                            daysStagnant = Math.floor(diffTime / (1000 * 60 * 60 * 24))
                        }

                        // Handle deadline calculation
                        let daysRemaining = null
                        let deadlineStr = "Pas de date"
                        if (goal.date_limite) {
                            const deadlineDate = new Date(goal.date_limite)
                            const today = new Date()
                            today.setHours(0,0,0,0)
                            const diffTime = deadlineDate.getTime() - today.getTime()
                            daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                            deadlineStr = deadlineDate.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })
                        }

                        return (
                            <div
                                key={goal.id}
                                className={`group relative flex flex-col rounded-2xl border bg-card p-5 transition-all hover:border-primary/20 ${
                                    isDone ? "border-accent/30" : "border-border"
                                }`}
                            >
                                {/* Top row: icon + type + status */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10`}
                                        >
                                            <Icon className={`h-5 w-5 text-amber-500`} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-semibold text-foreground truncate max-w-[120px]">{goal.nom}</h3>
                                            <div className="mt-0.5 flex items-center gap-1.5">
                                                <PiggyBank className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground truncate">Épargne</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!isDone && daysStagnant > 30 && (
                                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black bg-destructive/10 text-destructive border border-destructive/20 animate-pulse">
                                                🔴 STAGNÉ
                                            </span>
                                        )}
                                        {!isDone && daysStagnant > 14 && daysStagnant <= 30 && (
                                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                🟡 ATTENTE
                                            </span>
                                        )}
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                                                isDone
                                                    ? "bg-accent/10 text-accent"
                                                    : "bg-secondary text-muted-foreground"
                                            }`}
                                        >
                                            {isDone ? "Accompli" : "Actif"}
                                        </span>
                                        <button 
                                            onClick={() => deleteObjectif(goal.id)}
                                            className="p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Circular gauge */}
                                <div className="my-5 flex items-center justify-center">
                                    <CircularGauge
                                        percentage={percentage}
                                        colorClass={isDone ? "stroke-accent" : "stroke-amber-500"}
                                        size={96}
                                    />
                                </div>

                                {/* Amounts */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-bold font-serif text-foreground">
                                            {formatCurrency(progression)}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            sur {formatCurrency(goal.montant_cible)}
                                        </p>
                                    </div>
                                    {!isDone && (
                                        <div className="text-right">
                                            <p className={`text-sm font-semibold text-amber-500 font-serif`}>
                                                {formatCurrency(remaining)}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-bold">À économiser</p>
                                            {daysStagnant > 14 && (
                                                <p className="text-[9px] text-amber-500/80 italic font-medium mt-0.5">
                                                    {daysStagnant > 30 
                                                        ? `Aucun progrès depuis ${Math.floor(daysStagnant/30)} mois` 
                                                        : "Pas de progression récente"}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Dates */}
                                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                                    <div className="flex items-center gap-1.5">
                                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-[10px] text-muted-foreground">
                                            Cible : {deadlineStr}
                                        </span>
                                    </div>
                                    {isDone ? (
                                        <span className="flex items-center gap-1 text-[10px] font-medium text-accent">
                                            <TrendingUp className="h-3 w-3" />
                                            Atteint
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-medium text-muted-foreground">
                                            {daysRemaining !== null ? `J-${daysRemaining}` : "Pas d'échéance"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </main>
    )
}
