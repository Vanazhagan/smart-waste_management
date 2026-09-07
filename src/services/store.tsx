import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AreaWard,
  Complaint,
  ComplaintStatus,
  Hotspot,
  Language,
  NotificationItem,
  SmartBin,
  UserRole,
  Vehicle,
  Worker,
  CleaningExpense,
  VehicleExpense,
  AIInsight,
  AICleaningVerificationResult,
  WasteType,
  WasteQuantity,
  SeverityLevel,
  PriorityLevel,
} from '../types';
import {
  INITIAL_AREAS,
  INITIAL_CLEANING_EXPENSES,
  INITIAL_COMPLAINTS,
  INITIAL_HOTSPOTS,
  INITIAL_AI_INSIGHTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SMART_BINS,
  INITIAL_VEHICLES,
  INITIAL_VEHICLE_EXPENSES,
  INITIAL_WORKERS,
} from '../data/mockData';
import { IoTService } from './iotService';
import { AIImageClassificationService } from './aiImageClassificationService';

interface StoreContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeView: string;
  setActiveView: (view: string) => void;
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
  addComplaint: (newComplaint: Omit<Complaint, 'id' | 'createdAt' | 'status' | 'timeline'> & Partial<Complaint>) => Complaint;
  assignWorkerToComplaint: (complaintId: string, workerId: string) => void;
  updateComplaintStatus: (complaintId: string, status: ComplaintStatus, note?: string) => void;
  submitCleaningProof: (complaintId: string, afterPhotoUrl: string, cleanlinessScore?: number, aiVerificationData?: AICleaningVerificationResult) => Promise<void>;
  submitCitizenFeedback: (complaintId: string, rating: number, comment: string) => void;
  adminOverrideComplaintAI: (
    complaintId: string,
    override: {
      wasteType: WasteType;
      quantity: WasteQuantity;
      severity: SeverityLevel;
      healthRisk: SeverityLevel;
      publicImpact: SeverityLevel;
      priority: PriorityLevel;
      reason: string;
      adminName?: string;
    }
  ) => void;
  reanalyzeComplaintWithAI: (complaintId: string) => Promise<void>;
  collectSmartBin: (binId: string, workerId?: string) => void;
  simulateBinSensorUpdate: (binId: string, measuredDistanceCm: number) => void;
  approveWorkerBonus: (workerId: string, amount: number) => void;
  approveSalaryIncrement: (workerId: string, percentage: number) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetToSeedData: () => void;
  runEndToEndDemo: () => Promise<void>;
  isDemoRunning: boolean;
  demoStepMessage: string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = 'TN_MUNICIPAL_WASTE_STORE_V1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('ADMIN');
  const [language, setLanguageState] = useState<Language>('en');
  const [activeView, setActiveView] = useState<string>('dashboard');

  const [currentCitizen] = useState({
    id: 'CIT-771',
    name: 'M. Senthil Nathan',
    phone: '+91 98401 23456',
    ward: 'Ward 08',
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_complaints`);
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_workers`);
    return saved ? JSON.parse(saved) : INITIAL_WORKERS;
  });

  const [smartBins, setSmartBins] = useState<SmartBin[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_smartbins`);
    return saved ? JSON.parse(saved) : INITIAL_SMART_BINS;
  });

  const [hotspots, setHotspots] = useState<Hotspot[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_hotspots`);
    if (!saved) return INITIAL_HOTSPOTS;
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_HOTSPOTS;
      return parsed.map((h: any, idx: number) => {
        const fallback = INITIAL_HOTSPOTS[idx % INITIAL_HOTSPOTS.length];
        return {
          ...fallback,
          ...h,
          areaName: h.areaName || h.name || fallback.areaName,
          predominantWasteType: h.predominantWasteType || h.mainWasteType || fallback.predominantWasteType,
          timePattern: h.timePattern || h.recurringPattern || fallback.timePattern,
          probableCause: h.probableCause || fallback.probableCause,
          lat: typeof h.lat === 'number' && !isNaN(h.lat) ? h.lat : fallback.lat,
          lng: typeof h.lng === 'number' && !isNaN(h.lng) ? h.lng : fallback.lng,
        };
      });
    } catch {
      return INITIAL_HOTSPOTS;
    }
  });

  const [areas, setAreas] = useState<AreaWard[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_areas`);
    return saved ? JSON.parse(saved) : INITIAL_AREAS;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_vehicles`);
    if (!saved) return INITIAL_VEHICLES;
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_VEHICLES;
      return parsed.map((v: any, idx: number) => {
        const fallback = INITIAL_VEHICLES[idx % INITIAL_VEHICLES.length];
        return {
          ...fallback,
          ...v,
          registrationNumber: v.registrationNumber || v.id || fallback.registrationNumber,
          ward: v.ward || v.assignedWard || fallback.ward,
          currentLat: typeof v.currentLat === 'number' && !isNaN(v.currentLat) ? v.currentLat : fallback.currentLat,
          currentLng: typeof v.currentLng === 'number' && !isNaN(v.currentLng) ? v.currentLng : fallback.currentLng,
          capacityTons: typeof v.capacityTons === 'number' ? v.capacityTons : fallback.capacityTons,
          fuelLevelPercent: typeof v.fuelLevelPercent === 'number' ? v.fuelLevelPercent : fallback.fuelLevelPercent,
          fuelConsumedLiters: typeof v.fuelConsumedLiters === 'number' ? v.fuelConsumedLiters : fallback.fuelConsumedLiters,
        };
      });
    } catch {
      return INITIAL_VEHICLES;
    }
  });

  const [cleaningExpenses, setCleaningExpenses] = useState<CleaningExpense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_cleanexp`);
    return saved ? JSON.parse(saved) : INITIAL_CLEANING_EXPENSES;
  });

  const [vehicleExpenses, setVehicleExpenses] = useState<VehicleExpense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_vehexp`);
    return saved ? JSON.parse(saved) : INITIAL_VEHICLE_EXPENSES;
  });

  const [aiInsights, setAiInsights] = useState<AIInsight[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_insights`);
    return saved ? JSON.parse(saved) : INITIAL_AI_INSIGHTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifs`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoStepMessage, setDemoStepMessage] = useState('');

  // Persist state updates
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_complaints`, JSON.stringify(complaints));
      localStorage.setItem(`${STORAGE_KEY}_workers`, JSON.stringify(workers));
      localStorage.setItem(`${STORAGE_KEY}_smartbins`, JSON.stringify(smartBins));
      localStorage.setItem(`${STORAGE_KEY}_hotspots`, JSON.stringify(hotspots));
      localStorage.setItem(`${STORAGE_KEY}_areas`, JSON.stringify(areas));
      localStorage.setItem(`${STORAGE_KEY}_vehicles`, JSON.stringify(vehicles));
      localStorage.setItem(`${STORAGE_KEY}_cleanexp`, JSON.stringify(cleaningExpenses));
      localStorage.setItem(`${STORAGE_KEY}_vehexp`, JSON.stringify(vehicleExpenses));
      localStorage.setItem(`${STORAGE_KEY}_insights`, JSON.stringify(aiInsights));
      localStorage.setItem(`${STORAGE_KEY}_notifs`, JSON.stringify(notifications));
    } catch {
      // ignore storage quota errors in sandbox
    }
  }, [complaints, workers, smartBins, hotspots, areas, vehicles, cleaningExpenses, vehicleExpenses, aiInsights, notifications]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    setActiveView('dashboard');
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const addComplaint = (data: Omit<Complaint, 'id' | 'createdAt' | 'status' | 'timeline'> & Partial<Complaint>): Complaint => {
    const id = `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const initialStatus: ComplaintStatus = data.status || (
      data.aiAnalysis?.requiresManualReview || (data.aiAnalysis && data.aiAnalysis.confidenceScore < 60)
        ? 'AI Review Required'
        : (data.aiAnalysis ? 'AI Analysed' : 'Pending')
    );

    const newComplaint: Complaint = {
      id,
      citizenId: data.citizenId || currentCitizen.id,
      citizenName: data.citizenName || currentCitizen.name,
      citizenPhone: data.citizenPhone || currentCitizen.phone,
      photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=600&auto=format&fit=crop&q=80',
      location: data.location,
      description: data.description || 'Public waste accumulation reported.',
      createdAt: now,
      status: initialStatus,
      aiAnalysis: data.aiAnalysis,
      timeline: [
        {
          status: 'Pending',
          timestamp: now,
          note: 'Complaint registered via citizen portal with GPS verification.',
          updatedBy: 'Citizen',
        },
        ...(data.aiAnalysis
          ? [
              {
                status: initialStatus,
                timestamp: now,
                note: initialStatus === 'AI Review Required'
                  ? `AI flagged classification for manual administrative review: ${data.aiAnalysis.manualReviewReason || 'Confidence under 60% or image ambiguity'}.`
                  : `AI classified as ${data.aiAnalysis.wasteType} (${data.aiAnalysis.priority} - ${data.aiAnalysis.severity} severity).`,
                updatedBy: 'AI Engine',
              },
            ]
          : []),
      ],
    };

    setComplaints((prev) => [newComplaint, ...prev]);

    // Add notification for Admin
    const priority = data.aiAnalysis?.priority || 'P2';
    const isManualReview = initialStatus === 'AI Review Required';
    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: isManualReview
        ? `⚠️ AI Review Required: Complaint ${id}`
        : `${priority === 'P1' ? 'CRITICAL: ' : ''}New Complaint ${id} (${priority})`,
      message: isManualReview
        ? `Image analysis flagged for manual verification at ${data.location.address}.`
        : `${data.aiAnalysis?.wasteType || 'Waste'} reported at ${data.location.address}. AI Priority: ${priority}.`,
      timestamp: now,
      type: 'complaint',
      severity: priority === 'P1' ? 'Critical' : isManualReview ? 'High' : priority === 'P2' ? 'High' : 'Medium',
      read: false,
      targetRole: 'ALL',
      relatedEntityId: id,
    };
    setNotifications((prev) => [notif, ...prev]);

    // Update Area count
    setAreas((prev) =>
      prev.map((a) =>
        a.id === data.location.areaId || a.wardNumber === data.location.ward
          ? {
              ...a,
              currentMonthComplaints: a.currentMonthComplaints + 1,
              pendingComplaints: a.pendingComplaints + 1,
            }
          : a
      )
    );

    return newComplaint;
  };

  const assignWorkerToComplaint = (complaintId: string, workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return;

    const now = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        return {
          ...c,
          status: 'Assigned',
          assignedWorkerId: worker.id,
          assignedWorkerName: worker.name,
          assignedAt: now,
          timeline: [
            ...c.timeline,
            {
              status: 'Assigned',
              timestamp: now,
              note: `Assigned to ${worker.name} (${worker.phone}) by Municipal Dispatch.`,
              updatedBy: 'Municipal Admin',
            },
          ],
        };
      })
    );

    // Update worker task count & status
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== workerId) return w;
        return {
          ...w,
          status: 'WORKING',
          tasks: {
            ...w.tasks,
            assigned: w.tasks.assigned + 1,
            pending: w.tasks.pending + 1,
          },
        };
      })
    );

    // Notification to citizen
    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: `Worker Assigned for ${complaintId}`,
      message: `Sanitary personnel ${worker.name} has been assigned to your complaint.`,
      timestamp: now,
      type: 'worker',
      severity: 'Medium',
      read: false,
      targetRole: 'CITIZEN',
      relatedEntityId: complaintId,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const updateComplaintStatus = (complaintId: string, status: ComplaintStatus, note?: string) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        return {
          ...c,
          status,
          timeline: [
            ...c.timeline,
            {
              status,
              timestamp: now,
              note: note || `Status transitioned to ${status}`,
              updatedBy: role === 'ADMIN' ? 'Admin' : 'System',
            },
          ],
        };
      })
    );
  };

  const submitCleaningProof = async (
    complaintId: string,
    afterPhotoUrl: string,
    cleanlinessScore = 96,
    aiVerificationData?: AICleaningVerificationResult
  ) => {
    const now = new Date().toISOString();
    const complaint = complaints.find((c) => c.id === complaintId);
    if (!complaint) return;

    // Determine verification status
    const verified = aiVerificationData ? aiVerificationData.verified : cleanlinessScore >= 85;
    const finalScore = aiVerificationData ? aiVerificationData.cleanlinessScore : cleanlinessScore;
    const finalNotes =
      aiVerificationData?.explanation ||
      aiVerificationData?.notes ||
      (verified
        ? 'AI optical verification confirmed: Original waste pile cleared. Ground disinfected with zero remaining debris.'
        : 'Cleaning verification failed: Additional cleaning required.');

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        return {
          ...c,
          status: verified ? 'Resolved' : 'Cleaning',
          afterPhotoUrl,
          cleaningStartedAt: c.cleaningStartedAt || now,
          aiVerification: aiVerificationData || {
            verified,
            confidence: 94.8,
            notes: finalNotes,
            beforeCondition: 'Dense waste accumulation in original report photo.',
            afterCondition: 'Ground cleared and site disinfected.',
            remainingWaste: 'None',
            explanation: finalNotes,
            cleanlinessScore: finalScore,
            verifiedAt: now,
          },
          resolvedAt: verified ? now : undefined,
          timeline: [
            ...c.timeline,
            {
              status: 'Proof Uploaded',
              timestamp: now,
              note: 'Worker uploaded post-cleaning site photograph.',
              updatedBy: 'Worker',
            },
            {
              status: verified ? 'AI Verified' : 'Cleaning',
              timestamp: now,
              note: verified
                ? `AI optical verification PASSED (${finalScore}% cleanliness score). Model: ${aiVerificationData?.modelName || 'Vision AI'}`
                : `AI optical verification flagged incomplete debris removal (${finalScore}% score).`,
              updatedBy: 'AI Engine',
            },
            ...(verified
              ? [
                  {
                    status: 'Resolved' as ComplaintStatus,
                    timestamp: now,
                    note: 'Complaint successfully resolved and closed.',
                    updatedBy: 'System',
                  },
                ]
              : []),
          ],
        };
      })
    );

    if (verified && complaint.assignedWorkerId) {
      setWorkers((prev) =>
        prev.map((w) => {
          if (w.id !== complaint.assignedWorkerId) return w;
          const completed = w.tasks.completed + 1;
          const pending = Math.max(0, w.tasks.pending - 1);
          return {
            ...w,
            status: pending === 0 ? 'AVAILABLE' : 'WORKING',
            tasks: {
              ...w.tasks,
              completed,
              pending,
            },
            performanceScore: Math.min(99, w.performanceScore + 1),
          };
        })
      );

      // Update Area Ward statistics
      setAreas((prev) =>
        prev.map((a) =>
          a.id === complaint.location.areaId || a.wardNumber === complaint.location.ward
            ? {
                ...a,
                resolvedComplaints: a.resolvedComplaints + 1,
                pendingComplaints: Math.max(0, a.pendingComplaints - 1),
              }
            : a
        )
      );

      // Notification to Citizen
      const notif: NotificationItem = {
        id: `NOTIF-${Date.now()}`,
        title: `Complaint ${complaintId} Resolved!`,
        message: 'Your garbage complaint has been cleared and verified by AI. Please share your feedback.',
        timestamp: now,
        type: 'complaint',
        severity: 'Medium',
        read: false,
        targetRole: 'CITIZEN',
        relatedEntityId: complaintId,
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const adminOverrideComplaintAI = (
    complaintId: string,
    override: {
      wasteType: WasteType;
      quantity: WasteQuantity;
      severity: SeverityLevel;
      healthRisk: SeverityLevel;
      publicImpact: SeverityLevel;
      priority: PriorityLevel;
      reason: string;
      adminName?: string;
    }
  ) => {
    const now = new Date().toISOString();
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;

        const originalAI = c.aiAnalysis
          ? {
              wasteType: c.aiAnalysis.wasteType,
              quantity: c.aiAnalysis.quantity,
              severity: c.aiAnalysis.severity,
              healthRisk: c.aiAnalysis.healthRisk,
              publicImpact: c.aiAnalysis.publicImpact,
              priority: c.aiAnalysis.priority,
            }
          : {
              wasteType: override.wasteType,
              quantity: override.quantity,
              severity: override.severity,
              healthRisk: override.healthRisk,
              publicImpact: override.publicImpact,
              priority: override.priority,
            };

        const adminOverrideRecord = {
          originalAIResult: originalAI,
          finalAdminResult: {
            wasteType: override.wasteType,
            quantity: override.quantity,
            severity: override.severity,
            healthRisk: override.healthRisk,
            publicImpact: override.publicImpact,
            priority: override.priority,
          },
          changedBy: override.adminName || 'Municipal Admin',
          changedAt: now,
          reason: override.reason,
        };

        const updatedAiAnalysis = c.aiAnalysis
          ? {
              ...c.aiAnalysis,
              wasteType: override.wasteType,
              quantity: override.quantity,
              severity: override.severity,
              healthRisk: override.healthRisk,
              publicImpact: override.publicImpact,
              priority: override.priority,
              adminOverride: adminOverrideRecord,
            }
          : undefined;

        // Log to persistent AI feedback loop for administrative audit
        AIImageClassificationService.logAdminCorrection({
          complaintId,
          imageUrl: c.photoUrl,
          aiObservation: {
            wasteType: originalAI.wasteType,
            detectedCategories: c.aiAnalysis?.detectedWaste?.map((d) => d.type) || [originalAI.wasteType],
            confidence: c.aiAnalysis?.confidenceScore || 0,
            quantity: originalAI.quantity,
            severity: originalAI.severity,
            priority: originalAI.priority,
          },
          adminCorrection: {
            wasteType: override.wasteType,
            quantity: override.quantity,
            severity: override.severity,
            healthRisk: override.healthRisk,
            publicImpact: override.publicImpact,
            priority: override.priority,
            reason: override.reason,
            changedBy: override.adminName || 'Municipal Admin',
          },
        });

        const newStatus: ComplaintStatus = c.status === 'AI Review Required' ? 'AI Analysed' : c.status;

        return {
          ...c,
          wasteType: override.wasteType,
          status: newStatus,
          aiAnalysis: updatedAiAnalysis,
          adminOverride: adminOverrideRecord,
          timeline: [
            ...c.timeline,
            {
              status: newStatus,
              timestamp: now,
              note: `Admin Manual Override: Changed to ${override.wasteType}, ${override.priority}, ${override.severity} severity. Reason: "${override.reason}"`,
              updatedBy: override.adminName || 'Municipal Admin',
            },
          ],
        };
      })
    );
  };

  const reanalyzeComplaintWithAI = async (complaintId: string) => {
    const complaint = complaints.find((c) => c.id === complaintId);
    if (!complaint) return;

    try {
      const freshResult = await AIImageClassificationService.classifyWasteImage({
        imageDataUrl: complaint.photoUrl,
        description: complaint.description,
        ward: complaint.location.ward,
        address: complaint.location.address,
      });

      const now = new Date().toISOString();
      setComplaints((prev) =>
        prev.map((c) => {
          if (c.id !== complaintId) return c;
          return {
            ...c,
            aiAnalysis: freshResult,
            timeline: [
              ...c.timeline,
              {
                status: c.status,
                timestamp: now,
                note: `AI Re-analysis: Class: ${freshResult.wasteType}, Priority: ${freshResult.priority} (${freshResult.confidenceScore}% conf). Model: ${freshResult.modelName || 'Vision AI'}.`,
                updatedBy: 'AI Engine',
              },
            ],
          };
        })
      );
    } catch (err) {
      console.error('Failed to re-analyze complaint with AI:', err);
    }
  };

  const submitCitizenFeedback = (complaintId: string, rating: number, comment: string) => {
    const now = new Date().toISOString();
    const complaint = complaints.find((c) => c.id === complaintId);

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        return {
          ...c,
          feedback: {
            rating,
            comment,
            submittedAt: now,
          },
        };
      })
    );

    if (complaint?.assignedWorkerId) {
      setWorkers((prev) =>
        prev.map((w) => {
          if (w.id !== complaint.assignedWorkerId) return w;
          const totalReviews = w.ratings.totalReviews + 1;
          const newAvg = Number(((w.ratings.averageRating * w.ratings.totalReviews + rating) / totalReviews).toFixed(1));
          return {
            ...w,
            ratings: {
              averageRating: newAvg,
              totalReviews,
            },
            performanceScore: rating === 5 ? Math.min(100, w.performanceScore + 1) : w.performanceScore,
          };
        })
      );
    }
  };

  const collectSmartBin = (binId: string, workerId = 'WRK-101') => {
    const worker = workers.find((w) => w.id === workerId) || workers[0];
    setSmartBins((prev) =>
      prev.map((b) => {
        if (b.id !== binId) return b;
        return IoTService.recordCollection(b, worker.id, worker.name);
      })
    );

    // Update worker task count
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== worker.id) return w;
        return {
          ...w,
          tasks: {
            ...w.tasks,
            completed: w.tasks.completed + 1,
          },
          performanceScore: Math.min(100, w.performanceScore + 1),
        };
      })
    );

    // Notification
    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: `Smart Bin ${binId} Collected`,
      message: `${binId} evacuated by ${worker.name}. Fill level normalized to 15%.`,
      timestamp: new Date().toISOString(),
      type: 'smartbin',
      severity: 'Medium',
      read: false,
      targetRole: 'ADMIN',
      relatedEntityId: binId,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const simulateBinSensorUpdate = (binId: string, measuredDistanceCm: number) => {
    setSmartBins((prev) =>
      prev.map((b) => {
        if (b.id !== binId) return b;
        return IoTService.processTelemetry(b, {
          bin_id: binId,
          measured_distance_cm: measuredDistanceCm,
          timestamp: new Date().toISOString(),
        });
      })
    );
  };

  const approveWorkerBonus = (workerId: string, amount: number) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== workerId) return w;
        return {
          ...w,
          currentMonthBonus: amount,
          bonusRecommendation: w.bonusRecommendation
            ? {
                ...w.bonusRecommendation,
                status: 'Approved',
                approvedAmount: amount,
              }
            : undefined,
        };
      })
    );
  };

  const approveSalaryIncrement = (workerId: string, percentage: number) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== workerId) return w;
        const newSalary = Math.round(w.salary * (1 + percentage / 100));
        return {
          ...w,
          salary: newSalary,
          salaryIncrementRecommendation: w.salaryIncrementRecommendation
            ? {
                ...w.salaryIncrementRecommendation,
                status: 'Approved',
                approvedPercentage: percentage,
              }
            : undefined,
        };
      })
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetToSeedData = () => {
    setComplaints(INITIAL_COMPLAINTS);
    setWorkers(INITIAL_WORKERS);
    setSmartBins(INITIAL_SMART_BINS);
    setHotspots(INITIAL_HOTSPOTS);
    setAreas(INITIAL_AREAS);
    setVehicles(INITIAL_VEHICLES);
    setCleaningExpenses(INITIAL_CLEANING_EXPENSES);
    setVehicleExpenses(INITIAL_VEHICLE_EXPENSES);
    setAiInsights(INITIAL_AI_INSIGHTS);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  /**
   * Complete End-to-End Automated Demonstration Scenario as outlined in Section 45 & 46 of instructions:
   * 1. Citizen registers photo complaint
   * 2. GPS location captured
   * 3. AI classifies as Mixed Waste, Large, P1 Critical
   * 4. Admin notified
   * 5. System recommends Ravi (1.2 km, Available, Low workload)
   * 6. Admin assigns Ravi
   * 7. Route generated
   * 8. Cleaning completed & after photo uploaded
   * 9. AI verification 94.8% confirmed
   * 10. Resolved & 5-star citizen rating submitted!
   */
  const runEndToEndDemo = async () => {
    if (isDemoRunning) return;
    setIsDemoRunning(true);

    try {
      setDemoStepMessage('Step 1/8: Citizen uploading high-resolution garbage photograph with GPS pin...');
      await new Promise((r) => setTimeout(r, 1200));

      const newCmp = addComplaint({
        citizenId: 'CIT-901',
        citizenName: 'P. Murugesan (Citizen)',
        citizenPhone: '+91 98409 88123',
        photoUrl: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=600&auto=format&fit=crop&q=80',
        location: {
          lat: 13.0422,
          lng: 80.2338,
          address: 'Panagal Park Circle, Usman Road, T. Nagar (Ward 08)',
          ward: 'Ward 08',
          areaId: 'AREA-02',
        },
        description: 'Urgent: Commercial waste sacks overflowed onto roadway blocking vehicular lane.',
        aiAnalysis: {
          wasteType: 'Mixed Waste',
          quantity: 'Large',
          severity: 'High',
          healthRisk: 'High',
          publicImpact: 'High',
          priority: 'P1',
          priorityReason: 'Large volume mixed commercial waste obstructing high-density pedestrian thoroughfare with severe health risk.',
          confidenceScore: 96.2,
          detectedObjects: ['poly sacks', 'perishable vegetable waste', 'cartons', 'drain blockage'],
          analysedAt: new Date().toISOString(),
        },
      });

      setDemoStepMessage('Step 2/8: AI Image Classification completed -> P1 Critical Priority assigned.');
      await new Promise((r) => setTimeout(r, 1200));

      setDemoStepMessage('Step 3/8: Intelligent Dispatch evaluating candidate workers (distance + workload)...');
      await new Promise((r) => setTimeout(r, 1200));

      setDemoStepMessage('Step 4/8: System recommending Ravi Chandran (1.2 km away, Available, Low workload).');
      await new Promise((r) => setTimeout(r, 1200));

      assignWorkerToComplaint(newCmp.id, 'WRK-101');
      setDemoStepMessage('Step 5/8: Worker Ravi Chandran assigned! Optimized transit route generated.');
      await new Promise((r) => setTimeout(r, 1200));

      updateComplaintStatus(newCmp.id, 'Cleaning', 'Worker Ravi Chandran arrived on site with sanitary tipper and cleaning gear.');
      setDemoStepMessage('Step 6/8: Worker on site: Sweeping, collecting, and sanitizing with bleaching powder...');
      await new Promise((r) => setTimeout(r, 1400));

      setDemoStepMessage('Step 7/8: After-photo uploaded -> Running AI Cleaning Optical Verification...');
      await new Promise((r) => setTimeout(r, 1200));

      await submitCleaningProof(
        newCmp.id,
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
        98
      );

      setDemoStepMessage('Step 8/8: AI Verified at 98% confidence! Ticket Resolved. Citizen submitting 5-star rating...');
      await new Promise((r) => setTimeout(r, 1200));

      submitCitizenFeedback(newCmp.id, 5, 'Exceptional municipal response! The area was cleared within an hour.');

      setDemoStepMessage('End-to-End Cycle Completed! Ravi score updated to 96/100, Area & Monthly stats synchronized.');
      await new Promise((r) => setTimeout(r, 2000));
    } finally {
      setIsDemoRunning(false);
      setDemoStepMessage('');
    }
  };

  return (
    <StoreContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        activeView,
        setActiveView,
        currentCitizen,
        complaints,
        workers,
        smartBins,
        hotspots,
        areas,
        vehicles,
        cleaningExpenses,
        vehicleExpenses,
        aiInsights,
        notifications,
        addComplaint,
        assignWorkerToComplaint,
        updateComplaintStatus,
        submitCleaningProof,
        submitCitizenFeedback,
        adminOverrideComplaintAI,
        reanalyzeComplaintWithAI,
        collectSmartBin,
        simulateBinSensorUpdate,
        approveWorkerBonus,
        approveSalaryIncrement,
        markNotificationRead,
        clearAllNotifications,
        resetToSeedData,
        runEndToEndDemo,
        isDemoRunning,
        demoStepMessage,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
