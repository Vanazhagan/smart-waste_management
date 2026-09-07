import { PriorityLevel, SeverityLevel, WasteQuantity, WasteType } from '../types';

export interface SeverityCalculationInput {
  wasteType: WasteType;
  quantity: WasteQuantity;
  healthRisk: SeverityLevel;
  publicImpact: SeverityLevel;
  isHazardous?: boolean;
  isMedicalWaste?: boolean;
  isOverflowing?: boolean;
  isRoadObstruction?: boolean;
  locationContext?: string;
  detectedObjects?: string[];
}

export interface PriorityCalculationInput {
  severity: SeverityLevel;
  healthRisk: SeverityLevel;
  publicImpact: SeverityLevel;
  quantity: WasteQuantity;
  hazardousWaste?: boolean;
  overflow?: boolean;
  roadObstruction?: boolean;
  hotspot?: boolean;
  wasteType?: WasteType;
  locationContext?: string;
  aiRecommendedPriority?: PriorityLevel;
}

export interface PriorityCalculationResult {
  systemPriority: PriorityLevel;
  priorityScore: number; // Normalized 0-100 score
  maxScore: number;
  priorityLabel: string; // "P1 Critical", "P2 High", "P3 Medium", "P4 Low"
  scoreBreakdown: {
    severityScore: number;
    healthRiskScore: number;
    publicImpactScore: number;
    quantityScore: number;
    hazardousBonus: number;
    overflowBonus: number;
    roadObstructionBonus: number;
    hotspotBonus: number;
    totalRawScore: number;
    normalizedScore: number;
  };
  aiRecommendedPriority?: PriorityLevel;
  differsFromAI: boolean;
  priorityDifferenceNotice?: string;
  explanation: string;
}

/**
 * 10. SEVERITY MUST BE RULE-BASED
 * Deterministic severity engine based on visible physical observations.
 * 
 * Rules:
 * - IF medical waste detected: Severity = Critical
 * - IF hazardous waste detected: Severity = High or Critical
 * - IF waste blocks road/path: Severity = High or Critical
 * - IF overflowing bin: Severity = Critical or High
 * - IF large accumulation: Severity = High
 * - IF moderate accumulation: Severity = Medium
 * - IF small isolated waste: Severity = Low
 */
export function calculateSeverity(input: SeverityCalculationInput): SeverityLevel {
  const isMedical = Boolean(
    input.isMedicalWaste ||
    (input.detectedObjects && input.detectedObjects.some((o) =>
      o.toLowerCase().includes('medical') ||
      o.toLowerCase().includes('syringe') ||
      o.toLowerCase().includes('needle') ||
      o.toLowerCase().includes('clinical') ||
      o.toLowerCase().includes('patholog')
    ))
  );

  const isHazardous = Boolean(
    input.isHazardous ||
    input.wasteType === 'Hazardous' ||
    isMedical ||
    (input.detectedObjects && input.detectedObjects.some((o) =>
      o.toLowerCase().includes('hazard') ||
      o.toLowerCase().includes('chemical') ||
      o.toLowerCase().includes('battery') ||
      o.toLowerCase().includes('toxic')
    ))
  );

  if (isMedical) {
    return 'Critical';
  }

  if (isHazardous) {
    if (input.healthRisk === 'Critical' || input.publicImpact === 'High' || input.publicImpact === 'Critical' || input.isRoadObstruction) {
      return 'Critical';
    }
    return 'High';
  }

  if (input.isOverflowing && (input.publicImpact === 'Critical' || input.publicImpact === 'High' || input.isRoadObstruction)) {
    return 'Critical';
  }

  if (input.isRoadObstruction && (input.quantity === 'Large' || input.publicImpact === 'Critical' || input.publicImpact === 'High')) {
    return 'Critical';
  }

  if (input.isRoadObstruction || input.isOverflowing) {
    return 'High';
  }

  if (input.quantity === 'Large') {
    if (input.healthRisk === 'High' || input.healthRisk === 'Critical' || input.publicImpact === 'High' || input.publicImpact === 'Critical') {
      return 'High';
    }
    return 'Medium';
  }

  if (input.quantity === 'Medium') {
    if (input.healthRisk === 'High' || input.healthRisk === 'Critical' || input.publicImpact === 'High') {
      return 'High';
    }
    return 'Medium';
  }

  // Small isolated waste
  if (input.quantity === 'Small') {
    if (input.healthRisk === 'Critical') return 'High';
    return 'Low';
  }

  return 'Medium';
}

/**
 * 13. FINAL PRIORITY ENGINE
 * Deterministic scoring function: calculateComplaintPriority()
 * 
 * Rules:
 * Severity: Critical = 40, High = 30, Medium = 20, Low = 10
 * Health Risk: Critical = 25, High = 18, Medium = 10, Low = 5
 * Public Impact: Critical = 25, High = 18, Medium = 10, Low = 5
 * Quantity: Large = 10, Medium = 6, Small = 3
 * Additional:
 * Hazardous waste = +15
 * Overflow = +15
 * Road obstruction = +10
 * Repeated hotspot = +10
 * 
 * Score normalized to 0-100:
 * 80+: P1 Critical
 * 60-79: P2 High
 * 35-59: P3 Medium
 * 0-34: P4 Low
 */
