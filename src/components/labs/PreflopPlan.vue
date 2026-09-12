<script setup lang="ts">
import { computed, ref } from 'vue'
import { startingHands } from '@/lib/probability/preflop'

type Position = 'UTG' | 'BTN' | 'SB' | 'BB'
const position = ref<Position>('UTG')
const positions: Position[] = ['UTG', 'BTN', 'SB', 'BB']
const hands = startingHands()
const labels: Record<Position, string> = { UTG: '枪口位', BTN: '庄家位', SB: '小盲', BB: '大盲' }
const strict = new Set(['AA','KK','QQ','JJ','TT','99','88','77','AKs','AQs','AJs','ATs','KQs','KJs','QJs','JTs','AKo','AQo'])
const middle = new Set([...strict, '66','55','44','33','22','A9s','A8s','A7s','A6s','A5s','KTs','QTs','T9s','98s','87s','AJo','KQo'])
const wide = new Set([...middle, 'A4s','A3s','A2s','K9s','K8s','Q9s','J9s','T8s','97s','76s','65s','54s','ATo','KJo','QJo','JTo','A9o'])
const continueBB = new Set([...middle, 'A4s','A3s','A2s','K9s','Q9s','J9s','T8s','98o','87s','76s','65s','54s','ATo','KJo','QJo'])
const active = computed(() => position.value === 'UTG' ? strict : position.value === 'BTN' ? wide : position.value === 'SB' ? middle : continueBB)
const state = (id: string) => active.value.has(id) ? (position.value === 'BB' ? 'call' : 'raise') : 'fold'
</script>

<template>
  <section class="pp-preflop-plan" aria-labelledby="plan-title">
    <header class="pp-lab-heading"><div><small>第一套学习范围</small><h2 id="plan-title">同一手牌，位置不同</h2></div></header>
    <div class="pp-plan-tabs" role="tablist" aria-label="选择位置">
      <button v-for="item in positions" :key="item" :data-position-tab="item" :aria-selected="position === item" role="tab" @click="position = item">{{ labels[item] }}</button>
    </div>
    <p data-plan-note>{{ labels[position] }}：{{ position === 'BB' ? '面对一次普通加注时，先把牌分成继续与弃牌。' : '前面无人入池时，彩色格默认主动加注，不用平跟开池。' }}</p>
    <div class="pp-range-grid">
      <span v-for="hand in hands" :key="hand.id" :class="`is-${state(hand.id)}`" data-range-cell>{{ hand.id }}</span>
    </div>
    <div class="pp-plan-key"><span class="is-raise">主动加注</span><span class="is-call">继续</span><span class="is-fold">弃牌</span></div>
    <p class="pp-lab-footnote">这是 100BB 六人积分桌的学习起点，不是固定答案。人数、加注尺度和对手习惯改变时，范围也要改。</p>
  </section>
</template>
