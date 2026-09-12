<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type Street = 'preflop' | 'postflop'

const playerCount = ref(6)
const street = ref<Street>('preflop')
const currentStep = ref(0)

const seats = computed(() => {
  const middleCount = playerCount.value - 4
  return [
    { id: 'btn', label: '庄家位', kind: 'btn' },
    { id: 'sb', label: '小盲', kind: 'sb' },
    { id: 'bb', label: '大盲', kind: 'bb' },
    { id: 'utg', label: '枪口位', kind: 'utg' },
    ...Array.from({ length: middleCount }, (_, index) => ({ id: `middle-${index}`, label: '中间位置', kind: 'middle' }))
  ]
})

const order = computed(() => {
  const byKind = (kind: string) => seats.value.find((seat) => seat.kind === kind)!
  const middles = seats.value.filter((seat) => seat.kind === 'middle')
  return street.value === 'preflop'
    ? [byKind('utg'), ...middles, byKind('btn'), byKind('sb'), byKind('bb')]
    : [byKind('sb'), byKind('bb'), byKind('utg'), ...middles, byKind('btn')]
})

const note = computed(() => street.value === 'preflop'
  ? '翻前从大盲左边的枪口位先行动，大盲最后表态。'
  : '翻牌后从庄家左边第一位仍在局中的玩家开始，庄家位最后行动。')

function setStreet(next: Street) {
  street.value = next
  currentStep.value = 0
}

function step(delta: number) {
  currentStep.value = (currentStep.value + delta + order.value.length) % order.value.length
}

function seatStyle(index: number, total: number) {
  const angle = (-90 + (360 / total) * index) * Math.PI / 180
  return { left: `${50 + Math.cos(angle) * 43}%`, top: `${50 + Math.sin(angle) * 39}%` }
}

watch(playerCount, () => { currentStep.value = 0 })
</script>

<template>
  <section class="pp-position-orbit" aria-labelledby="position-title">
    <header class="pp-lab-heading">
      <div><small>位置动画</small><h2 id="position-title">只认四个位置</h2></div>
      <label>桌上人数 <strong>{{ playerCount }}</strong>
        <input v-model.number="playerCount" data-player-count type="range" min="5" max="8" step="1">
      </label>
    </header>
    <div class="pp-position-streets" role="group" aria-label="选择行动轮次">
      <button data-street="preflop" :aria-pressed="street === 'preflop'" @click="setStreet('preflop')">翻前</button>
      <button data-street="postflop" :aria-pressed="street === 'postflop'" @click="setStreet('postflop')">翻牌后</button>
    </div>
    <div class="pp-orbit-table">
      <div class="pp-orbit-felt"><span>行动沿顺时针</span></div>
      <div
        v-for="(seat, index) in seats"
        :key="seat.id"
        class="pp-orbit-seat"
        :class="{ 'is-active': order[currentStep]?.id === seat.id }"
        :style="seatStyle(index, seats.length)"
        data-seat
        :data-position="seat.kind"
      ><b>{{ seat.label }}</b><small>{{ seat.kind === 'sb' ? '10 积分' : seat.kind === 'bb' ? '20 积分' : '' }}</small></div>
    </div>
    <p data-order-note aria-live="polite">{{ note }} 当前轮到：<strong>{{ order[currentStep]?.label }}</strong></p>
    <div class="pp-step-controls">
      <button @click="step(-1)">上一步</button>
      <button @click="step(1)">下一位</button>
    </div>
  </section>
</template>
