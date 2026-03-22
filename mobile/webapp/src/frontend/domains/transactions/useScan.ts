import { useState, useCallback, useRef } from "react"
import { pyodideBridge } from "../../bridge/pyodide_bridge"

interface ScanResult {
    description: string
    amount: number
    merchant?: string
    categorie: string
    date: string
    sous_categorie?: string | null
}

type ScanStatus = "idle" | "scanning" | "processing" | "success" | "error"

export function useScan() {
    const [status, setStatus] = useState<ScanStatus>("idle")
    const [result, setResult] = useState<ScanResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const scanDocument = useCallback(async () => {
        setStatus("scanning")
        setError(null)
        setResult(null)

        try {
            if (!fileInputRef.current) {
                const input = document.createElement("input")
                input.type = "file"
                input.accept = "image/*"
                fileInputRef.current = input
            }

            const file = await new Promise<File | null>((resolve) => {
                const input = fileInputRef.current!
                input.onchange = () => resolve(input.files?.[0] || null)
                input.onabort = () => resolve(null)
                input.click()
            })

            if (!file) {
                setStatus("idle")
                return
            }

            console.log("[useScan] Image selected:", file.name)
            setCapturedImage(URL.createObjectURL(file))
            setStatus("processing")

            await new Promise(r => setTimeout(r, 500))

            const arrayBuffer = await file.arrayBuffer()
            const base64 = btoa(
                new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
            )

            console.log("[useScan] Image converted to base64. Extracting text via Pyodide OCR...")

            const ocrResult = await pyodideBridge.callApi<ScanResult>("scan_image_base64", [base64])

            console.log("[useScan] Backend result received:", ocrResult)

            if (ocrResult) {
                setResult(ocrResult)
                setStatus("success")
            } else {
                throw new Error("L'analyse du texte a échoué")
            }
        } catch (err) {
            console.error("[useScan] Scan/OCR Error:", err)
            setError(err instanceof Error ? err.message : "Erreur lors de l'analyse du ticket")
            setStatus("error")
        }
    }, [])

    const reset = useCallback(() => {
        setStatus("idle")
        setResult(null)
        setError(null)
        if (capturedImage) URL.revokeObjectURL(capturedImage)
        setCapturedImage(null)
    }, [capturedImage])

    return {
        status,
        result,
        error,
        capturedImage,
        handleScan: scanDocument,
        reset,
    }
}
