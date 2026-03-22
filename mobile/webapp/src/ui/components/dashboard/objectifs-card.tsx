"use client"

import { Target, Laptop, Car, Plane, Home, Gamepad2, Heart, GraduationCap, Smartphone, Coffee } from "lucide-react"
import { useObjectifs } from "@/frontend/hooks/useObjectifs"

// Catalogue mapping icon
const ICON_MAP: Record<string, any> = {
    laptop: Laptop,
    smartphone: Smartphone,
    car: Car,
    plane: Plane,
    home: Home,
    gamepad: Gamepad2,
    heart: Heart,
    education: GraduationCap,
    coffee: Coffee,
    target: Target,
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(isoDate: string) {
    if (!isoDate) return ""
    const date = new Date(isoDate)
    return date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })
}

export function ObjectifsCard() {
  const { objectifs, isLoading } = useObjectifs()

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/10">
            <Target className="h-3 w-3 text-red-500" />
          </div>
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Objectifs de Vie
          </h2>
        </div>
      </div>

      {!isLoading && objectifs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
              <span className="text-xs text-muted-foreground opacity-60 font-semibold mb-1 uppercase tracking-widest">
                  {"Aucun objectif"}
              </span>
          </div>
      )}

      {isLoading && (
          <div className="flex items-center justify-center py-6 text-muted-foreground/30">
              <Target className="w-5 h-5 animate-pulse" />
          </div>
      )}

      {objectifs.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {objectifs.map((goal) => {
              const Icon = ICON_MAP[goal.icone?.toLowerCase() as keyof typeof ICON_MAP] || Target
              const progression = goal.progression_actuelle || 0
              const percentage = goal.montant_cible > 0 ? Math.round((progression / goal.montant_cible) * 100) : 0
              
              const colorBg = "bg-amber-500/20"
              const colorText = "text-amber-500"
              const progressColor = "bg-amber-500"

              return (
                <div
                  key={goal.id}
                  className="group flex flex-col rounded-lg border border-border bg-secondary/30 p-2.5 transition-all active:bg-secondary/60"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${colorBg}`}>
                      <Icon className={`h-3.5 w-3.5 ${colorText}`} />
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full ${colorBg} px-1.5 py-0.5 text-[9px] font-bold font-serif ${colorText}`}
                    >
                      {percentage}%
                    </span>
                  </div>

                  <h3 className="mb-0.5 text-[11px] font-semibold text-foreground line-clamp-1">{goal.nom}</h3>
                  <p className="mb-2 text-[9px] text-muted-foreground uppercase opacity-80">{formatDate(goal.date_limite || "")}</p>

                  <div className="mb-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${progressColor} transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold font-serif text-foreground">{formatCurrency(progression)}</p>
                    <p className="text-[9px] font-serif text-muted-foreground opacity-50">{formatCurrency(goal.montant_cible)}</p>
                  </div>
                </div>
              )
            })}
          </div>
      )}
    </div>
  )
}
