import { useEffect, useState } from 'react';

export type Breakpoint = 'phone' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export interface ViewportInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  orientation: Orientation;
}

const PHONE_MAX = 559;
const TABLET_MAX = 900;

const compute = (): ViewportInfo => {
  const width = typeof window === 'undefined' ? 1280 : window.innerWidth;
  const height = typeof window === 'undefined' ? 800 : window.innerHeight;
  const breakpoint: Breakpoint =
    width <= PHONE_MAX ? 'phone' : width <= TABLET_MAX ? 'tablet' : 'desktop';
  const orientation: Orientation = width >= height ? 'landscape' : 'portrait';
  return { width, height, breakpoint, orientation };
};

export const useViewport = (): ViewportInfo => {
  const [info, setInfo] = useState<ViewportInfo>(compute);
  useEffect(() => {
    const onResize = () => setInfo(compute());
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);
  return info;
};
