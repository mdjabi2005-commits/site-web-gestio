import { useState } from "react";
import { Home, Smartphone, Briefcase, Download, HelpCircle } from "lucide-react";

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

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="sticky top-[72px] z-40 bg-card/95 backdrop-blur-lg border-b border-border">
      <div className="container">
        <div className="flex overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap
                border-b-2 transition-colors
                ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { tabs };
export type { TabId, Tab };
