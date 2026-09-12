# Phase 1：牌型与最佳五张实施计划

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Follow superpowers:test-driven-development for every production change and superpowers:verification-before-completion before reporting the phase complete.

**Goal:** 把教程入口改为“先会比大小”，将现有混在一页的内容拆成第 1 章牌型顺序和第 2 章最佳五张，并各自加入一个可操作、可验证的扑克练习。

**Architecture:** VitePress 继续负责章节路由与导航；Markdown 负责教学叙事；两个小型 Vue 组件负责“先作答、再揭晓”。复用现有 `PlayingCard.vue` 和 SVGCards 资产，不引入新依赖。内容规则在构建前阻止禁用表述，Playwright 覆盖真实页面流程和窄屏布局。

**Tech Stack:** VitePress、Vue 3 Composition API、TypeScript、Vitest、Vue Test Utils、Playwright、CSS。

---

## Task 1：让写作规范可以自动拦截套话

**Files:**

- Modify: `scripts/content-rules.mjs`
- Modify: `tests/content/content-rules.test.ts`

### Step 1：先写失败测试

把 `tests/content/content-rules.test.ts` 的禁用表述用例补成：

```ts
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
```

### Step 2：运行测试，确认新增三项失败

Run:

```bash
npx vitest run tests/content/content-rules.test.ts
```

Expected: `本章将`、`至关重要`、`不难发现` 三个 case 失败，因为当前规则还未收录。

### Step 3：补齐规则

在 `scripts/content-rules.mjs` 的 `TEMPLATE_PATTERNS` 中加入：

```js
  /本章将/u,
  /至关重要/u,
  /不难发现/u
```

保留现有规则，不改 `site/` 以外的扫描边界。

### Step 4：运行测试

Run:

```bash
npx vitest run tests/content/content-rules.test.ts
```

Expected: PASS。

### Step 5：提交

```bash
git add scripts/content-rules.mjs tests/content/content-rules.test.ts
git commit -m "test: enforce tutorial writing voice"
```

## Task 2：拆开两章并把“比大小”放到课程最前面

**Files:**

- Modify: `tests/config/site-config.test.ts`
- Modify: `tests/content/curriculum.test.ts`
- Modify: `site/.vitepress/config.mts`
- Modify: `site/basics/hand-rankings.md`
- Create: `site/basics/best-five.md`

### Step 1：先锁定新导航顺序

把 `tests/config/site-config.test.ts` 中的期望路由改成：

```ts
    expect(links).toEqual([
      '/basics/hand-rankings',
      '/basics/best-five',
      '/start/first-hand',
      '/basics/action-order',
      '/start/table-rules',
      '/math/outs',
      '/math/pot-odds',
      '/strategy/bet-purpose',
      '/strategy/deep-stacks',
      '/quick-reference',
      '/glossary',
      '/resources'
    ])
```

同时把取值写清楚，避免用 `JSON.stringify(...).toContain(...)` 掩盖重复路由：

```ts
function sidebarLinks() {
  const sidebar = siteConfig.themeConfig?.sidebar
  if (!Array.isArray(sidebar)) return []
  return sidebar.flatMap((group) => 'items' in group && Array.isArray(group.items)
    ? group.items.map((item) => item.link)
    : [])
}
```

测试体内使用：

```ts
const links = sidebarLinks()
```

### Step 2：先锁定章节职责

在 `tests/content/curriculum.test.ts`：

1. 将 `/basics/best-five` 加入 `lessonRoutes`。
2. 新增测试：

```ts
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
```

### Step 3：运行测试，确认失败

Run:

```bash
npx vitest run tests/config/site-config.test.ts tests/content/curriculum.test.ts
```

Expected: FAIL，因为新路由与组件引用尚不存在。

### Step 4：建立临时可构建的两章

先将 `site/basics/hand-rankings.md` 改成以下骨架，组件在后续任务实现：

