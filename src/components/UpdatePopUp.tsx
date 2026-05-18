import React, { useEffect, useState } from 'react';

interface Props {
  storageKey: string; // bump this to re-show
  title: string;
  body: string;
}

export const UpdatePopUp: React.FC<Props> = ({ storageKey, title, body }) => {
  const [exited, setExited] = useState(true);

  useEffect(() => {
    setExited(localStorage.getItem(storageKey) === 'true');
  }, [storageKey]);

  if (exited) return null;

  const dismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setExited(true);
  };

  return (
    <div className="update-banner" role="status">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
        }}
      >
        <div
          style={{
            fontSize: '0.78rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontWeight: 800,
          }}
        >
          {title}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="dismiss"
          style={{
            background: 'transparent',
            border: '1px solid var(--line)',
            color: 'var(--fg)',
            fontFamily: 'inherit',
            cursor: 'pointer',
            width: 32,
            height: 32,
            fontSize: '0.9rem',
            borderRadius: 2,
          }}
        >
          ✕
        </button>
      </div>
      <div
        style={{
          fontSize: '0.82rem',
          lineHeight: 1.55,
          color: 'var(--fg-dim)',
          whiteSpace: 'pre-line',
        }}
      >
        {body}
      </div>
    </div>
  );
};

export default UpdatePopUp;
