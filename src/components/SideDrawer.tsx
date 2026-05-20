import React, { useEffect, useRef, useState } from 'react';
import { useSettings, BEEP_PACKS } from '../contexts/SettingContext';
import { Toggle } from './Toggle';
import { CustomTimePicker } from './CustomTimePicker';
import { Select } from './Select';
import { playSafe } from '../lib/timer-utils';

interface Props {
  trigger: React.ReactNode;
}

export const SideDrawer: React.FC<Props> = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const { settings, updateSettings, audio, unlockAudio } = useSettings();

  // beep-pack preview: plays the full 3-2-1-GO sequence
  const previewTimers = useRef<number[]>([]);
  const [previewing, setPreviewing] = useState(false);

  const cancelPreview = () => {
    previewTimers.current.forEach((id) => clearTimeout(id));
    previewTimers.current = [];
    setPreviewing(false);
  };

  const playPreview = () => {
    if (previewing) return;
    unlockAudio(); // first-tap audio unlock for iOS
    cancelPreview();
    setPreviewing(true);
    // schedule beep1 at t=0, beep2 at t=1s, beep3 at t=2s, finalBeep at t=3s
    playSafe(audio.beep1);
    const t1 = window.setTimeout(() => playSafe(audio.beep2), 1000);
    const t2 = window.setTimeout(() => playSafe(audio.beep3), 2000);
    const t3 = window.setTimeout(() => playSafe(audio.finalBeep), 3000);
    const t4 = window.setTimeout(() => {
      setPreviewing(false);
      previewTimers.current = [];
    }, 4200);
    previewTimers.current = [t1, t2, t3, t4];
  };

  // cancel scheduled beeps if the pack changes mid-preview or the drawer closes
  useEffect(() => cancelPreview(), [settings.selectBeep]);
  useEffect(() => {
    if (!open) cancelPreview();
  }, [open]);
  useEffect(() => () => cancelPreview(), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="open settings"
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
        {trigger}
      </button>
      {open && (
        <>
          <div className="drawer-backdrop" onClick={() => setOpen(false)} aria-hidden />
          <aside className="drawer" role="dialog" aria-label="settings">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  fontWeight: 800,
                  color: 'var(--fg)',
                }}
              >
                Settings
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="close"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  color: 'var(--fg)',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  width: 36,
                  height: 36,
                  fontSize: '1rem',
                  borderRadius: 2,
                }}
              >
                ✕
              </button>
            </div>

            <section className="card" style={{ marginBottom: '1rem' }}>
              <h2 style={blockTitle}>THEME</h2>
              <p style={blockText}>Display palette.</p>
              <Toggle
                isChecked={settings.theme === 'dark'}
                handleChange={() =>
                  updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
                }
                Label={['DARK', 'LIGHT']}
              />
            </section>

            <section className="card" style={{ marginBottom: '1rem' }}>
              <h2 style={blockTitle}>HEATS</h2>
              <p style={blockText}>
                Run two heats per workout, separated by a configurable delay.
              </p>
              <Toggle
                isChecked={settings.heatsEnable}
                handleChange={() => updateSettings({ heatsEnable: !settings.heatsEnable })}
                Label={['ENABLED', 'DISABLED']}
              />
              {settings.heatsEnable && (
                <div className="field">
                  <div className="kbd-label">Delay · MM:SS</div>
                  <CustomTimePicker
                    value={settings.heatsDelay}
                    onChange={(v) => updateSettings({ heatsDelay: v })}
                    ariaLabel="heats delay"
                  />
                </div>
              )}
            </section>

            <section className="card" style={{ marginBottom: '1rem' }}>
              <h2 style={blockTitle}>FOR TIME — OVERTIME</h2>
              <p style={blockText}>
                Once the cap is hit, the clock turns red and counts upward for this duration.
                Set to 00:00 to disable.
              </p>
              <div className="field">
                <div className="kbd-label">Overtime · MM:SS</div>
                <CustomTimePicker
                  value={settings.fortime}
                  onChange={(v) => updateSettings({ fortime: v })}
                  ariaLabel="overtime duration"
                />
              </div>
            </section>

            <section className="card" style={{ marginBottom: '1rem' }}>
              <h2 style={blockTitle}>BEEP PACK</h2>
              <p style={blockText}>Select the sound used at 3-2-1-GO.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', maxWidth: 340 }}>
                <Select
                  title="Beep pack"
                  ariaLabel="beep pack"
                  value={settings.selectBeep}
                  options={BEEP_PACKS.map((p) => ({ label: p.name, value: p.id }))}
                  onChange={(id) => updateSettings({ selectBeep: Number(id) })}
                />
                <button
                  type="button"
                  className="btn-cmd"
                  onClick={playPreview}
                  disabled={previewing}
                  style={{
                    width: '100%',
                    whiteSpace: 'nowrap',
                    ...(previewing ? { opacity: 0.4, cursor: 'not-allowed' } : null),
                  }}
                  aria-label="preview 3-2-1-GO"
                >
                  {previewing ? 'PLAYING…' : 'PREVIEW 3 · 2 · 1 · GO'}
                </button>
              </div>
            </section>

            <div
              style={{
                marginTop: 'auto',
                paddingTop: '1rem',
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--fg-dim)',
                textAlign: 'center',
              }}
            >
              v0.1 — STARTER BUILD
            </div>
          </aside>
        </>
      )}
    </>
  );
};

const blockTitle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.78rem',
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
  fontWeight: 700,
  color: 'var(--fg)',
};

const blockText: React.CSSProperties = {
  margin: 0,
  fontSize: '0.78rem',
  lineHeight: 1.55,
  color: 'var(--fg-dim)',
  maxWidth: 320,
};

export default SideDrawer;
