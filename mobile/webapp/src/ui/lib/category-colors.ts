export const CATEGORY_COLORS: Record<string, { stops: string[], glow: string }> = {
    "Alimentation": { stops: ['#ea580c', '#f59e0b', '#d97706'], glow: 'rgba(245, 158, 11, 0.4)' }, // Orange
    "Voiture": { stops: ['#2563eb', '#3b82f6', '#1d4ed8'], glow: 'rgba(59, 130, 246, 0.5)' }, // Bleu
    "Logement": { stops: ['#0d9488', '#10b981', '#059669'], glow: 'rgba(16, 185, 129, 0.5)' }, // Vert / Teal
    "Loisir": { stops: ['#8b5cf6', '#a855f7', '#d946ef'], glow: 'rgba(168, 85, 247, 0.4)' }, // Violet brillant / Fuchsia
    "Santé": { stops: ['#0891b2', '#06b6d4', '#0e7490'], glow: 'rgba(6, 182, 212, 0.4)' }, // Cyan
    "Shopping": { stops: ['#db2777', '#ec4899', '#be185d'], glow: 'rgba(236, 72, 153, 0.5)' }, // Rose
    "Services": { stops: ['#ca8a04', '#eab308', '#a16207'], glow: 'rgba(234, 179, 8, 0.4)' }, // Jaune
    "Uber": { stops: ['#475569', '#64748b', '#334155'], glow: 'rgba(100, 116, 139, 0.5)' }, // Gris foncé
    "Divers": { stops: ['#94a3b8', '#cbd5e1', '#64748b'], glow: 'rgba(148, 163, 184, 0.4)' }, // Gris clair (anciennement Autre)
    "other": { stops: ['#64748b', '#94a3b8', '#475569'], glow: 'rgba(100, 116, 139, 0.4)' } // Gris fallback
};

const _colorPalettes = [
    { stops: ['#0d9488', '#10b981', '#059669'], glow: 'rgba(16, 185, 129, 0.5)' },
    { stops: ['#2563eb', '#3b82f6', '#1d4ed8'], glow: 'rgba(59, 130, 246, 0.5)' },
    { stops: ['#ea580c', '#f59e0b', '#d97706'], glow: 'rgba(245, 158, 11, 0.5)' },
    { stops: ['#db2777', '#ec4899', '#be185d'], glow: 'rgba(236, 72, 153, 0.5)' },
    { stops: ['#0891b2', '#06b6d4', '#0e7490'], glow: 'rgba(6, 182, 212, 0.4)' },
    { stops: ['#e11d48', '#f43f5e', '#be123c'], glow: 'rgba(244, 63, 94, 0.4)' },
    { stops: ['#7c3aed', '#a855f7', '#6d28d9'], glow: 'rgba(168, 85, 247, 0.4)' },
    { stops: ['#ca8a04', '#eab308', '#a16207'], glow: 'rgba(234, 179, 8, 0.4)' },
];

export function getCategoryGradient(category: string) {
    if (!category) return _colorPalettes[0];
    
    // Normalisation : "Loisir ", "Loisirs", " loisir" -> "loisirs"
    let normalized = category.trim().toLowerCase();
    
    // Gérer les cas fréquents de singulier/pluriel ou anciens noms
    if (normalized === "autre") normalized = "divers";
    if (normalized === "sante") normalized = "santé";
    
    // Chercher la clé correspondante sans tenir compte de la casse
    const key = Object.keys(CATEGORY_COLORS).find(k => k.toLowerCase() === normalized);
    
    if (key && CATEGORY_COLORS[key]) {
        return CATEGORY_COLORS[key];
    }
    
    // Hash fallback pour les catégories inconnues
    let hash = 0;
    for (let i = 0; i < category.length; i++) hash = category.charCodeAt(i) + ((hash << 5) - hash);
    const index = Math.abs(hash) % _colorPalettes.length;
    return _colorPalettes[index];
}
