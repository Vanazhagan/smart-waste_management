import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  Users,
  IndianRupee,
  Sparkles,
  TrendingUp,
  MapPin,
  FileText,
  Navigation,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ChevronRight,
  Truck,
  BrainCircuit,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useStore } from '../../services/store';
import { translations } from '../../translations';
import { Complaint } from '../../types';
import { ComplaintDetailModal } from '../citizen/ComplaintDetailModal';
import { WorkerAssignmentModal } from './WorkerAssignmentModal';

const WASTE_TYPE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export const AdminDashboard: React.FC = () => {
  const {
    complaints,
    workers,
    smartBins,
    hotspots,
    areas,
    cleaningExpenses,
    vehicleExpenses,
    language,
    setActiveView,
    runEndToEndDemo,
    isDemoRunning,
  } = useStore();

  const t = translations[language];

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);

  // KPIs
  const totalComplaints = complaints.length;
  const criticalComplaints = complaints.filter(
    (c) => c.aiAnalysis?.priority === 'P1' && c.status !== 'Resolved'
  ).length;
  const pendingComplaints = complaints.filter((c) => c.status !== 'Resolved').length;
  const resolvedToday = complaints.filter((c) => c.status === 'Resolved').length;
  const activeWorkers = workers.filter((w) => w.status !== 'OFFLINE').length;
  const totalSmartBins = smartBins.length;
  const criticalBins = smartBins.filter((b) => b.status === 'CRITICAL' || b.fillPercentage >= 95).length;

  const currentMonthExpense =
    (cleaningExpenses[0]?.total || 590000) + (vehicleExpenses[0]?.total || 55000);

  // Chart 1: Monthly Complaint Trend (August 850 vs September 680)
  const complaintTrendData = [
    { month: 'June', complaints: 920, resolved: 880 },
    { month: 'July', complaints: 890, resolved: 860 },
    { month: 'August', complaints: 850, resolved: 830 },
    { month: 'September (Current)', complaints: 680, resolved: 650 },
  ];

  // Chart 2: Area Wise Complaints Comparison (Current vs Previous)
  const areaComparisonData = areas.slice(0, 5).map((a) => ({
    name: a.name.split(' ')[0],
    previous: a.previousMonthComplaints,
    current: a.currentMonthComplaints,
    pctChange: a.percentageChange,
  }));

  // Chart 3: Waste Type Distribution
  const wasteTypeCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    const type = c.aiAnalysis?.wasteType || 'Mixed Waste';
    wasteTypeCounts[type] = (wasteTypeCounts[type] || 0) + 1;
  });
  const wasteTypeData = Object.entries(wasteTypeCounts).map(([name, value]) => ({ name, value }));

  // Chart 4: Smart Bin Status Distribution
  const binStatusData = [
    { name: 'Normal (<70%)', count: smartBins.filter((b) => b.status === 'NORMAL').length, color: '#10b981' },
    { name: 'Warning (70-85%)', count: smartBins.filter((b) => b.status === 'WARNING').length, color: '#facc15' },
    { name: 'Collection Req (85-95%)', count: smartBins.filter((b) => b.status === 'COLLECTION_REQUIRED').length, color: '#f97316' },
    { name: 'Critical (>95%)', count: smartBins.filter((b) => b.status === 'CRITICAL' || b.status === 'OVERFLOW').length, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Bar & Proactive Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 sm:p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              Municipal Operations Command Center
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            {language === 'ta' ? 'தமிழ்நாடு நகராட்சி நிர்வாக கட்டுப்பாட்டு மையம்' : 'Tamil Nadu Municipal Operations Dashboard'}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            {t.reactiveToProactive}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => runEndToEndDemo()}
            disabled={isDemoRunning}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{isDemoRunning ? 'Running Demo...' : 'Run 8-Step Demo Tour'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('monthlyReports')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition"
          >
            <FileText className="w-4 h-4 inline mr-1 text-slate-400" />
            <span>Official Report</span>
          </button>
        </div>
      </div>

      {/* 8 Primary KPI Metric Cards matching Section 8 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Complaints */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Complaints</span>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">{totalComplaints}</p>
          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
            <ArrowDownRight className="w-3 h-3" /> -20% MoM
          </span>
        </div>

        {/* Critical Complaints */}
        <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Critical (P1)</span>
          <p className="text-xl font-black text-rose-600 mt-1 font-mono">{criticalComplaints}</p>
          <span className="text-[10px] text-rose-700 font-medium font-mono">Immediate Action</span>
        </div>

        {/* Pending Complaints */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Tasks</span>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">{pendingComplaints}</p>
          <span className="text-[10px] text-amber-600 font-medium">Under routing</span>
        </div>

        {/* Resolved Today */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resolved Today</span>
          <p className="text-xl font-black text-emerald-600 mt-1 font-mono">{resolvedToday}</p>
          <span className="text-[10px] text-slate-500 font-medium">96% AI Verified</span>
        </div>

        {/* Active Workers */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Workers</span>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">{activeWorkers}/{workers.length}</p>
          <span className="text-[10px] text-emerald-600 font-medium">96.8% Attendance</span>
        </div>

        {/* Smart Bins */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">IoT Smart Bins</span>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">{totalSmartBins}</p>
          <span className="text-[10px] text-slate-500 font-medium">ESP32 Online</span>
        </div>

        {/* Critical Bins */}
        <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Critical Bins</span>
          <p className="text-xl font-black text-amber-600 mt-1 font-mono">{criticalBins}</p>
          <span className="text-[10px] text-amber-700 font-medium">&gt;90% Fill</span>
        </div>

        {/* Current Month Expense */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Month Expense</span>
          <p className="text-sm font-black text-slate-900 mt-1 font-mono truncate">₹11.17L</p>
          <span className="text-[10px] text-slate-500 font-medium">Ops & Vehicles</span>
        </div>
      </div>

      {/* Real-time Alerts Ticker */}
      <div className="p-3 rounded-xl bg-slate-900 text-white text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold uppercase tracking-wider text-[10px] border border-rose-500/30 flex items-center gap-1 font-mono">
            <Flame className="w-3 h-3 text-rose-400" />
            Live Municipal Alert
          </span>
          <p className="text-slate-200 font-medium truncate">
            BIN-1042 (T. Nagar Main Road) is at 94% fill. Predicted overflow in 1.2 hours. System recommended worker Ravi Chandran.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveView('smartDustbins')}
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline"
          >
            Dispatch Collection
          </button>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Complaint Trend Chart (August: 850 vs September: 680 -20% Decrease) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Monthly Complaint Reduction Trend (-20%)
              </h2>
              <p className="text-xs text-slate-500">August: 850 registered → September: 680 registered (-170 reduction)</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              -20.0% MoM
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complaintTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="complaints" name="Complaints Logged" fill="#0f766e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved & AI Verified" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Area Performance Comparison (Highlighting Area 2 +59% surge) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                Ward / Area Complaint Comparison
              </h2>
              <p className="text-xs text-slate-500">Area 2 (T. Nagar) surged +59.4% requiring immediate intervention</p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Area 2 Critical
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="previous" name="August (Prev Month)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="current" name="September (Current Month)" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Waste Type Composition */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Waste Classification Breakdown</h2>
              <p className="text-xs text-slate-500">Categorized automatically via Computer Vision analysis</p>
            </div>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wasteTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {wasteTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={WASTE_TYPE_COLORS[index % WASTE_TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-100">
            {wasteTypeData.slice(0, 6).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: WASTE_TYPE_COLORS[idx % WASTE_TYPE_COLORS.length] }}
                />
                <span className="text-slate-600 truncate font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: IoT Smart Dustbins Live Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Smart Dustbin Sensor Status</h2>
              <p className="text-xs text-slate-500">Ultrasonic sensor fill level status across wards</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('smartDustbins')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              Manage Bins
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {binStatusData.map((st, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span>{st.name}</span>
                  <span className="font-mono font-bold">
                    {st.count} bins ({Math.round((st.count / totalSmartBins) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(st.count / totalSmartBins) * 100}%`,
                      backgroundColor: st.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <span>2 bins reached critical collection threshold</span>
            <button
              type="button"
              onClick={() => setActiveView('routeOptimization')}
              className="font-bold underline text-amber-800 hover:text-amber-950"
            >
              Optimize Pickup Route
            </button>
          </div>
        </div>
      </div>

      {/* Critical Complaints Immediate Action Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Critical Priority Complaints (P1)
            </h2>
            <p className="text-xs text-slate-500">
              High-severity commercial & biomedical waste requiring immediate sanitary dispatch
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('complaints')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All Complaints</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="px-4 py-3">Complaint ID</th>
                <th className="px-4 py-3">Photo & Waste Type</th>
                <th className="px-4 py-3">Location & Ward</th>
                <th className="px-4 py-3">Severity & Impact</th>
                <th className="px-4 py-3">Assigned Worker</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {complaints
                .filter((c) => c.aiAnalysis?.priority === 'P1')
                .slice(0, 5)
                .map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{c.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={c.photoUrl}
                          alt="Thumbnail"
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{c.aiAnalysis?.wasteType}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Vol: {c.aiAnalysis?.quantity}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 line-clamp-1">{c.location.address}</p>
                      <span className="text-[10px] text-slate-400 font-semibold">{c.location.ward}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        {c.aiAnalysis?.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.assignedWorkerName ? (
                        <span className="font-semibold text-slate-900">{c.assignedWorkerName}</span>
                      ) : (
                        <span className="text-amber-600 font-bold">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'Cleaning'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!c.assignedWorkerId && (
                          <button
                            type="button"
                            onClick={() => setAssigningComplaint(c)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[11px] shadow-sm transition"
                          >
                            Assign Worker
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedComplaint(c)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] transition"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ComplaintDetailModal complaint={selectedComplaint} onClose={() => setSelectedComplaint(null)} />
      <WorkerAssignmentModal complaint={assigningComplaint} onClose={() => setAssigningComplaint(null)} />
    </div>
  );
};
