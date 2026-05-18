import React, { useEffect, useState } from 'react';
import { useViewport } from '../hooks/useViewport';

const STORAGE_KEY = 'rotate-hint-dismissed';

export const RotateHint: React.FC = () => {
  const { breakpoint, orientation } = useViewport();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (orientation === 'landscape') setDismissed(false);
  }, [orientation]);

  if (breakpoint !== 'phone' || orientation !== 'portrait' || dismissed) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
    setDismissed(true);
  };

  return (
    <div className="rotate-hint" role="status">
      <span>↻ Rotate for the full scoreboard</span>
      <button type="button" onClick={dismiss} aria-label="dismiss hint">✕</button>
    </div>
  );
};

export default RotateHint;
