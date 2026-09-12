import { expect, test } from '@playwright/test'

const publicRoutes = [
  '/basics/hand-rankings', '/basics/best-five', '/start/first-hand',
  '/basics/positions', '/basics/actions', '/basics/stack-depth',
  '/preflop/starting-hands', '/preflop/flop-outcomes', '/preflop/equity', '/preflop/first-plan',
  '/math/outs', '/math/pot-odds', '/math/ev',
  '/strategy/bet-purpose', '/strategy/deep-stacks',
  '/quick-reference', '/glossary', '/resources', '/sources'
]

test('every published route has a heading and no page overflow', async ({ page }, testInfo) => {
  if (testInfo.project.name === 'mobile-chromium') {
    await page.setViewportSize({ width: 390, height: 844 })
  }
  for (const route of publicRoutes) {
    await page.goto(route)
    await expect(page.locator('h1')).toBeVisible()
    const width = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth
    }))
    expect(width.scroll, `${route} overflows horizontally`).toBeLessThanOrEqual(width.client)
  }
})

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

test('odds lab is usable', async ({ page }) => {
  await page.goto('/math/pot-odds')
  await expect(page.getByText('25.0%')).toBeVisible()
  await page.locator('[data-input="outs"]').fill('4')
  await expect(page.locator('[data-verdict]')).toContainText('赔率不够')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: test.info().outputPath('pot-odds.png'), fullPage: true })
})

test('preflop probability tools respond to the reader', async ({ page }) => {
  await page.goto('/preflop/starting-hands')
  await expect(page.locator('[data-starting-hand]')).toHaveCount(169)
  await page.locator('[data-starting-hand="AA"]').click()
  await expect(page.locator('[data-hand-detail]')).toContainText('6 个具体组合')

  await page.goto('/preflop/flop-outcomes')
  await page.locator('[data-preset="22"]').click()
  await expect(page.locator('[data-selected-hand]')).toHaveText('22')
  await expect(page.locator('[data-flop-total]')).toContainText('19,600')

  await page.goto('/preflop/equity')
  await page.locator('[data-opponent-slider]').fill('7')
  await expect(page.locator('[data-opponent-count]')).toContainText('7 名随机对手')
})

test('position, action, draw and depth labs change state', async ({ page }) => {
  await page.goto('/basics/positions')
  await expect(page.locator('[data-seat]')).toHaveCount(6)
  await page.locator('[data-player-count]').fill('8')
  await expect(page.locator('[data-seat]')).toHaveCount(8)
  await page.locator('[data-street="postflop"]').click()
  await expect(page.locator('[data-order-note]')).toContainText('庄家位最后行动')

  await page.goto('/basics/actions')
  await page.locator('[data-scenario="facing-bet"]').click()
  await expect(page.locator('[data-action="check"]')).toBeDisabled()
  await expect(page.locator('[data-call-note]')).toContainText('再补 40')

  await page.goto('/math/outs')
  await page.locator('[data-draw-scenario="pair-flush"]').click()
  await expect(page.locator('[data-draw-title]')).toContainText('带对抽同花')
  await expect(page.locator('[data-by-river]')).toContainText('34.97%')

  await page.goto('/strategy/deep-stacks')
  await page.locator('[data-depth-control]').fill('200')
  await expect(page.locator('[data-stack-risk]')).toContainText('30.3')
})

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

test('decision drill waits for the reader and pages do not overflow', async ({ page }) => {
  await page.goto('/strategy/bet-purpose')
  await expect(page.locator('[data-answer]')).toHaveCount(0)
  await page.locator('[data-reveal]').click()
  await expect(page.locator('[data-answer]')).toContainText('更差的牌很少会这样加注')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: test.info().outputPath('decision-drill.png'), fullPage: true })
  const pageWidth = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
  expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client)
})

test('resource page exposes the checked learning paths', async ({ page }) => {
  await page.goto('/resources')
  await expect(page.locator('a[href="https://www.youtube.com/@PokerCoaching"]')).toBeVisible()
  await expect(page.locator('a[href="https://upswingpoker.com/the-poker-lab-coaching/"]')).toBeVisible()
})
