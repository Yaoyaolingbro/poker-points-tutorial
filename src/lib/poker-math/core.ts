function requireNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be a non-negative number`)
}

export function potOddsThreshold(currentPot: number, callAmount: number): number {
  requireNonNegative(currentPot, 'currentPot')
  requireNonNegative(callAmount, 'callAmount')
  const finalPot = currentPot + callAmount
  return finalPot === 0 ? 0 : callAmount / finalPot
}

export function exactHitChance(outs: number, unseenCards: number, cardsToCome: 1 | 2): number {
  if (!Number.isInteger(outs) || outs < 0 || outs > unseenCards) throw new Error('outs must fit inside unseenCards')
  if (!Number.isInteger(unseenCards) || unseenCards < cardsToCome) throw new Error('not enough unseen cards')

  let missChance = 1
  for (let draw = 0; draw < cardsToCome; draw += 1) {
    missChance *= (unseenCards - outs - draw) / (unseenCards - draw)
  }
  return 1 - missChance
}

export function ruleOfTwoAndFour(outs: number, cardsToCome: 1 | 2): number {
  requireNonNegative(outs, 'outs')
  return outs * (cardsToCome === 2 ? 4 : 2)
}

export function effectiveStack(...stacks: number[]): number {
  if (stacks.length < 2) throw new Error('effectiveStack needs at least two stacks')
  stacks.forEach((stack) => requireNonNegative(stack, 'stack'))
  return Math.min(...stacks)
}

export function stackToPotRatio(effectiveStackAtStreetStart: number, potAtStreetStart: number): number {
  requireNonNegative(effectiveStackAtStreetStart, 'effectiveStackAtStreetStart')
  if (!Number.isFinite(potAtStreetStart) || potAtStreetStart <= 0) throw new Error('potAtStreetStart must be positive')
  return effectiveStackAtStreetStart / potAtStreetStart
}
