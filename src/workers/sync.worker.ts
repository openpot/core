/// <reference lib="webworker" />

import { flushPendingSessions, getSessionSummary } from '../lib/db/session-db';

declare const self: DedicatedWorkerGlobalScope;

let syncInFlight = false;

async function postSummary() {
  const summary = await getSessionSummary();
  self.postMessage({
    type: 'sync-summary',
    summary,
  });
}

async function flushQueue() {
  if (syncInFlight) {
    return;
  }

  if (!self.navigator.onLine) {
    await postSummary();
    return;
  }

  syncInFlight = true;

  try {
    const result = await flushPendingSessions(self.navigator.onLine);

    if (result.refreshRequired) {
      self.postMessage({ type: 'refresh-required' });
    }

    self.postMessage({
      type: 'sync-summary',
      summary: result.summary,
    });
  } finally {
    syncInFlight = false;
  }
}

self.addEventListener('message', (event: MessageEvent<{ type?: string }>) => {
  if (event.data.type === 'sync') {
    void flushQueue();
  }
});

void postSummary();
void flushQueue();
setInterval(() => {
  void flushQueue();
}, 5000);
