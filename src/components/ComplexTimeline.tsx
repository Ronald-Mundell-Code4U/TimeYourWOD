import React, { useMemo } from 'react';

/** Shape mirrors the `Seg` returned by `buildTimeline` inside Complex.tsx. */
export interface TimelineSeg {
  phase: 'WORK' | 'REST';
  duration: number;
  loop: number;
  loopRounds: number;
  round: number;
  label: string;
  isTransition: boolean;
}

interface Props {
  timeline: TimelineSeg[];
  /** Called when a row is clicked. Useful for "click a segment → scroll the
   *  builder to its loop card". Receives the 1-based loop number and segment index. */
  onSegmentClick?: (loop: number, segIdx: number) => void;
}

interface Group {
  key: string;
  heading: string;
  loop: number;
  isTransition: boolean;
  segs: Array<{ seg: TimelineSeg; idx: number }>;
}

/**
 * Groups the flat segment list into visual blocks:
 *   LOOP 01 × 4         →  the *unique* interval pattern of loop 1 (round 1 only)
 *   TRANSITION          →  the single transition-rest segment
 *   LOOP 02 × 2         →  the unique pattern of loop 2
 *
 * Rounds 2+ are intentionally omitted — the `× N` on the heading communicates
 * how many times the pattern repeats, so the outline stays compact even for
 * workouts with many rounds.
 */
const groupSegments = (timeline: TimelineSeg[]): Group[] => {
  const out: Group[] = [];
  timeline.forEach((seg, idx) => {
    if (seg.isTransition) {
      out.push({
        key: `t-${idx}`,
        heading: 'TRANSITION',
        loop: seg.loop,
        isTransition: true,
        segs: [{ seg, idx }],
      });
      return;
    }
    // only show round 1 of each loop — the heading carries the rounds count
    if (seg.round !== 1) return;
    const last = out[out.length - 1];
    if (last && !last.isTransition && last.segs[0].seg.loop === seg.loop) {
      last.segs.push({ seg, idx });
    } else {
      out.push({
        key: `l-${seg.loop}-${idx}`,
        heading:
          seg.loopRounds === 1
            ? `LOOP ${String(seg.loop).padStart(2, '0')}`
            : `LOOP ${String(seg.loop).padStart(2, '0')} × ${seg.loopRounds}`,
        loop: seg.loop,
        isTransition: false,
        segs: [{ seg, idx }],
      });
    }
  });
  return out;
};

const formatDur = (s: number): string => {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r === 0 ? `${m}m` : `${m}m ${r}s`;
};

export const ComplexTimeline: React.FC<Props> = ({ timeline, onSegmentClick }) => {
  const groups = useMemo(() => groupSegments(timeline), [timeline]);

  return (
    <div className="complex-timeline">
      {groups.map((g) => (
        <section key={g.key} className="complex-timeline__group">
          <button
            type="button"
            className="complex-timeline__heading"
            onClick={() => onSegmentClick?.(g.loop, g.segs[0].idx)}
            disabled={!onSegmentClick}
          >
            {g.heading}
          </button>
          <ul className="complex-timeline__list">
            {g.segs.map(({ seg, idx }) => (
              <li key={idx}>
                <button
                  type="button"
                  className="complex-timeline__row"
                  onClick={() => onSegmentClick?.(seg.loop, idx)}
                  disabled={!onSegmentClick}
                >
                  <span className="complex-timeline__phase">{seg.phase}</span>
                  <span className="complex-timeline__dur">{formatDur(seg.duration)}</span>
                  {seg.label && (
                    <span className="complex-timeline__label" title={seg.label}>
                      {seg.label.toUpperCase()}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default ComplexTimeline;
