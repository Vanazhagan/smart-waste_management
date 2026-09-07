import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Calendar,
  Award,
  Star,
  CheckCircle2,
  Clock,
  IndianRupee,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { Worker } from '../../types';
import { useStore } from '../../services/store';

interface WorkerProfileModalProps {
  worker: Worker | null;
  onClose: () => void;
}

export const WorkerProfileModal: React.FC<WorkerProfileModalProps> = ({ worker, onClose }) => {
  const { approveWorkerBonus, approveSalaryIncrement, complaints } = useStore();

  const [bonusApproved, setBonusApproved] = useState(false);
  const [incrementApproved, setIncrementApproved] = useState(false);

  if (!worker) return null;

  const workerComplaints = complaints.filter((c) => c.assignedWorkerId === worker.id);

  const handleApproveBonus = () => {
    if (worker.bonusRecommendation) {
      approveWorkerBonus(worker.id, worker.bonusRecommendation.recommendedAmount);
      setBonusApproved(true);
    }
  };

  const handleApproveIncrement = () => {
    if (worker.salaryIncrementRecommendation) {
      approveSalaryIncrement(worker.id, worker.salaryIncrementRecommendation.recommendedPercentage);
      setIncrementApproved(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={worker.avatarUrl}
              alt={worker.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-400"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{worker.name}</h2>
                <span className="font-mono text-xs bg-slate-800 text-emerald-400 px-2 py-0.5 rounded">
                  {worker.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    worker.status === 'AVAILABLE'
                      ? 'bg-emerald-500 text-slate-950'
                      : worker.status === 'WORKING'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {worker.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                <span>{worker.phone}</span> • <span>Assigned: {worker.assignedWard}</span>
              </p>
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

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Performance Score</span>
              <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">{worker.performanceScore}/100</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Tier 1 Performer</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance Rate</span>
              <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">{worker.attendance.percentage}%</p>
              <span className="text-[10px] text-slate-500">
                {worker.attendance.workingDays} Days Pres / {worker.attendance.absentDays} Abs
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Citizen Rating</span>
              <p className="text-2xl font-black text-amber-500 font-mono mt-0.5 flex items-center gap-1">
                <Star className="w-5 h-5 fill-current" />
                {worker.ratings.averageRating}
              </p>
              <span className="text-[10px] text-slate-500">{worker.ratings.totalReviews} Citizen Reviews</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Task Completion</span>
              <p className="text-2xl font-black text-emerald-600 font-mono mt-0.5">
                {Math.round((worker.tasks.completed / Math.max(1, worker.tasks.assigned)) * 100)}%
              </p>
              <span className="text-[10px] text-slate-500">
                {worker.tasks.completed} done / {worker.tasks.pending} pending
              </span>
            </div>
          </div>

          {/* Performance Score Mathematical Breakdown (Section 24) */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              Municipal Performance Score Breakdown (Index: {worker.performanceScore}/100)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2 bg-slate-800/80 rounded-lg">
                <span className="text-slate-400 text-[10px] block">Attendance (25%)</span>
                <span className="font-bold text-slate-100">
                  {worker.attendance.percentage}% ({(worker.attendance.percentage * 0.25).toFixed(1)} pts)
                </span>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-lg">
                <span className="text-slate-400 text-[10px] block">Task Completion (25%)</span>
                <span className="font-bold text-slate-100">
                  {Math.round((worker.tasks.completed / Math.max(1, worker.tasks.assigned)) * 100)}% (24.0 pts)
                </span>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-lg">
                <span className="text-slate-400 text-[10px] block">AI Optical Verification (20%)</span>
                <span className="font-bold text-emerald-400">{worker.aiVerificationRate}% (19.6 pts)</span>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-lg">
                <span className="text-slate-400 text-[10px] block">Citizen Satisfaction (15%)</span>
                <span className="font-bold text-amber-400">{worker.ratings.averageRating}/5.0 (14.4 pts)</span>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-lg">
                <span className="text-slate-400 text-[10px] block">Ward Improvement (15%)</span>
                <span className="font-bold text-slate-100">Strong (-38% complaints)</span>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-lg">
                <span className="text-slate-400 text-[10px] block">Avg Response Time</span>
                <span className="font-bold text-slate-100">{worker.tasks.avgCompletionTimeHours} hours</span>
              </div>
            </div>
          </div>

          {/* Bonus & Salary Increment Recommendation Cards (Section 25 & 26) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bonus Recommendation */}
            {worker.bonusRecommendation && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider font-mono">
                      Monthly Bonus Recommendation
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        bonusApproved || worker.bonusRecommendation.status === 'Approved'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-200 text-amber-900'
                      }`}
                    >
                      {bonusApproved || worker.bonusRecommendation.status === 'Approved' ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-amber-600 font-mono mt-1">
                    ₹{worker.bonusRecommendation.recommendedAmount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    {worker.bonusRecommendation.reason}
                  </p>
                </div>

                {!bonusApproved && worker.bonusRecommendation.status !== 'Approved' && (
                  <button
                    type="button"
                    onClick={handleApproveBonus}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition"
                  >
                    Approve Bonus (Admin Action)
                  </button>
                )}
              </div>
            )}

            {/* Salary Increment Recommendation */}
            {worker.salaryIncrementRecommendation && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider font-mono">
                      Annual Salary Increment
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        incrementApproved || worker.salaryIncrementRecommendation.status === 'Approved'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-200 text-blue-900'
                      }`}
                    >
                      {incrementApproved || worker.salaryIncrementRecommendation.status === 'Approved'
                        ? 'Approved'
                        : 'Pending Approval'}
                    </span>
                  </div>

                  <p className="text-xl font-black text-blue-700 font-mono mt-1">
                    +{worker.salaryIncrementRecommendation.recommendedPercentage}% Increment
                  </p>
                  <p className="text-xs text-slate-600">
                    Current: ₹{worker.salary.toLocaleString('en-IN')} → Projected:{' '}
                    <strong className="text-blue-900">
                      ₹{worker.salaryIncrementRecommendation.projectedSalary.toLocaleString('en-IN')}
                    </strong>
                  </p>
                  <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                    {worker.salaryIncrementRecommendation.reason}
                  </p>
                </div>

                {!incrementApproved && worker.salaryIncrementRecommendation.status !== 'Approved' && (
                  <button
                    type="button"
                    onClick={handleApproveIncrement}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition"
                  >
                    Approve Increment (Admin Action)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Assigned Tasks History */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Recent Assigned Tasks & Resolution Record
            </h4>
            <div className="space-y-2">
              {workerComplaints.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-900">{c.id}</span>
                    <p className="text-slate-600 line-clamp-1">{c.location.address}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
