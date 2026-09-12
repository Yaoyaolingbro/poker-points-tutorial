<script setup lang="ts">
import { computed, ref } from 'vue'
import { breakEvenEquity, callEV } from '@/lib/probability/outs'

const currentPot = ref(300)
const callAmount = ref(100)
const equityPercent = ref(35)
const equity = computed(() => equityPercent.value / 100)
const threshold = computed(() => breakEvenEquity(currentPot.value, callAmount.value))
const evOnce = computed(() => callEV(equity.value, currentPot.value, callAmount.value))
const evHundred = computed(() => evOnce.value * 100)

function signed(value: number): string {
  const rounded = Math.round(value)
  if (rounded > 0) return `+${rounded}`
  if (rounded < 0) return `−${Math.abs(rounded)}`
  return '0'
}
</script>

<template>
  <section class="pp-ev-lab" aria-labelledby="ev-title">
    <header class="pp-lab-heading">
      <span>重复一百次</span>
      <h2 id="ev-title">一次输赢很吵，长期结果更诚实</h2>
    </header>

    <label class="pp-ev-control">
      <span>估计胜率 <strong>{{ equityPercent }}%</strong></span>
      <input v-model.number="equityPercent" data-ev-equity type="range" min="0" max="100" step="1">
    </label>

    <div class="pp-ev-strip" aria-hidden="true">
      <i v-for="index in 100" :key="index" :class="{ 'is-win': index <= equityPercent }"></i>
    </div>

    <div class="pp-ev-results">
      <p><span>盈亏平衡胜率</span><strong>{{ (threshold * 100).toFixed(0) }}%</strong></p>
      <p><span>每次跟注期望</span><strong data-ev-once>{{ signed(evOnce) }} 积分</strong></p>
      <p><span>重复 100 次的期望</span><strong data-ev-hundred>{{ signed(evHundred) }} 积分</strong></p>
    </div>
    <p class="pp-lab-footnote">假设当前底池 300、跟注 100，且跟注后没有后续行动。格子表示输入的胜率，不是预言下一百手会怎样。</p>
  </section>
</template>
