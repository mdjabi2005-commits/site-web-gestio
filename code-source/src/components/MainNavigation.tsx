import { useState } from "react";
import { Home, Smartphone, Briefcase, Download, HelpCircle, Menu, X } from "lucide-react";
import GestioLogo from "./GestioLogo";

export type TabId = "home" | "mobile" | "services" | "download" | "faq";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const tabs: Tab[] = [
  { id: "home", label: "Accueil", icon: Home },
  { id: "mobile", label: "Mobile", icon: Smartphone },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "download", label: "Télécharger", icon: Download },
  { id: "faq", label: "FAQ", icon: HelpCircle },
];

interface MainNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function MainNavigation({ activeTab, onTabChange }: MainNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between h-[72px]">
            <a href="#" className="flex items-center gap-3 text-2xl font-bold text-foreground no-underline">
              <GestioLogo />
              Gestio
            </a>
            <div className="hidden md:flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                    transition-colors
                    ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            <button 
              className="md:hidden p-2" 
              onClick={() => setMobileOpen(true)} 
              aria-label="Menu"
            >
              <Menu className="w-7 h-7 text-foreground" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[999] bg-background/[0.98] flex flex-col items-center justify-center gap-6">
          <button 
            className="absolute top-6 right-6" 
            onClick={() => setMobileOpen(false)} 
            aria-label="Fermer"
          >
            <X className="w-8 h-8 text-foreground" />
          </button>
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                setMobileOpen(false);
              }} 
              className="flex items-center gap-3 text-2xl font-semibold text-foreground"
            >
              <tab.icon className="w-6 h-6" />
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export { tabs };
export type { TabId, Tab };
