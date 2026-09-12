import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StartingHandMatrix from './StartingHandMatrix.vue'

describe('StartingHandMatrix', () => {
  it('renders 169 selectable classes and explains concrete combinations', async () => {
    const wrapper = mount(StartingHandMatrix)
    expect(wrapper.findAll('[data-starting-hand]')).toHaveLength(169)
    expect(wrapper.get('[data-starting-hand="AKs"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-hand-detail]').text()).toContain('4 个具体组合')
    expect(wrapper.get('[data-hand-detail]').text()).toContain('0.30%')
    await wrapper.get('[data-starting-hand="AA"]').trigger('click')
    expect(wrapper.get('[data-hand-detail]').text()).toContain('6 个具体组合')
  })
})
