import { useState, useEffect } from "react"
import { ShieldCheck, Download, X, Smartphone } from "lucide-react"

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

    // Afficher immédiatement la proposition d'installation
    setIsVisible(true)
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
            <h3 className="font-bold text-base mb-1">L'application vous plait ?</h3>
            <p className="text-sm text-indigo-100 leading-relaxed">
              Installez l'APK pour en profiter à tout instant et sauvegarder vos données en permanence.
            </p>
            <p className="text-[11px] mt-2 text-indigo-200 italic">
              Code open-source et sécurisé sur GitHub.
            </p>
            
            <div className="flex gap-3 mt-4">
              <a
                href="https://gestio.software/mobile"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-white text-indigo-700 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 active:scale-95 transition-all shadow-lg"
              >
                <Smartphone className="w-4 h-4" />
                Découvrir
              </a>
              <a
                href="https://github.com/mdjabi2005-commits/gestio-mobile/releases/latest/download/gestio-mobile-latest.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-indigo-500 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-600 active:scale-95 transition-all shadow-lg"
              >
                <Download className="w-4 h-4" />
                Installer APK
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
