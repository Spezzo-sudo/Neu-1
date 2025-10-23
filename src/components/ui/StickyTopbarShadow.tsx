import React, { useEffect, useState } from 'react';

/**
 * Decorative shadow that fades in once the main content scrolls under the sticky top bar.
 */
const StickyTopbarShadow: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 16);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-b from-black/50 to-transparent transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
};

export default StickyTopbarShadow;
