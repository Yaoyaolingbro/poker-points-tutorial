import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// jsDelivr mirrors the selected upstream repository and avoids a runtime CDN dependency:
// the downloaded SVG files are committed and served locally by this tutorial.
const base = 'https://cdn.jsdelivr.net/gh/saulspatz/SVGCards@master/Decks/Vertical2/svgs'
const output = resolve(process.cwd(), 'site/public/cards/svgcards')
const suits = ['spade', 'heart', 'diamond', 'club']
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace']
const files = [...suits.flatMap((suit) => ranks.map((rank) => `${suit}${rank}.svg`)), 'blueBack.svg']

await mkdir(output, { recursive: true })

await Promise.all(files.map(async (file) => {
  const response = await fetch(`${base}/${file}`)
  if (!response.ok) throw new Error(`SVGCards download failed for ${file}: ${response.status}`)
  await writeFile(resolve(output, file), await response.text(), 'utf8')
}))

await writeFile(resolve(output, 'ATTRIBUTION.md'), [
  '# SVGCards attribution',
  '',
  'Source: https://github.com/saulspatz/SVGCards',
  'Deck: Decks/Vertical2',
  'License status stated by the source repository: public domain.',
  ''
].join('\n'), 'utf8')
