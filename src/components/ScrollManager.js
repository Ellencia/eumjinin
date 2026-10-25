import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const positions = {};

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const saved = positions[location.key];
    const target = location.hash && document.getElementById(location.hash.slice(1));
    if (target) {
      target.scrollIntoView(); // 상단바 여백은 CSS scroll-margin-top
    } else if (saved !== undefined) {
      window.scrollTo(0, saved);
    } else {
      window.scrollTo(0, 0);
    }

    return () => {
      positions[location.key] = window.scrollY;
    };
  }, [location]);

  return null;
}

export default ScrollManager;
