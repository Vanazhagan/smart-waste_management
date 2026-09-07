import React, { useState } from 'react';
import {
  Search,
  Filter,
  UserCheck,
  Eye,
  MapPin,
  Sparkles,
  AlertTriangle,
  ArrowUpDown,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../../services/store';
import { Complaint, PriorityLevel } from '../../types';
import { ComplaintDetailModal } from '../citizen/ComplaintDetailModal';
import { WorkerAssignmentModal } from './WorkerAssignmentModal';
import { WorkerTaskFlowModal } from './WorkerTaskFlowModal';

export const ComplaintsManagement: React.FC = () => {
  const { complaints, areas, language, setActiveView } = useStore();

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [areaFilter, setAreaFilter] = useState('ALL');
  const [wasteTypeFilter, setWasteTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'PRIORITY' | 'DATE'>('PRIORITY');

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);
  const [verifyingComplaint, setVerifyingComplaint] = useState<Complaint | null>(null);

  // Filter & Sort logic
  const filtered = complaints.filter((c) => {
    const matchSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.citizenName.toLowerCase().includes(search.toLowerCase()) ||
      c.location.address.toLowerCase().includes(search.toLowerCase()) ||
      (c.aiAnalysis?.wasteType || '').toLowerCase().includes(search.toLowerCase());

    const matchPriority = priorityFilter === 'ALL' || c.aiAnalysis?.priority === priorityFilter;
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchArea = areaFilter === 'ALL' || c.location.areaId === areaFilter || c.location.ward === areaFilter;
    const matchWasteType = wasteTypeFilter === 'ALL' || c.aiAnalysis?.wasteType === wasteTypeFilter;

    return matchSearch && matchPriority && matchStatus && matchArea && matchWasteType;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'PRIORITY') {
      const priorityOrder: Record<string, number> = { P1: 4, P2: 3, P3: 2, P4: 1 };
      const scoreA = priorityOrder[a.aiAnalysis?.priority || 'P2'] || 0;
      const scoreB = priorityOrder[b.aiAnalysis?.priority || 'P2'] || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const reviewRequiredCount = complaints.filter((c) => c.status === 'AI Review Required').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'நகராட்சி கழிவு புகார்கள் மேலாண்மை' : 'Municipal Waste Complaints Management'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'முழுமையான புகார் பட்டியல், AI வகைப்பாடு, பணியாளர் நியமனம் மற்றும் சரிபார்ப்பு'
              : 'End-to-end complaint records, AI classification, intelligent worker assignment, and verification'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveView('garbageMap')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto transition shadow-sm"
        >
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>Open in GIS Map</span>
        </button>
      </div>

      {/* AI Review Required Alert Banner */}
      {reviewRequiredCount > 0 && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong className="font-bold">{reviewRequiredCount} complaints</strong> require administrative review before field assignment.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('AI Review Required')}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0 transition"
          >
            View Review Queue
          </button>
        </div>
      )}

      {/* Control Bar: Search, Multi-Filter, Sorting */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, Citizen, Street or Waste..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setSortBy(sortBy === 'PRIORITY' ? 'DATE' : 'PRIORITY')}
              className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort: {sortBy === 'PRIORITY' ? 'Priority (P1 First)' : 'Date (Newest)'}</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="P1">P1 Critical</option>
              <option value="P2">P2 High</option>
              <option value="P3">P3 Medium</option>
              <option value="P4">P4 Low</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="AI Analysed">AI Analysed</option>
              <option value="AI Review Required">AI Review Required</option>
              <option value="Assigned">Assigned</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ward / Area</label>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none"
            >
              <option value="ALL">All Wards</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.wardNumber} - {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Waste Type</label>
            <select
              value={wasteTypeFilter}
              onChange={(e) => setWasteTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="Mixed Waste">Mixed Waste</option>
              <option value="Plastic">Plastic</option>
              <option value="Organic / Wet Waste">Organic / Wet Waste</option>
              <option value="Hazardous">Hazardous</option>
              <option value="Paper">Paper</option>
              <option value="Construction Waste">Construction Waste</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="px-4 py-3">Complaint ID</th>
                <th className="px-4 py-3">Citizen</th>
                <th className="px-4 py-3">Photo & Waste Type</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Location & Ward</th>
                <th className="px-4 py-3">Reported Time</th>
                <th className="px-4 py-3">Assigned Worker</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sorted.map((c) => {
                const isP1 = c.aiAnalysis?.priority === 'P1';
                return (
                  <tr
                    key={c.id}
                    className={`transition hover:bg-slate-50 ${
                      isP1 && c.status !== 'Resolved' ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{c.id}</td>

                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900 block">{c.citizenName}</span>
                      <span className="text-[10px] text-slate-400">{c.citizenPhone}</span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={c.photoUrl}
                          alt="Thumbnail"
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 block">{c.aiAnalysis?.wasteType}</span>
                            {c.adminOverride && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded border border-blue-200">
                                Overridden
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                            <span>Vol: {c.aiAnalysis?.quantity}</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-bold">{c.aiAnalysis?.confidenceScore || 85}% AI</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.aiAnalysis?.severity === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : c.aiAnalysis?.severity === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {c.aiAnalysis?.severity}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-black uppercase ${
                          isP1
                            ? 'bg-rose-600 text-white shadow-sm'
                            : c.aiAnalysis?.priority === 'P2'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        {c.aiAnalysis?.priority || 'P2'}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 line-clamp-1">{c.location.address}</p>
                      <span className="text-[10px] text-slate-400 font-semibold">{c.location.ward}</span>
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      <span className="block text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {c.assignedWorkerName ? (
                        <div>
                          <span className="font-semibold text-slate-900 block">{c.assignedWorkerName}</span>
                          <button
                            type="button"
                            onClick={() => setAssigningComplaint(c)}
                            className="text-[10px] text-blue-600 hover:underline"
                          >
                            Reassign
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAssigningComplaint(c)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px] shadow-sm"
                        >
                          Assign Worker
                        </button>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'Cleaning'
                            ? 'bg-blue-100 text-blue-800'
                            : c.status === 'AI Review Required'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {c.status === 'AI Review Required' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        <span>{c.status}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedComplaint(c)}
                          title="Review AI Classification & Override"
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>AI Review</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setVerifyingComplaint(c)}
                          title="Run Field Task & AI Verification"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedComplaint(c)}
                          title="View Complaint Details"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ComplaintDetailModal complaint={selectedComplaint} onClose={() => setSelectedComplaint(null)} />
      <WorkerAssignmentModal complaint={assigningComplaint} onClose={() => setAssigningComplaint(null)} />
      <WorkerTaskFlowModal complaint={verifyingComplaint} onClose={() => setVerifyingComplaint(null)} />
    </div>
  );
};
