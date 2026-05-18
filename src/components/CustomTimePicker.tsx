import React, { useEffect, useState } from 'react';

interface Props {
  /** total value in seconds */
  value: number;
  onChange: (totalSeconds: number) => void;
  showHours?: boolean;
  ariaLabel?: string;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const CustomTimePicker: React.FC<Props> = ({
  value,
  onChange,
  showHours = false,
  ariaLabel = 'time picker',
}) => {
  const [h, setH] = useState(Math.floor(value / 3600));
  const [m, setM] = useState(Math.floor((value % 3600) / 60));
  const [s, setS] = useState(value % 60);

  useEffect(() => {
    setH(Math.floor(value / 3600));
    setM(Math.floor((value % 3600) / 60));
    setS(value % 60);
  }, [value]);

  const emit = (hh: number, mm: number, ss: number) => {
    onChange(hh * 3600 + mm * 60 + ss);
  };

  const cellStyle: React.CSSProperties = {
    width: 64,
    height: 56,
    fontSize: '1.5rem',
    background: 'var(--bg-elev)',
    border: '2px solid var(--line)',
    color: 'var(--fg)',
    textAlign: 'center',
    fontFamily: 'inherit',
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    borderRadius: 2,
  };

  const colonStyle: React.CSSProperties = {
    fontSize: '1.6rem',
    color: 'var(--fg-dim)',
    padding: '0 0.35rem',
    alignSelf: 'center',
    fontWeight: 700,
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={{ display: 'inline-flex', alignItems: 'stretch', gap: 2 }}
    >
      {showHours && (
        <>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={23}
            value={h}
            onChange={(e) => {
              const v = clamp(Number(e.target.value || 0), 0, 23);
              setH(v);
              emit(v, m, s);
            }}
            style={cellStyle}
            aria-label="hours"
          />
          <span style={colonStyle}>:</span>
        </>
      )}
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={59}
        value={m}
        onChange={(e) => {
          const v = clamp(Number(e.target.value || 0), 0, 59);
          setM(v);
          emit(h, v, s);
        }}
        style={cellStyle}
        aria-label="minutes"
      />
      <span style={colonStyle}>:</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={59}
        value={s}
        onChange={(e) => {
          const v = clamp(Number(e.target.value || 0), 0, 59);
          setS(v);
          emit(h, m, v);
        }}
        style={cellStyle}
        aria-label="seconds"
      />
    </div>
  );
};
