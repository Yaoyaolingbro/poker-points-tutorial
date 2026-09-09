import { computed, getCurrentInstance, onBeforeUnmount, ref } from 'vue'
import { buildTimeline } from './engine'
import type { HandDefinition } from './types'

export function useHandTimeline(hand: HandDefinition, intervalMs = 1100) {
  const frames = buildTimeline(hand)
  const index = ref(0)
  const playing = ref(false)
  let timer: ReturnType<typeof setInterval> | undefined

  const snapshot = computed(() => frames[index.value])
  const finished = computed(() => index.value === frames.length - 1)

  function pause() {
    playing.value = false
    if (timer) clearInterval(timer)
    timer = undefined
  }

  function step() {
    index.value = Math.min(index.value + 1, frames.length - 1)
    if (finished.value) pause()
  }

  function play() {
    if (finished.value) index.value = 0
    if (playing.value) return
    playing.value = true
    timer = setInterval(step, intervalMs)
  }

  function restart() {
    pause()
    index.value = 0
  }

  if (getCurrentInstance()) onBeforeUnmount(pause)
  return { frames, index, snapshot, playing, finished, play, pause, step, restart }
}
