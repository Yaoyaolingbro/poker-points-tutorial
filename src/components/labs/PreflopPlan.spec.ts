import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PreflopPlan from './PreflopPlan.vue'

describe('PreflopPlan', () => {
  it('switches between four position study ranges', async () => {
    const wrapper = mount(PreflopPlan)
    expect(wrapper.findAll('[data-position-tab]')).toHaveLength(4)
    expect(wrapper.get('[data-plan-note]').text()).toContain('枪口位')
    await wrapper.get('[data-position-tab="BTN"]').trigger('click')
    expect(wrapper.get('[data-plan-note]').text()).toContain('庄家位')
    expect(wrapper.findAll('[data-range-cell]')).toHaveLength(169)
  })
})
