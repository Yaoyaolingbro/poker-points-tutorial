<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useHandTimeline } from '@/lib/hand/useHandTimeline'
import type { HandDefinition, HandSnapshot } from '@/lib/hand/types'

const props = withDefaults(defineProps<{ hand: HandDefinition; autoPlay?: boolean }>(), { autoPlay: false })
const emit = defineEmits<{
  'update:snapshot': [snapshot: HandSnapshot]
  'update:event-index': [index: number]
}>()
const timeline = useHandTimeline(props.hand)

watch([timeline.snapshot, timeline.index], () => {
  emit('update:snapshot', timeline.snapshot.value)
  emit('update:event-index', timeline.snapshot.value.eventIndex)
}, { immediate: true })

onMounted(() => {
  if (props.autoPlay) timeline.play()
})
</script>

<template>
  <div class="pp-timeline-controls" aria-label="牌局播放控制">
    <button type="button" data-control="play" aria-label="播放牌局" @click="timeline.play">播放</button>
    <button type="button" data-control="pause" aria-label="暂停牌局" @click="timeline.pause">暂停</button>
    <button type="button" data-control="step" aria-label="前进一步" :disabled="timeline.finished.value" @click="timeline.step">下一步</button>
    <button type="button" data-control="restart" aria-label="重新开始" @click="timeline.restart">重来</button>
  </div>
</template>
