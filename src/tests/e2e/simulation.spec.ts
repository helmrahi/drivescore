import { test, expect } from '@playwright/test'

const EMAIL = 'hicham.elmrahii@gmail.com'
const PWD = 'votre_mot_de_passe' // à remplacer

// Helper login
async function login(page: any) {
  await page.goto('/login')
  await page.fill('input[type="email"]', EMAIL)
  await page.fill('input[type="password"]', PWD)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard', { timeout: 10000 })
}

test.describe('Dashboard', () => {
  test('affiche le score et les trajets', async ({ page }) => {
    await login(page)
    await expect(page.locator('text=Score de conduite')).toBeVisible()
    await expect(page.locator('text=Mes trajets')).toBeVisible()
    await page.screenshot({ path: 'playwright-report/dashboard.png', fullPage: true })
  })

  test('filtres période fonctionnent', async ({ page }) => {
    await login(page)
    await page.click('text=7j')
    await page.screenshot({ path: 'playwright-report/dashboard-7j.png' })
    await page.click('text=Mois')
    await page.screenshot({ path: 'playwright-report/dashboard-mois.png' })
  })
})

test.describe('Télématique — Simulation', () => {
  test('démarrage trajet GPS', async ({ page }) => {
    await login(page)
    await page.goto('/telematics')
    await expect(page.locator('text=Démarrer le trajet')).toBeVisible()
    await page.screenshot({ path: 'playwright-report/telematics-idle.png', fullPage: true })
  })
})

test.describe('Classement', () => {
  test('affiche le classement', async ({ page }) => {
    await login(page)
    await page.goto('/leaderboard')
    await expect(page.locator('text=Classement')).toBeVisible()
    await page.screenshot({ path: 'playwright-report/leaderboard.png', fullPage: true })
  })
})

test.describe('Trajets', () => {
  test('liste des trajets avec filtres', async ({ page }) => {
    await login(page)
    await page.goto('/trajets')
    await page.screenshot({ path: 'playwright-report/trajets.png', fullPage: true })
    
    // Tester filtres
    await page.click('text=Incidents')
    await page.screenshot({ path: 'playwright-report/trajets-incidents.png' })
    
    await page.click('text=Parfait')
    await page.screenshot({ path: 'playwright-report/trajets-parfait.png' })
  })
})
