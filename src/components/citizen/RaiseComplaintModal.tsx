import React, { useState, useRef } from 'react';
import {
  Camera,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  X,
  RefreshCw,
  Edit3,
  Check,
  ShieldCheck,
  Info,
  Clock,
  Zap,
} from 'lucide-react';
import { useStore } from '../../services/store';
import {
  AIImageClassificationService,
  VALID_PRIORITIES,
  VALID_QUANTITIES,
  VALID_SEVERITIES,
  VALID_WASTE_TYPES,
} from '../../services/aiImageClassificationService';
import { AIAnalysisResult, PriorityLevel, SeverityLevel, WasteQuantity, WasteType } from '../../types';

interface RaiseComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_SAMPLE_PHOTOS = [
  {
    label: 'Mixed Market Waste (P1 Critical)',
    url: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=600&auto=format&fit=crop&q=80',
    description: 'Heavy commercial overflow of vegetable packaging, wet food and plastic crates on road.',
    location: 'Usman Road, Near Ranganathan St, T. Nagar',
    ward: 'Ward 08',
    areaId: 'AREA-02',
    lat: 13.0422,
    lng: 80.2338,
  },
  {
    label: 'Single-Use Plastics near Bus Shelter',
    url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
    description: 'Plastic beverage bottles and discarded cups scattered around commuter waiting bay.',
    location: '2nd Avenue, Near Roundtana, Anna Nagar',
    ward: 'Ward 12',
    areaId: 'AREA-01',
    lat: 13.0864,
    lng: 80.2152,
  },
  {
    label: 'Biomedical & Broken Glass Hazard',
    url: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?w=600&auto=format&fit=crop&q=80',
    description: 'Hazardous clinic waste and broken glass vials exposed next to open storm drain.',
    location: 'Market Lane, East Tambaram',
    ward: 'Ward 22',
    areaId: 'AREA-09',
    lat: 12.9249,
    lng: 80.1481,
  },
  {
    label: 'Temple Street Organic Refuse',
    url: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=600&auto=format&fit=crop&q=80',
    description: 'Coconut husks, marigold garlands, and plantain leaves obstructing drainage mouth.',
    location: 'South Mada Street, Mylapore',
    ward: 'Ward 09',
    areaId: 'AREA-04',
    lat: 13.0338,
    lng: 80.2678,
  },
];

const AI_ANALYSIS_STEPS = [
  'Uploading image evidence',
  'Image received & pre-validated',
  'AI analysing image contours',
  'Detecting waste materials & density',
  'Calculating civic severity & public risk',
  'Calculating municipal priority score',
  'Classification completed',
];

