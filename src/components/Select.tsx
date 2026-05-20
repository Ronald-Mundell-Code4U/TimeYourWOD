import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface SelectOption<T> {
  label: string;
  value: T;
}

interface Props<T> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  title?: string;
  ariaLabel?: string;
}

/**
 * Web Select — uses .btn-cmd styling for the trigger so it visually matches
 * sibling command buttons (same width when both are `width: 100%`). Opens a
 * modal sheet with the options, mirroring the mobile Select UX.
 */
export function Select<T extends string | number>({
  value,
  options,
  onChange,
  placeholder = 'Select…',
  title = 'Select',
  ariaLabel,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="btn-cmd"
        onClick={() => setOpen(true)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel ?? title}
        style={{
          width: '100%',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {current?.label ?? placeholder}
        </span>
        <span aria-hidden style={{ fontSize: '0.7em', opacity: 0.8 }}>▾</span>
      </button>

      {open && createPortal(
        <div
          className="modal-backdrop"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="select-modal-title"
            style={{ padding: 0, gap: 0, overflow: 'hidden' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1.1rem',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <div
                id="select-modal-title"
                style={{
                  fontSize: '0.8rem',
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  fontWeight: 800,
                  color: 'var(--fg)',
                }}
              >
                {title}
              </div>
              <button
                type="button"
                aria-label="close"
                onClick={() => setOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--fg)',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  lineHeight: 1,
                  padding: 4,
                }}
              >
                ✕
              </button>
            </div>
            <div
              role="listbox"
              style={{ maxHeight: 360, overflowY: 'auto' }}
            >
              {options.map((opt) => {
                const selected = opt.value === value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.9rem 1.1rem',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--line)',
                      color: 'var(--fg)',
                      fontFamily: 'inherit',
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      fontSize: '0.85rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{opt.label}</span>
                    {selected && <span aria-hidden>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default Select;
