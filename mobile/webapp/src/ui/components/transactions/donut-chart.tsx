import { useState, useMemo } from 'react';
import { getCategoryGradient } from '@/ui/lib/category-colors';

export interface DonutData {
    category: string;
    total: number;
    type: 'revenu' | 'dépense';
}

interface DonutChartProps {
    data: DonutData[];
    onCategoryTap: (category: string | null) => void;
    activeCategory: string | null;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, outerR: number, innerR: number, startAngle: number, endAngle: number) {
    const sweep = endAngle - startAngle;
    const largeArc = sweep > 180 ? 1 : 0;
    const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
    const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
    const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
    const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);

    return [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerStart.x} ${innerStart.y}`,
        `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
        'Z',
    ].join(' ');
}

export const DonutChart = ({ data, onCategoryTap, activeCategory }: DonutChartProps) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [ringLevel, setRingLevel] = useState<'root' | 'revenu' | 'dépense'>('root');

    const fmt = (n: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

    const cx = 160;
    const cy = 160;
    const outerR = 120;
    const innerR = 95;

    const segments = useMemo(() => {
        let currentAngle = 0;

        if (ringLevel === 'root') {
            let incomeTotal = 0;
            let expenseTotal = 0;
            data.forEach((d) => {
                if (d.type === 'revenu') incomeTotal += d.total;
                else expenseTotal += d.total;
            });

            const rootData: { category: string; total: number; type: 'revenu' | 'dépense' }[] = [];
            if (expenseTotal > 0) rootData.push({ category: 'dépense', total: expenseTotal, type: 'dépense' });
            if (incomeTotal > 0) rootData.push({ category: 'revenu', total: incomeTotal, type: 'revenu' });

            const currentTotal = incomeTotal + expenseTotal;
            if (currentTotal === 0) return [];

            return rootData.map((d) => {
                const sweep = Math.min((d.total / currentTotal) * 360, 359.99);
                const start = currentAngle;
                const end = start + sweep + (sweep < 359.99 ? 0.5 : 0);
                currentAngle = start + sweep;
                return { ...d, startAngle: start, endAngle: end, isRoot: true };
            });
        } else {
            const levelData = data.filter((d) => d.type === ringLevel);
            const currentTotal = levelData.reduce((s, d) => s + d.total, 0);

            if (currentTotal === 0) return [];

            return levelData.map((d) => {
                const sweep = Math.min((d.total / currentTotal) * 360, 359.99);
                const start = currentAngle;
                const end = start + sweep + (sweep < 359.99 ? 0.5 : 0);
                currentAngle = start + sweep;
                return { ...d, startAngle: start, endAngle: end, isRoot: false };
            });
        }
    }, [data, ringLevel]);

    let centerLabel = '';
    let centerValue = 0;

    if (ringLevel === 'root') {
        if (hoveredIndex !== null && segments[hoveredIndex]) {
            const seg = segments[hoveredIndex];
            centerLabel = seg.type === 'revenu' ? 'Revenus' : 'Dépenses';
            centerValue = seg.total;
        } else {
            centerLabel = 'Flux Total';
            centerValue = data.reduce((s, d) => s + d.total, 0);
        }
    } else {
        if (activeCategory) {
            centerLabel = activeCategory;
            centerValue = data.find((d) => d.category === activeCategory)?.total ?? 0;
        } else if (hoveredIndex !== null && segments[hoveredIndex]) {
            const seg = segments[hoveredIndex];
            centerLabel = seg.category === 'other' ? 'Autres' : seg.category;
            centerValue = seg.total;
        } else {
            centerLabel = ringLevel === 'revenu' ? 'Total Revenus' : 'Total Dépenses';
            const levelData = data.filter((d) => d.type === ringLevel);
            centerValue = levelData.reduce((s, d) => s + d.total, 0);
        }
    }

    return (
        <div className="relative w-full flex justify-center" style={{ height: 320 }}>
            {/* Outer glow */}
            <div
                className="absolute rounded-full"
                style={{
                    width: outerR * 2 + 40,
                    height: outerR * 2 + 40,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle, rgba(20,184,166,0.12) 0%, rgba(6,182,212,0.06) 40%, transparent 70%)',
                    filter: 'blur(20px)',
                }}
            />

            <svg
                viewBox="0 0 320 320"
                className="w-full max-w-[320px] h-auto relative z-10 drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 0 30px rgba(20,184,166,0.15))' }}
            >
                <defs>
                    {segments.map((seg, i) => {
                        let grad;
                        if (seg.isRoot) {
                            if (seg.type === 'revenu') {
                                grad = { stops: ['#22c55e', '#22c55e', '#22c55e'], glow: 'rgba(34, 197, 94, 0.4)' };
                            } else {
                                grad = { stops: ['#ef4444', '#ef4444', '#ef4444'], glow: 'rgba(239, 68, 68, 0.4)' }; // Uniform red instead of 3 shades
                            }
                        } else {
                            grad = getCategoryGradient(seg.category);
                        }
                        const midAngle = (seg.startAngle + seg.endAngle) / 2;
                        const startPt = polarToCartesian(cx, cy, outerR, seg.startAngle);
                        const endPt = polarToCartesian(cx, cy, innerR, midAngle);
                        return (
                            <linearGradient
                                key={`grad-${i}`}
                                id={`gem-grad-${i}`}
                                x1={startPt.x}
                                y1={startPt.y}
                                x2={endPt.x}
                                y2={endPt.y}
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset="0%" stopColor={grad.stops[0]} />
                                <stop offset="50%" stopColor={grad.stops[1]} />
                                <stop offset="100%" stopColor={grad.stops[2]} />
                            </linearGradient>
                        );
                    })}

                    {segments.map((_, i) => (
                        <linearGradient key={`hl-${i}`} id={`gem-highlight-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="white" stopOpacity="0.25" />
                            <stop offset="40%" stopColor="white" stopOpacity="0.05" />
                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                    ))}

                    <filter id="caustic-blur">
                        <feGaussianBlur stdDeviation="0.8" />
                    </filter>

                    <filter id="frosted-glass" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur" />
                        <feSpecularLighting in="blur" surfaceScale="3" specularConstant="0.6" specularExponent="25" result="specular">
                            <fePointLight x="160" y="60" z="200" />
                        </feSpecularLighting>
                        <feComposite in="SourceGraphic" in2="specular" operator="arithmetic" k1="0" k2="1" k3="0.15" k4="0" />
                    </filter>

                    <filter id="segment-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <radialGradient id="center-metal" cx="50%" cy="45%" r="50%">
                        <stop offset="0%" stopColor="hsl(var(--card))" />
                        <stop offset="70%" stopColor="hsl(var(--card))" />
                        <stop offset="100%" stopColor="hsl(var(--background))" />
                    </radialGradient>

                    <radialGradient id="center-sheen" cx="40%" cy="35%" r="60%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </radialGradient>

                    <pattern id="brushed-texture" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="4" y2="4" stroke="hsl(var(--foreground))" strokeOpacity="0.03" strokeWidth="0.5" />
                        <line x1="4" y1="0" x2="0" y2="4" stroke="hsl(var(--foreground))" strokeOpacity="0.02" strokeWidth="0.3" />
                    </pattern>
                </defs>

                {segments.map((seg, i) => {
                    const isActive = seg.isRoot ? false : (activeCategory === seg.category);
                    const isHovered = hoveredIndex === i;
                    const dimmed = seg.isRoot ? (hoveredIndex !== null && hoveredIndex !== i) : (activeCategory && !isActive);

                    let grad;
                    if (seg.isRoot) {
                        if (seg.type === 'revenu') grad = { stops: ['#22c55e', '#22c55e', '#22c55e'], glow: 'rgba(34, 197, 94, 0.4)' };
                        else grad = { stops: ['#ef4444', '#ef4444', '#ef4444'], glow: 'rgba(239, 68, 68, 0.4)' }; // Uniform red
                    } else {
                        grad = getCategoryGradient(seg.category);
                    }

                    const midAngle = (seg.startAngle + seg.endAngle) / 2;
                    const caustic1Start = polarToCartesian(cx, cy, innerR + 8, midAngle - 3);
                    const caustic1End = polarToCartesian(cx, cy, outerR - 8, midAngle + 5);
                    const caustic2Start = polarToCartesian(cx, cy, innerR + 15, midAngle + 8);
                    const caustic2End = polarToCartesian(cx, cy, outerR - 3, midAngle - 2);

                    return (
                        <g
                            key={seg.category}
                            onClick={() => {
                                if (seg.isRoot) {
                                    setRingLevel(seg.type as 'revenu' | 'dépense');
                                    onCategoryTap(null);
                                } else {
                                    onCategoryTap(activeCategory === seg.category ? null : seg.category);
                                }
                            }}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className="cursor-pointer"
                            style={{
                                opacity: dimmed ? 0.3 : 1,
                                transition: 'opacity 0.3s ease, transform 0.3s ease',
                            }}
                        >
                            {(isActive || isHovered) && (
                                <path
                                    d={describeArc(cx, cy, outerR + 4, innerR - 4, seg.startAngle, seg.endAngle)}
                                    fill={grad.glow}
                                    filter="url(#segment-glow)"
                                    opacity={0.6}
                                />
                            )}
                            <path
                                d={describeArc(cx, cy, outerR, innerR, seg.startAngle, seg.endAngle)}
                                fill={`url(#gem-grad-${i})`}
                                filter="url(#frosted-glass)"
                            />
                            <path
                                d={describeArc(cx, cy, outerR, innerR, seg.startAngle, seg.endAngle)}
                                fill={`url(#gem-highlight-${i})`}
                            />
                            <line
                                x1={caustic1Start.x} y1={caustic1Start.y}
                                x2={caustic1End.x} y2={caustic1End.y}
                                stroke="white"
                                strokeOpacity={0.12}
                                strokeWidth="0.8"
                                filter="url(#caustic-blur)"
                            />
                            <line
                                x1={caustic2Start.x} y1={caustic2Start.y}
                                x2={caustic2End.x} y2={caustic2End.y}
                                stroke="white"
                                strokeOpacity={0.08}
                                strokeWidth="0.5"
                                filter="url(#caustic-blur)"
                            />
                            <path
                                d={describeArc(cx, cy, outerR, outerR - 3, seg.startAngle + 1, seg.endAngle - 1)}
                                fill="white"
                                opacity={0.07}
                            />
                            <path
                                d={describeArc(cx, cy, innerR + 3, innerR, seg.startAngle + 1, seg.endAngle - 1)}
                                fill="black"
                                opacity={0.12}
                            />
                        </g>
                    );
                })}

                {segments.map((seg, i) => {
                    const sweep = seg.endAngle - seg.startAngle;
                    if (sweep < 10) return null;

                    const outerPt = polarToCartesian(cx, cy, outerR + 1, seg.endAngle);
                    const innerPt = polarToCartesian(cx, cy, innerR - 1, seg.endAngle);

                    return (
                        <g key={`sep-${seg.category}-${i}`}>
                            <line
                                x1={outerPt.x} y1={outerPt.y}
                                x2={innerPt.x} y2={innerPt.y}
                                stroke="url(#rose-gold-sep)"
                                strokeWidth="0.4"
                                strokeOpacity={0.8}
                                strokeLinecap="round"
                            />
                            <circle cx={outerPt.x} cy={outerPt.y} r="1.0" fill="#e8c4a0" opacity={0.6} />
                            <circle cx={innerPt.x} cy={innerPt.y} r="0.8" fill="#d4a574" opacity={0.5} />
                        </g>
                    );
                })}

                <defs>
                    <linearGradient id="rose-gold-sep" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f0d0a8" stopOpacity="0.7" />
                        <stop offset="50%" stopColor="#e8c4a0" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#d4a574" stopOpacity="0.3" />
                    </linearGradient>
                </defs>

                <circle
                    cx={cx} cy={cy} r={outerR + 1}
                    fill="none"
                    stroke="url(#rose-gold-sep)"
                    strokeWidth="0.6"
                    opacity={0.4}
                />
                <circle
                    cx={cx} cy={cy} r={innerR - 1}
                    fill="none"
                    stroke="url(#rose-gold-sep)"
                    strokeWidth="0.5"
                    opacity={0.3}
                />

                <circle cx={cx} cy={cy} r={innerR - 4} fill="var(--background)" opacity={0.3} filter="url(#caustic-blur)" />
                <circle cx={cx} cy={cy} r={innerR - 6} fill="url(#center-metal)" />
                <circle cx={cx} cy={cy} r={innerR - 6} fill="url(#brushed-texture)" />
                <circle cx={cx} cy={cy} r={innerR - 6} fill="url(#center-sheen)" />

                <circle
                    cx={cx} cy={cy} r={innerR - 8}
                    fill="none"
                    stroke="hsl(var(--foreground))"
                    strokeOpacity={0.06}
                    strokeWidth="0.8"
                    strokeDasharray="2 3"
                />
                <circle
                    cx={cx} cy={cy} r={innerR - 10}
                    fill="none"
                    stroke="hsl(var(--foreground))"
                    strokeOpacity={0.04}
                    strokeWidth="0.5"
                />

                {ringLevel !== 'root' && (
                    <g
                        className="cursor-pointer group"
                        onClick={() => {
                            setRingLevel('root');
                            onCategoryTap(null);
                        }}
                    >
                        <circle cx={cx} cy={cy - 22} r="14" fill="transparent" />
                        <text
                            x={cx} y={cy - 22}
                            textAnchor="middle"
                            fill="hsl(var(--foreground))"
                            fillOpacity={0.6}
                            fontSize="9"
                            fontFamily="inherit"
                            fontWeight="600"
                            letterSpacing="1"
                            className="uppercase transition-colors"
                        >
                            ← Retour
                        </text>
                    </g>
                )}
                <text
                    x={cx} y={ringLevel === 'root' ? cy - 8 : cy - 4}
                    textAnchor="middle"
                    fill="hsl(var(--foreground))"
                    fillOpacity={0.7}
                    fontSize="11"
                    fontFamily="inherit"
                    fontWeight="400"
                >
                    {centerLabel}
                </text>
                <text
                    x={cx} y={ringLevel === 'root' ? cy + 14 : cy + 18}
                    textAnchor="middle"
                    fill="hsl(var(--foreground))"
                    fontSize="18"
                    fontFamily="inherit"
                    fontWeight="700"
                    letterSpacing="-0.5"
                >
                    {fmt(centerValue)}
                </text>
            </svg>
        </div>
    );
};
