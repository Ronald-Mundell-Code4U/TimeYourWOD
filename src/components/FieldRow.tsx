import React from 'react';

interface Props {
  prefix: string;
  suffix: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
}

export const FieldRow: React.FC<Props> = ({
  prefix,
  suffix,
  value,
  onChange,
  min = 0,
  max,
  ariaLabel,
}) => {
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = Number(e.target.value);
    if (Number.isNaN(v)) v = min;
    if (v < min) v = min;
    if (max !== undefined && v > max) v = max;
    onChange(v);
  };
  return (
    <>
      <span className="form-stack__prefix">{prefix}</span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={handle}
        className="form-stack__input"
        aria-label={ariaLabel ?? `${prefix} ${suffix}`.trim()}
      />
      <span className="form-stack__suffix">{suffix}</span>
    </>
  );
};

export default FieldRow;
