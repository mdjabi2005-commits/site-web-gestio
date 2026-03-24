"use client"

import { Landmark, TrendingUp } from "lucide-react"

const accounts: any[] = []

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function LiquiditesCard() {
  const totalLiquidites = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
            <Landmark className="h-3 w-3 text-primary" />
          </div>
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Liquidites
          </h2>
        </div>
        <span className="text-[10px] text-muted-foreground">3 comptes</span>
      </div>

      <div className="mb-3 flex items-baseline gap-2">
        <p className="text-2xl font-bold tracking-tight text-foreground">
          {formatCurrency(totalLiquidites)}
        </p>
        <p className="flex items-center gap-0.5 text-[9px] font-bold text-accent uppercase">
          <TrendingUp className="h-2.5 w-2.5" />
          Disponible
        </p>
      </div>

      <div className="flex flex-col gap-1">
        {accounts.map((account) => {
          const Icon = account.icon
          const trendColor = account.healthy ? "text-accent" : "text-destructive"

          return (
            <div
              key={account.name}
              className="flex items-center justify-between rounded-lg bg-secondary/50 px-2 py-1.5 transition-colors active:bg-secondary"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-foreground">{account.name}</p>
                  <p className="text-[9px] text-muted-foreground uppercase">{account.bank}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold text-foreground">
                  {formatCurrency(account.balance)}
                </p>
                <p className={`flex items-center justify-end gap-0.5 text-[9px] font-bold ${trendColor}`}>
                  <TrendingUp className="h-2.5 w-2.5" />
                  {account.trend > 0 ? "+" : ""}{account.trend}%
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
