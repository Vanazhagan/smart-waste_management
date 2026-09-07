import { Complaint, SmartBin, Worker } from '../types';

export interface RouteStop {
  id: string;
  type: 'COMPLAINT' | 'SMART_BIN';
  title: string;
  address: string;
  lat: number;
  lng: number;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: string;
  distanceFromPrevKm: number;
  estimatedArrivalMinutes: number;
  actionRequired: string;
}

export interface OptimizedRouteResult {
  worker: Worker;
  stops: RouteStop[];
  totalDistanceKm: number;
  estimatedTotalMinutes: number;
  criticalTasksCount: number;
  generatedAt: string;
}

export class RouteOptimizerService {
  static optimizeWorkerRoute(
    worker: Worker,
    complaints: Complaint[],
    smartBins: SmartBin[]
  ): OptimizedRouteResult {
    // 1. Gather pending tasks for this worker or within worker's assigned wards
    const relevantComplaints = complaints.filter(
      (c) =>
        (c.assignedWorkerId === worker.id || worker.assignedAreas.includes(c.location.areaId) || c.location.ward === worker.assignedWard) &&
        c.status !== 'Resolved'
    );

    const relevantBins = smartBins.filter(
      (b) =>
        (b.status === 'CRITICAL' || b.status === 'COLLECTION_REQUIRED' || b.assignedWorkerId === worker.id) &&
        (b.ward === worker.assignedWard || worker.assignedAreas.some((a) => a.includes(b.ward) || b.areaId.includes(a)))
    );

    // Build stops with priority weights
    const rawStops: Array<{
      id: string;
      type: 'COMPLAINT' | 'SMART_BIN';
      title: string;
      address: string;
      lat: number;
      lng: number;
      priority: 'P1' | 'P2' | 'P3' | 'P4';
      priorityScore: number;
      status: string;
      actionRequired: string;
    }> = [];

    relevantComplaints.forEach((c) => {
      if (!c.location || typeof c.location.lat !== 'number' || typeof c.location.lng !== 'number') return;
      const p = c.aiAnalysis?.priority || 'P2';
      const score = p === 'P1' ? 100 : p === 'P2' ? 70 : p === 'P3' ? 40 : 20;
      rawStops.push({
        id: c.id,
        type: 'COMPLAINT',
        title: `${c.id} - ${c.aiAnalysis?.wasteType || 'Waste Cleanup'}`,
        address: c.location.address || 'Complaint location',
        lat: c.location.lat,
        lng: c.location.lng,
        priority: p,
        priorityScore: score,
        status: c.status,
        actionRequired: `Clear ${c.aiAnalysis?.quantity || 'Medium'} volume ${c.aiAnalysis?.wasteType || 'waste'} and upload verification photo`,
      });
    });

    relevantBins.forEach((b) => {
      if (!b.location || typeof b.location.lat !== 'number' || typeof b.location.lng !== 'number') return;
      const p: 'P1' | 'P2' = b.status === 'CRITICAL' || b.fillPercentage >= 90 ? 'P1' : 'P2';
      const score = p === 'P1' ? 95 : 65;
      rawStops.push({
        id: b.id,
        type: 'SMART_BIN',
        title: `${b.id} - Smart Bin (${b.fillPercentage}% Fill)`,
        address: b.location.address || 'Bin location',
        lat: b.location.lat,
        lng: b.location.lng,
        priority: p,
        priorityScore: score,
        status: b.status,
        actionRequired: `Evacuate bin before predicted overflow in ${b.predictedOverflowHours}h`,
      });
    });

    // Sort predominantly by Priority (P1 first), then by distance from current worker location
    let currentLat = typeof worker.currentLat === 'number' && !isNaN(worker.currentLat) ? worker.currentLat : 13.0827;
    let currentLng = typeof worker.currentLng === 'number' && !isNaN(worker.currentLng) ? worker.currentLng : 80.2707;
    const orderedStops: RouteStop[] = [];
    let totalDistanceKm = 0;
    let cumulativeMinutes = 0;

    // Greedy TSP with priority bias
    const pool = [...rawStops];
    while (pool.length > 0) {
      // Find candidate that maximizes (priorityScore * 0.6) - (distance * 0.4)
      let bestIdx = 0;
      let bestRank = -Infinity;
      let bestDist = 0;

      for (let i = 0; i < pool.length; i++) {
        const item = pool[i];
        const dLat = (item.lat - currentLat) * 111;
        const dLng = (item.lng - currentLng) * 111 * Math.cos((currentLat * Math.PI) / 180);
        const distKm = Math.sqrt(dLat * dLat + dLng * dLng);

        // Priority is heavily valued so critical complaints are handled first
        const rank = item.priorityScore * 2.5 - distKm * 1.5;
        if (rank > bestRank) {
          bestRank = rank;
          bestIdx = i;
          bestDist = distKm;
        }
      }

      const chosen = pool.splice(bestIdx, 1)[0];
      const stepDist = Number(Math.max(0.3, bestDist).toFixed(1));
      totalDistanceKm += stepDist;
      // Assume 25 km/h transit speed in city + 15 min clearance per stop
      const travelMinutes = Math.round((stepDist / 25) * 60);
      cumulativeMinutes += travelMinutes + 15;

      orderedStops.push({
        id: chosen.id,
        type: chosen.type,
        title: chosen.title,
        address: chosen.address,
        lat: chosen.lat,
        lng: chosen.lng,
        priority: chosen.priority,
        status: chosen.status,
        distanceFromPrevKm: stepDist,
        estimatedArrivalMinutes: cumulativeMinutes,
        actionRequired: chosen.actionRequired,
      });

      currentLat = chosen.lat;
      currentLng = chosen.lng;
    }

    const criticalTasksCount = orderedStops.filter((s) => s.priority === 'P1').length;

    return {
      worker,
      stops: orderedStops,
      totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
      estimatedTotalMinutes: cumulativeMinutes,
      criticalTasksCount,
      generatedAt: new Date().toISOString(),
    };
  }
}

