import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { DonutChart, type DonutData } from './donut-chart';
import { EvolutionChart, type DatePeriod } from './evolution-chart';
import type { Transaction } from '@/ui/types';

interface ChartCarouselProps {
    donutData: DonutData[];
    transactions: Transaction[];
    period: DatePeriod;
    onCategoryTap: (category: string | null) => void;
    activeCategory: string | null;
}

export const ChartCarousel = ({ donutData, transactions, period, onCategoryTap, activeCategory }: ChartCarouselProps) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
    const [selectedIndex, setSelectedIndex] = useState(0);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', onSelect);
        onSelect();
    }, [emblaApi, onSelect]);

    return (
        <div className="mt-2 w-full">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    <div className="flex-[0_0_100%] min-w-0 px-4">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 text-center">
                            Répartition
                        </h3>
                        <DonutChart data={donutData} onCategoryTap={onCategoryTap} activeCategory={activeCategory} />
                    </div>
                    <div className="flex-[0_0_100%] min-w-0 px-4">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 text-center">
                            Évolution
                        </h3>
                        <EvolutionChart transactions={transactions} period={period} />
                    </div>
                </div>
            </div>
            {/* Dots */}
            <div className="flex justify-center gap-2 mt-2 pb-2">
                {[0, 1].map((i) => (
                    <button
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${selectedIndex === i ? 'bg-primary w-5' : 'bg-muted-foreground/30'
                            }`}
                        onClick={() => emblaApi?.scrollTo(i)}
                    />
                ))}
            </div>
        </div>
    );
};
