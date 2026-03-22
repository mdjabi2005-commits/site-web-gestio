// webapp/src/ui/components/transactions/transaction-sheet.tsx
import { Sheet, SheetContent } from "@/ui/components/ui/sheet"
import { type Transaction } from "@/frontend/api/transactions"
import { TransactionForm } from "./transaction-form"

interface TransactionSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    transactionToEdit?: Transaction | null
    onSuccess: () => void
}

export function TransactionSheet({ open, onOpenChange, transactionToEdit, onSuccess }: TransactionSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent 
                side="bottom" 
                className="max-h-[85vh] h-auto overflow-y-auto rounded-t-[3rem] px-6 pb-24 pt-2 border-t-0 shadow-2xl bg-background/95 backdrop-blur-2xl transition-all duration-500"
            >
                <div className="mx-auto w-12 h-1.5 rounded-full bg-muted/30 mb-6 mt-2" />
                
                <div className="space-y-6">
                    <div className="space-y-2">
                         <h2 className="text-2xl font-black italic tracking-tighter">
                            {transactionToEdit?.id ? "MODIFIER" : "NOUVELLE TRANSACTION"}
                        </h2>
                        <p className="text-sm text-muted-foreground italic">
                            {transactionToEdit?.id ? "Ajustez les détails de votre dépense." : "Enregistrez une nouvelle dépense manuellement."}
                        </p>
                    </div>
                    <TransactionForm 
                        transactionToEdit={transactionToEdit}
                        onSuccess={onSuccess}
                        onClose={() => onOpenChange(false)}
                    />
                </div>
            </SheetContent>
        </Sheet>
    )
}
