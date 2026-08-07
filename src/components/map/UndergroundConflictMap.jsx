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
  RefreshCw
} from 'lucide-react';

// Department Color Scheme matching Image 2:
// Roads: White (#FFFFFF)
// Water: Cyan (#00BCD4 / #06B6D4)
// Telecom: Pink/Magenta (#EC4899 / #E91E63)
// Gas: Amber/Orange (#F59E0B / #FF9800)

const DEPARTMENTS = {
  roads: { name: 'Roads', color: '#FFFFFF', bg: 'bg-white', stroke: '#FFFFFF', icon: Road },
  water: { name: 'Water', color: '#06B6D4', bg: 'bg-cyan-500', stroke: '#06B6D4', icon: Droplet },
  telecom: { name: 'Telecom', color: '#EC4899', bg: 'bg-pink-500', stroke: '#EC4899', icon: Radio },
  gas: { name: 'Gas', color: '#F59E0B', bg: 'bg-amber-500', stroke: '#F59E0B', icon: Flame },
};

// Initial Work Orders with 2 Corridor Footprint Polygons in Belagavi, Karnataka
const INITIAL_WORK_ORDERS = [
  {
    id: 'wo-101',
    department: 'roads',
    title: 'Khanapur Road Resurfacing Corridor',
    startDate: '2026-08-15',
    endDate: '2026-08-25',
    bufferM: 15,
    coords: [
      [15.8420, 74.4920],
      [15.8485, 74.4985],
      [15.8540, 74.5045],
      [15.8590, 74.5100],
    ],
    polygon: [
      [15.8415, 74.4910],
      [15.8430, 74.4930],
      [15.8600, 74.5110],
      [15.8585, 74.5090],
    ],
  },
  {
    id: 'wo-102',
    department: 'water',
    title: 'College Road Water Main Trenching Corridor',
    startDate: '2026-08-18',
    endDate: '2026-08-28',
    bufferM: 15,
    coords: [
      [15.8435, 74.4990],
      [15.8490, 74.5005],
      [15.8550, 74.5050],
      [15.8600, 74.5120],
    ],
    polygon: [
      [15.8440, 74.5005],
      [15.8425, 74.4975],
      [15.8590, 74.5105],
      [15.8605, 74.5135],
    ],
  },
];

