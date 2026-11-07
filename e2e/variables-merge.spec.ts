import { expect, test } from '@playwright/test'
import {
  node,
  open,
  prepare,
  promptsSent,
  runButton,
  runFlow,
  startFrom,
} from './support'

test.describe('variables', () => {
  test('an empty variable blocks the run until it is filled in', async ({
    page,
  }) => {
    await prepare(page, {}, { reply: 'Bonjour' })
    await open(page)
    await startFrom(page, /Translate with variables/)

    await page.getByRole('button', { name: /^Variables/ }).click()
    await page.getByLabel('{{language}}').fill('')
    await page.keyboard.press('Escape')
    await expect(
      page.getByRole('button', { name: 'Variables (1 need a value)' }),
    ).toBeVisible()

    await runButton(page).click()
    const dialog = page.getByRole('dialog', { name: 'Variables' })
    await expect(dialog).toBeVisible()
    expect(await promptsSent(page)).toHaveLength(0) // nothing was spent

    await dialog.getByLabel('{{language}}').fill('Spanish')
    await dialog.getByRole('button', { name: 'Run flow' }).click()
    await expect(node(page, 'output').getByText('Bonjour')).toBeVisible()
    expect((await promptsSent(page))[0]).toBe(
      'Translate into Spanish in a friendly tone:\n\nGood morning! Thanks for waiting.',
    )
  })
})

test.describe('branching and merging', () => {
  test('the Merge node hands both branches, named, to the judge', async ({
    page,
  }) => {
    await prepare(
      page,
      {},
      {
        reply: (prompt) =>
          prompt.startsWith('Argue FOR')
            ? 'Happier staff.'
            : prompt.startsWith('Argue AGAINST')
              ? 'Coverage gaps.'
              : 'Verdict: try it.',
      },
    )
    await open(page)
    await startFrom(page, /Compare two takes/)
    await expect(node(page, 'merge')).toBeVisible()

    await runFlow(page)

    const prompts = await promptsSent(page)
    expect(prompts).toHaveLength(3)
    const judge = prompts.at(-1)!
    expect(judge).toContain('**Optimist**\n\nHappier staff.')
    expect(judge).toContain('**Sceptic**\n\nCoverage gaps.')
    expect(judge.indexOf('Optimist')).toBeLessThan(judge.indexOf('Sceptic'))
    await expect(
      node(page, 'output').getByText('Verdict: try it.'),
    ).toBeVisible()
  })
})
