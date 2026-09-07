import React, { useState } from 'react';
import {
  Flame,
  AlertTriangle,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  PlusCircle,
  Video,
  Radio,
} from 'lucide-react';
import { useStore } from '../../services/store';
import { Hotspot } from '../../types';

export const HotspotDetectionView: React.FC = () => {
  const { hotspots, language, setActiveView } = useStore();

  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot>(hotspots[0]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'தீவிர குப்பை குவிப்பு பகுதிகள் (Hotspots)' : 'Chronic Garbage Hotspots & Preventive Interventions'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'மீண்டும் மீண்டும் குப்பை கொட்டப்படும் பகுதிகள், நேர வடிவங்கள் மற்றும் தடுப்பு நடவடிக்கைகள்'
              : 'Algorithmic repeat-dumping detection, temporal patterns, root cause diagnosis, and targeted municipal interventions'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveView('garbageMap')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto transition shadow-sm"
        >
          <MapPin className="w-4 h-4 text-rose-400" />
          <span>View Heatmap on GIS</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 shadow-sm">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
            Identified Chronic Hotspots
          </span>
          <p className="text-2xl font-black text-rose-600 font-mono mt-1">{hotspots.length} Clusters</p>
          <span className="text-[11px] text-rose-700 font-medium">Accounting for 44% of total complaints</span>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            Peak Dumping Window
          </span>
          <p className="text-2xl font-black text-amber-600 font-mono mt-1">8:00 PM – 11:30 PM</p>
          <span className="text-[11px] text-amber-700">Night market closure & commercial offloading</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Recommended Interventions
          </span>
          <p className="text-2xl font-black text-emerald-600 font-mono mt-1">4 Active Actions</p>
          <span className="text-[11px] text-emerald-700">CCTV, IoT Bins, & Night Patrol Shifts</span>
        </div>
      </div>

      {/* Hotspots Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Hotspots */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            High Density Vulnerability Clusters
          </h2>

          {hotspots.map((h) => {
            const isSelected = selectedHotspot?.id === h.id;
            return (
              <div
                key={h.id}
                onClick={() => setSelectedHotspot(h)}
                className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-500 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{h.areaName}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800">
                    {h.complaintCount} Incidents
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{h.ward}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-600">
                  <span>Waste: {h.predominantWasteType}</span>
                  <span className="font-semibold text-rose-700">{h.timePattern.split(' ')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Columns: Detailed Diagnosis & Intervention Blueprint */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 uppercase">
                  {selectedHotspot.ward}
                </span>
                <h2 className="text-lg font-black text-slate-900">{selectedHotspot.areaName}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Spatial Coordinate: {selectedHotspot.lat}° N, {selectedHotspot.lng}° E
              </p>
            </div>

            <span className="text-xl font-mono font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
              {selectedHotspot.complaintCount} Logs / Month
            </span>
          </div>

          {/* Temporal & Root Cause Diagnostics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Time Pattern Analysis
              </span>
              <p className="font-bold text-slate-900 text-sm">{selectedHotspot.timePattern}</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Sensor log timestamp analysis confirms 78% of unsegregated debris deposition occurs during post-market commercial shutdown.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Identified Probable Cause
              </span>
              <p className="font-bold text-slate-900 text-sm">{selectedHotspot.probableCause}</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Insufficient static collection capacity coupled with informal vendor packaging disposal along the main vehicular thoroughfare.
              </p>
            </div>
          </div>

          {/* Targeted Action Plan Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Municipal Prescriptive Intervention Plan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Radio className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <strong className="text-slate-900 block font-bold">Install Dual IoT Dustbins</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Deploy 2x 1100L heavy-duty ultrasonic bins at corner junctions.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <strong className="text-slate-900 block font-bold">Add 9:30 PM Night Patrol</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Schedule second daily compactor pickup at 9:30 PM for commercial markets.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <strong className="text-slate-900 block font-bold">Install CCTV Surveillance</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Tamil Nadu Police & Corporation integrated ANPR camera for illegal dumping penalty.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <strong className="text-slate-900 block font-bold">Merchant Awareness Drive</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Issue bilingual notices and conduct merchant association workshops.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
