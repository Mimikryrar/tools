import React from 'react';
import { DESIGN_STYLES, DesignStyle } from '../services/geminiService';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface StyleCarouselProps {
  selectedStyleId: string | null;
  onSelect: (style: DesignStyle) => void;
  isGenerating?: boolean;
}

export default function StyleCarousel({ selectedStyleId, onSelect, isGenerating }: StyleCarouselProps) {
  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex gap-4 px-4 min-w-max">
        {DESIGN_STYLES.map((style) => (
          <motion.button
            key={style.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(style)}
            disabled={isGenerating}
            className={cn(
              "flex flex-col items-start p-4 rounded-xl border transition-all w-48 text-left",
              selectedStyleId === style.id 
                ? "border-accent bg-accent/5 ring-1 ring-accent" 
                : "border-ink/10 bg-white hover:border-ink/30",
              isGenerating && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="text-sm font-serif font-semibold mb-1">{style.name}</span>
            <span className="text-xs text-ink/60 line-clamp-2">{style.description}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
