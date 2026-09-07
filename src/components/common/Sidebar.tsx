import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  MapPin,
  Trash2,
  Users,
  UserCheck,
  Navigation,
  Radio,
  Flame,
  Building2,
  BarChart3,
  Award,
  Truck,
  IndianRupee,
  BrainCircuit,
  TrendingUp,
  FileCheck,
  Leaf,
  Bell,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../../services/store';
import { translations } from '../../translations';

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const { role, activeView, setActiveView, language, complaints, smartBins, hotspots, notifications } = useStore();
  const t = translations[language];

  const pendingComplaintsCount = complaints.filter((c) => c.status !== 'Resolved').length;
  const criticalComplaintsCount = complaints.filter((c) => c.aiAnalysis?.priority === 'P1' && c.status !== 'Resolved').length;
  const criticalBinsCount = smartBins.filter((b) => b.status === 'CRITICAL' || b.fillPercentage >= 90).length;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const citizenNav = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'raiseComplaint', label: t.raiseComplaint, icon: PlusCircle, highlight: true },
    { id: 'myComplaints', label: t.myComplaints, icon: FileText, badge: pendingComplaintsCount },
    { id: 'garbageMap', label: t.garbageMap, icon: MapPin },
    { id: 'nearbyBins', label: t.nearbyBins, icon: Trash2 },
    { id: 'notifications', label: t.notifications, icon: Bell, badge: unreadNotifsCount },
    { id: 'feedback', label: language === 'ta' ? 'கருத்துக்கள்' : 'Citizen Feedback', icon: MessageSquare },
  ];

  const adminNav = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    {
      id: 'complaints',
      label: language === 'ta' ? 'புகார்கள் மேலாண்மை' : 'Complaints',
      icon: FileText,
      badge: criticalComplaintsCount ? `${criticalComplaintsCount} P1` : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'workers', label: t.workers, icon: Users },
    { id: 'workerAssignment', label: t.workerAssignment, icon: UserCheck },
    { id: 'routeOptimization', label: t.routeOptimization, icon: Navigation },
    {
      id: 'smartDustbins',
      label: t.smartDustbins,
      icon: Radio,
      badge: criticalBinsCount ? `${criticalBinsCount} Alert` : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'garbageMap', label: t.garbageMap, icon: MapPin },
    { id: 'hotspots', label: t.hotspots, icon: Flame, badge: hotspots.length },
    { id: 'areasWards', label: t.areasWards, icon: Building2 },
    { id: 'monthlyAnalytics', label: t.monthlyAnalytics, icon: BarChart3 },
    { id: 'salaryBonus', label: t.salaryBonus, icon: Award },
    { id: 'vehicles', label: t.vehicles, icon: Truck },
    { id: 'expenses', label: t.expenses, icon: IndianRupee },
    { id: 'aiInsights', label: t.aiInsights, icon: BrainCircuit, pulse: true },
    { id: 'predictiveAnalytics', label: t.predictiveAnalytics, icon: TrendingUp },
    { id: 'monthlyReports', label: t.monthlyReports, icon: FileCheck },
    { id: 'environmentalImpact', label: t.environmentalImpact, icon: Leaf },
  ];

  const navItems = role === 'CITIZEN' ? citizenNav : adminNav;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Role Indicator Card */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {language === 'ta' ? 'தற்போதைய அணுகல்' : 'Current Portal'}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-emerald-400 border border-slate-700">
            {role === 'ADMIN' ? (language === 'ta' ? 'நிர்வாக முறை' : 'Admin Mode') : language === 'ta' ? 'குடிமக்கள் முறை' : 'Citizen Mode'}
          </span>
        </div>
        <p className="text-xs text-slate-200 font-semibold mt-1 truncate">
          {role === 'ADMIN' ? 'Chennai & TN Municipal Corp' : 'M. Senthil Nathan (Ward 08)'}
        </p>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveView(item.id);
                if (onItemClick) onItemClick();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition group ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-600/30'
                  : item.highlight
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition ${
                    isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.pulse && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" title="Live AI Insights Active" />
                )}
                <ChevronRight
                  className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition ${
                    isActive ? 'opacity-100 text-white' : 'text-slate-500'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Municipal Vision Banner */}
      <div className="p-3 m-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
        <p className="font-semibold text-slate-300 flex items-center gap-1.5">
          <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'ta' ? 'முன்கணிப்பு பார்வை' : 'Proactive Waste Ops'}</span>
        </p>
        <p className="mt-1 text-[10px] text-slate-400 leading-tight">
          {language === 'ta'
            ? 'குப்பை நிரம்பும் முன்பே கண்டறிந்து தானாக தீர்க்கும் நகராட்சி சுற்றுச்சூழல்.'
            : 'Detect, predict, and resolve municipal waste before public overflow.'}
        </p>
      </div>
    </aside>
  );
};
