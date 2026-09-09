<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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
const shell = ref<HTMLElement>()
const floating = ref(false)
const floatingDismissed = ref(false)
const floatThreshold = 72
const streetNames: Record<Street, string> = {
  preflop: '翻前',
  flop: '翻牌',
  turn: '转牌',
  river: '河牌',
  showdown: '摊牌'
}
const streetLabel = computed(() => streetNames[snapshot.value.street])

function updateFloating() {
  if (!shell.value) return
  const hasPassedTable = shell.value.getBoundingClientRect().top < floatThreshold
  if (!hasPassedTable) floatingDismissed.value = false
  floating.value = hasPassedTable && !floatingDismissed.value
}

function dismissFloating() {
  floatingDismissed.value = true
  floating.value = false
}

onMounted(() => {
  window.addEventListener('scroll', updateFloating, { passive: true })
  window.addEventListener('resize', updateFloating)
  updateFloating()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateFloating)
  window.removeEventListener('resize', updateFloating)
})
</script>

<template>
  <div ref="shell" class="pp-hand-demo-shell" data-hand-demo-shell>
    <section
      class="pp-hand-demo"
      :class="{ 'is-floating': floating }"
      :data-motion="reducedMotion ? 'reduced' : 'full'"
      :data-floating="floating ? 'true' : 'false'"
    >
      <button
        v-if="floating"
        type="button"
        class="pp-float-dismiss"
        data-control="dismiss-float"
        aria-label="收起浮动牌桌"
        @click="dismissFloating"
      >
        收起
      </button>
      <PokerTable :snapshot="snapshot" :hero-id="firstHand.heroId" />
      <aside class="pp-lesson-panel">
        <span class="pp-street">{{ streetLabel }}</span>
        <p class="pp-note">{{ snapshot.note ?? '盲注已经放好。轮到枪口位先行动。' }}</p>
        <ActionReplay :hand="firstHand" :index="eventIndex" />
        <span hidden data-event-index>{{ eventIndex }}</span>
        <HandTimeline
          :hand="firstHand"
          :auto-play="props.autoPlay && !reducedMotion"
          @update:snapshot="snapshot = $event"
          @update:event-index="eventIndex = $event"
        />
      </aside>
    </section>
  </div>
</template>
