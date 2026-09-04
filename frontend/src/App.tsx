import React, { useState, useEffect } from 'react';
import {
  Scale,
  LayoutDashboard,
  Scan,
  FolderClock,
  BookOpen,
  ShieldCheck,
  FileDown,
  RotateCcw,
  Sparkles,
  Menu,
  X,
  FileCheck2,
  LogOut
} from 'lucide-react';
import { OfficerProfile, ScanRecord } from './types/metrology';
import { SAMPLE_PACKAGES } from './data/samplePackages';
import { validateDeclarations } from './logic/validator';
import { DashboardView } from './components/DashboardView';
import { ScanView } from './components/ScanView';
import { ResultsView } from './components/ResultsView';
import { RepositoryView } from './components/RepositoryView';
import { RulesGuideModal } from './components/RulesGuideModal';
import { AuthModal } from './components/AuthModal';
import { LoginView } from './components/LoginView';
import { ThemeToggle } from './components/ThemeToggle';
import { exportEnforcementPdf } from './utils/pdfGenerator';

const DEFAULT_OFFICER: OfficerProfile = {
  name: 'R. K. Verma',
  badgeId: '#OFF-26034-SIH',
  designation: 'Senior Legal Metrology Inspector',
  station: 'New Delhi Central Inspection Wing',
  jurisdiction: 'National Capital Region (NCR)',
};

