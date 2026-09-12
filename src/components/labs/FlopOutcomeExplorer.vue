<script setup lang="ts">
import { computed, ref } from 'vue'
import defaultOutcomes from '@/data/probability/flop-outcomes.json'

type OutcomeMap = Record<string, {
  total: number
  made: Record<string, number>
  draws: Record<string, number>
}>

const props = withDefaults(defineProps<{ outcomes?: OutcomeMap | null }>(), {
  outcomes: () => defaultOutcomes as OutcomeMap
})
const selected = ref('AKs')
const presets = ['AKs', 'AA', '76s', '98o', '22']
const outcome = computed(() => props.outcomes?.[selected.value])
const drawLabels: Record<string, string> = {
  flushDraw: '同花听牌', openEnded: '两头顺子听牌', gutshot: '卡顺听牌',
  pairPlusFlushDraw: '带对抽同花', pairPlusStraightDraw: '带对抽顺子'
}
const rows = computed(() => {
  if (!outcome.value) return []
  return [
    ...Object.entries(outcome.value.made).filter(([, count]) => count > 0).map(([label, count]) => ({ label, count, group: '翻牌已成' })),
    ...Object.entries(outcome.value.draws).filter(([, count]) => count > 0).map(([key, count]) => ({ label: drawLabels[key], count, group: '仍在听牌' }))
  ]
})
</script>

<template>
  <section class="pp-outcome-explorer" aria-labelledby="outcome-title">
    <header class="pp-lab-heading"><div><small>逐个枚举翻牌</small><h2 id="outcome-title">翻牌会看到什么？</h2></div><strong data-selected-hand>{{ selected }}</strong></header>
    <p v-if="!outcome" class="pp-data-error">概率数据未加载</p>
    <template v-else>
      <div class="pp-preset-hands">
        <button v-for="id in presets" :key="id" :data-preset="id" :aria-pressed="selected === id" @click="selected = id">{{ id }}</button>
      </div>
      <p data-flop-total>固定两张底牌后，共检查 <strong>{{ outcome.total.toLocaleString('en-US') }}</strong> 种翻牌。</p>
      <div class="pp-outcome-rows">
        <div v-for="row in rows" :key="`${row.group}-${row.label}`" data-outcome-row>
          <span>{{ row.label }}<small>{{ row.group }}</small></span>
          <div><i :style="{ width: `${Math.max(1, row.count / outcome.total * 100)}%` }" /></div>
          <strong>{{ (row.count / outcome.total * 100).toFixed(1) }}%</strong>
        </div>
      </div>
      <p class="pp-lab-footnote">听牌行允许互相重叠，也会与已成牌重叠；它们不能相加成 100%。</p>
    </template>
  </section>
</template>
