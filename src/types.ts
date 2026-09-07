export type UserRole = 'CITIZEN' | 'ADMIN';

export type Language = 'en' | 'ta';

export type WasteType =
  | 'Organic / Wet Waste'
  | 'Plastic'
  | 'Paper'
  | 'Glass'
  | 'Metal'
  | 'E-Waste'
  | 'Hazardous'
  | 'Construction Waste'
  | 'Mixed Waste'
  | 'Other';

export type WasteQuantity = 'Small' | 'Medium' | 'Large';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4'; // P1 Critical, P2 High, P3 Medium, P4 Low

export type ComplaintStatus =
  | 'Pending'
  | 'AI Analysed'
  | 'AI Review Required'
  | 'Assigned'
  | 'Worker Accepted'
  | 'On The Way'
  | 'Cleaning'
  | 'Proof Uploaded'
  | 'AI Verified'
  | 'Resolved';

export type WorkerStatus = 'AVAILABLE' | 'WORKING' | 'OFFLINE';

export type SmartBinStatus =
  | 'NORMAL'
  | 'WARNING'
  | 'COLLECTION_REQUIRED'
  | 'CRITICAL'
  | 'OVERFLOW';

export interface LocationCoords {
  lat: number;
  lng: number;
  address: string;
  ward: string;
  areaId: string;
}

export interface DetectedWasteObject {
  name: string;
  confidence: number;
  box_2d?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
}

export interface DetectedWasteCategory {
  type: string;
  objects: string[];
  confidence: number;
}

export interface AdminOverride {
  originalAIResult: {
    wasteType: WasteType;
    quantity: WasteQuantity;
    severity: SeverityLevel;
    healthRisk: SeverityLevel;
    publicImpact: SeverityLevel;
    priority: PriorityLevel;
  };
  finalAdminResult: {
    wasteType: WasteType;
    quantity: WasteQuantity;
    severity: SeverityLevel;
    healthRisk: SeverityLevel;
    publicImpact: SeverityLevel;
    priority: PriorityLevel;
  };
  changedBy: string;
  changedAt: string;
  reason: string;
}

export interface AIAnalysisResult {
  id?: string;
  complaintId?: string;
  isWaste?: boolean;
  imageQuality?: 'good' | 'fair' | 'poor';
  wasteType: WasteType; // primary or overall category
  overallWasteType?: string;
  detectedWaste?: DetectedWasteCategory[]; // multi-label categories
  quantity: WasteQuantity;
  estimatedQuantity?: WasteQuantity;
  accumulationLevel?: number; // 0 to 100 percentage
  severity: SeverityLevel;
  healthRisk: SeverityLevel;
  publicImpact: SeverityLevel;
  priority: PriorityLevel; // deterministic active priority
  aiRecommendedPriority?: PriorityLevel;
  systemCalculatedPriority?: PriorityLevel;
  priorityScore?: number; // 0 to 100 normalized score
  priorityBreakdown?: {
    severityScore: number;
    healthRiskScore: number;
    publicImpactScore: number;
    quantityScore: number;
    additionalPoints?: number;
    hazardousBonus?: number;
    overflowBonus?: number;
    roadObstructionBonus?: number;
    hotspotBonus?: number;
    totalRawScore: number;
    normalizedScore: number;
  };
  priorityDifferenceNotice?: string;
  priorityReason: string;
  confidenceScore: number; // overall AI confidence (0 - 100)
  detectedObjects: string[];
  detailedDetectedObjects?: DetectedWasteObject[];
  isHazardous?: boolean;
  isMedicalWaste?: boolean;
  isOverflowing?: boolean;
  isRoadObstruction?: boolean;
  requiresManualReview?: boolean;
  manualReviewReason?: string;
  explanation?: string;
  analysedAt: string;
  modelName?: string;
  provider?: string;
  isRealAI?: boolean;
  analysisLatencyMs?: number;
  analysisStatus?: 'processing' | 'completed' | 'failed' | 'manual_review';
  adminOverride?: AdminOverride;
}

export interface AIFeedbackRecord {
  id: string;
  complaintId: string;
  imageUrl?: string;
  aiObservation: {
    wasteType: string;
    detectedCategories: string[];
    confidence: number;
    quantity: string;
    severity: string;
    priority: string;
  };
  adminCorrection: {
    wasteType: WasteType;
    quantity: WasteQuantity;
    severity: SeverityLevel;
    healthRisk: SeverityLevel;
    publicImpact: SeverityLevel;
    priority: PriorityLevel;
    reason: string;
    changedBy: string;
  };
  timestamp: string;
  status: 'LOGGED' | 'INCORPORATED';
}

export interface AITestCase {
  id: string;
  title: string;
  expectedCategory: WasteType | 'No Waste Detected';
  imageUrl: string;
  expectedMultiCategories?: string[];
  expectedQuantity?: WasteQuantity;
  expectedSeverity?: SeverityLevel;
  expectedHealthRisk?: SeverityLevel;
  isNonWaste?: boolean;
  notes: string;
}

export interface AICleaningVerificationResult {
  verified: boolean;
  confidence: number;
  beforeCondition?: string;
  afterCondition?: string;
  remainingWaste?: string;
  explanation?: string;
  cleanlinessScore: number;
  notes: string;
  verifiedAt: string;
  isRealAI?: boolean;
  modelName?: string;
}

export interface Complaint {
  id: string; // e.g. "CMP-2026-0842"
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  photoUrl: string;
  location: LocationCoords;
  description: string;
  createdAt: string;
  status: ComplaintStatus;
  aiAnalysis?: AIAnalysisResult;
  adminOverride?: AdminOverride;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  assignedAt?: string;
  cleaningStartedAt?: string;
  afterPhotoUrl?: string;
  aiVerification?: AICleaningVerificationResult;
  resolvedAt?: string;
  feedback?: {
    rating: number; // 1-5
    comment: string;
    submittedAt: string;
  };
  timeline: {
    status: ComplaintStatus;
    timestamp: string;
    note: string;
    updatedBy: string;
  }[];
}

