import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PositionOrbit from './PositionOrbit.vue'

describe('PositionOrbit', () => {
  it('defaults to six seats and keeps only four named positions', () => {
    const wrapper = mount(PositionOrbit)
    expect(wrapper.findAll('[data-seat]')).toHaveLength(6)
    expect(wrapper.text()).toContain('庄家位')
    expect(wrapper.text()).toContain('小盲')
    expect(wrapper.text()).toContain('大盲')
    expect(wrapper.text()).toContain('枪口位')
    expect(wrapper.findAll('[data-position="middle"]')).toHaveLength(2)
  })

  it('supports five to eight players and changes the action explanation by street', async () => {
    const wrapper = mount(PositionOrbit)
    await wrapper.get('[data-player-count]').setValue(8)
    expect(wrapper.findAll('[data-seat]')).toHaveLength(8)
    expect(wrapper.findAll('[data-position="middle"]')).toHaveLength(4)
    expect(wrapper.get('[data-order-note]').text()).toContain('枪口位先行动')
    await wrapper.get('[data-street="postflop"]').trigger('click')
    expect(wrapper.get('[data-order-note]').text()).toContain('庄家位最后行动')
  })
})
