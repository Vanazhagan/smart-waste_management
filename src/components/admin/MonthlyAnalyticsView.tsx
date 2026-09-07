import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  IndianRupee,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  FileDown,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useStore } from '../../services/store';

export const MonthlyAnalyticsView: React.FC = () => {
  const { language, setActiveView } = useStore();

  const comparisonData = [
    {
      metric: 'Total Complaints Logged',
      august: '850',
      september: '680',
      change: '-20.0%',
      type: 'positive',
      icon: TrendingDown,
      note: 'Proactive collection prevented street pileups',
    },
    {
      metric: 'Avg Resolution Time',
      august: '4.2 hrs',
      september: '2.8 hrs',
      change: '-33.3%',
      type: 'positive',
      icon: Clock,
      note: 'Intelligent worker proximity dispatching',
    },
    {
      metric: 'Citizen Satisfaction Rating',
      august: '3.9 / 5.0',
      september: '4.4 / 5.0',
      change: '+12.8%',
      type: 'positive',
      icon: Award,
      note: 'Verified cleanups with before/after photos',
    },
    {
      metric: 'Total Operational Cost',
      august: '₹13,50,000',
      september: '₹11,17,000',
      change: '-17.2%',
      type: 'positive',
      icon: IndianRupee,
      note: '₹2.33 Lakh saved via dynamic TSP routing',
    },
    {
      metric: 'AI Verification Accuracy',
      august: '89.0%',
      september: '95.2%',
      change: '+6.2%',
      type: 'positive',
      icon: Sparkles,
      note: 'Refined optical threshold for debris clearance',
    },
    {
      metric: 'Plastic Waste Diverted',
      august: '12.4 Tons',
      september: '15.8 Tons',
      change: '+27.4%',
      type: 'positive',
      icon: CheckCircle2,
      note: 'Enhanced dry-waste segregation at source',
    },
  ];

  const trendChartData = [
    { month: 'June', complaints: 920, costLakhs: 14.2, resolutionHours: 4.8 },
    { month: 'July', complaints: 890, costLakhs: 13.9, resolutionHours: 4.5 },
    { month: 'August', complaints: 850, costLakhs: 13.5, resolutionHours: 4.2 },
    { month: 'September', complaints: 680, costLakhs: 11.17, resolutionHours: 2.8 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'மாதாந்திர பகுப்பாய்வு & ஒப்பீட்டு அறிக்கை' : 'Monthly Analytics & Performance Comparison'}
          </h1>
          <p className="text-xs text-slate-500">
            August vs September comprehensive municipal performance metrics and cost reduction index
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveView('monthlyReports')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 self-start sm:self-auto transition shadow-sm"
        >
          <FileDown className="w-4 h-4" />
          <span>Export Government PDF Report</span>
        </button>
      </div>

      {/* 6 Key Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {comparisonData.map((item, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">{item.metric}</span>
              <span className="inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                {item.change.startsWith('-') ? (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                )}
                {item.change}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">August (Baseline)</span>
                <span className="text-sm font-mono font-medium text-slate-500">{item.august}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">September (Current)</span>
                <span className="text-xl font-mono font-extrabold text-slate-900">{item.september}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 italic">
              {item.note}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Complaints & Resolution Hours Reduction */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Complaints vs. Resolution Time Reduction</h2>
            <p className="text-xs text-slate-500">Continuous 4-month optimization trajectory</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="complaints" name="Total Complaints" stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="resolutionHours" name="Resolution (hrs)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Operational Cost Reduction (₹ Lakhs) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Monthly Municipal Expenditure (₹ Lakhs)</h2>
            <p className="text-xs text-slate-500">Direct operational savings achieved via fleet & IoT routing</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="costLakhs" name="Budget Spent (₹ Lakhs)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
