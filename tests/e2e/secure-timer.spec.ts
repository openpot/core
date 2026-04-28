import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function readSessions(page: import('@playwright/test').Page) {
  return page.evaluate(async () => {
    const request = indexedDB.open('openpot-db', 3);

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

test('saves a completed session securely to local IndexedDB', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('primary-timer-button').click();
  await page.waitForTimeout(1200);
  await page.getByTestId('primary-timer-button').click();

  await expect(page.getByTestId('primary-timer-button')).toHaveText('New Session');

  const sessions = await readSessions(page);
  expect(sessions).toHaveLength(1);
  const session = sessions[0] as any;
  expect(session).toMatchObject({
    duration_seconds: expect.any(Number),
    end_time: expect.any(String),
    session_id: expect.any(String),
    start_time: expect.any(String),
  });
});

test('starts and completes a session with full telemetry metadata', async ({ page }) => {
  await page.goto('/');

  // 1. Input custom name (Strain)
  await page.locator('#custom-name').fill('Blue Dream');

  // 2. Select Method
  await page.getByText('Flower').click();

  // 3. Input Amount
  const amountInput = page.locator('#input-amount-stepper');
  await amountInput.fill('1.5');
  await page.getByRole('button', { name: 'g', exact: true }).click();
  await page.getByRole('button', { name: 'Save' }).click();

  // 4. Start session and wait
  await page.getByTestId('primary-timer-button').click();
  await page.waitForTimeout(2000);

  // 5. Stop session
  await page.getByTestId('primary-timer-button').click();

  // 6. Rate session
  await expect(page.getByText('How are you feeling?')).toBeVisible();
  await page.getByText('Dialed In').click();

  // 7. Verify History List Rendering
  const sessionList = page.getByTestId('session-list');
  await expect(sessionList).toContainText('Blue Dream');
  await expect(sessionList).toContainText('Flower');
  await expect(sessionList).toContainText('1.5g');
  await expect(sessionList).toContainText('Dialed In');

  // 8. Verify IndexedDB Payload
  const sessions = await readSessions(page);
  const session = sessions.find((s: any) => s.custom_name === 'Blue Dream') as any;
  expect(session).toBeDefined();
  expect(session).toMatchObject({
    custom_name: 'Blue Dream',
    method: 'Flower',
    amount: 1.5,
    amount_unit: 'g',
    rating: 'Dialed In',
    duration_seconds: expect.any(Number),
  });
  expect(session.duration_seconds).toBeGreaterThanOrEqual(1);
});
