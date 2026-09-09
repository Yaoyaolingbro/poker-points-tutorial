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
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: test.info().outputPath('first-hand-showdown.png'), fullPage: true })
})

test('reduced motion keeps the full lesson usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/start/first-hand')
  await expect(page.locator('[data-motion]')).toHaveAttribute('data-motion', 'reduced')
  await expect(page.locator('[data-control="step"]')).toBeVisible()
})
