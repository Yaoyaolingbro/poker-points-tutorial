import type { HandDefinition } from '@/lib/hand/types'

export const firstHand: HandDefinition = {
  id: 'first-six-max-hand',
  title: '按钮位的 A♠J♠',
  smallBlind: 10,
  bigBlind: 20,
  heroId: 'hero',
  players: [
    { id: 'utg', name: '林', position: 'UTG', startingPoints: 2000 },
    { id: 'hj', name: '周', position: 'HJ', startingPoints: 2000 },
    { id: 'co', name: '陈', position: 'CO', startingPoints: 2000 },
    { id: 'hero', name: '你', position: 'BTN', startingPoints: 2000, cards: [{ rank: 'A', suit: 's' }, { rank: 'J', suit: 's' }] },
    { id: 'sb', name: '许', position: 'SB', startingPoints: 2000 },
    { id: 'bb', name: '唐', position: 'BB', startingPoints: 2000, cards: [{ rank: 'Q', suit: 's' }, { rank: '10', suit: 's' }] }
  ],
  events: [
    { kind: 'action', street: 'preflop', playerId: 'utg', action: { kind: 'fold' } },
    { kind: 'action', street: 'preflop', playerId: 'hj', action: { kind: 'fold' } },
    { kind: 'action', street: 'preflop', playerId: 'co', action: { kind: 'fold' } },
    { kind: 'action', street: 'preflop', playerId: 'hero', action: { kind: 'raiseTo', amount: 60 }, note: '你加注到 60。' },
    { kind: 'action', street: 'preflop', playerId: 'sb', action: { kind: 'fold' } },
    { kind: 'action', street: 'preflop', playerId: 'bb', action: { kind: 'call' }, note: '大盲补到 60，底池来到 130。' },
    { kind: 'dealBoard', street: 'flop', cards: [{ rank: 'K', suit: 's' }, { rank: '7', suit: 's' }, { rank: '2', suit: 'd' }], note: '你还没有成牌，但任何一张黑桃都能完成 A 高同花。' },
    { kind: 'action', street: 'flop', playerId: 'bb', action: { kind: 'check' } },
    { kind: 'action', street: 'flop', playerId: 'hero', action: { kind: 'bet', amount: 45 }, note: '你下注 45。更好的 Kx 现在不会弃牌，这次下注不该被说成纯诈唬。' },
    { kind: 'action', street: 'flop', playerId: 'bb', action: { kind: 'call' }, note: '大盲跟注，底池 220。' },
    { kind: 'dealBoard', street: 'turn', cards: [{ rank: '4', suit: 'h' }], note: '转牌没有改善你的牌。' },
    { kind: 'action', street: 'turn', playerId: 'bb', action: { kind: 'check' } },
    { kind: 'action', street: 'turn', playerId: 'hero', action: { kind: 'check' }, note: '你随后过牌，保留看到河牌的机会。' },
    { kind: 'dealBoard', street: 'river', cards: [{ rank: '3', suit: 's' }], note: '河牌是黑桃。你的 A 高同花完成。' },
    { kind: 'action', street: 'river', playerId: 'bb', action: { kind: 'check' } },
    { kind: 'action', street: 'river', playerId: 'hero', action: { kind: 'bet', amount: 140 }, note: '你下注 140。现在能跟注的更差牌包括较小同花。' },
    { kind: 'action', street: 'river', playerId: 'bb', action: { kind: 'call' }, note: '大盲跟注，底池 500。' },
    { kind: 'showdown', revealedPlayerIds: ['hero', 'bb'], note: 'A 高同花赢过 Q 高同花。先记住这一点：河牌下注有明确的更差跟注对象。' }
  ]
}
