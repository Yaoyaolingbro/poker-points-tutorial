<script setup lang="ts">
import { computed, ref } from 'vue'
import PlayingCard from '@/components/cards/PlayingCard.vue'
import { cardLabel, type Card } from '@/components/cards/cardAssets'

interface Candidate {
  id: string
  card: Card
  source: '底牌' | '公共牌'
}

const cards: Candidate[] = [
  { id: 'as', card: { rank: 'A', suit: 's' }, source: '底牌' },
  { id: 'kd', card: { rank: 'K', suit: 'd' }, source: '底牌' },
  { id: 'ac', card: { rank: 'A', suit: 'c' }, source: '公共牌' },
  { id: '9d', card: { rank: '9', suit: 'd' }, source: '公共牌' },
  { id: '7s', card: { rank: '7', suit: 's' }, source: '公共牌' },
  { id: '4h', card: { rank: '4', suit: 'h' }, source: '公共牌' },
  { id: '2c', card: { rank: '2', suit: 'c' }, source: '公共牌' }
]

const correct = new Set(['as', 'kd', 'ac', '9d', '7s'])
const selected = ref<string[]>([])
const checked = ref(false)
const isCorrect = computed(() => (
  selected.value.length === 5 && selected.value.every((id) => correct.has(id))
))

function toggle(id: string) {
  checked.value = false
  if (selected.value.includes(id)) {
    selected.value = selected.value.filter((cardId) => cardId !== id)
  } else if (selected.value.length < 5) {
    selected.value = [...selected.value, id]
  }
}

function reset() {
  selected.value = []
  checked.value = false
}
</script>

<template>
  <section class="pp-best-five" aria-labelledby="best-five-title">
    <header>
      <small>动手题</small>
      <h2 id="best-five-title">点出最终参加比较的五张牌</h2>
      <p>已经选了 {{ selected.length }} / 5 张</p>
    </header>

    <div class="pp-best-five-cards">
      <button
        v-for="candidate in cards"
        :key="candidate.id"
        :data-select-card="candidate.id"
        :aria-pressed="selected.includes(candidate.id)"
        :aria-label="`${candidate.source} ${cardLabel(candidate.card)}`"
        @click="toggle(candidate.id)"
      >
        <small>{{ candidate.source }}</small>
        <PlayingCard :card="candidate.card" size="teaching" />
      </button>
    </div>

    <div class="pp-best-five-actions">
      <button data-check-best-five :disabled="selected.length !== 5" @click="checked = true">检查答案</button>
      <button data-reset-best-five @click="reset">重新选</button>
    </div>

    <p v-if="checked" class="pp-best-five-answer" data-best-five-answer role="status">
      <strong>{{ isCorrect ? '选对了。' : '还差一步。' }}</strong>
      最好的五张是 A♠ A♣ K♦ 9♦ 7♠：一对 A，K、9、7 踢脚。4♥ 和 2♣ 都排在第六张以后。
    </p>
  </section>
</template>
