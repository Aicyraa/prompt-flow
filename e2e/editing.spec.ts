import { expect, test, type Page } from '@playwright/test'
import {
  node,
  nodeCount,
  open,
  prepare,
  startFrom,
  viewSettled,
} from './support'

const top = async (page: Page, type: string) =>
  Math.round((await node(page, type).boundingBox())!.y)

test.describe('editing the canvas', () => {
  test.beforeEach(async ({ page }) => {
    await prepare(page)
    await open(page)
    await startFrom(page, /Summarise text/)
  })

  test('dragging a node can be undone and redone', async ({ page }) => {
    const before = await top(page, 'prompt')
    const header = node(page, 'prompt').locator('.uppercase').first()
    const box = (await header.boundingBox())!
    await page.mouse.move(box.x + 10, box.y + 5)
    await page.mouse.down()
    await page.mouse.move(box.x + 60, box.y + 205, { steps: 8 })
    await page.mouse.up()
    const moved = await top(page, 'prompt')
    expect(moved - before).toBeGreaterThan(100)

    await page.mouse.click(700, 120) // leave any text box
    await page.keyboard.press('Control+z')
    // a few px of slack: nodes scale in when they appear, so boxes can differ slightly
    await expect
      .poll(async () => Math.abs((await top(page, 'prompt')) - before))
      .toBeLessThanOrEqual(4)
    await page.keyboard.press('Control+Shift+z')
    await expect
      .poll(async () => Math.abs((await top(page, 'prompt')) - moved))
      .toBeLessThanOrEqual(4)
  })

  test('duplicating a selected node adds a copy', async ({ page }) => {
    await node(page, 'prompt').locator('.uppercase').first().click()
    await page.getByRole('button', { name: 'Duplicate node' }).click()
    expect(await nodeCount(page)).toBe(5)
    await page.keyboard.press('Control+z')
    await expect.poll(() => nodeCount(page)).toBe(4)
  })

  test('Tidy lines the flow up, and one undo puts it back', async ({
    page,
  }) => {
    // make a mess first
    const header = node(page, 'llm').locator('.uppercase').first()
    const box = (await header.boundingBox())!
    await page.mouse.move(box.x + 10, box.y + 5)
    await page.mouse.down()
    await page.mouse.move(box.x + 10, box.y + 255, { steps: 8 })
    await page.mouse.up()
    await page.mouse.click(700, 120)

    await page.getByRole('button', { name: 'Tidy layout' }).click()
    const centre = async (type: string) => {
      const b = (await node(page, type).boundingBox())!
      return Math.round(b.y + b.height / 2)
    }
    // nodes glide, then the view re-fits; wait for it rather than a fixed delay
    await expect
      .poll(async () =>
        Math.abs((await centre('input')) - (await centre('llm'))),
      )
      .toBeLessThan(6)
    await viewSettled(page)

    // One undo restores the layout (the view itself is not part of undo, so
    // compare how far apart the nodes are, not where they sit on screen).
    await page.keyboard.press('Control+z')
    await expect
      .poll(async () =>
        Math.abs((await centre('input')) - (await centre('llm'))),
      )
      .toBeGreaterThan(50)
  })

  test('the command palette adds a node and finds one by name', async ({
    page,
  }) => {
    await page.keyboard.press('Control+k')
    const palette = page.getByRole('dialog', { name: 'Command palette' })
    await expect(palette).toBeVisible()
    await page.keyboard.type('add merge')
    await page.keyboard.press('Enter')
    await expect(node(page, 'merge')).toBeVisible()
    expect(await nodeCount(page)).toBe(5)

    await page.keyboard.press('Control+k')
    await page.keyboard.type('go to prompt')
    await page.keyboard.press('Enter')
    await expect(
      page.getByRole('complementary', { name: 'Node settings' }),
    ).toBeVisible()
  })
})
