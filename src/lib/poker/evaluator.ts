import { rankOf, suitOf } from './deck'

export type HandCategory = '高牌' | '一对' | '两对' | '三条' | '顺子' | '同花' | '葫芦' | '四条' | '同花顺'

export interface HandScore {
  value: number
  category: HandCategory
  kickers: number[]
}

const categories: HandCategory[] = ['高牌', '一对', '两对', '三条', '顺子', '同花', '葫芦', '四条', '同花顺']
const categoryBase = 15 ** 5

function straightHigh(ranks: readonly number[]): number {
  const present = new Set(ranks)
  for (let high = 14; high >= 6; high -= 1) {
    if ([0, 1, 2, 3, 4].every((offset) => present.has(high - offset))) return high
  }
  return [14, 5, 4, 3, 2].every((rank) => present.has(rank)) ? 5 : 0
}

function pack(categoryIndex: number, kickers: readonly number[]): HandScore {
  const padded = [...kickers, 0, 0, 0, 0, 0].slice(0, 5)
  const detail = padded.reduce((value, rank) => value * 15 + rank, 0)
  return { value: categoryIndex * categoryBase + detail, category: categories[categoryIndex], kickers: [...kickers] }
}

export function scoreCards(cards: readonly number[]): HandScore {
  if (cards.length < 5 || cards.length > 7) throw new Error('scoreCards expects five to seven cards')
  if (new Set(cards).size !== cards.length) throw new Error('scoreCards received a duplicate card')

  const counts = Array<number>(15).fill(0)
  const suits: number[][] = [[], [], [], []]
  for (const card of cards) {
    const rank = rankOf(card)
    counts[rank] += 1
    suits[suitOf(card)].push(rank)
  }

  for (const suitedRanks of suits) {
    if (suitedRanks.length >= 5) {
      const high = straightHigh(suitedRanks)
      if (high) return pack(8, [high])
    }
  }

  const quads = counts.findLastIndex((count) => count === 4)
  if (quads >= 2) {
    const kicker = counts.findLastIndex((count, rank) => rank !== quads && count > 0)
    return pack(7, [quads, kicker])
  }

  const trips = Array.from({ length: 13 }, (_, index) => index + 2)
    .filter((rank) => counts[rank] >= 3)
    .sort((a, b) => b - a)
  const pairRanks = Array.from({ length: 13 }, (_, index) => index + 2)
    .filter((rank) => counts[rank] >= 2)
    .sort((a, b) => b - a)
  if (trips.length && pairRanks.some((rank) => rank !== trips[0])) {
    const pair = pairRanks.find((rank) => rank !== trips[0])!
    return pack(6, [trips[0], pair])
  }

  const flush = suits.find((suitedRanks) => suitedRanks.length >= 5)
  if (flush) return pack(5, [...flush].sort((a, b) => b - a).slice(0, 5))

  const straight = straightHigh(counts.flatMap((count, rank) => count ? [rank] : []))
  if (straight) return pack(4, [straight])

  if (trips.length) {
    const kickers = counts.flatMap((count, rank) => count && rank !== trips[0] ? [rank] : [])
      .sort((a, b) => b - a)
      .slice(0, 2)
    return pack(3, [trips[0], ...kickers])
  }

  if (pairRanks.length >= 2) {
    const [highPair, lowPair] = pairRanks
    const kicker = counts.findLastIndex((count, rank) => rank !== highPair && rank !== lowPair && count > 0)
    return pack(2, [highPair, lowPair, kicker])
  }

  if (pairRanks.length === 1) {
    const pair = pairRanks[0]
    const kickers = counts.flatMap((count, rank) => count && rank !== pair ? [rank] : [])
      .sort((a, b) => b - a)
      .slice(0, 3)
    return pack(1, [pair, ...kickers])
  }

  const highCards = counts.flatMap((count, rank) => count ? [rank] : []).sort((a, b) => b - a).slice(0, 5)
  return pack(0, highCards)
}

export function compareHands(left: readonly number[], right: readonly number[]): number {
  return scoreCards(left).value - scoreCards(right).value
}
