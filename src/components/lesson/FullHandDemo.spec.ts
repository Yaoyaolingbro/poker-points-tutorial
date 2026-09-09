import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import FullHandDemo from './FullHandDemo.vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => path }))

describe('FullHandDemo', () => {
  it('shows six seats, a 30-point opening pot, and working step control', async () => {
    const wrapper = mount(FullHandDemo)
    expect(wrapper.findAll('[data-seat]')).toHaveLength(6)
    expect(wrapper.get('[data-pot]').text()).toContain('30')
    await wrapper.get('[data-control="step"]').trigger('click')
    expect(wrapper.get('[data-event-index]').text()).toBe('0')
  })

  it('keeps text controls when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const wrapper = mount(FullHandDemo)
    expect(wrapper.get('[data-motion]').attributes('data-motion')).toBe('reduced')
    vi.unstubAllGlobals()
  })
})
