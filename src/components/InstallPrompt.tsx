import React, { useEffect, useState } from 'react';
import { useViewport } from '../hooks/useViewport';
import * as gtag from '../lib/gtag';

const APP_STORE_URL = 'https://apps.apple.com/us/app/timeyourwod/id6698851328';
const DISMISS_KEY = 'install-prompt-dismissed-v1';
const SHOW_DELAY_MS = 600;

const isStandalonePWA = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  return (navigator as unknown as { standalone?: boolean }).standalone === true;
};

const wasDismissed = (): boolean => {
  try {
    return localStorage.getItem(DISMISS_KEY) === 'true';
  } catch {
    return false;
  }
};

export const InstallPrompt: React.FC = () => {
  const { breakpoint } = useViewport();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (breakpoint !== 'phone') return;
    if (isStandalonePWA()) return;
    if (wasDismissed()) return;

    const t = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [breakpoint]);

  // Escape closes
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch {}
    setVisible(false);
    gtag.event('install_prompt_dismiss');
  };

  const open = () => {
    gtag.event('install_prompt_click');
    window.open(APP_STORE_URL, '_blank', 'noopener,noreferrer');
    dismiss();
  };

  if (!visible) return null;

  return (
    <div className="modal-backdrop" onClick={dismiss} role="presentation">
      <div
        className="modal install-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-modal-title"
      >
        <img
          src="/apple-touch-icon.png"
          alt=""
          className="install-modal__icon"
          width={96}
          height={96}
        />
        <h2 id="install-modal-title" className="install-modal__title">
          TimeYourWOD
        </h2>
        <div className="install-modal__sub">Available on the App Store</div>
        <p className="install-modal__body">
          Get the native iOS app for fullscreen workouts, background audio, and offline use.
        </p>
        <div className="install-modal__actions">
          <button type="button" className="btn-cmd" onClick={open}>
            Get the App
          </button>
          <button type="button" className="btn-ghost" onClick={dismiss}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
