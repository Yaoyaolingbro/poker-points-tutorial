import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import StackRiskLab from './StackRiskLab.vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => path }))

describe('StackRiskLab', () => {
  it('keeps the same top-pair flop while depth changes the exposure', async () => {
    const wrapper = mount(StackRiskLab)
    expect(wrapper.get('[data-depth-bb]').text()).toContain('100BB')
    expect(wrapper.get('[data-stack-risk]').text()).toContain('14.9')
    expect(wrapper.text()).toContain('一对')

    await wrapper.get('[data-depth-control]').setValue(200)
    expect(wrapper.get('[data-depth-bb]').text()).toContain('200BB')
    expect(wrapper.get('[data-stack-risk]').text()).toContain('30.3')
    expect(wrapper.get('[data-stack-warning]').text()).toContain('坚果潜力')
  })
})
