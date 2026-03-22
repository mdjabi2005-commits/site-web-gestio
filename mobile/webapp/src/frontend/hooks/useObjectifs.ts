// webapp/src/frontend/hooks/useObjectifs.ts
import { useState, useEffect, useCallback } from "react"
import type { Objectif } from "../api/objectifs"
import { objectifStore } from "../bridge/objectif_store"

export function useObjectifs() {
    const [objectifs, setObjectifs] = useState<Objectif[]>(objectifStore.get())
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = objectifStore.subscribe((data) => {
            setObjectifs(data)
            setIsLoading(false)
        })

        objectifStore.fetchIfNeeded().finally(() => {
            setIsLoading(false)
        })

        return unsubscribe
    }, [])

    const refetch = useCallback(() => {
        objectifStore.invalidate()
        setIsLoading(true)
        return objectifStore.fetchIfNeeded()
    }, [])

    return {
        objectifs,
        isLoading,
        refetch,
        addObjectif: (data: Partial<Objectif>) => objectifStore.addObjectif(data),
        updateObjectif: (id: number, data: Partial<Objectif>) => objectifStore.updateObjectif(id, data),
        deleteObjectif: (id: number) => objectifStore.deleteObjectif(id),
        refreshObjectifs: () => objectifStore.refreshObjectifs()
    }
}