export interface Worker {
  id: string; // e.g. "WRK-104"
  name: string;
  phone: string;
  avatarUrl: string;
  assignedWard: string;
  assignedAreas: string[];
  joiningDate: string;
  status: WorkerStatus;
  currentLat: number;
  currentLng: number;
  attendance: {
    workingDays: number;
    absentDays: number;
    percentage: number;
    todayPresent: boolean;
  };
  tasks: {
    assigned: number;
    completed: number;
    pending: number;
    avgCompletionTimeHours: number;
  };
  ratings: {
    averageRating: number;
    totalReviews: number;
  };
  performanceScore: number; // 0 - 100
  aiVerificationRate: number; // %
  salary: number; // in INR
  currentMonthBonus: number;
  bonusRecommendation?: {
    recommendedAmount: number;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Modified';
    approvedAmount?: number;
  };
  salaryIncrementRecommendation?: {
    recommendedPercentage: number;
    currentSalary: number;
    projectedSalary: number;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    approvedPercentage?: number;
  };
}

export interface SmartBin {
  id: string; // e.g. "BIN-1042"
  name: string;
  ward: string;
  areaId: string;
  location: LocationCoords;
  heightCm: number; // e.g. 100cm
  currentMeasuredDistanceCm: number; // e.g. 6cm -> 94% fill
  fillPercentage: number; // calculated: (height - measured) / height * 100
  status: SmartBinStatus;
  lastCollectionAt: string;
  lastUpdatedAt: string;
  batteryLevel: number; // %
  signalStrength: 'Strong' | 'Medium' | 'Low';
  growthRatePerHour: number; // e.g. 4.2% per hr
  predictedOverflowHours: number; // e.g. 2.4 hrs
  assignedWorkerId?: string;
  collectionHistory: {
    id: string;
    collectedAt: string;
    workerId: string;
    workerName: string;
    fillBeforeCollection: number;
    fillAfterCollection: number;
  }[];
}

export interface Hotspot {
  id: string;
  name: string;
  ward: string;
  areaId: string;
  lat: number;
  lng: number;
  complaintCount: number;
  frequency: 'High' | 'Medium' | 'Critical';
  mainWasteType: WasteType;
  riskLevel: SeverityLevel;
  recurringPattern: string; // e.g. "Mon, Wed, Fri & Sun mornings"
  recommendation: string;
  lastCleanedAt: string;
  areaName?: string;
  predominantWasteType?: string;
  timePattern?: string;
  probableCause?: string;
}

export interface AreaWard {
  id: string;
  name: string;
  wardNumber: string;
  zone: 'North' | 'South' | 'Central' | 'East' | 'West';
  population: number;
  assignedWorkersCount: number;
  smartBinsCount: number;
  cleaningFrequencyPerDay: number;
  previousMonthComplaints: number;
  currentMonthComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  percentageChange: number;
  status: 'Improving' | 'Critical' | 'Stable';
  avgResolutionTimeHours: number;
  hotspotsCount: number;
}

export interface Vehicle {
  id: string; // e.g. "TN-01-WM-4821"
  registrationNumber: string;
  type: 'Mini Compactor Truck' | 'Electric Tipper Auto' | 'Heavy Waste Compactor' | 'Tractor Trolley';
  driverName: string;
  driverPhone: string;
  assignedWard: string;
  ward: string;
  status: 'Available' | 'On Route' | 'Maintenance' | 'Inactive' | 'Active' | 'Due for Service';
  currentLat: number;
  currentLng: number;
  capacityTons: number;
  fuelLevelPercent: number;
  fuelConsumptionLitres: number;
  fuelConsumedLiters: number;
  fuelType: 'Diesel' | 'Electric' | 'CNG';
  currentMonthTrips: number;
  totalDistanceKm: number;
  maintenanceCost: number;
  repairCost: number;
  lastServicedAt: string;
}

export interface CleaningExpense {
  month: string;
  year: number;
  workerSalary: number;
  overtime: number;
  cleaningMaterials: number;
  bags: number;
  glovesAndPPE: number;
  equipment: number;
  other: number;
  total: number;
}

export interface VehicleExpense {
  month: string;
  year: number;
  fuel: number;
  maintenance: number;
  repairs: number;
  insuranceAndTaxes: number;
  other: number;
  total: number;
}

export interface AIInsight {
  id: string;
  category: 'Complaints' | 'Area' | 'Worker' | 'Vehicles' | 'SmartBins' | 'Prediction';
  finding: string;
  evidence: string;
  impact: 'High' | 'Medium' | 'Positive' | 'Critical';
  recommendation: string;
  generatedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'complaint' | 'smartbin' | 'worker' | 'hotspot' | 'expense' | 'alert';
  severity: SeverityLevel;
  read: boolean;
  targetRole: 'ALL' | 'ADMIN' | 'CITIZEN';
  relatedEntityId?: string;
}

export interface AppState {
  currentUserRole: UserRole;
  currentLanguage: Language;
  currentCitizen: {
    id: string;
    name: string;
    phone: string;
    ward: string;
  };
  complaints: Complaint[];
  workers: Worker[];
  smartBins: SmartBin[];
  hotspots: Hotspot[];
  areas: AreaWard[];
  vehicles: Vehicle[];
  cleaningExpenses: CleaningExpense[];
  vehicleExpenses: VehicleExpense[];
  aiInsights: AIInsight[];
  notifications: NotificationItem[];
}
