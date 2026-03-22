// webapp/frontend/bridge/pyodide_bridge.ts
console.log("[PyodideBridge] Module loaded and executing at " + new Date().toISOString())
// Singleton qui gère la communication avec le Web Worker Pyodide (OCR uniquement)

export type PyodideStatus = "idle" | "loading" | "ready" | "error"

class PyodideBridge {
    private worker: Worker | null = null
    private status: PyodideStatus = "idle"
    private statusDetail: string = ""
    private statusListeners: ((status: PyodideStatus) => void)[] = []
    private detailListeners: ((detail: string) => void)[] = []
    private pendingRequests = new Map<string, { resolve: (data: any) => void; reject: (err: Error) => void }>()
    private requestIdCounter = 0
    private initPromise: Promise<void> | null = null

    constructor() {
        if (typeof window !== "undefined") {
            const globalRef = (window as any).__GESTIO_PYODIDE_INSTANCE
            if (globalRef) {
                console.log("[PyodideBridge] Reusing existing global instance found on window.")
                return
            }
            ;(window as any).__GESTIO_PYODIDE_INSTANCE = this as any

            this.init().catch((err) => console.error("[PyodideBridge] Background init failed:", err))
        }
    }

    private pendingCalls = new Map<string, Promise<any>>()
    private nextId(): string {
        return `msg_${++this.requestIdCounter}_${Date.now()}`
    }

    private setStatus(status: PyodideStatus, detail?: string) {
        this.status = status
        if (detail !== undefined) {
            this.statusDetail = detail
            this.detailListeners.forEach((listener) => listener(detail))
        }
        console.log(`[PyodideBridge] Status changed: ${status}${detail ? ` (${detail})` : ""}`)
        this.statusListeners.forEach((listener) => listener(status))
    }

    async init(): Promise<void> {
        if (this.status === "ready") return
        if (this.status === "loading" && this.initPromise) return this.initPromise

        console.log("[PyodideBridge] Starting initialization...")
        this.status = "loading"
        this.initPromise = new Promise((resolve, reject) => {
            try {
                this.worker = new Worker(new URL("../workers/pyodide.worker.ts", import.meta.url), {
                    type: "module",
                })

                this.worker.onmessage = async (event) => {
                    const { id, type, status, data, error, level, message } = event.data

                    if (type === "log" && message) {
                        const logMethod = level === "error" ? "error" : level === "warn" ? "warn" : "info"
                        console[logMethod === "info" ? "log" : logMethod](message)
                        return
                    }

                    if (type === "status" && status) {
                        this.setStatus(status, event.data.detail)
                        if (status === "ready") resolve()
                        if (status === "error") {
                            console.error("[PyodideBridge] Worker initialization failed. Check logs above.")
                            reject(new Error(`Worker status error: ${error || "Unknown error"}`))
                        }
                    } else if (type === "result" || type === "error") {
                        const pending = this.pendingRequests.get(id)
                        if (pending) {
                            this.pendingRequests.delete(id)
                            if (type === "error") pending.reject(new Error(error))
                            else pending.resolve(data)
                        }
                    }
                }

                this.worker.onerror = (err) => {
                    this.setStatus("error")
                    console.error("[PyodideBridge] Worker error:", err)
                    reject(err)
                }

                this.worker.postMessage({ id: "init", type: "init" })
            } catch (err) {
                this.setStatus("error")
                reject(err)
            }
        })

        try {
            await this.initPromise
        } finally {
            if ((this.status as any) !== "ready") this.initPromise = null
        }
    }

    async callApi<T = unknown>(functionName: string, args: any[] = []): Promise<T> {
        const callKey = `${functionName}:${JSON.stringify(args)}`
        const existingCall = this.pendingCalls.get(callKey)
        if (existingCall) {
            console.log(`[PyodideBridge] Reusing pending promise for ${functionName}`)
            return existingCall
        }

        const callPromise = (async () => {
            try {
                console.log(`[PyodideBridge] callApi called: ${functionName}`, args)
                if (this.status !== "ready") {
                    console.warn(`[PyodideBridge] callApi called for ${functionName} but engine is NOT READY (Current status: ${this.status}). Waiting for init...`)
                    await this.init()
                }

                return await new Promise<T>((resolve, reject) => {
                    const id = this.nextId()
                    this.pendingRequests.set(id, { resolve, reject })
                    console.log(`[PyodideBridge] Sending message to worker: ${functionName}, id: ${id}`)
                    this.worker?.postMessage({
                        id,
                        type: "call",
                        function: functionName,
                        args,
                    })
                })
            } finally {
                this.pendingCalls.delete(callKey)
            }
        })()

        this.pendingCalls.set(callKey, callPromise)
        return callPromise
    }

    async runPython<T = unknown>(code: string): Promise<T> {
        if (this.status !== "ready") {
            await this.init()
        }

        return new Promise((resolve, reject) => {
            const id = this.nextId()
            this.pendingRequests.set(id, { resolve, reject })
            this.worker?.postMessage({
                id,
                type: "run",
                code,
            })
        })
    }

    onStatusChange(listener: (status: PyodideStatus) => void) {
        this.statusListeners.push(listener)
        return () => {
            this.statusListeners = this.statusListeners.filter((l) => l !== listener)
        }
    }

    onDetailChange(listener: (detail: string) => void) {
        this.detailListeners.push(listener)
        return () => {
            this.detailListeners = this.detailListeners.filter((l) => l !== listener)
        }
    }

    getStatus(): PyodideStatus {
        return this.status
    }

    getDetail(): string {
        return this.statusDetail
    }
}

export const pyodideBridge = new PyodideBridge()
