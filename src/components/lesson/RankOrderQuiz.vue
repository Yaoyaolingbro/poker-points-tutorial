<script setup lang="ts">
import { ref } from 'vue'
import PlayingCard from '@/components/cards/PlayingCard.vue'
import type { Card } from '@/components/cards/cardAssets'

const board: Card[] = [
  { rank: '9', suit: 's' },
  { rank: '8', suit: 's' },
  { rank: '7', suit: 'd' },
  { rank: '2', suit: 'c' },
  { rank: '2', suit: 'h' }
]
const hero: Card[] = [{ rank: '10', suit: 'c' }, { rank: '6', suit: 'c' }]
const villain: Card[] = [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 's' }]
const answer = ref<'hero' | 'villain' | 'tie' | null>(null)
</script>

<template>
  <section class="pp-mini-quiz" aria-labelledby="rank-quiz-title">
    <header>
      <small>先猜，再看答案</small>
      <h2 id="rank-quiz-title">谁赢？</h2>
    </header>

    <div class="pp-quiz-board" aria-label="公共牌">
      <PlayingCard
        v-for="card in board"
        :key="`${card.rank}${card.suit}`"
        :card="card"
        size="board"
      />
    </div>

    <div class="pp-quiz-hands">
      <button data-choice="hero" :aria-pressed="answer === 'hero'" @click="answer = 'hero'">
        <span>你：10♣6♣</span>
        <span class="pp-card-pair">
          <PlayingCard v-for="card in hero" :key="`${card.rank}${card.suit}`" :card="card" size="board" />
        </span>
      </button>
      <button data-choice="villain" :aria-pressed="answer === 'villain'" @click="answer = 'villain'">
        <span>对手：A♠K♠</span>
        <span class="pp-card-pair">
          <PlayingCard v-for="card in villain" :key="`${card.rank}${card.suit}`" :card="card" size="board" />
        </span>
      </button>
      <button data-choice="tie" :aria-pressed="answer === 'tie'" @click="answer = 'tie'">平分</button>
    </div>

    <p v-if="answer" class="pp-quiz-answer" data-quiz-answer role="status">
      <strong>{{ answer === 'hero' ? '答对了。' : '再数一次。' }}</strong>
      你用 10、9、8、7、6 组成 10 高顺子。对手连同公共牌只有四张黑桃，没有同花，最终只是一对 2。
    </p>
  </section>
</template>
