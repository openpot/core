'use client';

import { useState, useEffect, useCallback } from 'react';

import { APP_VERSION as CURRENT_VERSION } from '@/lib/version';
import { RELEASES } from '@/data/releases';

const AUTO_UPDATE_KEY = 'openpot_auto_update';
const INSTALL_DATE_KEY = 'openpot_install_date';
const SAVED_VERSION_KEY = 'openpot_app_version';

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${d}.${m}.${y} ${h}:${min}`;
  } catch (e) {
    return 'Unknown';
  }
};

type UpdateStatus = 'idle' | 'checking' | 'up-to-date' | 'available' | 'pulling' | 'ready' | 'error';

/**
 * Network Settings Component
 * Enforces 'Zero-Network Activity' by giving the user explicit control
 * over service worker update checks.
 */
export function NetworkSettings() {
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [serverVersion, setServerVersion] = useState<string | null>(null);
  const [installDate, setInstallDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('op_last_update_check');
    }
    return null;
  });

  // Persist lastChecked
  useEffect(() => {
    if (lastChecked) {
      localStorage.setItem('op_last_update_check', lastChecked);
    }
  }, [lastChecked]);

  /**
   * Phase 1: Check for Updates
   * Fetches the build-time version manifest WITHOUT triggering a SW update.
   */
  const checkUpdate = useCallback(async () => {
    setStatus('checking');
    try {
      // Small metadata fetch - strictly for comparison
      const response = await fetch(`/version.json?t=${Date.now()}`);
      if (!response.ok) throw new Error('Fetch failed');
      
      const data = await response.json();
      const latestVersion = data.version as string;
      setServerVersion(latestVersion);

      // Normalize: remove leading 'v' and build hashes for comparison
      const cleanCurrent = CURRENT_VERSION.split('-')[0].replace(/^v/, '');
      const cleanLatest = latestVersion.split('-')[0].replace(/^v/, '');

      setLastChecked(new Date().toLocaleString());

      if (cleanCurrent === cleanLatest) {
        setStatus('up-to-date');
      } else {
        setStatus('available');
        setShowModal(true);
      }
    } catch (err) {
      console.error('Check failed:', err);
      setStatus('error');
    }
  }, []);

  /**
   * Phase 2: Download Updates
   * Explicitly triggers the Service Worker update check and download.
   */
  const pullUpdate = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;
    setStatus('pulling');
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        // 1. If we're already waiting, go straight to ready
        if (registration.waiting) {
          setStatus('ready');
          return;
        }

        // 2. Setup a listener for the incoming update
        const onUpdateFound = () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                setStatus('ready');
              }
            });
          }
        };

        registration.addEventListener('updatefound', onUpdateFound);

        // 3. Trigger the update
        await registration.update();
        
        // 4. Fallback: Check if it finished instantly or was already installing
        if (registration.waiting) {
          setStatus('ready');
        } else if (registration.installing) {
          onUpdateFound();
        } else {
          // Safety timeout if registration.update() finishes but no worker is found
          // (This can happen if the browser determines the hashes match after a deeper check)
          setTimeout(() => {
            if (!registration.waiting && !registration.installing) {
              setStatus('up-to-date');
            }
          }, 3000);
        }
      }
    } catch (err) {
      console.error('Pull failed:', err);
      setStatus('error');
    }
  }, []);

  /**
   * Phase 3: Apply Update
   * Replaces the old worker with the new one and reloads the page.
   */
  const applyUpdate = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;
    
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.waiting) {
      // 1. Setup a one-time listener for the new worker taking control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      }, { once: true });

      // 2. Tell the waiting worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(AUTO_UPDATE_KEY);
    setAutoUpdate(saved === 'true');
    
    // Installation Date Logic
    const lastVersion = localStorage.getItem(SAVED_VERSION_KEY);
    let savedDate = localStorage.getItem(INSTALL_DATE_KEY);

    if (lastVersion !== CURRENT_VERSION) {
      // New version detected! Update the installation date to now.
      savedDate = new Date().toISOString();
      localStorage.setItem(SAVED_VERSION_KEY, CURRENT_VERSION);
      localStorage.setItem(INSTALL_DATE_KEY, savedDate);
    } else if (!savedDate && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      savedDate = new Date().toISOString();
      localStorage.setItem(INSTALL_DATE_KEY, savedDate);
    }
    
    if (savedDate) setInstallDate(savedDate);

    // Check for "waiting" worker on mount
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg?.waiting) setStatus('ready');
      });
    }
  }, []);

  // Revert 'up-to-date' back to 'idle' after 5 seconds
  useEffect(() => {
    if (status === 'up-to-date') {
      const timer = setTimeout(() => setStatus('idle'), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Background Auto-Update Sequence
  useEffect(() => {
    if (!autoUpdate) return;

    // Check once on mount/enable
    const initialTimer = setTimeout(() => {
      if (status === 'idle') checkUpdate();
    }, 5000);

    // Poll every 30 minutes
    const intervalId = setInterval(() => {
      // Only start a sequence if we are idle or already partially through one
      if (status === 'idle' || status === 'up-to-date' || status === 'error') {
        checkUpdate();
      }
    }, 1800000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalId);
    };
  }, [autoUpdate, status, checkUpdate]);

  // Handle automatic progression through update stages
  useEffect(() => {
    if (!autoUpdate) return;

    if (status === 'available') {
      pullUpdate();
    } else if (status === 'ready') {
      applyUpdate();
    }
  }, [status, autoUpdate, pullUpdate, applyUpdate]);

  const toggleAutoUpdate = (enabled: boolean) => {
    setAutoUpdate(enabled);
    localStorage.setItem(AUTO_UPDATE_KEY, String(enabled));
  };



  const getFilteredReleases = () => {
    if (!serverVersion) return [];
    
    // Normalize: remove leading 'v' if present, and remove build hash
    const cleanCurrent = CURRENT_VERSION.split('-')[0].replace(/^v/, '');
    
    // Find all releases newer than current version
    const currentIndex = RELEASES.findIndex(r => r.version.replace(/^v/, '') === cleanCurrent);
    
    if (currentIndex === -1) {
      // If current version not found (e.g. dev build), show only latest
      return RELEASES.slice(0, 1);
    }
    
    // If we are at the latest version, but the popup was triggered (e.g. build hash mismatch),
    // show at least the latest release note.
    if (currentIndex === 0) {
        return RELEASES.slice(0, 1);
    }

    return RELEASES.slice(0, currentIndex);
  };

  return (
    <div className="mt-8 space-y-6 rounded-xl border border-border-subtle bg-bg-overlay/50 p-6">
      <div className="space-y-1">
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-primary">
          Network & Privacy Controls
        </h3>
        <p className="text-xs text-text-tertiary">
          Openpot runs 100% offline. You control when it communicates with the server.
        </p>
      </div>

      {/* Background Toggle */}
      <div className="flex flex-col gap-6 border-b border-border-subtle pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">Background Auto-Updates</span>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${autoUpdate ? 'bg-success/20 text-success' : 'bg-text-tertiary/10 text-text-tertiary'}`}>
              {autoUpdate ? 'Active' : 'Disabled'}
            </span>
          </div>
          <p className="max-w-md text-xs text-text-secondary leading-relaxed">
            Automatic update checks are disabled by default to ensure zero unauthorized network activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => toggleAutoUpdate(!autoUpdate)}
          className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            autoUpdate ? 'bg-primary' : 'bg-bg-subtle border border-border'
          }`}
          aria-pressed={autoUpdate}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ease-in-out ${
              autoUpdate ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>

      {/* Multi-Stage Update UI */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-text-primary tracking-wider">Software Version</p>
            <div className="flex flex-col items-start gap-1">
              <code className="rounded bg-bg-subtle px-1.5 py-0.5 text-[10px] text-text-secondary">{CURRENT_VERSION}</code>
              <p className="text-[10px] text-text-tertiary">
                {installDate ? `Installed on ${formatDate(installDate)}` : 'Installing...'}
                {lastChecked && ` • Checked on ${formatDate(lastChecked)}`}
              </p>
            </div>
          </div>
          
          {status === 'idle' && (
            <button
              onClick={checkUpdate}
              className="inline-flex h-9 w-24 items-center justify-center whitespace-nowrap rounded-lg bg-bg-overlay border border-border px-3 text-[10px] font-bold text-text-primary transition-all hover:bg-bg-subtle"
            >
              Check
            </button>
          )}

          {status === 'checking' && (
            <span className="flex items-center gap-2 text-xs text-text-tertiary whitespace-nowrap">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Comparing builds...
            </span>
          )}

          {status === 'up-to-date' && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-success whitespace-nowrap">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              Up to Date
            </span>
          )}

          {status === 'error' && (
            <button
              onClick={checkUpdate}
              className="text-xs font-bold text-danger whitespace-nowrap hover:underline"
            >
              Retry Check
            </button>
          )}
        </div>

        {/* Phase 2: Pull Available Updates */}
        {status === 'available' && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-[180px] flex-1 space-y-1">
                <p className="text-xs font-bold text-primary italic">Update Available!</p>
                <p className="text-[10px] text-text-secondary leading-tight">
                  New build version: <code className="text-text-primary">{serverVersion}</code>
                </p>
              </div>
              <button
                onClick={pullUpdate}
                className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg bg-primary px-4 text-xs font-bold text-white transition-all hover:opacity-90 shadow-lg shadow-primary/20"
              >
                Download Updates
              </button>
            </div>
          </div>
        )}

        {/* Phase 3: Apply Ready Update */}
        {status === 'pulling' && (
          <div className="flex items-center justify-center p-4">
             <div className="flex items-center gap-3 text-xs text-text-secondary">
               <div className="h-1.5 w-32 overflow-hidden rounded-full bg-bg-subtle">
                 <div className="h-full w-2/3 animate-pulse bg-primary" />
               </div>
               <span className="whitespace-nowrap">Downloading new assets...</span>
             </div>
          </div>
        )}

        {status === 'ready' && (
          <div className="rounded-lg bg-success/10 border border-success/30 p-4 animate-bounce-subtle">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-[180px] flex-1 space-y-1">
                <p className="text-xs font-bold text-success uppercase tracking-wider">Updates downloaded</p>
                <p className="text-[10px] text-text-secondary">New code is downloaded. Apply now to finish.</p>
              </div>
              <button
                onClick={applyUpdate}
                className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg bg-success px-4 text-xs font-bold text-white transition-all hover:opacity-90"
              >
                Install & Reload
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Release Notes Modal */}
      {showModal && serverVersion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="panel-shell relative w-full max-w-lg overflow-hidden border border-border-subtle bg-bg-page p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-6 flex items-center justify-between border-b border-border-subtle pb-4">
              <h3 className="text-lg font-bold text-text-primary">Latest Releases</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-text-tertiary transition-colors hover:text-text-primary"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-6 mb-8 custom-scrollbar text-left">
              {getFilteredReleases().map((release) => (
                <div key={release.version} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-x-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-tighter bg-primary/10 px-1.5 py-0.5 rounded w-fit">
                      {release.version}
                    </span>
                    <span className="text-xs font-bold text-text-primary">{release.title}</span>
                  </div>
                  <ul className="space-y-1.5 text-[13px] text-text-secondary list-none pl-1">
                    {release.changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {getFilteredReleases().length === 0 && (
                <p className="text-xs italic text-text-tertiary text-center py-4">
                  Stability improvements and security patches.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-6">
              <button
                onClick={() => setShowModal(false)}
                className="h-10 px-4 text-xs font-bold text-text-secondary transition-colors hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowModal(false);
                  await pullUpdate();
                }}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
