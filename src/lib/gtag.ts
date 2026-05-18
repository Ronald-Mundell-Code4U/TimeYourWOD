// Google Analytics (gtag.js). The script loader lives in index.html.
// Keep this ID in sync with the one in index.html. Replace with your Measurement ID.
const GA_ID = 'G-XXXXXXXXXX';
const isConfigured = GA_ID && !GA_ID.includes('XXXXXX');

type GtagFn = (...args: unknown[]) => void;
const getGtag = (): GtagFn | null => {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { gtag?: GtagFn };
  return typeof w.gtag === 'function' ? w.gtag : null;
};

export const pageview = (path: string) => {
  const gtag = getGtag();
  if (!isConfigured || !gtag) return;
  gtag('event', 'page_view', { page_path: path, page_location: window.location.href });
};

export const event = (name: string, params?: Record<string, unknown>) => {
  const gtag = getGtag();
  if (!isConfigured || !gtag) return;
  gtag('event', name, params ?? {});
};
