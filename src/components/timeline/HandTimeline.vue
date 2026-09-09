<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useHandTimeline } from '@/lib/hand/useHandTimeline'
import type { HandDefinition, HandSnapshot } from '@/lib/hand/types'

const props = withDefaults(defineProps<{ hand: HandDefinition; autoPlay?: boolean }>(), { autoPlay: false })
const emit = defineEmits<{
  'update:snapshot': [snapshot: HandSnapshot]
  'update:event-index': [index: number]
}>()
const baseIntervalMs = 1600
const speed = ref(0.75)
const speedLabel = computed(() => `${Number(speed.value.toFixed(2))}×`)
const timeline = useHandTimeline(props.hand, baseIntervalMs / speed.value)

watch(speed, (nextSpeed) => {
  timeline.setIntervalMs(baseIntervalMs / nextSpeed)
})

watch([timeline.snapshot, timeline.index], () => {
  emit('update:snapshot', timeline.snapshot.value)
  emit('update:event-index', timeline.snapshot.value.eventIndex)
}, { immediate: true })

onMounted(() => {
  if (props.autoPlay) timeline.play()
})
</script>

<template>
  <div class="pp-playback-tools">
    <label class="pp-speed-control">
      <span>慢</span>
      <input
        v-model.number="speed"
        type="range"
        min="0.5"
        max="1.5"
        step="0.25"
        data-control="speed"
        aria-label="播放速度"
      >
      <span>快</span>
      <output data-speed-label>{{ speedLabel }}</output>
    </label>
    <div class="pp-timeline-controls" aria-label="牌局播放控制">
      <button type="button" data-control="play" aria-label="播放牌局" @click="timeline.play">播放</button>
      <button type="button" data-control="pause" aria-label="暂停牌局" @click="timeline.pause">暂停</button>
      <button type="button" data-control="step" aria-label="前进一步" :disabled="timeline.finished.value" @click="timeline.step">下一步</button>
      <button type="button" data-control="restart" aria-label="重新开始" @click="timeline.restart">重来</button>
    </div>
  </div>
</template>
