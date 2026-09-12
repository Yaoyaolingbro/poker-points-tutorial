import { access, readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { siteConfig } from '../../site/.vitepress/config.mts'

const lessonRoutes = [
  '/basics/hand-rankings',
  '/basics/best-five',
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
    const [rankings, bestFive, odds, purpose] = await Promise.all([
      readFile('site/basics/hand-rankings.md', 'utf8'),
      readFile('site/basics/best-five.md', 'utf8'),
      readFile('site/math/pot-odds.md', 'utf8'),
      readFile('site/strategy/bet-purpose.md', 'utf8')
    ])
    expect(rankings).toContain('<HandRanks />')
    expect(bestFive).toContain('<HandCompareExamples />')
    expect(rankings).toContain('四葫花顺三二一')
    expect(rankings).not.toContain('黑桃同花不会天然赢过红桃同花')
    expect(odds).toContain('<PotOddsLab />')
    expect(purpose).toContain('<DecisionDrill />')
  })

  it('splits hand ranks from best-five comparison', async () => {
    const ranks = await readFile('site/basics/hand-rankings.md', 'utf8')
    const bestFive = await readFile('site/basics/best-five.md', 'utf8')

    expect(ranks).toContain('<HandRanks />')
    expect(ranks).toContain('<RankOrderQuiz />')
    expect(ranks).toContain('四葫花顺三二一')
    expect(ranks).not.toContain('<HandCompareExamples />')

    expect(bestFive).toContain('<BestFiveChallenge />')
    expect(bestFive).toContain('<HandCompareExamples />')
    expect(bestFive).toContain('永远只选最好的五张')
    expect(bestFive).toContain('牌型表里没有“三对”')
    expect(bestFive).toContain('牌面四张红桃')
  })
})
