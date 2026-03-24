import { List, ChevronRight, Trash2 } from "lucide-react"
import type { Transaction } from "@/ui/types"
import { fmt } from "@/ui/types"

interface TransactionsCardProps {
    transactions?: Transaction[]
    onSeeAll?: () => void
    onEdit?: (tx: Transaction) => void
    onDelete?: (tx: Transaction) => void
}

export function TransactionsCard({ transactions = [], onSeeAll, onEdit, onDelete }: TransactionsCardProps) {
    return (
        <div className="flex flex-col rounded-xl border border-border bg-card p-3 transition-all">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
                        <List className="h-3 w-3 text-primary" />
                    </div>
                    <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Dernières Transactions
                    </h2>
                </div>
                <button
                    onClick={onSeeAll}
                    className="flex items-center gap-1 text-[9px] font-bold text-primary uppercase hover:underline"
                >
                    Tout voir
                    <ChevronRight className="h-2 w-2" />
                </button>
            </div>

            <div className="flex flex-col gap-2">
                {transactions.length === 0 && (
                    <p className="py-2 text-center text-[10px] text-muted-foreground italic">Aucune transaction</p>
                )}
                {transactions.map((tx) => (
                    <div 
                        key={tx.id} 
                        className="flex items-center justify-between group cursor-pointer active:scale-[0.99] transition-transform p-1 -m-1 rounded-md hover:bg-muted/30"
                        onClick={() => onEdit?.(tx)}
                    >
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[11px] font-medium text-foreground truncate">{tx.name}</span>
                            <span className="text-[9px] text-muted-foreground">{new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} • {tx.category}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[11px] font-bold font-serif ${tx.type === "revenu" ? "text-emerald-500" : "text-foreground"}`}>
                                {tx.type === "revenu" ? "+" : ""}{fmt(tx.amount)}
                            </span>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete?.(tx);
                                }}
                                className="p-1.5 opacity-0 group-hover:opacity-100 rounded-full bg-muted/50 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
