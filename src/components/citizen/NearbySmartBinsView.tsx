import React, { useState } from 'react';
import {
  Radio,
  MapPin,
  Clock,
  Battery,
  Wifi,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import { useStore } from '../../services/store';

export const NearbySmartBinsView: React.FC = () => {
  const { smartBins, language, setActiveView } = useStore();
  const [wardFilter, setWardFilter] = useState('ALL');

  const filtered = smartBins.filter((b) => wardFilter === 'ALL' || b.ward === wardFilter);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'அருகிலுள்ள ஸ்மார்ட் குப்பைத்தொட்டிகள் (IoT)' : 'Nearby Smart Dustbins (IoT)'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'ESP32 மற்றும் அல்ட்ராசோனிக் சென்சார் மூலம் நேரலை நிரம்பல் நிலை கண்காணிப்பு'
              : 'Real-time telemetry and fill-level monitoring from ESP32 & HC-SR04 ultrasonic sensors'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveView('garbageMap')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto transition shadow-sm"
        >
          <Navigation className="w-4 h-4" />
          <span>Open Interactive GIS Map</span>
        </button>
      </div>

      {/* Grid of Smart Bins */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((bin) => {
          const isCritical = bin.status === 'CRITICAL' || bin.fillPercentage >= 95;
          const isWarning = bin.status === 'WARNING' || bin.status === 'COLLECTION_REQUIRED';

          return (
            <div
              key={bin.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition ${
                isCritical
                  ? 'border-rose-300 ring-1 ring-rose-400/50 bg-gradient-to-b from-rose-50/20 to-white'
                  : 'border-slate-200'
              }`}
            >
              {/* Top Row: Bin ID + Status */}
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

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
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
              </div>

              {/* Address */}
              <p className="text-xs text-slate-700 font-medium flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>{bin.location.address}</span>
              </p>

              {/* Fill Gauge */}
              <div>
                <div className="flex justify-between items-baseline text-xs mb-1.5">
                  <span className="font-semibold text-slate-600">Current Ultrasonic Fill Level</span>
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

              {/* Sensor Diagnostic Stats */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pred. Overflow: {bin.predictedOverflowHours}h</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5 text-slate-400" />
                  <span>Battery: {bin.batteryLevel}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
