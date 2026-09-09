import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import DecisionDrill from './DecisionDrill.vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => path }))

describe('DecisionDrill', () => {
  it('reveals the range comparison only after the reader commits to a check', async () => {
    const wrapper = mount(DecisionDrill)
    expect(wrapper.find('[data-answer]').exists()).toBe(false)
    await wrapper.get('[data-reveal]').trigger('click')
    expect(wrapper.get('[data-answer]').text()).toContain('更差的牌很少会这样加注')
    expect(wrapper.findAll('img')).toHaveLength(7)
  })
})
