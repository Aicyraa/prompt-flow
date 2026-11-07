import { expect, test, type Page } from '@playwright/test'
import { node, open, prepare, runFlow, startFrom } from './support'

const TYPES = ['input', 'prompt', 'llm', 'merge', 'output'] as const

async function size(page: Page, type: string) {
  const box = (await node(page, type).first().boundingBox())!
  return { w: Math.round(box.width), h: Math.round(box.height) }
}

/** Selects a node and drags its bottom-right corner by (dx, dy) screen px. */
async function dragCorner(page: Page, type: string, dx: number, dy: number) {
  // Deselect first so selecting again pans the node clear of the settings panel.
  await page.mouse.click(40, 90)
  await node(page, type).first().locator('.uppercase').first().click()
  // selecting pans the canvas clear of the settings panel; let that finish
  await page.waitForTimeout(450)
  const handle = node(page, type)
    .first()
    .locator('.react-flow__resize-control.handle.bottom.right')
  await expect(handle).toBeVisible()
  const box = (await handle.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + dx, box.y + dy, { steps: 8 })
  await page.mouse.up()
}

test.describe('every node can be resized', () => {
  for (const type of TYPES) {
    test(`${type} node grows and shrinks when its corner is dragged`, async ({
      page,
    }) => {
      await prepare(page)
      await open(page)
      await startFrom(page, /Compare two takes/)
      await page.waitForTimeout(500)

      const before = await size(page, type)
      await dragCorner(page, type, 70, 60)
      const grown = await size(page, type)
      expect(grown.w).toBeGreaterThan(before.w + 30)
      expect(grown.h).toBeGreaterThan(before.h + 25)

      await dragCorner(page, type, -140, -120)
      const shrunk = await size(page, type)
      expect(shrunk.w).toBeLessThan(grown.w - 40)
      expect(shrunk.h).toBeLessThan(grown.h - 30)
    })
  }

  test('a resized text node fills its extra height with text space', async ({
    page,
  }) => {
    await prepare(page)
    await open(page)
    await startFrom(page, /Summarise text/)
    await page.waitForTimeout(500)

    const area = node(page, 'prompt').first().locator('textarea')
    const before = (await area.boundingBox())!.height
    await dragCorner(page, 'prompt', 40, 140)
    expect((await area.boundingBox())!.height).toBeGreaterThan(before + 60)
  })

  test('a resized Agent node gives the result more room', async ({ page }) => {
    await prepare(
      page,
      {},
      { reply: '# Title\n\n' + 'A long line of reply text. '.repeat(40) },
    )
    await open(page)
    await startFrom(page, /Summarise text/)
    await runFlow(page)
    await page.waitForTimeout(400)

    const preview = node(page, 'llm').first().locator('.nowheel').last()
    const before = (await preview.boundingBox())!.height
    await dragCorner(page, 'llm', 30, 160)
    await expect
      .poll(async () => (await preview.boundingBox())!.height)
      .toBeGreaterThan(before + 60)
  })
})

test.describe('text size', () => {
  const fontOf = (page: Page, type: string) =>
    node(page, type)
      .first()
      .locator('textarea')
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))

  test('the global setting scales text in every node', async ({ page }) => {
    await prepare(page)
    await open(page)
    await startFrom(page, /Summarise text/)
    const medium = await fontOf(page, 'prompt')

    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('radio', { name: 'Extra large' }).click()
    await page.keyboard.press('Escape')
    const xl = await fontOf(page, 'prompt')
    expect(xl).toBeGreaterThan(medium * 1.4)
    expect(await fontOf(page, 'input')).toBe(xl)

    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('radio', { name: 'Small' }).click()
    await page.keyboard.press('Escape')
    expect(await fontOf(page, 'prompt')).toBeLessThan(medium)
  })

  test('a node can override the global size, and go back to it', async ({
    page,
  }) => {
    await prepare(page)
    await open(page)
    await startFrom(page, /Summarise text/)
    const base = await fontOf(page, 'input')

    await node(page, 'prompt').first().locator('.uppercase').first().click()
    const panel = page.getByRole('complementary', { name: 'Node settings' })
    await panel.getByRole('radio', { name: 'Large', exact: true }).click()
    expect(await fontOf(page, 'prompt')).toBeGreaterThan(base * 1.15)
    expect(await fontOf(page, 'input')).toBe(base) // other nodes untouched

    await panel.getByRole('radio', { name: 'Use the default size' }).click()
    expect(await fontOf(page, 'prompt')).toBe(base)
  })

  test('the choice is remembered after a reload', async ({ page }) => {
    await prepare(page)
    await open(page)
    await startFrom(page, /Summarise text/)
    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('radio', { name: 'Large', exact: true }).click()
    await page.keyboard.press('Escape')
    const large = await fontOf(page, 'input')
    await page.waitForTimeout(500)
    await page.reload()
    await expect(node(page, 'input')).toBeVisible()
    expect(await fontOf(page, 'input')).toBe(large)
  })
})

test.describe('captions under nodes stay on one line', () => {
  /** Every truncating caption in the node is a single line tall. */
  async function captionsAreOneLine(page: Page, type: string) {
    const heights = await node(page, type)
      .first()
      .locator('p.truncate')
      .evaluateAll((els) =>
        els.map((el) => ({
          text: el.textContent,
          h: el.getBoundingClientRect().height,
          line: parseFloat(getComputedStyle(el).lineHeight) || 16,
          zoom:
            el.getBoundingClientRect().height /
            (el as HTMLElement).offsetHeight,
        })),
      )
    expect(heights.length).toBeGreaterThan(0)
    for (const c of heights) {
      // height in flow px (undo the canvas zoom) must be one line of text
      expect(c.h / c.zoom, c.text ?? '').toBeLessThanOrEqual(c.line + 1)
    }
  }

  test('Prompt, Agent and Merge captions are one line, even when narrow', async ({
    page,
  }) => {
    await prepare(page, {}, { reply: 'ok' })
    await open(page)
    await startFrom(page, /Compare two takes/)
    await page.waitForTimeout(500)

    // give the Agent a long caption: many settings at once
    await node(page, 'llm').first().locator('.uppercase').first().click()
    const panel = page.getByRole('complementary', { name: 'Node settings' })
    await panel.getByLabel('System prompt').fill('Be brief')
    await panel.getByLabel('Output format').selectOption('json')
    await panel.getByLabel('Max output tokens').fill('500')

    for (const type of ['prompt', 'llm', 'merge'] as const) {
      await captionsAreOneLine(page, type)
    }

    // and when squeezed to the narrowest width
    for (const type of ['prompt', 'llm', 'merge'] as const) {
      await dragCorner(page, type, -400, 0)
      await captionsAreOneLine(page, type)
    }
  })

  test('the run summary under the result is one line when the Output node is narrow', async ({
    page,
  }) => {
    await prepare(
      page,
      {},
      {
        reply: 'Done',
        usage: { prompt_tokens: 1200, completion_tokens: 800, cost: 0.0123 },
      },
    )
    await open(page)
    await startFrom(page, /Summarise text/)
    await runFlow(page)
    await dragCorner(page, 'output', -300, 0)

    const summary = node(page, 'output').locator('p.truncate').last()
    await expect(summary).toContainText('steps')
    const { h, line, zoom } = await summary.evaluate((el) => ({
      h: el.getBoundingClientRect().height,
      line: parseFloat(getComputedStyle(el).lineHeight) || 16,
      zoom:
        el.getBoundingClientRect().height / (el as HTMLElement).offsetHeight,
    }))
    expect(h / zoom).toBeLessThanOrEqual(line + 1)
  })
})
