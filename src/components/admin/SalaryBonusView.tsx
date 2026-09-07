import React, { useState } from 'react';
import {
  IndianRupee,
  Award,
  CheckCircle2,
  TrendingUp,
  Clock,
  Printer,
  FileText,
  User,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { useStore } from '../../services/store';
import { Worker } from '../../types';

export const SalaryBonusView: React.FC = () => {
  const { workers, approveWorkerBonus, approveSalaryIncrement, language } = useStore();

  const [selectedWorkerForPaySlip, setSelectedWorkerForPaySlip] = useState<Worker | null>(null);

  const handleApproveAllEligible = () => {
    workers.forEach((w) => {
      if (w.bonusRecommendation && w.bonusRecommendation.status === 'Pending') {
        approveWorkerBonus(w.id, w.bonusRecommendation.recommendedAmount);
      }
      if (w.salaryIncrementRecommendation && w.salaryIncrementRecommendation.status === 'Pending') {
        approveSalaryIncrement(w.id, w.salaryIncrementRecommendation.recommendedPercentage);
      }
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'பணியாளர் ஊதியம் & ஊக்கத்தொகை இயந்திரம்' : 'Worker Payroll, Performance Bonus & Increments'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'செயல்திறன் குறியீடு அடிப்படையில் தானியங்கி போனஸ் கணக்கீடு மற்றும் ஊதிய உயர்வு'
              : 'Automated performance-tiered bonus calculation, annual increments, and printable pay slip generation'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleApproveAllEligible}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto transition shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Approve All Eligible Bonuses & Increments</span>
        </button>
      </div>

      {/* Bonus & Increment Tier Rules Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tiered Bonus Rules */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              Monthly Performance Bonus Tiers
            </h2>
            <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded">
              Requires &gt;90% Attendance
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200">
              <span className="text-[10px] text-amber-800 font-bold block">Score 95–100</span>
              <span className="text-base font-black text-amber-700 font-mono">₹3,000</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-600 font-bold block">Score 90–94</span>
              <span className="text-base font-black text-slate-800 font-mono">₹2,000</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-600 font-bold block">Score 85–89</span>
              <span className="text-base font-black text-slate-800 font-mono">₹1,000</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Score &lt;85</span>
              <span className="text-base font-black text-slate-400 font-mono">₹0</span>
            </div>
          </div>
        </div>

        {/* Increment Rules */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Annual Salary Increment Tiers
            </h2>
            <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded">
              Yearly Assessment
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200">
              <span className="text-[10px] text-blue-800 font-bold block">Score &gt;90</span>
              <span className="text-base font-black text-blue-700 font-mono">+10%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-600 font-bold block">Score 80–89</span>
              <span className="text-base font-black text-slate-800 font-mono">+7%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-600 font-bold block">Score 70–79</span>
              <span className="text-base font-black text-slate-800 font-mono">+5%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Score &lt;70</span>
              <span className="text-base font-black text-slate-400 font-mono">0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workers Payroll Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="px-4 py-3">Worker Name & ID</th>
                <th className="px-4 py-3">Ward</th>
                <th className="px-4 py-3 text-center">Score</th>
                <th className="px-4 py-3 text-center">Attendance</th>
                <th className="px-4 py-3 text-right">Base Salary</th>
                <th className="px-4 py-3 text-right">Recommended Bonus</th>
                <th className="px-4 py-3 text-center">Increment Rec.</th>
                <th className="px-4 py-3 text-right">Net Payable</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {workers.map((w) => {
                const bonus = w.bonusRecommendation?.recommendedAmount || 0;
                const net = w.salary + (w.bonusRecommendation?.status === 'Approved' ? bonus : 0);

                return (
                  <tr key={w.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img src={w.avatarUrl} alt={w.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <span className="font-bold text-slate-900 block">{w.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{w.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-600">{w.assignedWard}</td>

                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-100 text-slate-800">
                        {w.performanceScore}/100
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center font-mono font-semibold text-slate-600">
                      {w.attendance.percentage}%
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      ₹{w.salary.toLocaleString('en-IN')}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {w.bonusRecommendation ? (
                        <div>
                          <span className="font-mono font-bold text-amber-600">
                            +₹{w.bonusRecommendation.recommendedAmount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[9px] text-slate-400 block font-semibold">
                            {w.bonusRecommendation.status}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">N/A</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {w.salaryIncrementRecommendation ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 font-mono">
                          +{w.salaryIncrementRecommendation.recommendedPercentage}%
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">0%</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-extrabold text-emerald-700 text-sm">
                      ₹{net.toLocaleString('en-IN')}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedWorkerForPaySlip(w)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-[11px] transition"
                      >
                        Pay Slip
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Slip Modal View */}
      {selectedWorkerForPaySlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Municipal Corporation</span>
                <h3 className="font-bold text-slate-900 text-base">Sanitary Worker Monthly Pay Slip</h3>
                <p className="text-xs text-slate-500">Period: September 2026</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWorkerForPaySlip(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee Name:</span>
                <span className="font-bold text-slate-900">{selectedWorkerForPaySlip.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Employee ID:</span>
                <span className="font-mono text-slate-900">{selectedWorkerForPaySlip.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Ward:</span>
                <span className="font-semibold text-slate-900">{selectedWorkerForPaySlip.assignedWard}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Performance Index:</span>
                <span className="font-bold text-emerald-700">{selectedWorkerForPaySlip.performanceScore}/100</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Base Salary:</span>
                <span className="font-mono font-semibold">₹{selectedWorkerForPaySlip.salary.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>Performance Bonus:</span>
                <span className="font-mono font-semibold">
                  +₹{(selectedWorkerForPaySlip.bonusRecommendation?.recommendedAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>EPF & ESI Deductions:</span>
                <span className="font-mono">-₹1,450</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Net Credited Amount:</span>
                <span className="font-mono text-emerald-700">
                  ₹{((selectedWorkerForPaySlip.salary + (selectedWorkerForPaySlip.bonusRecommendation?.recommendedAmount || 0)) - 1450).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Pay Slip Receipt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
