import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanRecord } from '../types/metrology';
import { ScanView } from './ScanView';
import { ResultsView } from './ResultsView';
import { ThemeToggle } from './ThemeToggle';
import { ArrowLeft, Activity } from 'lucide-react';

interface ConsumerPortalProps {
  onBackToLanding: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const ConsumerPortal: React.FC<ConsumerPortalProps> = ({ onBackToLanding, isDark = true, onToggleTheme }) => {
  const [activeRecord, setActiveRecord] = useState<ScanRecord | null>(null);

  const handleScanComplete = (record: ScanRecord) => {
    setActiveRecord(record);
  };

  const handleNewScan = () => {
    setActiveRecord(null);
  };

  return (
    <div className="h-screen w-full bg-gradient-animate bg-grain text-zinc-100 flex flex-col overflow-hidden font-sans relative">
      
      {/* Decorative ambient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-16 lg:h-20 glass-panel border-b border-zinc-800/50 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 sticky top-0"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToLanding}
            className="p-2 -ml-2 rounded-xl hover:bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors"
            title="Back to Main Menu"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-500 font-bold">
              <Activity size={18} />
            </div>
            <div>
              <h2 className="font-playfair text-xl font-bold italic text-white tracking-tight">
                MāpDrishti Citizen
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onToggleTheme && <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />}
        </div>
      </motion.header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 h-full">
          <AnimatePresence mode="wait">
            {!activeRecord ? (
              <motion.div
                key="scan"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col"
              >
                <div className="mb-6 text-center">
                  <h1 className="text-3xl font-playfair font-bold text-white mb-2">Check Product Safety</h1>
                  <p className="text-zinc-400 text-sm font-sans">Scan a product label to instantly verify its compliance and safety standards.</p>
                </div>
                
                <div className="flex-1 glass-panel rounded-3xl overflow-hidden border border-zinc-800/50 shadow-2xl relative">
                  {/* Reuse existing ScanView but without officer header logic (which it handles internally or we can pass a dummy) */}
                  <ScanView 
                    onComplete={handleScanComplete} 
                    officer={{
                      name: "Citizen Verification",
                      badgeId: "PUBLIC-PORTAL",
                      designation: "Consumer",
                      station: "Public App",
                      jurisdiction: "Global"
                    }} 
                    isConsumer={true}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <ResultsView 
                  record={activeRecord} 
                  onNewScan={handleNewScan} 
                  isConsumer={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
