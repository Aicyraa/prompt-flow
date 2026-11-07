import { expect, test } from '@playwright/test'
import {
  node,
  open,
  prepare,
  promptsSent,
  runButton,
  runFlow,
  setMockStatus,
  startFrom,
} from './support'

test.describe('running a flow', () => {
  test('streams the result into the Output node with a run summary', async ({
    page,
  }) => {
    await prepare(
      page,
      {},
      {
        reply: '# Three points\n\n- one\n- two\n- three',
        chunkMs: 40,
        usage: { prompt_tokens: 50, completion_tokens: 20, cost: 0.0003 },
      },
    )
    await open(page)
    await startFrom(page, /Summarise text/)

    await runFlow(page)

    const out = node(page, 'output')
    await expect(
      out.getByRole('heading', { name: 'Three points' }),
    ).toBeVisible()
    await expect(out.getByText(/70 tokens \(50 in \/ 20 out\)/)).toBeVisible()
    await expect(out.getByText(/\$0\.0003/)).toBeVisible()
  })

  test('downloads the whole run as one Markdown report', async ({ page }) => {
    await prepare(page, {}, { reply: '# Findings\n\nAll good.' })
    await open(page)
    await startFrom(page, /Summarise text/)
    await runFlow(page)

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      node(page, 'output').getByRole('button', { name: 'Report .md' }).click(),
    ])
    expect(download.suggestedFilename()).toMatch(
      /^promptflow-report-\d{4}-\d{2}-\d{2}-\d{4}\.md$/,
    )
    const text = await (
      await import('node:fs/promises')
    ).readFile((await download.path())!, 'utf8')
    expect(text).toContain('# PromptFlow run report')
    expect(text).toContain('## Result')
    expect(text).toContain('All good.')
  })

  test('a failed node offers Retry, which reruns and succeeds', async ({
    page,
  }) => {
    await prepare(page, {}, { reply: 'Recovered answer', failWith: 400 })
    await open(page)
    await startFrom(page, /Summarise text/)

    await runButton(page).click()
    const agent = node(page, 'llm')
    await expect(agent.getByRole('alert')).toContainText('Mock failure 400')

    await setMockStatus(page, undefined)
    await agent.getByRole('button', { name: 'Retry' }).click()
    await expect(
      node(page, 'output').getByText('Recovered answer'),
    ).toBeVisible()
    expect((await promptsSent(page)).length).toBe(2)
  })

  test('a rejected key sends you to Settings', async ({ page }) => {
    await prepare(page, {}, { failWith: 401 })
    await open(page)
    await startFrom(page, /Summarise text/)

    await runButton(page).click()
    await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible()
  })
})
