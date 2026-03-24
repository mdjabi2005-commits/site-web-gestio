import { useMemo } from 'react';
import { Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Line, ComposedChart } from 'recharts';
import type { Transaction } from '@/ui/types';
import { format, getMonth, getYear } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface DatePeriod {
    type: 'month' | 'quarter' | 'year';
    monthIndex: number;
    quarterIndex: number;
    year: number;
}

interface EvolutionChartProps {
    transactions: Transaction[];
    period: DatePeriod;
}

export const EvolutionChart = ({ transactions, period }: EvolutionChartProps) => {
    const chartData = useMemo(() => {
        const aggregationMode = period.type === 'month' ? 'daily' : 'monthly';
        const map = new Map<string, { name: string; revenus: number; depenses: number; dateValue: number; transactions: Transaction[]; solde: number }>();

        transactions.forEach((t) => {
            const dateStr = t.date.length > 10 ? t.date : `${t.date}T00:00:00`;
            const date = new Date(dateStr);
            let key = '';
            let label = '';
            let sortValue = 0;

            if (aggregationMode === 'daily') {
                key = format(date, 'yyyy-MM-dd');
                label = format(date, 'dd MMM', { locale: fr });
                sortValue = date.getTime();
            } else {
                key = format(date, 'yyyy-MM');
                label = format(date, 'MMM yyyy', { locale: fr });
                sortValue = getYear(date) * 100 + getMonth(date);
            }

            if (!map.has(key)) {
                map.set(key, { name: label, revenus: 0, depenses: 0, dateValue: sortValue, transactions: [], solde: 0 });
            }

            const current = map.get(key)!;
            if (t.type === 'revenu') {
                current.revenus += t.amount;
            } else {
                current.depenses += Math.abs(t.amount);
            }
            current.transactions.push(t);
        });

        const data = Array.from(map.values()).sort((a, b) => a.dateValue - b.dateValue);
        return data.map(d => ({
            ...d,
            solde: d.revenus - d.depenses
        }));
    }, [transactions, period]);

    const fmt = (n: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const { revenus, depenses, transactions, solde } = data;

            return (
                <div className="bg-popover border border-border p-3 rounded-xl shadow-xl text-popover-foreground min-w-[200px] z-[100]">
                    <p className="text-muted-foreground text-[10px] mb-2 font-medium uppercase tracking-wider">{label}</p>

                    <div className="flex flex-col gap-1.5 mb-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" />Revenus</span>
                            <span className="font-semibold text-emerald-500">+{fmt(revenus)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-destructive" />Dépenses</span>
                            <span className="font-semibold text-foreground">-{fmt(depenses)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm pt-1.5 border-t border-border/50 mt-1">
                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" />Solde</span>
                            <span className={`font-bold ${solde >= 0 ? 'text-blue-500' : 'text-destructive'}`}>{fmt(solde)}</span>
                        </div>
                    </div>

                    {transactions && transactions.length > 0 && (
                        <div className="pt-2 border-t border-border flex flex-col gap-1">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Détails</p>
                            {transactions.slice(0, 3).map((t: Transaction) => (
                                <div key={t.id} className="flex justify-between items-center text-[11px]">
                                    <span className="truncate max-w-[120px] text-muted-foreground pr-2">{t.label}</span>
                                    <span className={t.type === 'revenu' ? 'text-emerald-500' : 'text-foreground'}>
                                        {t.type === 'revenu' ? '+' : '-'}{fmt(Math.abs(t.amount))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    const yAxisTicks = useMemo(() => {
        if (chartData.length === 0) return [0];
        const maxVal = Math.max(...chartData.map(d => Math.max(d.revenus, d.depenses, Math.abs(d.solde))));
        const minVal = Math.min(0, ...chartData.map(d => d.solde));
        const ticks = [];
        const step = 100;
        const start = Math.floor(minVal / step) * step;
        const end = Math.ceil(maxVal / step) * step;
        for (let i = start; i <= end; i += step) {
            ticks.push(i);
        }
        return ticks;
    }, [chartData]);

    return (
        <div className="w-full h-[260px] pr-2">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barGap={6}>
                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="hsl(var(--muted-foreground))" 
                        strokeOpacity={0.15}
                        vertical={true}
                    />
                    <XAxis
                        dataKey="name"
                        axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        padding={{ left: 10, right: 10 }}
                        tickMargin={10}
                        minTickGap={20}
                    />
                    <YAxis 
                        axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                        ticks={yAxisTicks}
                        domain={[yAxisTicks[0], yAxisTicks[yAxisTicks.length - 1]]}
                        tickFormatter={(v) => v === 0 ? '0' : `${v}€`}
                        width={50}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                    />
                    <Bar
                        dataKey="revenus"
                        name="Revenus"
                        fill="#10b981"
                        radius={[2, 2, 0, 0]}
                        barSize={10}
                    />
                    <Bar
                        dataKey="depenses"
                        name="Dépenses"
                        fill="hsl(var(--destructive))"
                        radius={[2, 2, 0, 0]}
                        barSize={10}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="solde" 
                        name="Solde"
                        stroke="#3b82f6" 
                        strokeWidth={2} 
                        dot={{ r: 2, fill: '#3b82f6', strokeWidth: 1, stroke: 'white' }} 
                        activeDot={{ r: 4, strokeWidth: 1.5, stroke: 'white' }}
                        isAnimationActive={true}
                    />
                </ComposedChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Revenus</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-destructive shadow-[0_0_8px_hsl(var(--destructive))]" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Dépenses</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Solde</span>
                </div>
            </div>
        </div>
    );
};
