import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ActionPotDemo from './ActionPotDemo.vue'

describe('ActionPotDemo', () => {
  it('allows checking only when nobody has bet', async () => {
    const wrapper = mount(ActionPotDemo)
    expect(wrapper.get('[data-action="check"]').attributes('disabled')).toBeUndefined()
    await wrapper.get('[data-scenario="facing-bet"]').trigger('click')
    expect(wrapper.get('[data-action="check"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-call-note]').text()).toContain('再补 40')
  })
})
