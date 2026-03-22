import { useState, useMemo } from "react"
import TransactionList from "../components/transactions/transaction-list"
import { ChartCarousel } from "../components/transactions/chart-carousel"
import { StickyHeader } from "../components/transactions/sticky-header"
import { TransactionSheet } from "../components/transactions/transaction-sheet"
import { QuickTransactionNotif } from "../components/transactions/quick-transaction-notif"
import { useTransactions } from "@/frontend/domains/transactions/useTransactions"
import type { DatePeriod } from "../components/transactions/evolution-chart"
import type { DonutData } from "../components/transactions/donut-chart"
import type { TabId, Transaction as UITransaction } from "@/ui/types"
import type { Transaction as BackendTransaction } from "@/frontend/api/transactions"
import { Briefcase, Home, ShoppingCart, Car, Utensils, Heart, Gamepad2, Navigation, Tag } from "lucide-react"

const CATEGORY_ICONS: Record<string, any> = {
    "Alimentation": Utensils,
    "Voiture": Car,
    "Logement": Home,
    "Loisir": Gamepad2,
    "Santé": Heart,
    "Shopping": ShoppingCart,
    "Services": Briefcase,
    "Divers": Tag,
    "Uber": Navigation, 
}

export function TransactionsView({ onTabChange }: { onTabChange?: (tab: TabId) => void }) {
    const { transactions: backendTransactions, handleDelete, loading, refresh } = useTransactions();
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<BackendTransaction | null>(null);
    const [quickAddTransaction, setQuickAddTransaction] = useState<Partial<BackendTransaction> | null>(null);
    const [period, setPeriod] = useState<DatePeriod>({
        type: 'year',
        monthIndex: new Date().getMonth(),
        quarterIndex: Math.floor(new Date().getMonth() / 3),
        year: new Date().getFullYear(),
    });

    // On mappe les données backend vers le format UI attendu par les graphiques et la liste
    const transactions = useMemo<UITransaction[]>(() => {
        return backendTransactions.map(bt => {
            let normalized = (bt.categorie || "").trim().toLowerCase();
            if (normalized === "autre") normalized = "divers";
            if (normalized === "sante") normalized = "santé";
            
            const iconKey = Object.keys(CATEGORY_ICONS).find(k => k.toLowerCase() === normalized);
            const resolvedIcon = iconKey ? CATEGORY_ICONS[iconKey] : CATEGORY_ICONS["Divers"];

            return {
                id: bt.id.toString(),
                name: bt.description || bt.categorie,
                label: bt.description || bt.categorie,
                category: bt.categorie,
                parentCategory: bt.categorie,
                icon: resolvedIcon,
                amount: bt.montant,
                date: bt.date,
                type: String(bt.type).toLowerCase().includes("revenu") ? "revenu" : "dépense"
            };
        })
    }, [backendTransactions])

    const periodTransactions = useMemo(() => {
        return transactions.filter(t => {
            // Parsing robuste "YYYY-MM-DD" pour éviter les décalages de timezone
            const parts = t.date.split('-')
            if (parts.length < 2) return false
            
            const year = parseInt(parts[0], 10)
            const monthIndex = parseInt(parts[1], 10) - 1 // JS months are 0-indexed
            
            if (period.type === 'month') {
                return monthIndex === period.monthIndex && year === period.year;
            }
            if (period.type === 'quarter') {
                const qStart = period.quarterIndex * 3;
                const qEnd = qStart + 2;
                return monthIndex >= qStart && monthIndex <= qEnd && year === period.year;
            }
            return year === period.year;
        });
    }, [transactions, period]);

    const totalIncome = useMemo(
        () => periodTransactions.filter(t => t.type === 'revenu').reduce((sum, t) => sum + t.amount, 0),
        [periodTransactions]
    );

    const totalExpense = useMemo(
        () => periodTransactions.filter(t => t.type === 'dépense').reduce((sum, t) => sum + t.amount, 0),
        [periodTransactions]
    );

    const donutData = useMemo(() => {
        const map = new Map<string, DonutData>();
        periodTransactions.forEach(t => {
            const cat = t.category;
            const current = map.get(cat);
            if (current) {
                current.total += t.amount;
            } else {
                map.set(cat, { category: cat, total: t.amount, type: t.type });
            }
        });
        return Array.from(map.values()).sort((a, b) => b.total - a.total);
    }, [periodTransactions]);

    const filteredTransactions = useMemo(
        () => activeCategory ? periodTransactions.filter(t => t.category === activeCategory) : periodTransactions,
        [periodTransactions, activeCategory]
    );

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Chargement des transactions...</div>
    }

    return (
        <div className="flex flex-col relative pb-10">
            <StickyHeader
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                period={period}
                onPeriodChange={setPeriod}
                onAddClick={() => {
                    setQuickAddTransaction({
                        montant: 0,
                        date: new Date().toISOString().split('T')[0],
                        categorie: "",
                        description: "",
                    })
                }}
                onScanClick={() => onTabChange?.("scan")}
            />

            <div className="flex-1 w-full overflow-hidden">
                <ChartCarousel
                    donutData={donutData}
                    transactions={periodTransactions}
                    period={period}
                    onCategoryTap={setActiveCategory}
                    activeCategory={activeCategory}
                />

                <div className="px-3 mt-4">
                    <TransactionList
                        transactions={filteredTransactions}
                        onDelete={handleDelete}
                        onEdit={(uiTx) => {
                            const bt = backendTransactions.find(t => t.id.toString() === uiTx.id)
                            if (bt) {
                                setTransactionToEdit(bt)
                                setIsSheetOpen(true)
                            }
                        }}
                    />
                </div>
            </div>

            <TransactionSheet 
                open={isSheetOpen} 
                onOpenChange={setIsSheetOpen}
                transactionToEdit={transactionToEdit}
                onSuccess={refresh}
            />

            <QuickTransactionNotif 
                transaction={quickAddTransaction}
                source="manuel"
                onConfirm={() => {
                    setQuickAddTransaction(null)
                    refresh()
                }}
                onCancel={() => setQuickAddTransaction(null)}
            />
        </div>
    )
}
