export type Suit = 's' | 'h' | 'd' | 'c'
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'
export interface Card { rank: Rank; suit: Suit }

const suitFile = { s: 'spade', h: 'heart', d: 'diamond', c: 'club' } as const
const suitLabel = { s: '黑桃', h: '红桃', d: '方片', c: '梅花' } as const
const rankFile: Record<Rank, string> = {
  '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
  '8': '8', '9': '9', '10': '10', J: 'Jack', Q: 'Queen', K: 'King', A: 'Ace'
}

export function cardAssetPath(card: Card): string {
  return `/cards/svgcards/${suitFile[card.suit]}${rankFile[card.rank]}.svg`
}

export function cardLabel(card: Card): string {
  return `${suitLabel[card.suit]} ${card.rank}`
}
