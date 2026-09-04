import React, { useState, useMemo } from 'react';
import {
  Search,
  FileDown,
  Trash2,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { ScanRecord } from '../types/metrology';
import { exportEnforcementPdf } from '../utils/pdfGenerator';

interface RepositoryViewProps {
  records: ScanRecord[];
  onSelectRecord: (record: ScanRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onLoadDemoScans: () => void;
  onNewScan: () => void;
}

export const RepositoryView: React.FC<RepositoryViewProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
  onLoadDemoScans,
  onNewScan,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'compliant' | 'non_compliant'>('all');

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesSearch =
        rec.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.officerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'compliant' && rec.overallVerdict === 'COMPLIANT') ||
        (statusFilter === 'non_compliant' && rec.overallVerdict === 'NON-COMPLIANT');

      return matchesSearch && matchesStatus;
    });
  }, [records, searchTerm, statusFilter]);

  // Export repository metadata as CSV
  const handleExportCsv = () => {
    if (records.length === 0) return;

    const headers = [
      'Audit ID',
      'Timestamp',
      'Product Name',
      'Overall Verdict',
      'Violations Count',
      'Inspecting Officer',
      'Station',
      'Is Imported'
    ];

    const rows = records.map((r) => {
      const violations = r.results.filter(
        (x) => x.status === 'missing' || x.status === 'malformed'
      ).length;
      return [
        r.id,
        r.timestamp,
        `"${r.productName.replace(/"/g, '""')}"`,
        r.overallVerdict,
        violations,
        `"${r.officerName}"`,
        `"${r.station}"`,
        r.isImported ? 'Yes' : 'No'
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MapDrishti_Audit_Repository_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold font-playfair italic text-white">
            Audit Repository & Records
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-mono uppercase tracking-wider">
            Local statutory inspection archive under Legal Metrology Rules, 2011
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {records.length > 0 && (
            <>
              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#181818] text-xs font-bold text-zinc-300 hover:border-amber-400 hover:text-amber-400 transition-colors uppercase tracking-wider flex items-center gap-1.5"
              >
                <FileSpreadsheet size={15} />
                <span>Export CSV</span>
              </button>
              <button
                onClick={onClearAll}
                className="px-3.5 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors uppercase tracking-wider flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Clear All</span>
              </button>
            </>
          )}

          {records.length === 0 && (
            <button
              onClick={onLoadDemoScans}
              className="px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-xs font-bold text-zinc-200 hover:border-amber-400 hover:text-amber-400 transition-colors uppercase tracking-wider flex items-center gap-1.5"
            >
              <Layers size={15} />
              <span>Load Sample Audits</span>
            </button>
          )}

          <button
            onClick={onNewScan}
            className="px-4 py-2 bg-amber-400 text-black rounded-xl text-xs font-bold hover:bg-amber-300 transition-all uppercase tracking-widest shadow-lg shadow-amber-400/10 flex items-center gap-1.5"
          >
            <span>Scan Package</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="text"
            placeholder="Search by commodity name, audit ID, or officer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-[#181818] pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none font-mono"
          />
        </div>

        <div className="flex rounded-xl border border-zinc-800 bg-[#181818] p-1 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`flex-1 rounded-lg py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
              statusFilter === 'all'
                ? 'bg-zinc-800 text-amber-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All ({records.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('compliant')}
            className={`flex-1 rounded-lg py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
              statusFilter === 'compliant'
                ? 'bg-green-500/20 text-green-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Passed
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('non_compliant')}
            className={`flex-1 rounded-lg py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
              statusFilter === 'non_compliant'
                ? 'bg-red-500/20 text-red-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Violations
          </button>
        </div>
      </div>

      {/* Table of Records */}
      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-800 rounded-3xl bg-[#181818]/40">
          <Search size={32} className="text-zinc-600 mb-2" />
          <p className="text-sm font-semibold text-zinc-300">No Audits Found</p>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">
            {records.length === 0
              ? 'No packages have been inspected yet. Run a scan or load sample audits.'
              : 'No records match your filter criteria.'}
          </p>
          {records.length === 0 && (
            <button
              onClick={onLoadDemoScans}
              className="px-4 py-2 bg-amber-400 text-black rounded-xl text-xs font-bold hover:bg-amber-300 transition-colors uppercase tracking-widest"
            >
              Load Sample Audits
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-[#181818] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/90 text-zinc-400 font-mono uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Audit Reference</th>
                  <th className="px-4 py-3">Commodity / Product</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Verdict</th>
                  <th className="px-4 py-3">Defects</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                {filteredRecords.map((record) => {
                  const isPass = record.overallVerdict === 'COMPLIANT';
                  const defectCount = record.results.filter(
                    (r) => r.status === 'missing' || r.status === 'malformed'
                  ).length;

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-zinc-900/60 transition-colors group cursor-pointer"
                      onClick={() => onSelectRecord(record)}
                    >
                      <td className="px-4 py-3.5 font-mono text-amber-400 font-bold">
                        {record.id}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-zinc-100 max-w-xs truncate font-playfair text-sm">
                        {record.productName}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-zinc-400 whitespace-nowrap text-[11px]">
                        {new Date(record.timestamp).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-1 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${
                            isPass
                              ? 'bg-green-500/10 text-green-500 border-green-500/20'
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}
                        >
                          {isPass ? <ShieldCheck size={11} /> : <ShieldAlert size={11} />}
                          <span>{record.overallVerdict}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        {defectCount === 0 ? (
                          <span className="text-zinc-500 text-[11px]">0 defects</span>
                        ) : (
                          <span className="text-red-400 font-bold text-[11px]">
                            {defectCount} defect{defectCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectRecord(record)}
                            title="View Full Inspection Report"
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-amber-400 transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => exportEnforcementPdf(record)}
                            title="Export Enforcement PDF"
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-amber-400 transition-colors"
                          >
                            <FileDown size={15} />
                          </button>
                          <button
                            onClick={() => onDeleteRecord(record.id)}
                            title="Delete Record"
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
