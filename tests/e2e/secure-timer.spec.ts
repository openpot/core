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
  await page.goto('/');

  await expect(page.getByTestId('timer-state')).toHaveText('Ready');
  await expect(page.getByTestId('timer-display')).toHaveText('00:00');
  await expect(page.getByText('Secured locally. Synced anonymously.')).toBeVisible();

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
        src: '/icon.png',
        sizes: '512x512',
      }),
    ]),
  );

  await expect
    .poll(async () => {
      return page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        return (
          registration?.active?.scriptURL ??
          registration?.installing?.scriptURL ??
          registration?.waiting?.scriptURL ??
          null
        );
      });
    })
    .toContain('/sw.js');

  const accessibilityScan = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScan.violations).toEqual([]);
});

test('queues a session offline and syncs it after reconnect', async ({ context, page }) => {
  const syncPayloads: unknown[] = [];

  await context.route('**/api/sync', async (route) => {
    syncPayloads.push(route.request().postDataJSON());
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto('/');

  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));

  await page.getByTestId('primary-timer-button').click();
  await page.waitForTimeout(1200);
  await page.getByTestId('primary-timer-button').click();

  await expect(page.getByTestId('secure-notice')).toContainText('Data Secured Locally');
  await expect(page.getByTestId('pending-count')).toHaveText('1');
  await expect(page.getByTestId('sync-state')).toContainText('offline');

  await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event('online')));

  await expect
    .poll(async () => {
      return page.getByTestId('pending-count').textContent();
    })
    .toBe('0');

  await expect.poll(() => syncPayloads.length).toBe(1);

  const [firstPayload] = syncPayloads;

  expect(firstPayload).toMatchObject({
    duration_seconds: expect.any(Number),
    end_time: expect.any(String),
    session_id: expect.any(String),
    start_time: expect.any(String),
    sync_status: 'PENDING',
  });

  const sessions = await readSessions(page);
  expect(sessions).toHaveLength(1);
  expect(sessions[0]).toMatchObject({
    sync_status: 'SYNCED',
  });
});
