import { expect, type Locator, type Page } from '@playwright/test'

export interface MockOptions {
  /** Reply text per request; the function sees the prompt the model received. */
  reply?: string | ((prompt: string) => string)
  /** HTTP status to fail every model call with (e.g. 400, 401). */
  failWith?: number
  /** Delay between streamed chunks, in ms. */
  chunkMs?: number
  /** Usage reported with each reply. */
  usage?: { prompt_tokens: number; completion_tokens: number; cost: number }
}

interface Seed {
  /** Pretend a key is already saved, as a returning user would have. */
  key?: boolean
  /** Extra values for the saved settings. */
  settings?: Record<string, unknown>
}

/**
 * Prepares a page before it loads: saved settings and a fake model API.
 * Nothing here talks to a real provider, so runs are fast and free.
 */
export async function prepare(
  page: Page,
  { key = true, settings = {} }: Seed = {},
  mock: MockOptions = {},
) {
  await page.addInitScript(
    ({ key, settings, mock }) => {
      // addInitScript runs on every navigation; seed only on the first one so
      // a reload keeps what the app saved.
      if (!sessionStorage.getItem('e2e:seeded')) {
        sessionStorage.setItem('e2e:seeded', '1')
        if (key) sessionStorage.setItem('promptflow:apikey', 'sk-or-v1-test')
        localStorage.setItem(
          'promptflow:settings',
          JSON.stringify({
            state: {
              byokEnabled: key,
              keyPersistence: 'session',
              provider: 'openrouter',
              hasSeenGuide: true,
              costThresholdUsd: 0,
              ...settings,
            },
            version: 1,
          }),
        )
      }

      const w = window as unknown as {
        __mock: { prompts: string[]; status?: number; reply: string }
      }
      w.__mock = { prompts: [], status: mock.failWith, reply: '' }
      const realFetch = window.fetch.bind(window)
      window.fetch = (url, init) => {
        if (!String(url).includes('/chat/completions')) {
          return realFetch(url, init)
        }
        const body = JSON.parse(String(init?.body))
        const prompt: string = body.messages.at(-1).content
        w.__mock.prompts.push(prompt)
        if (w.__mock.status) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                error: { message: `Mock failure ${w.__mock.status}` },
              }),
              { status: w.__mock.status },
            ),
          )
        }
        const text = mock.replyFn
          ? new Function('prompt', `return (${mock.replyFn})(prompt)`)(prompt)
          : (mock.reply ?? 'Mock reply')
        const words: string[] = String(text).split(/(?<=\s)/)
        const enc = new TextEncoder()
        let i = 0
        const signal = init?.signal
        const stream = new ReadableStream({
          async pull(controller) {
            if (i >= words.length) {
              if (mock.usage) {
                controller.enqueue(
                  enc.encode(
                    `data: ${JSON.stringify({ choices: [], usage: mock.usage })}\n\n`,
                  ),
                )
              }
              controller.enqueue(enc.encode('data: [DONE]\n\n'))
              controller.close()
              return
            }
            await new Promise<void>((resolve, reject) => {
              const timer = setTimeout(resolve, mock.chunkMs ?? 0)
              signal?.addEventListener('abort', () => {
                clearTimeout(timer)
                reject(new DOMException('Aborted', 'AbortError'))
              })
            })
            controller.enqueue(
              enc.encode(
                `data: ${JSON.stringify({ choices: [{ delta: { content: words[i++] } }] })}\n\n`,
              ),
            )
          },
        })
        return Promise.resolve(
          new Response(stream, {
            status: 200,
            headers: { 'content-type': 'text/event-stream' },
          }),
        )
      }
    },
    {
      key,
      settings,
      mock: {
        ...mock,
        reply: typeof mock.reply === 'string' ? mock.reply : undefined,
        replyFn:
          typeof mock.reply === 'function' ? mock.reply.toString() : undefined,
      },
    },
  )

  // The model list: one model, enough for the template defaults.
  await page.route('**/openrouter.ai/**', (route) =>
    route.fulfill({
      headers: { 'access-control-allow-origin': '*' },
      json: {
        data: [
          {
            id: 'openai/gpt-4o-mini',
            name: 'GPT-4o mini',
            supported_parameters: ['temperature', 'max_tokens'],
            pricing: { prompt: '0.00000015', completion: '0.0000006' },
          },
        ],
      },
    }),
  )
}

/** The prompts the fake model has received so far, oldest first. */
export const promptsSent = (page: Page): Promise<string[]> =>
  page.evaluate(
    () =>
      (window as unknown as { __mock: { prompts: string[] } }).__mock.prompts,
  )

/** Changes how the fake model behaves from now on (e.g. start failing). */
export const setMockStatus = (page: Page, status: number | undefined) =>
  page.evaluate((s) => {
    ;(window as unknown as { __mock: { status?: number } }).__mock.status = s
  }, status)

export async function open(page: Page) {
  await page.goto('/')
  await expect(page.getByRole('banner', { name: 'Toolbar' })).toBeVisible()
}

/** Starts from one of the example flows on the empty canvas. */
export async function startFrom(page: Page, template: RegExp | string) {
  await page.getByRole('button', { name: template }).click()
  await expect(page.locator('.react-flow__node').first()).toBeVisible()
}

export const node = (page: Page, type: string): Locator =>
  page.locator(`.react-flow__node-${type}`)

export const nodeCount = (page: Page) =>
  page.locator('.react-flow__node').count()

/** The Run button on the Output node. */
export const runButton = (page: Page) =>
  node(page, 'output').getByRole('button', { name: 'Run', exact: true })

/** Clicks Run and waits until the Output node shows a finished result. */
export async function runFlow(page: Page) {
  await runButton(page).click()
  await expect(node(page, 'output').getByText(/\d+ steps?/)).toBeVisible({
    timeout: 15_000,
  })
}
