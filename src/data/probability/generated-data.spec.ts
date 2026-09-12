import { describe, expect, it } from 'vitest'
import equity from './equity.json'
import flopOutcomes from './flop-outcomes.json'
import meta from './meta.json'

describe('generated probability data', () => {
  it('contains exact flop counts for every starting hand', () => {
    expect(Object.keys(flopOutcomes)).toHaveLength(169)
    for (const outcome of Object.values(flopOutcomes)) {
      expect(outcome.total).toBe(19600)
      expect(Object.values(outcome.made).reduce((sum, count) => sum + count, 0)).toBe(19600)
    }
  })

  it('contains seven 100k-trial equity points for every starting hand', () => {
    expect(Object.keys(equity)).toHaveLength(169)
    for (const points of Object.values(equity)) {
      expect(Object.keys(points)).toHaveLength(7)
      for (const point of Object.values(points)) {
        expect(point.trials).toBe(100000)
        expect(point.win).toBeGreaterThanOrEqual(0)
        expect(point.equity).toBeLessThanOrEqual(1)
      }
    }
    expect(equity.AA['1'].equity).toBeGreaterThan(equity.KK['1'].equity)
    expect(equity.KK['1'].equity).toBeGreaterThan(equity.QQ['1'].equity)
    expect(equity.AKs['1'].equity).toBeGreaterThan(equity.AKo['1'].equity)
    expect(equity.AA['7'].equity).toBeLessThan(equity.AA['1'].equity)
  })

  it('records the simulation contract', () => {
    expect(meta.seed).toBe(20260912)
    expect(meta.trialsPerHand).toBe(100000)
    expect(meta.evaluatorVersion).toBe(1)
  })
})