```md
---
title: 牌型从大到小
description: 用十手真牌认清牌型顺序，并学会比较同一牌型。
---

# 先别下注：这两手谁大？

公共牌是 9♠ 8♠ 7♦ 2♣ 2♥。你拿 10♣6♣，对手拿 A♠K♠。

先停三秒。你有 10 高顺子，对手只有一对 2。两张黑桃不够组成同花，所以这一手你赢。

## 先记住顺序

<div class="pp-memory-rhyme">
  <strong>四葫花顺三二一</strong>
  <span>四条 ＞ 葫芦 ＞ 同花 ＞ 顺子 ＞ 三条 ＞ 两对 ＞ 一对</span>
</div>

口诀上面还有同花顺，下面还有高牌。皇家同花顺只是最高的一副同花顺。

<ClientOnly>
  <HandRanks />
</ClientOnly>

## 同一种牌型，再往里比

- 一对：先比对子，再依次比三张踢脚。
- 两对：先比大对，再比小对，最后比踢脚。
- 三条：先比三条，再依次比两张踢脚。
- 顺子：只比最高张；A-2-3-4-5 的最高张按 5 算。
- 同花：从最大一张开始逐张比。
- 葫芦：先比三条，再比对子。
- 四条：先比四条，再比踢脚。

花色本身不分高低。同一手德州里，两位玩家不可能分别拿着不同花色的同花比较：五张公共牌无法同时提供两组不同花色所需的公共牌。若两人都有同花，他们用的是同一种花色，从最高张开始比。

<ClientOnly>
  <RankOrderQuiz />
</ClientOnly>

下一章不再背牌型。我们会把七张牌摊开，亲手挑出真正参与比较的五张。
```

建立 `site/basics/best-five.md`：

```md
---
title: 七张牌，只选五张
description: 从两张底牌与五张公共牌中，找出唯一参与比较的最佳五张。
---

# 七张都看见了，只有五张能上场

你拿 A♠K♦，公共牌是 A♣ 9♦ 7♠ 4♥ 2♣。你当然有一对 A，但最终比较的五张到底是哪五张？先自己点一次。

<ClientOnly>
  <BestFiveChallenge />
</ClientOnly>

## 永远只选最好的五张

两张底牌加五张公共牌，一共有七张候选牌。摊牌时，每个人都只交出其中最好的五张。

- 有时两张底牌都要用。
- 有时只用一张，例如牌面四张红桃，手里的红桃决定同花大小。
- 有时一张也不用，五张公共牌就是所有人的最终牌。

这条规则会制造三种常见错觉：把“三对”当成新牌型、把第六张踢脚也算进去、觉得自己的口袋对子一定能打破公共牌平局。

<ClientOnly>
  <HandCompareExamples />
</ClientOnly>

## 每次摊牌，按同一个动作做

1. 先找出自己能组成的最高牌型。
2. 把最终五张牌逐张点出来。
3. 先比牌型主体，再比踢脚。
4. 五张完全相同就平分；花色和第六张都不能破局。

牌型大，只说明此刻摊牌时叫什么。它不保证你该下大注：下一步还要学习一手牌如何从翻前走到河牌，行动又为什么会改变判断。
```

### Step 5：修改导航

在 `site/.vitepress/config.mts`：

- 把顶部“开始”链接改成 `/basics/hand-rankings`。
- 将 sidebar 前三组改成：

```ts
      {
        text: '先会比大小',
        items: [
          { text: '牌型从大到小', link: '/basics/hand-rankings' },
          { text: '七张牌，只选五张', link: '/basics/best-five' }
        ]
      },
      {
        text: '看懂一手牌',
        items: [
          { text: '三分钟一手牌', link: '/start/first-hand' },
          { text: '位置与基础动作', link: '/basics/action-order' },
          { text: '积分桌规则', link: '/start/table-rules' }
        ]
      },
      {
        text: '把数字算清',
        items: [
          { text: 'Outs 与胜率', link: '/math/outs' },
          { text: '底池赔率', link: '/math/pot-odds' }
        ]
      },
```

后两组保持原状。

### Step 6：运行内容测试

Run:

```bash
npx vitest run tests/config/site-config.test.ts tests/content/curriculum.test.ts
```

Expected: 组件相关断言通过；如果构建因为组件未注册失败，留到 Task 3/4 解决，不删除测试。

