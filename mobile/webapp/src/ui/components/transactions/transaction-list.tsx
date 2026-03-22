import { AnimatePresence, motion } from 'framer-motion';
import type { Transaction } from "@/ui/types"
import { TransactionCardSwipe } from './transaction-card-swipe';

interface TransactionListProps {
    transactions?: Transaction[];
    onDelete?: (id: string) => void;
    onEdit?: (tx: Transaction) => void;
}

export default function TransactionList({ transactions = [], onDelete = () => { }, onEdit }: TransactionListProps) {
    return (
        <div className="flex flex-col pb-20 mt-2">
            <div className="flex items-center justify-between px-1 mb-2">
                <h2 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Historique</h2>
                <span className="text-[10px] font-medium text-muted-foreground">{transactions.length} opérations</span>
            </div>

            {transactions.length === 0 && (
                <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center mt-2">
                    <p className="text-xs text-muted-foreground italic">Aucune transaction trouvée</p>
                </div>
            )}

            <div className="flex flex-col">
                <AnimatePresence mode="popLayout">
                    {transactions.map((tx) => (
                        <motion.div
                            key={tx.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -200, transition: { duration: 0.2 } }}
                        >
                            <TransactionCardSwipe transaction={tx} onDelete={onDelete} onEdit={onEdit} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
