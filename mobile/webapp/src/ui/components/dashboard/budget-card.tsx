import { Wallet, Info } from "lucide-react"
import { useBudgets } from "@/frontend/hooks/useBudgets"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function BudgetCard() {
  const { statuses, summary, isLoading } = useBudgets()

  const totalSpent = summary?.total_depense || 0
  const totalBudget = summary?.total_budget || 0
  const percentage = summary?.pourcentage_global || 0

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
            <Wallet className="h-3 w-3 text-primary" />
          </div>
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Suivi Budget
          </h2>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
        </span>
      </div>

      <div className="mb-3">
        <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${percentage >= 100 ? 'bg-destructive' : 'bg-primary'}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <p className="text-[9px] text-muted-foreground uppercase font-medium">
          {Math.round(percentage)}% utilisé
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {isLoading && statuses.length === 0 ? (
           <p className="text-[11px] text-muted-foreground italic text-center py-2">Chargement...</p>
        ) : statuses.length === 0 ? (
           <p className="text-[11px] text-muted-foreground italic text-center py-2">Aucun budget défini</p>
        ) : (
          statuses.slice(0, 4).map((cat) => {
            const isOver = cat.depense > cat.montant_limite
            
            return (
              <div key={cat.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Info className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-foreground">{cat.categorie}</span>
                  </div>
                  <span
                    className={`text-[11px] font-bold font-serif ${isOver ? "text-destructive" : "text-foreground"}`}
                  >
                    {formatCurrency(cat.depense)} / {formatCurrency(cat.montant_limite)}
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${isOver ? "bg-destructive" : "bg-primary"}`}
                    style={{ width: `${Math.min((cat.depense / cat.montant_limite) * 100 || 0, 100)}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
