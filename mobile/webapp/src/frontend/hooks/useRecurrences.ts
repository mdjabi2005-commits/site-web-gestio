// webapp/src/frontend/hooks/useRecurrences.ts
import { useState, useEffect, useCallback } from 'react'
import { recurrenceStore } from '../bridge/recurrence_store'
import type { Recurrence } from '../api/recurrences'
import { pyodideBridge } from '../bridge/pyodide_bridge'

export function useRecurrences() {
    const [recurrences, setRecurrences] = useState<Recurrence[]>(recurrenceStore.getRecurrences())
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = recurrenceStore.subscribe((data) => {
            setRecurrences(data)
            setIsLoading(false)
        })

        // On check si Pyodide est prêt, sinon on tente via SQL
        if (pyodideBridge.getStatus() === "ready") {
            recurrenceStore.fetchIfNeeded().finally(() => setIsLoading(false))
        } else {
            // Premier passage SQL
            recurrenceStore.fetchFromSql().finally(() => setIsLoading(false))
            
            // Attente de Python
            const cleanup = pyodideBridge.onStatusChange((status) => {
                if (status === "ready") {
                    recurrenceStore.fetchIfNeeded()
                }
            })
            return () => {
                unsubscribe()
                cleanup()
            }
        }

        return unsubscribe
    }, [])

    const addRecurrence = useCallback(async (data: Partial<Recurrence>) => {
        return await recurrenceStore.addRecurrence(data)
    }, [])

    const updateRecurrence = useCallback(async (id: number, data: Partial<Recurrence>) => {
        return await recurrenceStore.updateRecurrence(id, data)
    }, [])

    const deleteRecurrence = useCallback(async (id: number) => {
        return await recurrenceStore.deleteRecurrence(id)
    }, [])

    const refreshEcheances = useCallback(async () => {
        return await recurrenceStore.refreshEcheances()
    }, [])

    return {
        recurrences,
        isLoading,
        addRecurrence,
        updateRecurrence,
        deleteRecurrence,
        refreshEcheances
    }
}
