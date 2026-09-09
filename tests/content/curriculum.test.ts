import { access, readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { siteConfig } from '../../site/.vitepress/config.mts'

const lessonRoutes = [
  '/basics/hand-rankings',
  '/basics/action-order',
  '/math/outs',
  '/math/pot-odds',
  '/strategy/bet-purpose',
  '/strategy/deep-stacks',
  '/quick-reference',
  '/glossary',
  '/resources'
]

describe('core curriculum', () => {
  it('publishes every route linked by the curriculum', async () => {
    const sidebar = JSON.stringify(siteConfig.themeConfig?.sidebar)
    for (const route of lessonRoutes) {
      expect(sidebar).toContain(route)
      await expect(access(`site${route}.md`)).resolves.toBeUndefined()
    }
  })

  it('keeps interactive lessons wired to tested components', async () => {
    const [rankings, odds, purpose] = await Promise.all([
      readFile('site/basics/hand-rankings.md', 'utf8'),
      readFile('site/math/pot-odds.md', 'utf8'),
      readFile('site/strategy/bet-purpose.md', 'utf8')
    ])
    expect(rankings).toContain('<HandRanks />')
    expect(odds).toContain('<PotOddsLab />')
    expect(purpose).toContain('<DecisionDrill />')
  })
})
