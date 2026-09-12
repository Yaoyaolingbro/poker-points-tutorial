import { expect, test } from '@playwright/test'

test('reader can enter the course and step through the hand', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /牌已经发下来了/ })).toBeVisible()
  await page.screenshot({ path: test.info().outputPath('home.png'), fullPage: true })
  await page.getByRole('link', { name: '先学会比大小' }).click()
  await expect(page.getByRole('heading', { name: '先别下注：这两手谁大？' })).toBeVisible()
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
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: test.info().outputPath('first-hand-showdown.png'), fullPage: true })
})

test('reduced motion keeps the full lesson usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/start/first-hand')
  await expect(page.locator('[data-motion]')).toHaveAttribute('data-motion', 'reduced')
  await expect(page.locator('[data-control="step"]')).toBeVisible()
})

test('reader can slow the hand and keep the table in view while reading', async ({ page }) => {
  await page.goto('/start/first-hand')
  const speed = page.locator('[data-control="speed"]')
  await expect(speed).toHaveValue('0.75')
  await speed.fill('0.5')
  await expect(page.locator('[data-speed-label]')).toHaveText('0.5×')

  await page.getByRole('heading', { name: '翻牌：你还没有成牌' }).scrollIntoViewIfNeeded()
  const demo = page.locator('[data-motion]')
  await expect(demo).toHaveAttribute('data-floating', 'true')
  await expect(page.locator('[data-control="dismiss-float"]')).toBeVisible()
  await page.waitForTimeout(300)
  await page.screenshot({ path: test.info().outputPath('first-hand-floating.png') })
  await page.locator('[data-control="dismiss-float"]').click()
  await expect(demo).toHaveAttribute('data-floating', 'false')
})
