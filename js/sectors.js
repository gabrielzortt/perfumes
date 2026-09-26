/**
 * Setores (categorias) da loja. A fonte da verdade é a coleção Firestore
 * "setores" — editável 100% pelo admin (adicionar, renomear, remover,
 * reordenar). Esta lista é só a SEMENTE usada:
 *   1) como fallback se a coleção ainda estiver vazia (loja nova / antes do
 *      primeiro acesso ao admin), e
 *   2) para reconhecer os 5 setores/chaves que os produtos já cadastrados
 *      usam hoje (compatibilidade com dados antigos: "arábes", "óculos", etc).
 */

export const DEFAULT_SECTORS = [
    { key: 'destaque', label: 'Destaques', icon: '👑', order: 0, desc: 'Seleção especial dos produtos favoritos da casa. O melhor da nossa curadoria, reunido para você.' },
    { key: 'arabes',   label: 'Árabes',    icon: '🌙', order: 1, desc: 'Uma fragrância exclusiva selecionada a dedo. A assinatura perfeita para marcar a sua presença onde quer que você vá.' },
    { key: 'brand',    label: 'Brand',     icon: '⭐', order: 2, desc: 'Uma fragrância exclusiva selecionada a dedo. A assinatura perfeita para marcar a sua presença onde quer que você vá.' },
    { key: 'oculos',   label: 'Óculos',    icon: '🕶️', order: 3, desc: 'Estilo que completa o look. Peça selecionada com cuidado para quem valoriza elegância no detalhe.' },
    { key: 'bones',    label: 'Bonés',     icon: '🧢', order: 4, desc: 'Atitude e estilo em um só acessório. Para quem leva o visual a sério em qualquer ocasião.' },
];

// Variantes antigas/acentuadas gravadas em produtos legados → chave canônica atual
const LEGACY_ALIASES = {
    'arábes': 'arabes',
    'boticario': 'arabes',
    'óculos': 'oculos',
    'bonés': 'bones',
};

export function normalizeBrandKey(brand) {
    const b = (brand || '').toLowerCase().trim();
    return LEGACY_ALIASES[b] || b;
}

export function slugify(label) {
    return (label || '')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Recebe a lista vinda do Firestore (pode estar vazia) e devolve a lista
// efetiva a usar, sempre ordenada.
export function resolveSectors(liveSectors) {
    const base = (liveSectors && liveSectors.length > 0) ? liveSectors : DEFAULT_SECTORS;
    return [...base].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
