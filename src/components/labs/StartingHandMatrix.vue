<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { startingHand, startingHands } from '@/lib/probability/preflop'

const props = withDefaults(defineProps<{
  modelValue?: string
  states?: Record<string, 'raise' | 'call' | 'fold'>
}>(), { modelValue: 'AKs', states: () => ({}) })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const selected = ref(props.modelValue)
const hands = startingHands()
const detail = computed(() => startingHand(selected.value))

watch(() => props.modelValue, (value) => { selected.value = value })

function choose(id: string) {
  selected.value = id
  emit('update:modelValue', id)
}

function move(event: KeyboardEvent, index: number) {
  const shifts: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -13, ArrowDown: 13 }
  const shift = shifts[event.key]
  if (!shift) return
  event.preventDefault()
  const next = Math.max(0, Math.min(168, index + shift))
  choose(hands[next].id)
  document.querySelector<HTMLElement>(`[data-starting-hand="${hands[next].id}"]`)?.focus()
}
</script>

<template>
  <section class="pp-starting-matrix" aria-label="169 种起手牌矩阵">
    <div class="pp-matrix-grid">
      <button
        v-for="(hand, index) in hands"
        :key="hand.id"
        :class="[`is-${hand.kind}`, props.states[hand.id] ? `is-${props.states[hand.id]}` : '']"
        :data-starting-hand="hand.id"
        :data-range-cell="props.states[hand.id] ?? undefined"
        :aria-pressed="selected === hand.id"
        :tabindex="selected === hand.id ? 0 : -1"
        @click="choose(hand.id)"
        @keydown="move($event, index)"
      >{{ hand.id }}</button>
    </div>
    <div class="pp-matrix-legend">
      <span class="is-pair">对子</span><span class="is-suited">同花</span><span class="is-offsuit">非同花</span>
    </div>
    <div class="pp-hand-detail" data-hand-detail aria-live="polite">
      <strong>{{ detail.id }}</strong>
      <span>{{ detail.combos }} 个具体组合</span>
      <span>单次发到约 {{ (detail.probability * 100).toFixed(2) }}%</span>
      <small>{{ detail.kind === 'pair' ? '两张同点数' : detail.kind === 'suited' ? '两张同花色' : '两张不同花色' }}</small>
    </div>
  </section>
</template>
