/**
 * Stable, semantic accent color per spending category. Used consistently across
 * the donut, category bars, and icon tiles so each category has a visual identity.
 * Unknown/custom categories get a deterministic color from the fallback palette
 * (same name → same color every render).
 */
export const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: '#F43F5E', // rose
  Music: '#22C55E', // green
  Tools: '#6366F1', // indigo
  Gaming: '#A855F7', // purple
  Productivity: '#06B6D4', // cyan
  'Health & Fitness': '#F59E0B', // amber
  Shopping: '#F97316', // orange
};

const FALLBACK = ['#6366F1', '#22C55E', '#F43F5E', '#A855F7', '#06B6D4', '#F59E0B', '#F97316', '#EC4899'];

export function categoryColor(name: string): string {
  const known = CATEGORY_COLORS[name];
  if (known) return known;
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return FALLBACK[h % FALLBACK.length];
}
