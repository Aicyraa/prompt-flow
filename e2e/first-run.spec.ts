import { expect, test } from '@playwright/test'
import { nodeCount, open, prepare, startFrom } from './support'

test.describe('first run', () => {
  test('a new visitor sees a checklist, not a dialog', async ({ page }) => {
    await prepare(page, { key: false, settings: { hasSeenGuide: false } })
    await open(page)

    await expect(
      page.getByRole('heading', { name: /build your first flow/i }),
    ).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByRole('heading', { level: 3 })).toHaveText([
      'Add your API key',
      'Pick a starting point',
      'Press Run',
    ])
  })

  test('adding a key ticks the first step', async ({ page }) => {
    await prepare(page, { key: false })
    await open(page)

    await page.getByRole('button', { name: 'Add key' }).click()
    await page.getByLabel('API key').fill('sk-or-v1-abc123')
    await page.keyboard.press('Escape')

    await expect(page.getByText('(done)')).toBeAttached()
    await expect(page.getByText(/Key added/)).toBeVisible()
  })

  test('picking an example fills the canvas and clears the card', async ({
    page,
  }) => {
    await prepare(page)
    await open(page)
    await startFrom(page, /Summarise text/)

    expect(await nodeCount(page)).toBe(4)
    await expect(
      page.getByRole('heading', { name: /first flow/i }),
    ).toHaveCount(0)
  })

  test('the quick tour opens the guide, and closing it is remembered', async ({
    page,
  }) => {
    await prepare(page, { settings: { hasSeenGuide: false } })
    await open(page)

    await page.getByRole('button', { name: 'Take the quick tour' }).click()
    const guide = page.getByRole('dialog', { name: 'How PromptFlow works' })
    await expect(guide).toBeVisible()
    await guide.getByRole('button', { name: 'Got it' }).click()
    await expect(guide).toHaveCount(0)
  })
})
