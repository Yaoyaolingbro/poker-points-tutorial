<script setup lang="ts">
import { ref } from 'vue'
import PlayingCard from '@/components/cards/PlayingCard.vue'
import type { Card } from '@/components/cards/cardAssets'

const revealed = ref(false)
const heroCards: Card[] = [{ rank: 'A', suit: 'c' }, { rank: '8', suit: 'c' }]
const board: Card[] = [
  { rank: 'A', suit: 'h' },
  { rank: '8', suit: 'd' },
  { rank: '6', suit: 'c' },
  { rank: '6', suit: 's' },
  { rank: '2', suit: 'h' }
]
</script>

<template>
  <section class="pp-decision-drill">
    <header>
      <span>河牌 · 有效筹码 200BB</span>
      <strong>底池 480。你下注 180，对手加注到 800。</strong>
    </header>

    <div class="pp-drill-cards">
      <div>
        <small>你的牌</small>
        <div class="pp-card-pair">
          <PlayingCard v-for="card in heroCards" :key="`${card.rank}${card.suit}`" :card="card" size="board" />
        </div>
      </div>
      <div>
        <small>公共牌</small>
        <div class="pp-card-pair">
          <PlayingCard v-for="card in board" :key="`${card.rank}${card.suit}`" :card="card" size="board" />
        </div>
      </div>
    </div>

    <p>两对看起来很漂亮。现在别看牌型名称，先数：哪些更差的牌会用这个尺度加注？</p>
    <button v-if="!revealed" type="button" data-reveal @click="revealed = true">我数完了，看答案</button>

    <div v-else class="pp-drill-answer" data-answer>
      <strong>默认先停下来。</strong>
      <p>更差的牌很少会这样加注。A2、普通 Ax 也许会跟你的 180，却很少突然加到 800。能自然这样做的，是 6x、A6、86、88、AA；它们都是三条或葫芦。</p>
      <p>对手当然可能诈唬，但“他也许在诈唬”不是自动跟注的理由。先找到足够多的具体诈唬组合，再改变默认线。</p>
    </div>
  </section>
</template>
