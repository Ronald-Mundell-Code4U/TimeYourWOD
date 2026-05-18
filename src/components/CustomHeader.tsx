import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import SideDrawer from './SideDrawer';

const BackText: Record<string, string> = {
  '/clock': 'CLOCK',
  '/for-time': 'FOR TIME',
  '/tabata': 'TABATA',
  '/complex': 'COMPLEX',
  '/emom': 'EMOM',
  '/amrap': 'AMRAP',
  '/about': 'ABOUT',
  '/privacy-policy': 'PRIVACY',
};

const handleFullscreen = () => {
  const elem = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => void;
    msRequestFullscreen?: () => void;
  };
  const doc = document as Document & {
    webkitExitFullscreen?: () => void;
    msExitFullscreen?: () => void;
    webkitFullscreenElement?: Element;
  };
  if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
    if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
    else if (doc.msExitFullscreen) doc.msExitFullscreen();
  }
};

const CogIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" aria-hidden>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const FullscreenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden>
    <polyline points="4 9 4 4 9 4" />
    <polyline points="20 9 20 4 15 4" />
    <polyline points="4 15 4 20 9 20" />
    <polyline points="20 15 20 20 15 20" />
  </svg>
);

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden>
    <line x1="20" y1="12" x2="4" y2="12" />
    <polyline points="10 18 4 12 10 6" />
  </svg>
);

export const CustomHeader: React.FC = () => {
  const location = useLocation();
  const onHome = location.pathname === '/';
  const backLabel = BackText[location.pathname];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'calc(48px + var(--safe-t))',
        paddingTop: 'var(--safe-t)',
        paddingLeft: 'calc(1rem + var(--safe-l))',
        paddingRight: 'calc(1rem + var(--safe-r))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'transparent',
        zIndex: 60,
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', pointerEvents: 'auto' }}>
        {!onHome ? (
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.35rem 0.65rem',
              border: '1px solid var(--line)',
              borderRadius: 2,
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 600,
              minHeight: 36,
            }}
            aria-label="back to home"
          >
            <BackIcon />
            <span>{backLabel ?? 'HOME'}</span>
          </Link>
        ) : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontWeight: 800,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              fontSize: '0.78rem',
            }}
          >
            <span>TIMEYOURWOD</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', pointerEvents: 'auto' }}>
        {!onHome && (
          <button
            type="button"
            onClick={handleFullscreen}
            aria-label="toggle fullscreen"
            style={{
              background: 'transparent',
              border: '1px solid var(--line)',
              borderRadius: 2,
              padding: '0.4rem 0.5rem',
              cursor: 'pointer',
              color: 'var(--fg)',
              minHeight: 36,
              minWidth: 36,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FullscreenIcon />
          </button>
        )}
        {onHome && <SideDrawer trigger={<CogIcon />} />}
      </div>
    </header>
  );
};

export default CustomHeader;
