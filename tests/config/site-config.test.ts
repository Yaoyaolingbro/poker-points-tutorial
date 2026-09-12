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
      '/basics/hand-rankings',
      '/basics/best-five',
      '/start/first-hand',
      '/basics/positions',
      '/basics/actions',
      '/basics/stack-depth',
      '/preflop/starting-hands',
      '/preflop/flop-outcomes',
      '/preflop/equity',
      '/preflop/first-plan',
      '/math/outs',
      '/math/pot-odds',
      '/math/ev',
      '/strategy/bet-purpose',
      '/strategy/deep-stacks',
      '/quick-reference',
      '/glossary',
      '/resources',
      '/sources'
    ])
  })
})
