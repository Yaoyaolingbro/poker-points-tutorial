# Remaining Texas Hold'em Curriculum Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete chapters 3–15, including four-position animations, stack and action labs, a 169-hand preflop matrix, reproducible flop/equity probabilities, postflop combo-draw guidance, EV, betting purpose, deep stacks, and source documentation.

**Architecture:** Keep VitePress for narrative and routing, Vue for focused interactive teaching, and committed static JSON for probability data. Put card evaluation and probability logic in pure modules so both the generator and Vitest can verify every displayed number. Preserve the existing SVGCards assets and table-ledger visual language.

**Tech Stack:** VitePress 1.6.4, Vue 3.5, TypeScript 5.7, Node 22, Vitest, Vue Test Utils, Playwright, local SVGCards, GitHub Pages.

---

## File map

Create these pure data modules:

- `src/lib/poker/deck.ts`: numeric deck, rank/suit conversion, seeded random generator.
- `src/lib/poker/evaluator.ts`: five-to-seven-card score and comparison.
- `src/lib/probability/preflop.ts`: 169 labels, representative cards, combo counts and occurrence rates.
- `src/lib/probability/flop.ts`: exact 19,600-flop enumeration and draw flags.
- `src/lib/probability/outs.ts`: one-card and two-card hit formulas.
- `src/data/probability/flop-outcomes.json`: generated exact flop data for all 169 classes.
- `src/data/probability/equity.json`: generated win, tie and equity for 1–7 random opponents.
- `src/data/probability/meta.json`: trials, seed, evaluator version and generation timestamp.
- `scripts/generate-probability-data.mts`: deterministic generator entry point.

Create these Vue components:

- `src/components/lesson/PositionOrbit.vue`
- `src/components/lesson/ActionPotDemo.vue`
- `src/components/labs/StackDepthLab.vue`
- `src/components/labs/StartingHandMatrix.vue`
- `src/components/labs/FlopOutcomeExplorer.vue`
- `src/components/labs/EquityExplorer.vue`
- `src/components/labs/PreflopPlan.vue`
- `src/components/labs/OutsExplorer.vue`
- `src/components/labs/EVRepeatChart.vue`

Create or rewrite these pages:

- `site/start/first-hand.md`
- `site/basics/positions.md`
- `site/basics/actions.md`
- `site/basics/stack-depth.md`
- `site/preflop/starting-hands.md`
- `site/preflop/flop-outcomes.md`
- `site/preflop/equity.md`
- `site/preflop/first-plan.md`
- `site/math/outs.md`
- `site/math/pot-odds.md`
- `site/math/ev.md`
- `site/strategy/bet-purpose.md`
- `site/strategy/deep-stacks.md`
- `site/quick-reference.md`
- `site/glossary.md`
- `site/resources.md`
- `site/sources.md`

## Task 1: Build and verify the poker evaluator

**Files:**

- Create: `src/lib/poker/deck.ts`
- Create: `src/lib/poker/evaluator.ts`
- Create: `src/lib/poker/evaluator.spec.ts`

- [ ] **Step 1: Write the failing evaluator tests**

Use numeric card ids `rankIndex * 4 + suitIndex`, with ranks 2–14 and suits 0–3. The test must contain these assertions:

```ts
expect(category(scoreCards(ids('As Ks Qs Js Ts 2d 3c')))).toBe('同花顺')
expect(compare(ids('As Ad Kc 9d 7s 4h 2c'), ids('Ah Ac Qs 9d 7s 4h 2c'))).toBeGreaterThan(0)
expect(compare(ids('As Kh Qd Jc Ts 9c 9d'), ids('As Kh Qd Jc Ts 4c 4d'))).toBe(0)
expect(category(scoreCards(ids('As Ad Ac Ks Kd 2c 3h')))).toBe('葫芦')
expect(category(scoreCards(ids('As 2d 3c 4h 5s 9d Tc')))).toBe('顺子')
```

- [ ] **Step 2: Run the test and observe the missing-module failure**

Run: `npx vitest run src/lib/poker/evaluator.spec.ts`

