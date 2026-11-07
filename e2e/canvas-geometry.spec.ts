import { expect, test } from '@playwright/test'
import { node, open, prepare, startFrom } from './support'

interface Pt {
  x: number
  y: number
}

/** Where each edge starts and ends, and where every dot sits, in screen px. */
async function measure(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const edges = [...document.querySelectorAll('.react-flow__edge')].map(
      (g) => {
        const paths = [...g.querySelectorAll('path')]
        const line = paths.find(
          (p) =>
            p.getAttribute('pointer-events') === 'none' &&
            p.getAttribute('stroke-linecap'),
        )!
        const m = line.getScreenCTM()!
        const at = (len: number) => {
          const p = line.getPointAtLength(len)
          return { x: p.x * m.a + m.e, y: p.y * m.d + m.f }
        }
        const total = line.getTotalLength()
        return { start: at(0), end: at(total) }
      },
    )
    const dots = [...document.querySelectorAll('.react-flow__handle')].map(
      (h) => {
        const r = h.getBoundingClientRect()
        return {
          kind: h.classList.contains('source') ? 'source' : 'target',
          cx: r.x + r.width / 2,
          cy: r.y + r.height / 2,
          left: r.x,
        }
      },
    )
    return { edges, dots }
  })
}

const near = (a: Pt, b: Pt, tolerance: number) =>
  Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance

test.describe('edges meet their connection dots', () => {
  test('every line starts on a source dot and ends at a target dot', async ({
    page,
  }) => {
    await prepare(page)
    await open(page)
    await startFrom(page, /Compare two takes/)
    // let the entrance fade finish, which is when handle positions are measured
    await expect(node(page, 'output')).toBeVisible()
    await page.waitForTimeout(800)

    const { edges, dots } = await measure(page)
    expect(edges.length).toBe(9)

    for (const edge of edges) {
      // the line begins at the middle of a source dot…
      const source = dots.find(
        (d) =>
          d.kind === 'source' && near(edge.start, { x: d.cx, y: d.cy }, 1.5),
      )
      expect(
        source,
        `edge starting at ${JSON.stringify(edge.start)}`,
      ).toBeTruthy()
      // …and ends touching the near side of a target dot, at the same height
      const target = dots.find(
        (d) =>
          d.kind === 'target' && near(edge.end, { x: d.left, y: d.cy }, 1.5),
      )
      expect(target, `edge ending at ${JSON.stringify(edge.end)}`).toBeTruthy()
    }
  })
})

test.describe('Output node controls', () => {
  test('Run is a play button without a text label', async ({ page }) => {
    await prepare(page)
    await open(page)
    await startFrom(page, /Summarise text/)

    const run = node(page, 'output').getByRole('button', {
      name: 'Run',
      exact: true,
    })
    await expect(run).toBeVisible()
    await expect(run).toHaveText('') // icon only; the name comes from aria-label
    await expect(run.locator('svg')).toBeVisible()
  })
})
