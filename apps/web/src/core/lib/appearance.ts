import type { Appearance } from '../types';
/** Resolve whether dark mode is active. */
export function resolveAppearance(setting: Appearance, sysDark: boolean): boolean {
  return setting === 'dark' || (setting === 'system' && sysDark);
}