Expected: FAIL because `evaluator.ts` does not exist.

- [ ] **Step 3: Implement a packed lexicographic score**

Export this public interface:

```ts
export type HandCategory = '高牌' | '一对' | '两对' | '三条' | '顺子' | '同花' | '葫芦' | '四条' | '同花顺'
export interface HandScore { value: number; category: HandCategory; kickers: number[] }
export function scoreCards(cards: readonly number[]): HandScore
export function compareHands(left: readonly number[], right: readonly number[]): number
```

Pack `categoryIndex` followed by five base-15 kicker digits. Detect in this order: straight flush, quads, full house, flush, straight, trips, two pair, pair, high card. Treat A-2-3-4-5 as five-high.

- [ ] **Step 4: Run evaluator tests**

Run: `npx vitest run src/lib/poker/evaluator.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/poker
git commit -m "feat: add deterministic poker evaluator"
```

## Task 2: Generate all preflop and flop probability data

**Files:**

- Create: `src/lib/probability/preflop.ts`
- Create: `src/lib/probability/flop.ts`
- Create: `src/lib/probability/outs.ts`
- Create: `src/lib/probability/probability.spec.ts`
- Create: `scripts/generate-probability-data.mts`
- Create: `src/data/probability/flop-outcomes.json`
- Create: `src/data/probability/equity.json`
- Create: `src/data/probability/meta.json`
- Modify: `package.json`

- [ ] **Step 1: Write probability anchor tests**

```ts
expect(startingHands()).toHaveLength(169)
expect(startingHands().reduce((sum, hand) => sum + hand.combos, 0)).toBe(1326)
expect(startingHand('AA').combos).toBe(6)
expect(startingHand('AKs').combos).toBe(4)
expect(startingHand('AKo').combos).toBe(12)
expect(probabilityAnyPair()).toBeCloseTo(78 / 1326, 12)
expect(probabilitySpecificPair()).toBeCloseTo(6 / 1326, 12)
expect(hitByNextCard(9, 47)).toBeCloseTo(9 / 47, 12)
expect(hitByRiver(9, 47)).toBeCloseTo(1 - (38 / 47) * (37 / 46), 12)
expect(enumerateFlops('AKs').total).toBe(19600)
expect(Object.values(enumerateFlops('AKs').made).reduce((a, b) => a + b, 0)).toBe(19600)
```

- [ ] **Step 2: Run the test and observe missing exports**

Run: `npx vitest run src/lib/probability/probability.spec.ts`

Expected: FAIL with missing module or export errors.

- [ ] **Step 3: Implement 169 labels and exact flop enumeration**

Use rank order `A K Q J T 9 8 7 6 5 4 3 2`. Diagonal cells are pairs, upper-triangle cells are suited, and lower-triangle cells are offsuit. The result shape is:

```ts
export interface StartingHandInfo {
  id: string
  high: string
  low: string
  kind: 'pair' | 'suited' | 'offsuit'
  combos: 6 | 4 | 12
  probability: number
  cards: [number, number]
}

export interface FlopOutcome {
  total: 19600
  made: Record<HandCategory, number>
  draws: {
    flushDraw: number
    openEnded: number
    gutshot: number
    pairPlusFlushDraw: number
    pairPlusStraightDraw: number
  }
}
```

For each representative hand, enumerate every `i < j < k` combination from the remaining 50 cards. Draw counts may overlap; made-hand counts must partition all 19,600 flops.

- [ ] **Step 4: Implement deterministic equity generation**

Use xorshift32 with seed `20260912`. For every hand class and opponent count 1–7, deal random disjoint opponent cards and five board cards, compare all final hands, and accumulate:

```ts
export interface EquityPoint {
  opponents: number
  trials: 100000
  win: number
  tie: number
  equity: number
}
```

`equity` adds `1 / tiedPlayers` when hero ties for best. Store rates as decimals rounded to six places. The generator must reject any point with fewer than 100,000 trials.

- [ ] **Step 5: Add the generation command**

Add to `package.json`:

