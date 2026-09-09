<script setup lang="ts">
import { computed, ref } from 'vue'
import { firstHand } from '@/data/hands/firstHand'
import { createInitialSnapshot } from '@/lib/hand/engine'
import type { HandSnapshot, Street } from '@/lib/hand/types'
import PokerTable from '@/components/table/PokerTable.vue'
import ActionReplay from '@/components/timeline/ActionReplay.vue'
import HandTimeline from '@/components/timeline/HandTimeline.vue'

const props = withDefaults(defineProps<{ autoPlay?: boolean }>(), { autoPlay: false })
const snapshot = ref<HandSnapshot>(createInitialSnapshot(firstHand))
const eventIndex = ref(-1)
const media = typeof window === 'undefined' ? undefined : window.matchMedia?.('(prefers-reduced-motion: reduce)')
const reducedMotion = ref(media?.matches ?? false)
const streetNames: Record<Street, string> = {
  preflop: '翻前',
  flop: '翻牌',
  turn: '转牌',
  river: '河牌',
  showdown: '摊牌'
}
const streetLabel = computed(() => streetNames[snapshot.value.street])
</script>

<template>
  <section class="pp-hand-demo" :data-motion="reducedMotion ? 'reduced' : 'full'">
    <PokerTable :snapshot="snapshot" :hero-id="firstHand.heroId" />
    <aside class="pp-lesson-panel">
      <span class="pp-street">{{ streetLabel }}</span>
      <p class="pp-note">{{ snapshot.note ?? '盲注已经放好。轮到枪口位先行动。' }}</p>
      <ActionReplay :hand="firstHand" :index="eventIndex" />
      <span class="sr-only" data-event-index>{{ eventIndex }}</span>
      <HandTimeline
        :hand="firstHand"
        :auto-play="props.autoPlay && !reducedMotion"
        @update:snapshot="snapshot = $event"
        @update:event-index="eventIndex = $event"
      />
    </aside>
  </section>
</template>
