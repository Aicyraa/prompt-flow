import { expect, test } from '@playwright/test'
import { node, nodeCount, open, prepare, startFrom } from './support'

test.describe('saved flows', () => {
  test('save, switch, and come back after a reload', async ({ page }) => {
    await prepare(page)
    await open(page)
    await startFrom(page, /Summarise text/)

    // save the canvas as "Flow A"
    await page.getByRole('button', { name: /^Saved flows/ }).click()
    await page.getByLabel('Flow name').fill('Flow A')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await page.keyboard.press('Escape')
    await expect(
      page.getByRole('button', { name: 'Saved flows (open: Flow A)' }),
    ).toBeVisible()

    // an edit autosaves into it
    await page.getByRole('button', { name: /Add node/ }).click()
    await page.getByRole('menuitem', { name: /Merge/ }).click()
    await expect(node(page, 'merge')).toBeVisible()
    await page.waitForTimeout(900)

    // start a second, empty flow
    await page.getByRole('button', { name: /^Saved flows/ }).click()
    await page.getByRole('button', { name: 'New empty flow' }).click()
    expect(await nodeCount(page)).toBe(0)

    // the library and open flow survive a reload
    await page.reload()
    await expect(
      page.getByRole('button', { name: /Saved flows \(open: Untitled flow\)/ }),
    ).toBeVisible()

    // switching back restores Flow A including the autosaved edit
    await page.getByRole('button', { name: /^Saved flows/ }).click()
    await page.getByRole('button', { name: /^Flow A/ }).click()
    await expect(node(page, 'merge')).toBeVisible()
    expect(await nodeCount(page)).toBe(5)
  })
})

test.describe('theme', () => {
  test('switching to light applies, and survives a reload', async ({
    page,
  }) => {
    await prepare(page)
    await open(page)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('radio', { name: 'Light' }).check()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await page.keyboard.press('Escape')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('"system" follows the operating system setting', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'light' })
    const page = await context.newPage()
    await prepare(page)
    await open(page)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await context.close()
  })
})
