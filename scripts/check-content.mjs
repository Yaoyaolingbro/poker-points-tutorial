import { readdir, readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { findContentViolations } from './content-rules.mjs'

const root = resolve(process.cwd(), 'site')

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(path)
    return entry.isFile() && entry.name.endsWith('.md') ? [path] : []
  }))
  return nested.flat()
}

const violations = []
for (const path of await markdownFiles(root)) {
  const file = `site/${relative(root, path)}`
  violations.push(...findContentViolations(await readFile(path, 'utf8'), file))
}

if (violations.length > 0) {
  for (const violation of violations) {
    console.error(`${violation.file}: ${violation.kind} wording matched /${violation.pattern}/`)
  }
  process.exitCode = 1
}
