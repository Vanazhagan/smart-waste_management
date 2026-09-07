import React from 'react';
import {
  Printer,
  Download,
  FileText,
  ShieldCheck,
  Building,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../services/store';

export const GovernmentReportView: React.FC = () => {
  const { areas, workers, smartBins, complaints, cleaningExpenses, vehicleExpenses, language } = useStore();

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Ward,Area,AugComplaints,SepComplaints,Change,CleanlinessIndex,Status\n' +
      areas
        .map(
          (a) =>
            `${a.wardNumber},"${a.name}",${a.previousMonthComplaints},${a.currentMonthComplaints},${a.percentageChange}%,${a.cleanlinessIndex},${a.status}`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'TN_Municipal_Waste_Report_September_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'அரசு & நகராட்சி அதிகாரப்பூர்வ அறிக்கை' : 'Government & Municipal Executive Dossier'}
          </h1>
          <p className="text-xs text-slate-500">
            Official monthly compliance, audit, financial expenditure, and environmental impact report
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print Official Dossier</span>
          </button>
        </div>
      </div>

      {/* Official Government Printable Document Canvas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Document Official Letterhead */}
        <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center font-serif font-black text-xl shadow">
              TN
            </div>
            <div className="text-left">
              <h2 className="text-base sm:text-lg font-black tracking-wide uppercase text-slate-900">
                Government of Tamil Nadu • Municipal Administration & Water Supply Department
              </h2>
              <p className="text-xs font-medium text-slate-600">
                Greater Municipal Corporation Smart Waste Operations & Public Health Directorate
              </p>
            </div>
          </div>
          <div className="pt-2 text-xs font-mono text-slate-500 flex justify-between items-center border-t border-slate-200 mt-4">
            <span>Doc Ref: TN-MAWS-SWM-2026/09</span>
            <span>Reporting Period: September 2026 (Audit Verified)</span>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <section className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            1. Executive Summary & Policy Impact
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            During the month of September 2026, the municipal automated waste management platform demonstrated a 
            <strong> 20.0% net reduction in street-level waste complaints</strong> across 6 primary wards, declining from 
            850 incidents in August to 680 in September. The deployment of ESP32 ultrasonic sensors across 24 critical smart 
            dustbins, combined with algorithmic vehicle route optimization, generated an operational cost saving of 
            <strong> ₹2,33,000 (-17.2%)</strong>. Mean complaint resolution turnaround accelerated from 4.2 hours to 2.8 hours 
            with a citizen satisfaction index of 4.4 / 5.0.
          </p>
        </section>

        {/* 2. Key Municipal Metric Table */}
        <section className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            2. Core Performance Matrix
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Complaints Resolved</span>
              <span className="text-lg font-bold text-slate-900 font-mono">680 (96.2% Verified)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Operating Budget</span>
              <span className="text-lg font-bold text-slate-900 font-mono">₹11,17,000 / Mo</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Average Turnaround</span>
              <span className="text-lg font-bold text-emerald-700 font-mono">2.8 Hours</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Recycled Plastics</span>
              <span className="text-lg font-bold text-emerald-700 font-mono">15.8 Metric Tons</span>
            </div>
          </div>
        </section>

        {/* 3. Ward Performance Audit */}
        <section className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            3. Ward-Level Cleanliness Index & Compliance
          </h3>
          <table className="w-full text-xs text-left border border-slate-200">
            <thead className="bg-slate-100 font-bold text-slate-700">
              <tr>
                <th className="p-2 border-b">Ward / Area</th>
                <th className="p-2 border-b text-center">August</th>
                <th className="p-2 border-b text-center">September</th>
                <th className="p-2 border-b text-center">Change</th>
                <th className="p-2 border-b text-center">Index (0-100)</th>
                <th className="p-2 border-b text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {areas.map((a) => (
                <tr key={a.id}>
                  <td className="p-2 font-sans font-medium text-slate-900">
                    {a.name} ({a.wardNumber})
                  </td>
                  <td className="p-2 text-center text-slate-500">{a.previousMonthComplaints}</td>
                  <td className="p-2 text-center font-bold text-slate-900">{a.currentMonthComplaints}</td>
                  <td
                    className={`p-2 text-center font-bold ${
                      a.percentageChange > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {a.percentageChange > 0 ? `+${a.percentageChange}%` : `${a.percentageChange}%`}
                  </td>
                  <td className="p-2 text-center">{a.cleanlinessIndex}</td>
                  <td className="p-2 text-right font-sans font-bold text-slate-700">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 4. Strategic Recommendations for Next Month */}
        <section className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            4. Statutory Directives & Resource Allocation for October 2026
          </h3>
          <ul className="text-xs text-slate-700 space-y-2 list-disc pl-5 leading-relaxed">
            <li>
              <strong>Immediate Ward 08 Intervention:</strong> Redeploy 2 sanitary workers from Ward 12 to Usman Road
              (T. Nagar) to curb the +59.4% market dumping surge.
            </li>
            <li>
              <strong>IoT Bin Expansion:</strong> Procure and install 10 additional solar-powered ultrasonic dustbins
              in high commercial traffic zones before the upcoming festival season.
            </li>
            <li>
              <strong>Night Shift Compactor Route:</strong> Formally approve a 9:30 PM commercial compactor run to
              mitigate nocturnal garbage pileup in vegetable markets.
            </li>
          </ul>
        </section>

        {/* Official Signatures */}
        <div className="pt-8 border-t-2 border-slate-900 flex justify-between items-end text-xs text-slate-700">
          <div>
            <span className="font-bold block">Er. K. Senthil Nathan, M.E.</span>
            <span className="text-slate-500 text-[11px]">Superintending Engineer (Solid Waste Management)</span>
            <span className="text-slate-400 text-[10px] block mt-0.5">Digital Certificate ID: TN-E-SIGN-884210</span>
          </div>
          <div className="text-right">
            <span className="font-bold block">Thiru. M. Soundararajan, IAS</span>
            <span className="text-slate-500 text-[11px]">Commissioner & Special Officer</span>
            <span className="text-slate-400 text-[10px] block mt-0.5">Municipal Corporation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