export function calculateComplaintPriority(input: PriorityCalculationInput): PriorityCalculationResult {
  // Severity points (10 - 40)
  let severityScore = 20;
  if (input.severity === 'Critical') severityScore = 40;
  else if (input.severity === 'High') severityScore = 30;
  else if (input.severity === 'Medium') severityScore = 20;
  else if (input.severity === 'Low') severityScore = 10;

  // Health risk points (5 - 25)
  let healthRiskScore = 10;
  if (input.healthRisk === 'Critical') healthRiskScore = 25;
  else if (input.healthRisk === 'High') healthRiskScore = 18;
  else if (input.healthRisk === 'Medium') healthRiskScore = 10;
  else if (input.healthRisk === 'Low') healthRiskScore = 5;

  // Public impact points (5 - 25)
  let publicImpactScore = 10;
  if (input.publicImpact === 'Critical') publicImpactScore = 25;
  else if (input.publicImpact === 'High') publicImpactScore = 18;
  else if (input.publicImpact === 'Medium') publicImpactScore = 10;
  else if (input.publicImpact === 'Low') publicImpactScore = 5;

  // Quantity points (3 - 10)
  let quantityScore = 6;
  if (input.quantity === 'Large') quantityScore = 10;
  else if (input.quantity === 'Medium') quantityScore = 6;
  else if (input.quantity === 'Small') quantityScore = 3;

  // Additional points
  const isHazardous = Boolean(input.hazardousWaste || input.wasteType === 'Hazardous');
  const hazardousBonus = isHazardous ? 15 : 0;
  const overflowBonus = input.overflow ? 15 : 0;
  const roadObstructionBonus = input.roadObstruction ? 10 : 0;
  const hotspotBonus = input.hotspot ? 10 : 0;

  const totalRawScore =
    severityScore +
    healthRiskScore +
    publicImpactScore +
    quantityScore +
    hazardousBonus +
    overflowBonus +
    roadObstructionBonus +
    hotspotBonus;

  // Normalize final score to 0-100 without duplicate distortions
  const normalizedScore = Math.min(100, Math.max(0, totalRawScore));

  // Map to priority tier:
  // 80+: P1 Critical
  // 60-79: P2 High
  // 35-59: P3 Medium
  // 0-34: P4 Low
  let systemPriority: PriorityLevel = 'P4';
  let priorityLabel = 'P4 Low';

  if (normalizedScore >= 80) {
    systemPriority = 'P1';
    priorityLabel = 'P1 Critical';
  } else if (normalizedScore >= 60) {
    systemPriority = 'P2';
    priorityLabel = 'P2 High';
  } else if (normalizedScore >= 35) {
    systemPriority = 'P3';
    priorityLabel = 'P3 Medium';
  } else {
    systemPriority = 'P4';
    priorityLabel = 'P4 Low';
  }

  const aiPriority = input.aiRecommendedPriority;
  const differsFromAI = Boolean(aiPriority && aiPriority !== systemPriority);
  const priorityDifferenceNotice = differsFromAI
    ? `Priority notice: Visual analysis suggested ${aiPriority}, but Municipal Deterministic Priority Engine calculated ${priorityLabel} (Score: ${normalizedScore}/100).`
    : undefined;

  const explanation = `Municipal priority engine evaluated: Severity (${severityScore}/40), Health Risk (${healthRiskScore}/25), Public Impact (${publicImpactScore}/25), Volume (${quantityScore}/10)${
    hazardousBonus > 0 ? `, Hazardous Waste (+${hazardousBonus})` : ''
  }${overflowBonus > 0 ? `, Overflow (+${overflowBonus})` : ''}${
    roadObstructionBonus > 0 ? `, Road Obstruction (+${roadObstructionBonus})` : ''
  }${hotspotBonus > 0 ? `, Hotspot Location (+${hotspotBonus})` : ''} = Total ${normalizedScore}/100 points. Dispatch tier: ${priorityLabel}.`;

  return {
    systemPriority,
    priorityScore: normalizedScore,
    maxScore: 100,
    priorityLabel,
    scoreBreakdown: {
      severityScore,
      healthRiskScore,
      publicImpactScore,
      quantityScore,
      hazardousBonus,
      overflowBonus,
      roadObstructionBonus,
      hotspotBonus,
      totalRawScore,
      normalizedScore,
    },
    aiRecommendedPriority: aiPriority,
    differsFromAI,
    priorityDifferenceNotice,
    explanation,
  };
}

/**
 * Backward compatibility wrapper
 */
export class PriorityEngine {
  static calculatePriority(input: {
    severity: SeverityLevel;
    healthRisk: SeverityLevel;
    publicImpact: SeverityLevel;
    quantity: WasteQuantity;
    wasteType: WasteType;
    locationContext?: string;
    aiRecommendedPriority?: PriorityLevel;
    isHazardous?: boolean;
    isOverflowing?: boolean;
    isRoadObstruction?: boolean;
    isHotspot?: boolean;
  }): PriorityCalculationResult {
    return calculateComplaintPriority({
      severity: input.severity,
      healthRisk: input.healthRisk,
      publicImpact: input.publicImpact,
      quantity: input.quantity,
      wasteType: input.wasteType,
      hazardousWaste: input.isHazardous || input.wasteType === 'Hazardous',
      overflow: input.isOverflowing,
      roadObstruction: input.isRoadObstruction,
      hotspot: input.isHotspot,
      locationContext: input.locationContext,
      aiRecommendedPriority: input.aiRecommendedPriority,
    });
  }
}
