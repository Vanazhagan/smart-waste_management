import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  Radio,
  Users,
  Truck,
  Flame,
  ZoomIn,
  ZoomOut,
  Search,
  Filter,
} from 'lucide-react';
import { useStore } from '../../services/store';

// Fix for default Leaflet icon paths in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const CITIES = [
  { name: 'Chennai Central & T. Nagar', lat: 13.0422, lng: 80.2338, zoom: 13 },
  { name: 'Anna Nagar (Chennai)', lat: 13.0864, lng: 80.2152, zoom: 14 },
  { name: 'Coimbatore (Gandhipuram)', lat: 11.0168, lng: 76.9558, zoom: 13 },
  { name: 'Madurai (Mattuthavani)', lat: 9.9252, lng: 78.1198, zoom: 13 },
  { name: 'Tiruchirappalli (Trichy)', lat: 10.7905, lng: 78.7047, zoom: 13 },
  { name: 'Salem (Four Roads)', lat: 11.6643, lng: 78.146, zoom: 13 },
];

export const GarbageMapView: React.FC = () => {
  const { complaints, smartBins, workers, vehicles, hotspots, language } = useStore();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Layer Toggles
  const [showComplaints, setShowComplaints] = useState(true);
  const [showSmartBins, setShowSmartBins] = useState(true);
  const [showWorkers, setShowWorkers] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [13.0422, 80.2338], // Default to T. Nagar, Chennai
        zoom: 13,
        zoomControl: false,
      });

      // CartoDB Voyager Tile layer (clean, high contrast, modern GIS theme)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CartoDB</a> OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers whenever data or layer toggles change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Render Complaints
    if (showComplaints) {
      complaints.forEach((c) => {
        if (
          !c.location ||
          typeof c.location.lat !== 'number' ||
          typeof c.location.lng !== 'number' ||
          isNaN(c.location.lat) ||
          isNaN(c.location.lng)
        ) {
          return;
        }

        const isP1 = c.aiAnalysis?.priority === 'P1';
        const color =
          c.aiAnalysis?.priority === 'P1'
            ? '#ef4444'
            : c.aiAnalysis?.priority === 'P2'
            ? '#f97316'
            : c.aiAnalysis?.priority === 'P3'
            ? '#eab308'
            : '#10b981';

        const customIcon = L.divIcon({
          className: 'custom-complaint-marker',
          html: `<div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; font-family: monospace;">${
            c.aiAnalysis?.priority || 'P2'
          }</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([c.location.lat, c.location.lng], { icon: customIcon });

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; font-size: 12px; min-width: 200px; color: #0f172a;">
            <div style="font-weight: bold; font-size: 13px; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span>${c.id}</span>
              <span style="color: ${color}; font-weight: 800;">${c.aiAnalysis?.priority || 'P2'}</span>
            </div>
            <img src="${c.photoUrl}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" />
            <p style="margin: 0; color: #334155; font-weight: 600;">${c.aiAnalysis?.wasteType || 'Mixed Waste'}</p>
            <p style="margin: 2px 0 6px 0; color: #64748b; font-size: 11px;">${c.location.address || 'Address recorded'}</p>
            <div style="padding-top: 4px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #475569;">
              Status: <strong>${c.status}</strong> • Assigned: <strong>${c.assignedWorkerName || 'None'}</strong>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
        layerGroup.addLayer(marker);
      });
    }

    // 2. Render Smart Dustbins
    if (showSmartBins) {
      smartBins.forEach((b) => {
        if (
          !b.location ||
          typeof b.location.lat !== 'number' ||
          typeof b.location.lng !== 'number' ||
          isNaN(b.location.lat) ||
          isNaN(b.location.lng)
        ) {
          return;
        }

        const isCritical = b.fillPercentage >= 95;
        const color = isCritical
          ? '#dc2626'
          : b.fillPercentage >= 85
          ? '#ea580c'
          : b.fillPercentage >= 70
          ? '#ca8a04'
          : '#059669';

        const customIcon = L.divIcon({
          className: 'custom-bin-marker',
          html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 8px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 9px; font-family: monospace;">
            <span>${b.fillPercentage}%</span>
          </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([b.location.lat, b.location.lng], { icon: customIcon });

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; font-size: 12px; min-width: 190px; color: #0f172a;">
            <div style="font-weight: bold; font-size: 13px; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span>${b.id} (IoT Bin)</span>
              <span style="color: ${color}; font-weight: 800;">${b.fillPercentage}%</span>
            </div>
            <p style="margin: 0; color: #334155;">${b.location.address || 'Address recorded'}</p>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 11px;">Ward: ${b.ward}</p>
            <div style="padding-top: 6px; margin-top: 6px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #0f172a;">
              Battery: <strong>${b.batteryLevel}%</strong> • Pred. Overflow: <strong>${b.predictedOverflowHours}h</strong>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
        layerGroup.addLayer(marker);
      });
    }

    // 3. Render Workers
    if (showWorkers) {
      workers.forEach((w) => {
        if (
          typeof w.currentLat !== 'number' ||
          typeof w.currentLng !== 'number' ||
          isNaN(w.currentLat) ||
          isNaN(w.currentLng)
        ) {
          return;
        }

        const customIcon = L.divIcon({
          className: 'custom-worker-marker',
          html: `<div style="background-color: #0284c7; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
            ${w.name.charAt(0)}
          </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([w.currentLat, w.currentLng], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 12px;">
            <strong>${w.name}</strong> (${w.id})<br/>
            Status: <span style="color: #0284c7; font-weight: bold;">${w.status}</span><br/>
            Assigned Ward: ${w.assignedWard}<br/>
            Score: ${w.performanceScore}/100 • Pending Tasks: ${w.tasks.pending}
          </div>
        `);
        layerGroup.addLayer(marker);
      });
    }

    // 4. Render Vehicles
    if (showVehicles) {
      vehicles.forEach((v) => {
        if (
          typeof v.currentLat !== 'number' ||
          typeof v.currentLng !== 'number' ||
          isNaN(v.currentLat) ||
          isNaN(v.currentLng)
        ) {
          return;
        }

        const customIcon = L.divIcon({
          className: 'custom-vehicle-marker',
          html: `<div style="background-color: #475569; width: 24px; height: 24px; border-radius: 6px; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: #38bdf8; font-size: 13px;">
            🚚
          </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([v.currentLat, v.currentLng], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 12px;">
            <strong>${v.registrationNumber || v.id}</strong> (${v.type})<br/>
            Driver: ${v.driverName}<br/>
            Capacity: ${v.capacityTons || 3.5} Tons • Fuel: ${v.fuelLevelPercent ?? 75}%<br/>
            Assigned Ward: ${v.ward || v.assignedWard}
          </div>
        `);
        layerGroup.addLayer(marker);
      });
    }

    // 5. Render Hotspots (Pulsing Circles)
    if (showHotspots) {
      hotspots.forEach((h) => {
        if (
          typeof h.lat !== 'number' ||
          typeof h.lng !== 'number' ||
          isNaN(h.lat) ||
          isNaN(h.lng)
        ) {
          return;
        }

        const circle = L.circle([h.lat, h.lng], {
          radius: 350,
          color: '#ef4444',
          fillColor: '#f87171',
          fillOpacity: 0.25,
          weight: 2,
        });

        circle.bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 12px;">
            <strong style="color: #ef4444;">Chronic Garbage Hotspot</strong><br/>
            <strong>${h.name || h.areaName || 'Hotspot'}</strong> (${h.ward})<br/>
            Complaints: <strong>${h.complaintCount}</strong> this month<br/>
            Primary waste: ${h.mainWasteType || h.predominantWasteType || 'Mixed Waste'}<br/>
            <em>${h.recommendation}</em>
          </div>
        `);
        layerGroup.addLayer(circle);
      });
    }
  }, [complaints, smartBins, workers, vehicles, hotspots, showComplaints, showSmartBins, showWorkers, showVehicles, showHotspots]);

  const handleCitySelect = (city: (typeof CITIES)[0]) => {
    if (
      mapInstanceRef.current &&
      typeof city.lat === 'number' &&
      typeof city.lng === 'number' &&
      !isNaN(city.lat) &&
      !isNaN(city.lng)
    ) {
      mapInstanceRef.current.flyTo([city.lat, city.lng], city.zoom, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {language === 'ta' ? 'தமிழ்நாடு நகராட்சி GIS நேரலை வரைபடம்' : 'Tamil Nadu Municipal GIS Command Map'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'புகார்கள், ஸ்மார்ட் தொட்டிகள், தூய்மைப் பணியாளர்கள், வாகனங்கள் மற்றும் வெப்பப் பகுதிகள்'
              : 'Live spatial tracking of complaints, IoT ultrasonic dustbins, sanitary workers, and chronic hotspots'}
          </p>
        </div>

        {/* City Quick Zoom Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] mr-1 shrink-0">Jump To:</span>
          {CITIES.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleCitySelect(c)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition whitespace-nowrap"
            >
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[640px] rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Layer Controls (Top-Right) */}
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-3 space-y-2 text-xs w-60">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              GIS Map Layers
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
          </div>

          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="flex items-center gap-2 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              Complaints ({complaints.length})
            </span>
            <input
              type="checkbox"
              checked={showComplaints}
              onChange={(e) => setShowComplaints(e.target.checked)}
              className="accent-emerald-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="flex items-center gap-2 text-slate-700">
              <span className="w-3 h-3 rounded bg-amber-500" />
              IoT Smart Bins ({smartBins.length})
            </span>
            <input
              type="checkbox"
              checked={showSmartBins}
              onChange={(e) => setShowSmartBins(e.target.checked)}
              className="accent-emerald-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="flex items-center gap-2 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-sky-600" />
              Sanitary Workers ({workers.length})
            </span>
            <input
              type="checkbox"
              checked={showWorkers}
              onChange={(e) => setShowWorkers(e.target.checked)}
              className="accent-emerald-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="flex items-center gap-2 text-slate-700">
              <span className="w-3 h-3 rounded bg-slate-700 text-[10px] text-center text-white">🚚</span>
              Collection Trucks ({vehicles.length})
            </span>
            <input
              type="checkbox"
              checked={showVehicles}
              onChange={(e) => setShowVehicles(e.target.checked)}
              className="accent-emerald-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="flex items-center gap-2 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-rose-300 ring-1 ring-rose-500" />
              Chronic Hotspots ({hotspots.length})
            </span>
            <input
              type="checkbox"
              checked={showHotspots}
              onChange={(e) => setShowHotspots(e.target.checked)}
              className="accent-emerald-600 rounded"
            />
          </label>
        </div>

        {/* Floating Zoom & Legend Controls (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md text-white rounded-xl p-3 shadow-xl border border-slate-800 text-[11px] space-y-1.5">
          <div className="font-bold text-slate-200 mb-1">Marker Legend</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>P1 Critical Complaint</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span>Smart Bin &lt;85% Fill</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-rose-600" />
            <span>Smart Bin &gt;95% (Overflow)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
