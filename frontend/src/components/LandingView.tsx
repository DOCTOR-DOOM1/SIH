import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, ArrowRight, Activity } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface LandingViewProps {
  onSelectRole: (role: 'consumer' | 'officer') => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onSelectRole, isDark = true, onToggleTheme }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-animate bg-grain text-zinc-100 flex flex-col justify-between selection:bg-amber-400 selection:text-black overflow-hidden relative">
      
      {/* Decorative ambient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full px-6 py-5 flex items-center justify-between relative z-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-500 shadow-lg font-bold">
            <Activity size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-playfair text-xl font-bold italic tracking-wide text-white">
                MāpDrishti
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
              Truth in Metrology
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onToggleTheme && (
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} showLabel />
          )}
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 z-10 relative">
        <motion.div 
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-10 max-w-2xl"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-playfair italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-4 drop-shadow-sm">
            Empowering Transparency
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base font-sans max-w-md mx-auto leading-relaxed">
            Whether you're a consumer verifying an everyday product, or an officer enforcing compliance, MāpDrishti ensures truth in packaged commodities.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-3xl justify-center">
          
          {/* Consumer Card */}
          <motion.button
            whileHover={{ scale: 1.02, translateY: -5 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => onSelectRole('consumer')}
            className="group relative w-full sm:w-1/2 glass-panel p-8 rounded-3xl text-left overflow-hidden hover:border-amber-400/50 transition-colors"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 via-amber-400/0 to-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-300 mb-6 group-hover:text-amber-400 group-hover:border-amber-400/30 transition-colors">
              <Users size={28} />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2 font-playfair">Citizen Portal</h2>
            <p className="text-sm text-zinc-400 mb-8 font-sans h-10">
              Scan products instantly to check safety, authenticity, and legal compliance.
            </p>
            
            <div className="flex items-center text-amber-400 text-sm font-bold tracking-wider uppercase font-mono">
              <span>Start Scanning</span>
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>

          {/* Officer Card */}
          <motion.button
            whileHover={{ scale: 1.02, translateY: -5 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => onSelectRole('officer')}
            className="group relative w-full sm:w-1/2 glass-panel p-8 rounded-3xl text-left overflow-hidden hover:border-blue-400/50 transition-colors"
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-blue-400/0 via-blue-400/0 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-300 mb-6 group-hover:text-blue-400 group-hover:border-blue-400/30 transition-colors">
              <Shield size={28} />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2 font-playfair">Officer Portal</h2>
            <p className="text-sm text-zinc-400 mb-8 font-sans h-10">
              Secure access for enforcement, generating compliance reports, and audits.
            </p>
            
            <div className="flex items-center text-blue-400 text-sm font-bold tracking-wider uppercase font-mono">
              <span>Secure Login</span>
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
          
        </div>
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="w-full py-6 px-6 text-center text-[11px] font-mono text-zinc-500 relative z-10"
      >
        SIH26034 • Department of Consumer Affairs • Smart India Hackathon
      </motion.footer>
    </div>
  );
};
