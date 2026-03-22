"use client"

import { TrendingUp } from "lucide-react"

const investments: any[] = []

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function InvestissementsCard() {
  const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0)
  const totalInvested = investments.reduce((sum, inv) => sum + inv.invested, 0)
  const totalGainPercent = totalInvested !== 0 ? (((totalValue - totalInvested) / totalInvested) * 100).toFixed(1) : "0.0"
  const totalGainAbsolute = totalValue - totalInvested

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/10">
            <TrendingUp className="h-3 w-3 text-accent" />
          </div>
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Investissements
          </h2>
        </div>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold text-accent uppercase">
          <TrendingUp className="h-2.5 w-2.5" />+{totalGainPercent}%
        </span>
      </div>

      <div className="mb-3 flex items-baseline gap-2">
        <p className="text-2xl font-bold tracking-tight text-foreground">
          {formatCurrency(totalValue)}
        </p>
        <p className="text-[9px] text-accent font-bold uppercase">
          +{formatCurrency(totalGainAbsolute)}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        {investments.map((inv) => {
          const Icon = inv.icon
          return (
            <div
              key={inv.name}
              className="flex items-center justify-between rounded-lg bg-secondary/50 px-2 py-1.5 transition-colors active:bg-secondary"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-foreground">{inv.name}</p>
                  <p className="text-[9px] text-muted-foreground uppercase">{inv.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold text-foreground">{formatCurrency(inv.value)}</p>
                <p className="text-[9px] font-bold text-accent">+{inv.gain}%</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
