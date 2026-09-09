import { describe, expect, it } from 'vitest'
import { resolveSiteBase, siteConfig } from '../../site/.vitepress/config'

describe('site configuration', () => {
  it('uses root locally and the repository path on Pages', () => {
    expect(resolveSiteBase({})).toBe('/')
    expect(resolveSiteBase({ DOCS_BASE: '/poker-points-tutorial/' })).toBe('/poker-points-tutorial/')
  })

  it('exposes the finished core path in reading order', () => {
    const sidebar = siteConfig.themeConfig?.sidebar as Array<{ items: Array<{ link: string }> }>
    expect(sidebar.flatMap((group) => group.items.map((item) => item.link))).toEqual([
      '/start/table-rules',
      '/start/first-hand',
      '/basics/hand-rankings',
      '/basics/action-order',
      '/math/outs',
      '/math/pot-odds',
      '/strategy/bet-purpose',
      '/strategy/deep-stacks',
      '/quick-reference',
      '/glossary',
      '/resources'
    ])
  })
})
