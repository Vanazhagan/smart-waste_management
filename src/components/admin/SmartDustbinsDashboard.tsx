import React, { useState } from 'react';
import {
  Radio,
  RefreshCw,
  Sliders,
  Battery,
  Clock,
  AlertTriangle,
  MapPin,
  Flame,
  Navigation,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useStore } from '../../services/store';
import { SmartBin } from '../../types';
import { IoTSimulatorModal } from './IoTSimulatorModal';

export const SmartDustbinsDashboard: React.FC = () => {
  const { smartBins, simulateAllBinsCycle, language, setActiveView } = useStore();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBinForSim, setSelectedBinForSim] = useState<SmartBin | null>(null);

  const filtered = smartBins.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  const criticalCount = smartBins.filter((b) => b.status === 'CRITICAL' || b.fillPercentage >= 95).length;
  const collectionReqCount = smartBins.filter((b) => b.status === 'COLLECTION_REQUIRED').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'ஸ்மார்ட் குப்பைத்தொட்டி நெட்வொர்க் (IoT)' : 'IoT Smart Dustbins Network'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'அல்ட்ராசோனிக் சென்சார்கள் மூலம் நிகழ்நேர கழிவு நிரம்பல் நிலை மற்றும் தானியங்கி வழித்தட உருவாக்கம்'
              : 'Ultrasonic HC-SR04 telemetry, overflow forecasting, and automated collection route triggers'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => simulateAllBinsCycle()}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulate Sensor Cycle</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('routeOptimization')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <Navigation className="w-4 h-4" />
            <span>Optimize Pickup Route</span>
          </button>
        </div>
      </div>

      {/* Overview Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Deployed Bins</span>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{smartBins.length}</p>
          <span className="text-[11px] text-slate-500">Across 6 Municipal Wards</span>
        </div>

        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 shadow-sm">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Critical (&gt;95%)</span>
          <p className="text-2xl font-black text-rose-600 mt-1 font-mono">{criticalCount}</p>
          <span className="text-[11px] text-rose-700 font-semibold">Immediate collection needed</span>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Collection Required</span>
          <p className="text-2xl font-black text-amber-600 mt-1 font-mono">{collectionReqCount}</p>
          <span className="text-[11px] text-amber-700">Fill level 85%–95%</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Normal Range</span>
          <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            {smartBins.length - criticalCount - collectionReqCount}
          </p>
          <span className="text-[11px] text-emerald-700">Under 85% capacity</span>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['ALL', 'CRITICAL', 'COLLECTION_REQUIRED', 'WARNING', 'NORMAL'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              statusFilter === st
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Bins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((bin) => {
          const isCritical = bin.status === 'CRITICAL' || bin.fillPercentage >= 95;

          return (
            <div
              key={bin.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition ${
                isCritical
                  ? 'border-rose-300 ring-2 ring-rose-500/20 bg-gradient-to-b from-rose-50/20 to-white'
                  : 'border-slate-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isCritical ? 'bg-rose-100 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-900 block">{bin.id}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{bin.ward}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isCritical
                        ? 'bg-rose-600 text-white animate-pulse'
                        : bin.status === 'COLLECTION_REQUIRED'
                        ? 'bg-amber-500 text-white'
                        : bin.status === 'WARNING'
                        ? 'bg-yellow-400 text-slate-900'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {bin.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedBinForSim(bin)}
                    title="Simulate Telemetry"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Location */}
              <p className="text-xs text-slate-700 font-medium flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>{bin.location.address}</span>
              </p>

              {/* Fill Gauge */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-500 font-medium">Ultrasonic Fill Level</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{bin.fillPercentage}%</span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      bin.fillPercentage >= 95
                        ? 'bg-rose-600'
                        : bin.fillPercentage >= 85
                        ? 'bg-amber-500'
                        : bin.fillPercentage >= 70
                        ? 'bg-yellow-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, bin.fillPercentage)}%` }}
                  />
                </div>
              </div>

              {/* Telemetry Diagnostics */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Overflow in: <strong className="text-slate-800">{bin.predictedOverflowHours}h</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5 text-slate-400" />
                  <span>Battery: {bin.batteryLevel}%</span>
                </div>
              </div>

              {/* Footer Quick Action */}
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-400">
                  Updated: {new Date(bin.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedBinForSim(bin)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Adjust Telemetry
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulator Modal */}
      <IoTSimulatorModal bin={selectedBinForSim} onClose={() => setSelectedBinForSim(null)} />
    </div>
  );
};
