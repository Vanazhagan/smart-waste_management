import React, { useState } from 'react';
import {
  Navigation,
  Sparkles,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Radio,
  Fuel,
  Share2,
  Zap,
} from 'lucide-react';
import { useStore } from '../../services/store';
import { RouteOptimizer } from '../../services/routeOptimizer';

export const RouteOptimizationView: React.FC = () => {
  const { smartBins, complaints, vehicles, language, setActiveView } = useStore();

  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || 'TN-01-M-4401');

  // Compute optimized route using the service
  const optimizedRoute = RouteOptimizer.generateOptimizedRoute(smartBins, complaints);
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'கழிவு சேகரிப்பு உகந்த வழித்தடம்' : 'Dynamic Route Optimization Engine'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? '80% க்கும் அதிகமான நிரம்பிய தொட்டிகள், P1 புகார்கள் மற்றும் எரிபொருள் சேமிப்பு அடிப்படையில் தானியங்கி வழித்தடம்'
              : 'Multi-stop TSP algorithmic routing factoring critical IoT dustbins (>80%), P1 complaints, and fuel efficiency'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveView('garbageMap')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto transition shadow-sm"
        >
          <Navigation className="w-4 h-4 text-emerald-400" />
          <span>View on GIS Route Map</span>
        </button>
      </div>

      {/* AI Impact Summary Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 shadow-xl border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            AI Fleet Efficiency Analytics
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Route Distance</span>
            <p className="text-2xl font-black text-white font-mono mt-1">{optimizedRoute.totalDistanceKm} km</p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Saved {optimizedRoute.distanceSavedKm} km (22%)
            </span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Mission Time</span>
            <p className="text-2xl font-black text-white font-mono mt-1">{optimizedRoute.estimatedTimeHours} hrs</p>
            <span className="text-[10px] text-emerald-400 font-semibold">Reduced by 45 mins</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Fuel Saved</span>
            <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{optimizedRoute.fuelSavedLitres} Litres</p>
            <span className="text-[10px] text-slate-300 font-mono">≈ ₹612 / trip saved</span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Carbon Offset</span>
            <p className="text-2xl font-black text-emerald-300 font-mono mt-1">14.8 kg CO₂</p>
            <span className="text-[10px] text-emerald-400 font-semibold">Eco-Routing Standard</span>
          </div>
        </div>
      </div>

      {/* Vehicle Selection & Waypoint Manifest Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Vehicle Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            Assigned Compactor Vehicle
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Select Compactor / Dumper</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} - {v.type} ({v.ward})
                </option>
              ))}
            </select>
          </div>

          {selectedVehicle && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Driver</span>
                <span className="font-bold text-slate-900">{selectedVehicle.driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payload Capacity</span>
                <span className="font-bold text-slate-900">{selectedVehicle.capacityTons} Tons</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Fuel</span>
                <span className="font-bold text-slate-900">{selectedVehicle.fuelLevelPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Ward</span>
                <span className="font-bold text-emerald-700">{selectedVehicle.ward}</span>
              </div>
            </div>
          )}

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
            <p className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Manifest Dispatched to Driver App
            </p>
            <p className="text-[11px] text-emerald-800 mt-1">
              Turn-by-turn navigation sequence transmitted to driver mobile terminal.
            </p>
          </div>
        </div>

        {/* Sequential Stops Itinerary */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Sequential Collection Itinerary</h2>
              <p className="text-xs text-slate-500">
                Sorted by AI priority order (Critical IoT bins &gt; P1 complaints &gt; Warning bins)
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
              {optimizedRoute.stops.length} Waypoints
            </span>
          </div>

          <div className="space-y-3">
            {optimizedRoute.stops.map((stop, index) => (
              <div
                key={stop.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{stop.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          stop.type === 'SMART_BIN'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {stop.type === 'SMART_BIN' ? 'IoT Dustbin' : 'Complaint Spot'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-0.5">{stop.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      stop.priority === 'CRITICAL' || stop.priority === 'P1'
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {stop.priority}
                  </span>

                  {stop.fillPercentage && (
                    <span className="font-mono text-xs font-bold text-slate-700">
                      Fill: {stop.fillPercentage}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
