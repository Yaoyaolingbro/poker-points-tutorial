import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FlopOutcomeExplorer from './FlopOutcomeExplorer.vue'

describe('FlopOutcomeExplorer', () => {
  it('shows exact 19600-flop data and changes hands', async () => {
    const wrapper = mount(FlopOutcomeExplorer)
    expect(wrapper.get('[data-flop-total]').text()).toContain('19,600')
    expect(wrapper.findAll('[data-outcome-row]').length).toBeGreaterThan(4)
    await wrapper.get('[data-preset="76s"]').trigger('click')
    expect(wrapper.get('[data-selected-hand]').text()).toContain('76s')
  })

  it('shows an explicit error instead of zeroes when data is unavailable', () => {
    const wrapper = mount(FlopOutcomeExplorer, { props: { outcomes: null } })
    expect(wrapper.text()).toContain('概率数据未加载')
  })
})
