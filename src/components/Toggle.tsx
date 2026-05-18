import React from 'react';

interface Props {
  isChecked: boolean;
  handleChange: () => void;
  Label: [string, string]; // [onLabel, offLabel]
}

export const Toggle: React.FC<Props> = ({ isChecked, handleChange, Label }) => {
  // reserve width for the longer of the two labels so the layout never shifts
  const longest = Label[0].length >= Label[1].length ? Label[0] : Label[1];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      onClick={handleChange}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'transparent',
        border: '2px solid var(--line)',
        borderRadius: 2,
        padding: '0.5rem 0.85rem',
        cursor: 'pointer',
        minHeight: 44,
        fontFamily: 'inherit',
        color: 'var(--fg)',
      }}
    >
      <span
        style={{
          width: 36,
          height: 18,
          borderRadius: 2,
          background: isChecked ? 'var(--fg)' : 'var(--bg-elev)',
          border: '1px solid var(--line)',
          position: 'relative',
          transition: 'background 120ms ease',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 1,
            left: isChecked ? 19 : 1,
            width: 14,
            height: 14,
            background: isChecked ? 'var(--bg)' : 'var(--fg)',
            transition: 'left 120ms ease, background 120ms ease',
          }}
        />
      </span>
      {/* invisible reservation so the button width never changes */}
      <span style={{ display: 'inline-grid' }}>
        <span
          aria-hidden
          style={{
            gridArea: '1 / 1',
            visibility: 'hidden',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 600,
            fontSize: '0.8rem',
            whiteSpace: 'nowrap',
          }}
        >
          {longest}
        </span>
        <span
          style={{
            gridArea: '1 / 1',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 600,
            fontSize: '0.8rem',
            color: isChecked ? 'var(--fg)' : 'var(--fg-dim)',
            textAlign: 'center',
          }}
        >
          {isChecked ? Label[0] : Label[1]}
        </span>
      </span>
    </button>
  );
};