```json
"generate:probability": "node --experimental-strip-types scripts/generate-probability-data.mts"
```

- [ ] **Step 6: Generate and inspect the data**

Run: `npm run generate:probability`

Expected: 169 flop records, 169 equity records with seven points each, and metadata containing seed `20260912`, trials `100000`, and evaluator version `1`.

- [ ] **Step 7: Verify strength anchors**

Add assertions after generation:

```ts
expect(equity.AA['1'].equity).toBeGreaterThan(equity.KK['1'].equity)
expect(equity.KK['1'].equity).toBeGreaterThan(equity.QQ['1'].equity)
expect(equity.AKs['1'].equity).toBeGreaterThan(equity.AKo['1'].equity)
expect(equity.AA['7'].equity).toBeLessThan(equity.AA['1'].equity)
```

Run: `npx vitest run src/lib/probability/probability.spec.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add package.json scripts/generate-probability-data.mts src/lib/probability src/data/probability
git commit -m "feat: generate reproducible poker probabilities"
```

## Task 3: Complete chapters 3–6 and their visual lessons

**Files:**

- Create: `src/components/lesson/PositionOrbit.vue`
- Create: `src/components/lesson/PositionOrbit.spec.ts`
- Create: `src/components/lesson/ActionPotDemo.vue`
- Create: `src/components/lesson/ActionPotDemo.spec.ts`
- Create: `src/components/labs/StackDepthLab.vue`
- Create: `src/components/labs/StackDepthLab.spec.ts`
- Rewrite: `site/start/first-hand.md`
- Create: `site/basics/positions.md`
- Create: `site/basics/actions.md`
- Create: `site/basics/stack-depth.md`
- Modify: `site/.vitepress/theme/index.ts`
- Modify: `site/.vitepress/theme/styles/lessons.css`

- [ ] **Step 1: Write component behavior tests**

Assert that `PositionOrbit` defaults to six seats, exposes 5–8 players, labels only BTN/SB/BB/UTG plus “中间位置”, and changes action order between preflop and postflop. Assert that `ActionPotDemo` disables check after a bet and shows “再补 40” for BB facing 60. Assert that `StackDepthLab` returns `min(hero, villain) / 20` BB.

- [ ] **Step 2: Run the three component tests and observe failures**

Run: `npx vitest run src/components/lesson/PositionOrbit.spec.ts src/components/lesson/ActionPotDemo.spec.ts src/components/labs/StackDepthLab.spec.ts`

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement focused controls**

Use these public controls:

```ts
// PositionOrbit: refs for playerCount 5..8, street 'preflop' | 'postflop', currentStep
// ActionPotDemo: scenario 'open' | 'facing-bet', action 'fold' | 'check' | 'call' | 'bet' | 'raise'
// StackDepthLab: heroPoints 400..5000, villainPoints 400..5000, bigBlind fixed at 20
```

Keep motion user-triggered. Provide previous/next step buttons and `aria-live="polite"` explanations.

- [ ] **Step 4: Write the four chapters**

Use these single teaching goals:

- `/start/first-hand`: identify the four streets and watch points enter the pot; retain the existing adjustable floating animation.
- `/basics/positions`: remember BTN, SB, BB and UTG; call every other seat “中间位置”.
- `/basics/actions`: distinguish fold, check, call, bet and raise; include the between-hand add-points rule.
- `/basics/stack-depth`: convert points to BB and use the smaller stack as effective stack.

Each page must start with a concrete 10/20, 2000-point scene, contain its component, ask one transfer question, and end with one sentence leading to the next route.

- [ ] **Step 5: Register components and add responsive styles**

Use the existing green felt only inside `.pp-position-orbit` and `.pp-action-pot`. Use a vertical brass measuring rule for `.pp-stack-depth`. At widths below 620px, controls stack vertically and the table stays within the viewport.

- [ ] **Step 6: Verify chapters 3–6**

