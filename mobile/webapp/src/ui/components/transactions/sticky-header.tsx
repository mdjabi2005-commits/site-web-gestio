import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ListFilter, ScanLine } from 'lucide-react';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import type { DatePeriod } from './evolution-chart';

const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

interface StickyHeaderProps {
    totalIncome: number;
    totalExpense: number;
    period: DatePeriod;
    onPeriodChange: (p: DatePeriod) => void;
    onAddClick?: () => void;
    onScanClick?: () => void;
}

export const StickyHeader = ({ totalIncome, totalExpense, period, onPeriodChange, onAddClick, onScanClick }: StickyHeaderProps) => {

    const balance = totalIncome - totalExpense; // Because expense is grouped as absolute value usually, or we just do sum

    const prev = () => {
        if (period.type === 'month') {
            const newMonth = period.monthIndex === 0 ? 11 : period.monthIndex - 1;
            const newYear = period.monthIndex === 0 ? period.year - 1 : period.year;
            onPeriodChange({ ...period, monthIndex: newMonth, year: newYear });
        } else if (period.type === 'quarter') {
            const newQuarter = period.quarterIndex === 0 ? 3 : period.quarterIndex - 1;
            const newYear = period.quarterIndex === 0 ? period.year - 1 : period.year;
            onPeriodChange({ ...period, quarterIndex: newQuarter, year: newYear });
        } else if (period.type === 'year') {
            onPeriodChange({ ...period, year: period.year - 1 });
        }
    };

    const next = () => {
        if (period.type === 'month') {
            const newMonth = period.monthIndex === 11 ? 0 : period.monthIndex + 1;
            const newYear = period.monthIndex === 11 ? period.year + 1 : period.year;
            onPeriodChange({ ...period, monthIndex: newMonth, year: newYear });
        } else if (period.type === 'quarter') {
            const newQuarter = period.quarterIndex === 3 ? 0 : period.quarterIndex + 1;
            const newYear = period.quarterIndex === 3 ? period.year + 1 : period.year;
            onPeriodChange({ ...period, quarterIndex: newQuarter, year: newYear });
        } else if (period.type === 'year') {
            onPeriodChange({ ...period, year: period.year + 1 });
        }
    };

    const getPeriodLabel = () => {
        if (period.type === 'month') return `${months[period.monthIndex]} ${period.year}`;
        if (period.type === 'quarter') return `T${period.quarterIndex + 1} ${period.year}`;
        return `Année ${period.year}`;
    };

    const fmt = (n: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

    return (
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border px-4 pt-4 pb-3">
            {/* Period selector */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center flex-1 justify-center gap-2">
                    <button onClick={prev} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
                        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 px-3 text-base font-semibold tracking-wide hover:bg-secondary">
                                {getPeriodLabel()}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-40 z-[100]">
                            <DropdownMenuItem onClick={() => onPeriodChange({ ...period, type: 'month' })}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                Par Mois
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onPeriodChange({ ...period, type: 'quarter' })}>
                                <ListFilter className="mr-2 h-4 w-4" />
                                Par Trimestre
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onPeriodChange({ ...period, type: 'year' })}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                Année complète
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <button onClick={next} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>
                {onAddClick && (
                    <div className="flex items-center gap-2 ml-2">
                        <button 
                            onClick={onScanClick} 
                            className="p-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors"
                        >
                            <ScanLine className="w-5 h-5" />
                        </button>
                        <button onClick={onAddClick} className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        </button>
                    </div>
                )}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Revenus</p>
                    <p className="text-sm font-bold text-emerald-500">+{fmt(totalIncome)}</p>
                </div>
                <div className="relative">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Solde</p>
                    <p className={`text-lg font-bold ${balance >= 0 ? 'text-primary' : 'text-foreground'}`}>
                        {balance >= 0 ? '+' : ''}{fmt(balance)}
                    </p>
                </div>
                <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Dépenses</p>
                    <p className="text-sm font-bold text-foreground">-{fmt(totalExpense)}</p>
                </div>
            </div>
        </div>
    );
};
