import { useEffect, useState } from "react"
import { MobileNav } from "./ui/components/dashboard/mobile-nav"
import { ApkInstallPrompt } from "./ui/components/apk-install-prompt"
import type { TabId } from "@/ui/types"
import { HomeView } from "./ui/domains/home-view"
import { TransactionsView } from "./ui/domains/transactions-view"
import { BudgetsView } from "./ui/domains/budgets-view"
import { EcheancesView } from "./ui/domains/echeances-view"
import { ObjectifsView } from "./ui/domains/objectifs-view"
import { ComptesView } from "./ui/domains/comptes-view"
import { AnalyticsView } from "./ui/domains/analytics-view"
import { SettingsView } from "./ui/domains/settings-view"
import { ScanView } from "./ui/domains/scan-view"
import { pyodideBridge } from "./frontend/bridge/pyodide_bridge"
import { sqlBridge } from "./frontend/bridge/sql_bridge"
import { settingsStore } from "./frontend/bridge/settings_store"
import { transactionStore } from "./frontend/bridge/transaction_store"
import { usePyodide } from "./frontend/hooks/usePyodide"
import { Settings, Loader2 } from "lucide-react"

export function GlobalLoadingState({ detail }: { detail?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-bold font-serif text-foreground">Gestio</h2>
        <p className="text-sm text-foreground/60 mt-2">{detail || "Démarrage de la base de données..."}</p>
    </div>
  )
}

export function PyodideBackgroundStatus() {
  const { status, detail } = usePyodide()
  
  if (status === "ready" || status === "idle") return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 p-3 bg-secondary/90 backdrop-blur-sm rounded-lg border border-border shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
      <Loader2 className="w-4 h-4 text-primary animate-spin" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground">Moteur Python</p>
        <p className="text-[10px] text-foreground/60 truncate">{detail || "Initialisation..."}</p>
      </div>
      {status === "loading" && (
        <div className="w-12 h-1.5 bg-background rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-progress-indeterminate" />
        </div>
      )}
    </div>
  )
}

// Type minimal partagé entre ScanView et HomeView
export interface PendingScanResult {
  amount?: number
  montant?: number
  merchant?: string
  description?: string
  categorie?: string
  sous_categorie?: string | null
  date?: string
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("home")
  const [isInitializing, setIsInitializing] = useState(true)
  const [isFirstLaunch, setIsFirstLaunch] = useState(false)
  const [pendingScanResult, setPendingScanResult] = useState<PendingScanResult | null>(null)

  const { status: pyodideStatus } = usePyodide()

  useEffect(() => {
    if (pyodideStatus === "ready") {
      console.log("[App] Pyodide ready, re-hydrating stores...")
      // Invalider et re-charger
      settingsStore.invalidate()
      settingsStore.hydrate()
      transactionStore.fetchFromSql({ force: true })
    }
  }, [pyodideStatus])

  useEffect(() => {
    // Initialisation globale des bridges au démarrage
    const initBridges = async () => {
      try {
        console.log("[App] Initializing SQL bridge (Priority)...")
        await sqlBridge.init()
        
        // Détecter si c'est une première installation (tables absentes)
        const hasData = await sqlBridge.hasTables()
        setIsFirstLaunch(!hasData)
        
        if (hasData) {
            console.log("[App] Tables found, hydrating stores...")
            // Hydrater les stores en parallèle une seule fois au boot
            await Promise.all([
              settingsStore.hydrate(),
              transactionStore.fetchFromSql()
            ])
        } else {
            console.info("[App] First launch detected or missing tables: Skipping initial hydration.")
        }
        
        console.log("[App] Core ready, releasing UI lock")
        setIsInitializing(false)

        console.log("[App] Initializing Pyodide bridge (Background)...")
        // On ne l'attend pas ici pour rester non-bloquant
        pyodideBridge.init().catch(err => {
            console.error("[App] Pyodide initialization failed:", err)
        })
      } catch (err) {
        console.error("[App] Critical bridge initialization failed:", err)
        setIsInitializing(false)
      }
    }

    initBridges()
  }, [])

  const renderView = () => {
    if (isInitializing) return null
    
    switch (activeTab) {
      case "home": return (
        <HomeView
          onTabChange={setActiveTab}
          pendingScanResult={pendingScanResult}
          onScanResultConsumed={() => setPendingScanResult(null)}
        />
      )
      case "transactions": return <TransactionsView onTabChange={setActiveTab} />
      case "budgets": return <BudgetsView />
      case "echeances": return <EcheancesView />
      case "objectifs": return <ObjectifsView />
      case "comptes": return <ComptesView />
      case "analytics": return <AnalyticsView />
      case "settings": return <SettingsView />
      case "scan": return <ScanView />
      default: return <HomeView onTabChange={setActiveTab} pendingScanResult={null} onScanResultConsumed={() => {}} />
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 relative">
      <button 
        onClick={() => {
          console.log("[App] Settings button clicked")
          setActiveTab("settings")
        }}
        className="absolute right-4 p-3 z-50 rounded-full bg-secondary/50 text-foreground hover:bg-secondary active:scale-95 transition-all shadow-lg backdrop-blur-sm border border-white/10"
        style={{ top: "calc(1.5rem + env(safe-area-inset-top, 0px))" }}
        aria-label="Paramètres"
      >
        <Settings className="w-6 h-6" />
      </button>

      {isInitializing && <GlobalLoadingState detail={isFirstLaunch ? "Première installation : Préparation du moteur..." : undefined} />}
      {!isInitializing && <PyodideBackgroundStatus />}
      <ApkInstallPrompt />

      <main className="max-w-md mx-auto">
        {renderView()}
      </main>
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App
