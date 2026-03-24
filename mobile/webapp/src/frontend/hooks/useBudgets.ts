// webapp/src/frontend/hooks/useBudgets.ts
import { useState, useEffect, useCallback } from 'react'
import { budgetStore } from '../bridge/budget_store'
import type { Budget, BudgetStatus, BudgetSummary } from '../api/budgets'
import { pyodideBridge } from '../bridge/pyodide_bridge'

export function useBudgets(year?: number, month?: number) {
    const [statuses, setStatuses] = useState<BudgetStatus[]>(budgetStore.getStatuses())
    const [summary, setSummary] = useState<BudgetSummary | null>(budgetStore.getSummary())
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (year !== undefined && month !== undefined) {
            budgetStore.setPeriod(year, month)
        }

        const unsubscribe = budgetStore.subscribe((newStatuses, newSummary) => {
            setStatuses(newStatuses)
            setSummary(newSummary)
            setIsLoading(false)
        })

        if (pyodideBridge.getStatus() === "ready") {
            budgetStore.fetchIfNeeded().finally(() => setIsLoading(false))
        } else {
            // Premier passage SQL
            budgetStore.fetchFromSql().finally(() => setIsLoading(false))
            
            // Attente de Python
            const cleanup = pyodideBridge.onStatusChange((status) => {
                if (status === "ready") {
                    budgetStore.fetchIfNeeded()
                }
            })
            return () => {
                unsubscribe()
                cleanup()
            }
        }

        return unsubscribe
    }, [year, month])

    const addBudget = useCallback(async (data: Partial<Budget>) => {
        return await budgetStore.addBudget(data)
    }, [])

    const updateBudget = useCallback(async (id: number, data: Partial<Budget>) => {
        return await budgetStore.updateBudget(id, data)
    }, [])

    const deleteBudget = useCallback(async (id: number) => {
        return await budgetStore.deleteBudget(id)
    }, [])

    return {
        statuses,
        summary,
        isLoading,
        addBudget,
        updateBudget,
        deleteBudget
    }
}
