import React from 'react';
import { Scale, Scan, FolderClock, BookOpen, ShieldCheck } from 'lucide-react';
import { OfficerProfile } from '../types/metrology';

interface HeaderProps {
  currentView: 'dashboard' | 'scan' | 'results' | 'repository';
  onNavigate: (view: 'dashboard' | 'scan' | 'repository') => void;
  onOpenOfficerModal: () => void;
  onOpenRulesGuide: () => void;
  officer: OfficerProfile;
  repoCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenOfficerModal,
  onOpenRulesGuide,
  officer,
  repoCount,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-[#0f0f0f]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div
            onClick={() => onNavigate('dashboard')}
            className="cursor-pointer flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-black shadow-md shadow-amber-400/20 hover:scale-105 transition-transform"
          >
            <Scale size={24} strokeWidth={2.4} />
          </div>
          <div onClick={() => onNavigate('dashboard')} className="cursor-pointer">
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-heading">
                MāpDrishti
              </h1>
              <span className="text-sm font-semibold text-amber-400 font-sans">
                (मापदृष्टि)
              </span>
              <span className="hidden sm:inline-block rounded-full bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 text-[10px] font-mono font-medium text-amber-400">
                SIH26034
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              Legal Metrology Automated Compliance Engine • 2011 Rules
            </p>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="flex items-center gap-1 rounded-xl bg-zinc-900/90 border border-zinc-800/80 p-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                currentView === 'dashboard'
                  ? 'bg-amber-400 text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('scan')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                currentView === 'scan' || currentView === 'results'
                  ? 'bg-amber-400 text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              <Scan size={14} />
              <span>Scan Package</span>
            </button>
            <button
              onClick={() => onNavigate('repository')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                currentView === 'repository'
                  ? 'bg-amber-400 text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              <FolderClock size={14} />
              <span>Repository</span>
              {repoCount > 0 && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                    currentView === 'repository'
                      ? 'bg-black text-amber-400'
                      : 'bg-zinc-800 text-amber-400'
                  }`}
                >
                  {repoCount}
                </span>
              )}
            </button>
          </nav>

          {/* Statutory Guide Button */}
          <button
            onClick={onOpenRulesGuide}
            title="View Legal Metrology Rules, 2011 Guide"
            className="hidden md:flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#181818] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-amber-400/40 hover:text-amber-400 transition-colors"
          >
            <BookOpen size={14} />
            <span>2011 Rules Guide</span>
          </button>

          {/* Officer ID Pill */}
          <button
            onClick={onOpenOfficerModal}
            className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#181818] px-3 py-1.5 text-xs hover:border-zinc-700 transition-colors"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <ShieldCheck size={14} />
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-[11px] font-semibold text-zinc-200 leading-tight">
                {officer.name}
              </div>
              <div className="text-[10px] font-mono text-zinc-500 leading-tight">
                {officer.badgeId}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