Run: `npm run check && npm run build`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components site/start/first-hand.md site/basics/positions.md site/basics/actions.md site/basics/stack-depth.md site/.vitepress/theme
git commit -m "feat: teach hand flow positions actions and depth"
```

## Task 4: Build the 169-hand preflop course

**Files:**

- Create: `src/components/labs/StartingHandMatrix.vue`
- Create: `src/components/labs/StartingHandMatrix.spec.ts`
- Create: `src/components/labs/FlopOutcomeExplorer.vue`
- Create: `src/components/labs/FlopOutcomeExplorer.spec.ts`
- Create: `src/components/labs/EquityExplorer.vue`
- Create: `src/components/labs/EquityExplorer.spec.ts`
- Create: `src/components/labs/PreflopPlan.vue`
- Create: `src/components/labs/PreflopPlan.spec.ts`
- Create: `site/preflop/starting-hands.md`
- Create: `site/preflop/flop-outcomes.md`
- Create: `site/preflop/equity.md`
- Create: `site/preflop/first-plan.md`
- Modify: `site/.vitepress/theme/index.ts`
- Create: `site/.vitepress/theme/styles/preflop.css`

- [ ] **Step 1: Write matrix and data-state tests**

Assert 169 keyboard-focusable cells, default selection `AKs`, combo count 4, occurrence `4 / 1326`, and a visible legend for pair/suited/offsuit. Assert that missing JSON displays exactly `概率数据未加载`. Assert that the equity slider defaults to one opponent and accepts 1–7.

- [ ] **Step 2: Run tests and observe missing-component failures**

Run: `npx vitest run src/components/labs/StartingHandMatrix.spec.ts src/components/labs/FlopOutcomeExplorer.spec.ts src/components/labs/EquityExplorer.spec.ts src/components/labs/PreflopPlan.spec.ts`

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement the shared matrix**

`StartingHandMatrix` accepts `modelValue`, `selectable`, and an optional `states: Record<string, 'raise' | 'call' | 'fold'>`. Arrow keys move one cell, Enter selects. The details panel always says whether the cell has 4, 6 or 12 concrete combinations and its exact deal frequency.

- [ ] **Step 4: Implement outcome and equity explorers**

`FlopOutcomeExplorer` shows made-hand categories as a horizontal distribution and draw metrics as separate overlapping rows. `EquityExplorer` shows win, tie and equity separately, prefixes simulated rates with `≈`, and states “随机对手、无人弃牌、发到河牌”. Missing or incompatible metadata renders `概率数据未加载`.

- [ ] **Step 5: Implement a restrained first-plan chart**

Use four position tabs: UTG, BTN, SB and BB. For unopened pots, show a conservative raise-first study range. For facing a raise, show only “继续/弃牌” study groups and state that real ranges change with raise size and opponents. Do not label the chart GTO.

- [ ] **Step 6: Write chapters 7–10**

Include these exact probability anchors in `/preflop/starting-hands`:

- any pocket pair: `78 / 1326 = 5.88%`, about once every 17 deals;
- a specified pocket pair: `6 / 1326 = 0.45%`, about once every 221 deals;
- a specified suited nonpair class: `4 / 1326 = 0.30%`;
- a specified offsuit nonpair class: `12 / 1326 = 0.90%`.

Explain that raw all-in equity does not equal a profitable open or call. `/preflop/flop-outcomes` must distinguish “pairing a card” from “currently ahead”. `/preflop/equity` must explain opponent-count decline and ties. `/preflop/first-plan` must teach raise-first decisions, not hand rankings alone.

- [ ] **Step 7: Verify chapters 7–10**

Run: `npm run check && npm run build`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/labs site/preflop site/.vitepress/theme
git commit -m "feat: add interactive 169-hand preflop course"
```

## Task 5: Complete the postflop mathematics labs

**Files:**

- Create: `src/components/labs/OutsExplorer.vue`
- Create: `src/components/labs/OutsExplorer.spec.ts`
- Create: `src/components/labs/EVRepeatChart.vue`
- Create: `src/components/labs/EVRepeatChart.spec.ts`
- Rewrite: `site/math/outs.md`
- Rewrite: `site/math/pot-odds.md`
- Create: `site/math/ev.md`
- Modify: `site/.vitepress/theme/index.ts`
- Modify: `site/.vitepress/theme/styles/labs.css`

