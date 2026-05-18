export const COUNTDOWN_TIME = 10;

export const pad = (n: number): string => String(Math.max(0, Math.floor(n))).padStart(2, '0');

export const formatMMSS = (totalSeconds: number): string => {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
};

export const formatHHMMSS = (totalSeconds: number): string => {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

export const formatTimeFromNow = (offsetSeconds: number): string => {
  const now = new Date(Date.now() + offsetSeconds * 1000);
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

export const playSafe = (el: HTMLAudioElement) => {
  try {
    el.currentTime = 0;
    const p = el.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch {}
};
