// webapp/frontend/domains/transactions/useTransactions.ts
// Hook frontend pour la gestion des transactions

import { useState, useCallback, useEffect } from "react"
import { deleteTransaction as apiDeleteTransaction, type Transaction as BackendTransaction } from "@/frontend/api/transactions"
import { pyodideBridge, type PyodideStatus } from "@/frontend/bridge/pyodide_bridge"
import { transactionStore } from "@/frontend/bridge/transaction_store"

export function useTransactions() {
    const [transactions, setTransactions] = useState<BackendTransaction[]>(transactionStore.getTransactions())
    const [loading, setLoading] = useState(true)

    const fetchTransactions = useCallback(async () => {
        setLoading(true)
        try {
            // Utiliser le store pour gérer le cache et l'accès SQL instantané
            const data = await transactionStore.fetchIfNeeded()
            setTransactions(data)
        } catch (err) {
            console.error("Failed to fetch transactions:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // Chargement initial (marche dès le boot via SQL)
        fetchTransactions()

        // S'abonner aux changements du store pour rester synchrone avec useHome
        const unsubscribeStore = transactionStore.subscribe((data) => {
            setTransactions(data)
        })

        const unsubscribeBridge = pyodideBridge.onStatusChange((status: PyodideStatus) => {
            if (status === "ready") {
                fetchTransactions()
            }
        })

        return () => {
            unsubscribeStore()
            unsubscribeBridge()
        }
    }, [fetchTransactions])

    const handleDelete = useCallback(async (id: string) => {
        const numId = parseInt(id)
        if (isNaN(numId)) return

        const success = await apiDeleteTransaction(numId)
        if (success) {
            // Mettre à jour le store global pour que l'accueil soit aussi à jour
            const updated = transactions.filter(t => t.id !== numId)
            transactionStore.updateLocal(updated)
        } else {
            alert("Erreur lors de la suppression")
        }
    }, [transactions])

    return {
        transactions,
        loading,
        handleDelete,
        refresh: async () => {
            await transactionStore.forceRefresh()
        }
    }
}
