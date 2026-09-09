import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { firstHand } from '@/data/hands/firstHand'
import { siteConfig } from '../../site/.vitepress/config.mts'

function pageTitle(markdown: string): string | undefined {
  return markdown.match(/^---[\s\S]*?^title:\s*(.+)$/m)?.[1]
}

describe('first lessons', () => {
  it('publishes two finished lesson routes with useful metadata', async () => {
    const [rules, hand] = await Promise.all([
      readFile('site/start/table-rules.md', 'utf8'),
      readFile('site/start/first-hand.md', 'utf8')
    ])

    expect(pageTitle(rules)).toBeTruthy()
    expect(pageTitle(hand)).toBeTruthy()
    expect(rules).not.toMatch(/TODO|待补|占位/u)
    expect(hand).not.toMatch(/TODO|待补|占位/u)
    expect(JSON.stringify(siteConfig.themeConfig?.sidebar)).toContain('/start/table-rules')
  })

  it('embeds the tested full-hand model instead of duplicating animation data in prose', async () => {
    const copy = await readFile('site/start/first-hand.md', 'utf8')
    expect(copy).toContain('<FullHandDemo auto-play />')
    expect(firstHand.players).toHaveLength(6)
    expect(firstHand.smallBlind).toBe(10)
    expect(firstHand.bigBlind).toBe(20)
  })
})
