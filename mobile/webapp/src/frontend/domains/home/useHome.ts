// webapp/frontend/domains/home/useHome.ts
// Hook frontend pour le dashboard Accueil

import { useState, useCallback, useEffect } from "react"
import { Briefcase, Home, ShoppingCart, Car, Utensils, Heart, Gamepad2, Navigation, Tag } from "lucide-react"
import { type Transaction as BackendTransaction } from "@/frontend/api/transactions"
import { pyodideBridge, type PyodideStatus } from "@/frontend/bridge/pyodide_bridge"
import { transactionStore } from "@/frontend/bridge/transaction_store"
import type { Transaction as UITransaction } from "@/ui/types"

// Mappage des catégories vers les icônes Lucide
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

function mapToUI(bt: BackendTransaction): UITransaction {
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
    }
}

export function useHome() {
    const [currentMonth, setCurrentMonth] = useState(0)
    const [transactions, setTransactions] = useState<UITransaction[]>(transactionStore.getTransactions().map(mapToUI))
    const [loading, setLoading] = useState(true)

    const fetchHomeData = useCallback(async () => {
        setLoading(true)
        try {
            // fetchIfNeeded gère maintenant la priorité SQL (instant) 
            const data = await transactionStore.fetchIfNeeded()
            setTransactions(data.map(mapToUI))
        } catch (err) {
            console.error("Failed to fetch home transactions:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // Chargement initial (via fetchIfNeeded qui gère le SQL)
        fetchHomeData()

        // S'abonner aux changements du store (si TransactionsView modifie un truc, Home se met à jour)
        const unsubscribeStore = transactionStore.subscribe((data) => {
            setTransactions(data.map(mapToUI))
        })

        // Écouter le status Pyodide pour le passage Fallback SQL -> Full Python
        const unsubscribeBridge = pyodideBridge.onStatusChange((status: PyodideStatus) => {
            if (status === "ready") {
                fetchHomeData()
            }
        })

        return () => {
            unsubscribeStore()
            unsubscribeBridge()
        }
    }, [fetchHomeData])
    
    // Front-End Intelligence: Calculs dérivés depuis le Store
    const now = new Date()
    const summary = transactionStore.getMonthlySummary(now.getFullYear(), now.getMonth() + 1)
    
    const balance = summary.solde
    const soldeGlobal = summary.solde_global
    const totalIncome = summary.total_revenus
    const totalExpense = summary.total_depenses

    const handleMonthChange = useCallback((month: number) => {
        setCurrentMonth(month)
        // Les filtres par date pourront être ajoutés ici plus tard
    }, [])

    return {
        transactions,
        currentMonth,
        balance,
        soldeGlobal,
        totalIncome,
        totalExpense,
        loading,
        onMonthChange: handleMonthChange,
        refresh: fetchHomeData
    }
}
