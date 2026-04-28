import { expect, test } from '@playwright/test';

async function injectLargeSession(page: import('@playwright/test').Page) {
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
      session_id: 'massive-session-1',
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      duration_seconds: 60,
      amount: 50.5, // Exceeds 50g limit
      amount_unit: 'g',
    };

    await new Promise<void>((resolve, reject) => {
      const putRequest = store.put(mockSession);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    });

    database.close();
  });
}

test('dismisses PWA install banner and persists choice', async ({ page }) => {
  await page.goto('/');

  // The banner might not show natively in Playwright due to missing PWA requirements in headless,
  // but we can mock the beforeinstallprompt event if needed. However, since the code checks
  // showInstallPromotion = !isInstalled && !isDismissed && (isIOS || !!installPrompt),
  // we can mock iOS user agent or dispatch beforeinstallprompt to ensure it shows.
  
  // We'll set the user agent to iOS to force the banner to appear.
});

test.use({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1' });

test('dismisses iOS PWA install banner and persists choice via localStorage', async ({ page }) => {
  await page.goto('/');

  // 1. Verify banner is visible
  const bannerHeader = page.getByText('Install Openpot', { exact: true });
  await expect(bannerHeader).toBeVisible();

  // 2. Click dismiss 'X'
  await page.getByLabel('Dismiss install banner').click();

  // 3. Verify it is hidden
  await expect(bannerHeader).not.toBeVisible();

  // 4. Reload page and verify it remains hidden
  await page.reload();
  await expect(bannerHeader).not.toBeVisible();

  // 5. Verify localStorage state
  const isDismissed = await page.evaluate(() => window.localStorage.getItem('openpot_install_dismissed'));
  expect(isDismissed).toBe('true');
});

test('blocks session start and shows warning when 50g quota is exceeded', async ({ page }) => {
  await page.goto('/');
  await injectLargeSession(page);
  await page.reload();

  // The MonthlyQuotaCard should show 50.500g / 50.000g
  // Due to HTML structure, they are in different spans, so we check for both.
  await expect(page.getByText('50.500g')).toBeVisible();
  await expect(page.getByText('/ 50.000g')).toBeVisible();

  // Attempt to start a new session with 1g
  await page.getByText('Flower').click();
  const amountInput = page.locator('#input-amount-stepper');
  await amountInput.fill('1.0');
  await page.getByRole('button', { name: 'g', exact: true }).click();
  await page.getByRole('button', { name: 'Save' }).click();

  await page.getByTestId('primary-timer-button').click();

  // Warning modal should appear
  await expect(page.getByText('Quota Threshold Warning')).toBeVisible();
  await expect(page.getByText('Disregard')).toBeVisible();

  // Click continue
  await page.getByRole('button', { name: 'Disregard' }).click();

  // Session should now be active (button says "Stop Session")
  await expect(page.getByTestId('primary-timer-button')).toHaveText('Stop Session');
});
