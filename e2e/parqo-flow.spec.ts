import { test, expect } from '@playwright/test';

/**
 * Flusso principale in modalità demo:
 * ricerca → priorità → risultati → dettaglio → confronto → scelta →
 * piano B → salvataggio → visualizzazione nei Piani.
 */
test('flusso demo completo: dalla ricerca al piano salvato', async ({ page }) => {
  await page.goto('/');

  // Home: inserisci destinazione
  await expect(page.getByRole('heading', { name: 'Dove devi andare?' })).toBeVisible();
  await page.getByLabel('Dove devi andare?').fill('Centro città');

  // Seleziona priorità "Più conveniente"
  await page.getByRole('radio', { name: /Più conveniente/ }).click();

  // Avvia ricerca
  await page.getByRole('button', { name: 'Trova il parcheggio migliore' }).click();

  // Risultati
  await expect(page).toHaveURL(/\/results/);
  const firstCard = page.locator('article').first();
  await expect(firstCard).toBeVisible();
  await expect(page.getByText('Scelta consigliata').first()).toBeVisible();

  // Aggiungi due parcheggi al confronto
  const compareButtons = page.getByRole('button', { name: 'Confronta' });
  await compareButtons.nth(0).click();
  await compareButtons.nth(1).click();

  // Vai al confronto tramite la barra
  await page.getByRole('link', { name: 'Confronta' }).click();
  await expect(page).toHaveURL(/\/compare/);
  await expect(page.getByText('Migliore scelta complessiva')).toBeVisible();

  // Torna ai risultati e apri il dettaglio del primo
  await page.goBack();
  await page.locator('article').first().getByRole('link', { name: 'Dettaglio' }).click();
  await expect(page).toHaveURL(/\/parking\//);
  await expect(page.getByRole('heading', { name: 'Perché te lo consigliamo' })).toBeVisible();

  // Scegli questo parcheggio
  await page.getByRole('button', { name: 'Scegli questo parcheggio' }).click();
  await expect(page).toHaveURL(/\/route-plan/);
  await expect(page.getByText(/Piano B/)).toBeVisible();

  // Salva piano
  await page.getByRole('button', { name: 'Salva piano' }).click();
  await expect(page.getByText('Piano salvato.')).toBeVisible();

  // Vai ai piani e verifica presenza
  await page.getByRole('button', { name: 'Vai ai Piani' }).click();
  await expect(page).toHaveURL(/\/plans/);
  await expect(page.getByRole('heading', { name: 'Piani', exact: true })).toBeVisible();
  await expect(page.getByText('Prossimi')).toBeVisible();
});
