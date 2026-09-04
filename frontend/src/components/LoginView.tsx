import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  Lock,
  User,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { OfficerProfile } from '../types/metrology';
import { ThemeToggle } from './ThemeToggle';

interface LoginViewProps {
  onLogin: (officer: OfficerProfile) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

const PRESET_OFFICERS: Array<OfficerProfile & { username: string }> = [
  {
    username: 'tukaram.mundhe@metrology.gov.in',
    name: 'Tukaram Mundhe',
    badgeId: '#OFF-26034-SIH',
    designation: 'Senior Legal Metrology Inspector',
    station: 'New Delhi Central Inspection Wing',
    jurisdiction: 'National Capital Region (NCR)'
  },
  {
    username: 'priya.sharma@metrology.gov.in',
    name: 'Priya Sharma',
    badgeId: '#OFF-MUM-4122',
    designation: 'Enforcement Officer (Port & Imports)',
    station: 'Mumbai Maritime Metrology Cell',
    jurisdiction: 'Western Seaboard Zone'
  },
  {
    username: 'arun.nair@metrology.gov.in',
    name: 'Dr. Arun Nair',
    badgeId: '#OFF-BLR-9018',
    designation: 'E-Commerce & Digital Metrology Auditor',
    station: 'Bengaluru Tech & Packaged Goods Wing',
    jurisdiction: 'Southern Zonal Command'
  }
];

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, isDark = true, onToggleTheme }) => {
  const [username, setUsername] = useState<string>('tukaram.mundhe@metrology.gov.in');
  const [password, setPassword] = useState<string>('LM-Inspector@2025');
  const [station, setStation] = useState<string>('New Delhi Central Inspection Wing');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please provide both Officer Username / ID and credentials.');
      return;
    }

    setIsLoading(true);

    // Realistic authentication delay
    setTimeout(() => {
      setIsLoading(false);
      const matched = PRESET_OFFICERS.find(
        (o) => o.username.toLowerCase() === username.trim().toLowerCase()
      );

      const officerProfile: OfficerProfile = matched || {
        name: username.split('@')[0].replace(/\./g, ' ').toUpperCase() || 'Inspector',
        badgeId: '#OFF-AUTH-' + Math.floor(1000 + Math.random() * 9000),
        designation: 'Legal Metrology Enforcement Officer',
        station: station,
        jurisdiction: 'Statutory Inspection Command'
      };

      onLogin(officerProfile);
    }, 550);
  };

  const handleApplyPreset = (preset: typeof PRESET_OFFICERS[0]) => {
    setUsername(preset.username);
    setPassword('Govt-Secured-Token#2025');
    setStation(preset.station);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen w-full bg-[#0f0f0f] text-zinc-100 flex flex-col justify-between selection:bg-amber-400 selection:text-black">
      {/* Top Banner */}
      <header className="w-full border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-black shadow-lg shadow-amber-400/20 font-bold">
            <Scale size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-playfair text-base font-bold italic tracking-wide text-white">
                MāpDrishti <span className="text-zinc-500 font-sans text-xs not-italic">(मापदृष्टि)</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold border border-zinc-700">
                SIH26034
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono">
              Legal Metrology (Packaged Commodities) Rules, 2011
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-zinc-400">
            <ShieldCheck size={14} className="text-amber-400" />
            <span>Govt. of India • Ministry of Consumer Affairs</span>
          </div>
          {onToggleTheme && (
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} showLabel />
          )}
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-[#181818] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 mb-3 shadow-inner">
              <Lock size={22} />
            </div>
            <h1 className="text-2xl font-bold font-playfair italic text-white">
              Inspector Access Portal
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Authenticate with statutory credentials to access the Enforcement Dashboard
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-zinc-400 mb-1.5 tracking-wider">
                Official User ID / Email
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="officer.name@metrology.gov.in"
                  className="w-full rounded-xl border border-zinc-800 bg-black/60 pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-zinc-400 mb-1.5 tracking-wider">
                Security Password / Token
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-zinc-800 bg-black/60 pl-10 pr-10 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-zinc-400 mb-1.5 tracking-wider">
                Assigned Zonal Station
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <select
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black/60 pl-10 pr-4 py-2.5 text-xs text-zinc-200 focus:border-amber-400 focus:outline-none font-mono appearance-none cursor-pointer"
                >
                  <option value="New Delhi Central Inspection Wing">New Delhi Central Inspection Wing</option>
                  <option value="Mumbai Maritime Metrology Cell">Mumbai Maritime Metrology Cell (Port)</option>
                  <option value="Bengaluru Tech & Packaged Goods Wing">Bengaluru Tech & Packaged Goods Wing</option>
                  <option value="Kolkata Eastern Regional Enforcement">Kolkata Eastern Regional Enforcement</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-amber-400 text-black rounded-xl text-xs font-bold hover:bg-amber-300 transition-all uppercase tracking-widest shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating Officer...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Fast Presets */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                Quick 1-Click Demo Profiles:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_OFFICERS.map((preset) => (
                <button
                  key={preset.badgeId}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-black/50 text-[10px] font-mono text-zinc-300 hover:border-amber-400 hover:text-amber-400 text-left transition-colors truncate"
                  title={`${preset.name} (${preset.badgeId})`}
                >
                  <span className="font-bold block truncate">{preset.name}</span>
                  <span className="text-zinc-500 text-[9px] block truncate">{preset.badgeId}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Legal Footer */}
      <footer className="w-full border-t border-zinc-800/80 py-3 px-6 text-center text-[10px] font-mono text-zinc-500">
        Statutory Enforcement System under Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011 • Smart India Hackathon SIH26034
      </footer>
    </div>
  );
};
