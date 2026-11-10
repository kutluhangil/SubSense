import { deleteField, Timestamp } from 'firebase/firestore';
import type { Subscription } from '../types';

/** A subscription without its sync timestamp (what we compare and write). */
export type Row = Omit<Subscription, 'updatedAt'>;

export function strip(s: Subscription): Row {
  const { updatedAt: _u, ...rest } = s;
  void _u;
  return rest;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function millis(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis();
  return typeof v === 'number' ? v : 0;
}

/** Firestore doc → Subscription. Timestamps become epoch ms; tombstones keep deletedAt. */
export function fromDoc(id: string, data: Record<string, unknown>): Subscription {
  const { updatedAt, deletedAt, ...rest } = data;
  return {
    ...(rest as Omit<Subscription, 'id'>),
    id,
    updatedAt: millis(updatedAt),
    deletedAt: deletedAt ? millis(deletedAt) || Date.now() : null,
  };
}

/** Fields to write for a row going from `before` to `after` (cleared keys → deleteField). */
export function diffFields(before: Row | undefined, after: Row): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after)]);
  for (const k of keys) {
    if (k === 'id') continue;
    const a = (after as unknown as Record<string, unknown>)[k];
    const b = before ? (before as unknown as Record<string, unknown>)[k] : undefined;
    if (a === undefined) {
      if (b !== undefined) out[k] = deleteField();
    } else if (!same(a, b)) out[k] = a;
  }
  return out;
}

