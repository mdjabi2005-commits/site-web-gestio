// webapp/frontend/hooks/usePyodide.ts
// Hook React pour le status et l'initialisation de Pyodide

import { useEffect, useState } from "react"
import { pyodideBridge, type PyodideStatus } from "../bridge/pyodide_bridge"

export function usePyodide() {
    const [status, setStatus] = useState<PyodideStatus>(pyodideBridge.getStatus())
    const [detail, setDetail] = useState<string>(pyodideBridge.getDetail())

    useEffect(() => {
        const unsubscribeStatus = pyodideBridge.onStatusChange(setStatus)
        const unsubscribeDetail = pyodideBridge.onDetailChange(setDetail)

        // Auto-init si pas encore charg├®
        if (pyodideBridge.getStatus() === "idle") {
            pyodideBridge.init().catch(() => {
                // L'erreur est d├®j├á g├®r├®e par le status listener
            })
        }

        return () => {
            unsubscribeStatus()
            unsubscribeDetail()
        }
    }, [])

    return {
        status,
        detail,
        isReady: status === "ready",
        isLoading: status === "loading",
        runPython: pyodideBridge.runPython.bind(pyodideBridge),
    }
}
