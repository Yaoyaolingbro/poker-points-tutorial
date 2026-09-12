import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import BestFiveChallenge from './BestFiveChallenge.vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => path }))

describe('BestFiveChallenge', () => {
  it('requires exactly five cards before checking', async () => {
    const wrapper = mount(BestFiveChallenge)
    expect(wrapper.get('[data-check-best-five]').attributes('disabled')).toBeDefined()

    for (const id of ['as', 'kd', 'ac', '9d', '7s']) {
      await wrapper.get(`[data-select-card="${id}"]`).trigger('click')
    }

    expect(wrapper.get('[data-check-best-five]').attributes('disabled')).toBeUndefined()
    await wrapper.get('[data-check-best-five]').trigger('click')
    expect(wrapper.get('[data-best-five-answer]').text()).toContain('一对 A，K、9、7 踢脚')
  })

  it('never allows a sixth selected card', async () => {
    const wrapper = mount(BestFiveChallenge)
    for (const id of ['as', 'kd', 'ac', '9d', '7s', '4h']) {
      await wrapper.get(`[data-select-card="${id}"]`).trigger('click')
    }
    expect(wrapper.findAll('[aria-pressed="true"]')).toHaveLength(5)
  })

  it('can reset the attempt', async () => {
    const wrapper = mount(BestFiveChallenge)
    await wrapper.get('[data-select-card="as"]').trigger('click')
    await wrapper.get('[data-reset-best-five]').trigger('click')
    expect(wrapper.findAll('[aria-pressed="true"]')).toHaveLength(0)
  })
})
