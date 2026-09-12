import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { enumerateFlops } from '../src/lib/probability/flop.ts'
import { startingHands } from '../src/lib/probability/preflop.ts'

const outputDirectory = resolve('src/data/probability')
const trials = 100000
const seed = 20260912
const binary = join(tmpdir(), 'poker-points-equity-generator')

mkdirSync(outputDirectory, { recursive: true })

const flopOutcomes = Object.fromEntries(startingHands().map((hand, index) => {
  process.stdout.write(`\rflops ${index + 1}/169 ${hand.id}   `)
  return [hand.id, enumerateFlops(hand.id)]
}))
process.stdout.write('\n')
writeFileSync(join(outputDirectory, 'flop-outcomes.json'), `${JSON.stringify(flopOutcomes)}\n`)

execFileSync('c++', ['-O3', '-std=c++17', 'scripts/generate-equity.cpp', '-o', binary], { stdio: 'inherit' })
execFileSync(binary, [join(outputDirectory, 'equity.json'), String(trials), String(seed)], { stdio: 'inherit' })
rmSync(binary, { force: true })

writeFileSync(join(outputDirectory, 'meta.json'), `${JSON.stringify({
  seed,
  trialsPerHand: trials,
  evaluatorVersion: 1,
  flopMethod: 'exhaustive C(50,3)',
  equityModel: 'random opponents, no folds, five-card board',
  generatedAt: new Date().toISOString()
}, null, 2)}\n`)
