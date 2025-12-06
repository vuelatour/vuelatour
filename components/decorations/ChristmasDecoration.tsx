'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function ChristmasDecoration() {
  const [isDecember, setIsDecember] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const loadAnimation = useCallback((darkMode: boolean) => {
    const animationFile = darkMode
      ? '/animations/christmas-decoration-dark.json'
      : '/animations/christmas-decoration-light.json';

    fetch(animationFile)
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error('Error loading Christmas animation:', err));
  }, []);

  useEffect(() => {
    // Check if current month is December (month 11 in JS, 0-indexed)
    const currentMonth = new Date().getMonth();
    const isDecemberMonth = currentMonth === 11;
    setIsDecember(isDecemberMonth);

    if (!isDecemberMonth) return;

    // Check initial dark mode state
    const checkDarkMode = () => document.documentElement.classList.contains('dark');
    const initialDarkMode = checkDarkMode();
    setIsDarkMode(initialDarkMode);
    loadAnimation(initialDarkMode);

    // Watch for theme changes using MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const newDarkMode = checkDarkMode();
          if (newDarkMode !== isDarkMode) {
            setIsDarkMode(newDarkMode);
            loadAnimation(newDarkMode);
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [loadAnimation, isDarkMode]);

  // Don't render anything if it's not December or animation hasn't loaded
  if (!isDecember || !animationData) {
    return null;
  }

  return (
    <div
      className="absolute top-full left-0 right-0 pointer-events-none z-40 overflow-hidden"
      aria-hidden="true"
    >
      <div className="relative w-full flex justify-end px-4 md:px-8 lg:px-16">
        {/* Right decoration (mirrored) */}
        <div className="w-24 md:w-32 lg:w-40 -mt-2" style={{ transform: 'scaleX(-1)' }}>
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      </div>
    </div>
  );
}
