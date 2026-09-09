import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
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

  it('offers a slower default speed that can be dragged', async () => {
    const wrapper = mount(FullHandDemo)
    const speed = wrapper.get<HTMLInputElement>('[data-control="speed"]')
    expect(speed.element.value).toBe('0.75')
    expect(wrapper.get('[data-speed-label]').text()).toBe('0.75×')

    await speed.setValue('0.5')
    expect(wrapper.get('[data-speed-label]').text()).toBe('0.5×')
  })

  it('becomes a dismissible floating table after the reader scrolls past it', async () => {
    const wrapper = mount(FullHandDemo)
    const shell = wrapper.get('[data-hand-demo-shell]')
    vi.spyOn(shell.element, 'getBoundingClientRect').mockReturnValue({ top: -120 } as DOMRect)

    window.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(wrapper.get('[data-motion]').attributes('data-floating')).toBe('true')

    await wrapper.get('[data-control="dismiss-float"]').trigger('click')
    expect(wrapper.get('[data-motion]').attributes('data-floating')).toBe('false')
  })
})
