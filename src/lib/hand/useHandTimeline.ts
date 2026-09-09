import { computed, getCurrentInstance, onBeforeUnmount, ref } from 'vue'
import { buildTimeline } from './engine'
import type { HandDefinition } from './types'

export function useHandTimeline(hand: HandDefinition, intervalMs = 1100) {
  const frames = buildTimeline(hand)
  const index = ref(0)
  const playing = ref(false)
  const currentIntervalMs = ref(intervalMs)
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

  function schedule() {
    if (timer) clearInterval(timer)
    timer = setInterval(step, currentIntervalMs.value)
  }

  function play() {
    if (finished.value) index.value = 0
    if (playing.value) return
    playing.value = true
    schedule()
  }

  function setIntervalMs(nextIntervalMs: number) {
    currentIntervalMs.value = Math.max(50, nextIntervalMs)
    if (playing.value) schedule()
  }

  function restart() {
    pause()
    index.value = 0
  }

  if (getCurrentInstance()) onBeforeUnmount(pause)
  return { frames, index, snapshot, playing, finished, currentIntervalMs, play, pause, step, restart, setIntervalMs }
}