- [ ] **Step 1: Write exact math tests**

```ts
expect(hitByNextCard(9, 47)).toBeCloseTo(0.191489, 6)
expect(hitByRiver(9, 47)).toBeCloseTo(0.349676, 6)
expect(hitByNextCard(8, 47)).toBeCloseTo(0.170213, 6)
expect(hitByRiver(8, 47)).toBeCloseTo(0.314524, 6)
expect(hitByNextCard(4, 47)).toBeCloseTo(0.085106, 6)
expect(hitByRiver(4, 47)).toBeCloseTo(0.164662, 6)
expect(breakEvenEquity(300, 100)).toBe(0.25)
expect(callEV(0.35, 300, 100)).toBeCloseTo(40, 10)
```

- [ ] **Step 2: Write component tests**

`OutsExplorer` must contain scenarios for flush draw, open-ended straight draw, gutshot, pair plus flush draw, and pair plus straight draw. `EVRepeatChart` must render positive, zero and negative regions and update when equity changes.

- [ ] **Step 3: Run tests and observe failures**

Run: `npx vitest run src/lib/probability/probability.spec.ts src/components/labs/OutsExplorer.spec.ts src/components/labs/EVRepeatChart.spec.ts`

Expected: FAIL until EV helpers and components exist.

- [ ] **Step 4: Implement labs and write chapters 11–13**

For every draw scenario, show next-card probability, by-river probability, duplicated outs, dirty-outs warning, and a play prompt based on price and likely fold equity. Use these coaching defaults:

- a pair plus nut-flush draw can often continue versus one bet, but the price and opponent range still decide between call and raise;
- pair plus open-ended straight draw is a strong combo draw, yet paired or monotone boards can dirty outs;
- a bare gutshot facing a large bet usually lacks direct odds;
- “15 outs” is not “about 60% to win” unless all 15 outs are clean and two cards are guaranteed.

In the EV page, derive `EV(call) = equity × current pot − (1 − equity) × call`. Use 35% equity, current pot 300 and call 100 to show +40 points per decision.

- [ ] **Step 5: Verify chapters 11–13**

Run: `npm run check && npm run build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/probability src/components/labs site/math site/.vitepress/theme
git commit -m "feat: teach combo draws pot odds and EV"
```

## Task 6: Finish strategy, sources and the whole-site curriculum

**Files:**

- Create: `src/components/labs/StackRiskLab.vue`
- Create: `src/components/labs/StackRiskLab.spec.ts`
- Rewrite: `site/strategy/bet-purpose.md`
- Rewrite: `site/strategy/deep-stacks.md`
- Rewrite: `site/quick-reference.md`
- Rewrite: `site/glossary.md`
- Rewrite: `site/resources.md`
- Create: `site/sources.md`
- Modify: `site/.vitepress/config.mts`
- Modify: `tests/config/site-config.test.ts`
- Modify: `tests/content/curriculum.test.ts`

- [ ] **Step 1: Lock the final 15-route navigation order**

```ts
const courseRoutes = [
  '/basics/hand-rankings', '/basics/best-five', '/start/first-hand',
  '/basics/positions', '/basics/actions', '/basics/stack-depth',
  '/preflop/starting-hands', '/preflop/flop-outcomes', '/preflop/equity', '/preflop/first-plan',
  '/math/outs', '/math/pot-odds', '/math/ev',
  '/strategy/bet-purpose', '/strategy/deep-stacks'
]
```

Add auxiliary links for quick reference, glossary, resources and sources after the course.

- [ ] **Step 2: Run config and content tests and observe failures**

Run: `npx vitest run tests/config/site-config.test.ts tests/content/curriculum.test.ts`

Expected: FAIL until final routes and content exist.

- [ ] **Step 3: Complete strategy pages**

`/strategy/bet-purpose` must ask “更差的什么会跟？更好的什么会弃？” before every reveal and include the two-pair-versus-set case. `/strategy/deep-stacks` must compare 100BB, 150BB and 200BB using effective stack, SPR, position and nut potential. `StackRiskLab` changes depth while keeping the same flop and shows how much of one-pair strength is exposed.

