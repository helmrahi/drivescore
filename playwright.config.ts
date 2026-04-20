import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './src/tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'https://drivescore-eight.vercel.app',
    headless: true,
    viewport: { width: 390, height: 844 },
    screenshot: 'on',
    video: 'retain-on-failure',
  },
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],
})
