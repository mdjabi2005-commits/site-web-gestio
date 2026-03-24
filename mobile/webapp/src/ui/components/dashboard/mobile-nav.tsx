import { LayoutDashboard, Wallet, Calendar, Target, List } from "lucide-react"
import type { TabId } from "@/ui/types"

const mainNavLinks: { label: string; icon: any; id: TabId }[] = [
  { label: "Accueil", icon: LayoutDashboard, id: "home" },
  { label: "Transactions", icon: List, id: "transactions" },
  { label: "Budgets", icon: Wallet, id: "budgets" },
  { label: "Echeances", icon: Calendar, id: "echeances" },
  { label: "Objectifs", icon: Target, id: "objectifs" },
]

interface MobileNavProps {
  activeTab: TabId
  onTabChange: (id: TabId) => void
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] block border-t border-border bg-card"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Navigation mobile"
    >
      <div className="grid h-16 grid-cols-5 bg-card">
        {mainNavLinks.map((link) => {
          const Icon = link.icon
          const isActive = activeTab === link.id
          return (
            <button
              key={link.id}
              onClick={() => onTabChange(link.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${isActive
                ? "text-primary"
                : "text-muted-foreground"
                }`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${isActive ? "bg-primary/10" : ""}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium">{link.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
