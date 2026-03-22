/// <reference lib="webworker" />
import { WHEELS, BOOTSTRAP_PYTHON } from "./worker-config"

const getBasePath = () => {
    const workerUrl = import.meta.url
    const assetsIndex = workerUrl.indexOf('/assets/')
    return workerUrl.substring(0, assetsIndex)
}
const BASE = getBasePath()

console.log("[Worker] Script loaded at " + new Date().toISOString())

interface WorkerMessage { id: string; type: string; code?: string; function?: string; args?: unknown[]; level?: string; message?: string }
interface WorkerResponse { id: string; type: string; status?: string; detail?: string; data?: unknown; error?: string; level?: string; message?: string }

let pyodide: any = null
let executionQueue: Promise<any> = Promise.resolve()

const postResponse = (msg: WorkerResponse) => self.postMessage(msg)
const postLog = (level: "info" | "warn" | "error", message: string) => {
    if (level === "error") console.error(`[Worker ERROR] ${message}`)
    postResponse({ id: "log", type: "log", level, message: `[Worker] ${message.substring(0, 2000)}` })
}

async function initPyodide() {
    try {
        const startInit = performance.now()
        // @ts-ignore
        self.startInitTime = startInit; self.getPerformanceNow = () => performance.now()

        postResponse({ id: "init", type: "status", status: "loading", detail: "Ressources..." })
        const zipFetch = fetch(`${BASE}/backend.zip`), wheelFetches = WHEELS.map(w => fetch(`${BASE}/pyodide/${w}`))

        // @ts-ignore
        self.postPythonStatus = (d: string) => postResponse({ id: "init", type: "status", status: "loading", detail: d })
        // @ts-ignore
        self.postPythonLog = (l: string, m: string) => postResponse({ id: "log", type: "log", level: l as any, message: `[Python] ${m}` })

        const mod = await (new Function('url', 'return import(url)')).call(null, `${BASE}/pyodide/pyodide.mjs`)
        pyodide = await mod.loadPyodide({ indexURL: `${BASE}/pyodide/`, stdout: (msg: string) => console.log(`[STDOUT] ${msg}`) })

        if (!pyodide.FS.analyzePath("/backend").exists) pyodide.FS.mkdir("/backend")
        pyodide.FS.mount(pyodide.FS.filesystems.IDBFS, {}, "/backend")
        await new Promise<void>((res, rej) => pyodide.FS.syncfs(true, (err: any) => err ? rej(err) : res()))

        const zipBuff = await (await zipFetch).arrayBuffer(), currentSize = zipBuff.byteLength.toString()
        let storedSize = ""
        try { if (pyodide.FS.analyzePath("/backend/.version").exists) storedSize = pyodide.FS.readFile("/backend/.version", { encoding: "utf8" }) } catch(e) {}

        if (storedSize !== currentSize || !pyodide.FS.analyzePath("/backend/api").exists) {
            postResponse({ id: "init", type: "status", status: "loading", detail: "Mise à jour..." })
            pyodide.unpackArchive(zipBuff, "zip", { extractDir: "/backend" })
            pyodide.FS.writeFile("/backend/.version", currentSize)

            if (!pyodide.FS.analyzePath("/backend/site-packages").exists) pyodide.FS.mkdir("/backend/site-packages")
            await Promise.all(wheelFetches.map(async (f) => {
                const b = await (await f).arrayBuffer()
                pyodide.unpackArchive(b, "zip", { extractDir: "/backend/site-packages" })
            }))
            await new Promise<void>((res, rej) => pyodide.FS.syncfs(false, (err: any) => err ? rej(err) : res()))
        }

        await pyodide.runPythonAsync(BOOTSTRAP_PYTHON)
        postResponse({ id: "init", type: "status", status: "ready" })
    } catch (err) {
        postLog("error", `Init failed: ${err}`)
        postResponse({ id: "init", type: "status", status: "error" })
    }
}

async function runPython(id: string, code: string) {
    try {
        const res = await pyodide.runPythonAsync(code)
        postResponse({ id, type: "result", data: res?.toJs ? res.toJs({ dict_converter: Object.fromEntries }) : res })
    } catch (err) { postResponse({ id, type: "error", error: `${err}` }) }
}

async function callApi(id: string, fn: string, args: unknown[] = []) {
    try {
        const code = `import json, sys\napi = sys.modules.get('api_entry') or __import__('main_backend')\nawait getattr(api, "${fn}")(*json.loads(${JSON.stringify(JSON.stringify(args))}))`
        const res = await pyodide.runPythonAsync(code)
        postResponse({ id, type: "result", data: res?.toJs ? res.toJs({ dict_converter: Object.fromEntries }) : res })
    } catch (err) { postResponse({ id, type: "error", error: `${err}` }) }
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
    const { id, type, code, function: fn, args } = e.data
    switch (type) {
        case "init": executionQueue = executionQueue.then(() => initPyodide()); break
        case "run": if (code) executionQueue = executionQueue.then(() => runPython(id, code)); break
        case "call": if (fn) executionQueue = executionQueue.then(() => callApi(id, fn, args)); break
    }
}
