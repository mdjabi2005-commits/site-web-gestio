import { useState } from "react"
import { BudgetCard } from "../components/dashboard/budget-card"
import { EcheancesCard } from "../components/dashboard/echeances-card"
import { ObjectifsCard } from "../components/dashboard/objectifs-card"
import { TransactionsCard } from "../components/dashboard/transactions-card"
import { HomeHeader } from "../components/dashboard/home-header"
import { QuickActions } from "../components/dashboard/quick-actions"
import { TransactionSheet } from "../components/transactions/transaction-sheet"
import { QuickTransactionNotif } from "../components/transactions/quick-transaction-notif"
import { QuickBudgetNotif } from "../components/dashboard/quick-budget-notif"
import { QuickEcheanceNotif } from "../components/dashboard/quick-echeance-notif"
import { QuickObjectifNotif } from "../components/dashboard/quick-objectif-notif"
import { useHome } from "@/frontend/domains/home/useHome"
import { transactionStore } from "@/frontend/bridge/transaction_store"
import { deleteTransaction, type Transaction as BackendTransaction } from "@/frontend/api/transactions"
import type { TabId, Transaction as UITransaction } from "@/ui/types"
import type { PendingScanResult } from "@/App"

interface HomeViewProps {
    onTabChange?: (tab: TabId) => void
    pendingScanResult?: PendingScanResult | null
    onScanResultConsumed?: () => void
}

export function HomeView({ onTabChange, pendingScanResult, onScanResultConsumed }: HomeViewProps) {
    const { transactions, refresh } = useHome()

    // Mode ajout rapide → notification compacte
    const [activeNotif, setActiveNotif] = useState<'transaction' | 'budget' | 'echeance' | 'objectif' | null>(null)

    // Mode édition → grand TransactionSheet (conservé pour les détails)
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
    const [transactionToEdit, setTransactionToEdit] = useState<BackendTransaction | null>(null)

    const handleEdit = (uiTx: UITransaction) => {
        const bt = transactionStore.getTransactions().find((t) => t.id.toString() === uiTx.id)
        if (bt) {
            setTransactionToEdit(bt)
            setIsEditSheetOpen(true)
        }
    }

    const handleDelete = async (uiTx: UITransaction) => {
        if (window.confirm("Supprimer cette transaction ?")) {
            const numId = parseInt(uiTx.id)
            if (isNaN(numId)) return
            const success = await deleteTransaction(numId)
            if (success) {
                const updated = transactionStore.getTransactions().filter((t) => t.id !== numId)
                transactionStore.updateLocal(updated)
            }
        }
    }

    return (
        <main className="flex flex-col gap-4 px-3 pb-24 pt-6">
            <HomeHeader />
            <QuickActions
                onAddTransaction={() => setActiveNotif('transaction')}
                onScanClick={() => onTabChange?.("scan")}
                onAddBudget={() => setActiveNotif('budget')}
                onAddEcheance={() => setActiveNotif('echeance')}
                onAddObjectif={() => setActiveNotif('objectif')}
            />

            {/* Notifications compactes — ajout rapide manuel */}
            <QuickTransactionNotif
                open={activeNotif === 'transaction'}
                source="manuel"
                onConfirm={() => { setActiveNotif(null); refresh() }}
                onCancel={() => setActiveNotif(null)}
            />
            <QuickBudgetNotif
                open={activeNotif === 'budget'}
                onConfirm={() => { setActiveNotif(null) }}
                onCancel={() => setActiveNotif(null)}
            />
            <QuickEcheanceNotif
                open={activeNotif === 'echeance'}
                onConfirm={() => { setActiveNotif(null) }}
                onCancel={() => setActiveNotif(null)}
            />
            <QuickObjectifNotif
                open={activeNotif === 'objectif'}
                onConfirm={() => { setActiveNotif(null) }}
                onCancel={() => setActiveNotif(null)}
            />

            {/* Notification compacte — résultat de scan (depuis ScanView) */}
            <QuickTransactionNotif
                transaction={pendingScanResult ? {
                    montant: pendingScanResult.amount || pendingScanResult.montant,
                    description: pendingScanResult.merchant || pendingScanResult.description || "Scan IA",
                    categorie: pendingScanResult.categorie,
                    sous_categorie: pendingScanResult.sous_categorie ?? null,
                    date: pendingScanResult.date || new Date().toISOString().split('T')[0],
                } : null}
                source="scan"
                onConfirm={() => { onScanResultConsumed?.(); refresh() }}
                onCancel={() => onScanResultConsumed?.()}
            />

            {/* Sheet complet — édition d'une transaction existante */}
            <TransactionSheet
                open={isEditSheetOpen}
                onOpenChange={setIsEditSheetOpen}
                transactionToEdit={transactionToEdit}
                onSuccess={refresh}
            />

            <TransactionsCard
                transactions={transactions.slice(0, 5)}
                onSeeAll={() => onTabChange?.("transactions")}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            <BudgetCard />
            <EcheancesCard />
            <ObjectifsCard />
        </main>
    )
}
