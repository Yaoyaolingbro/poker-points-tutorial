import { describe, expect, it } from 'vitest'
import { cardAssetPath, cardLabel } from './cardAssets'

describe('SVGCards mapping', () => {
  it('maps face cards and number cards to Vertical2 filenames', () => {
    expect(cardAssetPath({ rank: 'A', suit: 's' })).toBe('/cards/svgcards/spadeAce.svg')
    expect(cardAssetPath({ rank: '7', suit: 's' })).toBe('/cards/svgcards/spade7.svg')
    expect(cardAssetPath({ rank: 'Q', suit: 'h' })).toBe('/cards/svgcards/heartQueen.svg')
  })

  it('provides a Chinese screen-reader label', () => {
    expect(cardLabel({ rank: 'J', suit: 'd' })).toBe('方片 J')
  })
})
