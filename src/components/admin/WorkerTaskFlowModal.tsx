import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Camera,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Complaint, AICleaningVerificationResult } from '../../types';
import { useStore } from '../../services/store';
import { AIImageClassificationService } from '../../services/aiImageClassificationService';

interface WorkerTaskFlowModalProps {
  complaint: Complaint | null;
  onClose: () => void;
}

const AFTER_CLEANING_SAMPLE_URL =
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80';

const AFTER_CLEANING_PARTIAL_URL =
  'https://images.unsplash.com/photo-1611288870280-4a331a9657b8?w=600&auto=format&fit=crop&q=80';

export const WorkerTaskFlowModal: React.FC<WorkerTaskFlowModalProps> = ({ complaint, onClose }) => {
  const { submitCleaningProof, updateComplaintStatus, language } = useStore();

  const [afterPhotoUrl, setAfterPhotoUrl] = useState(AFTER_CLEANING_SAMPLE_URL);
  const [afterFileName, setAfterFileName] = useState('sanitized_site_proof.jpg');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<AICleaningVerificationResult | null>(
    complaint?.aiVerification || null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!complaint) return null;

  const handleStartTask = () => {
    updateComplaintStatus(
      complaint.id,
      'Cleaning',
      `Sanitary worker ${complaint.assignedWorkerName || 'assigned'} commenced site clearance and sanitization.`
    );
  };

  const handleFileUpload = async (file: File) => {
    try {
      const compressed = await AIImageClassificationService.compressImage(file);
      setAfterPhotoUrl(compressed);
      setAfterFileName(file.name);
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAfterPhotoUrl(e.target.result as string);
          setAfterFileName(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunVerification = async () => {
    setIsVerifying(true);

    try {
      // Call vision AI cleaning verification
      const result = await AIImageClassificationService.verifyCleaning({
        beforeImageDataUrl: complaint.photoUrl,
        afterImageDataUrl: afterPhotoUrl,
        complaintId: complaint.id,
      });

      setVerificationResult(result);

      // Save to central store
      await submitCleaningProof(complaint.id, afterPhotoUrl, result.cleanlinessScore, result);
    } catch (err) {
      console.error('AI Verification failed:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>AI Sanitary Cleaning Verification</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  Dual-Image Vision Compare
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Ticket {complaint.id} • Assigned: {complaint.assignedWorkerName || 'Sanitary Personnel'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Status Stepper */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700 overflow-x-auto gap-2">
            <span className="text-emerald-700 font-bold shrink-0">1. Worker Assigned</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span
              className={`shrink-0 ${
                complaint.status === 'Cleaning' || complaint.status === 'Resolved'
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-400'
              }`}
            >
              2. On-Site Intervention
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className={`shrink-0 ${afterPhotoUrl ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
              3. Post-Clean Proof
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className={`shrink-0 ${complaint.status === 'Resolved' ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
              4. AI Optical Verified
            </span>
          </div>

          {/* Dual Image Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before Photo */}
            <div className="p-3.5 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>BEFORE: Original Complaint Photo</span>
                </span>
                <span className="text-[10px] font-mono text-rose-700 font-bold uppercase bg-rose-100 px-2 py-0.5 rounded">
                  {complaint.aiAnalysis?.priority} • {complaint.aiAnalysis?.wasteType}
                </span>
              </div>
              <img
                src={complaint.photoUrl}
                alt="Before Cleaning"
                className="w-full h-44 rounded-lg object-cover border border-slate-300 shadow-sm"
              />
              <p className="text-[11px] text-slate-500 truncate">{complaint.description}</p>
            </div>

            {/* After Photo */}
            <div className="p-3.5 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>AFTER: Sanitized Site Proof</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase bg-emerald-100 px-2 py-0.5 rounded">
                  Post-Clean Proof
                </span>
              </div>
              <img
                src={afterPhotoUrl}
                alt="After Cleaning"
                className="w-full h-44 rounded-lg object-cover border border-slate-300 shadow-sm"
              />

              {/* Quick actions for after-photo */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setAfterPhotoUrl(AFTER_CLEANING_SAMPLE_URL);
                      setAfterFileName('complete_cleared.jpg');
                    }}
                    className={`px-2 py-1 rounded border text-[10px] font-semibold ${
                      afterPhotoUrl === AFTER_CLEANING_SAMPLE_URL
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    100% Cleared Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAfterPhotoUrl(AFTER_CLEANING_PARTIAL_URL);
                      setAfterFileName('partial_residue.jpg');
                    }}
                    className={`px-2 py-1 rounded border text-[10px] font-semibold ${
                      afterPhotoUrl === AFTER_CLEANING_PARTIAL_URL
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Residual Scatter Sample
                  </button>
                </div>

                <label className="cursor-pointer px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* AI Verification Control & Diagnostic Results */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-4 shadow-lg border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Vision AI Verification Architecture
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {verificationResult?.modelName || 'gemini-3.8-flash'}
              </span>
            </div>

            {/* Verification Result Breakdown Card */}
            {verificationResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-3 ${
                  verificationResult.verified
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-100'
                    : 'bg-rose-950/50 border-rose-500/40 text-rose-100'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-2 text-sm">
                    {verificationResult.verified ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    )}
                    <span>
                      Cleaning Status: {verificationResult.verified ? 'VERIFIED PASSED' : 'VERIFICATION FAILED'}
                    </span>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-black/40 border border-white/10 font-bold">
                    Confidence: {verificationResult.confidence}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] pt-1">
                  <div className="p-2 rounded-lg bg-black/30 border border-white/10">
                    <span className="text-slate-400 block font-semibold mb-0.5">Before Condition</span>
                    <span className="font-medium text-white">{verificationResult.beforeCondition}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/10">
                    <span className="text-slate-400 block font-semibold mb-0.5">After Condition</span>
                    <span className="font-medium text-white">{verificationResult.afterCondition}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/10">
                    <span className="text-slate-400 block font-semibold mb-0.5">Remaining Waste</span>
                    <span
                      className={`font-bold ${
                        verificationResult.remainingWaste?.toLowerCase().includes('none')
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {verificationResult.remainingWaste || 'None'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-black/30 border border-white/10 text-[11px]">
                  <span className="text-slate-400 font-semibold block mb-0.5">AI Explanation:</span>
                  <p className="text-slate-200 leading-relaxed">
                    {verificationResult.explanation || verificationResult.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {complaint.status === 'Assigned' && (
                <button
                  type="button"
                  onClick={handleStartTask}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition"
                >
                  Worker: Commenced On-Site Cleaning
                </button>
              )}

              <button
                type="button"
                onClick={handleRunVerification}
                disabled={isVerifying}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-2 transition ml-auto disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>{isVerifying ? 'Analyzing Before/After Photos...' : 'Compare & Verify with Vision AI'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
