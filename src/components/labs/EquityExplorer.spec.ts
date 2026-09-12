import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EquityExplorer from './EquityExplorer.vue'

describe('EquityExplorer', () => {
  it('defaults to one opponent and supports seven', async () => {
    const wrapper = mount(EquityExplorer)
    expect(wrapper.get('[data-opponent-count]').text()).toContain('1 名随机对手')
    expect(wrapper.get('[data-equity-value]').text()).toContain('≈')
    await wrapper.get('[data-opponent-slider]').setValue(7)
    expect(wrapper.get('[data-opponent-count]').text()).toContain('7 名随机对手')
  })

  it('does not disguise missing data as zero equity', () => {
    const wrapper = mount(EquityExplorer, { props: { equityData: null } })
    expect(wrapper.text()).toContain('概率数据未加载')
  })
})