### Step 7：提交

```bash
git add site/.vitepress/config.mts site/basics/hand-rankings.md site/basics/best-five.md tests/config/site-config.test.ts tests/content/curriculum.test.ts
git commit -m "docs: put hand comparison first"
```

## Task 3：加入第 1 章牌型快问

**Files:**

- Create: `src/components/lesson/RankOrderQuiz.vue`
- Create: `src/components/lesson/RankOrderQuiz.spec.ts`
- Modify: `site/.vitepress/theme/index.ts`
- Modify: `site/.vitepress/theme/styles/lessons.css`

### Step 1：写组件测试

建立 `src/components/lesson/RankOrderQuiz.spec.ts`：

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import RankOrderQuiz from './RankOrderQuiz.vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => path }))

describe('RankOrderQuiz', () => {
  it('keeps the explanation hidden until the reader answers', async () => {
    const wrapper = mount(RankOrderQuiz)

    expect(wrapper.find('[data-quiz-answer]').exists()).toBe(false)
    await wrapper.get('[data-choice="hero"]').trigger('click')

    expect(wrapper.get('[data-quiz-answer]').text()).toContain('10 高顺子')
    expect(wrapper.get('[data-choice="hero"]').attributes('aria-pressed')).toBe('true')
  })

  it('explains the missed flush when the wrong answer is chosen', async () => {
    const wrapper = mount(RankOrderQuiz)
    await wrapper.get('[data-choice="villain"]').trigger('click')
    expect(wrapper.get('[data-quiz-answer]').text()).toContain('只有四张黑桃')
  })
})
```

### Step 2：运行测试，确认失败

Run:

```bash
npx vitest run src/components/lesson/RankOrderQuiz.spec.ts
```

Expected: FAIL，模块不存在。

### Step 3：实现组件

建立 `src/components/lesson/RankOrderQuiz.vue`：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import PlayingCard from '@/components/cards/PlayingCard.vue'
import type { Card } from '@/components/cards/cardAssets'

const board: Card[] = [
  { rank: '9', suit: 's' }, { rank: '8', suit: 's' }, { rank: '7', suit: 'd' },
  { rank: '2', suit: 'c' }, { rank: '2', suit: 'h' }
]
const hero: Card[] = [{ rank: '10', suit: 'c' }, { rank: '6', suit: 'c' }]
const villain: Card[] = [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 's' }]
const answer = ref<'hero' | 'villain' | 'tie' | null>(null)
</script>

<template>
  <section class="pp-mini-quiz" aria-labelledby="rank-quiz-title">
    <header>
      <small>先猜，再看答案</small>
      <h2 id="rank-quiz-title">谁赢？</h2>
    </header>
    <div class="pp-quiz-board" aria-label="公共牌">
      <PlayingCard v-for="card in board" :key="`${card.rank}${card.suit}`" :card="card" size="board" />
    </div>
    <div class="pp-quiz-hands">
      <button data-choice="hero" :aria-pressed="answer === 'hero'" @click="answer = 'hero'">
        <span>你：10♣6♣</span><span class="pp-card-pair"><PlayingCard v-for="card in hero" :key="`${card.rank}${card.suit}`" :card="card" size="board" /></span>
      </button>
      <button data-choice="villain" :aria-pressed="answer === 'villain'" @click="answer = 'villain'">
        <span>对手：A♠K♠</span><span class="pp-card-pair"><PlayingCard v-for="card in villain" :key="`${card.rank}${card.suit}`" :card="card" size="board" /></span>
      </button>
      <button data-choice="tie" :aria-pressed="answer === 'tie'" @click="answer = 'tie'">平分</button>
    </div>
    <p v-if="answer" class="pp-quiz-answer" data-quiz-answer role="status">
      <strong>{{ answer === 'hero' ? '答对了。' : '再数一次。' }}</strong>
      你用 10、9、8、7、6 组成 10 高顺子。对手连同公共牌只有四张黑桃，没有同花，最终只是一对 2。
    </p>
  </section>
</template>
```

### Step 4：注册组件

在 `site/.vitepress/theme/index.ts` 添加 import：

