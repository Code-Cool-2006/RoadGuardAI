import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  AlertTriangle,
  Layers,
  Calendar,
  Sparkles,
  CheckCircle2,
  Plus,
  Info,
  ArrowRight,
  MapPin,
  ShieldAlert,
  Flame,
  Droplet,
  Radio,
  Road,
  RefreshCw,
  Database,
  Flag,
} from 'lucide-react';

// Department Color Scheme matching the Pipeline Spec:
// Water: Cyan (#06B6D4)
// Telecom: Magenta/Pink (#EC4899)
// Roads: White (#FFFFFF)
// Gas: Amber (#F59E0B)

const DEPARTMENTS = {
  roads: { name: 'Roads', color: '#FFFFFF', bg: 'bg-white', stroke: '#FFFFFF', icon: Road },
  water: { name: 'Water', color: '#06B6D4', bg: 'bg-cyan-500', stroke: '#06B6D4', icon: Droplet },
  telecom: { name: 'Telecom', color: '#EC4899', bg: 'bg-pink-500', stroke: '#EC4899', icon: Radio },
  gas: { name: 'Gas', color: '#F59E0B', bg: 'bg-amber-500', stroke: '#F59E0B', icon: Flame },
};

// Two distinct overlapping corridor polygons matching Step 2 & Step 4 specification in Belagavi
const INITIAL_WORK_ORDERS = [
  {
    id: 'wo-101',
    department: 'water',
    title: 'Water Main Pipeline Corridor (Cyan Polygon)',
    startDate: '2026-08-15',
    endDate: '2026-08-28',
    bufferM: 15,
    coords: [
      [15.8450, 74.4960],
      [15.8495, 74.5005],
      [15.8540, 74.5050],
      [15.8580, 74.5100],
    ],
    // Cyan Polygon (Polygon A)
    polygon: [
      [15.8450, 74.4960],
      [15.8510, 74.4950],
      [15.8550, 74.5015],
      [15.8520, 74.5070],
      [15.8440, 74.5030],
    ],
  },
  {
    id: 'wo-102',
    department: 'telecom',
    title: 'Optical Fiber Ducting Corridor (Magenta Polygon)',
    startDate: '2026-08-18',
    endDate: '2026-09-05',
    bufferM: 15,
    coords: [
      [15.8560, 74.4990],
      [15.8510, 74.5030],
      [15.8465, 74.5065],
      [15.8420, 74.5110],
    ],
    // Magenta / Pink Polygon (Polygon B)
    polygon: [
      [15.8480, 74.5000],
      [15.8555, 74.5000],
      [15.8575, 74.5085],
      [15.8505, 74.5105],
      [15.8455, 74.5055],
    ],
  },
];

// Exact Overlap Intersection where Polygon 1 & Polygon 2 intersect
const INITIAL_CONFLICTS = [
  {
    id: 'conflict-1',
    orderAId: 'wo-101',
    orderBId: 'wo-102',
    deptA: 'water',
    deptB: 'telecom',
    titleA: 'Water Main Corridor (Cyan)',
    titleB: 'Optical Fiber Duct (Magenta)',
    dateGapDays: 3,
    severity: 'high',
    color: '#EF4444', // Warning Red/Orange overlap
    center: [15.8505, 74.5025], // Exact intersection center where Red Dot is positioned
    // Overlapping intersection polygon between Polygon 1 & Polygon 2
    polygon: [
      [15.8480, 74.5000],
      [15.8530, 74.5000],
      [15.8550, 74.5015],
      [15.8520, 74.5055],
      [15.8465, 74.5040],
    ],
    unifiedWindow: {
      start: '2026-08-15',
      end: '2026-09-05',
    },
    approved: false,
  },
];

