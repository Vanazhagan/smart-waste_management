import { SmartBin, SmartBinStatus } from '../types';

export interface IoTTelemetryPayload {
  bin_id: string;
  measured_distance_cm: number;
  timestamp: string;
  battery_level?: number;
}

export class IoTService {
  /**
   * Hardware Calibration Formula:
   * Fill % = ((Bin Height - Measured Distance) / Bin Height) * 100
   */
  static calculateFillPercentage(binHeightCm: number, measuredDistanceCm: number): number {
    const raw = ((binHeightCm - measuredDistanceCm) / binHeightCm) * 100;
    const clamped = Math.max(0, Math.min(105, raw));
    return Number(clamped.toFixed(1));
  }

  /**
   * Municipal Status Thresholds:
   * 0–70% = NORMAL
   * 70–85% = WARNING
   * 85–95% = COLLECTION_REQUIRED
   * 95–100% = CRITICAL
   * 100%+ = OVERFLOW
   */
  static determineStatus(fillPercentage: number): SmartBinStatus {
    if (fillPercentage >= 100) return 'OVERFLOW';
    if (fillPercentage >= 95) return 'CRITICAL';
    if (fillPercentage >= 85) return 'COLLECTION_REQUIRED';
    if (fillPercentage >= 70) return 'WARNING';
    return 'NORMAL';
  }

  /**
   * Predictive algorithm calculating hours remaining until 100% overflow.
   */
  static calculatePredictedOverflowHours(currentFillPercentage: number, growthRatePerHour: number): number {
    if (currentFillPercentage >= 100) return 0;
    const rate = Math.max(0.2, growthRatePerHour);
    const hoursRemaining = (100 - currentFillPercentage) / rate;
    return Number(Math.max(0.1, hoursRemaining).toFixed(1));
  }

  /**
   * Simulates processing of ESP32 sensor POST request.
   * Mirrors backend POST /api/iot/bin-data
   */
  static processTelemetry(bin: SmartBin, payload: IoTTelemetryPayload): SmartBin {
    const fill = this.calculateFillPercentage(bin.heightCm, payload.measured_distance_cm);
    const status = this.determineStatus(fill);
    const predictedHours = this.calculatePredictedOverflowHours(fill, bin.growthRatePerHour);

    return {
      ...bin,
      currentMeasuredDistanceCm: payload.measured_distance_cm,
      fillPercentage: fill,
      status,
      predictedOverflowHours: predictedHours,
      batteryLevel: payload.battery_level ?? bin.batteryLevel,
      lastUpdatedAt: payload.timestamp || new Date().toISOString(),
    };
  }

  /**
   * Performs an automated municipal collection event:
   * Evacuates waste, sets measured distance back to 85cm (15% fill), updates history.
   */
  static recordCollection(bin: SmartBin, workerId: string, workerName: string): SmartBin {
    const priorFill = bin.fillPercentage;
    const newDistance = Math.round(bin.heightCm * 0.85); // 85cm free space = 15% fill
    const newFill = this.calculateFillPercentage(bin.heightCm, newDistance);
    const newStatus = this.determineStatus(newFill);

    const newHistoryEntry = {
      id: `COL-${Date.now().toString().slice(-4)}`,
      collectedAt: new Date().toISOString(),
      workerId,
      workerName,
      fillBeforeCollection: priorFill,
      fillAfterCollection: newFill,
    };

    return {
      ...bin,
      currentMeasuredDistanceCm: newDistance,
      fillPercentage: newFill,
      status: newStatus,
      lastCollectionAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      predictedOverflowHours: this.calculatePredictedOverflowHours(newFill, bin.growthRatePerHour),
      collectionHistory: [newHistoryEntry, ...bin.collectionHistory],
    };
  }
}
