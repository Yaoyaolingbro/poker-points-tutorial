import { describe, expect, it } from 'vitest'
import { findContentViolations } from '../../scripts/content-rules.mjs'

describe('public lesson copy rules', () => {
  it('accepts concise points-only coaching copy', () => {
    expect(findContentViolations('你在按钮位拿到 A♠J♠。底池 130 积分。哪些更差的牌会跟？', 'site/start/hand.md')).toEqual([])
  })

  it.each([
    '现金桌',
    '下注 20 元',
    '赢了 $10',
    '可以提现',
    '让我们深入探讨这个概念',
    '综上所述，这手牌很简单',
    '本章将介绍十种牌型',
    '这个概念至关重要',
    '不难发现他已经输了'
  ])('rejects banned wording: %s', (copy) => {
    expect(findContentViolations(copy, 'site/start/hand.md')).not.toEqual([])
  })

  it('does not scan internal design documents', () => {
    expect(findContentViolations('现金桌', 'docs/superpowers/spec.md')).toEqual([])
  })
})
