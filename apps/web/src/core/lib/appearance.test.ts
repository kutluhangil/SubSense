import { describe, it, expect } from 'vitest';
import { resolveAppearance } from './appearance';
describe('resolveAppearance', () => {
  it('dark setting → dark', () => { expect(resolveAppearance('dark', false)).toBe(true); });
  it('light setting → light', () => { expect(resolveAppearance('light', true)).toBe(false); });
  it('system follows OS dark', () => { expect(resolveAppearance('system', true)).toBe(true); });
  it('system follows OS light', () => { expect(resolveAppearance('system', false)).toBe(false); });
});
