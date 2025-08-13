import { test, expect } from '@playwright/test'

test('ホームページが正常に表示される', async ({ page }) => {
  await page.goto('/')

  // ページタイトルを確認
  await expect(page).toHaveTitle(/Vite \+ React \+ TS/)

  // Reactのロゴが表示されることを確認
  await expect(page.locator('img[alt="React logo"]')).toBeVisible()

  // Viteのロゴが表示されることを確認
  await expect(page.locator('img[alt="Vite logo"]')).toBeVisible()
})