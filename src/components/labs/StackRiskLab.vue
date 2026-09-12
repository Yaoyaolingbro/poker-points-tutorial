<script setup lang="ts">
import { computed, ref } from 'vue'
import PlayingCard from '@/components/cards/PlayingCard.vue'
import type { Card } from '@/components/cards/cardAssets'

const depthBB = ref(100)
const bigBlind = 20
const investedEach = 60
const flopPot = 130
const remaining = computed(() => depthBB.value * bigBlind - investedEach)
const spr = computed(() => remaining.value / flopPot)
const hero: Card[] = [{ rank: 'A', suit: 'c' }, { rank: 'K', suit: 'd' }]
const flop: Card[] = [{ rank: 'K', suit: 'h' }, { rank: '7', suit: 's' }, { rank: '2', suit: 'c' }]

const warning = computed(() => {
  if (depthBB.value <= 100) return '顶对顶踢脚很强，但高 SPR 仍不等于必须打光。'
  if (depthBB.value <= 150) return '后面可投入的积分变多：位置和对手范围开始明显放大差异。'
  return '一对没有升级，风险却翻了近一倍。此时更看重位置与坚果潜力。'
})
</script>

<template>
  <section class="pp-stack-risk" aria-labelledby="stack-risk-title">
    <header class="pp-lab-heading">
      <span>同一副牌，不同深度</span>
      <h2 id="stack-risk-title">AK 顶对，能承受多大的底池？</h2>
    </header>

    <div class="pp-stack-risk-table">
      <div class="pp-stack-risk-cards">
        <small>你的牌</small>
        <span><PlayingCard v-for="card in hero" :key="`${card.rank}${card.suit}`" :card="card" size="board" /></span>
      </div>
      <div class="pp-stack-risk-cards">
        <small>翻牌 · 底池 130</small>
        <span><PlayingCard v-for="card in flop" :key="`${card.rank}${card.suit}`" :card="card" size="board" /></span>
      </div>
    </div>

    <label class="pp-stack-risk-control">
      <span>双方起始深度 <strong data-depth-bb>{{ depthBB }}BB</strong></span>
      <input v-model.number="depthBB" data-depth-control type="range" min="100" max="200" step="50">
      <span class="pp-stack-risk-marks"><i>100BB</i><i>150BB</i><i>200BB</i></span>
    </label>

    <div class="pp-stack-risk-readout">
      <p><span>翻牌剩余</span><strong>{{ remaining }} 积分</strong></p>
      <p><span>一对后面暴露在</span><strong data-stack-risk>{{ spr.toFixed(1) }} 个底池</strong></p>
    </div>
    <p class="pp-lab-verdict" data-stack-warning>{{ warning }}</p>
  </section>
</template>
