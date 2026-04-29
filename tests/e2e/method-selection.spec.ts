import { expect, test } from '@playwright/test';

/**
 * Reads all sessions from the IndexedDB 'sessionQueue' store.
 */
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

/**
 * Injects a ghost library entry so "Purple Rain" appears as an existing strain suggestion.
 */
async function injectGhostName(page: import('@playwright/test').Page, name: string) {
  await page.evaluate(async (ghostName) => {
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

    const transaction = database.transaction('ghostLibrary', 'readwrite');
    const store = transaction.objectStore('ghostLibrary');

    await new Promise<void>((resolve, reject) => {
      const putRequest = store.put({ name: ghostName });
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    });

    database.close();
  }, name);
}

// ---------------------------------------------------------------------------
// Test 1: Select Flower → click X (close) → nothing should be selected
// ---------------------------------------------------------------------------
test('clicking X on the amount modal cancels method selection entirely', async ({ page }) => {
  await page.goto('/');

  // Click the "Flower" method pill — opens AmountInputModal
  await page.getByRole('button', { name: 'Flower' }).click();

  // Wait for modal to appear
  await expect(page.getByText('How much are you consuming?')).toBeVisible();

  // Click the X button to close without saving
  await page.getByLabel('Close without saving').click();

  // Modal should be closed
  await expect(page.getByText('How much are you consuming?')).not.toBeVisible();

  // Flower pill should NOT have the selected/active styling (no amount shown)
  // Verify that no method pill shows the active highlight by checking
  // the primary-timer-button still says "Start Session" (not pre-filled)
  await expect(page.getByTestId('primary-timer-button')).toHaveText('Start Session');

  // Verify no amount text is visible alongside Flower
  const flowerButton = page.getByRole('button', { name: 'Flower' });
  await expect(flowerButton).not.toContainText('g');
});

// ---------------------------------------------------------------------------
// Test 2: Select Flower → click Skip → Flower selected but no amount
// ---------------------------------------------------------------------------
test('clicking Skip selects the method but stores no amount', async ({ page }) => {
  await page.goto('/');

  // Click Flower to open the amount modal
  await page.getByRole('button', { name: 'Flower' }).click();
  await expect(page.getByText('How much are you consuming?')).toBeVisible();

  // Click "Skip" — this calls onSave(undefined, unit)
  await page.getByRole('button', { name: 'Skip' }).click();

  // Modal should close
  await expect(page.getByText('How much are you consuming?')).not.toBeVisible();

  // Flower pill should now be visually selected (has primary styling)
  // but should NOT show any amount value
  const flowerButton = page.getByRole('button', { name: 'Flower' });
  await expect(flowerButton).toBeVisible();
  await expect(flowerButton).not.toContainText('g');

  // Start and stop a quick session to verify the method is recorded without amount
  await page.getByTestId('primary-timer-button').click();
  await page.waitForTimeout(1200);
  await page.getByTestId('primary-timer-button').click();

  // Verify in IndexedDB that method is "Flower" but amount is undefined/missing
  const sessions = await readSessions(page);
  expect(sessions).toHaveLength(1);
  const session = sessions[0] as any;
  expect(session.method).toBe('Flower');
  expect(session.amount).toBeUndefined();
});

// ---------------------------------------------------------------------------
// Test 3: Flower + 1.23g + NEW strain "Purple Rain" → start/stop → verify log
// ---------------------------------------------------------------------------
test('creates a session with Flower 1.23g and a new strain "Purple Rain"', async ({ page }) => {
  await page.goto('/');

  // 1. Select Flower method
  await page.getByRole('button', { name: 'Flower' }).click();
  await expect(page.getByText('How much are you consuming?')).toBeVisible();

  // 2. Input 1.23g
  const amountInput = page.locator('#input-amount-stepper');
  await amountInput.fill('1.23');
  // Ensure "g" unit is selected
  await page.getByRole('button', { name: 'g', exact: true }).click();
  await page.getByRole('button', { name: 'Save' }).click();

  // 3. Type a NEW strain name "Purple Rain"
  await page.locator('#custom-name').fill('Purple Rain');

  // 4. Start session
  await page.getByTestId('primary-timer-button').click();
  await page.waitForTimeout(1500);

  // 5. Stop session
  await page.getByTestId('primary-timer-button').click();

  // 6. Dismiss rating (click any)
  await expect(page.getByText('How are you feeling?')).toBeVisible();
  await page.getByText('Mellow').click();

  // 7. Verify session appears in history with correct metadata
  const sessionList = page.getByTestId('session-list');
  await expect(sessionList).toContainText('Purple Rain');
  await expect(sessionList).toContainText('Flower');
  await expect(sessionList).toContainText('1.23g');

  // 8. Verify IndexedDB record
  const sessions = await readSessions(page);
  const session = sessions.find((s: any) => s.custom_name === 'Purple Rain') as any;
  expect(session).toBeDefined();
  expect(session).toMatchObject({
    custom_name: 'Purple Rain',
    method: 'Flower',
    amount: 1.23,
    amount_unit: 'g',
    rating: 'Mellow',
    duration_seconds: expect.any(Number),
  });
  expect(session.duration_seconds).toBeGreaterThanOrEqual(1);
});

// ---------------------------------------------------------------------------
// Test 4: Flower + 1.23g + EXISTING strain "Purple Rain" (from ghost library)
//         → start/stop → verify log
// ---------------------------------------------------------------------------
test('creates a session by selecting existing strain "Purple Rain" from suggestions', async ({ page }) => {
  // Pre-inject "Purple Rain" into the ghost library so it appears as a suggestion pill
  await page.goto('/');
  await injectGhostName(page, 'Purple Rain');
  await page.reload();

  // 1. Select Flower method
  await page.getByRole('button', { name: 'Flower' }).click();
  await expect(page.getByText('How much are you consuming?')).toBeVisible();

  // 2. Input 1.23g
  const amountInput = page.locator('#input-amount-stepper');
  await amountInput.fill('1.23');
  await page.getByRole('button', { name: 'g', exact: true }).click();
  await page.getByRole('button', { name: 'Save' }).click();

  // 3. Click the "Purple Rain" suggestion pill from the ghost library
  await page.getByRole('button', { name: 'Purple Rain' }).click();

  // Verify the custom name input now contains "Purple Rain"
  await expect(page.locator('#custom-name')).toHaveValue('Purple Rain');

  // 4. Start session
  await page.getByTestId('primary-timer-button').click();
  await page.waitForTimeout(1500);

  // 5. Stop session
  await page.getByTestId('primary-timer-button').click();

  // 6. Rate session
  await expect(page.getByText('How are you feeling?')).toBeVisible();
  await page.getByText('Dialed In').click();

  // 7. Verify session in history
  const sessionList = page.getByTestId('session-list');
  await expect(sessionList).toContainText('Purple Rain');
  await expect(sessionList).toContainText('Flower');
  await expect(sessionList).toContainText('1.23g');
  await expect(sessionList).toContainText('Dialed In');

  // 8. Verify IndexedDB record
  const sessions = await readSessions(page);
  const session = sessions.find((s: any) => s.custom_name === 'Purple Rain') as any;
  expect(session).toBeDefined();
  expect(session).toMatchObject({
    custom_name: 'Purple Rain',
    method: 'Flower',
    amount: 1.23,
    amount_unit: 'g',
    rating: 'Dialed In',
    duration_seconds: expect.any(Number),
  });
  expect(session.duration_seconds).toBeGreaterThanOrEqual(1);
});
