import React, { useEffect, useRef, useState } from 'react';

interface Props {
  prefix: string;
  suffix: string;
  value: number;
  onChange: (v: number) => void;
  /** advisory only — START button is what actually blocks invalid configs */
  min?: number;
  max?: number;
  ariaLabel?: string;
}

export const FieldRow: React.FC<Props> = ({
  prefix,
  suffix,
  value,
  onChange,
  max,
  ariaLabel,
}) => {
  // Track raw text separately so the user can clear the field (going to "")
  // without it snapping back to a number. The parsed numeric value (0 when
  // empty) propagates to the parent, which uses it to disable START.
  const [raw, setRaw] = useState(String(value));
  const editing = useRef(false);
  useEffect(() => {
    if (!editing.current && value !== Number(raw)) setRaw(String(value));
    // sync only on external parent updates, not on local raw edits
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^0-9]/g, '');
    setRaw(cleaned);
    if (cleaned === '') {
      onChange(0);
      return;
    }
    let n = Number(cleaned);
    if (Number.isNaN(n)) n = 0;
    if (max !== undefined && n > max) {
      n = max;
      setRaw(String(n));
    }
    onChange(n);
  };
  return (
    <>
      <span className="form-stack__prefix">{prefix}</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        max={max}
        value={raw}
        onChange={handle}
        onFocus={() => { editing.current = true; }}
        onBlur={() => { editing.current = false; }}
        className="form-stack__input"
        aria-label={ariaLabel ?? `${prefix} ${suffix}`.trim()}
      />
      <span className="form-stack__suffix">{suffix}</span>
    </>
  );
};

export default FieldRow;