// Pre-computed Conflict Intersection where Polygon 1 & Polygon 2 intersect
const INITIAL_CONFLICTS = [
  {
    id: 'conflict-1',
    orderAId: 'wo-101',
    orderBId: 'wo-102',
    deptA: 'roads',
    deptB: 'water',
    titleA: 'Khanapur Road Resurfacing',
    titleB: 'College Road Water Main',
    dateGapDays: 3,
    severity: 'high',
    color: '#EF4444',
    center: [15.8490, 74.5000], // Exact intersection point where red dot is positioned
    polygon: [
      [15.8480, 74.4988],
      [15.8505, 74.4995],
      [15.8500, 74.5015],
      [15.8475, 74.5008],
    ],
    unifiedWindow: {
      start: '2026-08-15',
      end: '2026-08-28',
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
  const [algorithmTab, setAlgorithmTab] = useState(false);
  const [simulationModal, setSimulationModal] = useState(false);
  const [simDept, setSimDept] = useState('telecom');
  const [simTitle, setSimTitle] = useState('Chennamma Circle 5G Fiber Duct');

  // Toggle department checkbox
  const toggleDept = (deptKey) => {
    setVisibleDepts((prev) => ({ ...prev, [deptKey]: !prev[deptKey] }));
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Dark Map Base Layer (CartoDB Dark Matter) - Belagavi City Center, Karnataka, India
    const map = L.map(mapRef.current, {
      center: [15.8497, 74.4977],
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

  // Render Polylines, 2 Corridor Polygons & Overlap Intersection with Red Dot
  useEffect(() => {
    if (!leafletMap.current || !layersGroupRef.current) return;
    const group = layersGroupRef.current;
    group.clearLayers();

    // 1. Draw the 2 Work Order Corridor Polygons (Rectangles) & Centerlines
    workOrders.forEach((order) => {
      if (!visibleDepts[order.department]) return;

      const dept = DEPARTMENTS[order.department];
      if (!dept) return;

      // Draw Corridor Buffer Polygon (Rectangle)
      if (order.polygon) {
        const corridorPolygon = L.polygon(order.polygon, {
          color: dept.color,
          fillColor: dept.color,
          fillOpacity: 0.22,
          weight: 2,
          dashArray: '4, 6',
        }).addTo(group);

        corridorPolygon.bindTooltip(
          `<div class="font-sans font-bold text-xs" style="color: ${dept.color}">Corridor Footprint: ${order.title} (${dept.name})</div>`,
          { permanent: false, direction: 'top', className: 'dark-tooltip' }
        );
      }

      // Draw Center Route Polyline
      const polyline = L.polyline(order.coords, {
        color: dept.color,
        weight: 4,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(group);

      polyline.bindTooltip(
        `<div class="font-sans font-bold text-xs" style="color: ${dept.color}">${order.title} (${dept.name})</div>`,
        { permanent: false, direction: 'top', className: 'dark-tooltip' }
      );
    });

    // 2. Draw Overlap Conflict Polygon & The Pulsing Red Dot at the exact intersection
    conflicts.forEach((conflict) => {
      // Check if both departments are visible
      if (!visibleDepts[conflict.deptA] || !visibleDepts[conflict.deptB]) return;

      const isSelected = selectedConflict?.id === conflict.id;

      // Draw the Intersection Overlap Polygon
      const overlapPolygon = L.polygon(conflict.polygon, {
        color: conflict.color,
        fillColor: conflict.color,
        fillOpacity: isSelected ? 0.8 : 0.5,
        weight: isSelected ? 3 : 2,
        dashArray: conflict.approved ? '4, 4' : undefined,
      }).addTo(group);

      // Create Custom Glowing Red Dot Pin at the exact Intersection Center
      const redDotIcon = L.divIcon({
        className: 'custom-conflict-pin',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 cursor-pointer">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-80"></span>
            <span class="relative inline-flex rounded-full h-5 w-5 bg-rose-600 border-2 border-white shadow-[0_0_15px_rgba(239,68,68,1)] items-center justify-center text-[10px] font-black text-white">
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

  // Clear all work orders from map
  const handleClearMap = () => {
    setWorkOrders([]);
    setConflicts([]);
    setSelectedConflict(null);
  };

  // Simulate / Manually plot work order collision detection
  const handleSimulateWorkOrder = () => {
    const newId = `wo-${Date.now()}`;
    const newOrderA = {
      id: 'wo-101',
      department: 'roads',
      title: 'Khanapur Road & Camp Corridor Resurfacing',
      startDate: '2026-08-15',
      endDate: '2026-08-25',
      bufferM: 15,
      coords: [
        [15.8420, 74.4920],
        [15.8485, 74.4985],
        [15.8540, 74.5045],
        [15.8590, 74.5100],
      ],
    };

    const newOrderB = {
      id: newId,
      department: simDept,
      title: simTitle,
      startDate: '2026-08-18',
      endDate: '2026-08-30',
      bufferM: 15,
      coords: [
        [15.8435, 74.4990],
        [15.8490, 74.5005],
        [15.8550, 74.5050],
        [15.8600, 74.5120],
      ],
    };

    // Create new dynamic spatial collision matching existing routes in Belagavi
    const newConflict = {
      id: `conflict-${Date.now()}`,
      orderAId: 'wo-101',
      orderBId: newId,
      deptA: 'roads',
      deptB: simDept,
      titleA: 'Khanapur Road Resurfacing',
      titleB: simTitle,
      dateGapDays: 3,
      severity: 'high',
      color: '#EF4444',
      center: [15.8490, 74.5000],
      polygon: [
        [15.8480, 74.4988],
        [15.8505, 74.4995],
        [15.8500, 74.5015],
        [15.8475, 74.5008],
      ],
      unifiedWindow: {
        start: '2026-08-15',
        end: '2026-08-30',
      },
      approved: false,
    };

    setWorkOrders([newOrderA, newOrderB]);
    setConflicts([newConflict]);
    setSelectedConflict(newConflict);
    setSimulationModal(false);
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
            Detect spatial route overlaps, calculate temporal date gaps, and approve unified trenching windows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {workOrders.length > 0 && (
            <button
              onClick={handleClearMap}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
            >
              <RefreshCw className="h-4 w-4" />
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

          <button
            onClick={() => setSimulationModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
          >
            <Plus className="h-4 w-4" />
            Add / Simulate Work Order
          </button>
        </div>
      </div>


      {/* Collision Algorithm Stepper Diagram (Image 1 Specification) */}
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

          <div className="grid gap-4 md:grid-cols-4">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400">STEP 1</span>
                <span className="text-[11px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-300 font-mono">buffer_m = 15m</span>
              </div>
              <h4 className="font-bold text-white text-sm">Step 1: Buffer</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Buffer the newly submitted route geometry by 15 meters on each side to create line corridor polygon.
              </p>
              <div className="rounded-lg bg-slate-950 p-2.5 text-[11px] font-mono text-cyan-300 border border-slate-800">
                ST_Buffer(route::geography, buffer_m)::geometry
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400">STEP 2</span>
                <span className="text-[11px] bg-cyan-500/20 px-2 py-0.5 rounded text-cyan-300 font-mono">PostGIS Query</span>
              </div>
              <h4 className="font-bold text-white text-sm">Step 2: Intersect</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Query existing active work orders whose buffered geometries spatially intersect the new corridor.
              </p>
              <div className="rounded-lg bg-slate-950 p-2.5 text-[11px] font-mono text-cyan-300 border border-slate-800">
                ST_Intersects & ST_DWithin
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">STEP 3</span>
                <span className="text-[11px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 font-mono">Temporal Range</span>
              </div>
              <h4 className="font-bold text-white text-sm">Step 3: Temporal Check</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                For each spatial match, calculate the exact date gap between the two [start_date, end_date] ranges.
              </p>
              <div className="rounded-lg bg-slate-950 p-2.5 text-[11px] font-mono text-amber-300 border border-slate-800">
                date_gap = max(0, startB - endA)
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative rounded-2xl border border-rose-500/40 bg-rose-950/20 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400">STEP 4</span>
                <span className="text-[11px] bg-rose-500/20 px-2 py-0.5 rounded text-rose-300 font-mono">Flag & Store</span>
              </div>
              <h4 className="font-bold text-white text-sm">Step 4: Flag & Store</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                If date gap ≤ 90 days, flag conflict severity (Red ≤30d, Orange 30-60d, Yellow 60-90d) & render overlap polygon.
              </p>
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

          {/* Top Left Floating Layer Checkbox Overlay (Matching Image 2 Specification) */}
          <div className="absolute top-4 left-4 z-10 w-48 rounded-2xl border border-slate-800/90 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-md text-white space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Layers className="h-4 w-4 text-indigo-400" />
              <span>Layers</span>
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

          {/* Bottom Left Legend for Severity Overlaps */}
          <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-slate-800/90 bg-slate-950/90 px-4 py-2.5 text-xs text-slate-300 backdrop-blur-md">
            <span className="font-semibold text-white text-[11px] uppercase tracking-wider">Overlap Severity:</span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-rose-400">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> High (&lt;30d)
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Medium (30-60d)
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-yellow-400">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" /> Low (60-90d)
            </span>
          </div>

        </div>

        {/* RIGHT SIDEBAR: ACTIONABLE TRIAGE & UNIFIED SCHEDULING (Matching Image 2 Specification) */}
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
                    <span className="font-semibold uppercase tracking-wider">Involved Work Orders</span>
                    <span className="font-mono text-slate-300">
                      Date Gap: <strong className="text-amber-400 font-bold">{selectedConflict.dateGapDays} Days</strong>
                    </span>
                  </div>

                  <div className="grid gap-3">
                    {/* Order A */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 flex items-start gap-3">
                      <div
                        className="mt-1 h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: DEPARTMENTS[selectedConflict.deptA]?.color || '#FFF' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white truncate">{selectedConflict.titleA}</p>
                          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {selectedConflict.deptA}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 font-mono">Order ID: {selectedConflict.orderAId}</p>
                      </div>
                    </div>

                    {/* Order B */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 flex items-start gap-3">
                      <div
                        className="mt-1 h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: DEPARTMENTS[selectedConflict.deptB]?.color || '#FFF' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white truncate">{selectedConflict.titleB}</p>
                          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {selectedConflict.deptB}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 font-mono">Order ID: {selectedConflict.orderBId}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Visualizing Overlaps Spec Box */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Layers className="h-4 w-4 text-indigo-400" />
                    <span>Visualizing Overlaps</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Red (&lt;30d), Orange (30-60d), and Yellow (60-90d) polygons rendered directly over intersecting base route corridors.
                  </p>
                </div>

                {/* 3. Unified Scheduling V1 Card (Image 2 Specification) */}
                <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 to-slate-950 p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                      <Calendar className="h-4 w-4" />
                      <span>Unified Scheduling V1</span>
                    </div>
                    {selectedConflict.approved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" /> Approved
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                        Recommendation
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Recommends a single combined trenching window across conflicting orders:
                  </p>

                  <div className="rounded-xl border border-indigo-500/20 bg-slate-950 p-3 flex items-center justify-between text-xs font-mono text-white">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">Start Window</span>
                      <strong>{selectedConflict.unifiedWindow.start}</strong>
                    </div>
                    <ArrowRight className="h-4 w-4 text-indigo-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">End Window</span>
                      <strong>{selectedConflict.unifiedWindow.end}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    Note: V1 heuristic — combined earliest-to-latest window, not an optimized schedule.
                  </p>

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
                        <CheckCircle2 className="h-4 w-4" /> Unified Trenching Approved
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Approve & Combine Window
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
                <h4 className="text-sm font-bold text-white">No Corridors Plotted</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  The Belagavi map is ready. Click <strong>"Add / Simulate Work Order"</strong> above to plot municipal corridors and detect underground collisions.
                </p>
                <button
                  onClick={() => setSimulationModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Work Order
                </button>
              </div>
            )}

          </div>

          {/* ALL CONFLICTS QUICK LIST */}
          <div className="rounded-[24px] border border-slate-800 bg-slate-900/90 p-5 text-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">All Flagged Overlaps ({conflicts.length})</h4>
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

      {/* SIMULATE WORK ORDER MODAL */}
      {simulationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-200 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-400" />
                Simulate Work Order Collision
              </h3>
              <button onClick={() => setSimulationModal(false)} className="text-slate-400 hover:text-white text-xs font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Work Order Title</label>
                <input
                  type="text"
                  value={simTitle}
                  onChange={(e) => setSimTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Department Tag</label>
                <select
                  value={simDept}
                  onChange={(e) => setSimDept(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white"
                >
                  <option value="roads">Roads (White)</option>
                  <option value="water">Water (Cyan)</option>
                  <option value="telecom">Telecom (Magenta)</option>
                  <option value="gas">Gas (Amber)</option>
                </select>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1 text-[11px] text-slate-400">
                <p className="font-semibold text-slate-300">Automated Pipeline Actions:</p>
                <p>1. ST_Buffer route by 15 meters</p>
                <p>2. Query ST_Intersects against existing routes</p>
                <p>3. Calculate date gap (1 day gap detected)</p>
                <p>4. Flag Red High Severity overlap polygon on map</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSimulationModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateWorkOrder}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
              >
                Run Collision Query
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
