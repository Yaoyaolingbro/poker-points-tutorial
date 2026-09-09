import type { Action, HandDefinition, HandEvent, HandSnapshot, PlayerSnapshot } from './types'

function requiredPlayer(players: PlayerSnapshot[], id: string): PlayerSnapshot {
  const player = players.find((candidate) => candidate.id === id)
  if (!player) throw new Error(`Unknown player: ${id}`)
  return player
}

function contribute(state: HandSnapshot, player: PlayerSnapshot, amount: number): void {
  if (!Number.isInteger(amount) || amount < 0 || amount > player.points) {
    throw new Error(`${player.id} cannot contribute ${amount} points`)
  }
  player.points -= amount
  player.streetContribution += amount
  state.pot += amount
}

export function createInitialSnapshot(hand: HandDefinition): HandSnapshot {
  if (hand.players.length < 5 || hand.players.length > 8) throw new Error('A table must contain 5–8 players')
  const players = hand.players.map((player) => ({
    ...structuredClone(player),
    points: player.startingPoints,
    streetContribution: 0,
    folded: false,
    revealed: player.id === hand.heroId
  }))
  const state: HandSnapshot = {
    street: 'preflop',
    pot: 0,
    currentBet: hand.bigBlind,
    board: [],
    eventIndex: -1,
    players
  }
  const smallBlindPlayer = players.find((player) => player.position === 'SB')
  const bigBlindPlayer = players.find((player) => player.position === 'BB')
  if (!smallBlindPlayer || !bigBlindPlayer) throw new Error('SB and BB seats are required')
  contribute(state, smallBlindPlayer, hand.smallBlind)
  contribute(state, bigBlindPlayer, hand.bigBlind)
  return state
}

function applyAction(state: HandSnapshot, player: PlayerSnapshot, action: Action): void {
  if (player.folded) throw new Error(`${player.id} already folded`)
  if (action.kind === 'fold') {
    player.folded = true
    return
  }
  if (action.kind === 'check') {
    if (player.streetContribution !== state.currentBet) throw new Error(`${player.id} cannot check facing a bet`)
    return
  }
  if (action.kind === 'call') {
    contribute(state, player, state.currentBet - player.streetContribution)
    return
  }
  const target = action.amount
  if (action.kind === 'bet' && state.currentBet !== 0) throw new Error('Use raiseTo when a bet already exists')
  if (target <= state.currentBet) throw new Error(`${action.kind} must increase the current bet`)
  contribute(state, player, target - player.streetContribution)
  state.currentBet = target
}

export function applyHandEvent(snapshot: HandSnapshot, event: HandEvent, eventIndex = snapshot.eventIndex + 1): HandSnapshot {
  const state = structuredClone(snapshot)
  state.activePlayerId = undefined
  state.eventIndex = eventIndex
  state.note = event.note

  if (event.kind === 'dealBoard') {
    state.street = event.street
    state.currentBet = 0
    state.players.forEach((player) => { player.streetContribution = 0 })
    state.board.push(...event.cards)
    return state
  }

  if (event.kind === 'showdown') {
    state.street = 'showdown'
    state.players.forEach((player) => { player.revealed = event.revealedPlayerIds.includes(player.id) })
    return state
  }

  if (event.street !== state.street) throw new Error(`Event street ${event.street} does not match ${state.street}`)
  const player = requiredPlayer(state.players, event.playerId)
  state.activePlayerId = player.id
  applyAction(state, player, event.action)
  return state
}

export function buildTimeline(hand: HandDefinition): HandSnapshot[] {
  const timeline = [createInitialSnapshot(hand)]
  hand.events.forEach((event, index) => timeline.push(applyHandEvent(timeline.at(-1)!, event, index)))
  return timeline
}
