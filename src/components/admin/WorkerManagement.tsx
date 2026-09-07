import React, { useState } from 'react';
import {
  Search,
  Filter,
  User,
  Star,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  IndianRupee,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../../services/store';
import { Worker } from '../../types';
import { WorkerProfileModal } from './WorkerProfileModal';

export const WorkerManagement: React.FC = () => {
  const { workers, language } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const filtered = workers.filter((w) => {
    const matchSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.id.toLowerCase().includes(search.toLowerCase()) ||
      w.assignedWard.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'தூய்மைப் பணியாளர்கள் மேலாண்மை' : 'Sanitary Worker Management & Performance'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'பணியாளர் செயல்திறன் குறியீடு, வருகை, சம்பளம், ஊக்கத்தொகை மற்றும் பணிகள்'
              : 'Field workforce attendance, automated performance ranking, salary, and performance bonus approvals'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
            {workers.filter((w) => w.status !== 'OFFLINE').length} of {workers.length} On Duty
          </span>
        </div>
      </div>

      {/* Top Performer Spotlight Card (Section 24) */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={workers[0]?.avatarUrl}
              alt={workers[0]?.name}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-emerald-500 shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow">
              ★
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-slate-950 uppercase">
                Ward Top Performer of the Month
              </span>
            </div>
            <h2 className="text-base font-extrabold text-white mt-1">{workers[0]?.name} (Ward 12, Anna Nagar)</h2>
            <p className="text-xs text-slate-300">
              Score: <strong className="text-emerald-400">{workers[0]?.performanceScore}/100</strong> • 
              Cleanliness Verification Rate: <strong className="text-white">{workers[0]?.aiVerificationRate}%</strong> • 
              Citizen Rating: <strong className="text-amber-400">4.9/5.0</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSelectedWorker(workers[0])}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
        >
          Review Bonus & Incentive
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search worker by name, ID or ward..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none"
          >
            <option value="ALL">All Duty Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="WORKING">On Active Cleaning</option>
            <option value="OFFLINE">Offline / Leave</option>
          </select>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((w) => (
          <div
            key={w.id}
            onClick={() => setSelectedWorker(w)}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            {/* Top Row: Avatar + Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={w.avatarUrl}
                  alt={w.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 group-hover:scale-105 transition"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition">
                      {w.name}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block">{w.id}</span>
                  <span className="text-xs text-slate-500 font-medium">{w.assignedWard}</span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  w.status === 'AVAILABLE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : w.status === 'WORKING'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {w.status}
              </span>
            </div>

            {/* Performance Stats Mini Grid */}
            <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">SCORE</span>
                <span className="font-mono font-bold text-slate-900">{w.performanceScore}/100</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">TASKS</span>
                <span className="font-mono font-bold text-emerald-600">{w.tasks.completed} done</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">RATING</span>
                <span className="font-mono font-bold text-amber-500 flex items-center justify-center gap-0.5">
                  <Star className="w-3 h-3 fill-current" /> {w.ratings.averageRating}
                </span>
              </div>
            </div>

            {/* Footer Row: Salary + View Action */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Monthly Salary</span>
                <span className="font-mono font-bold text-slate-800">₹{w.salary.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center gap-1 font-bold text-emerald-600 group-hover:text-emerald-700">
                <span>View Full Profile</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Modal */}
      <WorkerProfileModal worker={selectedWorker} onClose={() => setSelectedWorker(null)} />
    </div>
  );
};
