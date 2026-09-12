import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import OutsExplorer from './OutsExplorer.vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => path }))

describe('OutsExplorer', () => {
  it('covers basic and pair-plus-draw scenarios', async () => {
    const wrapper = mount(OutsExplorer)
    expect(wrapper.findAll('[data-draw-scenario]')).toHaveLength(5)
    await wrapper.get('[data-draw-scenario="pair-flush"]').trigger('click')
    expect(wrapper.get('[data-draw-title]').text()).toContain('带对抽同花')
    expect(wrapper.get('[data-next-card]').text()).toContain('19.15%')
    expect(wrapper.get('[data-by-river]').text()).toContain('34.97%')
    expect(wrapper.text()).toContain('价格')
  })
})
