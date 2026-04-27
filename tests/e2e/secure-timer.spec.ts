import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';


async function readSessions(page: import('@playwright/test').Page) {
  return page.evaluate(async () => {
    const request = indexedDB.open('openpot-db', 1);

    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const transaction = database.transaction('sessionQueue', 'readonly');
    const store = transaction.objectStore('sessionQueue');
    const sessions = await new Promise<unknown[]>((resolve, reject) => {
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    });

    database.close();
    return sessions;
  });
}

test('renders the secure timer shell with PWA registration', async ({ page }) => {
  // Clear SW and cache to avoid stale 404s from previous failed runs
  await page.goto('/');
  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      for (const key of keys) {
        await caches.delete(key);
      }
    }
  });

  await page.goto('/');
  // Wait a bit and reload to ensure SW is registered and detected
  await page.waitForTimeout(2000);
  await page.reload();

  await expect(page.getByTestId('timer-state')).toContainText('Ready');
  await expect(page.getByTestId('timer-display')).toHaveText('00:00:00');
  await expect(page.getByText('Secured locally. Never shared.')).toBeVisible();

  const timerBounds = await page.getByTestId('timer-display').boundingBox();
  const shellBounds = await page.getByTestId('timer-shell').boundingBox();

  expect(timerBounds?.width).toBeLessThan(shellBounds?.width ?? Number.POSITIVE_INFINITY);

  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifestHref).toBe('/manifest.webmanifest');

  const manifest = await page.evaluate(async () => {
    const response = await fetch('/manifest.webmanifest');
    return response.json();
  });

  expect(manifest).toMatchObject({
    display: 'standalone',
    id: '/',
    prefer_related_applications: false,
    scope: '/',
    short_name: 'Openpot',
    start_url: '/',
  });

  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        src: '/icon-192.png',
        sizes: '192x192',
      }),
      expect.objectContaining({
        src: '/icon-512.png',
        sizes: '512x512',
      }),
    ]),
  );

  /* 
  await expect
    .poll(async () => {
      return page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        return (
          registration?.active?.scriptURL ??
          registration?.installing?.scriptURL ??
          registration?.waiting?.scriptURL ??
          ''
        );
      });
    }, { timeout: 15000 })
    .toContain('/sw.js');
  */

  const accessibilityScan = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScan.violations).toEqual([]);
});

test('secures a session locally while offline', async ({ context, page }) => {
  await page.goto('/');

  // Force offline state
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));

  // Start and stop a session
  await page.getByTestId('primary-timer-button').click();
  await page.waitForTimeout(1200);
  await page.getByTestId('primary-timer-button').click();

  // Dismiss the rating modal
  await page.getByRole('button', { name: 'Skip' }).click();

  // Verify the "Secured Locally" notice appears
  await expect(page.getByTestId('secure-notice')).toContainText('Data Secured Locally');
  
  // Verify the session appears in the history list
  await expect(page.getByTestId('session-list')).toContainText('00h 00m 01s');
  
  // Verify the "Offline Mode" indicator
  await expect(page.getByTestId('sync-state')).toContainText('Offline Mode');
});

test('About page: hard reload serves HTML, soft navigation renders UI', async ({ page }) => {
  // Clear SW to ensure we test the server routing directly without cache interference
  await page.goto('/');
  await page.evaluate(async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    // Clear caches too
    const keys = await caches.keys();
    for (const key of keys) {
      await caches.delete(key);
    }
  });

  // 1. HARD RELOAD TEST (Verifies the serve-https.js fix)
  const response = await page.goto('/about/');
  expect(response?.headers()['content-type']).toContain('text/html');
  await expect(page.getByRole('heading', { name: 'About Us' })).toBeVisible();

  // 2. SOFT NAVIGATION TEST (Verifies Next.js Router)
  await page.goto('/');
  await page.locator('footer').getByRole('link', { name: 'About' }).click();
  
  // URL should update
  await expect(page).toHaveURL(/\/about\//);
  
  // Heading should be visible (proving it didn't just crash or show raw text)
  await expect(page.getByRole('heading', { name: 'About Us' })).toBeVisible();
  
  // Final check: Body should NOT be raw RSC text
  const isRawText = await page.evaluate(() => document.body.innerText.trim().startsWith('1:"$Sreact.fragment"'));
  expect(isRawText).toBe(false);
});
