import { describe, expect, it } from 'vitest'
import { effectiveStack, exactHitChance, potOddsThreshold, ruleOfTwoAndFour, stackToPotRatio } from './core'

describe('table math', () => {
  it('calculates the equity needed to call', () => {
    expect(potOddsThreshold(300, 100)).toBeCloseTo(0.25)
  })

  it('calculates exact draw chances without replacing cards', () => {
    expect(exactHitChance(9, 47, 2)).toBeCloseTo(0.3497, 3)
    expect(exactHitChance(9, 46, 1)).toBeCloseTo(0.1957, 3)
  })

  it('provides the rule-of-two-and-four table shortcut', () => {
    expect(ruleOfTwoAndFour(9, 2)).toBe(36)
    expect(ruleOfTwoAndFour(9, 1)).toBe(18)
  })

  it('uses the shorter stack and the pot at the start of a street', () => {
    expect(effectiveStack(4000, 1200)).toBe(1200)
    expect(stackToPotRatio(1740, 520)).toBeCloseTo(3.346, 3)
  })
})
