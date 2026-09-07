import React, { useState } from 'react';
import {
  Truck,
  Fuel,
  Wrench,
  Navigation,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  IndianRupee,
} from 'lucide-react';
import { useStore } from '../../services/store';
import { Vehicle } from '../../types';

export const VehicleManagementView: React.FC = () => {
  const { vehicles, vehicleExpenses, language, setActiveView } = useStore();

  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = vehicles.filter((v) => {
    if (statusFilter === 'ALL') return true;
    return v.status === statusFilter;
  });

  const totalFuelConsumed = vehicles.reduce((acc, v) => acc + v.fuelConsumedLiters, 0);
  const totalDistance = vehicles.reduce((acc, v) => acc + v.totalDistanceKm, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'நகராட்சி வாகனங்கள் மற்றும் எரிபொருள் மேலாண்மை' : 'Municipal Waste Fleet & Fuel Management'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'வாகனங்களின் நிலை, எரிபொருள் பயன்பாடு, தூரம் மற்றும் சேவை விவரங்கள்'
              : 'Compactor trucks, tippers, live GPS telematics, daily diesel consumption, and maintenance scheduling'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveView('garbageMap')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto transition shadow-sm"
        >
          <Navigation className="w-4 h-4 text-emerald-400" />
          <span>Track Fleet Live on GIS Map</span>
        </button>
      </div>

      {/* Fleet KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Active Vehicles</span>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{vehicles.length}</p>
          <span className="text-[11px] text-emerald-700 font-medium">100% Compactor Readiness</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Fuel Consumed</span>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalFuelConsumed} L</p>
          <span className="text-[11px] text-slate-500 font-mono">≈ ₹12,740 / day</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Fleet Distance</span>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalDistance} km</p>
          <span className="text-[11px] text-emerald-700 font-medium">-22% via Optimized TSP</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Fleet Maintenance</span>
          <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            {vehicles.filter((v) => v.status === 'Active').length} Active
          </p>
          <span className="text-[11px] text-slate-500">1 Scheduled for Service</span>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div>
              {/* Top Row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                    <Truck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{v.registrationNumber}</h3>
                    <span className="text-xs text-slate-500 font-medium">
                      {v.type} • {v.capacityTons} Tons Payload
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    v.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : v.status === 'Due for Service'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {v.status}
                </span>
              </div>

              {/* Driver & Ward */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Designated Driver</span>
                  <span className="font-bold text-slate-900">{v.driverName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Assigned Ward</span>
                  <span className="font-semibold text-slate-800">{v.ward}</span>
                </div>
              </div>

              {/* Fuel Level Progress */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-slate-400" />
                    Diesel Tank Level
                  </span>
                  <span className="font-mono font-bold text-slate-900">{v.fuelLevelPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      v.fuelLevelPercent <= 25 ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${v.fuelLevelPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Metrics Footer */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs font-mono text-slate-600">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">Today Distance</span>
                <span className="font-bold text-slate-900">{v.totalDistanceKm} km</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">Fuel Consumed</span>
                <span className="font-bold text-slate-900">{v.fuelConsumedLiters} Litres</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
