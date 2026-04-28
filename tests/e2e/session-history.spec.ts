import { expect, test } from '@playwright/test';

/**
 * Injects a mock session directly into IndexedDB to test history rendering
 * without requiring a full timer start/stop cycle.
 */
async function injectMockSession(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    const request = indexedDB.open('openpot-db', 3);

    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('sessionQueue')) {
          db.createObjectStore('sessionQueue', { keyPath: 'session_id' });
        }
        if (!db.objectStoreNames.contains('ghostLibrary')) {
          db.createObjectStore('ghostLibrary', { keyPath: 'name' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const transaction = database.transaction('sessionQueue', 'readwrite');
    const store = transaction.objectStore('sessionQueue');

    const mockSession = {
      session_id: 'test-session-123',
      start_time: new Date(Date.now() - 3600000).toISOString(),
      end_time: new Date().toISOString(),
      duration_seconds: 3600,
      custom_name: 'Sour Diesel',
      method: 'Vape',
      amount: 0.2,
      amount_unit: 'g',
      rating: 'Mellow',
    };

    await new Promise<void>((resolve, reject) => {
      const putRequest = store.put(mockSession);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    });

    database.close();
  });
}

test('renders injected history session and allows duration editing', async ({ page }) => {
  await page.goto('/');
  await injectMockSession(page);
  await page.reload();

  // 1. Verify rendering — duration uses verbose format "01h 00m 00s"
  const sessionList = page.getByTestId('session-list');
  await expect(sessionList).toContainText('Sour Diesel');
  await expect(sessionList).toContainText('Vape');
  await expect(sessionList).toContainText('0.2g');
  await expect(sessionList).toContainText('Mellow');
  await expect(sessionList).toContainText('01h 00m 00s');

  // 2. Edit duration via pencil icon
  await page.getByLabel('Edit most recent duration').click();

  // Wait for modal to open — title is "Adjust your session length"
  await expect(page.getByText('Adjust your session length')).toBeVisible();

  // The modal uses direct text inputs (no stepper buttons).
  // Clear hours field and type "02" to change to 2 hours.
  const hoursInput = page.locator('input[inputmode="numeric"]').first();
  await hoursInput.fill('02');

  await page.getByRole('button', { name: 'Save' }).click();

  // 3. Verify updated duration — now 2 hours
  await expect(sessionList).toContainText('02h 00m 00s');
});

test('allows deleting a session from history', async ({ page }) => {
  await page.goto('/');
  await injectMockSession(page);
  await page.reload();

  const sessionList = page.getByTestId('session-list');
  await expect(sessionList).toContainText('Sour Diesel');

  // 1. Click delete icon
  await page.getByLabel('Delete session').click();

  // 2. Verify confirmation UI
  await expect(page.getByText('Delete session?')).toBeVisible();

  // 3. Confirm deletion
  await page.getByLabel('Confirm deletion').click();

  // 4. Verify removal from UI
  await expect(sessionList).not.toContainText('Sour Diesel');
  await expect(page.getByText('No secured sessions yet')).toBeVisible();
});
