import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import HandRanks from './HandRanks.vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => path }))

describe('HandRanks', () => {
  it('renders all ten ranked five-card examples with local cards', () => {
    const wrapper = mount(HandRanks)
    expect(wrapper.findAll('[data-hand-rank]')).toHaveLength(10)
    expect(wrapper.findAll('img')).toHaveLength(50)
    expect(wrapper.text()).toContain('皇家同花顺')
    expect(wrapper.text()).toContain('高牌')
  })
})
