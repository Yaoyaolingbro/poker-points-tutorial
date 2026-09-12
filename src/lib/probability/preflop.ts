import { cardId } from '../poker/deck.ts'

export type StartingHandKind = 'pair' | 'suited' | 'offsuit'

export interface StartingHandInfo {
  id: string
  high: string
  low: string
  kind: StartingHandKind
  combos: 6 | 4 | 12
  probability: number
  cards: [number, number]
}

export const rankLabels = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const
const rankValues: Record<string, number> = { A: 14, K: 13, Q: 12, J: 11, T: 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 }

let cache: StartingHandInfo[] | undefined

export function startingHands(): StartingHandInfo[] {
  if (cache) return cache
  cache = rankLabels.flatMap((rowRank, row) => rankLabels.map((columnRank, column) => {
    const pair = row === column
    const suited = row < column
    const high = pair || suited ? rowRank : columnRank
    const low = pair || suited ? columnRank : rowRank
    const kind: StartingHandKind = pair ? 'pair' : suited ? 'suited' : 'offsuit'
    const combos = pair ? 6 : suited ? 4 : 12
    const cards: [number, number] = pair
      ? [cardId(rankValues[high], 0), cardId(rankValues[low], 1)]
      : suited
        ? [cardId(rankValues[high], 0), cardId(rankValues[low], 0)]
        : [cardId(rankValues[high], 0), cardId(rankValues[low], 1)]
    return {
      id: pair ? `${high}${low}` : `${high}${low}${suited ? 's' : 'o'}`,
      high,
      low,
      kind,
      combos,
      probability: combos / 1326,
      cards
    } satisfies StartingHandInfo
  }))
  return cache
}

export function startingHand(id: string): StartingHandInfo {
  const result = startingHands().find((hand) => hand.id === id)
  if (!result) throw new Error(`Unknown starting hand: ${id}`)
  return result
}

export const probabilityAnyPair = () => 78 / 1326
export const probabilitySpecificPair = () => 6 / 1326
