import { Bell } from "lucide-react"
import { useHome } from "@/frontend/domains/home/useHome"

export function HomeHeader() {
    const { soldeGlobal = 0 } = useHome();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
    }

    return (
        <div className="flex flex-col gap-4 mb-2">
            <div className="flex items-center justify-between mt-2">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground pr-10">
                        Bonjour Djabi 👋
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Voici votre vue d'ensemble
                    </p>
                </div>
                <div className="flex items-center gap-3 pr-12">
                    <button className="relative p-2 rounded-full bg-secondary/50 text-foreground hover:bg-secondary transition-colors hidden">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
                    </button>
                    {/* Le bouton settings a été déplacé dans App.tsx pour être global */}
                </div>
            </div>

            <div className="flex flex-col gap-1 mt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Solde Total Disponible
                </span>
                <div className="flex items-end gap-3">
                    <span className="text-4xl font-black font-serif tracking-tight text-foreground">
                        {formatCurrency(soldeGlobal)}
                    </span>
                    <span className="text-sm font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md mb-1.5">
                        +2.4%
                    </span>
                </div>
            </div>
        </div>
    )
}
