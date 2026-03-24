import { useState, useEffect } from "react"
import { ShieldCheck, Download, X } from "lucide-react"

export function ApkInstallPrompt() {
  const [isVisible, setIsVisible] = useState(false)
  const [isNative, setIsNative] = useState(false)
  
  useEffect(() => {
    // Ne pas afficher si on est déjà dans Capacitor
    if (window.hasOwnProperty('Capacitor')) {
      setIsNative(true)
      return
    }

    // Vérifier si déjà ignoré
    const isDismissed = localStorage.getItem("apk_prompt_dismissed")
    if (isDismissed) return

    // Attendre 5 minutes (300 000 ms) avant de proposer l'installation
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("apk_prompt_dismissed", "true")
  }

  if (!isVisible || isNative) return null

  return (
    <div className="fixed inset-x-4 bottom-24 z-[60] animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl p-5 shadow-2xl border border-white/20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          
          <div className="flex-1 pr-4">
            <h3 className="font-bold text-base mb-1">Passer à l'application Native</h3>
            <p className="text-sm text-indigo-100 leading-relaxed">
              Pour une meilleure stabilité et la sauvegarde permanente de vos données, installez l'application Android (APK).
            </p>
            <p className="text-[11px] mt-2 text-indigo-200 italic">
              Code open-source et sécurisé sur GitHub.
            </p>
            
            <div className="flex gap-3 mt-4">
              <a 
                href="https://github.com/mdjabi2005-commits/gestio-mobile/releases/latest/download/gestio-mobile-latest.apk"
                className="flex-1 bg-white text-indigo-700 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 active:scale-95 transition-all shadow-lg"
              >
                <Download className="w-4 h-4" />
                Installer l'APK
              </a>
              <button 
                onClick={handleDismiss}
                className="px-4 py-2.5 bg-indigo-500/30 text-white rounded-xl font-medium text-sm hover:bg-indigo-500/50 transition-all font-semibold"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
