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
  if (currentPot < 0 || callAmount < 0 || currentPot + callAmount === 0) {
    throw new Error('pot and call must describe a positive decision')
  }
  return callAmount / (currentPot + callAmount)
}

export function callEV(equity: number, currentPot: number, callAmount: number): number {
  if (equity < 0 || equity > 1 || currentPot < 0 || callAmount < 0) {
    throw new Error('equity, pot and call are outside their valid range')
  }
  return equity * currentPot - (1 - equity) * callAmount
}
