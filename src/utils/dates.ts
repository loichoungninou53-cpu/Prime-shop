/**
 * Les commandes ont historiquement deux formats de date :
 *  - "30/09/2026 19:41" (ancien format français)
 *  - "2026-10-14T16:58:00.000Z" (ISO, nouveau format)
 * Ces utilitaires lisent les deux, pour trier et afficher correctement.
 */
export function parseOrderDate(value?: string): Date | null {
  if (!value) return null;
  const fr = /^(\d{2})\/(\d{2})\/(\d{4})(?:[ ,]+(\d{2}):(\d{2}))?/.exec(value.trim());
  if (fr) {
    const [, d, m, y, hh = '0', mm = '0'] = fr;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm));
  }
  const iso = new Date(value);
  return Number.isNaN(iso.getTime()) ? null : iso;
}

export function orderTime(value?: string): number {
  return parseOrderDate(value)?.getTime() ?? 0;
}

export function formatOrderDate(value?: string): string {
  const d = parseOrderDate(value);
  if (!d) return value || '';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Clé de jour locale AAAA-MM-JJ */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