```ts
import RankOrderQuiz from '@/components/lesson/RankOrderQuiz.vue'
```

并在 `enhanceApp` 添加：

```ts
app.component('RankOrderQuiz', RankOrderQuiz)
```

### Step 5：补样式

在 `site/.vitepress/theme/styles/lessons.css` 增加：

```css
.pp-mini-quiz { margin: 32px 0; padding: clamp(20px, 4vw, 32px); color: var(--pp-white); background: #173f34; }
.pp-mini-quiz header small { color: var(--pp-brass); font-weight: 800; }
.pp-mini-quiz header h2 { margin: 6px 0 20px; border: 0; color: var(--pp-white); }
.pp-quiz-board { display: flex; gap: 6px; }
.pp-quiz-board .pp-playing-card--board { width: 58px; height: 81px; }
.pp-quiz-hands { display: grid; margin-top: 22px; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.pp-quiz-hands button { display: flex; min-height: 110px; padding: 14px; border: 1px solid rgba(255,255,255,.25); color: var(--pp-white); background: rgba(255,255,255,.04); align-items: center; justify-content: space-between; gap: 12px; cursor: pointer; }
.pp-quiz-hands button[aria-pressed="true"] { border-color: var(--pp-brass); box-shadow: 0 0 0 2px var(--pp-brass); }
.pp-quiz-hands .pp-playing-card--board { width: 42px; height: 59px; }
.pp-quiz-answer { margin: 18px 0 0; padding: 18px; border-left: 4px solid var(--pp-brass); background: rgba(255,255,255,.08); }
.pp-quiz-answer strong { color: var(--pp-brass); }
```

在现有 `@media (max-width: 620px)` 中增加：

```css
  .pp-quiz-board .pp-playing-card--board { width: min(47px, 15vw); height: auto; aspect-ratio: 223 / 312; }
  .pp-quiz-hands { grid-template-columns: 1fr; }
```

### Step 6：运行测试与构建

Run:

```bash
npx vitest run src/components/lesson/RankOrderQuiz.spec.ts
npm run build
```

Expected: PASS，且 VitePress 能解析 `<RankOrderQuiz />`。

### Step 7：提交

```bash
git add src/components/lesson/RankOrderQuiz.vue src/components/lesson/RankOrderQuiz.spec.ts site/.vitepress/theme/index.ts site/.vitepress/theme/styles/lessons.css
git commit -m "feat: add hand-ranking quick quiz"
```

## Task 4：加入第 2 章“从七张里选五张”互动题

**Files:**

- Create: `src/components/lesson/BestFiveChallenge.vue`
- Create: `src/components/lesson/BestFiveChallenge.spec.ts`
- Create: `src/components/lesson/HandCompareExamples.spec.ts`
- Modify: `site/.vitepress/theme/index.ts`
- Modify: `site/.vitepress/theme/styles/lessons.css`

### Step 1：写选择行为测试

建立 `src/components/lesson/BestFiveChallenge.spec.ts`：

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import BestFiveChallenge from './BestFiveChallenge.vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => path }))

