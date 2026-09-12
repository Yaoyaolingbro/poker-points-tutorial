import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EVRepeatChart from './EVRepeatChart.vue'

describe('EVRepeatChart', () => {
  it('projects one call across one hundred repetitions', async () => {
    const wrapper = mount(EVRepeatChart)
    expect(wrapper.get('[data-ev-once]').text()).toContain('+40')
    expect(wrapper.get('[data-ev-hundred]').text()).toContain('+4000')
    await wrapper.get('[data-ev-equity]').setValue(20)
    expect(wrapper.get('[data-ev-once]').text()).toContain('−20')
  })
})
