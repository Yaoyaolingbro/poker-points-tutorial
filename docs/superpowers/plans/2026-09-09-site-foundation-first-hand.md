# Site Foundation and First Hand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish the first usable slice of the tutorial: a distinctive VitePress shell, the table rules chapter, and one complete animated six-player hand from blinds to showdown.

**Architecture:** VitePress 1.6.4 owns routing, Markdown, navigation, search, and static output. Vue 3 components under `src/` render locally vendored SVGCards and consume a pure TypeScript hand engine; lesson Markdown only supplies narrative and selects a hand dataset. This first plan intentionally stops after the home page and two real chapters, leaving rankings, preflop, postflop math, deep stacks, and practice labs for later plans.

**Tech Stack:** Node.js 22.12+ in CI, npm, VitePress 1.6.4, Vite 6.4.3 override, Vue 3.5.42, TypeScript 5.7.3, Vitest 5.0.0, Vue Test Utils 2.4.6, Happy DOM 20.14.0, Playwright 1.63.0, CSS transforms, GitHub Actions, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-09-poker-points-tutorial-design.md`

## Global Constraints

- Runtime floor: Node.js 22.12 or newer; GitHub Actions uses the current Node.js 22 release.
- Use stable VitePress `1.6.4`; do not adopt the `2.0.0-alpha` line.
- Override VitePress's Vite dependency to patched Vite `6.4.3`; use Vitest `5.0.0` to avoid known path traversal issues in older test-server releases.
- Default table: six players, small blind 10 points, big blind 20 points, 100BB = 2000 points.
- Supported table size remains 5–8 seats even though the first hand uses six.
- Public lesson copy uses only points and BB. It must not use currency symbols, currency units, redemption language, or the phrase “现金桌”.
- The personal term “找爹” never appears in public navigation or lesson copy. Its idea is expressed through “哪些更差的牌会跟？哪些更好的牌会弃？”
- Voice: a calm table-side coach—short paragraphs, concrete questions, no template transitions or inflated conclusions.
- SVGCards assets are vendored into the repository. Production pages make no runtime request to third-party card hosts.
- Every interactive control works by keyboard and has a visible focus state.
- `prefers-reduced-motion: reduce` replaces movement with immediate state changes.
- No account, backend, analytics, tracking, or server-side data store.

---

## File Map

The first slice creates these boundaries:

- `package.json`, `package-lock.json`, `.nvmrc`, `tsconfig.json`, `vitest.config.ts`: reproducible toolchain.
- `site/.vitepress/config.mts`: VitePress routes, navigation, local search, and Pages base path.
- `site/.vitepress/theme/index.ts`: registers shared Vue components and extends the default theme.
- `site/.vitepress/theme/styles/*.css`: tokens, document typography, home page, and poker table styling.
- `site/index.md`: custom home page entry.
- `site/start/table-rules.md`: first substantive chapter.
- `site/start/first-hand.md`: complete animated-hand chapter.
- `site/public/cards/svgcards/`: 52 face SVGs, `blueBack.svg`, and attribution.
- `src/components/home/HomeHero.vue`: project-specific home hero.
- `src/components/cards/cardAssets.ts`: card code → local SVG path and Chinese label.
- `src/components/cards/PlayingCard.vue`: accessible face/back component.
- `src/components/table/PokerTable.vue`: 5–8 seat table renderer.
- `src/components/timeline/HandTimeline.vue`: play, pause, step, restart, and reduced-motion behavior.
- `src/components/timeline/ActionReplay.vue`: synchronized action log.
- `src/components/lesson/FullHandDemo.vue`: composes table, timeline, and teaching panel.
- `src/data/hands/firstHand.ts`: the first six-player example as data.
- `src/lib/hand/types.ts`: hand, player, card, event, and snapshot interfaces.
- `src/lib/hand/engine.ts`: pure state transitions and validation.
- `src/lib/hand/useHandTimeline.ts`: UI timing over the pure engine.
- `scripts/content-rules.mjs`, `scripts/check-content.mjs`: public-copy checks.
- `scripts/vendor-svgcards.mjs`: one-time SVGCards import with strict download checks.
- `docs/editorial/voice.md`: “桌边教练” writing guide.
- `tests/`: configuration, content, engine, component, and browser tests.
- `.github/workflows/deploy.yml`: test, build, and Pages deployment.
- `README.md`: local use, content rules, testing, attribution, and deployment.

---

### Task 1: Stable VitePress Foundation

**Files:**
- Create: `.nvmrc`
- Create: `package.json`
- Create: `package-lock.json` through `npm install`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `site/.vitepress/config.mts`
- Create: `site/index.md`
- Test: `tests/config/site-config.test.ts`

**Interfaces:**
- Consumes: the repository initialized by the design phase.
- Produces: `resolveSiteBase(env: NodeJS.ProcessEnv): string`, npm scripts `dev`, `build`, `preview`, `test`, `test:run`, `check:content`, `check`, and `test:e2e`.

- [ ] **Step 1: Pin the runtime and package set**

Create `.nvmrc`:

```text
22
```

Create `package.json`:

```json
{
  "name": "poker-points-tutorial",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22.12"
  },
  "scripts": {
    "dev": "vitepress dev site",
    "build": "vitepress build site",
    "preview": "vitepress preview site",
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "check:content": "node scripts/check-content.mjs",
    "check": "npm run check:content && npm run test:run"
  },
  "dependencies": {
    "vue": "3.5.42"
  },
  "devDependencies": {
    "@playwright/test": "1.63.0",
    "@types/node": "22.10.2",
    "@vitejs/plugin-vue": "5.2.4",
    "@vue/test-utils": "2.4.6",
    "happy-dom": "20.14.0",
    "typescript": "5.7.3",
    "vite": "6.4.3",
    "vitepress": "1.6.4",
    "vitest": "5.0.0"
  },
  "overrides": {
    "vite": "6.4.3"
  }
}
```

Run:

```bash
npm install --registry=https://registry.npmjs.org
```

Expected: `package-lock.json` is created and `npm ls --depth=0` exits 0.

- [ ] **Step 2: Write the failing site configuration test**

Create `tests/config/site-config.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the test and confirm the missing module failure**

Run:

```bash
npm run test:run -- tests/config/site-config.test.ts
```

Expected: FAIL because `site/.vitepress/config.mts` does not exist.

- [ ] **Step 4: Add TypeScript, Vitest, VitePress config, and a minimal page**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["node", "vitepress/client", "vitest/globals"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["site/**/*.ts", "site/**/*.vue", "src/**/*.ts", "src/**/*.vue", "tests/**/*.ts", "vitest.config.ts"]
}
```

Create `vitest.config.ts`:

```ts
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts', 'src/**/*.spec.ts'],
    clearMocks: true
  }
})
```

Create `site/.vitepress/config.mts`:

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

export function resolveSiteBase(env: NodeJS.ProcessEnv): string {
  const base = env.DOCS_BASE ?? '/'
  return base.startsWith('/') && base.endsWith('/') ? base : '/'
}

export const siteConfig = defineConfig({
  lang: 'zh-CN',
  title: '积分桌入门',
  description: '从第一手牌开始，学会六人德州扑克积分桌。',
  base: resolveSiteBase(process.env),
  cleanUrls: true,
  vite: {
    resolve: {
      alias: {
        '@': resolve(process.cwd(), 'src')
      }
    }
  },
  themeConfig: {
    search: { provider: 'local' },
    nav: [{ text: '开始', link: '/start/table-rules' }],
    sidebar: {
      '/start/': [
        {
          text: '先完成一手牌',
          items: [
            { text: '牌桌规则', link: '/start/table-rules' },
            { text: '三分钟一手牌', link: '/start/first-hand' }
          ]
        }
      ]
    },
    outline: { level: [2, 3], label: '本页内容' },
    docFooter: { prev: '上一节', next: '下一节' },
    darkModeSwitchLabel: '切换明暗主题',
    sidebarMenuLabel: '课程目录',
    returnToTopLabel: '回到顶部'
  }
})

export default siteConfig
```

Create `site/index.md`:

```md
---
layout: home

hero:
  name: 积分桌入门
  text: 先看懂一手牌，再记住一个概念。
  tagline: 六人桌为主。小盲 10，大盲 20。每个决定都落到牌桌上讲。
  actions:
    - theme: brand
      text: 从牌桌规则开始
      link: /start/table-rules
---
```

