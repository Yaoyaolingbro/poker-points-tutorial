<script setup lang="ts">
import { computed, ref } from 'vue'

type Scenario = 'open' | 'facing-bet'
type Action = 'fold' | 'check' | 'call' | 'bet' | 'raise'

const scenario = ref<Scenario>('open')
const selected = ref<Action>('check')
const actions: Array<{ id: Action; label: string }> = [
  { id: 'fold', label: '弃牌' }, { id: 'check', label: '过牌' }, { id: 'call', label: '跟注' },
  { id: 'bet', label: '下注' }, { id: 'raise', label: '加注' }
]
const explanations: Record<Action, string> = {
  fold: '放弃这一手；已经投入底池的积分不会回来。',
  check: '本轮没人下注时，把行动交给下一位，不投入积分。',
  call: '补齐当前最高投入。大盲已有 20，面对加注到 60，只需再补 40。',
  bet: '本轮没人下注时，第一次把积分放进底池。',
  raise: '前面已经有人下注，再把继续游戏的门槛抬高。'
}
const disabled = computed(() => ({
  check: scenario.value === 'facing-bet',
  call: scenario.value === 'open',
  bet: scenario.value === 'facing-bet',
  raise: scenario.value === 'open'
}))

function chooseScenario(next: Scenario) {
  scenario.value = next
  selected.value = next === 'open' ? 'check' : 'call'
}
</script>

<template>
  <section class="pp-action-pot" aria-labelledby="action-title">
    <header class="pp-lab-heading"><div><small>动作实验</small><h2 id="action-title">现在能做什么？</h2></div></header>
    <div class="pp-position-streets" role="group" aria-label="选择局面">
      <button data-scenario="open" :aria-pressed="scenario === 'open'" @click="chooseScenario('open')">本轮无人下注</button>
      <button data-scenario="facing-bet" :aria-pressed="scenario === 'facing-bet'" @click="chooseScenario('facing-bet')">面对加注到 60</button>
    </div>
    <div class="pp-pot-visual"><span>底池</span><strong>{{ scenario === 'open' ? 130 : 90 }} 积分</strong></div>
    <div class="pp-action-buttons">
      <button
        v-for="action in actions"
        :key="action.id"
        :data-action="action.id"
        :disabled="disabled[action.id]"
        :aria-pressed="selected === action.id"
        @click="selected = action.id"
      >{{ action.label }}</button>
    </div>
    <p aria-live="polite">{{ explanations[selected] }}</p>
    <p v-if="scenario === 'facing-bet'" data-call-note>大盲已经投入 20；跟注到 60，是再补 40，不是再放 60。</p>
  </section>
</template>
