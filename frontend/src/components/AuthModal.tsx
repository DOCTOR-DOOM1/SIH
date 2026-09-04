import { useState } from 'react';
import { ShieldCheck, Sparkles, X } from 'lucide-react';
import { OfficerProfile } from '../types/metrology';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOfficer: OfficerProfile;
  onSaveOfficer: (officer: OfficerProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentOfficer,
  onSaveOfficer,
}) => {
  const [formData, setFormData] = useState<OfficerProfile>(currentOfficer);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveOfficer(formData);
    onClose();
  };

  const handleQuickInspector = (role: 'central' | 'state' | 'customs') => {
    if (role === 'central') {
      setFormData({
        name: 'Tukaram Mundhe',
        badgeId: 'LM-DL-2024-884',
        designation: 'Senior Legal Metrology Inspector',
        station: 'New Delhi Central Inspection Wing',
        jurisdiction: 'National Capital Region (NCR)',
      });
    } else if (role === 'state') {
      setFormData({
        name: 'P. S. Deshmukh',
        badgeId: 'LM-MH-2025-102',
        designation: 'Assistant Controller of Legal Metrology',
        station: 'Mumbai Division & Port Authority',
        jurisdiction: 'Maharashtra Western Zone',
      });
    } else {
      setFormData({
        name: 'A. K. Sengupta',
        badgeId: 'LM-CUS-2024-519',
        designation: 'Customs & Metrology Enforcement Officer',
        station: 'Air Cargo Complex, IGI Airport',
        jurisdiction: 'Import Clearance & Border Metrology',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#181818] p-6 shadow-2xl text-zinc-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-playfair italic text-zinc-100">
              Enforcement Officer Credentials
            </h2>
            <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
              Legal Metrology Department • SIH26034
            </p>
          </div>
        </div>

        {/* Quick presets */}
        <div className="mb-6 rounded-xl bg-zinc-900/80 p-3 border border-zinc-800">
          <p className="text-[11px] font-mono uppercase tracking-wider text-amber-400/90 mb-2 flex items-center gap-1.5 font-semibold">
            <Sparkles size={13} /> Quick Inspector Presets
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickInspector('central')}
              className="rounded-lg bg-zinc-800/90 hover:bg-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200 border border-zinc-700/60 transition-colors text-left"
            >
              <div className="font-semibold text-zinc-100">Delhi Central</div>
              <div className="text-[10px] text-zinc-400">LM-DL-884</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickInspector('state')}
              className="rounded-lg bg-zinc-800/90 hover:bg-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200 border border-zinc-700/60 transition-colors text-left"
            >
              <div className="font-semibold text-zinc-100">Mumbai Port</div>
              <div className="text-[10px] text-zinc-400">LM-MH-102</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickInspector('customs')}
              className="rounded-lg bg-zinc-800/90 hover:bg-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200 border border-zinc-700/60 transition-colors text-left"
            >
              <div className="font-semibold text-zinc-100">Customs Import</div>
              <div className="text-[10px] text-zinc-400">LM-CUS-519</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Officer Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Badge / Inspector ID
              </label>
              <input
                type="text"
                required
                value={formData.badgeId}
                onChange={(e) => setFormData({ ...formData, badgeId: e.target.value })}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 font-mono focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Designation
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Station / Zonal Wing
            </label>
            <input
              type="text"
              required
              value={formData.station}
              onChange={(e) => setFormData({ ...formData, station: e.target.value })}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Jurisdiction Area
            </label>
            <input
              type="text"
              required
              value={formData.jurisdiction}
              onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-800 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-amber-400 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/10"
            >
              Save Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
