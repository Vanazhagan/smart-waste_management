import React, { useState } from 'react';
import {
  PlusCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Radio,
  MapPin,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useStore } from '../../services/store';
import { translations } from '../../translations';
import { Complaint } from '../../types';
import { RaiseComplaintModal } from './RaiseComplaintModal';
import { ComplaintDetailModal } from './ComplaintDetailModal';

export const CitizenDashboard: React.FC = () => {
  const { complaints, smartBins, language, setActiveView } = useStore();
  const t = translations[language];

  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const pending = total - resolved;
  const critical = complaints.filter((c) => c.aiAnalysis?.priority === 'P1' && c.status !== 'Resolved').length;

  const nearbyBins = smartBins.slice(0, 3);
  const recentComplaints = complaints.slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Primary Action Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>AI-Driven Tamil Nadu Municipal Waste Ecosystem</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'ta' ? 'தூய்மையான தமிழ்நாடு நகராட்சி சேவை' : 'Proactive Municipal Waste Service'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t.uspTagline}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsRaiseModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition transform active:scale-95"
            >
              <PlusCircle className="w-5 h-5" />
              <span>{language === 'ta' ? 'புகார் பதிவு செய்க' : 'RAISE COMPLAINT NOW'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('garbageMap')}
              className="px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 flex items-center gap-2 transition"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ta' ? 'வரைபடம் காண்க' : 'View GIS Map'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Citizen Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">{t.totalComplaints}</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{total}</p>
          <span className="text-[11px] text-slate-500 font-medium">Logged in municipal ward</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved Tickets</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{resolved}</p>
          <span className="text-[11px] text-emerald-700 font-medium font-mono">
            {total > 0 ? Math.round((resolved / total) * 100) : 0}% Success Rate
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold uppercase tracking-wider">{t.pendingComplaints}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{pending}</p>
          <span className="text-[11px] text-amber-700 font-medium">
            {critical > 0 ? `${critical} Critical (P1) in progress` : 'Under active dispatch'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold uppercase tracking-wider">{t.averageResolutionTime}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">2.8 hrs</p>
          <span className="text-[11px] text-blue-700 font-medium">35% faster than standard</span>
        </div>
      </div>

      {/* Main Grid: Recent Complaints + Nearby IoT Smart Dustbins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Complaints */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {language === 'ta' ? 'அண்மை புகார்கள் மற்றும் தீர்வு நிலை' : 'Recent Complaints & AI Verification'}
              </h2>
              <p className="text-xs text-slate-500">Track real-time status and sanitary team progress</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('myComplaints')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentComplaints.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedComplaint(c)}
                className="p-4 hover:bg-slate-50 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={c.photoUrl}
                    alt="Complaint thumbnail"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900">{c.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.aiAnalysis?.priority === 'P1'
                            ? 'bg-rose-100 text-rose-800'
                            : c.aiAnalysis?.priority === 'P2'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {c.aiAnalysis?.priority || 'P2'} Priority
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                        • {c.aiAnalysis?.wasteType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 line-clamp-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{c.location.address}</span>
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      {c.assignedWorkerName && (
                        <span className="text-slate-700 font-medium">Worker: {c.assignedWorkerName}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      c.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'Cleaning'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Nearby IoT Smart Dustbins */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'ta' ? 'அருகிலுள்ள ஸ்மார்ட் தொட்டிகள்' : 'Nearby Smart Dustbins'}
                </h3>
                <p className="text-[11px] text-slate-500">Ultrasonic IoT Fill Level Sensor</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('nearbyBins')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              View Map
            </button>
          </div>

          <div className="space-y-3">
            {nearbyBins.map((b) => (
              <div key={b.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-900">{b.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      b.status === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : b.status === 'COLLECTION_REQUIRED'
                        ? 'bg-amber-100 text-amber-800'
                        : b.status === 'WARNING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-1">{b.location.address}</p>

                {/* Fill Level Progress */}
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-1">
                    <span>Fill Level</span>
                    <span className="font-mono font-bold">{b.fillPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.fillPercentage >= 90
                          ? 'bg-rose-600'
                          : b.fillPercentage >= 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, b.fillPercentage)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span>Battery: {b.batteryLevel}%</span>
                  <span>Pred. Overflow: {b.predictedOverflowHours}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <RaiseComplaintModal isOpen={isRaiseModalOpen} onClose={() => setIsRaiseModalOpen(false)} />
      <ComplaintDetailModal complaint={selectedComplaint} onClose={() => setSelectedComplaint(null)} />
    </div>
  );
};
