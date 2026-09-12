import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StackDepthLab from './StackDepthLab.vue'

describe('StackDepthLab', () => {
  it('uses the smaller stack as the effective stack and converts it to BB', async () => {
    const wrapper = mount(StackDepthLab)
    await wrapper.get('[data-hero-points]').setValue(4000)
    await wrapper.get('[data-villain-points]').setValue(2600)
    expect(wrapper.get('[data-effective-points]').text()).toContain('2600')
    expect(wrapper.get('[data-effective-bb]').text()).toContain('130BB')
  })
})
