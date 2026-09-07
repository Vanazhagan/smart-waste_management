import { AIAnalysisResult } from '../types';
import { AIImageClassificationService } from './aiImageClassificationService';

export interface AIClassificationInput {
  imageUrl?: string;
  imageName?: string;
  description?: string;
  ward?: string;
  address?: string;
}

export interface AIVerificationResult {
  verified: boolean;
  confidence: number;
  cleanlinessScore: number;
  notes: string;
  detectedRemainingDebris: boolean;
  beforeCondition?: string;
  afterCondition?: string;
  remainingWaste?: string;
  isRealAI?: boolean;
  modelName?: string;
}

export class AIService {
  /**
   * Classify waste complaint image using the dedicated AI Image Classification Service.
   * Leverages real Gemini Vision AI when available, with deterministic fallback.
   */
  static async classifyGarbageImage(input: AIClassificationInput): Promise<AIAnalysisResult> {
    return AIImageClassificationService.classifyWasteImage({
      imageDataUrl: input.imageUrl || '',
      imageName: input.imageName,
      description: input.description,
      ward: input.ward,
      address: input.address,
    });
  }

  /**
   * Verify sanitary cleaning by cross-referencing Before and After photos using Vision AI.
   */
  static async verifyCleaning(beforePhotoUrl: string, afterPhotoUrl: string): Promise<AIVerificationResult> {
    const res = await AIImageClassificationService.verifyCleaning({
      beforeImageDataUrl: beforePhotoUrl,
      afterImageDataUrl: afterPhotoUrl,
    });

    return {
      verified: res.verified,
      confidence: res.confidence,
      cleanlinessScore: res.cleanlinessScore,
      notes: res.explanation || res.notes,
      detectedRemainingDebris: !res.verified,
      beforeCondition: res.beforeCondition,
      afterCondition: res.afterCondition,
      remainingWaste: res.remainingWaste,
      isRealAI: res.isRealAI,
      modelName: res.modelName,
    };
  }

  /**
   * AI recommendation for nearest available sanitary worker with lowest current workload.
   */
  static calculateWorkerRecommendation(
    complaintLat: number,
    complaintLng: number,
    workers: Array<{ id: string; name: string; status: string; currentLat: number; currentLng: number; pendingTasks: number; assignedWard: string }>,
    targetWard: string
  ) {
    const candidates = workers
      .filter((w) => w.status !== 'OFFLINE')
      .map((worker) => {
        // Calculate Haversine distance in km
        const dLat = (worker.currentLat - complaintLat) * 111;
        const dLng = (worker.currentLng - complaintLng) * 111 * Math.cos((complaintLat * Math.PI) / 180);
        const distanceKm = Math.sqrt(dLat * dLat + dLng * dLng);

        // Score: lower distance + lower pending tasks + ward match bonus
        const wardMatchBonus = worker.assignedWard === targetWard ? -1.5 : 0;
        const workloadPenalty = worker.pendingTasks * 0.8;
        const statusPenalty = worker.status === 'WORKING' ? 1.5 : 0;
        const overallCost = distanceKm + workloadPenalty + statusPenalty + wardMatchBonus;

        return {
          worker,
          distanceKm: Number(Math.max(0.4, distanceKm).toFixed(1)),
          workload: worker.pendingTasks < 4 ? 'Low' : worker.pendingTasks < 8 ? 'Medium' : 'High',
          overallCost,
        };
      })
      .sort((a, b) => a.overallCost - b.overallCost);

    const best = candidates[0];
    return {
      recommendedWorker: best?.worker,
      distanceKm: best?.distanceKm || 1.2,
      workload: best?.workload || 'Low',
      allCandidates: candidates,
      reason: `Nearest available worker (${best?.distanceKm || 1.2} km away) with lowest active workload and optimal ward proximity.`,
    };
  }
}
