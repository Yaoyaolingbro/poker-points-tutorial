<script setup lang="ts">
import { computed, ref } from 'vue'
import defaultEquity from '@/data/probability/equity.json'

interface EquityPoint { opponents: number; trials: number; win: number; tie: number; equity: number }
type EquityMap = Record<string, Record<string, EquityPoint>>

const props = withDefaults(defineProps<{ equityData?: EquityMap | null }>(), {
  equityData: () => defaultEquity as EquityMap
})
const selected = ref('AA')
const opponents = ref(1)
const presets = ['AA', 'KK', 'QQ', 'AKs', 'AKo', '76s', '72o']
const point = computed(() => props.equityData?.[selected.value]?.[String(opponents.value)])
const percent = (value: number) => `${(value * 100).toFixed(1)}%`
</script>

<template>
  <section class="pp-equity-explorer" aria-labelledby="equity-title">
    <header class="pp-lab-heading"><div><small>固定种子模拟</small><h2 id="equity-title">不弃牌，发到河牌</h2></div><strong>{{ selected }}</strong></header>
    <p v-if="!point" class="pp-data-error">概率数据未加载</p>
    <template v-else>
      <div class="pp-preset-hands">
        <button v-for="id in presets" :key="id" :aria-pressed="selected === id" @click="selected = id">{{ id }}</button>
      </div>
      <label class="pp-opponent-control"><span data-opponent-count>{{ opponents }} 名随机对手</span>
        <input v-model.number="opponents" data-opponent-slider type="range" min="1" max="7" step="1">
      </label>
      <div class="pp-equity-numbers">
        <div><small>单独获胜</small><strong>≈ {{ percent(point.win) }}</strong></div>
        <div><small>参与平分</small><strong>≈ {{ percent(point.tie) }}</strong></div>
        <div class="is-equity"><small>摊牌权益</small><strong data-equity-value>≈ {{ percent(point.equity) }}</strong></div>
      </div>
      <p class="pp-lab-footnote">随机对手、无人弃牌、公共牌发满五张。每个格子每种人数模拟 {{ point.trials.toLocaleString('en-US') }} 次。</p>
    </template>
  </section>
</template>