- [ ] **Step 4: Complete auxiliary pages and sources**

The resources page separates free English channels from paid structured courses and labels the language and best starting topic. The sources page records PokerStars Learn for rules/terminology, PokerCoaching for matrix pedagogy, Oscar6Echo/Poker2 for comparison methodology, SVGCards attribution, and this repository's generator seed/trial count.

- [ ] **Step 5: Apply the final sidebar**

Use five groups: “先会比大小”, “看懂一手牌”, “读懂翻前”, “把数字算清”, “开始做判断”, followed by “随手查”. Remove old `/basics/action-order` and `/start/table-rules` from the sidebar but keep the files as compatibility pages linking to the new chapters.

- [ ] **Step 6: Verify all content and build**

Run: `npm run check && npm run build`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/labs site tests/config tests/content
git commit -m "docs: complete the fifteen-chapter curriculum"
```

## Task 7: Humanize every chapter and run browser QA

**Files:**

- Create: `docs/editorial/reviews/start-first-hand.md`
- Create: `docs/editorial/reviews/basics-positions.md`
- Create: `docs/editorial/reviews/basics-actions.md`
- Create: `docs/editorial/reviews/basics-stack-depth.md`
- Create: `docs/editorial/reviews/preflop-starting-hands.md`
- Create: `docs/editorial/reviews/preflop-flop-outcomes.md`
- Create: `docs/editorial/reviews/preflop-equity.md`
- Create: `docs/editorial/reviews/preflop-first-plan.md`
- Create: `docs/editorial/reviews/math-outs.md`
- Create: `docs/editorial/reviews/math-pot-odds.md`
- Create: `docs/editorial/reviews/math-ev.md`
- Create: `docs/editorial/reviews/strategy-bet-purpose.md`
- Create: `docs/editorial/reviews/strategy-deep-stacks.md`
- Modify: `tests/e2e/curriculum.spec.ts`
- Modify: `tests/e2e/first-hand.spec.ts`

- [ ] **Step 1: Read each chapter aloud against `WRITING_STYLE.md` and `humanizer-zh`**

Remove promotional claims, generic transitions, forced three-item lists, repeated bold labels, and sentences that tell the reader a rule is important. Keep concrete cards, points, actions and questions. Score each chapter on directness, rhythm, trust, authenticity and concision; rewrite any chapter below 45/50.

- [ ] **Step 2: Write one evidence record per chapter**

Each record contains route, opening question, single rule, component purpose, probability source, misconception, transfer exercise, character count, automated tests, mobile result and related commit.

- [ ] **Step 3: Add Playwright coverage**

Verify every route returns a visible H1, all 169 cells render, probability explorers change with selection, the opponent slider reaches seven, action/position controls work, and every page at 390×844 has `scrollWidth <= clientWidth`.

- [ ] **Step 4: Run the complete gate**

```bash
npm run check
npm run build
npm run test:e2e
git diff --check
git status --short
```

Expected: all Vitest, content, build, desktop Playwright and mobile Playwright checks pass; only planned review/test files remain before commit.

- [ ] **Step 5: Commit**

```bash
git add site docs/editorial/reviews tests/e2e
git commit -m "test: review and verify the complete tutorial"
```

## Task 8: Merge, publish and verify Pages

- [ ] **Step 1: Run `superpowers:verification-before-completion`**

Repeat `npm run check`, `npm run build` and `npm run test:e2e` from the final branch head.

- [ ] **Step 2: Run `superpowers:finishing-a-development-branch`**

Merge to `main` only after the test gate passes.

- [ ] **Step 3: Push and watch deployment**

```bash
git push origin main
deploy_run_id=$(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$deploy_run_id" --exit-status
```

- [ ] **Step 4: Verify public routes**

Confirm HTTP 200 for the homepage, `/preflop/starting-hands`, `/preflop/flop-outcomes`, `/preflop/equity`, `/math/outs`, `/math/ev`, and `/sources`.
