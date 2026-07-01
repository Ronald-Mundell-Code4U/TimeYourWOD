import { renderHook, act } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { useTimerEngine } from '../useTimerEngine';

// Isolate the engine from the real SettingsProvider: stub useSettings' audio.
const mockPlay = jest.fn(() => Promise.resolve());
jest.mock('../../contexts/SettingsContext', () => ({
  useSettings: () => ({ audio: { play: mockPlay } }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useTimerEngine — state transitions', () => {
  it('starts idle', () => {
    const { result } = renderHook(() => useTimerEngine());
    expect(result.current.running).toBe(false);
    expect(result.current.paused).toBe(false);
    expect(result.current.ended).toBe(false);
    expect(result.current.elapsed).toBe(0);
  });

  it('start → running, reset → idle, pause toggles, markEnded ends', () => {
    const { result } = renderHook(() => useTimerEngine());
    act(() => result.current.start());
    expect(result.current.running).toBe(true);

    act(() => result.current.togglePause());
    expect(result.current.paused).toBe(true);
    act(() => result.current.togglePause());
    expect(result.current.paused).toBe(false);

    act(() => result.current.markEnded());
    expect(result.current.ended).toBe(true);

    act(() => result.current.reset());
    expect(result.current.running).toBe(false);
    expect(result.current.ended).toBe(false);
    expect(result.current.elapsed).toBe(0);
  });
});

describe('useTimerEngine — fireBeep dedup + matched haptics', () => {
  it('fires audio + light haptic once per (key,elapsed,beep); ignores repeats', () => {
    const { result } = renderHook(() => useTimerEngine());
    act(() => {
      result.current.fireBeep('h1', 'b1');
      result.current.fireBeep('h1', 'b1'); // duplicate — suppressed
    });
    expect(mockPlay).toHaveBeenCalledTimes(1);
    expect(mockPlay).toHaveBeenCalledWith('b1');
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });

  it('a different beep kind at the same second fires again', () => {
    const { result } = renderHook(() => useTimerEngine());
    act(() => {
      result.current.fireBeep('h1', 'b1');
      result.current.fireBeep('h1', 'b2');
      result.current.fireBeep('h1', 'b3');
    });
    expect(mockPlay).toHaveBeenCalledTimes(3);
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(3);
  });

  it('the final beep uses a success notification, not an impact', () => {
    const { result } = renderHook(() => useTimerEngine());
    act(() => result.current.fireBeep('end', 'final'));
    expect(mockPlay).toHaveBeenCalledWith('final');
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it('a null beep is a no-op', () => {
    const { result } = renderHook(() => useTimerEngine());
    act(() => result.current.fireBeep('x', null));
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('start() clears the dedup ring so the same key can fire in a new run', () => {
    const { result } = renderHook(() => useTimerEngine());
    act(() => result.current.fireBeep('h1', 'b1'));
    act(() => result.current.start());
    act(() => result.current.fireBeep('h1', 'b1'));
    expect(mockPlay).toHaveBeenCalledTimes(2);
  });
});

describe('useTimerEngine — monotonic clock advances elapsed', () => {
  it('recomputes elapsed = floor((now - start)/1000) on each frame', () => {
    // Base is non-zero: the engine guards on `startTime > 0`, and a real
    // performance.now() is ms-since-load (never 0). Anchoring at 0 would fail
    // that guard — a test artifact, not an engine bug.
    let nowMs = 10_000;
    let rafCb: FrameRequestCallback | null = null;
    const realRaf = global.requestAnimationFrame;
    const realCancel = global.cancelAnimationFrame;
    // @ts-expect-error — override for the test
    global.performance = { now: () => nowMs };
    global.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      rafCb = cb;
      return 1 as unknown as number;
    }) as typeof requestAnimationFrame;
    global.cancelAnimationFrame = (() => {}) as typeof cancelAnimationFrame;

    try {
      const { result } = renderHook(() => useTimerEngine());
      act(() => result.current.start()); // anchors startTime = now (0), schedules a frame
      expect(result.current.elapsed).toBe(0);

      nowMs = 12_000; // +2s
      act(() => {
        rafCb && rafCb(0);
      });
      expect(result.current.elapsed).toBe(2);

      nowMs = 15_999; // +5.999s → floors to 5
      act(() => {
        rafCb && rafCb(0);
      });
      expect(result.current.elapsed).toBe(5);
    } finally {
      global.requestAnimationFrame = realRaf;
      global.cancelAnimationFrame = realCancel;
    }
  });
});
