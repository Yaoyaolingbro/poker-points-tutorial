export function hitByNextCard(outs: number, unseenCards = 47): number {
  if (outs < 0 || outs > unseenCards) throw new Error('outs must fit inside the unseen deck')
  return outs / unseenCards
}

export function hitByRiver(outs: number, unseenCards = 47): number {
  if (outs < 0 || outs > unseenCards - 1) throw new Error('outs must leave cards for both streets')
  const misses = unseenCards - outs
  return 1 - (misses / unseenCards) * ((misses - 1) / (unseenCards - 1))
}

export function breakEvenEquity(currentPot: number, callAmount: number): number {
  return callAmount / (currentPot + callAmount)
}

export function callEV(equity: number, currentPot: number, callAmount: number): number {
  return equity * currentPot - (1 - equity) * callAmount
}