- [ ] **Step 5: Run the focused test and production build**

Run:

```bash
npm run test:run -- tests/config/site-config.test.ts
npm run build
```

Expected: 2 tests pass and VitePress writes `site/.vitepress/dist/index.html`.

- [ ] **Step 6: Commit the stable foundation**

```bash
git add .nvmrc package.json package-lock.json tsconfig.json vitest.config.ts site tests/config/site-config.test.ts
git commit -m "chore: bootstrap stable VitePress tutorial"
```

---

### Task 2: Editorial Voice and Automated Copy Guard

**Files:**
- Create: `docs/editorial/voice.md`
- Create: `scripts/content-rules.mjs`
- Create: `scripts/check-content.mjs`
- Test: `tests/content/content-rules.test.ts`
- Modify: `site/index.md`

**Interfaces:**
- Consumes: the `site/` Markdown source directory.
- Produces: `findContentViolations(text: string, file: string): ContentViolation[]` and command `npm run check:content`.

- [ ] **Step 1: Write failing tests for forbidden copy patterns**

Create `tests/content/content-rules.test.ts`:

```ts
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
    '综上所述，这手牌很简单'
  ])('rejects banned wording: %s', (copy) => {
    expect(findContentViolations(copy, 'site/start/hand.md')).not.toEqual([])
  })

  it('does not scan internal design documents', () => {
    expect(findContentViolations('现金桌', 'docs/superpowers/spec.md')).toEqual([])
  })
})
```

- [ ] **Step 2: Run the test and confirm the missing module failure**

Run:

```bash
npm run test:run -- tests/content/content-rules.test.ts
```

Expected: FAIL because `scripts/content-rules.mjs` is missing.

- [ ] **Step 3: Implement the copy rules and directory scanner**

Create `scripts/content-rules.mjs`:

```js
const MONEY_PATTERNS = [
  /[¥￥$€£]/u,
  /现金桌|真钱|人民币|美元|欧元|赚钱|亏钱|提现|赎回/u,
  /\d+(?:\.\d+)?\s*元(?:\s|[，。！？、；：]|$)/u
]

const TEMPLATE_PATTERNS = [
  /值得注意的是/u,
  /需要注意的是/u,
  /综上所述/u,
  /总而言之/u,
  /让我们深入探讨/u,
  /在当今/u
]

export function findContentViolations(text, file) {
  if (!file.startsWith('site/')) return []

  const violations = []
  for (const pattern of MONEY_PATTERNS) {
    if (pattern.test(text)) violations.push({ file, kind: 'money', pattern: pattern.source })
  }
  for (const pattern of TEMPLATE_PATTERNS) {
    if (pattern.test(text)) violations.push({ file, kind: 'template', pattern: pattern.source })
  }
  return violations
}
```

Create `scripts/check-content.mjs`:

```js
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
```

- [ ] **Step 4: Write the project-specific voice guide**

Create `docs/editorial/voice.md` with these exact sections:

```md
# “桌边教练”文风

## 他怎么说话

像坐在你旁边的人。牌刚翻开，他先指向桌面，再解释术语。

> 你在按钮位拿到 A♠J♠。前面三家都弃牌。现在先别背范围表，只回答一件事：你愿不愿意主动把底池做大？

这就是标准节奏：局面、问题、判断、理由。定义排在局面后面。

## 六条写作规则

1. 开头 150 字内出现一手牌、一个桌面动作或一个明确问题。
2. 一个自然段只推进一个判断。
3. 第一次出现的术语当场翻译，之后只用统一叫法。
4. 多写“哪些更差的牌会跟”，少写“需要综合考虑”。
5. 用“新手默认线”标出边界，不写“永远应该”。
6. 写完朗读一遍。删掉不影响结论的句子。

## 不用这些腔调

- 不写课程预告式套话。
- 不用“首先、其次、最后”撑起本来只有一句话的内容。
- 不在结尾重复整节内容。
- 不连续堆三个以上新术语。
- 不靠感叹号制造兴奋。

## 每节交稿前

- 读者能否用一句话复述本节判断？
- 每个下注是否回答了“更差谁跟、更好谁弃”？
- 积分、底池和有效筹码是否前后一致？
- 是否还有一句可以删掉？
```

- [ ] **Step 5: Replace the generic home copy with the site voice**

Update the home hero fields in `site/index.md`:

```yaml
hero:
  name: 积分桌入门
  text: 牌已经发下来了。你先做决定。
  tagline: 六人桌，小盲 10，大盲 20。每节只解决一个牌桌问题。
  actions:
    - theme: brand
      text: 坐下，开始第一手
      link: /start/table-rules
```

- [ ] **Step 6: Verify copy checks and commit**

Run:

```bash
npm run test:run -- tests/content/content-rules.test.ts
npm run check:content
```

Expected: all parameterized tests pass and the scanner exits 0.

```bash
git add docs/editorial site/index.md scripts tests/content/content-rules.test.ts
git commit -m "docs: establish table-side coaching voice"
```

---

### Task 3: Distinctive Theme and Home Page

**Files:**
- Create: `site/.vitepress/theme/index.ts`
- Create: `site/.vitepress/theme/styles/tokens.css`
- Create: `site/.vitepress/theme/styles/base.css`
- Create: `src/components/home/HomeHero.vue`
- Test: `src/components/home/HomeHero.spec.ts`
- Modify: `site/index.md`

**Interfaces:**
- Consumes: `withBase()` from VitePress and the route `/start/table-rules`.
- Produces: globally registered `<HomeHero />`, CSS variables `--pp-ink`, `--pp-paper`, `--pp-felt`, `--pp-brass`, `--pp-red`, and `--pp-white`.

- [ ] **Step 1: Write the failing home hero component test**

Create `src/components/home/HomeHero.spec.ts`:

```ts
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('vitepress', () => ({ withBase: (path: string) => path }))

describe('HomeHero', () => {
  beforeEach(() => vi.resetModules())

  it('starts with a table situation and links to the first finished chapter', async () => {
    const { default: HomeHero } = await import('./HomeHero.vue')
    const wrapper = mount(HomeHero)
    expect(wrapper.text()).toContain('牌已经发下来了')
    expect(wrapper.get('a').attributes('href')).toBe('/start/table-rules')
  })
})
```

- [ ] **Step 2: Run the test and confirm the component is missing**

Run:

```bash
npm run test:run -- src/components/home/HomeHero.spec.ts
```

Expected: FAIL because `HomeHero.vue` is missing.

- [ ] **Step 3: Implement the home hero and theme registration**

Create `src/components/home/HomeHero.vue`:

```vue
<script setup lang="ts">
import { withBase } from 'vitepress'
</script>

<template>
  <section class="pp-hero">
    <p class="pp-kicker">5–8 人 · 默认六人桌</p>
    <h1>牌已经发下来了。<br><em>你先做决定。</em></h1>
    <p class="pp-lead">小盲 10，大盲 20。这里不先塞给你一整本术语表，每节只解决一个牌桌问题。</p>
    <div class="pp-hero-actions">
      <a class="pp-primary-action" :href="withBase('/start/table-rules')">坐下，开始第一手</a>
      <span>100BB = 2000 积分</span>
    </div>
    <div class="pp-table-mark" aria-hidden="true">
      <span class="pp-card pp-card-a">A♠</span>
      <span class="pp-card pp-card-j">J♠</span>
      <span class="pp-pot">底池 30</span>
    </div>
  </section>
</template>
```

Create `site/.vitepress/theme/index.ts`:

```ts
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import HomeHero from '@/components/home/HomeHero.vue'
import './styles/tokens.css'
import './styles/base.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomeHero', HomeHero)
  }
} satisfies Theme
```

Replace `site/index.md` with:

```md
---
layout: false
title: 积分桌入门
description: 从一手六人桌牌局开始学习德州扑克。
---

<HomeHero />
```

- [ ] **Step 4: Implement the visual tokens and responsive layout**

Create `site/.vitepress/theme/styles/tokens.css`:

