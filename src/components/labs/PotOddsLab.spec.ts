import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PotOddsLab from './PotOddsLab.vue'

describe('PotOddsLab', () => {
  it('compares exact draw chance with the call threshold', async () => {
    const wrapper = mount(PotOddsLab)
    expect(wrapper.get('[data-threshold]').text()).toContain('25.0%')
    expect(wrapper.get('[data-hit-chance]').text()).toContain('35.0%')
    expect(wrapper.get('[data-verdict]').text()).toContain('赔率允许')

    await wrapper.get('[data-input="outs"]').setValue(4)
    expect(wrapper.get('[data-verdict]').text()).toContain('赔率不够')
  })
})
