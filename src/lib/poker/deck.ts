const rankChars = '23456789TJQKA'
const suitChars = 'shdc'

export function cardId(rank: number, suit: number): number {
  return (rank - 2) * 4 + suit
}

export function rankOf(card: number): number {
  return Math.floor(card / 4) + 2
}

export function suitOf(card: number): number {
  return card % 4
}

export function parseCard(token: string): number {
  const normalized = token.trim()
  const suit = suitChars.indexOf(normalized.at(-1)?.toLowerCase() ?? '')
  const rawRank = normalized.slice(0, -1).toUpperCase().replace('10', 'T')
  const rankIndex = rankChars.indexOf(rawRank)
  if (rankIndex < 0 || suit < 0) throw new Error(`Invalid card: ${token}`)
  return rankIndex * 4 + suit
}

export function parseCards(text: string): number[] {
  return text.trim().split(/\s+/u).filter(Boolean).map(parseCard)
}

export function fullDeck(): number[] {
  return Array.from({ length: 52 }, (_, index) => index)
}

export function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return (state >>> 0) / 0x100000000
  }
}
