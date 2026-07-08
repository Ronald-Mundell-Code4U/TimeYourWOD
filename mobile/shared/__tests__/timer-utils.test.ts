import {
  COUNTDOWN_TIME,
  pad,
  formatMMSS,
  formatHHMMSS,
  formatStopwatch,
  formatTimeFromNow,
  beepFor,
  isSegmentStart,
} from '../timer-utils';

describe('pad', () => {
  it('zero-pads to two digits', () => {
    expect(pad(0)).toBe('00');
    expect(pad(5)).toBe('05');
    expect(pad(42)).toBe('42');
  });
  it('clamps negatives to 00 and floors fractions', () => {
    expect(pad(-3)).toBe('00');
    expect(pad(7.9)).toBe('07');
  });
  it('does not truncate values above 99', () => {
    expect(pad(100)).toBe('100');
  });
});

describe('formatMMSS', () => {
  it('formats seconds as MM:SS', () => {
    expect(formatMMSS(0)).toBe('00:00');
    expect(formatMMSS(9)).toBe('00:09');
    expect(formatMMSS(65)).toBe('01:05');
    expect(formatMMSS(600)).toBe('10:00');
    expect(formatMMSS(3599)).toBe('59:59');
  });
  it('clamps negatives to 00:00', () => {
    expect(formatMMSS(-5)).toBe('00:00');
  });
});

describe('formatHHMMSS', () => {
  it('formats seconds as HH:MM:SS', () => {
    expect(formatHHMMSS(0)).toBe('00:00:00');
    expect(formatHHMMSS(3661)).toBe('01:01:01');
    expect(formatHHMMSS(86399)).toBe('23:59:59');
  });
});

describe('formatStopwatch', () => {
  it('formats milliseconds as MM:SS:CC (centiseconds)', () => {
    expect(formatStopwatch(0)).toBe('00:00:00');
    expect(formatStopwatch(1230)).toBe('00:01:23');
    expect(formatStopwatch(65990)).toBe('01:05:99');
  });
  it('is 8 characters wide', () => {
    expect(formatStopwatch(0)).toHaveLength(8);
  });
});

describe('formatTimeFromNow', () => {
  it('offsets the current wall clock and formats HH:MM', () => {
    const base = new Date('2026-07-01T10:00:00Z').getTime();
    jest.spyOn(Date, 'now').mockReturnValue(base);
    const now = new Date(base);
    const expected = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    expect(formatTimeFromNow(0)).toBe(expected);

    const plus90 = new Date(base + 90 * 1000);
    expect(formatTimeFromNow(90)).toBe(`${pad(plus90.getHours())}:${pad(plus90.getMinutes())}`);
    jest.restoreAllMocks();
  });
});

describe('beepFor cadence', () => {
  it('maps 3-2-1 to b1/b2/b3 and 0 to final', () => {
    expect(beepFor(3)).toBe('b1');
    expect(beepFor(2)).toBe('b2');
    expect(beepFor(1)).toBe('b3');
    expect(beepFor(0)).toBe('final');
  });
  it('returns null outside the 3..0 window', () => {
    expect(beepFor(10)).toBeNull();
    expect(beepFor(4)).toBeNull();
    expect(beepFor(-1)).toBeNull();
  });
});

describe('COUNTDOWN_TIME', () => {
  it('is the 10s pre-countdown documented in the design', () => {
    expect(COUNTDOWN_TIME).toBe(10);
  });
});

describe('isSegmentStart (GO beep at every work/rest boundary)', () => {
  // cycle = [work=30][rest=10]
  it('fires at work start (inCycle 0)', () => {
    expect(isSegmentStart(0, 30, 10)).toBe(true);
  });
  it('fires at rest start (inCycle === workLen) when rest > 0', () => {
    expect(isSegmentStart(30, 30, 10)).toBe(true);
  });
  it('does NOT fire mid-work or mid-rest', () => {
    expect(isSegmentStart(15, 30, 10)).toBe(false);
    expect(isSegmentStart(35, 30, 10)).toBe(false);
  });
  it('has no rest-start boundary when rest is 0', () => {
    // regression: EMOM/Tabata with rest=0 only boundary is inCycle 0
    expect(isSegmentStart(0, 60, 0)).toBe(true);
    expect(isSegmentStart(60, 60, 0)).toBe(false);
  });
});
