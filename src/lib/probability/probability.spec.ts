import { describe, expect, it } from 'vitest'
import { enumerateFlops } from './flop'
import {
  probabilityAnyPair,
  probabilitySpecificPair,
  startingHand,
  startingHands
} from './preflop'
import { breakEvenEquity, callEV, hitByNextCard, hitByRiver } from './outs'

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
    expect(hitByNextCard(9, 47)).toBeCloseTo(0.191489, 6)
    expect(hitByRiver(9, 47)).toBeCloseTo(0.349676, 6)
    expect(hitByNextCard(8, 47)).toBeCloseTo(0.170213, 6)
    expect(hitByRiver(8, 47)).toBeCloseTo(0.314524, 6)
    expect(hitByNextCard(4, 47)).toBeCloseTo(0.085106, 6)
    expect(hitByRiver(4, 47)).toBeCloseTo(0.164662, 6)
  })

  it('connects a call price to break-even equity and EV', () => {
    expect(breakEvenEquity(300, 100)).toBe(0.25)
    expect(callEV(0.35, 300, 100)).toBeCloseTo(40, 10)
  })
})

describe('flop enumeration', () => {
  it('partitions every possible flop for a starting-hand class', () => {
    const result = enumerateFlops('AKs')
    expect(result.total).toBe(19600)
    expect(Object.values(result.made).reduce((sum, count) => sum + count, 0)).toBe(19600)
  })
})
