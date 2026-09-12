import { describe, expect, it } from 'vitest'
import { enumerateFlops } from './flop'
import {
  probabilityAnyPair,
  probabilitySpecificPair,
  startingHand,
  startingHands
} from './preflop'
import { hitByNextCard, hitByRiver } from './outs'

describe('preflop combinations', () => {
  it('maps 169 classes back to all 1326 concrete deals', () => {
    expect(startingHands()).toHaveLength(169)
    expect(startingHands().reduce((sum, hand) => sum + hand.combos, 0)).toBe(1326)
    expect(startingHand('AA').combos).toBe(6)
    expect(startingHand('AKs').combos).toBe(4)
    expect(startingHand('AKo').combos).toBe(12)
  })

  it('computes pair occurrence from concrete combinations', () => {
    expect(probabilityAnyPair()).toBeCloseTo(78 / 1326, 12)
    expect(probabilitySpecificPair()).toBeCloseTo(6 / 1326, 12)
  })
})

describe('draw probabilities', () => {
  it('uses exact complements rather than the rule of four', () => {
    expect(hitByNextCard(9, 47)).toBeCloseTo(9 / 47, 12)
    expect(hitByRiver(9, 47)).toBeCloseTo(1 - (38 / 47) * (37 / 46), 12)
  })
})

describe('flop enumeration', () => {
  it('partitions every possible flop for a starting-hand class', () => {
    const result = enumerateFlops('AKs')
    expect(result.total).toBe(19600)
    expect(Object.values(result.made).reduce((sum, count) => sum + count, 0)).toBe(19600)
  })
})
