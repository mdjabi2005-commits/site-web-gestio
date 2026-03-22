import { useState, useEffect, useRef } from "react"
import { Camera, Check, ScanLine, Loader2 } from "lucide-react"
import { useScan } from "@/frontend/domains/transactions/useScan"
import { usePdfImport } from "@/frontend/domains/transactions/usePdfImport"
import { Button } from "../components/ui/button"
import { ScannerOverlay } from "../components/scan/scanner-overlay"
import type { PendingScanResult } from "@/App"

interface ScanViewProps {
    onScanResult?: (result: PendingScanResult) => void
}

export function ScanView({ onScanResult }: ScanViewProps) {
    const { status: scanStatus, result: scanResult, error: scanError, capturedImage, handleScan, reset: resetScan } = useScan()
    const { status: pdfStatus, result: pdfResult, importPdf, reset: resetPdf } = usePdfImport()

    const result = scanResult || pdfResult
    const error = scanError
    const isProcessing = scanStatus === "processing" || pdfStatus === "importing"

    const [isConfirmed, setIsConfirmed] = useState(false)
    const [showFlash] = useState(false)


    const reset = () => { resetScan(); resetPdf(); setIsConfirmed(false) }

    // Dès qu'un résultat est prêt, naviguer vers Home via le callback
    const onScanResultRef = useRef(onScanResult)
    onScanResultRef.current = onScanResult

    useEffect(() => {
        if (result && onScanResultRef.current) {
            onScanResultRef.current(result)
            resetScan()
            resetPdf()
        }
    }, [result, resetScan, resetPdf])

    // ── Ouverture caméra ──────────────────────────────────────────────────────
    if (scanStatus === "scanning") {
        return (
            <div className="relative h-[80vh] flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-black">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-white/60 animate-pulse">Ouverture de la caméra...</p>
            </div>
        )
    }

    // ── Traitement / IA ───────────────────────────────────────────────────────
    if (isProcessing) {
        return (
            <div className="relative h-[80vh] flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-black">
                {capturedImage && (
                    <img src={capturedImage} className="absolute inset-0 w-full h-full object-cover opacity-60 blur-[1px]" alt="Ticket capturé" />
                )}
                <ScannerOverlay isScanning={true} showFlash={showFlash} />
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                        <Camera className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-emerald-500" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Analyse IA</h2>
                        <div className="flex items-center gap-2 justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
                            {pdfStatus === "importing" ? "Extraction PDF" : "Analyse du ticket"}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // ── Succès confirmé ───────────────────────────────────────────────────────
    if (isConfirmed) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-6 animate-in zoom-in duration-500 text-center">
                <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Check className="w-12 h-12 text-white" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black italic tracking-tighter">SUCCÈS !</h2>
                    <p className="text-muted-foreground">La transaction a été ajoutée.</p>
                </div>
                <Button variant="ghost" className="mt-4 font-bold uppercase tracking-widest text-xs" onClick={reset}>
                    Nouveau scan
                </Button>
            </div>
        )
    }

    // ── Écran d'accueil du scanner ────────────────────────────────────────────
    return (
        <div className="flex flex-col items-center justify-center h-[80vh] px-6 text-center gap-8 animate-in fade-in duration-500">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/20 shadow-inner">
                <ScanLine className="w-12 h-12 text-emerald-500" />
            </div>

            <div className="space-y-3">
                <h1 className="text-3xl font-black italic tracking-tighter uppercase">Scanneur Intelligent</h1>
                <p className="text-muted-foreground max-w-[280px]">
                    Capturez un ticket ou importez un PDF. Notre IA s'occupe de tout extraire pour vous.
                </p>
            </div>

            <div className="flex flex-col w-full gap-4">
                <Button onClick={handleScan} className="w-full h-16 rounded-3xl text-xl font-bold shadow-2xl shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all flex gap-3">
                    <Camera className="w-6 h-6" />
                    DÉMARRER SCAN
                </Button>

                <Button variant="secondary" onClick={() => importPdf()} className="w-full h-14 rounded-2xl font-bold bg-secondary/50 hover:bg-secondary active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 opacity-50" />
                    IMPORTER UN PDF
                </Button>
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-2xl border border-destructive/20 animate-in shake duration-300">
                    {error}
                </div>
            )}
        </div>
    )
}
