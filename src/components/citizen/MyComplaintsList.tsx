import React, { useState } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  MapPin,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../../services/store';
import { Complaint, ComplaintStatus, PriorityLevel } from '../../types';
import { ComplaintDetailModal } from './ComplaintDetailModal';
import { RaiseComplaintModal } from './RaiseComplaintModal';

export const MyComplaintsList: React.FC = () => {
  const { complaints, language } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.aiAnalysis?.wasteType || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.aiAnalysis?.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'எனது கழிவு புகார்கள்' : 'My Complaints & Ticket Tracking'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'பதிவு செய்யப்பட்ட புகார்களின் தற்போதைய தீர்வு நிலை மற்றும் AI சரிபார்ப்பு'
              : 'Real-time lifecycle tracking, sanitary dispatch, and AI proof verification'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRaiseModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'ta' ? 'புதிய புகார்' : 'Raise New Complaint'}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, Street, Ward, or Waste Type..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="AI Analysed">AI Analysed</option>
            <option value="Assigned">Assigned</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="P1">P1 Critical</option>
            <option value="P2">P2 High</option>
            <option value="P3">P3 Medium</option>
            <option value="P4">P4 Low</option>
          </select>
        </div>
      </div>

      {/* Complaints Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No complaints matching your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or filter selection, or submit a new complaint.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedComplaint(c)}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer flex flex-col group"
            >
              {/* Image & Priority badge */}
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img
                  src={c.photoUrl}
                  alt="Complaint evidence"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase shadow-sm ${
                      c.aiAnalysis?.priority === 'P1'
                        ? 'bg-rose-600 text-white'
                        : c.aiAnalysis?.priority === 'P2'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-900/90 text-white'
                    }`}
                  >
                    Priority {c.aiAnalysis?.priority || 'P2'}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold shadow-sm ${
                      c.status === 'Resolved'
                        ? 'bg-emerald-600 text-white'
                        : c.status === 'Cleaning'
                        ? 'bg-blue-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                {c.aiVerification?.verified && (
                  <div className="absolute bottom-2 right-2 bg-emerald-950/80 backdrop-blur-sm text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>AI Optical Verified</span>
                  </div>
                )}
              </div>

              {/* Details Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-900">{c.id}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 mt-1 line-clamp-1">
                    {c.aiAnalysis?.wasteType || 'Waste Accumulation'}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>

                  <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{c.location.address}</span>
                  </div>
                </div>

                {/* Footer Worker & Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {c.assignedWorkerName ? (
                    <span className="text-slate-600 font-medium">Worker: {c.assignedWorkerName}</span>
                  ) : (
                    <span className="text-amber-600 font-medium">Awaiting Dispatch</span>
                  )}

                  <span className="font-bold text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1">
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ComplaintDetailModal complaint={selectedComplaint} onClose={() => setSelectedComplaint(null)} />
      <RaiseComplaintModal isOpen={isRaiseModalOpen} onClose={() => setIsRaiseModalOpen(false)} />
    </div>
  );
};
