import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit3,
  Check,
  ArrowRight,
  Info,
  Layers,
  History,
} from 'lucide-react';
import { Complaint, PriorityLevel, SeverityLevel, WasteQuantity, WasteType } from '../../types';
import { useStore } from '../../services/store';
import {
  AIImageClassificationService,
  VALID_PRIORITIES,
  VALID_QUANTITIES,
  VALID_SEVERITIES,
  VALID_WASTE_TYPES,
} from '../../services/aiImageClassificationService';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  onClose: () => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({ complaint, onClose }) => {
  const {
    role,
    submitCitizenFeedback,
    adminOverrideComplaintAI,
    reanalyzeComplaintWithAI,
    updateComplaintStatus,
    language,
  } = useStore();

  const [rating, setRating] = useState(complaint?.feedback?.rating || 5);
  const [comment, setComment] = useState(complaint?.feedback?.comment || '');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(!!complaint?.feedback);

  // Admin Override Form State
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideWasteType, setOverrideWasteType] = useState<WasteType>(complaint?.aiAnalysis?.wasteType || 'Mixed Waste');
  const [overrideQuantity, setOverrideQuantity] = useState<WasteQuantity>(complaint?.aiAnalysis?.quantity || 'Medium');
  const [overrideSeverity, setOverrideSeverity] = useState<SeverityLevel>(complaint?.aiAnalysis?.severity || 'Medium');
  const [overrideHealthRisk, setOverrideHealthRisk] = useState<SeverityLevel>(complaint?.aiAnalysis?.healthRisk || 'Medium');
  const [overridePublicImpact, setOverridePublicImpact] = useState<SeverityLevel>(
    complaint?.aiAnalysis?.publicImpact || 'Medium'
  );
  const [overridePriority, setOverridePriority] = useState<PriorityLevel>(complaint?.aiAnalysis?.priority || 'P2');
  const [overrideReason, setOverrideReason] = useState<string>('Site inspection revealed different volume and hazard level.');
  const [isSavingOverride, setIsSavingOverride] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  if (!complaint) return null;

  const isResolved = complaint.status === 'Resolved';
  const ai = complaint.aiAnalysis;
  const confidenceInfo = ai ? AIImageClassificationService.getConfidenceLevel(ai.confidenceScore) : null;

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCitizenFeedback(complaint.id, rating, comment);
    setFeedbackSubmitted(true);
  };

  // Admin accepts AI result
  const handleAdminAcceptAI = () => {
    updateComplaintStatus(
      complaint.id,
      complaint.status === 'Pending' ? 'AI Analysed' : complaint.status,
      `Municipal Admin confirmed and approved AI Vision classification (${ai?.wasteType}, Priority ${ai?.priority}).`
    );
    setActionSuccessMsg('AI classification successfully approved by Municipal Administrator.');
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Admin triggers image re-analysis
  const handleAdminReanalyze = async () => {
    setIsReanalyzing(true);
    setActionSuccessMsg(null);
    try {
      await reanalyzeComplaintWithAI(complaint.id);
      setActionSuccessMsg('Computer Vision image re-analysis completed successfully.');
    } catch (err) {
      console.error('Reanalysis failed:', err);
    } finally {
      setIsReanalyzing(false);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    }
  };

  // Admin saves manual override
  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingOverride(true);

    adminOverrideComplaintAI(complaint.id, {
      wasteType: overrideWasteType,
      quantity: overrideQuantity,
      severity: overrideSeverity,
      healthRisk: overrideHealthRisk,
      publicImpact: overridePublicImpact,
      priority: overridePriority,
      reason: overrideReason,
    });

    setIsSavingOverride(false);
    setIsOverrideOpen(false);
    setActionSuccessMsg('Manual administrative override saved. Original AI results preserved for audit.');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold bg-slate-800 text-emerald-400 px-2.5 py-1 rounded border border-slate-700">
              {complaint.id}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                complaint.status === 'Resolved'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : complaint.status === 'Cleaning'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : complaint.status === 'Assigned'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {complaint.status}
            </span>

            {complaint.adminOverride && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Admin Overridden
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Success Toast */}
        {actionSuccessMsg && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Top Section: Photos & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Complaint Photo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span>Original Complaint Image</span>
                {ai && (
                  <span className="text-[10px] font-mono text-slate-500">
                    {ai.isRealAI ? 'Vision AI Analyzed' : 'Heuristic Analyzed'}
                  </span>
                )}
              </div>
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
                <img
                  src={complaint.photoUrl}
                  alt="Garbage report"
                  className="w-full h-48 rounded-xl object-cover shadow-sm"
                />
                {/* Real Object Detection Bounding Boxes if available */}
                {ai?.detailedDetectedObjects &&
                  ai.detailedDetectedObjects
                    .filter((o) => o.box_2d && o.box_2d.length === 4)
                    .map((obj, i) => {
                      const [ymin, xmin, ymax, xmax] = obj.box_2d!;
                      return (
                        <div
                          key={i}
                          className="absolute border-2 border-emerald-400 bg-emerald-500/20 pointer-events-none rounded"
                          style={{
                            top: `${ymin / 10}%`,
                            left: `${xmin / 10}%`,
                            height: `${(ymax - ymin) / 10}%`,
                            width: `${(xmax - xmin) / 10}%`,
                          }}
                        >
                          <span className="absolute -top-4 left-0 bg-emerald-600 text-white text-[9px] font-mono px-1 py-0.2 rounded font-bold whitespace-nowrap shadow">
                            {obj.name} ({obj.confidence}%)
                          </span>
                        </div>
                      );
                    })}
                <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-sm rounded-lg p-2 text-white text-[11px] flex justify-between items-center">
                  <span className="truncate">{complaint.location.address}</span>
                  <span className="font-mono text-emerald-400 shrink-0 font-bold ml-2">
                    {complaint.location.ward}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 italic">"{complaint.description}"</p>
            </div>

            {/* After Photo or Worker / Metadata Info */}
            <div className="space-y-3">
              {complaint.afterPhotoUrl ? (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      After-Cleaning Verification Proof
                    </span>
                    {complaint.aiVerification?.verified && (
                      <span className="text-[10px] bg-emerald-600 text-white font-mono px-2 py-0.5 rounded-full font-bold">
                        AI Verified ({complaint.aiVerification.confidence}%)
                      </span>
                    )}
                  </div>
                  <img
                    src={complaint.afterPhotoUrl}
                    alt="After cleaning"
                    className="w-full h-36 rounded-lg object-cover border border-emerald-300 shadow-inner"
                  />
                  {complaint.aiVerification?.notes && (
                    <p className="text-[11px] text-emerald-900 font-medium">
                      {complaint.aiVerification.notes}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Citizen Reporter:</span>
                    <span className="font-bold text-slate-900">{complaint.citizenName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Contact Phone:</span>
                    <span className="font-mono text-slate-700">{complaint.citizenPhone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Ward Assignment:</span>
                    <span className="font-semibold text-slate-900">{complaint.location.ward}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">GPS Location:</span>
                    <span className="font-mono text-slate-700">
                      {complaint.location.lat.toFixed(4)}° N, {complaint.location.lng.toFixed(4)}° E
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Reported On:</span>
                    <span className="font-mono text-slate-700">
                      {new Date(complaint.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              )}

              {/* Assigned Worker Badge */}
              {complaint.assignedWorkerName && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      {complaint.assignedWorkerName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">
                        Assigned Worker
                      </span>
                      <p className="font-bold text-slate-900">{complaint.assignedWorkerName}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-blue-700 font-semibold bg-white px-2 py-1 rounded border border-blue-200">
                    Field Team
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* AI Analysis Breakdown & Diagnostic Card */}
          {ai && (
            <div className="rounded-xl bg-slate-900 text-white border border-slate-800 overflow-hidden shadow-lg space-y-0">
              {/* Header */}
              <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-200 uppercase tracking-wider font-mono">
                    AI Optical Analysis & Priority
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">({ai.modelName})</span>
                </div>
                {ai.analysisLatencyMs && (
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{ai.analysisLatencyMs} ms</span>
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3.5">
                {/* Confidence Indicator and Priorities */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Confidence */}
                  <div className="p-3 rounded-lg bg-slate-800/70 border border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Confidence Level
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-mono font-bold text-white">{ai.confidenceScore}%</span>
                      {confidenceInfo && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ai.confidenceScore >= 90
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : ai.confidenceScore >= 75
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {confidenceInfo.level}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI Recommended Priority */}
                  <div className="p-3 rounded-lg bg-slate-800/70 border border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      AI Priority (Vision)
                    </span>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded font-mono text-xs font-black uppercase ${
                        ai.priority === 'P1'
                          ? 'bg-rose-600 text-white'
                          : ai.priority === 'P2'
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {ai.priority} - {ai.severity}
                    </span>
                  </div>

                  {/* System Priority */}
                  <div className="p-3 rounded-lg bg-slate-800/70 border border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      System Rule Engine
                    </span>
                    <span className="inline-block px-2.5 py-0.5 rounded font-mono text-xs font-bold uppercase bg-slate-700 text-slate-200">
                      {ai.priority} Computed
                    </span>
                  </div>
                </div>

                {/* Classification Parameters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Waste Type</span>
                    <span className="font-bold text-slate-100">{ai.wasteType}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Quantity</span>
                    <span className="font-bold text-slate-100">{ai.quantity} Volume</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Health Risk</span>
                    <span className="font-bold text-rose-300">{ai.healthRisk}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Public Impact</span>
                    <span className="font-bold text-amber-300">{ai.publicImpact}</span>
                  </div>
                </div>

                {/* Detected Waste Objects with confidence chips */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                    Detected Waste Objects:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ai.detailedDetectedObjects && ai.detailedDetectedObjects.length > 0 ? (
                      ai.detailedDetectedObjects.map((obj, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded text-[11px] font-medium bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                        >
                          <span>{obj.name}</span>
                          <span className="text-[10px] font-mono font-bold text-emerald-400">{obj.confidence}%</span>
                        </span>
                      ))
                    ) : (
                      ai.detectedObjects.map((obj, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {obj}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Multi-Label Categories & Accumulation */}
                {ai.detectedWaste && ai.detectedWaste.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                      Multi-Label Waste Categories & Confidence:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {ai.detectedWaste.map((cat, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 flex flex-col gap-0.5 text-xs"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-bold text-slate-200">{cat.type}</span>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">
                              {Math.round(cat.confidence * 100)}%
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
                            {cat.objects.join(', ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accumulation Level Progress */}
                {typeof ai.accumulationLevel === 'number' && (
                  <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Ground Accumulation Area</span>
                      <span className="font-mono text-emerald-400 font-bold">{ai.accumulationLevel}%</span>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(5, ai.accumulationLevel))}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* AI Rationale */}
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                    AI Priority Determination Rationale:
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{ai.priorityReason}</p>
                </div>

                {/* Flagged for Review Warning */}
                {ai.requiresManualReview && (
                  <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-600/60 text-amber-200 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Flagged for Administrative Review:</span>
                      <span className="text-[11px]">{ai.manualReviewReason || 'Low confidence or conflicting parameters require municipal verification.'}</span>
                    </div>
                  </div>
                )}

                {/* Prominent Verification Notice */}
                <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700/50 text-[11px] text-slate-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>AI-generated classification. Administrative verification may be required.</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold shrink-0">
                    {confidenceInfo ? `${confidenceInfo.score}% Confidence` : `${ai.confidenceScore}%`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Display Administrative Override History if exists */}
          {complaint.adminOverride && (
            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs space-y-2.5">
              <div className="flex items-center justify-between text-blue-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-blue-600" />
                  <span>Administrative Override Record</span>
                </span>
                <span className="text-[10px] font-mono text-blue-700">
                  {new Date(complaint.adminOverride.changedAt).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px]">
                <div className="p-2.5 rounded-lg bg-white border border-blue-200">
                  <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">
                    Original AI Result (Preserved):
                  </span>
                  <div className="space-y-0.5 text-slate-700">
                    <p>Type: <span className="font-semibold">{complaint.adminOverride.originalAIResult.wasteType}</span></p>
                    <p>Priority: <span className="font-mono font-bold text-rose-600">{complaint.adminOverride.originalAIResult.priority}</span></p>
                    <p>Severity: <span className="font-semibold">{complaint.adminOverride.originalAIResult.severity}</span></p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-blue-200">
                  <span className="text-blue-700 font-bold uppercase text-[10px] block mb-1">
                    Final Admin Decision:
                  </span>
                  <div className="space-y-0.5 text-slate-700">
                    <p>
                      Type:{' '}
                      <span className="font-semibold">
                        {complaint.adminOverride.finalAdminResult?.wasteType ||
                          (complaint.adminOverride as any).finalResult?.wasteType}
                      </span>
                    </p>
                    <p>
                      Priority:{' '}
                      <span className="font-mono font-bold text-emerald-600">
                        {complaint.adminOverride.finalAdminResult?.priority ||
                          (complaint.adminOverride as any).finalResult?.priority}
                      </span>
                    </p>
                    <p>Changed by: <span className="font-semibold">{complaint.adminOverride.changedBy}</span></p>
                  </div>
                </div>
              </div>

              <p className="text-blue-950 italic text-[11px] pt-1">
                Override Reason: "{complaint.adminOverride.reason}"
              </p>
            </div>
          )}

          {/* ADMIN DECISION & MANUAL OVERRIDE ACTIONS (Visible for Admin role) */}
          {role === 'ADMIN' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Admin Final Decision & Classification Review</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Municipal administrators can accept the AI proposal, request immediate re-analysis, or enforce a manual override.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAdminAcceptAI}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept AI Result</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOverrideOpen(!isOverrideOpen)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isOverrideOpen ? 'Cancel Manual Edit' : 'Edit Result (Manual Override)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAdminReanalyze}
                  disabled={isReanalyzing}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin text-emerald-600' : ''}`} />
                  <span>{isReanalyzing ? 'Re-analyzing with AI Vision...' : 'Request Re-analysis'}</span>
                </button>
              </div>

              {/* Inline Manual Override Editor */}
              {isOverrideOpen && (
                <form onSubmit={handleSaveOverride} className="p-4 rounded-xl bg-white border border-slate-300 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-900">
                      Manual Override Form (Admin Correction)
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Original AI data will remain preserved
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Waste Type</label>
                      <select
                        value={overrideWasteType}
                        onChange={(e) => setOverrideWasteType(e.target.value as WasteType)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      >
                        {VALID_WASTE_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Quantity</label>
                      <select
                        value={overrideQuantity}
                        onChange={(e) => setOverrideQuantity(e.target.value as WasteQuantity)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      >
                        {VALID_QUANTITIES.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Severity</label>
                      <select
                        value={overrideSeverity}
                        onChange={(e) => setOverrideSeverity(e.target.value as SeverityLevel)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      >
                        {VALID_SEVERITIES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Health Risk</label>
                      <select
                        value={overrideHealthRisk}
                        onChange={(e) => setOverrideHealthRisk(e.target.value as SeverityLevel)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      >
                        {VALID_SEVERITIES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Public Impact</label>
                      <select
                        value={overridePublicImpact}
                        onChange={(e) => setOverridePublicImpact(e.target.value as SeverityLevel)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      >
                        {VALID_SEVERITIES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Municipal Priority</label>
                      <select
                        value={overridePriority}
                        onChange={(e) => setOverridePriority(e.target.value as PriorityLevel)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-bold"
                      >
                        {VALID_PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Reason for Administrative Override
                    </label>
                    <input
                      type="text"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="e.g. Ground patrol reported higher biomedical contamination than photo resolution indicated."
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOverrideOpen(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingOverride}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shadow-sm"
                    >
                      Save Override & Update Priority
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Timeline Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Complaint Resolution Lifecycle Timeline
            </h3>

            <div className="space-y-3 pl-2 border-l-2 border-slate-200">
              {complaint.timeline.map((item, idx) => (
                <div key={idx} className="relative pl-4">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-white" />
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-900">{item.status}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{item.note}</p>
                  <span className="text-[10px] text-slate-400 font-medium block">Updated by: {item.updatedBy}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Section if Resolved */}
          {isResolved && (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h4 className="text-sm font-bold text-slate-900">Citizen Satisfaction Feedback</h4>
              </div>

              {feedbackSubmitted ? (
                <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs">
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= (complaint.feedback?.rating || rating)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-bold text-slate-800">
                      {complaint.feedback?.rating || rating} / 5 Stars
                    </span>
                  </div>
                  <p className="text-slate-700 italic">"{complaint.feedback?.comment || comment || 'Fast resolution!'}"</p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Your feedback directly updates sanitary worker performance rankings.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <p className="text-xs text-slate-600">
                    Please rate the speed, cleanliness and conduct of the municipal resolution team:
                  </p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="p-1 transition hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            s <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 hover:text-amber-400'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">{rating} of 5 Stars</span>
                  </div>

                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a brief citizen review..."
                    className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />

                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition shadow"
                  >
                    Submit Citizen Rating
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
