import React, { useState } from 'react';
import {
  X,
  UserCheck,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Navigation,
} from 'lucide-react';
import { Complaint } from '../../types';
import { useStore } from '../../services/store';
import { AIService } from '../../services/aiService';

interface WorkerAssignmentModalProps {
  complaint: Complaint | null;
  onClose: () => void;
}

export const WorkerAssignmentModal: React.FC<WorkerAssignmentModalProps> = ({ complaint, onClose }) => {
  const { workers, assignWorkerToComplaint, language } = useStore();

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');

  if (!complaint) return null;

  // Run AI Worker Recommendation
  const recommendation = AIService.calculateWorkerRecommendation(
    complaint.location.lat,
    complaint.location.lng,
    workers.map((w) => ({
      id: w.id,
      name: w.name,
      status: w.status,
      currentLat: w.currentLat,
      currentLng: w.currentLng,
      pendingTasks: w.tasks.pending,
      assignedWard: w.assignedWard,
    })),
    complaint.location.ward
  );

  const bestWorker = recommendation.recommendedWorker;
  const currentSelection = selectedWorkerId || bestWorker?.id;

  const handleAssign = () => {
    if (!currentSelection) return;
    assignWorkerToComplaint(complaint.id, currentSelection);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Intelligent Sanitary Worker Dispatch</h2>
              <p className="text-xs text-slate-300">Complaint {complaint.id} • AI Proximity & Workload Matching</p>
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

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Complaint Context Summary */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Incident Location</span>
              <p className="font-semibold text-slate-900 line-clamp-1">{complaint.location.address}</p>
              <span className="text-slate-500">{complaint.location.ward}</span>
            </div>

            <div className="text-right">
              <span
                className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                  complaint.aiAnalysis?.priority === 'P1'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                Priority {complaint.aiAnalysis?.priority || 'P2'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">{complaint.aiAnalysis?.wasteType}</span>
            </div>
          </div>

          {/* System Recommendation Highlight Banner */}
          {bestWorker && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950 to-slate-900 text-white border border-emerald-500/40 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">
                    AI Recommended Dispatch
                  </span>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/40">
                  Optimal Match
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="text-base font-extrabold text-white">{bestWorker.name}</h3>
                  <p className="text-xs text-slate-300">
                    Distance: <strong className="text-emerald-400">{recommendation.distanceKm} km</strong> •
                    Status: <strong className="text-white">{bestWorker.status}</strong> •
                    Workload: <strong className="text-emerald-400">{recommendation.workload}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedWorkerId(bestWorker.id)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition"
                >
                  Select Ravi
                </button>
              </div>

              <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-800">
                "{recommendation.reason}"
              </p>
            </div>
          )}

          {/* Candidate Workers List */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Candidate Workers in Vicinity
            </h4>

            <div className="space-y-2">
              {recommendation.allCandidates.slice(0, 5).map((cand) => {
                const isSelected = currentSelection === cand.worker.id;
                const isTopPick = bestWorker?.id === cand.worker.id;

                return (
                  <div
                    key={cand.worker.id}
                    onClick={() => setSelectedWorkerId(cand.worker.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                        {cand.worker.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{cand.worker.name}</span>
                          {isTopPick && (
                            <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                              Recommended
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-0.5">
                          <span className="flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-slate-400" />
                            {cand.distanceKm} km away
                          </span>
                          <span>•</span>
                          <span>Ward: {cand.worker.assignedWard}</span>
                          <span>•</span>
                          <span>Workload: {cand.workload}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          cand.worker.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {cand.worker.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAssign}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Confirm Worker Assignment & Dispatch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
