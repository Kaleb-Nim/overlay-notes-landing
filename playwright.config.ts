import { defineConfig, devices } from '@playwright/test';

/**
 * E2E + responsive checks for the Overlay Notes landing page.
 *
 * Bundled Chromium only — never system Chrome, never the Playwright MCP server
 * (per repo convention). Playwright boots `bun run dev` itself and reuses an
 * already-running server locally, so the GSD test gate is self-contained.
 *
 * Viewports mirror the prototype's breakpoints: 1280 desktop, 760 collapse
 * point, 360 mobile (the no-horizontal-scroll floor).
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'tablet',
      use: { ...devices['Desktop Chrome'], viewport: { width: 760, height: 1024 } },
    },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 780 } },
    },
  ],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
