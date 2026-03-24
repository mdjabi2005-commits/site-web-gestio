import { ScanLine, Download, ShieldCheck } from "lucide-react"
import { Button } from "../components/ui/button"

export function ScanView() {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh] px-6 text-center gap-8 animate-in fade-in duration-500">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/20 shadow-inner">
                <ScanLine className="w-12 h-12 text-emerald-500" />
            </div>

            <div className="space-y-4">
                <h1 className="text-3xl font-black italic tracking-tighter uppercase">Scanneur IA</h1>
                <p className="text-muted-foreground">
                    La fonctionnalité de scan intelligent (extraction de tickets et reçus par Intelligence Artificielle) n'est disponible que sur l'application mobile native.
                </p>
                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-3 text-left">
                     <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                     <p className="text-sm text-indigo-900/80">
                         L'application native offre également une meilleure sécurité, des performances accrues et fonctionne **sans connexion internet**.
                     </p>
                </div>
            </div>

            <div className="flex flex-col w-full gap-4 mt-4">
                <Button 
                    asChild
                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all flex gap-3"
                >
                    <a href="https://github.com/mdjabi2005-commits/gestio-mobile/releases/latest/download/gestio-mobile-latest.apk">
                        <Download className="w-5 h-5" />
                        TÉLÉCHARGER L'APK
                    </a>
                </Button>
            </div>
        </div>
    )
}