```css
:root {
  --pp-ink: #17211e;
  --pp-paper: #f1ead9;
  --pp-paper-deep: #dfd3b8;
  --pp-felt: #0c503e;
  --pp-felt-dark: #07362a;
  --pp-brass: #d0a752;
  --pp-red: #b83b35;
  --pp-white: #fffdf8;
  --vp-c-brand-1: var(--pp-felt);
  --vp-c-brand-2: #12644e;
  --vp-c-brand-3: #188067;
  --vp-font-family-base: ui-sans-serif, system-ui, sans-serif;
  --vp-font-family-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

Create `site/.vitepress/theme/styles/base.css` with these required rules and values:

```css
body {
  color: var(--pp-ink);
  background:
    linear-gradient(rgba(23, 33, 30, .025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(23, 33, 30, .025) 1px, transparent 1px),
    var(--pp-paper);
  background-size: 28px 28px;
}

.vp-doc h1,
.vp-doc h2,
.vp-doc h3,
.pp-hero h1 {
  font-family: "Songti SC", "Noto Serif SC", STSong, Georgia, serif;
}

.pp-hero {
  position: relative;
  min-height: 100svh;
  padding: clamp(90px, 13vw, 150px) max(24px, calc((100vw - 1120px) / 2));
  overflow: hidden;
}

.pp-kicker { color: var(--pp-red); font-weight: 750; letter-spacing: .08em; }
.pp-hero h1 { max-width: 820px; margin: 16px 0 24px; font-size: clamp(54px, 9vw, 126px); line-height: .92; letter-spacing: -.075em; }
.pp-hero h1 em { color: var(--pp-felt); font-style: normal; }
.pp-lead { max-width: 560px; font-size: clamp(17px, 2vw, 22px); line-height: 1.75; }
.pp-hero-actions { display: flex; align-items: center; gap: 18px; margin-top: 32px; }
.pp-primary-action { padding: 13px 20px; color: var(--pp-white); background: var(--pp-red); border-radius: 999px; font-weight: 750; }
.pp-primary-action:focus-visible { outline: 3px solid var(--pp-brass); outline-offset: 4px; }
.pp-table-mark { position: absolute; right: 7vw; bottom: 8vh; width: 310px; height: 160px; border: 12px solid #70492d; border-radius: 50%; background: var(--pp-felt); transform: rotate(-7deg); }
.pp-card { position: absolute; top: 35px; width: 62px; height: 88px; padding: 7px; border-radius: 6px; color: #111; background: var(--pp-white); box-shadow: 0 8px 18px rgba(0, 0, 0, .24); font: 700 21px/1 Georgia, serif; }
.pp-card-a { left: 82px; transform: rotate(-8deg); }
.pp-card-j { left: 135px; transform: rotate(7deg); }
.pp-pot { position: absolute; right: 28px; bottom: 18px; color: rgba(255, 255, 255, .72); font-size: 12px; }

@media (max-width: 760px) {
  .pp-table-mark { position: relative; right: auto; bottom: auto; margin: 56px auto 0; }
  .pp-hero-actions { align-items: flex-start; flex-direction: column; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-delay: 0ms !important; transition-duration: .01ms !important; }
}
```

- [ ] **Step 5: Verify the component and build, then commit**

Run:

```bash
npm run test:run -- src/components/home/HomeHero.spec.ts
npm run build
```

Expected: the component test passes and the custom home renders without an unresolved component warning.

```bash
git add site src/components/home
git commit -m "feat: add editorial poker tutorial theme"
```

---

### Task 4: Local SVGCards and Accessible PlayingCard

**Files:**
- Create: `scripts/vendor-svgcards.mjs`
- Create: `site/public/cards/svgcards/*.svg` by running the vendor script
- Create: `site/public/cards/svgcards/ATTRIBUTION.md`
- Create: `src/components/cards/cardAssets.ts`
- Create: `src/components/cards/PlayingCard.vue`
- Test: `src/components/cards/cardAssets.spec.ts`
- Test: `src/components/cards/PlayingCard.spec.ts`
- Modify: `src/components/home/HomeHero.vue`
- Modify: `site/.vitepress/theme/styles/base.css`

**Interfaces:**
- Consumes: SVGCards Vertical2 public-domain files.
- Produces: `Card`, `Rank`, `Suit`, `cardAssetPath(card)`, `cardLabel(card)`, and `<PlayingCard :card face-down size />`.

- [ ] **Step 1: Write failing card path and label tests**

Create `src/components/cards/cardAssets.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run the mapping test and confirm the missing module failure**

Run:

```bash
npm run test:run -- src/components/cards/cardAssets.spec.ts
```

Expected: FAIL because `cardAssets.ts` does not exist.

- [ ] **Step 3: Implement the card mapping**

Create `src/components/cards/cardAssets.ts`:

```ts
export type Suit = 's' | 'h' | 'd' | 'c'
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'
export interface Card { rank: Rank; suit: Suit }

const suitFile = { s: 'spade', h: 'heart', d: 'diamond', c: 'club' } as const
const suitLabel = { s: '黑桃', h: '红桃', d: '方片', c: '梅花' } as const
const rankFile: Record<Rank, string> = {
  '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
  '8': '8', '9': '9', '10': '10', J: 'Jack', Q: 'Queen', K: 'King', A: 'Ace'
}

export function cardAssetPath(card: Card): string {
  return `/cards/svgcards/${suitFile[card.suit]}${rankFile[card.rank]}.svg`
}

export function cardLabel(card: Card): string {
  return `${suitLabel[card.suit]} ${card.rank}`
}
```

- [ ] **Step 4: Add a checked vendor script and run it once**

Create `scripts/vendor-svgcards.mjs`:

```js
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const base = 'https://raw.githubusercontent.com/saulspatz/SVGCards/master/Decks/Vertical2/svgs'
const output = resolve(process.cwd(), 'site/public/cards/svgcards')
const suits = ['spade', 'heart', 'diamond', 'club']
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace']
const files = [...suits.flatMap((suit) => ranks.map((rank) => `${suit}${rank}.svg`)), 'blueBack.svg']

await mkdir(output, { recursive: true })

for (const file of files) {
  const response = await fetch(`${base}/${file}`)
  if (!response.ok) throw new Error(`SVGCards download failed for ${file}: ${response.status}`)
  await writeFile(resolve(output, file), await response.text(), 'utf8')
}

await writeFile(resolve(output, 'ATTRIBUTION.md'), [
  '# SVGCards attribution',
  '',
  'Source: https://github.com/saulspatz/SVGCards',
  'Deck: Decks/Vertical2',
  'License status stated by the source repository: public domain.',
  ''
].join('\n'), 'utf8')
```

Run:

```bash
node scripts/vendor-svgcards.mjs
```

Expected: 53 SVG files and one attribution file exist under `site/public/cards/svgcards/`.

- [ ] **Step 5: Write the failing PlayingCard component test**

Create `src/components/cards/PlayingCard.spec.ts`:

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import PlayingCard from './PlayingCard.vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => path }))

describe('PlayingCard', () => {
  it('renders a labelled face card', () => {
    const wrapper = mount(PlayingCard, { props: { card: { rank: 'A', suit: 's' } } })
    expect(wrapper.get('img').attributes('src')).toContain('spadeAce.svg')
    expect(wrapper.get('img').attributes('alt')).toBe('黑桃 A')
  })

  it('hides the card identity when face down', () => {
    const wrapper = mount(PlayingCard, { props: { card: { rank: 'A', suit: 's' }, faceDown: true } })
    expect(wrapper.get('img').attributes('src')).toContain('blueBack.svg')
    expect(wrapper.get('img').attributes('alt')).toBe('一张背面朝上的牌')
  })
})
```

- [ ] **Step 6: Implement PlayingCard**

Create `src/components/cards/PlayingCard.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { cardAssetPath, cardLabel, type Card } from './cardAssets'

const props = withDefaults(defineProps<{
  card: Card
  faceDown?: boolean
  size?: 'seat' | 'board' | 'teaching'
}>(), {
  faceDown: false,
  size: 'board'
})

const src = computed(() => withBase(props.faceDown ? '/cards/svgcards/blueBack.svg' : cardAssetPath(props.card)))
const alt = computed(() => props.faceDown ? '一张背面朝上的牌' : cardLabel(props.card))
</script>

<template>
  <span class="pp-playing-card" :class="`pp-playing-card--${size}`">
    <img :src="src" :alt="alt">
  </span>
</template>
```

- [ ] **Step 7: Replace the temporary home cards with SVGCards**

Import `PlayingCard` in `HomeHero.vue`:

```ts
import PlayingCard from '@/components/cards/PlayingCard.vue'
```

Replace both text-card spans inside `.pp-table-mark` with:

```vue
<div class="pp-hero-cards" aria-label="黑桃 A 和黑桃 J">
  <PlayingCard :card="{ rank: 'A', suit: 's' }" size="teaching" />
  <PlayingCard :card="{ rank: 'J', suit: 's' }" size="teaching" />
</div>
```

Add to `base.css`:

```css
.pp-hero-cards { position: absolute; left: 70px; top: 18px; display: flex; gap: 7px; transform: scale(.62) rotate(-3deg); transform-origin: top left; }
.pp-hero-cards .pp-playing-card { display: inline-block; width: 106px; height: 148px; filter: drop-shadow(0 8px 10px rgba(0,0,0,.28)); }
.pp-hero-cards img { display: block; width: 100%; height: 100%; object-fit: contain; }
```

Delete the obsolete `.pp-card`, `.pp-card-a`, and `.pp-card-j` rules from `base.css`.

- [ ] **Step 8: Verify card behavior, asset count, and commit**

Run:

```bash
npm run test:run -- src/components/cards/cardAssets.spec.ts src/components/cards/PlayingCard.spec.ts
test "$(find site/public/cards/svgcards -name '*.svg' | wc -l | tr -d ' ')" = "53"
```

Expected: 4 tests pass and the asset-count command exits 0.

```bash
git add scripts/vendor-svgcards.mjs site/public/cards site/.vitepress/theme/styles/base.css src/components/cards src/components/home/HomeHero.vue
git commit -m "feat: vendor accessible SVG playing cards"
```

---

### Task 5: Pure Hand Engine and Complete Example Data

**Files:**
- Create: `src/lib/hand/types.ts`
- Create: `src/lib/hand/engine.ts`
- Create: `src/data/hands/firstHand.ts`
- Test: `src/lib/hand/engine.spec.ts`

**Interfaces:**
- Consumes: `Card` from `src/components/cards/cardAssets.ts`.
- Produces: `HandDefinition`, `HandEvent`, `HandSnapshot`, `createInitialSnapshot(hand)`, `applyHandEvent(snapshot, event)`, and `buildTimeline(hand)`.

- [ ] **Step 1: Define types and write failing state-transition tests**

Create `src/lib/hand/types.ts`:

```ts
import type { Card } from '@/components/cards/cardAssets'

export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'
export type Position = 'UTG' | 'UTG+1' | 'LJ' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB'
export type Action =
  | { kind: 'fold' }
  | { kind: 'check' }
  | { kind: 'call' }
  | { kind: 'bet'; amount: number }
  | { kind: 'raiseTo'; amount: number }

export interface PlayerDefinition {
  id: string
  name: string
  position: Position
  startingPoints: number
  cards?: [Card, Card]
}

export type HandEvent =
  | { kind: 'action'; street: Street; playerId: string; action: Action; note?: string }
  | { kind: 'dealBoard'; street: 'flop' | 'turn' | 'river'; cards: Card[]; note?: string }
  | { kind: 'showdown'; revealedPlayerIds: string[]; note: string }

export interface HandDefinition {
  id: string
  title: string
  smallBlind: number
  bigBlind: number
  heroId: string
  players: PlayerDefinition[]
  events: HandEvent[]
}

export interface PlayerSnapshot extends PlayerDefinition {
  points: number
  streetContribution: number
  folded: boolean
  revealed: boolean
}

export interface HandSnapshot {
  street: Street
  pot: number
  currentBet: number
  board: Card[]
  activePlayerId?: string
  eventIndex: number
  note?: string
  players: PlayerSnapshot[]
}
```

Create `src/lib/hand/engine.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { firstHand } from '@/data/hands/firstHand'
import { buildTimeline, createInitialSnapshot } from './engine'

describe('hand engine', () => {
  it('posts 10/20 blinds into a 30-point pot', () => {
    const state = createInitialSnapshot(firstHand)
    expect(state.pot).toBe(30)
    expect(state.players.find((player) => player.position === 'SB')?.points).toBe(1990)
    expect(state.players.find((player) => player.position === 'BB')?.points).toBe(1980)
  })

  it('keeps the pot and both active stacks consistent through showdown', () => {
    const timeline = buildTimeline(firstHand)
    const preflopEnd = timeline.find((state) => state.street === 'flop' && state.board.length === 3)
    const riverDeal = timeline.find((state) => state.street === 'river' && state.board.length === 5)
    const final = timeline.at(-1)

    expect(preflopEnd?.pot).toBe(130)
    expect(riverDeal?.pot).toBe(220)
    expect(final?.pot).toBe(500)
    expect(final?.players.find((player) => player.id === 'hero')?.points).toBe(1755)
    expect(final?.players.find((player) => player.id === 'bb')?.points).toBe(1755)
  })

  it('rejects a contribution larger than the player stack', () => {
    const broken = structuredClone(firstHand)
    broken.events[3] = { kind: 'action', street: 'preflop', playerId: 'hero', action: { kind: 'raiseTo', amount: 5000 } }
    expect(() => buildTimeline(broken)).toThrow('hero cannot contribute 5000 points')
  })
})
```

- [ ] **Step 2: Run the engine tests and confirm missing modules**

Run:

```bash
npm run test:run -- src/lib/hand/engine.spec.ts
```

Expected: FAIL because the engine and first-hand data do not exist.

- [ ] **Step 3: Add the complete first-hand dataset**

Create `src/data/hands/firstHand.ts`:

```ts
import type { HandDefinition } from '@/lib/hand/types'

export const firstHand: HandDefinition = {
  id: 'first-six-max-hand',
  title: '按钮位的 A♠J♠',
  smallBlind: 10,
  bigBlind: 20,
  heroId: 'hero',
  players: [
    { id: 'utg', name: '林', position: 'UTG', startingPoints: 2000 },
    { id: 'hj', name: '周', position: 'HJ', startingPoints: 2000 },
    { id: 'co', name: '陈', position: 'CO', startingPoints: 2000 },
    { id: 'hero', name: '你', position: 'BTN', startingPoints: 2000, cards: [{ rank: 'A', suit: 's' }, { rank: 'J', suit: 's' }] },
    { id: 'sb', name: '许', position: 'SB', startingPoints: 2000 },
    { id: 'bb', name: '唐', position: 'BB', startingPoints: 2000, cards: [{ rank: 'Q', suit: 's' }, { rank: '10', suit: 's' }] }
  ],
  events: [
    { kind: 'action', street: 'preflop', playerId: 'utg', action: { kind: 'fold' } },
    { kind: 'action', street: 'preflop', playerId: 'hj', action: { kind: 'fold' } },
    { kind: 'action', street: 'preflop', playerId: 'co', action: { kind: 'fold' } },
    { kind: 'action', street: 'preflop', playerId: 'hero', action: { kind: 'raiseTo', amount: 60 }, note: '你加注到 60。' },
    { kind: 'action', street: 'preflop', playerId: 'sb', action: { kind: 'fold' } },
    { kind: 'action', street: 'preflop', playerId: 'bb', action: { kind: 'call' }, note: '大盲补到 60，底池来到 130。' },
    { kind: 'dealBoard', street: 'flop', cards: [{ rank: 'K', suit: 's' }, { rank: '7', suit: 's' }, { rank: '2', suit: 'd' }], note: '你还没有成牌，但任何一张黑桃都能完成 A 高同花。' },
    { kind: 'action', street: 'flop', playerId: 'bb', action: { kind: 'check' } },
    { kind: 'action', street: 'flop', playerId: 'hero', action: { kind: 'bet', amount: 45 }, note: '你下注 45。更好的 Kx 现在不会弃牌，这次下注不该被说成纯诈唬。' },
    { kind: 'action', street: 'flop', playerId: 'bb', action: { kind: 'call' }, note: '大盲跟注，底池 220。' },
    { kind: 'dealBoard', street: 'turn', cards: [{ rank: '4', suit: 'h' }], note: '转牌没有改善你的牌。' },
    { kind: 'action', street: 'turn', playerId: 'bb', action: { kind: 'check' } },
    { kind: 'action', street: 'turn', playerId: 'hero', action: { kind: 'check' }, note: '你随后过牌，保留看到河牌的机会。' },
    { kind: 'dealBoard', street: 'river', cards: [{ rank: '3', suit: 's' }], note: '河牌是黑桃。你的 A 高同花完成。' },
    { kind: 'action', street: 'river', playerId: 'bb', action: { kind: 'check' } },
    { kind: 'action', street: 'river', playerId: 'hero', action: { kind: 'bet', amount: 140 }, note: '你下注 140。现在能跟注的更差牌包括较小同花。' },
    { kind: 'action', street: 'river', playerId: 'bb', action: { kind: 'call' }, note: '大盲跟注，底池 500。' },
    { kind: 'showdown', revealedPlayerIds: ['hero', 'bb'], note: 'A 高同花赢过 Q 高同花。先记住这一点：河牌下注有明确的更差跟注对象。' }
  ]
}
```

- [ ] **Step 4: Implement blind posting and event transitions**

Create `src/lib/hand/engine.ts` with these exported functions and validation rules:

```ts
import type { Action, HandDefinition, HandEvent, HandSnapshot, PlayerSnapshot, Street } from './types'

function requiredPlayer(players: PlayerSnapshot[], id: string): PlayerSnapshot {
  const player = players.find((candidate) => candidate.id === id)
  if (!player) throw new Error(`Unknown player: ${id}`)
  return player
}

function contribute(state: HandSnapshot, player: PlayerSnapshot, amount: number): void {
  if (!Number.isInteger(amount) || amount < 0 || amount > player.points) {
    throw new Error(`${player.id} cannot contribute ${amount} points`)
  }
  player.points -= amount
  player.streetContribution += amount
  state.pot += amount
}

export function createInitialSnapshot(hand: HandDefinition): HandSnapshot {
  if (hand.players.length < 5 || hand.players.length > 8) throw new Error('A table must contain 5–8 players')
  const players = hand.players.map((player) => ({ ...structuredClone(player), points: player.startingPoints, streetContribution: 0, folded: false, revealed: player.id === hand.heroId }))
  const state: HandSnapshot = { street: 'preflop', pot: 0, currentBet: hand.bigBlind, board: [], eventIndex: -1, players }
  const smallBlindPlayer = players.find((player) => player.position === 'SB')
  const bigBlindPlayer = players.find((player) => player.position === 'BB')
  if (!smallBlindPlayer || !bigBlindPlayer) throw new Error('SB and BB seats are required')
  contribute(state, smallBlindPlayer, hand.smallBlind)
  contribute(state, bigBlindPlayer, hand.bigBlind)
  return state
}

function applyAction(state: HandSnapshot, player: PlayerSnapshot, action: Action): void {
  if (player.folded) throw new Error(`${player.id} already folded`)
  if (action.kind === 'fold') { player.folded = true; return }
  if (action.kind === 'check') {
    if (player.streetContribution !== state.currentBet) throw new Error(`${player.id} cannot check facing a bet`)
    return
  }
  if (action.kind === 'call') {
    contribute(state, player, state.currentBet - player.streetContribution)
    return
  }
  const target = action.amount
  if (action.kind === 'bet' && state.currentBet !== 0) throw new Error('Use raiseTo when a bet already exists')
  if (target <= state.currentBet) throw new Error(`${action.kind} must increase the current bet`)
  contribute(state, player, target - player.streetContribution)
  state.currentBet = target
}

export function applyHandEvent(snapshot: HandSnapshot, event: HandEvent, eventIndex = snapshot.eventIndex + 1): HandSnapshot {
  const state = structuredClone(snapshot)
  state.activePlayerId = undefined
  state.eventIndex = eventIndex
  state.note = event.note

  if (event.kind === 'dealBoard') {
    state.street = event.street
    state.currentBet = 0
    state.players.forEach((player) => { player.streetContribution = 0 })
    state.board.push(...event.cards)
    return state
  }

  if (event.kind === 'showdown') {
    state.street = 'showdown'
    state.players.forEach((player) => { player.revealed = event.revealedPlayerIds.includes(player.id) })
    return state
  }

  if (event.street !== state.street) throw new Error(`Event street ${event.street} does not match ${state.street}`)
  const player = requiredPlayer(state.players, event.playerId)
  state.activePlayerId = player.id
  applyAction(state, player, event.action)
  return state
}

export function buildTimeline(hand: HandDefinition): HandSnapshot[] {
  const timeline = [createInitialSnapshot(hand)]
  hand.events.forEach((event, index) => timeline.push(applyHandEvent(timeline.at(-1)!, event, index)))
  return timeline
}
```

- [ ] **Step 5: Run the engine suite and commit**

Run:

```bash
npm run test:run -- src/lib/hand/engine.spec.ts
```

Expected: all 3 engine tests pass with final pot 500 and both active stacks 1755.

```bash
git add src/lib/hand src/data/hands
git commit -m "feat: model a complete six-player hand"
```

---

### Task 6: Animated Poker Table and Timeline Controls

**Files:**
- Create: `src/lib/hand/useHandTimeline.ts`
- Create: `src/components/table/PokerTable.vue`
- Create: `src/components/timeline/ActionReplay.vue`
- Create: `src/components/timeline/HandTimeline.vue`
- Create: `src/components/lesson/FullHandDemo.vue`
- Create: `site/.vitepress/theme/styles/table.css`
- Modify: `site/.vitepress/theme/index.ts`
- Test: `src/lib/hand/useHandTimeline.spec.ts`
- Test: `src/components/lesson/FullHandDemo.spec.ts`

**Interfaces:**
- Consumes: `HandDefinition`, `HandSnapshot`, `buildTimeline()`, and `<PlayingCard />`.
- Produces: `useHandTimeline(hand, intervalMs)`, `<PokerTable :snapshot :hero-id />`, `<ActionReplay :hand :index />`, `<HandTimeline :hand />`, and globally registered `<FullHandDemo />`.

- [ ] **Step 1: Write failing timeline tests with fake timers**

Create `src/lib/hand/useHandTimeline.spec.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { firstHand } from '@/data/hands/firstHand'
import { useHandTimeline } from './useHandTimeline'

describe('useHandTimeline', () => {
  it('steps, restarts, and never advances past showdown', () => {
    const timeline = useHandTimeline(firstHand, 50)
    expect(timeline.index.value).toBe(0)
    timeline.step()
    expect(timeline.index.value).toBe(1)
    for (let index = 0; index < 100; index += 1) timeline.step()
    expect(timeline.snapshot.value.street).toBe('showdown')
    timeline.restart()
    expect(timeline.index.value).toBe(0)
  })

  it('pauses automatic playback', () => {
    vi.useFakeTimers()
    const timeline = useHandTimeline(firstHand, 50)
    timeline.play()
    vi.advanceTimersByTime(60)
    expect(timeline.index.value).toBe(1)
    timeline.pause()
    vi.advanceTimersByTime(200)
    expect(timeline.index.value).toBe(1)
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run the timeline test and confirm the composable is missing**

Run:

```bash
npm run test:run -- src/lib/hand/useHandTimeline.spec.ts
```

Expected: FAIL because `useHandTimeline.ts` does not exist.

- [ ] **Step 3: Implement the timeline composable**

Create `src/lib/hand/useHandTimeline.ts`:

```ts
import { computed, getCurrentInstance, onBeforeUnmount, ref } from 'vue'
import { buildTimeline } from './engine'
import type { HandDefinition } from './types'

export function useHandTimeline(hand: HandDefinition, intervalMs = 1100) {
  const frames = buildTimeline(hand)
  const index = ref(0)
  const playing = ref(false)
  let timer: ReturnType<typeof setInterval> | undefined

  const snapshot = computed(() => frames[index.value])
  const finished = computed(() => index.value === frames.length - 1)

  function pause() {
    playing.value = false
    if (timer) clearInterval(timer)
    timer = undefined
  }

  function step() {
    index.value = Math.min(index.value + 1, frames.length - 1)
    if (finished.value) pause()
  }

  function play() {
    if (finished.value) index.value = 0
    if (playing.value) return
    playing.value = true
    timer = setInterval(step, intervalMs)
  }

  function restart() {
    pause()
    index.value = 0
  }

  if (getCurrentInstance()) onBeforeUnmount(pause)
  return { frames, index, snapshot, playing, finished, play, pause, step, restart }
}
```

- [ ] **Step 4: Write the failing integrated demo test**

Create `src/components/lesson/FullHandDemo.spec.ts`:

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import FullHandDemo from './FullHandDemo.vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => path }))

describe('FullHandDemo', () => {
  it('shows six seats, a 30-point opening pot, and working step control', async () => {
    const wrapper = mount(FullHandDemo)
    expect(wrapper.findAll('[data-seat]')).toHaveLength(6)
    expect(wrapper.get('[data-pot]').text()).toContain('30')
    await wrapper.get('[data-control="step"]').trigger('click')
    expect(wrapper.get('[data-event-index]').text()).toBe('0')
  })

  it('keeps text controls when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const wrapper = mount(FullHandDemo)
    expect(wrapper.get('[data-motion]').attributes('data-motion')).toBe('reduced')
    vi.unstubAllGlobals()
  })
})
```

- [ ] **Step 5: Implement the component composition**

Create `src/components/table/PokerTable.vue`:

```vue
<script setup lang="ts">
import PlayingCard from '@/components/cards/PlayingCard.vue'
import type { Card } from '@/components/cards/cardAssets'
import type { HandSnapshot, PlayerSnapshot } from '@/lib/hand/types'

const props = defineProps<{ snapshot: HandSnapshot; heroId: string }>()

const hiddenCards: [Card, Card] = [
  { rank: '2', suit: 'c' },
  { rank: '3', suit: 'c' }
]

function displayedCards(player: PlayerSnapshot): [Card, Card] {
  return player.cards ?? hiddenCards
}

const seatLayouts: Record<number, Array<[number, number]>> = {
  5: [[50, 2], [88, 32], [70, 96], [30, 96], [12, 32]],
  6: [[50, 2], [88, 28], [88, 73], [50, 96], [12, 73], [12, 28]],
  7: [[50, 2], [82, 18], [92, 52], [72, 92], [28, 92], [8, 52], [18, 18]],
  8: [[50, 2], [76, 13], [92, 36], [88, 73], [62, 96], [38, 96], [12, 73], [8, 36]]
}

function seatStyle(index: number): Record<string, string> {
  const point = seatLayouts[props.snapshot.players.length]?.[index]
  if (!point) throw new Error(`No seat layout for ${props.snapshot.players.length} players`)
  return { left: `${point[0]}%`, top: `${point[1]}%` }
}
</script>

<template>
  <section class="pp-poker-table" :data-street="snapshot.street">
    <div class="pp-felt" :data-seat-count="snapshot.players.length">
      <article
        v-for="(player, seatIndex) in snapshot.players"
        :key="player.id"
        class="pp-seat"
        :class="{ 'is-active': player.id === snapshot.activePlayerId, 'is-folded': player.folded }"
        :data-position="player.position"
        :data-seat-index="seatIndex"
        :style="seatStyle(seatIndex)"
        data-seat
      >
        <strong>{{ player.id === heroId ? '你' : player.name }} · {{ player.position }}</strong>
        <span>{{ player.points }} 积分</span>
        <div class="pp-hole-cards">
          <PlayingCard
            v-for="(card, cardIndex) in displayedCards(player)"
            :key="`${player.id}-${cardIndex}-${player.revealed}`"
            :card="card"
            :face-down="!player.revealed"
            size="seat"
          />
        </div>
      </article>
      <div class="pp-board" aria-label="公共牌">
        <PlayingCard v-for="card in snapshot.board" :key="`${card.rank}${card.suit}`" :card="card" size="board" />
      </div>
      <div class="pp-pot" data-pot>底池 {{ snapshot.pot }}</div>
    </div>
  </section>
</template>
```

Create `src/components/timeline/ActionReplay.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { HandDefinition, HandEvent } from '@/lib/hand/types'

const props = defineProps<{ hand: HandDefinition; index: number }>()
const visibleEvents = computed(() => props.hand.events.slice(0, props.index + 1))

function eventLabel(event: HandEvent): string {
  if (event.kind === 'dealBoard') return { flop: '翻牌', turn: '转牌', river: '河牌' }[event.street]
  if (event.kind === 'showdown') return '摊牌'
  const player = props.hand.players.find((candidate) => candidate.id === event.playerId)
  const actor = player?.id === props.hand.heroId ? '你' : (player?.name ?? event.playerId)
  const action = event.action
  if (action.kind === 'fold') return `${actor} · 弃牌`
  if (action.kind === 'check') return `${actor} · 过牌`
  if (action.kind === 'call') return `${actor} · 跟注`
  if (action.kind === 'bet') return `${actor} · 下注 ${action.amount}`
  return `${actor} · 加注到 ${action.amount}`
}
</script>

<template>
  <ol class="pp-action-replay" aria-label="行动记录">
    <li v-for="(event, eventIndex) in visibleEvents" :key="eventIndex">{{ eventLabel(event) }}</li>
  </ol>
</template>
```

Create `src/components/timeline/HandTimeline.vue`:

```vue
<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useHandTimeline } from '@/lib/hand/useHandTimeline'
import type { HandDefinition, HandSnapshot } from '@/lib/hand/types'

const props = withDefaults(defineProps<{ hand: HandDefinition; autoPlay?: boolean }>(), { autoPlay: false })
const emit = defineEmits<{
  'update:snapshot': [snapshot: HandSnapshot]
  'update:event-index': [index: number]
}>()
const timeline = useHandTimeline(props.hand)

watch([timeline.snapshot, timeline.index], () => {
  emit('update:snapshot', timeline.snapshot.value)
  emit('update:event-index', timeline.snapshot.value.eventIndex)
}, { immediate: true })

onMounted(() => {
  if (props.autoPlay) timeline.play()
})
</script>

<template>
  <div class="pp-timeline-controls" aria-label="牌局播放控制">
    <button type="button" data-control="play" aria-label="播放牌局" @click="timeline.play">播放</button>
    <button type="button" data-control="pause" aria-label="暂停牌局" @click="timeline.pause">暂停</button>
    <button type="button" data-control="step" aria-label="前进一步" :disabled="timeline.finished.value" @click="timeline.step">下一步</button>
    <button type="button" data-control="restart" aria-label="重新开始" @click="timeline.restart">重来</button>
  </div>
</template>
```

Create `src/components/lesson/FullHandDemo.vue`:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { firstHand } from '@/data/hands/firstHand'
import { createInitialSnapshot } from '@/lib/hand/engine'
import type { HandSnapshot, Street } from '@/lib/hand/types'
import PokerTable from '@/components/table/PokerTable.vue'
import ActionReplay from '@/components/timeline/ActionReplay.vue'
import HandTimeline from '@/components/timeline/HandTimeline.vue'

const props = withDefaults(defineProps<{ autoPlay?: boolean }>(), { autoPlay: false })
const snapshot = ref<HandSnapshot>(createInitialSnapshot(firstHand))
const eventIndex = ref(-1)
const media = typeof window === 'undefined' ? undefined : window.matchMedia?.('(prefers-reduced-motion: reduce)')
const reducedMotion = ref(media?.matches ?? false)
const streetNames: Record<Street, string> = { preflop: '翻前', flop: '翻牌', turn: '转牌', river: '河牌', showdown: '摊牌' }
const streetLabel = computed(() => streetNames[snapshot.value.street])

</script>

<template>
  <section class="pp-hand-demo" :data-motion="reducedMotion ? 'reduced' : 'full'">
    <PokerTable :snapshot="snapshot" :hero-id="firstHand.heroId" />
    <aside class="pp-lesson-panel">
      <span class="pp-street">{{ streetLabel }}</span>
      <p class="pp-note">{{ snapshot.note ?? '盲注已经放好。轮到枪口位先行动。' }}</p>
      <ActionReplay :hand="firstHand" :index="eventIndex" />
      <span class="sr-only" data-event-index>{{ eventIndex }}</span>
      <HandTimeline
        :hand="firstHand"
        :auto-play="props.autoPlay && !reducedMotion"
        @update:snapshot="snapshot = $event"
        @update:event-index="eventIndex = $event"
      />
    </aside>
  </section>
</template>
```

Modify `site/.vitepress/theme/index.ts`:

```ts
import FullHandDemo from '@/components/lesson/FullHandDemo.vue'
import './styles/table.css'
```

Register it inside `enhanceApp`:

```ts
app.component('FullHandDemo', FullHandDemo)
```

- [ ] **Step 6: Add restrained animation and responsive table CSS**

Import `table.css` from the theme. It must include:

```css
.pp-hand-demo { display: grid; grid-template-columns: minmax(0, 1fr) 280px; background: #171d1a; box-shadow: 0 22px 55px rgba(18, 24, 21, .22); }
.pp-poker-table { min-width: 0; min-height: 610px; padding: 42px; background: #252c28; }
.pp-felt { position: relative; width: 100%; height: 520px; border: 17px solid #633f25; border-radius: 50%; background: radial-gradient(circle at 50% 42%, rgba(255,255,255,.08), transparent 44%), var(--pp-felt); box-shadow: inset 0 0 0 3px #a57945, inset 0 0 55px rgba(0,0,0,.35); }
.pp-seat { position: absolute; width: 122px; padding: 9px; color: var(--pp-white); background: rgba(10,16,13,.9); border: 1px solid rgba(255,255,255,.18); text-align: center; transform: translate(-50%, -50%); transition: opacity .25s ease, box-shadow .25s ease; }
.pp-seat.is-active { border-color: var(--pp-brass); box-shadow: 0 0 0 3px rgba(208,167,82,.2); }
.pp-seat.is-folded { opacity: .4; }
.pp-board { position: absolute; left: 50%; top: 50%; display: flex; gap: 8px; transform: translate(-50%, -50%); }
.pp-playing-card { display: inline-block; filter: drop-shadow(0 7px 8px rgba(0,0,0,.28)); animation: pp-card-reveal .55s cubic-bezier(.18,.78,.25,1) both; }
.pp-playing-card img { display: block; width: 100%; height: 100%; object-fit: contain; }
.pp-playing-card--seat { width: 38px; height: 53px; }
.pp-playing-card--board { width: 68px; height: 95px; }
.pp-playing-card--teaching { width: 106px; height: 148px; }
@keyframes pp-card-reveal { from { opacity: 0; transform: translateY(-24px) rotateY(75deg); } to { opacity: 1; transform: none; } }
@media (max-width: 860px) { .pp-hand-demo { grid-template-columns: 1fr; } .pp-poker-table { min-height: 520px; padding: 20px 6px; } .pp-felt { height: 470px; border-width: 12px; } .pp-playing-card--board { width: 51px; height: 71px; } }
@media (prefers-reduced-motion: reduce) { .pp-playing-card { animation: none; } }
```

The component's `seatLayouts` coordinates place the six seats as UTG top center, HJ upper right, CO lower right, BTN bottom center, SB lower left, and BB upper left. The same function already provides concrete coordinates for 5, 7, and 8 seats, so later chapters can change table size without rewriting CSS.

- [ ] **Step 7: Verify controls, build, and commit**

Run:

```bash
npm run test:run -- src/lib/hand/useHandTimeline.spec.ts src/components/lesson/FullHandDemo.spec.ts
npm run build
```

Expected: timeline and demo tests pass; the build contains no hydration or unresolved-component warnings.

```bash
git add src site/.vitepress/theme
git commit -m "feat: animate a complete points-table hand"
```

---

### Task 7: First Two Chapters in the “Table-Side Coach” Voice

**Files:**
- Create: `site/start/table-rules.md`
- Create: `site/start/first-hand.md`
- Test: `tests/content/first-lessons.test.ts`

**Interfaces:**
- Consumes: globally registered `<FullHandDemo />`, live routes in `siteConfig`, and content rules.
- Produces: the first two complete, non-placeholder chapters.

- [ ] **Step 1: Write failing structural tests for both lessons**

Create `tests/content/first-lessons.test.ts`:

```ts
import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('first lessons', () => {
  it('states every fixed table rule in the opening chapter', async () => {
    const copy = await readFile('site/start/table-rules.md', 'utf8')
    expect(copy).toContain('最少 5 人，最多 8 人')
    expect(copy).toContain('小盲 10 积分')
    expect(copy).toContain('大盲 20 积分')
    expect(copy).toContain('100BB = 2000 积分')
    expect(copy).toContain('两手牌之间')
    expect(copy).toContain('有效筹码')
  })

  it('embeds the full hand and asks the betting-purpose question', async () => {
    const copy = await readFile('site/start/first-hand.md', 'utf8')
    expect(copy).toContain('<FullHandDemo auto-play />')
    expect(copy).toContain('哪些更差的牌会跟')
    expect(copy).toContain('A 高同花')
  })
})
```

- [ ] **Step 2: Run the tests and confirm both chapter files are missing**

Run:

```bash
npm run test:run -- tests/content/first-lessons.test.ts
```

Expected: FAIL with `ENOENT` for `site/start/table-rules.md`.

- [ ] **Step 3: Write the table rules chapter**

Create `site/start/table-rules.md` with this finished copy and metadata:

```md
---
title: 先把这张桌子坐明白
description: 六人积分桌的盲注、起始积分、补充规则与有效筹码。
next: 三分钟一手牌
---

# 先把这张桌子坐明白

你坐下，面前有 2000 积分。左边两位玩家已经放好盲注：小盲 10 积分，大盲 20 积分。

先别急着看牌。桌上的第一个基准，是 **20**。

## 100BB 是多深？

大盲的 20 积分叫做 1BB。于是：

- 20 积分 = 1BB
- 200 积分 = 10BB
- 2000 积分 = 100BB

看到“加注到 3BB”，你要能立刻换成 60 积分。看到“还剩 75BB”，也要知道那是 1500 积分。

教程会同时写积分和 BB。积分告诉你桌上发生了什么，BB 方便比较不同深度。

## 一桌坐几个人？

最少 5 人，最多 8 人。多数牌例使用 6 人桌，因为位置够完整，行动又不会拖得太长。

人数变化时，按钮位、小盲和大盲仍然存在。前面位置的名称会调整，这件事留到“座位与行动顺序”再拆开。现在只记住：按钮每手顺时针移动，盲注也跟着移动。

## 什么时候可以补充积分？

只能在两手牌之间补充。牌已经发出，就等这一手结束。

已经摆在桌上的积分不能在过程中主动减少。这样，领先玩家不会突然缩短筹码，其他人也能根据看得见的深度做决定。

## 真正需要看的数字：有效筹码

你有 2000 积分，对手有 3600。你们这一手最多只能各投入 2000，所以有效筹码是 2000，也就是 100BB。

反过来，你有 4000，对手只有 1200，有效筹码就是 1200，也就是 60BB。你多出来的 2800 暂时不参加这场对决。

> **桌边口令**
>
> 不要问“我有多深”。先问：“我和这个对手，有效筹码多深？”

下一节，牌会真的发下来。你不需要提前背完牌型，只要跟着行动走完一手。
```

- [ ] **Step 4: Write the complete-hand chapter**

Create `site/start/first-hand.md`:

```md
---
title: 三分钟走完第一手
description: 从翻前到摊牌，看懂一手六人桌牌局怎样推进。
prev: 牌桌规则
---

# 三分钟走完第一手

你在按钮位拿到 A♠J♠。前面三位玩家都弃牌。小盲已经放入 10 积分，大盲已经放入 20 积分。

现在轮到你。

<ClientOnly>
  <FullHandDemo auto-play />
</ClientOnly>

## 翻前：主动把问题交给盲注位

你加注到 60。小盲弃牌，大盲补到 60。

底池原来有 30。你放入 60，大盲再补 40，所以翻牌前的底池是 130。

这里先抓住两个动作：**加注**会抬高继续游戏的门槛，**跟注**只是补齐当前门槛。

## 翻牌：你还没成牌

翻牌是 K♠ 7♠ 2♦。

你没有对子。现在最好的五张牌仍然只是 A 高。但你手里有两张黑桃，桌面又有两张黑桃；再来一张黑桃，就会完成同花。

大盲过牌。你下注 45，他跟注。底池来到 220。

别急着把这次下注只叫“诈唬”。更好的 Kx 通常不会因为 45 就弃牌，而一些没有成牌的组合会退出。下注同时影响了对手范围，也保留了你击中同花时赢下大底池的机会。

## 转牌：没击中，也不必硬讲故事

转牌是 4♥。大盲再次过牌。

你随后过牌。

这不是放弃。你用零积分看到了河牌，也没有把底池继续推高。拿着听牌时，“继续下注”不是自动答案。

## 河牌：先找更差的跟注

河牌是 3♠。你的 A 高同花完成。

大盲过牌。现在下注之前，先问：**哪些更差的牌会跟？**

较小的同花会跟。某些很强的一对也可能跟。于是你下注 140，不是在炫耀牌力，而是在向这些更差的牌收取积分。

大盲跟注并亮出 Q♠10♠。他是 Q 高同花，你是 A 高同花。底池最终是 500。

## 这一手只带走三个判断

1. 先看位置和有效筹码，再看自己的两张牌。
2. 听牌不是成牌；没击中时可以过牌。
3. 下注前说出更差谁会跟。说不出来，就先别把“我的牌很强”当成理由。

下一章会把牌型排清楚。到时你会知道为什么两个人都是同花，A 高仍然赢过 Q 高。
```

- [ ] **Step 5: Run content, structure, and build checks**

Run:

```bash
npm run test:run -- tests/content/first-lessons.test.ts
npm run check:content
npm run build
```

Expected: lesson tests pass, copy scanner exits 0, and both routes build.

- [ ] **Step 6: Read both chapters aloud and commit the edited result**

During the read-aloud pass, remove any sentence that repeats the preceding sentence without adding a decision, number, or boundary. Re-run the three commands from Step 5 after editing.

```bash
git add site/start tests/content/first-lessons.test.ts
git commit -m "docs: teach the rules through a complete first hand"
```

---

### Task 8: Browser QA and Reduced-Motion Verification

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/first-hand.spec.ts`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `npm run dev`, `/`, `/start/table-rules`, `/start/first-hand`, and timeline data attributes.
- Produces: repeatable desktop/mobile browser checks and review screenshots under ignored `test-results/`.

- [ ] **Step 1: Add Playwright configuration and the failing browser test**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: 'test-results',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } }
  ]
})
```

Create `tests/e2e/first-hand.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('reader can enter the course and step through the hand', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /牌已经发下来了/ })).toBeVisible()
  await page.screenshot({ path: test.info().outputPath('home.png'), fullPage: true })
  await page.getByRole('link', { name: '坐下，开始第一手' }).click()
  await expect(page.getByRole('heading', { name: '先把这张桌子坐明白' })).toBeVisible()
  await page.goto('/start/first-hand')
  await page.locator('[data-control="restart"]').click()
  await expect(page.locator('[data-seat]')).toHaveCount(6)
  await expect(page.locator('[data-pot]')).toContainText('30')
  await page.locator('[data-control="step"]').click()
  await expect(page.locator('[data-event-index]')).toHaveText('0')
  for (let remainingEvent = 1; remainingEvent < 18; remainingEvent += 1) {
    await page.locator('[data-control="step"]').click()
  }
  await expect(page.locator('[data-event-index]')).toHaveText('17')
  await expect(page.locator('[data-pot]')).toContainText('500')
  await page.screenshot({ path: test.info().outputPath('first-hand-showdown.png'), fullPage: true })
})

test('reduced motion keeps the full lesson usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/start/first-hand')
  await expect(page.locator('[data-motion]')).toHaveAttribute('data-motion', 'reduced')
  await expect(page.locator('[data-control="step"]')).toBeVisible()
})
```

- [ ] **Step 2: Install Chromium and run the browser tests**

Run:

```bash
npx playwright install chromium
npm run test:e2e
```

Expected: both tests pass in desktop and mobile projects, for 4 passing cases total.

- [ ] **Step 3: Inspect the generated visual review screenshots**

Open `home.png` and `first-hand-showdown.png` from the latest desktop Playwright output directory. Correct only issues that affect hierarchy, card readability, overflow, focus, or interaction. Do not add decorative motion during this pass. Run `npm run test:e2e` again after every visual correction.

- [ ] **Step 4: Commit browser QA**

```bash
git add playwright.config.ts tests/e2e .gitignore
git commit -m "test: cover first-hand tutorial in the browser"
```

---

### Task 9: GitHub Pages, README, and Desktop Copy

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `README.md`
- Modify: `site/.vitepress/config.mts` only if the real repository name differs from `poker-points-tutorial`.

**Interfaces:**
- Consumes: npm scripts, Pages base path, clean local git history, and the user-authorized GitHub publication.
- Produces: public repository, passing Pages workflow, live URL, and `/Users/yaoyaoling/Desktop/德州扑克积分桌入门` synchronized to the published commit.

- [ ] **Step 1: Add the Pages workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy tutorial to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run check
      - run: npm run build
        env:
          DOCS_BASE: /${{ github.event.repository.name }}/
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: site/.vitepress/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Write the project README**

Create `README.md` with:

````md
# 德州扑克积分桌入门

一套从具体牌局出发的中文德州扑克教程。默认六人桌，小盲 10 积分，大盲 20 积分，100BB = 2000 积分。

## 本地运行

要求 Node.js 22.12 或更新版本。

```bash
npm install
npm run dev
```

## 检查与构建

```bash
npm run check
npm run build
npm run test:e2e
```

正式课程只使用积分与 BB。写作前先阅读 `docs/editorial/voice.md`。

## 扑克牌素材

牌面来自 [SVGCards](https://github.com/saulspatz/SVGCards) 的 Vertical2 牌组。来源仓库将其声明为公共领域；本项目保留本地来源说明。

## 发布

`main` 分支通过 GitHub Actions 部署到 GitHub Pages。
````

- [ ] **Step 3: Run the full local release gate**

Run:

```bash
npm ci --registry=https://registry.npmjs.org
npm run check
npm run build
npm run test:e2e
git status --short
```

Expected: unit/content checks pass, build succeeds, 4 browser cases pass, and only the workflow plus README are uncommitted.

- [ ] **Step 4: Commit release configuration**

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "ci: publish tutorial foundation to GitHub Pages"
```

- [ ] **Step 5: Create or connect the public GitHub repository**

Run read-only checks first:

```bash
gh auth status
gh repo view poker-points-tutorial
```

If the repository is absent, create and push it:

```bash
gh repo create poker-points-tutorial --public --source=. --remote=origin --push
```

If it already exists and belongs to the authenticated user, connect and push:

```bash
remote_url=$(gh repo view poker-points-tutorial --json sshUrl --jq .sshUrl)
git remote add origin "$remote_url"
git push -u origin main
```

The `sshUrl` query resolves the authenticated owner's exact repository URL; never construct the owner name from memory.

- [ ] **Step 6: Verify deployment and enable Pages only if needed**

Run:

```bash
gh run list --workflow "Deploy tutorial to Pages" --limit 1
run_id=$(gh run list --workflow "Deploy tutorial to Pages" --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$run_id" --exit-status
gh api repos/{owner}/{repo}/pages
```

If the Pages API returns 404 after the workflow exists, initialize Pages with workflow mode:

```bash
gh api --method POST repos/{owner}/{repo}/pages -f build_type=workflow
git commit --allow-empty -m "ci: trigger initial Pages deployment"
git push
run_id=$(gh run list --workflow "Deploy tutorial to Pages" --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$run_id" --exit-status
```

Expected: the workflow concludes `success` and the Pages API returns an `html_url`.

- [ ] **Step 7: Verify the live site**

Open the exact `html_url` returned by the API and verify:

- home page typography and CTA;
- direct refresh on `/start/table-rules` and `/start/first-hand`;
- all SVGCards load from the project domain;
- play, pause, step, and restart work;
- mobile layout does not scroll horizontally;
- browser console has no errors.

- [ ] **Step 8: Synchronize the published commit to the Desktop folder**

Create `/Users/yaoyaoling/Desktop/德州扑克积分桌入门` only after validating that exact target path. Synchronize the repository while excluding generated dependencies and build caches:

```bash
rsync -a --delete --exclude node_modules --exclude .vitepress/cache --exclude .vitepress/dist ./ /Users/yaoyaoling/Desktop/德州扑克积分桌入门/
```

Then verify both locations resolve to the same commit:

```bash
git rev-parse HEAD
git -C /Users/yaoyaoling/Desktop/德州扑克积分桌入门 rev-parse HEAD
```

Expected: both hashes match the commit deployed by GitHub Pages.

---

## Final Verification for This Slice

Run from the project root:

```bash
npm run check
npm run build
npm run test:e2e
git status --short
git log --oneline -10
```

This slice is complete only when:

- the working tree is clean;
- the home, rules, and complete-hand pages are real content rather than placeholders;
- the first hand reaches a 500-point showdown with consistent stacks;
- cards are local SVGCards assets;
- reduced motion and keyboard controls work;
- the public Pages URL passes direct-route and console checks;
- the Desktop copy matches the deployed commit.

The next implementation plan begins with hand rankings, action order, stacks/pot/effective-stack drills, and the linked glossary. It should reuse the engine and components from this slice instead of expanding `FullHandDemo.vue` into a general-purpose rules engine.
