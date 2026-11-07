import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

// Port chosen to stay clear of a developer's own `npm run dev` on 5173.
const PORT = 5188

/**
 * Use a browser that is already installed when there is one (E2E_CHROMIUM
 * wins, then a system Chromium); otherwise Playwright's own download, which
 * CI installs with `npx playwright install chromium`.
 */
function browserPath(): string | undefined {
  const fromEnv = process.env.E2E_CHROMIUM
  if (fromEnv) return fromEnv
  return ['/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync)
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    viewport: { width: 1500, height: 900 },
    // "System" theme must not depend on the machine running the tests.
    colorScheme: 'dark',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1500, height: 900 },
        launchOptions: {
          executablePath: browserPath(),
          args: ['--no-sandbox'],
        },
      },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
