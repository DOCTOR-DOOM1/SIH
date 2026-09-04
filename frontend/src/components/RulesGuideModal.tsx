import React from 'react';
import { X, BookOpen, AlertCircle, ShieldCheck } from 'lucide-react';

interface RulesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesGuideModal: React.FC<RulesGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-[#181818] p-6 shadow-2xl text-zinc-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-playfair italic text-zinc-100">
              Statutory Reference Guide
            </h2>
            <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
              Legal Metrology (Packaged Commodities) Rules, 2011 • Ministry of Consumer Affairs
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm">
          {/* Section 1: The 6 Mandatory Declarations */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <h3 className="font-semibold text-amber-400 text-sm mb-3 flex items-center gap-2">
              <ShieldCheck size={16} /> Rule 6: Mandatory Declarations on Pre-Packaged Commodities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-300">
              <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                <span className="font-mono text-amber-400/90 font-bold block mb-1">Rule 6(1)(a) • Manufacturer / Packer</span>
                Name and complete address of manufacturer, packer, or importer. Complete address must specify postal PIN code for geographic identification.
              </div>
              <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                <span className="font-mono text-amber-400/90 font-bold block mb-1">Rule 11 & 12 • Net Quantity</span>
                Net quantity in standard metric units: mass (g, kg), volume (ml, l), length (m, cm), or count (units, N, pcs). Imperial units (oz, lbs) are prohibited.
              </div>
              <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                <span className="font-mono text-amber-400/90 font-bold block mb-1">Rule 6(1)(e) • Maximum Retail Price (MRP)</span>
                Must state MRP in Indian Rupees AND the explicit mandatory qualifying phrase "inclusive of all taxes" (or "incl. of all taxes").
              </div>
              <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                <span className="font-mono text-amber-400/90 font-bold block mb-1">Rule 6(1)(d) • Date of Mfg / Packing</span>
                Month and year in which commodity is manufactured, packed or imported (e.g. 05/2024 or May 2024). Cannot be post-dated or older than statutory window.
              </div>
              <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                <span className="font-mono text-amber-400/90 font-bold block mb-1">Rule 6(1)(f) • Consumer Care Details</span>
                Contact information including reachable telephone/toll-free number and/or valid email address for grievance redressal.
              </div>
              <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800">
                <span className="font-mono text-amber-400/90 font-bold block mb-1">Rule 6(1)(aa) • Country of Origin</span>
                Mandatory for imported packaged commodities. Must clearly declare the country of manufacture/origin.
              </div>
            </div>
          </div>

          {/* Section 2: Rule 9 Font Size Table */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <h3 className="font-semibold text-amber-400 text-sm mb-2 flex items-center gap-2">
              <AlertCircle size={16} /> Rule 9 & Schedule II: Minimum Prescribed Font Height
            </h3>
            <p className="text-xs text-zinc-400 mb-3">
              The height of numerals and letters for net quantity declaration is calibrated to package net weight/volume. Automated vision estimates proportions; physical inspection requires calibrated metric scale.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900 text-zinc-400 font-mono uppercase text-[11px] border-b border-zinc-800">
                  <tr>
                    <th className="px-3 py-2">Net Quantity Range</th>
                    <th className="px-3 py-2">Normal Packaging (Min Height)</th>
                    <th className="px-3 py-2">Blown / Molded Surface</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300 font-mono">
                  <tr>
                    <td className="px-3 py-2">Up to 200 g / ml</td>
                    <td className="px-3 py-2 text-amber-400 font-bold">2.0 mm</td>
                    <td className="px-3 py-2">4.0 mm</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Above 200 g/ml up to 1 kg / l</td>
                    <td className="px-3 py-2 text-amber-400 font-bold">4.0 mm</td>
                    <td className="px-3 py-2">6.0 mm</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Above 1 kg / l</td>
                    <td className="px-3 py-2 text-amber-400 font-bold">6.0 mm</td>
                    <td className="px-3 py-2">8.0 mm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Section 36 Penalty Note */}
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-xs text-zinc-300">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider mb-1 font-mono text-[11px]">
              Enforcement Penalties • Section 36 of Legal Metrology Act, 2009
            </h4>
            <p>
              Non-compliance with packaging declaration rules attracts penalties under Section 36: Fine up to ₹25,000 for first offence, ₹50,000 for second offence, and up to ₹1,00,000 or imprisonment up to one year for subsequent offences.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-semibold text-black hover:bg-amber-300 transition-colors shadow-md"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
