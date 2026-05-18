import React from 'react';

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const SetupShell: React.FC<Props> = ({ title, subtitle, children }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: 'calc(72px + var(--safe-t))',
        paddingBottom: 'calc(80px + var(--safe-b))',
        paddingLeft: 'calc(1rem + var(--safe-l))',
        paddingRight: 'calc(1rem + var(--safe-r))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        overflowY: 'auto',
      }}
    >
      <div style={{ textAlign: 'center', width: '100%', maxWidth: 720 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(2rem, 8vw, 4.5rem)',
            letterSpacing: '-0.02em',
            fontWeight: 800,
            lineHeight: 0.95,
            color: 'var(--fg)',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              marginTop: '0.9rem',
              fontSize: '0.8rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--fg-dim)',
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      <div
        style={{
          width: '100%',
          maxWidth: 720,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SetupShell;