export class RouteOptimizer {
  static generateOptimizedRoute(smartBins: SmartBin[], complaints: Complaint[]) {
    // Critical bins (>80%) + P1 complaints prioritized
    const criticalBins = smartBins
      .filter((b) => b.fillPercentage >= 80 && b.location && typeof b.location.lat === 'number' && typeof b.location.lng === 'number')
      .map((b) => ({
        id: b.id,
        label: `${b.id} (${b.fillPercentage}%)`,
        type: 'SMART_BIN',
        address: b.location?.address || 'Bin location',
        priority: b.fillPercentage >= 95 ? 'CRITICAL' : 'HIGH',
        fillPercentage: b.fillPercentage,
        lat: b.location.lat,
        lng: b.location.lng,
      }));

    const p1Complaints = complaints
      .filter((c) => c.status !== 'Resolved' && (c.aiAnalysis?.priority === 'P1' || c.aiAnalysis?.priority === 'P2') && c.location && typeof c.location.lat === 'number' && typeof c.location.lng === 'number')
      .map((c) => ({
        id: c.id,
        label: `${c.id} - ${c.aiAnalysis?.wasteType || 'Garbage'}`,
        type: 'COMPLAINT',
        address: c.location?.address || 'Complaint location',
        priority: c.aiAnalysis?.priority || 'P1',
        fillPercentage: undefined as number | undefined,
        lat: c.location.lat,
        lng: c.location.lng,
      }));

    const stops = [...criticalBins, ...p1Complaints];
    const totalDistanceKm = Number((stops.length * 2.3 + 3.4).toFixed(1));
    const distanceSavedKm = Number((totalDistanceKm * 0.28).toFixed(1));
    const estimatedTimeHours = Number(((totalDistanceKm / 20) + (stops.length * 0.25)).toFixed(1));
    const fuelSavedLitres = Number((distanceSavedKm * 0.28).toFixed(1));

    return {
      stops,
      totalDistanceKm,
      distanceSavedKm,
      estimatedTimeHours,
      fuelSavedLitres,
    };
  }
}

