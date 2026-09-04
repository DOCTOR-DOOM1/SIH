import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  isDark,
  onToggle,
  className = '',
  showLabel = false,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-zinc-700/60 hover:border-amber-400/80 transition-all duration-200 text-xs font-mono cursor-pointer ${
        isDark ? 'bg-zinc-900/80 text-zinc-300 hover:text-white' : 'bg-white/90 text-zinc-700 hover:text-black shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme mode"
    >
      {isDark ? (
        <>
          <Sun size={15} className="text-amber-400 rotate-0 scale-100 transition-transform duration-200" />
          {showLabel && <span className="text-[11px] font-bold">Light</span>}
        </>
      ) : (
        <>
          <Moon size={15} className="text-amber-700 -rotate-12 scale-100 transition-transform duration-200" />
          {showLabel && <span className="text-[11px] font-bold">Dark</span>}
        </>
      )}
    </button>
  );
};
