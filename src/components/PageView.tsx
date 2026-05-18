import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as gtag from '../lib/gtag';

export const PageView: React.FC = () => {
  const location = useLocation();
  useEffect(() => {
    gtag.pageview(location.pathname);
  }, [location.pathname]);
  return null;
};

export default PageView;
