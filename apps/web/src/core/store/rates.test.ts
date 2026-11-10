// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRates } from './rates';

beforeEach(() => {
  localStorage.clear();
  useRates.setState({ error: false, live: false, updatedAt: null });
});

describe('rates fetch error', () => {
  it('sets error=true when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await useRates.getState().load();
    expect(useRates.getState().error).toBe(true);
  });
  it('sets error=false on successful fetch', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ result: 'success', rates: { USD: 1, EUR: 0.9 } }),
    }));
    await useRates.getState().load();
    expect(useRates.getState().error).toBe(false);
  });
});
