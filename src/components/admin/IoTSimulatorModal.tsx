import React, { useState } from 'react';
import {
  X,
  Radio,
  Sliders,
  Sparkles,
  RefreshCw,
  Battery,
  AlertTriangle,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { SmartBin } from '../../types';
import { useStore } from '../../services/store';

interface IoTSimulatorModalProps {
  bin: SmartBin | null;
  onClose: () => void;
}

export const IoTSimulatorModal: React.FC<IoTSimulatorModalProps> = ({ bin, onClose }) => {
  const { simulateBinSensorUpdate, simulateAllBinsCycle } = useStore();

  const [fillLevel, setFillLevel] = useState<number>(bin?.fillPercentage || 85);
  const [batteryLevel, setBatteryLevel] = useState<number>(bin?.batteryLevel || 90);

  if (!bin) return null;

  const handleApply = () => {
    simulateBinSensorUpdate(bin.id, fillLevel, batteryLevel);
    onClose();
  };

  const handleTriggerOverflow = () => {
    setFillLevel(98);
    simulateBinSensorUpdate(bin.id, 98, batteryLevel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">IoT Sensor Telemetry Simulator</h2>
              <p className="text-[11px] text-slate-300 font-mono">ESP32 & Ultrasonic HC-SR04 • {bin.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Installation Site</span>
            <p className="font-semibold text-slate-800">{bin.location.address}</p>
            <span className="text-slate-500">{bin.ward}</span>
          </div>

          {/* Fill Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-700">Ultrasonic Bin Fill Level</label>
              <span
                className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                  fillLevel >= 95
                    ? 'bg-rose-100 text-rose-700'
                    : fillLevel >= 85
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {fillLevel}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={fillLevel}
              onChange={(e) => setFillLevel(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% Empty</span>
              <span>70% Normal</span>
              <span>85% Warning</span>
              <span>95% Critical</span>
            </div>
          </div>

          {/* Battery Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-700">Battery Level (Solar + Li-ion)</label>
              <span className="font-mono font-bold text-sm text-slate-700">{batteryLevel}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={batteryLevel}
              onChange={(e) => setBatteryLevel(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Quick Simulation Presets */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Simulation Shortcuts</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setFillLevel(25);
                  setBatteryLevel(98);
                }}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-left"
              >
                Reset to Emptied (25%)
              </button>
              <button
                type="button"
                onClick={handleTriggerOverflow}
                className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-medium text-left flex items-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                Simulate Overflow (98%)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow-sm"
          >
            Apply Sensor Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
