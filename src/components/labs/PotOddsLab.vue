<script setup lang="ts">
import { computed, ref } from 'vue'
import { exactHitChance, potOddsThreshold, ruleOfTwoAndFour } from '@/lib/poker-math/core'

const currentPot = ref(300)
const callAmount = ref(100)
const outs = ref(9)
const cardsToCome = ref<1 | 2>(2)

const threshold = computed(() => potOddsThreshold(currentPot.value, callAmount.value))
const unseenCards = computed(() => cardsToCome.value === 2 ? 47 : 46)
const hitChance = computed(() => exactHitChance(outs.value, unseenCards.value, cardsToCome.value))
const shortcut = computed(() => ruleOfTwoAndFour(outs.value, cardsToCome.value))
const allowed = computed(() => hitChance.value >= threshold.value)

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}
</script>

<template>
  <section class="pp-odds-lab">
    <div class="pp-lab-heading">
      <span>桌上计算器</span>
      <h2>这次跟注，赔率够不够？</h2>
    </div>

    <div class="pp-lab-inputs">
      <label>
        <span>当前底池</span>
        <input v-model.number="currentPot" type="number" min="0" step="10" data-input="pot">
        <small>积分</small>
      </label>
      <label>
        <span>需要跟注</span>
        <input v-model.number="callAmount" type="number" min="0" step="10" data-input="call">
        <small>积分</small>
      </label>
      <label>
        <span>干净 outs</span>
        <input v-model.number="outs" type="range" min="1" max="15" data-input="outs">
        <strong>{{ outs }}</strong>
      </label>
      <label>
        <span>还有几张牌</span>
        <select v-model.number="cardsToCome" data-input="cards-to-come">
          <option :value="2">翻牌后，两张</option>
          <option :value="1">转牌后，一张</option>
        </select>
      </label>
    </div>

    <div class="pp-lab-meter" aria-hidden="true">
      <span class="pp-lab-threshold" :style="{ left: `${threshold * 100}%` }"></span>
      <span class="pp-lab-chance" :style="{ width: `${Math.min(hitChance * 100, 100)}%` }"></span>
    </div>

    <div class="pp-lab-results">
      <p data-threshold><span>跟注门槛</span><strong>{{ percent(threshold) }}</strong></p>
      <p data-hit-chance><span>精确击中率</span><strong>{{ percent(hitChance) }}</strong></p>
      <p><span>二四法则</span><strong>约 {{ shortcut }}%</strong></p>
    </div>

    <p class="pp-lab-verdict" :class="{ 'is-allowed': allowed }" data-verdict>
      {{ allowed ? '赔率允许跟注，再检查这些 outs 是否真的能赢。' : '赔率不够。若没有额外收益或弃牌率，新手默认弃牌。' }}
    </p>
  </section>
</template>