export const RaiseComplaintModal: React.FC<RaiseComplaintModalProps> = ({ isOpen, onClose }) => {
  const { addComplaint, currentCitizen, language, areas } = useStore();

  // Primary workflow state
  // UPLOAD -> ANALYSING -> REVIEW (Citizen inspects & confirms AI result) -> SUCCESS
  const [stage, setStage] = useState<'UPLOAD' | 'ANALYSING' | 'REVIEW' | 'SUCCESS'>('UPLOAD');

  // Form Fields
  const [photoUrl, setPhotoUrl] = useState<string>(PRESET_SAMPLE_PHOTOS[0].url);
  const [photoFileName, setPhotoFileName] = useState<string>('market_waste_sample.jpg');
  const [description, setDescription] = useState(PRESET_SAMPLE_PHOTOS[0].description);
  const [address, setAddress] = useState(PRESET_SAMPLE_PHOTOS[0].location);
  const [ward, setWard] = useState(PRESET_SAMPLE_PHOTOS[0].ward);
  const [areaId, setAreaId] = useState(PRESET_SAMPLE_PHOTOS[0].areaId);
  const [lat, setLat] = useState(PRESET_SAMPLE_PHOTOS[0].lat);
  const [lng, setLng] = useState(PRESET_SAMPLE_PHOTOS[0].lng);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Progressive analysis state
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [createdComplaintId, setCreatedComplaintId] = useState<string | null>(null);

  // Manual override / correction mode for citizen
  const [isManualEditMode, setIsManualEditMode] = useState(false);
  const [editedWasteType, setEditedWasteType] = useState<WasteType>('Mixed Waste');
  const [editedQuantity, setEditedQuantity] = useState<WasteQuantity>('Medium');
  const [editedSeverity, setEditedSeverity] = useState<SeverityLevel>('Medium');
  const [editedPriority, setEditedPriority] = useState<PriorityLevel>('P2');
  const [aiUnavailableFallback, setAiUnavailableFallback] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: (typeof PRESET_SAMPLE_PHOTOS)[0]) => {
    setPhotoUrl(preset.url);
    setPhotoFileName(preset.label.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.jpg');
    setDescription(preset.description);
    setAddress(preset.location);
    setWard(preset.ward);
    setAreaId(preset.areaId);
    setLat(preset.lat);
    setLng(preset.lng);
    setValidationError(null);
  };

  const handleAutoGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(Number(pos.coords.latitude.toFixed(4)));
          setLng(Number(pos.coords.longitude.toFixed(4)));
          setAddress(`GPS Captured: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E (Verified)`);
        },
        () => {
          setLat(13.0422);
          setLng(80.2338);
          setAddress('Usman Road, T. Nagar, Chennai (GPS Default)');
        }
      );
    }
  };

  // Process selected file with validation & compression
  const processImageFile = async (file: File) => {
    setValidationError(null);

    // Validate size & format
    const qualityCheck = await AIImageClassificationService.validateImageQuality(file);
    if (!qualityCheck.isValid) {
      setValidationError(qualityCheck.errorMessage || 'Invalid image file.');
      return;
    }

    try {
      const compressedDataUrl = await AIImageClassificationService.compressImage(file);
      setPhotoUrl(compressedDataUrl);
      setPhotoFileName(file.name);
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotoUrl(e.target.result as string);
          setPhotoFileName(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Execute AI image analysis workflow with multi-step progression
  const runAIAnalysis = async () => {
    if (!photoUrl) {
      setValidationError('Please upload or select a garbage photograph first.');
      return;
    }

    setStage('ANALYSING');
    setCurrentAnalysisStep(0);
    setAiUnavailableFallback(false);

    // Progressive step simulation ticker
    const stepInterval = setInterval(() => {
      setCurrentAnalysisStep((prev) => (prev < AI_ANALYSIS_STEPS.length - 2 ? prev + 1 : prev));
    }, 280);

    try {
      const result = await AIImageClassificationService.classifyWasteImage({
        imageDataUrl: photoUrl,
        imageName: photoFileName,
        description,
        ward,
        address,
      });

      clearInterval(stepInterval);
      setCurrentAnalysisStep(AI_ANALYSIS_STEPS.length - 1);
      await new Promise((r) => setTimeout(r, 300));

      setAiResult(result);
      setEditedWasteType(result.wasteType);
      setEditedQuantity(result.quantity);
      setEditedSeverity(result.severity);
      setEditedPriority(result.priority);
      setStage('REVIEW');
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('AI Classification error:', err);
      // Fallback mode: allow manual entry
      setAiUnavailableFallback(true);
      setEditedWasteType('Mixed Waste');
      setEditedQuantity('Medium');
      setEditedSeverity('Medium');
      setEditedPriority('P2');
      setIsManualEditMode(true);
      setStage('REVIEW');
    }
  };

  // Confirm and save complaint to database
  const handleConfirmAndSubmitComplaint = () => {
    const finalResult: AIAnalysisResult = aiResult
      ? {
          ...aiResult,
          wasteType: isManualEditMode ? editedWasteType : aiResult.wasteType,
          quantity: isManualEditMode ? editedQuantity : aiResult.quantity,
          severity: isManualEditMode ? editedSeverity : aiResult.severity,
          priority: isManualEditMode ? editedPriority : aiResult.priority,
        }
      : {
          wasteType: editedWasteType,
          quantity: editedQuantity,
          severity: editedSeverity,
          healthRisk: editedSeverity,
          publicImpact: editedSeverity,
          priority: editedPriority,
          priorityReason: 'Citizen manually registered waste dispatch parameters.',
          confidenceScore: 70,
          detectedObjects: ['Solid waste accumulation'],
          analysedAt: new Date().toISOString(),
          isRealAI: false,
          modelName: 'Manual Citizen Entry',
        };

    const newCmp = addComplaint({
      citizenId: currentCitizen.id,
      citizenName: currentCitizen.name,
      citizenPhone: currentCitizen.phone,
      photoUrl,
      description: description || 'Civic garbage complaint reported with GPS verification.',
      location: {
        lat,
        lng,
        address,
        ward,
        areaId,
      },
      aiAnalysis: finalResult,
    });

    setCreatedComplaintId(newCmp.id);
    setStage('SUCCESS');
  };

  const handleResetAndClose = () => {
    setStage('UPLOAD');
    setAiResult(null);
    setCreatedComplaintId(null);
    setIsManualEditMode(false);
    setValidationError(null);
    onClose();
  };

  const confidenceInfo = aiResult ? AIImageClassificationService.getConfidenceLevel(aiResult.confidenceScore) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{language === 'ta' ? 'புதிய கழிவு புகார் பதிவு' : 'Register Municipal Waste Complaint'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Powered
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                {language === 'ta'
                  ? 'AI தானியங்கி பார்வை பகுப்பாய்வு மற்றும் GPS உடனடி முன்னுரிமை'
                  : 'Automated Computer Vision Classification & Priority Dispatch'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Validation Banner if any */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Image Validation Warning</p>
                <p className="mt-0.5">{validationError}</p>
              </div>
            </div>
          )}

          {/* STAGE 1: UPLOAD & INPUTS */}
          {stage === 'UPLOAD' && (
            <div className="space-y-5">
              {/* Image Upload Zone */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload Garbage Photograph (JPG, PNG, WEBP &lt; 10MB)</span>
                  </label>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-xs font-medium text-rose-600 hover:text-rose-700"
                    >
                      Clear image
                    </button>
                  )}
                </div>

                {/* Drag and Drop Container or Preview */}
                {photoUrl ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-900 group">
                    <img src={photoUrl} alt="Uploaded Waste" className="w-full h-48 object-cover opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3 justify-between">
                      <div className="text-white text-xs">
                        <span className="font-semibold block truncate max-w-xs">{photoFileName}</span>
                        <span className="text-[11px] text-emerald-300 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Validated & ready for AI vision analysis
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur text-white text-xs font-semibold transition flex items-center gap-1.5">
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Change Photo</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) processImageFile(f);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
                        : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Drag and drop your garbage photo here, or browse files
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Supports JPG, JPEG, PNG, WEBP up to 10MB</p>

                    <div className="mt-4 flex items-center justify-center gap-3">
                      <label className="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                        <UploadCloud className="w-4 h-4" />
                        <span>Browse Image</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) processImageFile(f);
                          }}
                        />
                      </label>

                      <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                        <Camera className="w-4 h-4" />
                        <span>Capture with Camera</span>
                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) processImageFile(f);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Preset Real World Samples */}
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                    Or select a municipal test photograph:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_SAMPLE_PHOTOS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2 rounded-lg text-left border transition text-xs flex flex-col gap-1.5 ${
                          photoUrl === preset.url
                            ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 font-bold text-emerald-950'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-14 object-cover rounded" />
                        <span className="truncate text-[11px]">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location & GPS */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Location Details & Ward Assignment</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoGPS}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Auto-Capture GPS</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Ward / Zone</label>
                    <select
                      value={ward}
                      onChange={(e) => {
                        setWard(e.target.value);
                        const match = areas.find((a) => a.wardNumber === e.target.value);
                        if (match) setAreaId(match.id);
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                    >
                      {areas.map((a) => (
                        <option key={a.id} value={a.wardNumber}>
                          {a.wardNumber} - {a.name} ({a.zone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">GPS Coordinates</label>
                    <div className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-mono flex items-center justify-between">
                      <span>{lat.toFixed(4)}° N, {lng.toFixed(4)}° E</span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        GPS Locked
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Street Address / Nearby Landmark
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                    placeholder="e.g. Near Ranganathan Street corner, Usman Road"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Citizen Observations / Notes (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Describe waste volume, nearby drainage, foul smell, medical sharps, or pedestrian hindrance..."
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={runAIAnalysis}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-600/20 flex items-center gap-2 transition active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Analyze Image with AI Vision</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: MULTI-STEP PROGRESSIVE AI PROCESSING */}
          {stage === 'ANALYSING' && (
            <div className="py-8 space-y-6 animate-in fade-in">
              <div className="text-center space-y-2">
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                  <Sparkles className="w-6 h-6 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-slate-900">AI Computer Vision in Progress</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Feeding image through Vision AI neural model to classify materials, evaluate health hazards, and determine dispatch urgency.
                </p>
              </div>

              {/* Step progression checklist */}
              <div className="max-w-md mx-auto bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                {AI_ANALYSIS_STEPS.map((stepLabel, idx) => {
                  const isDone = idx < currentAnalysisStep;
                  const isCurrent = idx === currentAnalysisStep;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 text-xs transition-all ${
                        isDone
                          ? 'text-emerald-700 font-semibold'
                          : isCurrent
                          ? 'text-slate-900 font-bold scale-[1.02]'
                          : 'text-slate-400'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-500 animate-pulse font-bold'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span>{stepLabel}</span>
                      {isCurrent && <span className="ml-auto text-[10px] text-emerald-600 animate-pulse">processing...</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STAGE 3: AI RESULT CARD & CITIZEN REVIEW */}
          {stage === 'REVIEW' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Fallback Banner if real AI was unreachable */}
              {aiUnavailableFallback && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">AI service temporarily unavailable</p>
                    <p className="mt-0.5">
                      You can still submit your complaint with manual classification below. Municipal field inspection will verify.
                    </p>
                  </div>
                </div>
              )}

              {/* Non-Waste Detected Warning Banner */}
              {aiResult && !aiResult.isWaste && (
                <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">No visible waste was detected in this image.</h4>
                      <p className="text-xs text-amber-800 mt-1">
                        {aiResult.explanation || 'The uploaded photograph appears to contain zero identifiable municipal solid waste, roadside dumping, or litter.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-amber-200">
                    <button
                      type="button"
                      onClick={() => setStage('UPLOAD')}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold transition"
                    >
                      Upload Correct Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsManualEditMode(true)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition"
                    >
                      Report Anyway (Manual Details)
                    </button>
                  </div>
                </div>
              )}

              {/* Poor Image Quality Warning */}
              {aiResult && aiResult.imageQuality === 'poor' && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Image Quality Notice</span>
                    <span>The uploaded image is too unclear for reliable classification. Administrative verification will be required upon submission.</span>
                  </div>
                </div>
              )}

              {/* AI Classification Summary Card */}
              {aiResult && (
                <div className="rounded-xl bg-slate-900 text-white border border-slate-800 overflow-hidden shadow-lg">
                  {/* Top Bar: Provider & Latency */}
                  <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-slate-200">
                        {aiResult.isRealAI ? 'Google Gemini Vision AI' : 'Demonstration Computer Vision'}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">({aiResult.modelName})</span>
                    </div>
                    {aiResult.analysisLatencyMs && (
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{aiResult.analysisLatencyMs} ms</span>
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Visual Preview with Bounding Boxes */}
                    <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 max-h-52 flex items-center justify-center">
                      <img src={photoUrl} alt="Inspection" className="w-full max-h-52 object-contain" />
                      {aiResult.detailedDetectedObjects &&
                        aiResult.detailedDetectedObjects
                          .filter((o) => o.box_2d && o.box_2d.length === 4)
                          .map((obj, i) => {
                            const [ymin, xmin, ymax, xmax] = obj.box_2d!;
                            return (
                              <div
                                key={i}
                                className="absolute border-2 border-emerald-400 bg-emerald-500/20 pointer-events-none rounded transition-all"
                                style={{
                                  top: `${ymin / 10}%`,
                                  left: `${xmin / 10}%`,
                                  height: `${(ymax - ymin) / 10}%`,
                                  width: `${(xmax - xmin) / 10}%`,
                                }}
                              >
                                <span className="absolute -top-4 left-0 bg-emerald-600 text-white text-[9px] font-mono px-1 py-0.5 rounded font-bold whitespace-nowrap shadow">
                                  {obj.name} ({obj.confidence}%)
                                </span>
                              </div>
                            );
                          })}
                    </div>

                    {/* Confidence Indicator */}
                    {confidenceInfo && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Confidence</span>
                          <span className="text-sm font-bold text-white flex items-center gap-1.5">
                            <span>{confidenceInfo.score}%</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                confidenceInfo.score >= 90
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : confidenceInfo.score >= 75
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                  : confidenceInfo.score >= 60
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              {confidenceInfo.level}
                            </span>
                          </span>
                        </div>

                        {/* Priority Comparison Pill */}
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Priority Level</span>
                          <span
                            className={`px-3 py-1 rounded-md text-xs font-extrabold uppercase font-mono shadow-sm ${
                              (isManualEditMode ? editedPriority : aiResult.priority) === 'P1'
                                ? 'bg-rose-600 text-white'
                                : (isManualEditMode ? editedPriority : aiResult.priority) === 'P2'
                                ? 'bg-amber-500 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {isManualEditMode ? editedPriority : aiResult.priority}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Multi-Label Waste Categories */}
                    {aiResult.detectedWaste && aiResult.detectedWaste.length > 0 && (
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 space-y-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                          Identified Waste Categories (Multi-Label):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {aiResult.detectedWaste.map((cat, idx) => (
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

                    {/* Priority Discrepancy Notice if any */}
                    {aiResult.priorityDifferenceNotice && !isManualEditMode && (
                      <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-700/50 text-amber-200 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">Priority Engine Notice:</span>
                          <span>{aiResult.priorityDifferenceNotice}</span>
                        </div>
                      </div>
                    )}

                    {/* Classification Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/40">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Waste Type</span>
                        <span className="font-bold text-slate-100 mt-0.5 block">
                          {isManualEditMode ? editedWasteType : aiResult.wasteType}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/40">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Quantity</span>
                        <span className="font-bold text-slate-100 mt-0.5 block">
                          {isManualEditMode ? editedQuantity : aiResult.quantity}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/40">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Severity</span>
                        <span className="font-bold text-amber-300 mt-0.5 block">
                          {isManualEditMode ? editedSeverity : aiResult.severity}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/40">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Health Risk</span>
                        <span className="font-bold text-rose-300 mt-0.5 block">{aiResult.healthRisk}</span>
                      </div>
                    </div>

                    {/* Detected Waste Objects */}
                    {aiResult.detailedDetectedObjects && aiResult.detailedDetectedObjects.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                          Computer Vision Detected Objects:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {aiResult.detailedDetectedObjects.map((obj, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                            >
                              <span>{obj.name}</span>
                              <span className="text-[10px] font-mono font-bold text-emerald-400">
                                {obj.confidence}%
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Priority Rationale */}
                    <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 text-xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        AI Operational Explanation:
                      </span>
                      <p className="text-slate-300 leading-relaxed">{aiResult.priorityReason}</p>
                    </div>

                    {/* Prominent Verification Notice */}
                    <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700/50 text-[11px] text-slate-300 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>AI-generated classification. Administrative verification may be required.</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold shrink-0">
                        {confidenceInfo ? `${confidenceInfo.score}% Confidence` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Correction Panel (if citizen toggles manual edit) */}
              {isManualEditMode && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Manual Classification Correction</span>
                    </span>
                    <span className="text-[11px] text-slate-500">Overrides will be recorded for audit</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Waste Type</label>
                      <select
                        value={editedWasteType}
                        onChange={(e) => setEditedWasteType(e.target.value as WasteType)}
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
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Quantity</label>
                      <select
                        value={editedQuantity}
                        onChange={(e) => setEditedQuantity(e.target.value as WasteQuantity)}
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
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Severity</label>
                      <select
                        value={editedSeverity}
                        onChange={(e) => setEditedSeverity(e.target.value as SeverityLevel)}
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
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Priority</label>
                      <select
                        value={editedPriority}
                        onChange={(e) => setEditedPriority(e.target.value as PriorityLevel)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      >
                        {VALID_PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Citizen Decision Action Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsManualEditMode(!isManualEditMode)}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isManualEditMode ? 'Close Manual Edit' : 'Manual Correction'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={runAIAnalysis}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-analyze Image</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStage('UPLOAD')}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
                  >
                    Back to Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAndSubmitComplaint}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-600/20 flex items-center gap-2 transition active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept & Register Complaint</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 4: SUCCESS CONFIRMATION */}
          {stage === 'SUCCESS' && (
            <div className="py-6 text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Municipal Complaint Registered</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your ticket has been dispatched to Tamil Nadu Smart Waste Command Center.
                </p>
                <div className="mt-3 inline-block px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-slate-800">
                  Ticket ID: {createdComplaintId}
                </div>
              </div>

              <div className="p-4 max-w-md mx-auto rounded-xl bg-emerald-50/70 border border-emerald-200 text-left text-xs space-y-1.5 text-emerald-950">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Assigned Ward:</span>
                  <span className="font-bold">{ward}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Classification:</span>
                  <span className="font-bold">{aiResult?.wasteType || editedWasteType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Municipal Priority:</span>
                  <span className="font-bold text-rose-600">
                    Priority {isManualEditMode ? editedPriority : aiResult?.priority}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition shadow"
                >
                  View My Complaint on Live Map & Tracker
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
