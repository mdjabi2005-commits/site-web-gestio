import { useState, useEffect } from "react"
import { Download } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches)

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
      console.log("[PWA] Install prompt captured")
    }

    const handleInstalled = () => {
      setIsStandalone(true)
      setShowPrompt(false)
      console.log("[PWA] App installed")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    window.addEventListener("appinstalled", handleInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      window.removeEventListener("appinstalled", handleInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log("[PWA] User choice:", outcome)
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  if (isStandalone || !showPrompt) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-primary text-primary-foreground rounded-2xl p-4 shadow-2xl flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
          <Download className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Installer Gestio</p>
          <p className="text-xs opacity-80">Accès rapide depuis votre écran d'accueil</p>
        </div>
        <button
          onClick={handleInstall}
          className="px-4 py-2 bg-primary-foreground text-primary rounded-xl font-semibold text-sm hover:bg-opacity-90 active:scale-95 transition-all"
        >
          Installer
        </button>
      </div>
    </div>
  )
}