export default function UndergroundConflictMap() {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const layersGroupRef = useRef(null);

  // Layer Checkbox visibility state (Roads, Water, Telecom, Gas)
  const [visibleDepts, setVisibleDepts] = useState({
    roads: true,
    water: true,
    telecom: true,
    gas: true,
  });
  const [workOrders, setWorkOrders] = useState(INITIAL_WORK_ORDERS);
  const [conflicts, setConflicts] = useState(INITIAL_CONFLICTS);
  const [selectedConflict, setSelectedConflict] = useState(INITIAL_CONFLICTS[0]);
  const [algorithmTab, setAlgorithmTab] = useState(true); // Open by default matching user image
  const [simulationModal, setSimulationModal] = useState(false);
  const [simDept, setSimDept] = useState('roads');
  const [simTitle, setSimTitle] = useState('Khanapur Road Resurfacing Corridor');

  // Toggle department checkbox
  const toggleDept = (deptKey) => {
    setVisibleDepts((prev) => ({ ...prev, [deptKey]: !prev[deptKey] }));
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Dark Map Base Layer (CartoDB Dark Matter) - Belagavi City Center, Karnataka, India
    const map = L.map(mapRef.current, {
      center: [15.8505, 74.5025],
      zoom: 15,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    const layersGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layersGroup;
    leafletMap.current = map;

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // Render the 2 Corridor Polygons & Overlap Intersection with the Pulsing Red Dot
  useEffect(() => {
    if (!leafletMap.current || !layersGroupRef.current) return;
    const group = layersGroupRef.current;
    group.clearLayers();

    // 1. Draw the 2 Work Order Corridor Polygons (Cyan Polygon & Magenta Polygon)
    workOrders.forEach((order) => {
      if (!visibleDepts[order.department]) return;

      const dept = DEPARTMENTS[order.department];
      if (!dept) return;

      // Draw Outer Buffer Polygon with department color and translucent fill
      if (order.polygon) {
        const corridorPolygon = L.polygon(order.polygon, {
          color: dept.color,
          fillColor: dept.color,
          fillOpacity: 0.28,
          weight: 3,
          dashArray: '5, 5',
        }).addTo(group);

        corridorPolygon.bindTooltip(
          `<div class="font-sans font-bold text-xs" style="color: ${dept.color}">Corridor Polygon: ${order.title} (${dept.name})</div>`,
          { permanent: false, direction: 'top', className: 'dark-tooltip' }
        );
      }

      // Draw Center Polyline
      const polyline = L.polyline(order.coords, {
        color: dept.color,
        weight: 4,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(group);

      polyline.bindTooltip(
        `<div class="font-sans font-bold text-xs" style="color: ${dept.color}">${order.title}</div>`,
        { permanent: false, direction: 'top', className: 'dark-tooltip' }
      );
    });

    // 2. Draw Overlap Conflict Polygon & Pulsing Red Dot at the exact intersection
    conflicts.forEach((conflict) => {
      if (!visibleDepts[conflict.deptA] || !visibleDepts[conflict.deptB]) return;

      const isSelected = selectedConflict?.id === conflict.id;

      // Highlight the Intersection Polygon in bright red/orange
      const overlapPolygon = L.polygon(conflict.polygon, {
        color: '#EF4444',
        fillColor: '#EF4444',
        fillOpacity: isSelected ? 0.85 : 0.65,
        weight: isSelected ? 4 : 3,
        dashArray: conflict.approved ? '4, 4' : undefined,
      }).addTo(group);

      overlapPolygon.bindTooltip(
        `<div class="font-sans font-bold text-xs text-rose-400">Intersection Conflict Overlap (Gap: ${conflict.dateGapDays}d)</div>`,
        { permanent: false, direction: 'top', className: 'dark-tooltip' }
      );

      // Create Glowing Pulsing Red Dot Marker Pin at the exact intersection center
      const redDotIcon = L.divIcon({
        className: 'custom-conflict-pin',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 cursor-pointer">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-80"></span>
            <span class="relative inline-flex rounded-full h-5 w-5 bg-rose-600 border-2 border-white shadow-[0_0_16px_rgba(239,68,68,1)] items-center justify-center text-[10px] font-black text-white">
              !
            </span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const redDotMarker = L.marker(conflict.center, { icon: redDotIcon }).addTo(group);

      const handleSelect = () => {
        setSelectedConflict(conflict);
        leafletMap.current.flyTo(conflict.center, 16, { duration: 0.8 });
      };

      overlapPolygon.on('click', handleSelect);
      redDotMarker.on('click', handleSelect);
    });
  }, [visibleDepts, workOrders, conflicts, selectedConflict]);

  // Approve Unified Scheduling Window
  const handleApproveWindow = (conflictId) => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === conflictId ? { ...c, approved: true } : c))
    );
    if (selectedConflict?.id === conflictId) {
      setSelectedConflict((prev) => (prev ? { ...prev, approved: true } : null));
    }
  };

  // Reset to the 2 intersecting polygons
  const handleResetPolygons = () => {
    setWorkOrders(INITIAL_WORK_ORDERS);
    setConflicts(INITIAL_CONFLICTS);
    setSelectedConflict(INITIAL_CONFLICTS[0]);
  };

  // Clear map
  const handleClearMap = () => {
    setWorkOrders([]);
    setConflicts([]);
    setSelectedConflict(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Title Banner */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-[24px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" /> Spatial Collision & Trenching Engine
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Belagavi Underground Corridor Map
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-300">
            2 Departmental Polygons (Cyan Water & Magenta Telecom) with Red Intersection Overlap.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleResetPolygons}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Show 2 Polygons
          </button>

          {workOrders.length > 0 && (
            <button
              onClick={handleClearMap}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
            >
              Clear Map
            </button>
          )}

          <button
            onClick={() => setAlgorithmTab(!algorithmTab)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Info className="h-4 w-4 text-cyan-400" />
            {algorithmTab ? 'Hide Algorithm Spec' : 'Collision Algorithm Spec'}
          </button>
        </div>
      </div>

      {/* Collision Algorithm Stepper Diagram (Exact replica of Image 1) */}
      {algorithmTab && (
        <div className="rounded-[24px] border border-slate-800 bg-slate-950 p-6 text-slate-200 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">System Architecture</p>
              <h3 className="text-lg font-bold text-white">The Collision Algorithm: Synchronous and Geospatial</h3>
            </div>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 font-mono">
              ST_Buffer + ST_Intersects + ST_DWithin
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-4 items-stretch">
            {/* Step 1: Buffer */}
            <div className="relative rounded-2xl border border-slate-800/80 bg-slate-900/90 p-4 flex flex-col justify-between space-y-3">
              <div className="h-32 w-full rounded-xl bg-slate-950/80 border border-slate-800/60 p-3 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono">↓</div>
                <svg viewBox="0 0 160 80" className="w-full h-full">
                  <path d="M 15 65 L 50 65 L 110 15 L 145 15" fill="none" stroke="#06B6D4" strokeWidth="22" strokeLinecap="round" opacity="0.35" />
                  <path d="M 15 65 L 50 65 L 110 15 L 145 15" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm">Step 1: Buffer</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Buffer the new route by buffer_m (default 15m).
                </p>
              </div>

              <div className="rounded-lg bg-slate-950 p-2.5 text-[11px] font-mono text-cyan-300 border border-slate-800">
                ST_Buffer(route::geography, buffer_m)::geometry
              </div>

              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-slate-900 border border-slate-700 rounded-full p-1 text-slate-400">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Step 2: Intersect */}
            <div className="relative rounded-2xl border border-slate-800/80 bg-slate-900/90 p-4 flex flex-col justify-between space-y-3">
              <div className="h-32 w-full rounded-xl bg-slate-950/80 border border-slate-800/60 p-3 flex items-center justify-center relative overflow-hidden">
                <svg viewBox="0 0 160 80" className="w-full h-full">
                  {/* Cyan Polygon */}
                  <polygon points="25,45 45,15 85,15 105,45 85,75 45,75" fill="#06B6D4" fillOpacity="0.3" stroke="#06B6D4" strokeWidth="2" />
                  <polygon points="30,45 48,20 82,20 98,45 82,70 48,70" fill="none" stroke="#06B6D4" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
                  {/* Magenta Polygon */}
                  <polygon points="75,45 95,15 135,15 155,45 135,75 95,75" fill="#EC4899" fillOpacity="0.3" stroke="#EC4899" strokeWidth="2" />
                </svg>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm">Step 2: Intersect</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Query existing work orders whose buffered geometry intersects the new one using ST_Intersects and ST_DWithin.
                </p>
              </div>

              <div className="rounded-lg bg-slate-950 p-2.5 text-[11px] font-mono text-cyan-300 border border-slate-800">
                ST_Intersects & ST_DWithin
              </div>

              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-slate-900 border border-slate-700 rounded-full p-1 text-slate-400">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Step 3: Temporal Check */}
            <div className="relative rounded-2xl border border-slate-800/80 bg-slate-900/90 p-4 flex flex-col justify-between space-y-3">
              <div className="h-32 w-full rounded-xl bg-slate-950/80 border border-slate-800/60 p-3 flex flex-col justify-center relative overflow-hidden">
                <div className="grid grid-cols-6 gap-1 opacity-20 mb-2">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="h-2 rounded bg-slate-500" />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded bg-cyan-500/80 border border-cyan-400 relative">
                    <span className="absolute -top-3 right-0 text-[9px] text-white">📅</span>
                  </div>
                  <div className="h-4 w-28 rounded bg-cyan-500/80 border border-cyan-400 ml-8" />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm">Step 3: Temporal Check</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  For each spatial match, compute the date gap between the two [start_date, end_date] ranges.
                </p>
              </div>

              <div className="rounded-lg bg-slate-950 p-2.5 text-[11px] font-mono text-amber-300 border border-slate-800">
                date_gap = max(0, startB - endA)
              </div>

              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-slate-900 border border-slate-700 rounded-full p-1 text-slate-400">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Step 4: Flag & Store (Red Outlined Active Card from Screenshot) */}
            <div className="relative rounded-2xl border-2 border-rose-500/90 bg-slate-900/95 p-4 flex flex-col justify-between space-y-3 shadow-[0_0_25px_rgba(244,63,94,0.2)]">
              <div className="h-32 w-full rounded-xl bg-slate-950/90 border border-rose-500/30 p-3 flex items-center justify-center relative overflow-hidden">
                <svg viewBox="0 0 160 80" className="w-full h-full">
                  {/* Cyan Polygon */}
                  <polygon points="25,45 45,15 85,15 105,45 85,75 45,75" fill="#06B6D4" fillOpacity="0.2" stroke="#06B6D4" strokeWidth="2" />
                  {/* Magenta Polygon */}
                  <polygon points="75,45 95,15 135,15 155,45 135,75 95,75" fill="#EC4899" fillOpacity="0.2" stroke="#EC4899" strokeWidth="2" />
                  {/* Highlighted Overlap Intersection (Red / Orange) */}
                  <polygon points="75,45 85,30 95,45 85,60" fill="#F97316" fillOpacity="0.9" stroke="#EF4444" strokeWidth="2.5" />
                </svg>
                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-rose-500/20 px-1.5 py-0.5 border border-rose-500/40">
                  <Flag className="h-3 w-3 text-rose-400 fill-rose-400" />
                </div>
                <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 border border-slate-700">
                  <Database className="h-3 w-3 text-rose-400" />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm">Step 4: Flag & Store</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  If the gap is ≤ 90 days, flag a conflict, assign severity, and store the overlap polygon for map rendering.
                </p>
              </div>

              <div className="rounded-lg bg-slate-950 p-2.5 text-[11px] font-mono text-rose-300 border border-slate-800">
                INSERT INTO conflicts (...)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Map & Triage Layout */}
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        {/* MAP CONTAINER CARD */}
        <div className="relative rounded-[24px] border border-slate-800 bg-slate-950 overflow-hidden min-h-[580px] shadow-2xl flex flex-col">
          {/* Leaflet DOM container */}
          <div ref={mapRef} className="absolute inset-0 z-0 h-full w-full bg-slate-950" />

          {/* Top Left Floating Layer Checkbox Overlay */}
          <div className="absolute top-4 left-4 z-10 w-52 rounded-2xl border border-slate-800/90 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-md text-white space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Layers className="h-4 w-4 text-indigo-400" />
              <span>Corridor Layers</span>
            </div>

            <div className="space-y-2 text-xs">
              {Object.keys(DEPARTMENTS).map((key) => {
                const dept = DEPARTMENTS[key];
                const checked = visibleDepts[key];
                return (
                  <label
                    key={key}
                    className="flex items-center justify-between cursor-pointer group hover:bg-slate-900/60 p-1.5 rounded-lg transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-full border border-white/20"
                        style={{ backgroundColor: dept.color }}
                      />
                      <span className="font-medium text-slate-200 group-hover:text-white">
                        {dept.name}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDept(key)}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Top Right Conflict Summary Badge */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-full border border-rose-500/30 bg-slate-950/90 px-4 py-2 text-xs font-bold text-white shadow-2xl backdrop-blur-md">
            <ShieldAlert className="h-4 w-4 text-rose-400 animate-pulse" />
            <span>{conflicts.length} Active Conflict Zones</span>
          </div>

          {/* Bottom Left Legend for 2 Polygons & Intersection Red Dot */}
          <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-slate-800/90 bg-slate-950/90 px-4 py-2.5 text-xs text-slate-300 backdrop-blur-md">
            <span className="flex items-center gap-1.5 text-xs font-medium text-cyan-300">
              <span className="h-3 w-3 rounded-sm bg-cyan-500/40 border border-cyan-400" /> Polygon A (Water)
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-pink-300">
              <span className="h-3 w-3 rounded-sm bg-pink-500/40 border border-pink-400" /> Polygon B (Telecom)
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
              <span className="h-3 w-3 rounded-full bg-rose-600 animate-ping" /> Intersection (Red Dot Pin)
            </span>
          </div>
        </div>

        {/* RIGHT SIDEBAR: ACTIONABLE TRIAGE & UNIFIED SCHEDULING */}
        <div className="space-y-6">
          {/* CONFLICT TRIAGE DETAILS CARD */}
          <div className="rounded-[24px] border border-slate-800 bg-slate-900/90 p-6 text-slate-200 shadow-2xl backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Conflict Details</h3>
                <p className="text-xs text-slate-400 mt-0.5">Actionable Spatial & Temporal Triage</p>
              </div>
              {selectedConflict && (
                <span
                  className="rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide border"
                  style={{
                    backgroundColor: `${selectedConflict.color}15`,
                    borderColor: `${selectedConflict.color}40`,
                    color: selectedConflict.color,
                  }}
                >
                  {selectedConflict.severity} Severity
                </span>
              )}
            </div>

            {selectedConflict ? (
              <div className="space-y-6">
                {/* 1. Involved Work Orders & Date Gap */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold uppercase tracking-wider">Involved Corridor Polygons</span>
                    <span className="font-mono text-slate-300">
                      Date Gap: <strong className="text-amber-400 font-bold">{selectedConflict.dateGapDays} Days</strong>
                    </span>
                  </div>

                  <div className="grid gap-3">
                    {/* Order A (Cyan) */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 flex items-start gap-3">
                      <div
                        className="mt-1 h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: DEPARTMENTS[selectedConflict.deptA]?.color || '#06B6D4' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white truncate">{selectedConflict.titleA}</p>
                          <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded">
                            {selectedConflict.deptA}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          2026-08-15 to 2026-08-28
                        </p>
                      </div>
                    </div>

                    {/* Order B (Magenta) */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 flex items-start gap-3">
                      <div
                        className="mt-1 h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: DEPARTMENTS[selectedConflict.deptB]?.color || '#EC4899' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white truncate">{selectedConflict.titleB}</p>
                          <span className="text-[10px] uppercase font-bold text-pink-400 bg-pink-950/80 border border-pink-800 px-2 py-0.5 rounded">
                            {selectedConflict.deptB}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          2026-08-18 to 2026-09-05
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Unified Trenching Window Recommendation */}
                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    <span>AI Recommendation: Unified Trenching Window</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Merge work schedules into a single trench excavation window to prevent digging the road twice and save municipal expenditure.
                  </p>

                  <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3 flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-400">Proposed Window:</span>
                    <span className="text-emerald-400 font-bold">
                      {selectedConflict.unifiedWindow.start} → {selectedConflict.unifiedWindow.end}
                    </span>
                  </div>

                  <button
                    onClick={() => handleApproveWindow(selectedConflict.id)}
                    disabled={selectedConflict.approved}
                    className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg ${selectedConflict.approved
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30'
                      }`}
                  >
                    {selectedConflict.approved ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Window Approved & Synchronized
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Approve Unified Window
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-10 px-4 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                  <MapPin className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-white">No Active Conflict Selected</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Click on the <strong>Red Intersection Dot Pin</strong> or corridor polygons on the map to review details.
                </p>
                <button
                  onClick={handleResetPolygons}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Show 2 Polygons
                </button>
              </div>
            )}
          </div>

          {/* ALL CONFLICTS QUICK LIST */}
          <div className="rounded-[24px] border border-slate-800 bg-slate-900/90 p-5 text-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Flagged Overlaps ({conflicts.length})</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {conflicts.map((c) => {
                const isSelected = selectedConflict?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedConflict(c);
                      if (leafletMap.current) {
                        leafletMap.current.flyTo(c.center, 16);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800/50'
                      }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.titleA} × {c.titleB}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {c.deptA.toUpperCase()} & {c.deptB.toUpperCase()} • Gap: {c.dateGapDays}d
                      </p>
                    </div>
                    {c.approved && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                        Approved
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
