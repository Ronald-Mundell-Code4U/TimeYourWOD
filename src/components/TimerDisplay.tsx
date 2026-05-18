import React from 'react';

interface Props {
  time: string;
  round?: number;
  showRound?: boolean;
  fontSize: number;
  overtime?: boolean;
  label?: string;
  phase?: 'WORK' | 'REST' | 'GO' | 'READY' | null;
  /** when true, reserve label/round/phase rows even if empty so heats stay equal-height */
  reserveSlots?: boolean;
}

export const TimerDisplay: React.FC<Props> = ({
  time,
  round = 0,
  showRound = false,
  fontSize,
  overtime = false,
  label,
  phase,
  reserveSlots = true,
}) => {
  const labelSize = Math.max(10, fontSize * 0.07);
  const roundSize = Math.max(14, fontSize * 0.12);
  const phaseSize = Math.max(12, fontSize * 0.1);

  const showLabel = !!label;
  const showRoundLine = showRound && round > 0;
  const showPhase = !!phase;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: Math.max(8, fontSize * 0.05),
        userSelect: 'none',
      }}
    >
      {(showLabel || reserveSlots) && (
        <div
          className="kbd-label"
          style={{
            fontSize: labelSize,
            visibility: showLabel ? 'visible' : 'hidden',
          }}
        >
          {showLabel ? label : 'PLACEHOLDER'}
        </div>
      )}
      {(showRoundLine || reserveSlots) && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4em',
            fontSize: roundSize,
            letterSpacing: '0.18em',
            fontWeight: 600,
            color: 'var(--fg-dim)',
            textTransform: 'uppercase',
            visibility: showRoundLine ? 'visible' : 'hidden',
          }}
        >
          <span>ROUND</span>
          <span style={{ color: 'var(--fg)' }}>
            {showRoundLine ? String(round).padStart(2, '0') : '00'}
          </span>
        </div>
      )}
      {(showPhase || reserveSlots) && (
        <div
          style={{
            fontSize: phaseSize,
            letterSpacing: '0.3em',
            fontWeight: 700,
            color: phase === 'REST' ? 'var(--fg-dim)' : 'var(--fg)',
            textTransform: 'uppercase',
            paddingBottom: 4,
            visibility: showPhase ? 'visible' : 'hidden',
          }}
        >
          {showPhase ? phase : 'WORK'}
        </div>
      )}
      <div
        className={`scoreboard${overtime ? ' overtime' : ''}`}
        style={{ fontSize, fontFeatureSettings: '"tnum" 1, "zero" 1' }}
      >
        {time}
      </div>
    </div>
  );
};
