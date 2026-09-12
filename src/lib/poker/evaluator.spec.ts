import { describe, expect, it } from 'vitest'
import { parseCards } from './deck'
import { compareHands, scoreCards } from './evaluator'

const ids = parseCards

describe('poker evaluator', () => {
  it('recognizes every important comparison boundary', () => {
    expect(scoreCards(ids('As Ks Qs Js Ts 2d 3c')).category).toBe('同花顺')
    expect(scoreCards(ids('As Ad Ac Ks Kd 2c 3h')).category).toBe('葫芦')
    expect(scoreCards(ids('As 2d 3c 4h 5s 9d Tc')).category).toBe('顺子')
  })

  it('uses kickers after the made hand ties', () => {
    expect(compareHands(
      ids('As Ad Kc 9d 7s 4h 2c'),
      ids('Ah Ac Qs 9d 7s 4h 2c')
    )).toBeGreaterThan(0)
  })

  it('ignores hole cards when the board is already the best five', () => {
    expect(compareHands(
      ids('As Kh Qd Jc Ts 9c 9d'),
      ids('As Kh Qd Jc Ts 4c 4d')
    )).toBe(0)
  })
})
