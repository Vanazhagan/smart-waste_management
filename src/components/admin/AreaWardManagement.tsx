import React, { useState } from 'react';
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Users,
  Radio,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Search,
} from 'lucide-react';
import { useStore } from '../../services/store';

export const AreaWardManagement: React.FC = () => {
  const { areas, language } = useStore();
  const [search, setSearch] = useState('');

  const filtered = areas.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.wardNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.zone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'வார்டு & மண்டல செயல்திறன் கண்காணிப்பு' : 'Ward & Area Performance Analytics'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'மாதாந்திர ஒப்பீடு, தூய்மை குறியீடு, பணியாளர்கள் ஒதுக்கீடு மற்றும் தானியங்கி எச்சரிக்கைகள்'
              : 'Ward-level MoM complaint tracking, Cleanliness Index (0–100), and proactive intervention triggers'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-rose-50 text-rose-700 font-bold px-3 py-1.5 rounded-xl border border-rose-200">
            1 Critical Alert (Area 2: +59.4%)
          </span>
        </div>
      </div>

      {/* Critical Area Surge Spotlight Banner (Section 18 mandate) */}
      <div className="rounded-2xl bg-rose-600 text-white p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <AlertTriangle className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-200 block">
                Critical Ward Anomaly Alert
              </span>
              <h2 className="text-lg font-black">Area 2 — Usman Road / T. Nagar (Ward 08)</h2>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm self-start sm:self-auto">
            <div>
              <span className="text-[10px] uppercase text-rose-200 block">August (Prev)</span>
              <span className="text-lg font-mono font-bold">32 Complaints</span>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-rose-200" />
            <div>
              <span className="text-[10px] uppercase text-rose-200 block">September (Current)</span>
              <span className="text-lg font-mono font-bold text-yellow-300">51 Complaints</span>
            </div>
            <div className="pl-2 border-l border-white/20">
              <span className="text-[10px] uppercase text-rose-200 block">Surge</span>
              <span className="text-lg font-mono font-black text-white">+59.4%</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-rose-950/40 rounded-xl border border-rose-400/30 text-xs text-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
            <span>
              <strong>System Prescriptive Action:</strong> Allocate 2 additional workers, increase compactor frequency to 2x daily, and deploy 2 smart bins on Usman Road.
            </span>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-white text-rose-950 font-black rounded-lg text-xs hover:bg-rose-50 transition shadow self-start sm:self-auto shrink-0"
          >
            Apply Auto-Intervention
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ward number, area or zone..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Ward Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="px-4 py-3">Ward & Area Name</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3 text-center">Prev Month (Aug)</th>
                <th className="px-4 py-3 text-center">Curr Month (Sep)</th>
                <th className="px-4 py-3 text-center">% MoM Change</th>
                <th className="px-4 py-3 text-center">Cleanliness Index</th>
                <th className="px-4 py-3 text-center">Workers</th>
                <th className="px-4 py-3 text-center">Smart Bins</th>
                <th className="px-4 py-3 text-right">Trend Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((area) => {
                const isDeteriorated = area.status === 'Deteriorated';
                const isImproved = area.status === 'Improved';

                return (
                  <tr
                    key={area.id}
                    className={`hover:bg-slate-50 transition ${
                      isDeteriorated ? 'bg-rose-50/40 font-medium' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 block">{area.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{area.wardNumber}</span>
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-600">{area.zone}</td>

                    <td className="px-4 py-3 text-center font-mono text-slate-500">{area.previousMonthComplaints}</td>

                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-900">
                      {area.currentMonthComplaints}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          area.percentageChange > 0
                            ? 'text-rose-700 bg-rose-100'
                            : 'text-emerald-700 bg-emerald-100'
                        }`}
                      >
                        {area.percentageChange > 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {area.percentageChange > 0 ? `+${area.percentageChange}%` : `${area.percentageChange}%`}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full font-mono font-bold text-xs ${
                          area.cleanlinessIndex >= 85
                            ? 'bg-emerald-100 text-emerald-800'
                            : area.cleanlinessIndex >= 70
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {area.cleanlinessIndex}/100
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center font-mono font-semibold">{area.assignedWorkers}</td>

                    <td className="px-4 py-3 text-center font-mono font-semibold">{area.smartBinsCount}</td>

                    <td className="px-4 py-3 text-right">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isImproved
                            ? 'bg-emerald-100 text-emerald-800'
                            : isDeteriorated
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {area.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
