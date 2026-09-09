import type { Card } from '@/components/cards/cardAssets'

export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'
export type Position = 'UTG' | 'UTG+1' | 'LJ' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB'
export type Action =
  | { kind: 'fold' }
  | { kind: 'check' }
  | { kind: 'call' }
  | { kind: 'bet'; amount: number }
  | { kind: 'raiseTo'; amount: number }

export interface PlayerDefinition {
  id: string
  name: string
  position: Position
  startingPoints: number
  cards?: [Card, Card]
}

export type HandEvent =
  | { kind: 'action'; street: Street; playerId: string; action: Action; note?: string }
  | { kind: 'dealBoard'; street: 'flop' | 'turn' | 'river'; cards: Card[]; note?: string }
  | { kind: 'showdown'; revealedPlayerIds: string[]; note: string }

export interface HandDefinition {
  id: string
  title: string
  smallBlind: number
  bigBlind: number
  heroId: string
  players: PlayerDefinition[]
  events: HandEvent[]
}

export interface PlayerSnapshot extends PlayerDefinition {
  points: number
  streetContribution: number
  folded: boolean
  revealed: boolean
}

export interface HandSnapshot {
  street: Street
  pot: number
  currentBet: number
  board: Card[]
  activePlayerId?: string
  eventIndex: number
  note?: string
  players: PlayerSnapshot[]
}
