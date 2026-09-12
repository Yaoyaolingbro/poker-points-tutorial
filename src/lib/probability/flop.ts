import { fullDeck, rankOf, suitOf } from '../poker/deck.ts'
import { scoreCards, type HandCategory } from '../poker/evaluator.ts'
import { startingHand } from './preflop.ts'

export interface FlopOutcome {
  total: 19600
  made: Record<HandCategory, number>
  draws: {
    flushDraw: number
    openEnded: number
    gutshot: number
    pairPlusFlushDraw: number
    pairPlusStraightDraw: number
  }
}

const categoryNames: HandCategory[] = ['高牌', '一对', '两对', '三条', '顺子', '同花', '葫芦', '四条', '同花顺']

function rankSet(cards: readonly number[]): Set<number> {
  return new Set(cards.map(rankOf))
}

function hasStraight(cards: readonly number[]): boolean {
  const ranks = rankSet(cards)
  const wheels = [14, 2, 3, 4, 5]
  if (wheels.every((rank) => ranks.has(rank))) return true
  for (let high = 14; high >= 6; high -= 1) {
    if ([0, 1, 2, 3, 4].every((offset) => ranks.has(high - offset))) return true
  }
  return false
}

function hasOpenEndedDraw(cards: readonly number[]): boolean {
  if (hasStraight(cards)) return false
  const ranks = rankSet(cards)
  for (let low = 2; low <= 10; low += 1) {
    if ([0, 1, 2, 3].every((offset) => ranks.has(low + offset))) return true
  }
  return false
}

function hasGutshotDraw(cards: readonly number[]): boolean {
  if (hasStraight(cards) || hasOpenEndedDraw(cards)) return false
  const ranks = rankSet(cards)
  const windows = [[14, 2, 3, 4, 5]]
  for (let high = 6; high <= 14; high += 1) windows.push([high, high - 1, high - 2, high - 3, high - 4])
  return windows.some((window) => window.filter((rank) => ranks.has(rank)).length === 4)
}

function hasPair(cards: readonly number[]): boolean {
  const counts = new Map<number, number>()
  for (const card of cards) counts.set(rankOf(card), (counts.get(rankOf(card)) ?? 0) + 1)
  return [...counts.values()].some((count) => count >= 2)
}

export function enumerateFlops(handId: string): FlopOutcome {
  const hole = startingHand(handId).cards
  const deck = fullDeck().filter((card) => !hole.includes(card))
  const made = Object.fromEntries(categoryNames.map((name) => [name, 0])) as Record<HandCategory, number>
  const draws = { flushDraw: 0, openEnded: 0, gutshot: 0, pairPlusFlushDraw: 0, pairPlusStraightDraw: 0 }

  for (let first = 0; first < deck.length - 2; first += 1) {
    for (let second = first + 1; second < deck.length - 1; second += 1) {
      for (let third = second + 1; third < deck.length; third += 1) {
        const cards = [...hole, deck[first], deck[second], deck[third]]
        made[scoreCards(cards).category] += 1
        const suitCounts = [0, 0, 0, 0]
        cards.forEach((card) => { suitCounts[suitOf(card)] += 1 })
        const flushDraw = Math.max(...suitCounts) === 4
        const openEnded = hasOpenEndedDraw(cards)
        const gutshot = hasGutshotDraw(cards)
        const pair = hasPair(cards)
        if (flushDraw) draws.flushDraw += 1
        if (openEnded) draws.openEnded += 1
        if (gutshot) draws.gutshot += 1
        if (pair && flushDraw) draws.pairPlusFlushDraw += 1
        if (pair && (openEnded || gutshot)) draws.pairPlusStraightDraw += 1
      }
    }
  }

  return { total: 19600, made, draws }
}
