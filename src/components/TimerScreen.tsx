import React from 'react';
import { useViewport } from '../hooks/useViewport';

interface Props {
  /** 0..1 progress for the top rail */
  progress: number;
  /** display elements for heat 1 + optional heat 2 */
  heat1: React.ReactNode;
  heat2?: React.ReactNode | null;
  /** below-timer content (end times / restart) */
  belowTimer?: React.ReactNode;
  /** topline status above the timer (e.g. countdown phase) */
  topLine?: React.ReactNode;
  /** invoked when the user taps the timer area to toggle pause */
  onTogglePause: () => void;
  /** invisible reset hot-corner (top-left) */
  onReset: () => void;
  paused: boolean;
  running: boolean;
}

const PauseIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden>
    <rect x="3" y="2" width="3" height="10" fill="currentColor" />
    <rect x="8" y="2" width="3" height="10" fill="currentColor" />
  </svg>
);

export const TimerScreen: React.FC<Props> = ({
  progress,
  heat1,
  heat2,
  belowTimer,
  topLine,
  onTogglePause,
  onReset,
  paused,
  running,
}) => {
  const { orientation, breakpoint } = useViewport();
  const stacked = orientation === 'portrait' || breakpoint === 'phone';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        paddingTop: 'calc(48px + var(--safe-t))',
        paddingBottom: 'var(--safe-b)',
        paddingLeft: 'var(--safe-l)',
        paddingRight: 'var(--safe-r)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="progress-rail" aria-hidden>
        <div
          className="progress-fill"
          style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
        />
      </div>

      {/* invisible reset hot-corner (top-left) */}
      <button
        type="button"
        onClick={onReset}
        aria-label="reset timer"
        style={{
          position: 'absolute',
          top: 'calc(48px + var(--safe-t))',
          left: 0,
          width: '20%',
          height: '20%',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          zIndex: 70,
        }}
      />

      {/* clickable timer body */}
      <div
        onClick={onTogglePause}
        role="button"
        aria-label="tap to pause or resume"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          gap: '0.5rem',
          padding: '0.25rem 1rem',
          minHeight: 0,
          position: 'relative',
        }}
      >
        {topLine && <div style={{ textAlign: 'center' }}>{topLine}</div>}

        {/* heats — equal sized cells always */}
        <div
          className="heats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: heat2 ? (stacked ? '1fr' : '1fr 1fr') : '1fr',
            gridAutoRows: '1fr',
            alignItems: 'center',
            justifyItems: 'center',
            gap: stacked ? '2rem' : '3rem',
            width: '100%',
            maxWidth: 1600,
          }}
        >
          {heat1}
          {heat2 ?? null}
        </div>

        {/* paused overlay */}
        {paused && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              background: 'var(--overlay)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              zIndex: 60,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '2rem 2.75rem',
                background: 'var(--bg)',
                border: '2px solid var(--fg)',
                borderRadius: 2,
              }}
            >
              <div style={{ color: 'var(--fg)', display: 'inline-flex' }}>
                <PauseIcon size={72} />
              </div>
              <div
                style={{
                  color: 'var(--fg)',
                  fontSize: 'clamp(2rem, 8vw, 4rem)',
                  fontWeight: 800,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                Paused
              </div>
              <div
                style={{
                  color: 'var(--fg-dim)',
                  fontSize: '0.78rem',
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                }}
              >
                Tap to resume
              </div>
            </div>
          </div>
        )}
      </div>

      {belowTimer && (
        <div
          style={{
            padding: '0.75rem 1rem calc(0.75rem + var(--safe-b))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          {belowTimer}
        </div>
      )}
    </div>
  );
};

export default TimerScreen;
