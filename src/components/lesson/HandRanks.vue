<script setup lang="ts">
import PlayingCard from '@/components/cards/PlayingCard.vue'
import type { Card } from '@/components/cards/cardAssets'

const ranks: Array<{ name: string; english: string; cards: Card[] }> = [
  { name: '皇家同花顺', english: 'Royal flush', cards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 's' }, { rank: 'Q', suit: 's' }, { rank: 'J', suit: 's' }, { rank: '10', suit: 's' }] },
  { name: '同花顺', english: 'Straight flush', cards: [{ rank: '9', suit: 'h' }, { rank: '8', suit: 'h' }, { rank: '7', suit: 'h' }, { rank: '6', suit: 'h' }, { rank: '5', suit: 'h' }] },
  { name: '四条', english: 'Four of a kind', cards: [{ rank: 'A', suit: 'c' }, { rank: 'A', suit: 'd' }, { rank: 'A', suit: 'h' }, { rank: 'A', suit: 's' }, { rank: '9', suit: 'd' }] },
  { name: '葫芦', english: 'Full house', cards: [{ rank: 'K', suit: 'h' }, { rank: 'K', suit: 'd' }, { rank: 'K', suit: 'c' }, { rank: '7', suit: 's' }, { rank: '7', suit: 'c' }] },
  { name: '同花', english: 'Flush', cards: [{ rank: 'A', suit: 'h' }, { rank: 'J', suit: 'h' }, { rank: '8', suit: 'h' }, { rank: '5', suit: 'h' }, { rank: '2', suit: 'h' }] },
  { name: '顺子', english: 'Straight', cards: [{ rank: '9', suit: 's' }, { rank: '8', suit: 'h' }, { rank: '7', suit: 'd' }, { rank: '6', suit: 'c' }, { rank: '5', suit: 's' }] },
  { name: '三条', english: 'Three of a kind', cards: [{ rank: 'Q', suit: 's' }, { rank: 'Q', suit: 'h' }, { rank: 'Q', suit: 'd' }, { rank: '9', suit: 'c' }, { rank: '4', suit: 's' }] },
  { name: '两对', english: 'Two pair', cards: [{ rank: 'J', suit: 's' }, { rank: 'J', suit: 'h' }, { rank: '4', suit: 'd' }, { rank: '4', suit: 'c' }, { rank: '9', suit: 's' }] },
  { name: '一对', english: 'One pair', cards: [{ rank: 'A', suit: 'c' }, { rank: 'A', suit: 'd' }, { rank: '10', suit: 'h' }, { rank: '7', suit: 's' }, { rank: '3', suit: 'c' }] },
  { name: '高牌', english: 'High card', cards: [{ rank: 'A', suit: 's' }, { rank: 'J', suit: 'd' }, { rank: '8', suit: 'c' }, { rank: '5', suit: 'h' }, { rank: '2', suit: 's' }] }
]
</script>

<template>
  <div class="pp-rank-list" aria-label="德州扑克牌型从大到小">
    <article v-for="(hand, index) in ranks" :key="hand.name" class="pp-rank-row" data-hand-rank>
      <span class="pp-rank-number">{{ String(index + 1).padStart(2, '0') }}</span>
      <div>
        <strong>{{ hand.name }}</strong>
        <small>{{ hand.english }}</small>
      </div>
      <div class="pp-rank-cards">
        <PlayingCard v-for="card in hand.cards" :key="`${card.rank}${card.suit}`" :card="card" size="board" />
      </div>
    </article>
  </div>
</template>
