<script setup lang="ts">
import { computed } from 'vue'
import type { HandDefinition, HandEvent } from '@/lib/hand/types'

const props = defineProps<{ hand: HandDefinition; index: number }>()
const visibleEvents = computed(() => props.hand.events.slice(0, props.index + 1))

function eventLabel(event: HandEvent): string {
  if (event.kind === 'dealBoard') return { flop: '翻牌', turn: '转牌', river: '河牌' }[event.street]
  if (event.kind === 'showdown') return '摊牌'
  const player = props.hand.players.find((candidate) => candidate.id === event.playerId)
  const actor = player?.id === props.hand.heroId ? '你' : (player?.name ?? event.playerId)
  const action = event.action
  if (action.kind === 'fold') return `${actor} · 弃牌`
  if (action.kind === 'check') return `${actor} · 过牌`
  if (action.kind === 'call') return `${actor} · 跟注`
  if (action.kind === 'bet') return `${actor} · 下注 ${action.amount}`
  return `${actor} · 加注到 ${action.amount}`
}
</script>

<template>
  <ol class="pp-action-replay" aria-label="行动记录">
    <li v-for="(event, eventIndex) in visibleEvents" :key="eventIndex">{{ eventLabel(event) }}</li>
  </ol>
</template>
