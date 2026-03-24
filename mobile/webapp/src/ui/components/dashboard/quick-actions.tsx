import { Plus, ScanLine, Wallet, CalendarClock, Target } from "lucide-react"

interface QuickActionsProps {
    onAddTransaction?: () => void
    onScanClick?: () => void
    onAddBudget?: () => void
    onAddEcheance?: () => void
    onAddObjectif?: () => void
}

export function QuickActions({ 
    onAddTransaction, 
    onScanClick,
    onAddBudget,
    onAddEcheance,
    onAddObjectif
}: QuickActionsProps) {
    const actions = [
        { label: "Transaction", icon: <Plus className="w-6 h-6" />, color: "bg-primary text-primary-foreground", onClick: onAddTransaction },
        { label: "Scanner", icon: <ScanLine className="w-6 h-6" />, color: "bg-emerald-500 text-white", onClick: onScanClick },
        { label: "Budget", icon: <Wallet className="w-6 h-6" />, color: "bg-blue-500 text-white", onClick: onAddBudget },
        { label: "Échéance", icon: <CalendarClock className="w-6 h-6" />, color: "bg-purple-500 text-white", onClick: onAddEcheance },
        { label: "Objectif", icon: <Target className="w-6 h-6" />, color: "bg-amber-500 text-white", onClick: onAddObjectif }
    ]

    return (
        <div className="flex overflow-x-auto overflow-y-hidden hide-scrollbar gap-6 px-2 py-4 border-b border-border/50 pb-6 mb-4 snap-x">
            {actions.map((action, index) => (
                <button 
                    key={index} 
                    onClick={action.onClick}
                    className="flex flex-col items-center gap-3 min-w-[72px] snap-center group"
                >
                    <div className={`flex items-center justify-center w-14 h-14 rounded-full ${action.color} shadow-sm transition-transform active:scale-95 flex-shrink-0`}>
                        {action.icon}
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-center w-full leading-tight truncate">
                        {action.label}
                    </span>
                </button>
            ))}
        </div>
    )
}
