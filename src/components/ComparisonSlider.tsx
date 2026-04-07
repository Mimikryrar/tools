import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { cn } from '../lib/utils';

interface ComparisonSliderProps {
  before: string;
  after: string;
  className?: string;
}

export default function ComparisonSlider({ before, after, className }: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging && event.type !== 'click') return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = 'touches' in event ? event.touches[0].clientX : (event as React.MouseEvent).clientX;
    const relativeX = x - rect.left;
    const position = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
    
    setSliderPosition(position);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full aspect-video overflow-hidden rounded-2xl cursor-col-resize select-none border border-ink/10", className)}
      onMouseMove={handleMove}
      onMouseDown={handleMouseDown}
      onTouchMove={handleMove}
      onTouchStart={handleMouseDown}
    >
      {/* After Image (Background) */}
      <img 
        src={after} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />

      {/* Before Image (Clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img 
          src={before} 
          alt="Before" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border border-ink/5">
          <div className="flex gap-1">
            <div className="w-0.5 h-4 bg-ink/20 rounded-full" />
            <div className="w-0.5 h-4 bg-ink/20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 bg-ink/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
        Original
      </div>
      <div className="absolute bottom-4 right-4 bg-accent/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
        Reimagined
      </div>
    </div>
  );
}
