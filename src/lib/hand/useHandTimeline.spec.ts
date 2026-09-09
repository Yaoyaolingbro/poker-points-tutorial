import { describe, expect, it, vi } from 'vitest'
import { firstHand } from '@/data/hands/firstHand'
import { useHandTimeline } from './useHandTimeline'

describe('useHandTimeline', () => {
  it('steps, restarts, and never advances past showdown', () => {
    const timeline = useHandTimeline(firstHand, 50)
    expect(timeline.index.value).toBe(0)
    timeline.step()
    expect(timeline.index.value).toBe(1)
    for (let index = 0; index < 100; index += 1) timeline.step()
    expect(timeline.snapshot.value.street).toBe('showdown')
    timeline.restart()
    expect(timeline.index.value).toBe(0)
  })

  it('pauses automatic playback', () => {
    vi.useFakeTimers()
    const timeline = useHandTimeline(firstHand, 50)
    timeline.play()
    vi.advanceTimersByTime(60)
    expect(timeline.index.value).toBe(1)
    timeline.pause()
    vi.advanceTimersByTime(200)
    expect(timeline.index.value).toBe(1)
    vi.useRealTimers()
  })
})
