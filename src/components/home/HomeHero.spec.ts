import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('vitepress', () => ({ withBase: (path: string) => path }))

describe('HomeHero', () => {
  beforeEach(() => vi.resetModules())

  it('starts with a table situation and links to the first finished chapter', async () => {
    const { default: HomeHero } = await import('./HomeHero.vue')
    const wrapper = mount(HomeHero)
    expect(wrapper.text()).toContain('牌已经发下来了')
    expect(wrapper.get('.pp-primary-action').attributes('href')).toBe('/start/table-rules')
  })
})