describe('BestFiveChallenge', () => {
  it('requires exactly five cards before checking', async () => {
    const wrapper = mount(BestFiveChallenge)
    expect(wrapper.get('[data-check-best-five]').attributes('disabled')).toBeDefined()

    for (const id of ['as', 'kd', 'ac', '9d', '7s']) {
      await wrapper.get(`[data-select-card="${id}"]`).trigger('click')
    }

    expect(wrapper.get('[data-check-best-five]').attributes('disabled')).toBeUndefined()
    await wrapper.get('[data-check-best-five]').trigger('click')
    expect(wrapper.get('[data-best-five-answer]').text()).toContain('一对 A，K、9、7 踢脚')
  })

  it('never allows a sixth selected card', async () => {
    const wrapper = mount(BestFiveChallenge)
    for (const id of ['as', 'kd', 'ac', '9d', '7s', '4h']) {
      await wrapper.get(`[data-select-card="${id}"]`).trigger('click')
    }
    expect(wrapper.findAll('[aria-pressed="true"]')).toHaveLength(5)
  })

  it('can reset the attempt', async () => {
    const wrapper = mount(BestFiveChallenge)
    await wrapper.get('[data-select-card="as"]').trigger('click')
    await wrapper.get('[data-reset-best-five]').trigger('click')
    expect(wrapper.findAll('[aria-pressed="true"]')).toHaveLength(0)
  })
})
```

### Step 2：锁定四个误判例子

建立 `src/components/lesson/HandCompareExamples.spec.ts`：

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import HandCompareExamples from './HandCompareExamples.vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => path }))

describe('HandCompareExamples', () => {
  it('covers three pairs, a four-flush board, kickers, and the board playing', () => {
    const wrapper = mount(HandCompareExamples)
    expect(wrapper.findAll('[data-comparison-case]')).toHaveLength(4)
    expect(wrapper.text()).toContain('牌型表里没有“三对”')
    expect(wrapper.text()).toContain('牌面四张红桃')
    expect(wrapper.text()).toContain('K 踢脚，赢')
    expect(wrapper.text()).toContain('公共牌顺子，平分')
  })
})
```

### Step 3：运行测试，确认新组件失败

Run:

```bash
npx vitest run src/components/lesson/BestFiveChallenge.spec.ts src/components/lesson/HandCompareExamples.spec.ts
```

Expected: `BestFiveChallenge` 模块不存在而失败；`HandCompareExamples` 通过。

### Step 4：实现选择组件

建立 `src/components/lesson/BestFiveChallenge.vue`：

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import PlayingCard from '@/components/cards/PlayingCard.vue'
import type { Card } from '@/components/cards/cardAssets'

interface Candidate { id: string; card: Card; source: '底牌' | '公共牌' }

const cards: Candidate[] = [
  { id: 'as', card: { rank: 'A', suit: 's' }, source: '底牌' },
  { id: 'kd', card: { rank: 'K', suit: 'd' }, source: '底牌' },
  { id: 'ac', card: { rank: 'A', suit: 'c' }, source: '公共牌' },
  { id: '9d', card: { rank: '9', suit: 'd' }, source: '公共牌' },
  { id: '7s', card: { rank: '7', suit: 's' }, source: '公共牌' },
  { id: '4h', card: { rank: '4', suit: 'h' }, source: '公共牌' },
  { id: '2c', card: { rank: '2', suit: 'c' }, source: '公共牌' }
]
const correct = new Set(['as', 'kd', 'ac', '9d', '7s'])
const selected = ref<string[]>([])
const checked = ref(false)
const isCorrect = computed(() => selected.value.length === 5 && selected.value.every((id) => correct.has(id)))

function toggle(id: string) {
  checked.value = false
  if (selected.value.includes(id)) {
    selected.value = selected.value.filter((cardId) => cardId !== id)
  } else if (selected.value.length < 5) {
    selected.value = [...selected.value, id]
  }
}

function reset() {
  selected.value = []
  checked.value = false
}
</script>

<template>
  <section class="pp-best-five" aria-labelledby="best-five-title">
    <header>
      <small>动手题</small>
      <h2 id="best-five-title">点出最终参加比较的五张牌</h2>
      <p>已经选了 {{ selected.length }} / 5 张</p>
    </header>
    <div class="pp-best-five-cards">
      <button
        v-for="candidate in cards"
        :key="candidate.id"
        :data-select-card="candidate.id"
        :aria-pressed="selected.includes(candidate.id)"
        :aria-label="`${candidate.source} ${candidate.card.rank}${candidate.card.suit}`"
        @click="toggle(candidate.id)"
      >
        <small>{{ candidate.source }}</small>
        <PlayingCard :card="candidate.card" size="teaching" />
      </button>
    </div>
    <div class="pp-best-five-actions">
      <button data-check-best-five :disabled="selected.length !== 5" @click="checked = true">检查答案</button>
      <button data-reset-best-five @click="reset">重新选</button>
    </div>
    <p v-if="checked" class="pp-best-five-answer" data-best-five-answer role="status">
      <strong>{{ isCorrect ? '选对了。' : '还差一步。' }}</strong>
      最好的五张是 A♠ A♣ K♦ 9♦ 7♠：一对 A，K、9、7 踢脚。4♥ 和 2♣ 都排在第六张以后。
    </p>
  </section>
