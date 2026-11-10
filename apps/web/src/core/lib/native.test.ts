import { describe, expect, it } from 'vitest'
import { pkcePair } from './native'

describe('pkcePair', () => {
  it('makes a URL-safe verifier and an S256 challenge of the right length', async () => {
    const { verifier, challenge } = await pkcePair()
    expect(verifier).toMatch(/^[A-Za-z0-9_-]{43,128}$/)
    expect(challenge).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(challenge).not.toBe(verifier)
  })
})
