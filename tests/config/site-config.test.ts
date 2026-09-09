import { describe, expect, it } from 'vitest'
import { resolveSiteBase, siteConfig } from '../../site/.vitepress/config'

describe('site configuration', () => {
  it('uses root locally and the repository path on Pages', () => {
    expect(resolveSiteBase({})).toBe('/')
    expect(resolveSiteBase({ DOCS_BASE: '/poker-points-tutorial/' })).toBe('/poker-points-tutorial/')
  })

  it('exposes only finished chapters in the first sidebar', () => {
    const sidebar = siteConfig.themeConfig?.sidebar as Record<string, Array<{ items: Array<{ link: string }> }>>
    expect(sidebar['/start/'][0].items.map((item) => item.link)).toEqual([
      '/start/table-rules',
      '/start/first-hand'
    ])
  })
})
