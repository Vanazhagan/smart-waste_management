import React from 'react';
import {
  Leaf,
  ShieldCheck,
  Droplets,
  HeartPulse,
  Recycle,
  Sparkles,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useStore } from '../../services/store';

export const EnvironmentalAnalyticsView: React.FC = () => {
  const { language } = useStore();

  const metrics = [
    {
      title: 'Waste Diverted from Landfills',
      value: '42.6 Tons',
      subtext: '+28% diverted vs previous quarter',
      icon: Recycle,
      color: 'emerald',
      description: 'Redirected to municipal biomethanation plants and registered plastic pelletizing recycling units.',
    },
    {
      title: 'Plastic Waste Recycled',
      value: '15.8 Tons',
      subtext: 'Single-use PET, HDPE & packaging LDPE',
      icon: Leaf,
      color: 'blue',
      description: 'Baled and dispatched to Tamil Nadu Highway bitumen-plastic road mixing projects.',
    },
    {
      title: 'Organic Waste Composted',
      value: '21.2 Tons',
      subtext: 'Market vegetable & temple flower refuse',
      icon: Sparkles,
      color: 'amber',
      description: 'Processed at micro-composting centers (MCC) producing municipal fertilizer distributed to farmers.',
    },
    {
      title: 'Avoided CO₂ Emissions',
      value: '38.4 Tons CO₂e',
      subtext: 'Equivalent to planting 1,740 trees',
      icon: TrendingUp,
      color: 'emerald',
      description: 'Calculated using IPCC methane degradation prevention factors and fleet route fuel savings.',
    },
    {
      title: 'Groundwater Contamination Risk',
      value: '-34% Reduced',
      subtext: 'Leachate runoff prevention',
      icon: Droplets,
      color: 'blue',
      description: 'Elimination of open road dump piles prevented black leachate infiltration into shallow aquifers.',
    },
    {
      title: 'Vector-Borne Disease Risk',
      value: '-41% Lower',
      subtext: 'Dengue & malaria vector breeding spots',
      icon: HeartPulse,
      color: 'rose',
      description: 'Prompt clearance of stagnant water-holding coconut shells, tires, and plastic containers in slums.',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'சுற்றுச்சூழல் & பொது சுகாதார நன்மைகள்' : 'Environmental & Public Health Impact Assessment'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'நிலத்தடி நீர் பாதுகாப்பு, கார்பன் உமிழ்வு குறைப்பு, டெங்கு தடுப்பு மற்றும் பிளாஸ்டிக் மறுசுழற்சி'
              : 'Empirical quantification of carbon offset, landfill diversion, vector-borne disease mitigation, and micro-composting'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200">
            Swachh Bharat Cleanliness Index: 84/100 (+12 pts)
          </span>
        </div>
      </div>

      {/* Hero Highlight Card */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-900/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Circular Economy Scorecard
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Municipality-Wide Cleanliness Index: <span className="text-emerald-400 font-mono">72 → 84</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Through systematic AI priority dispatch and real-time ultrasonic bin surveillance, open dumping duration was cut
          from an average of 18 hours to under 3 hours, effectively halting anaerobic decomposition and surface runoff.
        </p>
      </div>

      {/* 6 Core Impact Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{m.title}</span>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                    <Icon className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>

                <p className="text-2xl font-black text-slate-900 font-mono mt-2">{m.value}</p>
                <span className="text-xs font-semibold text-emerald-700 mt-0.5 block">{m.subtext}</span>
              </div>

              <p className="text-xs text-slate-500 pt-3 border-t border-slate-100 leading-relaxed">
                {m.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
