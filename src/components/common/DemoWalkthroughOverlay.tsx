import React from 'react';
import {
  Sparkles,
  Play,
  X,
  CheckCircle2,
  ArrowRight,
  Clock,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useStore } from '../../services/store';

export const DemoWalkthroughOverlay: React.FC = () => {
  const { isDemoRunning, demoStep, demoStepDescription, runEndToEndDemo } = useStore();

  if (!isDemoRunning) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border-2 border-emerald-500 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                Interactive Guided Tour
              </span>
              <h4 className="text-sm font-bold text-white">
                Step {demoStep} of 8: Lifecycle Walkthrough
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping mr-1" />
          </div>
        </div>

        {/* Current Step Description */}
        <div className="space-y-2">
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {demoStepDescription}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${(demoStep / 8) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Complaint Ingestion</span>
            <span>AI Verification</span>
            <span>Performance Bonus</span>
          </div>
        </div>
      </div>
    </div>
  );
};
