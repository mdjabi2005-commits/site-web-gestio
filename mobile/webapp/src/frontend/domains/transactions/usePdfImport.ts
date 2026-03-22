import { useState, useRef } from "react"
import { pyodideBridge } from "@/frontend/bridge/pyodide_bridge"
import { toast } from "sonner"

export type PdfImportStatus = "idle" | "importing" | "success" | "error"

export function usePdfImport() {
    const [status, setStatus] = useState<PdfImportStatus>("idle")
    const [result, setResult] = useState<any>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const importPdf = async () => {
        try {
            if (!fileInputRef.current) {
                const input = document.createElement("input")
                input.type = "file"
                input.accept = "application/pdf"
                fileInputRef.current = input
            }

            const file = await new Promise<File | null>((resolve) => {
                const input = fileInputRef.current!
                input.onchange = () => resolve(input.files?.[0] || null)
                input.onabort = () => resolve(null)
                input.click()
            })

            if (!file) return

            setStatus("importing")

            const arrayBuffer = await file.arrayBuffer()
            const base64 = btoa(
                new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
            )

            let data = await pyodideBridge.callApi<any>("process_pdf", [base64])

            if (typeof data === "string") {
                try {
                    data = JSON.parse(data)
                } catch(e) {
                    console.error("Failed to parse JSON from process_pdf:", e)
                }
            }

            if (data.error) {
                throw new Error(data.error)
            }

            console.log("[PdfImport] PROCESS_PDF RESULT:", JSON.stringify(data))

            setResult(data)
            setStatus("success")
            toast.success("PDF analysé avec succès !")
            return data
        } catch (err: any) {
            console.error("[PdfImport] Failed:", err)
            setStatus("error")
            toast.error(`Erreur lors de l'analyse : ${err instanceof Error ? err.message : String(err)}`)
        }
    }

    const reset = () => {
        setStatus("idle")
        setResult(null)
    }

    return {
        status,
        result,
        importPdf,
        reset
    }
}
