import { expect, test } from '@playwright/test'

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
