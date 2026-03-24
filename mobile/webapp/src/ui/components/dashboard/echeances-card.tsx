"use client"

import { Calendar, CreditCard, RefreshCw } from "lucide-react"
import { useRecurrences } from "@/frontend/hooks/useRecurrences"

function formatCurrency(amount: number) {
  if (isNaN(amount) || amount === undefined || amount === null) return "0.00 €"
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function EcheancesCard() {
  const { recurrences, isLoading } = useRecurrences()

  const now = new Date()
  
  const upcomingBills = recurrences
    .filter(r => r.statut === 'Actif' && r.prochaine_occurrence)
    .map(r => {
        let pDate = new Date()
        try {
            pDate = new Date(r.prochaine_occurrence!)
            if (isNaN(pDate.getTime())) pDate = new Date()
        } catch (e) {
            pDate = new Date()
        }
        const diffTime = pDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        return {
            id: r.id,
            name: r.description || r.categorie,
            date: r.prochaine_occurrence!,
            daysLeft: diffDays,
            amount: r.montant,
            urgent: diffDays <= 3,
            icon: r.type === 'dépense' ? CreditCard : RefreshCw
        }
    })
    .filter(b => b.daysLeft >= 0 && b.daysLeft <= 15) // Afficher jusqu'à 15 jours à l'avance pour qu'il y en ait plus potentiellement
    .sort((a,b) => a.daysLeft - b.daysLeft)
    .slice(0, 3) // Ne prendre que les 3 prochaines

  const totalUpcoming = upcomingBills.reduce((sum, bill) => sum + bill.amount, 0)

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-chart-3/20">
            <Calendar className="h-3 w-3 text-chart-3" />
          </div>
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Echeances
          </h2>
        </div>
        <span className="text-[10px] text-muted-foreground">Prochains jours</span>
      </div>

      <div className="mb-3 flex items-baseline gap-2">
        <p className="text-lg font-bold font-serif tracking-tight text-foreground">
          {formatCurrency(totalUpcoming)}
        </p>
        <p className="text-[9px] text-muted-foreground uppercase font-medium">prévu</p>
      </div>

      <div className="flex flex-col gap-1">
        {isLoading && upcomingBills.length === 0 ? (
          <p className="text-[11px] text-muted-foreground italic text-center py-2">Chargement...</p>
        ) : upcomingBills.length === 0 ? (
          <p className="text-[11px] text-muted-foreground italic text-center py-2">Aucune échéance proche</p>
        ) : (
          upcomingBills.map((bill) => {
            const Icon = bill.icon
            return (
              <div
                key={bill.id}
                className="flex items-center justify-between rounded-lg bg-secondary/50 px-2 py-1.5 transition-colors active:bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-md ${bill.urgent ? "bg-destructive/10" : "bg-muted"}`}
                  >
                    <Icon
                      className={`h-3 w-3 ${bill.urgent ? "text-destructive" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-[11px] font-medium text-foreground">{bill.name}</p>
                    </div>
                    <p className="text-[9px] text-muted-foreground">
                      {bill.date} • {bill.daysLeft === 0 ? "Aujourd'hui" : `J-${bill.daysLeft}`}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] font-semibold font-serif text-foreground">{formatCurrency(bill.amount)}</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
