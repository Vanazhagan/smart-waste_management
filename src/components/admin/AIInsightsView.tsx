import React, { useState } from 'react';
import {
  Sparkles,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Play,
  RefreshCw,
  History,
  XCircle,
  Eye,
  Sliders,
  Award,
} from 'lucide-react';
import { useStore } from '../../services/store';
import { AIImageClassificationService } from '../../services/aiImageClassificationService';
import { AI_BENCHMARK_TEST_SUITE } from '../../data/aiTestCases';
import { AITestCase, AIAnalysisResult, AIFeedbackRecord } from '../../types';

export const AIInsightsView: React.FC = () => {
  const { language } = useStore();
  const [activeTab, setActiveTab] = useState<'directives' | 'benchmark' | 'feedback'>('directives');

  // Benchmark Runner State
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState<
    Record<string, { result: AIAnalysisResult; passed: boolean; matchDetails: string }>
  >({});
  const [selectedTestCase, setSelectedTestCase] = useState<AITestCase | null>(null);

  // Admin Feedback records
  const [feedbackRecords, setFeedbackRecords] = useState<AIFeedbackRecord[]>(() =>
    AIImageClassificationService.getAdminFeedbackRecords()
  );

  const reloadFeedback = () => {
    setFeedbackRecords(AIImageClassificationService.getAdminFeedbackRecords());
  };

  const runBenchmark = async () => {
    setIsRunningBenchmark(true);
    const results: Record<string, { result: AIAnalysisResult; passed: boolean; matchDetails: string }> = {};

    for (const testCase of AI_BENCHMARK_TEST_SUITE) {
      try {
        const analysis = await AIImageClassificationService.classifyWasteImage({
          imageDataUrl: testCase.imageUrl,
          description: testCase.title,
        });
        let passed = false;
        let matchDetails = '';

        if (testCase.isNonWaste) {
          passed = !analysis.isWaste || (analysis.wasteType as string) === 'No Waste Detected';
          matchDetails = passed ? 'Accurately detected clean area / non-waste' : 'False positive waste detection';
        } else {
          // Check if primary category matches or is in detectedWaste
          const primaryMatches = analysis.wasteType.toLowerCase().includes(testCase.expectedCategory.toLowerCase()) ||
            testCase.expectedCategory.toLowerCase().includes(analysis.wasteType.toLowerCase());
          
          const multiMatches = testCase.expectedMultiCategories?.some((cat) =>
            analysis.detectedWaste?.some((dw) => dw.type.toLowerCase().includes(cat.toLowerCase()))
          );

          passed = primaryMatches || !!multiMatches;
          matchDetails = passed
            ? `Matched: ${analysis.wasteType}`
            : `Expected ${testCase.expectedCategory}, got ${analysis.wasteType}`;
        }

        results[testCase.id] = { result: analysis, passed, matchDetails };
      } catch (err: any) {
        console.error('Benchmark test failed:', err);
      }
    }

    setBenchmarkResults(results);
    setIsRunningBenchmark(false);
  };

  const totalRun = Object.keys(benchmarkResults).length;
  const passedCount = Object.values(benchmarkResults).filter(
    (r: { result: AIAnalysisResult; passed: boolean; matchDetails: string }) => r.passed
  ).length;
  const benchmarkAccuracy = totalRun > 0 ? Math.round((passedCount / totalRun) * 100) : null;

  const insights = [
    {
      category: 'Resource Reallocation',
      title: 'Workforce Density Balancing: Ward 08 vs Ward 12',
      badge: 'High Financial ROI',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      insight:
        'Ward 08 (T. Nagar) exhibits 2.4x higher waste density per square kilometer than Ward 12 (Anna Nagar). Sanitary workers in Ward 08 average 12.8 tasks/day versus 4.2 in Ward 12.',
      action:
        'Shift 3 sanitary workers and 1 mini-tipper from Ward 12 to Ward 08 to level workforce workload and decrease resolution times by 28%.',
      impact: 'Est. 28% faster resolution in commercial zones',
    },
    {
      category: 'Capital Infrastructure',
      title: 'Targeted Smart Dustbin Deployment on Usman Road',
      badge: 'Infrastructure Grant',
      badgeColor: 'bg-blue-100 text-blue-800',
      insight:
        'Pedestrian commercial traffic generates 4.8 tons of beverage bottles and packaging daily between Panagal Park and Usman Road Flyover with no public dustbin within a 400m radius.',
      action:
        'Procure and install 4 high-capacity 1100L solar-powered IoT ultrasonic dustbins at 150m intervals along Usman Road.',
      impact: 'Estimated 35% drop in street-corner dumping complaints',
    },
    {
      category: 'Seasonal Climate Planning',
      title: 'Northeast Monsoon Storm Drain Protection Protocol',
      badge: 'Urban Flood Prevention',
      badgeColor: 'bg-amber-100 text-amber-800',
      insight:
        'The Northeast Monsoon is forecasted to arrive in 3 weeks. 14 critical open garbage dump sites sit immediately adjacent to major stormwater culvert mouths.',
      action:
        'Execute pre-emptive mechanical desilting and 100% barrier encasement of all 14 culvert dump sites to eliminate flood choking risks.',
      impact: 'Prevents street inundation across 4 municipal zones',
    },
    {
      category: 'Regulatory Policy Enforcement',
      title: 'Commercial Single-Use Plastic Enforcement',
      badge: 'Statutory Penalty',
      badgeColor: 'bg-rose-100 text-rose-800',
      insight:
        'Computer vision classification reveals that banned single-use plastic carrier bags and non-woven polypropylene account for 42% of commercial market waste.',
      action:
        'Deploy joint Corporation-Pollution Control Board inspection squads to enforce statutory ₹5,000 spot fines on non-compliant commercial merchants.',
      impact: 'Projected 40% reduction in plastic fraction within 30 days',
    },
    {
      category: 'Citizen Community Engagement',
      title: 'Community Cleanliness Recognition for Ward 04',
      badge: 'Citizen Co-Governance',
      badgeColor: 'bg-purple-100 text-purple-800',
      insight:
        'Citizen reporting engagement in Ward 04 (Mylapore) climbed by 65% following the introduction of bilingual mobile ticket tracking and AI resolution proof.',
      action:
        'Award Ward 04 the Mayor’s Clean Neighborhood Rolling Shield and install community composting bins with residential training.',
      impact: 'Sustained citizen trust and civic pride score',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'AI உத்திகள் & மாதிரி பகுப்பாய்வு மையம்' : 'AI Strategic Intelligence & Model Benchmarking'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'கொள்கை வழிகாட்டுதல், மாதிரி துல்லியம் சோதனைகள் மற்றும் நிர்வாக மேற்பார்வை பதிவுகள்'
              : 'Deterministic vision pipeline benchmarking, accuracy validation, administrative feedback loop, and policy directives'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl self-start sm:self-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('directives')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'directives' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Policy Directives
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('benchmark')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'benchmark' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Vision Benchmark ({AI_BENCHMARK_TEST_SUITE.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('feedback');
              reloadFeedback();
            }}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'feedback' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-blue-600" />
            <span>Admin Feedback ({feedbackRecords.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Policy Directives */}
      {activeTab === 'directives' && (
        <div className="space-y-4">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{item.title}</h3>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${item.badgeColor} self-start sm:self-auto`}>
                  {item.badge}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <strong className="text-slate-900">Data Observation: </strong>
                {item.insight}
              </p>

              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start sm:items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                  <span className="text-emerald-950 font-medium">
                    <strong>Recommended Intervention: </strong>
                    {item.action}
                  </span>
                </div>

                <span className="text-[11px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                  {item.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: AI Vision Benchmark Suite */}
      {activeTab === 'benchmark' && (
        <div className="space-y-6">
          {/* Top Control & Metrics */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>Deterministic Multi-Step AI Benchmark Suite</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluates 10 ground-truth real waste & non-waste scenarios across image quality, object detection, multi-label categories, severity calculation, and deterministic priority.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={runBenchmark}
                  disabled={isRunningBenchmark}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRunningBenchmark ? 'animate-spin' : ''}`} />
                  <span>{isRunningBenchmark ? 'Benchmarking 10 Test Cases...' : 'Run Live Benchmark Suite'}</span>
                </button>
              </div>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Test Suite Size</span>
                <span className="text-xl font-bold font-mono text-slate-900">{AI_BENCHMARK_TEST_SUITE.length} Scenarios</span>
                <span className="text-[10px] text-slate-500 block">Single, Multi, & Non-Waste</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Benchmark Accuracy</span>
                <span className="text-xl font-bold font-mono text-emerald-600">
                  {benchmarkAccuracy !== null ? `${benchmarkAccuracy}%` : 'Not run yet'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {totalRun > 0 ? `${passedCount} of ${totalRun} Passed` : 'Click Run to evaluate'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Pipeline Architecture</span>
                <span className="text-sm font-bold text-slate-800 block">10-Stage Pipeline</span>
                <span className="text-[10px] text-emerald-600 font-medium block">Deterministic Rules</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Disclaimers Enforced</span>
                <span className="text-sm font-bold text-slate-800 block">Mandatory Notice</span>
                <span className="text-[10px] text-slate-500 block">Human Oversight Required</span>
              </div>
            </div>

            {/* Disclaimer Bar */}
            <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AI-generated classification. Administrative verification may be required.</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">Standard Municipal Policy</span>
            </div>
          </div>

          {/* Test Case Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_BENCHMARK_TEST_SUITE.map((testCase) => {
              const testResult = benchmarkResults[testCase.id];
              return (
                <div
                  key={testCase.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                >
                  <div className="p-4 flex items-start gap-3">
                    <img
                      src={testCase.imageUrl}
                      alt={testCase.title}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-xs text-slate-900 truncate">{testCase.title}</h3>
                        {testResult && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 flex items-center gap-1 ${
                              testResult.passed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {testResult.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{testResult.passed ? 'PASS' : 'FAIL'}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-1.5 text-[10px]">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                          Target: {testCase.expectedCategory}
                        </span>
                        {testCase.expectedQuantity && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            Vol: {testCase.expectedQuantity}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5">{testCase.notes}</p>
                    </div>
                  </div>

                  {/* Benchmark Result Detail if run */}
                  {testResult && (
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">AI Output:</span>
                        <strong className="text-slate-800 font-bold">{testResult.result.wasteType}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Confidence:</span>
                        <span className="font-mono text-emerald-600 font-bold">
                          {testResult.result.confidenceScore}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Priority Computed:</span>
                        <span className="font-mono font-bold text-rose-600">
                          {testResult.result.priority} ({testResult.result.severity})
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200">
                        {testResult.matchDetails}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Continuous Learning & Admin Feedback Records */}
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <span>Administrative Corrections & Feedback Loop</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Every manual override performed by municipal administrators is securely recorded to fine-tune future classification rules and prevent systemic drift.
              </p>
            </div>

            <button
              type="button"
              onClick={reloadFeedback}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Log</span>
            </button>
          </div>

          {feedbackRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-bold text-slate-600">No Administrative Overrides Logged Yet</p>
              <p className="max-w-md mx-auto">
                When an administrator overrides an AI classification on the Complaints Management screen, the adjustment is recorded here for continuous learning.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbackRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-slate-900">{rec.complaintId}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">
                        {rec.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(rec.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">AI Initial Observation:</span>
                      <p>Type: <strong className="text-slate-800">{rec.aiObservation.wasteType}</strong></p>
                      <p>Priority: <span className="font-mono font-bold text-rose-600">{rec.aiObservation.priority}</span></p>
                      <p>Confidence: <span className="font-mono text-emerald-600">{rec.aiObservation.confidence}%</span></p>
                    </div>

                    <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-emerald-800 block">Admin Final Correction:</span>
                      <p>Type: <strong className="text-emerald-950">{rec.adminCorrection.wasteType}</strong></p>
                      <p>Priority: <span className="font-mono font-bold text-emerald-700">{rec.adminCorrection.priority}</span></p>
                      <p>Changed By: <span className="font-semibold text-slate-800">{rec.adminCorrection.changedBy}</span></p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 italic">
                    Correction Reason: "{rec.adminCorrection.reason}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
