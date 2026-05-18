import React from 'react';
import { Link } from 'react-router-dom';
import { useViewport } from '../hooks/useViewport';

export const CustomFooter: React.FC = () => {
  const { breakpoint } = useViewport();
  if (breakpoint === 'phone') return null;
  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 'var(--safe-b)',
        left: 'var(--safe-l)',
        right: 'var(--safe-r)',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        fontSize: '0.72rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--fg-dim)',
        pointerEvents: 'none',
        zIndex: 40,
      }}
    >
      <div style={{ pointerEvents: 'auto', display: 'flex', gap: '1.25rem' }}>
        <Link to="/about">ABOUT</Link>
        <Link to="/privacy-policy">PRIVACY</Link>
      </div>
    </footer>
  );
};

export default CustomFooter;
