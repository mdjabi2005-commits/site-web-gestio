import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { Trash2, ShoppingBag } from 'lucide-react';
import type { Transaction } from '@/ui/types';
import { getCategoryGradient } from '@/ui/lib/category-colors';

export function formatCurrency(n: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

interface TransactionCardSwipeProps {
    transaction: Transaction;
    onDelete: (id: string) => void;
    onEdit?: (tx: Transaction) => void;
}

export const TransactionCardSwipe = ({ transaction, onDelete, onEdit }: TransactionCardSwipeProps) => {
    const x = useMotionValue(0);
    const deleteOpacity = useTransform(x, [-100, -60], [1, 0]);
    const deleteScale = useTransform(x, [-100, -60], [1, 0.5]);
    
    const editOpacity = useTransform(x, [60, 100], [0, 1]);
    const editScale = useTransform(x, [60, 100], [0.5, 1]);

    const isPositive = transaction.type === "revenu";
    const Icon = transaction.icon || ShoppingBag;
    
    const categoryGradient = getCategoryGradient(transaction.category);
    const stopColor1 = categoryGradient.stops[0]; 
    const stopColor2 = categoryGradient.stops[1];

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x < -100) {
            onDelete(transaction.id);
        } else if (info.offset.x > 100 && onEdit) {
            onEdit(transaction);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-xl mb-1.5 border border-border">
            {/* Edit background */}
            <motion.div
                className="absolute inset-y-0 left-0 w-20 flex items-center justify-center bg-primary"
                style={{ opacity: editOpacity, scale: editScale }}
            >
                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </motion.div>

            {/* Delete background */}
            <motion.div
                className="absolute inset-y-0 right-0 w-20 flex items-center justify-center bg-destructive"
                style={{ opacity: deleteOpacity, scale: deleteScale }}
            >
                <Trash2 className="w-5 h-5 text-destructive-foreground" />
            </motion.div>

            {/* Card */}
            <motion.div
                className="relative flex items-center justify-between bg-card px-2 py-1.5 cursor-pointer active:scale-[0.99] transition-transform"
                drag="x"
                dragDirectionLock
                dragConstraints={{ left: -100, right: 100 }}
                dragElastic={0.1}
                style={{ x }}
                onDragEnd={handleDragEnd}
                onClick={() => {
                    // Prevent trigger if dragging
                    if (Math.abs(x.get()) < 5 && onEdit) {
                        onEdit(transaction);
                    }
                }}
            >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div 
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isPositive ? "bg-emerald-500/10" : ""}`}
                        style={isPositive ? {} : { background: `linear-gradient(135deg, ${stopColor1}22, ${stopColor2}11)`, border: `1px solid ${stopColor1}11`} }
                    >
                        <Icon 
                            className={`h-4 w-4 ${isPositive ? "text-emerald-500" : ""}`} 
                            style={isPositive ? {} : { color: stopColor1 }}
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-[11px] font-bold leading-none text-foreground">{transaction.label}</h3>
                        <div className="mt-1 flex items-center gap-1">
                            <span className="text-[8px] font-bold text-muted-foreground uppercase">{transaction.category}</span>
                            <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/30" />
                            <span className="text-[8px] font-medium text-muted-foreground uppercase">{new Date(transaction.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-2">
                    <p className={`text-[12px] font-black font-serif leading-none ${isPositive ? "text-emerald-500" : "text-foreground"}`}>
                        {isPositive ? "+" : "-"}{formatCurrency(transaction.amount)}
                    </p>
                    
                    {/* Small direct delete button */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Supprimer cette transaction ?")) {
                                onDelete(transaction.id);
                            }
                        }}
                        className="p-1.5 rounded-full bg-muted/30 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
