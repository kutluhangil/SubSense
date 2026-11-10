import { describe, it, expect } from 'vitest';
import { sanitizeServices } from './catalog';

describe('sanitizeServices', () => {
  it('keeps a well-formed entry intact', () => {
    const raw = {
      Netflix: {
        startingAt: 9.99,
        startingCurrency: 'USD',
        regions: { US: { tiers: [{ name: 'Basic', price: 9.99 }] } },
        plans: [{ name: 'Premium', usd: 22.99 }],
      },
    };
    expect(sanitizeServices(raw)).toEqual({
      Netflix: {
        startingAt: 9.99,
        startingCurrency: 'USD',
        regions: { US: { tiers: [{ name: 'Basic', price: 9.99 }] } },
        plans: [{ name: 'Premium', usd: 22.99 }],
      },
    });
  });

  it('returns {} when raw is not a plain object', () => {
    expect(sanitizeServices(null)).toEqual({});
    expect(sanitizeServices(undefined)).toEqual({});
    expect(sanitizeServices('nope')).toEqual({});
    expect(sanitizeServices(42)).toEqual({});
    expect(sanitizeServices([{ startingAt: 1 }])).toEqual({});
  });

  it('drops a string price field', () => {
    const out = sanitizeServices({ Foo: { startingAt: '9.99', startingCurrency: 'USD' } });
    expect(out).toEqual({ Foo: { startingCurrency: 'USD' } });
  });

  it('drops NaN / Infinity / negative startingAt', () => {
    expect(sanitizeServices({ A: { startingAt: NaN, startingCurrency: 'TRY' } })).toEqual({
      A: { startingCurrency: 'TRY' },
    });
    expect(sanitizeServices({ B: { startingAt: Infinity, startingCurrency: 'TRY' } })).toEqual({
      B: { startingCurrency: 'TRY' },
    });
    expect(sanitizeServices({ C: { startingAt: -5, startingCurrency: 'TRY' } })).toEqual({
      C: { startingCurrency: 'TRY' },
    });
  });

  it('drops an invalid startingCurrency', () => {
    expect(sanitizeServices({ A: { startingAt: 5, startingCurrency: 'EUR' } })).toEqual({
      A: { startingAt: 5 },
    });
  });

  it('drops entries that end up empty (and non-object entries)', () => {
    expect(sanitizeServices({ A: { startingAt: 'x', startingCurrency: 'EUR' } })).toEqual({});
    expect(sanitizeServices({ A: 'not-an-object', B: { startingAt: 1 } })).toEqual({ B: { startingAt: 1 } });
  });

  it('drops bad tiers and bad plans, keeping good ones', () => {
    const raw = {
      Svc: {
        regions: {
          US: { tiers: [{ name: 'Good', price: 5 }, { name: 'Bad', price: 'x' }, { name: 'Neg', price: -1 }] },
          TR: { tiers: [{ name: 'NoPrice' }] },
        },
        plans: [{ name: 'Ok', usd: 10 }, { name: 'BadUsd', usd: NaN }, { name: 'StrUsd', usd: '10' }],
      },
    };
    expect(sanitizeServices(raw)).toEqual({
      Svc: {
        regions: { US: { tiers: [{ name: 'Good', price: 5 }] } },
        plans: [{ name: 'Ok', usd: 10 }],
      },
    });
  });

  it('drops regions object with no usable tiers', () => {
    const raw = { Svc: { startingAt: 3, regions: { US: { tiers: [{ price: 'x' }] } } } };
    expect(sanitizeServices(raw)).toEqual({ Svc: { startingAt: 3 } });
  });
});
