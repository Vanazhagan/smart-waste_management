import React from 'react';
import {
  BrainCircuit,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Radio,
  Truck,
  CheckCircle2,
  Clock,
  CloudRain,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '../../services/store';

export const PredictiveAnalyticsView: React.FC = () => {
  const { language } = useStore();

  const predictions = [
    {
      id: 'PRED-01',
      location: 'T. Nagar (Ranganathan St & Usman Road)',
      ward: 'Ward 08',
      trigger: 'Weekend Shopping Festival & Aadi/Deepavali Season',
      expectedSurge: '+45%',
      wasteVolume: '14.2 Tons',
      riskLevel: 'HIGH',
      recommendation:
        'Schedule 2 extra compactor collection trips at 4 PM and 9:30 PM. Deploy 3 temporary mobile bins at bus stand.',
      confidence: '94.8%',
      factors: ['Commercial Footfall Spike', 'Weekend Consumer Pattern', 'Festival Season Retail'],
    },
    {
      id: 'PRED-02',
      location: 'Mylapore (Kapaleeshwarar Temple Tank & Mada Streets)',
      ward: 'Ward 09',
      trigger: 'Friday Temple Festival & Pradosham Congregation',
      expectedSurge: '+60%',
      wasteVolume: '7.8 Tons Organic Refuse',
      riskLevel: 'CRITICAL',
      recommendation:
        'Pre-position 4 mobile organic collection bins at South Mada Street. Assign 2 dedicated sweepers for flower waste.',
      confidence: '96.2%',
      factors: ['Religious Gathering', 'Organic Coconut & Flower Waste', 'Narrow Alley Access'],
    },
    {
      id: 'PRED-03',
      location: 'Koyambedu Wholesale Market Complex',
      ward: 'Ward 03',
      trigger: 'Sunday Vegetable & Fruit Influx Inflow',
      expectedSurge: '+85%',
      wasteVolume: '18.5 Tons Wet Waste',
      riskLevel: 'HIGH',
      recommendation:
        'Schedule early morning 10-Ton compactor dispatch at 5:00 AM sharp to clear organic crates before opening hours.',
      confidence: '97.5%',
      factors: ['Produce Truck Arrivals', 'Perishable Wet Waste', 'High Rodent/Fly Risk'],
    },
    {
      id: 'PRED-04',
      location: 'Besant Nagar & Marina Promenade',
      ward: 'Ward 14',
      trigger: 'Sunday Evening Recreational Crowds',
      expectedSurge: '+35%',
      wasteVolume: '6.4 Tons Single-Use Plastic & Food Boxes',
      riskLevel: 'MEDIUM',
      recommendation:
        'Increase smart bin alert threshold to 75% on promenade. Pre-dispatch beach sanitization quad-bike team.',
      confidence: '91.0%',
      factors: ['Tourism & Leisure', 'Food Stalls', 'Oceanic Litter Prevention'],
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'முன்கூட்டியே கழிவு கணிப்பு இயந்திரம்' : 'Predictive Municipal Waste Generation Engine'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'பண்டிகைகள், வார இறுதி நாட்கள், வானிலை மற்றும் வரலாற்று போக்குகள் அடிப்படையில் முன்கூட்டியே கணிப்பு'
              : 'Machine learning forecasting incorporating festival calendars, weekend shopping surges, weather, and commercial dynamics'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200">
            Next 7-Day Forecast Active
          </span>
        </div>
      </div>

      {/* AI Forecasting Logic Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 shadow-xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">
            Neural Waste Forecasting Matrix
          </span>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          The predictive engine correlates historical municipal weighbridge data with the Tamil Nadu Hindu Religious &
          Charitable Endowments (HR&CE) temple calendar, monsoon rainfall precipitation, and commercial retail trading
          patterns to issue proactive sanitation dispatch orders 48–72 hours in advance.
        </p>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {predictions.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:shadow-md transition flex flex-col justify-between"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500">{p.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      p.riskLevel === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : p.riskLevel === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {p.riskLevel} Surge Risk
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mt-1">{p.location}</h3>
                <span className="text-xs text-slate-500">{p.ward}</span>
              </div>

              <div className="text-right">
                <span className="text-xl font-black text-rose-600 font-mono block">{p.expectedSurge}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Expected Volume</span>
              </div>
            </div>

            {/* Trigger Reason */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Causal Trigger</span>
              <p className="font-semibold text-slate-800">{p.trigger}</p>
            </div>

            {/* Prescriptive Recommendation */}
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pre-emptive Municipal Action:</span>
              </div>
              <p className="text-emerald-900 text-[11px] leading-relaxed font-medium">{p.recommendation}</p>
            </div>

            {/* Multi-Factor Tags */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex flex-wrap gap-1">
                {p.factors.map((f, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                    {f}
                  </span>
                ))}
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">
                Confidence: {p.confidence}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
