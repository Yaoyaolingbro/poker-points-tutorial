import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import HandCompareExamples from './HandCompareExamples.vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => path }))

describe('HandCompareExamples', () => {
  it('covers three pairs, a four-flush board, kickers, and the board playing', () => {
    const wrapper = mount(HandCompareExamples)
    expect(wrapper.findAll('[data-comparison-case]')).toHaveLength(4)
    expect(wrapper.text()).toContain('牌型表里没有“三对”')
    expect(wrapper.text()).toContain('牌面四张红桃')
    expect(wrapper.text()).toContain('K 踢脚，赢')
    expect(wrapper.text()).toContain('公共牌顺子，平分')
  })
})
