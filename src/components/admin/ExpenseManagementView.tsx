import React from 'react';
import {
  IndianRupee,
  PieChart as PieIcon,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  ShieldCheck,
  FileText,
  DollarSign,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useStore } from '../../services/store';

const EXPENSE_COLORS = ['#0f766e', '#0284c7', '#f59e0b', '#8b5cf6', '#ef4444'];

export const ExpenseManagementView: React.FC = () => {
  const { cleaningExpenses, vehicleExpenses, workers, language } = useStore();

  const currentCleaning = cleaningExpenses[0] || {
    equipment: 45000,
    chemicals: 35000,
    binMaintenance: 20000,
    disposalFees: 65000,
    emergencyCleanup: 25000,
    total: 590000,
  };

  const currentVehicle = vehicleExpenses[0] || {
    fuel: 32000,
    maintenance: 15000,
    insurance: 8000,
    total: 55000,
  };

  const totalWorkerSalaries = workers.reduce((acc, w) => acc + w.salary, 0);
  const totalWorkerBonuses = workers.reduce(
    (acc, w) => acc + (w.bonusRecommendation?.status === 'Approved' ? w.bonusRecommendation.recommendedAmount : 0),
    0
  );

  const grandTotal = currentCleaning.total + currentVehicle.total + totalWorkerSalaries + totalWorkerBonuses;

  const expenseBreakdownData = [
    { name: 'Worker Salaries & Benefits', value: totalWorkerSalaries },
    { name: 'Disposal & Processing Fees', value: currentCleaning.disposalFees },
    { name: 'Chemicals & Disinfectants', value: currentCleaning.chemicals },
    { name: 'Fleet Fuel & Diesel', value: currentVehicle.fuel },
    { name: 'Equipment & Bin Maintenance', value: currentCleaning.equipment + currentCleaning.binMaintenance },
    { name: 'Performance Bonuses', value: totalWorkerBonuses || 6000 },
  ];

  const budgetComparisonData = [
    { category: 'Personnel', budget: 500000, actual: totalWorkerSalaries },
    { category: 'Fleet & Fuel', budget: 75000, actual: currentVehicle.total },
    { category: 'Disposal & Plant', budget: 180000, actual: currentCleaning.disposalFees + currentCleaning.emergencyCleanup },
    { category: 'Sanitization Goods', budget: 60000, actual: currentCleaning.chemicals },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'நகராட்சி கழிவு மேலாண்மை செலவினங்கள்' : 'Comprehensive Municipal Expense Management'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'பணியாளர் ஊதியம், வாகன எரிபொருள், உபகரணங்கள் மற்றும் செலவின பகுப்பாய்வு'
              : 'Audit ledger tracking worker payroll, fleet diesel, bin servicing, chemical sanitization, and cost per ton metrics'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200">
            -17.2% Under Allocated Budget
          </span>
        </div>
      </div>

      {/* Top 4 Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Monthly Outlay</span>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">₹11,17,000</p>
          <span className="text-[11px] text-emerald-600 font-semibold">-₹2,33,000 vs August</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Cost Per Ton Diverted</span>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-1">₹1,420</p>
          <span className="text-[11px] text-slate-500">Benchmark: ₹1,850 / ton</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Cost Per Solved Ticket</span>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">₹1,642</p>
          <span className="text-[11px] text-emerald-600 font-semibold">18% lower cost per ticket</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Worker Incentive Outlay</span>
          <p className="text-2xl font-black text-amber-600 font-mono mt-1">₹6,000</p>
          <span className="text-[11px] text-slate-500">Tier 1 & 2 bonuses awarded</span>
        </div>
      </div>

      {/* Charts Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenditure Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Municipal Budget Distribution</h2>
            <p className="text-xs text-slate-500">Personnel, sanitization consumables, and processing fees</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdownData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {expenseBreakdownData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
            {expenseBreakdownData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: EXPENSE_COLORS[idx % EXPENSE_COLORS.length] }}
                />
                <span className="text-slate-600 truncate font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget vs Actual Comparison Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Approved Budget vs. Actual Expenditure</h2>
            <p className="text-xs text-slate-500">September 2026 Fiscal Variance</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="budget" name="Approved Budget" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual Spent" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
