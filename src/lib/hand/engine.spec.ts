import { describe, expect, it } from 'vitest'
import { firstHand } from '@/data/hands/firstHand'
import { buildTimeline, createInitialSnapshot } from './engine'

describe('hand engine', () => {
  it('posts 10/20 blinds into a 30-point pot', () => {
    const state = createInitialSnapshot(firstHand)
    expect(state.pot).toBe(30)
    expect(state.players.find((player) => player.position === 'SB')?.points).toBe(1990)
    expect(state.players.find((player) => player.position === 'BB')?.points).toBe(1980)
  })

  it('keeps the pot and both active stacks consistent through showdown', () => {
    const timeline = buildTimeline(firstHand)
    const preflopEnd = timeline.find((state) => state.street === 'flop' && state.board.length === 3)
    const riverDeal = timeline.find((state) => state.street === 'river' && state.board.length === 5)
    const final = timeline.at(-1)

    expect(preflopEnd?.pot).toBe(130)
    expect(riverDeal?.pot).toBe(220)
    expect(final?.pot).toBe(500)
    expect(final?.players.find((player) => player.id === 'hero')?.points).toBe(1755)
    expect(final?.players.find((player) => player.id === 'bb')?.points).toBe(1755)
  })

  it('rejects a contribution larger than the player stack', () => {
    const broken = structuredClone(firstHand)
    broken.events[3] = { kind: 'action', street: 'preflop', playerId: 'hero', action: { kind: 'raiseTo', amount: 5000 } }
    expect(() => buildTimeline(broken)).toThrow('hero cannot contribute 5000 points')
  })
})
