'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function ChristmasDecoration() {
  const [isDecember, setIsDecember] = useState(false);
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // Check if current month is December (month 11 in JS, 0-indexed)
    const currentMonth = new Date().getMonth();
    const isDecemberMonth = currentMonth === 11;
    setIsDecember(isDecemberMonth);

    // Only load animation if it's December
    if (isDecemberMonth) {
      fetch('/animations/christmas-decoration.json')
        .then(res => res.json())
        .then(data => setAnimationData(data))
        .catch(err => console.error('Error loading Christmas animation:', err));
    }
  }, []);

  // Don't render anything if it's not December or animation hasn't loaded
  if (!isDecember || !animationData) {
    return null;
  }

  return (
    <div
      className="absolute top-full left-0 right-0 pointer-events-none z-40 overflow-hidden"
      aria-hidden="true"
    >
      <div className="relative w-full flex justify-between px-4 md:px-8 lg:px-16">
        {/* Left decoration - hidden on mobile */}
        <div className="hidden md:block w-32 lg:w-40 -mt-2">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>

        {/* Spacer for mobile to push right decoration to the right */}
        <div className="flex-1 md:hidden" />

        {/* Right decoration (mirrored) - always visible */}
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