function generateInitialRecords(): ScanRecord[] {
  return SAMPLE_PACKAGES.slice(0, 3).map((pkg, idx) => {
    const validation = validateDeclarations(pkg.extractedText, [], {
      isImported: pkg.isImported,
    });
    return {
      id: `MD-2025-${8829 + idx}`,
      timestamp: new Date(Date.now() - (idx * 3600000 * 4)).toISOString(),
      officerName: DEFAULT_OFFICER.name,
      officerBadge: DEFAULT_OFFICER.badgeId,
      station: DEFAULT_OFFICER.station,
      productName: pkg.title,
      overallVerdict: validation.overallVerdict,
      results: validation.results,
      imageThumbnail: pkg.imageThumbnail,
      fullExtractedText: pkg.extractedText,
      textBlocks: [],
      fontSizeAdvisory: validation.fontSizeAdvisory,
      isImported: Boolean(pkg.isImported),
      notes: pkg.description,
    };
  });
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mapdrishti_auth') === 'true';
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('mapdrishti_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [currentView, setCurrentView] = useState<'dashboard' | 'scan' | 'results' | 'repository'>('dashboard');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('mapdrishti_theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('mapdrishti_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };
  const [officer, setOfficer] = useState<OfficerProfile>(DEFAULT_OFFICER);
  const [records, setRecords] = useState<ScanRecord[]>(() => {
    const saved = localStorage.getItem('mapdrishti_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Failed to parse cached records', e);
      }
    }
    return generateInitialRecords();
  });

  const [activeRecord, setActiveRecord] = useState<ScanRecord | null>(() => {
    const initial = generateInitialRecords();
    return initial[1]; // SunCrisp Non-Compliant audit for striking initial view
  });

  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleLogin = (newOfficer: OfficerProfile) => {
    setOfficer(newOfficer);
    setIsAuthenticated(true);
    localStorage.setItem('mapdrishti_auth', 'true');
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('mapdrishti_auth');
  };

  // Sync records to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mapdrishti_records', JSON.stringify(records));
    } catch (e) {
      console.warn('Could not persist records to localStorage', e);
    }
  }, [records]);

  const handleScanComplete = (newRecord: ScanRecord) => {
    setRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
    setActiveRecord(newRecord);
    setCurrentView('results');
  };

  const handleSelectRecord = (record: ScanRecord) => {
    setActiveRecord(record);
    setCurrentView('results');
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (activeRecord?.id === id) {
      const remaining = records.filter((r) => r.id !== id);
      setActiveRecord(remaining[0] || null);
      if (remaining.length === 0) {
        setCurrentView('dashboard');
      }
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all audit records from local repository?')) {
      setRecords([]);
      setActiveRecord(null);
      setCurrentView('dashboard');
    }
  };

  const handleLoadDemoScans = () => {
    const demo = generateInitialRecords();
    setRecords(demo);
    setActiveRecord(demo[1]);
    setCurrentView('results');
  };

  const handleSaveToRepository = (record: ScanRecord) => {
    if (!records.some((r) => r.id === record.id)) {
      setRecords((prev) => [record, ...prev]);
    }
  };

  const isSavedInRepo = Boolean(activeRecord && records.some((r) => r.id === activeRecord.id));

  // Determine top header title and action buttons based on currentView
  const getHeaderDetails = () => {
    switch (currentView) {
      case 'results':
        return {
          title: 'Compliance Audit',
          subtitle: activeRecord ? `Audit #${activeRecord.id.replace('MD-', '')} | 14:24 IST` : 'Rule 6 Verification',
          showActions: true,
        };
      case 'scan':
        return {
          title: 'Active Scan',
          subtitle: 'Multi-Modal Vision Inspection • LMRP 2011',
          showActions: false,
        };
      case 'repository':
        return {
          title: 'Repository',
          subtitle: `${records.length} Archived Inspection Records`,
          showActions: false,
        };
      case 'dashboard':
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Legal Metrology Automated Compliance Engine',
          showActions: false,
        };
    }
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} isDark={isDark} onToggleTheme={toggleTheme} />;
  }

  const headerInfo = getHeaderDetails();

  return (
    <div className="h-screen w-full bg-[#0f0f0f] text-zinc-100 flex overflow-hidden font-sans">
      {/* Immersive Left Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#141414] border-r border-zinc-800 flex-col shrink-0">
        <div className="p-8">
          {/* Brand Logo & Name */}
          <div
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-3 text-amber-400 mb-10 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center border border-amber-400/20 group-hover:border-amber-400/40 transition-colors">
              <Scale className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="font-playfair text-2xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                MāpDrishti
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono tracking-wider">
                SIH26034 • LMRP 2011
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-3">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left ${
                currentView === 'dashboard'
                  ? 'text-amber-400 bg-amber-400/5 active-border font-bold'
                  : 'text-zinc-500 hover:text-white font-semibold'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentView('scan')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left ${
                currentView === 'scan'
                  ? 'text-amber-400 bg-amber-400/5 active-border font-bold'
                  : 'text-zinc-500 hover:text-white font-semibold'
              }`}
            >
              <Scan className="w-5 h-5" />
              <span>Active Scan</span>
            </button>

            {activeRecord && (
              <button
                onClick={() => setCurrentView('results')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left ${
                  currentView === 'results'
                    ? 'text-amber-400 bg-amber-400/5 active-border font-bold'
                    : 'text-zinc-500 hover:text-white font-semibold'
                }`}
              >
                <FileCheck2 className="w-5 h-5" />
                <span>Compliance Audit</span>
              </button>
            )}

            <button
              onClick={() => setCurrentView('repository')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left ${
                currentView === 'repository'
                  ? 'text-amber-400 bg-amber-400/5 active-border font-bold'
                  : 'text-zinc-500 hover:text-white font-semibold'
              }`}
            >
              <FolderClock className="w-5 h-5" />
              <div className="flex items-center justify-between flex-1">
                <span>Repository</span>
                {records.length > 0 && (
                  <span className="text-[10px] font-mono font-bold bg-zinc-800 text-amber-400 px-1.5 py-0.5 rounded-full">
                    {records.length}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer with 2011 Rules button & Officer Credential badge */}
        <div className="mt-auto p-8 space-y-4">
          <button
            onClick={() => setIsRulesModalOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border border-zinc-800 bg-[#181818] text-xs font-semibold text-zinc-400 hover:text-amber-400 hover:border-amber-400/40 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>2011 Rules Guide</span>
          </button>

          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 space-y-2.5">
            <div
              onClick={() => setIsAuthModalOpen(true)}
              className="cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                  Enforcement ID
                </p>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400/80 group-hover:text-amber-400 transition-colors" />
              </div>
              <p className="font-mono text-amber-400 text-xs font-bold truncate">
                {officer.badgeId}
              </p>
              <p className="text-zinc-400 text-[11px] truncate mt-0.5">
                {officer.name}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="text-[10px] text-zinc-400 hover:text-amber-400 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Edit Badge
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                title="Log Out of Enforcement Terminal"
              >
                <LogOut size={11} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#141414] border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2.5 text-amber-400 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
            <Scale className="w-4 h-4" />
          </div>
          <span className="font-playfair text-lg font-bold text-white">MāpDrishti</span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 border border-zinc-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] z-40 bg-[#141414]/98 backdrop-blur-md p-6 flex flex-col justify-between border-b border-zinc-800">
          <nav className="space-y-3">
            <button
              onClick={() => {
                setCurrentView('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                currentView === 'dashboard' ? 'text-amber-400 bg-amber-400/10 font-bold' : 'text-zinc-400'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('scan');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                currentView === 'scan' ? 'text-amber-400 bg-amber-400/10 font-bold' : 'text-zinc-400'
              }`}
            >
              <Scan size={18} />
              <span>Active Scan</span>
            </button>
            {activeRecord && (
              <button
                onClick={() => {
                  setCurrentView('results');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                  currentView === 'results' ? 'text-amber-400 bg-amber-400/10 font-bold' : 'text-zinc-400'
                }`}
              >
                <FileCheck2 size={18} />
                <span>Compliance Audit</span>
              </button>
            )}
            <button
              onClick={() => {
                setCurrentView('repository');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                currentView === 'repository' ? 'text-amber-400 bg-amber-400/10 font-bold' : 'text-zinc-400'
              }`}
            >
              <FolderClock size={18} />
              <span>Repository ({records.length})</span>
            </button>
            <button
              onClick={() => {
                setIsRulesModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-400"
            >
              <BookOpen size={18} />
              <span>2011 Rules Guide</span>
            </button>
          </nav>

          <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 space-y-2">
            <div
              onClick={() => {
                setIsAuthModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="cursor-pointer"
            >
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">
                Enforcement ID
              </p>
              <p className="font-mono text-amber-400 text-xs font-bold">{officer.badgeId}</p>
              <p className="text-zinc-300 text-xs mt-0.5">{officer.name}</p>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 mt-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-bold"
            >
              <LogOut size={13} />
              <span>Sign Out Officer</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Layout Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden pt-[57px] md:pt-0">
        {/* Immersive Top Header */}
        <header className="h-20 lg:h-24 border-b border-zinc-800 flex items-center justify-between px-6 lg:px-10 shrink-0 bg-[#0f0f0f]">
          <div>
            <h2 className="font-playfair text-2xl lg:text-3xl font-bold italic text-white tracking-tight">
              {headerInfo.title}
            </h2>
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mt-0.5">
              {headerInfo.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} showLabel />
            {currentView === 'results' && activeRecord && (
              <>
                <button
                  onClick={() => setCurrentView('scan')}
                  className="px-4 lg:px-5 py-2 border border-zinc-800 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all uppercase tracking-widest text-zinc-300"
                >
                  New Scan
                </button>
                <button
                  onClick={() => exportEnforcementPdf(activeRecord)}
                  className="px-4 lg:px-5 py-2 bg-amber-400 text-black rounded-xl text-xs font-bold hover:bg-amber-300 transition-all uppercase tracking-widest shadow-lg shadow-amber-400/10 flex items-center gap-1.5"
                >
                  <FileDown size={14} />
                  <span>Export PDF Report</span>
                </button>
              </>
            )}

            {currentView === 'dashboard' && (
              <button
                onClick={() => setCurrentView('scan')}
                className="px-4 lg:px-5 py-2 bg-amber-400 text-black rounded-xl text-xs font-bold hover:bg-amber-300 transition-all uppercase tracking-widest shadow-lg shadow-amber-400/10 flex items-center gap-1.5"
              >
                <Scan size={14} />
                <span>Start New Audit</span>
              </button>
            )}

            {currentView === 'repository' && (
              <button
                onClick={() => setCurrentView('scan')}
                className="px-4 lg:px-5 py-2 bg-amber-400 text-black rounded-xl text-xs font-bold hover:bg-amber-300 transition-all uppercase tracking-widest shadow-lg shadow-amber-400/10 flex items-center gap-1.5"
              >
                <Scan size={14} />
                <span>Scan Commodity</span>
              </button>
            )}
          </div>
        </header>

        {/* View Content Area */}
        <section className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              records={records}
              officer={officer}
              onStartScan={() => setCurrentView('scan')}
              onSelectRecord={handleSelectRecord}
              onLoadDemoScans={handleLoadDemoScans}
              onLogout={handleLogout}
            />
          )}

          {currentView === 'scan' && (
            <ScanView
              onComplete={handleScanComplete}
              officer={officer}
            />
          )}

          {currentView === 'results' && activeRecord && (
            <ResultsView
              record={activeRecord}
              onNewScan={() => setCurrentView('scan')}
              onSaveToRepository={handleSaveToRepository}
              isSavedInRepo={isSavedInRepo}
            />
          )}

          {currentView === 'repository' && (
            <RepositoryView
              records={records}
              onSelectRecord={handleSelectRecord}
              onDeleteRecord={handleDeleteRecord}
              onClearAll={handleClearAll}
              onLoadDemoScans={handleLoadDemoScans}
              onNewScan={() => setCurrentView('scan')}
            />
          )}
        </section>
      </main>

      {/* Statutory 2011 Rules Guide Modal */}
      <RulesGuideModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* Enforcement Officer Credentials Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentOfficer={officer}
        onSaveOfficer={(newOfficer) => setOfficer(newOfficer)}
      />
    </div>
  );
}
