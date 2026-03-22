import { Landmark, Plus } from "lucide-react"

export function ComptesView() {
    return (
        <main className="flex flex-col gap-4 px-4 pb-20 pt-4 md:gap-5 md:px-6 md:pb-8">
            {/* Page title + action */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 md:h-10 md:w-10">
                        <Landmark className="h-4 w-4 text-primary md:h-5 md:w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                            Comptes Bancaires
                        </h1>
                        <p className="text-xs text-muted-foreground md:text-sm">
                            Vue d'ensemble de vos comptes
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    Ajouter un compte
                </button>
            </div>

            <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center mt-4">
                <p className="text-xs text-muted-foreground italic">Aucun compte bancaire connecté</p>
            </div>
        </main>
    )
}
