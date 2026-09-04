import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Scan,
  AlertTriangle,
  FileCheck2,
  TrendingUp,
  Download,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { OfficerProfile, ScanRecord } from '../types/metrology';
import { exportEnforcementPdf } from '../utils/pdfGenerator';

interface DashboardViewProps {
  records: ScanRecord[];
  officer?: OfficerProfile;
  onStartScan: () => void;
  onSelectRecord: (record: ScanRecord) => void;
  onLoadDemoScans: () => void;
  onLogout?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  officer,
  onStartScan,
  onSelectRecord,
  onLoadDemoScans,
  onLogout,
}) => {
  const totalAudits = records.length;
  const compliantAudits = records.filter((r) => r.overallVerdict === 'COMPLIANT').length;
  const nonCompliantAudits = totalAudits - compliantAudits;
  const complianceRate = totalAudits > 0 ? Math.round((compliantAudits / totalAudits) * 100) : 0;

  // Compute common violations
  let taxClauseViolations = 0;
  let pinCodeViolations = 0;
  let unitViolations = 0;
  let careViolations = 0;
  let originViolations = 0;

  records.forEach((rec) => {
    rec.results.forEach((res) => {
      if (res.status === 'malformed' || res.status === 'missing') {
        if (res.id === 'mrp') taxClauseViolations++;
        if (res.id === 'mfg_details') pinCodeViolations++;
        if (res.id === 'net_qty') unitViolations++;
        if (res.id === 'consumer_care') careViolations++;
        if (res.id === 'origin') originViolations++;
      }
    });
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#181818] p-6 sm:p-8 shadow-xl bg-glow">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/30 px-3 py-1 text-xs font-mono text-amber-400 font-semibold uppercase tracking-wider">
              <Sparkles size={13} />
              <span>Smart India Hackathon • Problem SIH26034 Prototype</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-playfair italic text-white tracking-tight">
              Automated Packaged Commodity Compliance
            </h2>
            {officer && (
              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs font-mono text-zinc-400">
                <span className="text-zinc-500">Logged in as:</span>
                <span className="text-amber-400 font-bold">{officer.name}</span>
                <span className="text-zinc-600">({officer.badgeId})</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">{officer.station}</span>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="ml-1 text-[11px] text-zinc-500 hover:text-amber-400 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Switch Inspector
                  </button>
                )}
              </div>
            )}
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Enforcing India's Legal Metrology (Packaged Commodities) Rules, 2011 with multimodal Gemini Vision extraction, automated Rule 6 verification, and court-ready PDF enforcement reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onStartScan}
              className="px-5 py-3 bg-amber-400 text-black rounded-xl text-xs font-bold hover:bg-amber-300 transition-all uppercase tracking-widest shadow-lg shadow-amber-400/10 flex items-center gap-2"
            >
              <Scan size={16} />
              <span>Scan New Package</span>
            </button>
            {totalAudits === 0 && (
              <button
                onClick={onLoadDemoScans}
                className="px-4 py-3 border border-zinc-700 bg-zinc-900 rounded-xl text-xs font-bold text-zinc-200 hover:border-amber-400/50 hover:text-amber-400 transition-colors uppercase tracking-widest flex items-center gap-2"
              >
                <Layers size={15} />
                <span>Load Sample Audits</span>
              </button>
            )}
          </div>
        </div>

        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-400/5 blur-3xl pointer-events-none" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-zinc-800 bg-[#181818] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-zinc-500">
              Total Audits
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-amber-400 border border-zinc-800">
              <FileCheck2 size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white font-mono">{totalAudits}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Packaged items inspected</div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#181818] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-zinc-500">
              Compliance Rate
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white font-mono">{complianceRate}%</div>
            <div className="text-[11px] text-zinc-500 mt-1">Rule 6 verification pass rate</div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#181818] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-zinc-500">
              Violations Flagged
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-400 font-mono">{nonCompliantAudits}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Statutory non-compliance flags</div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#181818] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-zinc-500">
              Rule 9 Advisory
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-400 font-mono">{totalAudits}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Physical scale check recommended</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Violations Analytics + Recent Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Common Violations Distribution */}
        <div className="rounded-2xl border border-zinc-800 bg-[#181818] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-playfair italic mb-1">
              Top Statutory Violations
            </h3>
            <p className="text-xs text-zinc-400 mb-5 font-sans">
              Aggregated defects under Legal Metrology Rules, 2011
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-zinc-300 mb-1.5 font-mono text-[11px]">
                  <span>Missing "Inclusive of all taxes" (Rule 6(1)(e))</span>
                  <span className="font-bold text-amber-400">{taxClauseViolations}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${totalAudits > 0 ? Math.min(100, (taxClauseViolations / totalAudits) * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1.5 font-mono text-[11px]">
                  <span>Missing Postal PIN Code (Rule 6(1)(a))</span>
                  <span className="font-bold text-red-400">{pinCodeViolations}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-red-400 rounded-full"
                    style={{ width: `${totalAudits > 0 ? Math.min(100, (pinCodeViolations / totalAudits) * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1.5 font-mono text-[11px]">
                  <span>Non-standard Units e.g. oz/lbs (Rule 11)</span>
                  <span className="font-bold text-amber-500">{unitViolations}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${totalAudits > 0 ? Math.min(100, (unitViolations / totalAudits) * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1.5 font-mono text-[11px]">
                  <span>Missing Consumer Helpline / Email (Rule 6(1)(f))</span>
                  <span className="font-bold text-zinc-400">{careViolations}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-zinc-500 rounded-full"
                    style={{ width: `${totalAudits > 0 ? Math.min(100, (careViolations / totalAudits) * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1.5 font-mono text-[11px]">
                  <span>Missing Country of Origin for Imports</span>
                  <span className="font-bold text-purple-400">{originViolations}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-purple-400 rounded-full"
                    style={{ width: `${totalAudits > 0 ? Math.min(100, (originViolations / totalAudits) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-zinc-800 bg-black p-3.5 text-[11px] text-zinc-400 font-mono">
            <span className="text-amber-400 font-bold block mb-0.5 uppercase tracking-wider">
              Enforcement Protocol:
            </span>
            Inspection reports generated via MāpDrishti cite Section 36 of Legal Metrology Act, 2009.
          </div>
        </div>

        {/* Recent Audits List */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-[#181818] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white font-playfair italic">
                Recent Compliance Audits
              </h3>
              <p className="text-xs text-zinc-400">
                Logged package inspections and statutory verdicts
              </p>
            </div>
            {totalAudits > 0 && (
              <button
                onClick={() => onSelectRecord(records[0])}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors uppercase tracking-wider font-mono"
              >
                <span>Latest Scan</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
              <Scan size={36} className="text-zinc-600 mb-3" />
              <p className="text-sm font-semibold text-zinc-300">No Audits Conducted Yet</p>
              <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">
                Scan your first package or load sample pre-scanned items to test the Legal Metrology compliance engine.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onStartScan}
                  className="px-4 py-2 bg-amber-400 text-black rounded-xl text-xs font-bold hover:bg-amber-300 transition-colors uppercase tracking-widest"
                >
                  Start First Scan
                </button>
                <button
                  onClick={onLoadDemoScans}
                  className="px-4 py-2 border border-zinc-700 bg-zinc-800 rounded-xl text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition-colors uppercase tracking-widest"
                >
                  Load Sample Data
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {records.slice(0, 5).map((record) => {
                const isPass = record.overallVerdict === 'COMPLIANT';

                return (
                  <div
                    key={record.id}
                    onClick={() => onSelectRecord(record)}
                    className="group cursor-pointer rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3.5 hover:border-amber-400/40 hover:bg-zinc-900 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                          isPass
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}
                      >
                        {isPass ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-amber-400/80 font-bold">{record.id}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-zinc-100 truncate group-hover:text-amber-400 transition-colors font-playfair">
                          {record.productName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider border ${
                          isPass
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}
                      >
                        {record.overallVerdict}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportEnforcementPdf(record);
                        }}
                        title="Export Official PDF"
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-amber-400 transition-colors"
                      >
                        <Download size={15} />
                      </button>
                      <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
