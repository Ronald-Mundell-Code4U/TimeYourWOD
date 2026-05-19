import React from 'react';

export const KoFiPopUp: React.FC = () => (
  <a
    href="https://ko-fi.com/timeyourwod"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.4rem 0.65rem',
      border: '1px solid var(--line)',
      borderRadius: 2,
      fontSize: '0.7rem',
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'var(--fg)',
    }}
    aria-label="support on ko-fi"
  >
    ♥ SUPPORT
  </a>
);

export default KoFiPopUp;