</template>
```

### Step 5：注册组件

在 `site/.vitepress/theme/index.ts` 添加：

```ts
import BestFiveChallenge from '@/components/lesson/BestFiveChallenge.vue'
```

并在 `enhanceApp` 中添加：

```ts
app.component('BestFiveChallenge', BestFiveChallenge)
```

### Step 6：补样式

在 `site/.vitepress/theme/styles/lessons.css` 添加：

```css
.pp-best-five { margin: 30px 0; padding: clamp(20px, 4vw, 32px); border: 1px solid rgba(23,33,30,.18); background: #f8f5ed; }
.pp-best-five header h2 { margin: 5px 0 8px; border: 0; }
.pp-best-five header small { color: var(--pp-red); font-weight: 800; }
.pp-best-five header p { margin: 0; color: var(--pp-ink-soft); }
.pp-best-five-cards { display: grid; margin: 24px 0; grid-template-columns: repeat(7, minmax(62px, 1fr)); gap: 8px; }
.pp-best-five-cards button { min-width: 0; padding: 8px 4px; border: 1px solid transparent; background: transparent; cursor: pointer; }
.pp-best-five-cards button small { display: block; margin-bottom: 5px; color: var(--pp-ink-soft); }
.pp-best-five-cards button[aria-pressed="true"] { border-color: var(--pp-red); background: rgba(172,50,42,.08); box-shadow: 0 0 0 2px rgba(172,50,42,.18); transform: translateY(-5px); }
.pp-best-five-cards .pp-playing-card--teaching { width: 100%; }
.pp-best-five-actions { display: flex; gap: 10px; }
.pp-best-five-actions button { padding: 10px 15px; border: 1px solid var(--pp-ink); background: transparent; cursor: pointer; font-weight: 800; }
.pp-best-five-actions button:first-child { color: var(--pp-white); background: var(--pp-ink); }
.pp-best-five-actions button:disabled { cursor: not-allowed; opacity: .42; }
.pp-best-five-answer { margin: 18px 0 0; padding: 18px; border-left: 4px solid var(--pp-red); background: var(--pp-white); }
.pp-best-five-answer strong { color: var(--pp-red); }
```

在 `@media (max-width: 620px)` 中增加：

```css
  .pp-best-five-cards { display: flex; overflow-x: auto; padding: 8px 2px 12px; scroll-snap-type: x mandatory; }
  .pp-best-five-cards button { min-width: 86px; scroll-snap-align: start; }
```

在 `@media (prefers-reduced-motion: reduce)` 中增加：

```css
  .pp-best-five-cards button { transition: none; }
```

### Step 7：运行组件测试与构建

Run:

```bash
npx vitest run src/components/lesson/BestFiveChallenge.spec.ts src/components/lesson/HandCompareExamples.spec.ts
npm run build
```

Expected: PASS。

### Step 8：提交

```bash
git add src/components/lesson/BestFiveChallenge.vue src/components/lesson/BestFiveChallenge.spec.ts src/components/lesson/HandCompareExamples.spec.ts site/.vitepress/theme/index.ts site/.vitepress/theme/styles/lessons.css
git commit -m "feat: add best-five card challenge"
```

## Task 5：逐章审稿并留下可复核记录

**Files:**

- Create: `docs/editorial/reviews/basics-hand-rankings.md`
- Create: `docs/editorial/reviews/basics-best-five.md`
- Modify: `site/basics/hand-rankings.md`
- Modify: `site/basics/best-five.md`

### Step 1：按同一模板建立两份记录

每份文件都使用以下字段，并填写具体内容，不写“待补”：

```md
# 章节审稿：<章节名>

- 路由：`<route>`
- 开场问题：<读者先判断什么>
- 本章唯一主规则：<一句话>
- 图示作用：<图让读者看清什么>
- 计算或比较过程：<是否完整展开>
- 常见误判：<本章纠正什么>
- 练习与反馈：<互动如何给出解释>
- 下一章连接：<为什么继续读>
- 积分措辞检查：通过
- 套话检查：通过
- 数学/规则复核：<逐项列出验证结果>
- 移动端检查：<视口与结果>
```

`basics-hand-rankings.md` 的主规则写“先比牌型；牌型相同，再从决定牌力的最高部分依次比较”。

`basics-best-five.md` 的主规则写“七张候选牌只取最好的五张，第六张不能参与比较”。

### Step 2：按 `WRITING_STYLE.md` 人工朗读两章

逐段检查并直接修正文稿：

- 开头 120 字内出现具体牌面和问题。
- 每段只完成一个判断。
- 删除“显然、简单、只要记住”等替读者下结论的词。
- 所有“赢/输”都有五张牌依据。
- 不出现未解释的英文缩写。
- 两章结尾都只预告紧接着的一章。

### Step 3：运行内容检查

Run:

```bash
npm run check:content
npx vitest run tests/content/curriculum.test.ts
```

Expected: PASS。

### Step 4：提交

```bash
git add site/basics/hand-rankings.md site/basics/best-five.md docs/editorial/reviews/basics-hand-rankings.md docs/editorial/reviews/basics-best-five.md
git commit -m "docs: review opening comparison chapters"
```

## Task 6：真实浏览器回归与 Phase 1 验收

**Files:**

- Modify: `tests/e2e/curriculum.spec.ts`

### Step 1：先改端到端测试

把 `tests/e2e/curriculum.spec.ts` 第一个测试替换为：

```ts
test('the first two chapters teach ranking then best five', async ({ page }) => {
  await page.goto('/basics/hand-rankings')
  await expect(page.locator('[data-hand-rank]')).toHaveCount(10)
  await expect(page.getByText('四葫花顺三二一')).toBeVisible()
  await expect(page.locator('[data-quiz-answer]')).toHaveCount(0)
  await page.locator('[data-choice="hero"]').click()
  await expect(page.locator('[data-quiz-answer]')).toContainText('10 高顺子')

  await page.goto('/basics/best-five')
  await expect(page.locator('[data-comparison-case]')).toHaveCount(4)
  for (const id of ['as', 'kd', 'ac', '9d', '7s']) {
    await page.locator(`[data-select-card="${id}"]`).click()
  }
  await page.locator('[data-check-best-five]').click()
  await expect(page.locator('[data-best-five-answer]')).toContainText('选对了')

  const pageWidth = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth
  }))
  expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client)
})
```

保留赔率实验室、下注练习和资源链接的现有回归，但将原来针对旧牌型单页的重复断言删除。

再加一个窄屏测试：

```ts
test('best-five exercise stays usable on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/basics/best-five')
  await expect(page.locator('[data-select-card]')).toHaveCount(7)
  await page.locator('[data-select-card="as"]').click()
  await expect(page.locator('[data-select-card="as"]')).toHaveAttribute('aria-pressed', 'true')

  const pageWidth = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth
  }))
  expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client)
})
```

### Step 2：运行 e2e，修复任何真实失败

Run:

```bash
npm run test:e2e -- tests/e2e/curriculum.spec.ts
```

Expected: PASS。若 selector、可访问名称或窄屏布局失败，只修产品代码，不放宽核心断言。

### Step 3：运行完整质量门

Run:

```bash
npm run check
npm run build
npm run test:e2e
git status --short
```

Expected:

- 所有 Vitest 测试通过。
- VitePress 构建成功。
- 所有 Playwright 桌面/移动端测试通过。
- `git status --short` 只显示计划内尚未提交的文件，或为空。

### Step 4：提交回归测试

```bash
git add tests/e2e/curriculum.spec.ts
git commit -m "test: cover comparison course opening"
```

### Step 5：完成 Phase 1 后的复核

再次运行：

```bash
git log --oneline -6
npm run check
npm run build
npm run test:e2e
```

把最终通过的测试数量、两条页面路由和待进入的 Phase 2 记录到执行结果中。不要在本阶段改动 Phase 2 的位置、动作或筹码正文。
