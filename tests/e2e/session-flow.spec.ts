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

test('completes a session without a rating and verifies correct logging', async ({ page }) => {
  await page.goto('/');

  // 1. Setup session details
  const sessionName = 'Unrated Session Test';
  await page.locator('#custom-name').fill(sessionName);

  // 2. Select method and amount
  await page.getByRole('button', { name: 'Flower' }).click();
  const amountInput = page.locator('#input-amount-stepper');
  await amountInput.fill('1.0');
  await page.getByRole('button', { name: 'Save' }).click();

  // 3. Start session
  await page.getByTestId('primary-timer-button').click();
  await expect(page.getByTestId('primary-timer-button')).toHaveText('Stop Session');

  // 4. Wait for a short duration
  await page.waitForTimeout(1500);

  // 5. Stop session
  await page.getByTestId('primary-timer-button').click();

  // 6. Verify rating modal appears and click "Skip"
  await expect(page.getByText('How are you feeling?')).toBeVisible();
  await page.getByRole('button', { name: 'Skip' }).click();

  // 7. Verify modal disappears
  await expect(page.getByText('How are you feeling?')).not.toBeVisible();

  // 8. Verify session appears in history
  const sessionList = page.getByTestId('session-list');
  await expect(sessionList).toContainText(sessionName);

  // 9. Verify IndexedDB record has no rating
  const sessions = await readSessions(page);
  const session = sessions.find((s: any) => s.custom_name === sessionName) as any;
  
  expect(session).toBeDefined();
  expect(session.custom_name).toBe(sessionName);
  expect(session.method).toBe('Flower');
  expect(session.amount).toBe(1.0);
  
  // Rating should be undefined or null if skipped
  expect(session.rating).toBeUndefined();
});
