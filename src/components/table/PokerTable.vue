<script setup lang="ts">
import PlayingCard from '@/components/cards/PlayingCard.vue'
import type { Card } from '@/components/cards/cardAssets'
import type { HandSnapshot, PlayerSnapshot } from '@/lib/hand/types'

const props = defineProps<{ snapshot: HandSnapshot; heroId: string }>()

const hiddenCards: [Card, Card] = [
  { rank: '2', suit: 'c' },
  { rank: '3', suit: 'c' }
]

function displayedCards(player: PlayerSnapshot): [Card, Card] {
  return player.cards ?? hiddenCards
}

const seatLayouts: Record<number, Array<[number, number]>> = {
  5: [[50, 2], [88, 32], [70, 96], [30, 96], [12, 32]],
  6: [[50, 2], [88, 28], [88, 73], [50, 96], [12, 73], [12, 28]],
  7: [[50, 2], [82, 18], [92, 52], [72, 92], [28, 92], [8, 52], [18, 18]],
  8: [[50, 2], [76, 13], [92, 36], [88, 73], [62, 96], [38, 96], [12, 73], [8, 36]]
}

function seatStyle(index: number): Record<string, string> {
  const point = seatLayouts[props.snapshot.players.length]?.[index]
  if (!point) throw new Error(`No seat layout for ${props.snapshot.players.length} players`)
  return { left: `${point[0]}%`, top: `${point[1]}%` }
}
</script>

<template>
  <section class="pp-poker-table" :data-street="snapshot.street">
    <div class="pp-felt" :data-seat-count="snapshot.players.length">
      <article
        v-for="(player, seatIndex) in snapshot.players"
        :key="player.id"
        class="pp-seat"
        :class="{ 'is-active': player.id === snapshot.activePlayerId, 'is-folded': player.folded }"
        :data-position="player.position"
        :data-seat-index="seatIndex"
        :style="seatStyle(seatIndex)"
        data-seat
      >
        <strong>{{ player.id === heroId ? '你' : player.name }} · {{ player.position }}</strong>
        <span>{{ player.points }} 积分</span>
        <div class="pp-hole-cards">
          <PlayingCard
            v-for="(card, cardIndex) in displayedCards(player)"
            :key="`${player.id}-${cardIndex}-${player.revealed}`"
            :card="card"
            :face-down="!player.revealed"
            size="seat"
          />
        </div>
      </article>

      <div class="pp-board" aria-label="公共牌">
        <PlayingCard v-for="card in snapshot.board" :key="`${card.rank}${card.suit}`" :card="card" size="board" />
      </div>
      <div class="pp-table-pot" data-pot>底池 <strong>{{ snapshot.pot }}</strong></div>
    </div>
  </section>
</template>
