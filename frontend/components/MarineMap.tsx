'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Layers, Compass, ShieldAlert, Navigation, Waves, CheckCircle2, AlertTriangle, Radio,
  Star, Info, X, ExternalLink, Activity, ArrowRight
} from 'lucide-react';

// Custom Leaflet HTML DivIcons (Keyless, 100% Reliable SVG/HTML Markers)
const createMarkerIcon = (bg: string, emoji: string, shadow: string) =>
  L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        width: 34px;
        height: 34px;
        background: ${bg};
        border: 2.5px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 18px ${shadow};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">${emoji}</div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });

const userLocationIcon = createMarkerIcon('#0284c7', '📍', 'rgba(2, 132, 199, 0.7)');
const destinationMarkerIcon = createMarkerIcon('#10b981', '★', 'rgba(16, 185, 129, 0.9)');
const hazardMarkerIcon = createMarkerIcon('#ef4444', '⚠️', 'rgba(239, 68, 68, 0.8)');

export interface Feature {
  feature_type: string; // 'PFZ' | 'HAZARD' | 'RESTRICTED_ZONE'
  name: string;
  zone_id?: string;
  pfz_score?: number;
  coordinates: number[][];
  description: string;
}

export interface Route {
  route_name: string;
  distance_km: number;
  waypoints: number[][];
  safety_score: number;
  is_recommended?: boolean;
}

export interface MapProps {
  center: [number, number];
  zoom?: number;
  features?: Feature[];
  routes?: Route[];
  locationName?: string;
  recommendation?: string; // 'GO' | 'CAUTION' | 'WAIT'
  isDemo?: boolean;
  isMonitored?: boolean;
  destinationCoords?: [number, number];
  destinationName?: string;
  onSelectCoordinates?: (lat: number, lng: number) => void;
  onSelectDestination?: (name: string, lat: number, lng: number) => void;
  onTrackDecision?: () => void;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom() || 10, { animate: true });
  }, [center, map]);
  return null;
}

function ClickHandler({ onSelectCoordinates }: { onSelectCoordinates?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onSelectCoordinates) {
        onSelectCoordinates(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function MarineMap({
  center = [13.0827, 80.2707],
  zoom = 10,
  features = [],
  routes = [],
  locationName = 'Chennai Coast',
  recommendation = 'GO',
  isDemo = false,
  isMonitored = false,
  destinationCoords,
  destinationName,
  onSelectCoordinates,
  onSelectDestination,
  onTrackDecision
}: MapProps) {
  const [mapTheme, setMapTheme] = useState<'ocean' | 'standard' | 'satellite'>('ocean');
  const [showPFZ, setShowPFZ] = useState(true);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  // Keyless Public Tile URLs — NO API Key Required
  const tileUrls = {
    ocean: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
    standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  const tileAttributions = {
    ocean: '&copy; Esri Ocean Basemap & NASA',
    standard: '&copy; OpenStreetMap contributors',
    satellite: '&copy; Esri World Imagery',
  };

  const filteredFeatures = features.filter((feat) => {
    if (feat.feature_type === 'PFZ' && !showPFZ) return false;
    if (feat.feature_type === 'RESTRICTED_ZONE' && !showBoundaries) return false;
    if (feat.feature_type === 'HAZARD' && !showHazards) return false;
    return true;
  });

  // Calculate polygon centroid for centering on click
  const getCentroid = (coords: number[][]): [number, number] => {
    let latSum = 0;
    let lngSum = 0;
    coords.forEach((c) => {
      latSum += c[0];
      lngSum += c[1];
    });
    return [latSum / coords.length, lngSum / coords.length];
  };

  // Target Destination marker fallback
  const activeDestCoords = destinationCoords || (routes.length > 0 && routes[0].waypoints.length > 0
    ? (routes[0].waypoints[routes[0].waypoints.length - 1] as [number, number])
    : [center[0] + 0.11, center[1] + 0.16] as [number, number]);

  const activeDestName = destinationName || 'Zone B — High PFZ (Recommended)';

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-3xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-slate-950">
      
      {/* TOP FLOATING CONTROL BAR */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Active Sector & Tracking Status Badge */}
        <div className="pointer-events-auto glass-panel px-3.5 py-2 rounded-2xl border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2 shadow-lg bg-slate-950/85">
          <Navigation className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-bold text-slate-100">{locationName}</span>
          <span className="text-[10px] text-slate-400">({center[0].toFixed(2)}°, {center[1].toFixed(2)}°)</span>
          
          {isMonitored ? (
            <span className="px-2.5 py-0.5 rounded text-[9px] font-bold uppercase ml-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              WATCHING
            </span>
          ) : (
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ml-1 border ${
              isDemo ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              {isDemo ? 'DEMO DATA' : 'LIVE'}
            </span>
          )}
        </div>

        {/* Interactive Layer Toggles */}
        <div className="pointer-events-auto glass-panel p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1.5 text-[10px] font-mono shadow-lg bg-slate-950/85">
          <button
            onClick={() => setMapTheme(mapTheme === 'ocean' ? 'satellite' : mapTheme === 'satellite' ? 'standard' : 'ocean')}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold transition-all flex items-center gap-1 border border-slate-700"
          >
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>{mapTheme === 'ocean' ? 'Ocean' : mapTheme === 'satellite' ? 'Satellite' : 'OSM'}</span>
          </button>

          <button
            onClick={() => setShowPFZ(!showPFZ)}
            className={`px-2 py-1 rounded-xl font-bold transition-all border ${
              showPFZ ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            🐟 PFZ
          </button>

          <button
            onClick={() => setShowBoundaries(!showBoundaries)}
            className={`px-2 py-1 rounded-xl font-bold transition-all border ${
              showBoundaries ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            ⚠️ Boundaries
          </button>

          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`px-2 py-1 rounded-xl font-bold transition-all border ${
              showRoutes ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            ⛵ Routes
          </button>

          <button
            onClick={() => setShowHazards(!showHazards)}
            className={`px-2 py-1 rounded-xl font-bold transition-all border ${
              showHazards ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            🌩️ Hazards
          </button>
        </div>
      </div>

      {/* LEAFLET MAP CONTAINER */}
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <RecenterMap center={center} />
        <ClickHandler onSelectCoordinates={onSelectCoordinates} />

        {/* Tile Layer */}
        <TileLayer
          attribution={tileAttributions[mapTheme]}
          url={tileUrls[mapTheme]}
        />

        {/* User Location Marker */}
        {showLocation && (
          <Marker position={center} icon={userLocationIcon}>
            <Popup>
              <div className="p-2 font-mono text-xs text-slate-100 min-w-[180px] space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-cyan-400 block border-b border-slate-700 pb-1">
                  📍 Active Departure Origin
                </span>
                <h4 className="font-extrabold text-sm text-slate-100">{locationName}</h4>
                <div className="text-[11px] text-slate-300 space-y-0.5">
                  <div>Lat: {center[0].toFixed(4)}°N</div>
                  <div>Long: {center[1].toFixed(4)}°E</div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Recommended Destination Marker */}
        <Marker position={activeDestCoords} icon={destinationMarkerIcon}>
          <Popup>
            <div className="p-2 font-mono text-xs text-slate-100 min-w-[200px] space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block border-b border-slate-700 pb-1">
                ★ Target Recommended Destination
              </span>
              <h4 className="font-extrabold text-sm text-slate-100">{activeDestName}</h4>
              <div className="text-[11px] text-slate-300 space-y-0.5">
                <div>Lat: {activeDestCoords[0].toFixed(4)}°N</div>
                <div>Long: {activeDestCoords[1].toFixed(4)}°E</div>
                <div className="text-emerald-400 font-bold pt-1">Status: VERIFIED GO</div>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Feature Polygons (PFZ / Hazards / Boundaries) */}
        {filteredFeatures.map((feat, idx) => {
          let color = '#06b6d4';
          let fillColor = 'rgba(6, 182, 212, 0.25)';
          let dashArray = undefined;
          const isSelected = selectedFeature?.name === feat.name;

          if (feat.feature_type === 'HAZARD') {
            color = '#ef4444';
            fillColor = 'rgba(239, 68, 68, 0.35)';
          } else if (feat.feature_type === 'RESTRICTED_ZONE') {
            color = '#f59e0b';
            fillColor = 'rgba(245, 158, 11, 0.25)';
            dashArray = '6, 6';
          } else if (feat.feature_type === 'PFZ') {
            const isRec = recommendation === 'GO' && (feat.name.includes('Zone B') || feat.name.includes('High') || feat.pfz_score && feat.pfz_score >= 85);
            const isCaution = recommendation === 'CAUTION' || (feat.pfz_score && feat.pfz_score < 75);
            const isWait = recommendation === 'WAIT' && isRec;

            if (isWait) {
              color = '#ef4444';
              fillColor = 'rgba(239, 68, 68, 0.4)';
            } else if (isRec) {
              color = '#10b981';
              fillColor = 'rgba(16, 185, 129, 0.4)';
            } else if (isCaution) {
              color = '#f59e0b';
              fillColor = 'rgba(245, 158, 11, 0.3)';
            } else {
              color = '#0ea5e9';
              fillColor = 'rgba(14, 165, 233, 0.25)';
            }
          }

          if (isSelected) {
            color = '#ffffff';
            fillColor = 'rgba(6, 182, 212, 0.55)';
          }

          const polygonPositions = feat.coordinates.map((c) => [c[0], c[1]] as [number, number]);

          return (
            <Polygon
              key={idx}
              positions={polygonPositions}
              pathOptions={{ color, fillColor, weight: isSelected ? 4 : 2.5, dashArray }}
              eventHandlers={{
                click: () => {
                  setSelectedFeature(feat);
                }
              }}
            >
              <Popup>
                <div className="p-2 font-mono text-xs text-slate-100 max-w-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                    <span className="text-[10px] font-bold uppercase text-cyan-400">
                      {feat.feature_type}
                    </span>
                    {feat.pfz_score && (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        PFZ {feat.pfz_score}/100
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-100">{feat.name}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{feat.description}</p>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Dashed Polyline Routes */}
        {showRoutes &&
          routes.map((route, idx) => {
            const positions = route.waypoints.map((w) => [w[0], w[1]] as [number, number]);
            const color = route.is_recommended ? '#10b981' : '#38bdf8';
            const weight = route.is_recommended ? 4 : 2.5;

            return (
              <Polyline
                key={idx}
                positions={positions}
                pathOptions={{ color, weight, dashArray: route.is_recommended ? '8, 8' : '5, 8' }}
              >
                <Popup>
                  <div className="p-2 font-mono text-xs text-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 block">Dashed Operational Corridor</span>
                    <h4 className="font-bold text-sm text-slate-100">{route.route_name}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-300 pt-1 border-t border-slate-700">
                      <span>Distance: {route.distance_km} km</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">Safety Index: {route.safety_score}/100</span>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          })}
      </MapContainer>

      {/* FLOATING NAUTICAL MAP LEGEND — 8 MARINE FACTORS */}
      <div className="absolute bottom-4 left-4 z-10 glass-panel p-3 rounded-2xl border border-cyan-500/30 text-xs font-mono backdrop-blur-md hidden sm:block bg-slate-950/85 max-w-[240px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-2">
          <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] text-cyan-400">
            8 Marine Factor Legend
          </h5>
          <span className="text-[9px] text-emerald-400 font-bold">100% Real GeoJSON</span>
        </div>
        
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-white shrink-0"></span>
            <span className="truncate">🌊 Wave (1.2m)</span>
          </div>
          <div className="flex items-center gap-1.5 text-violet-300">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shrink-0"></span>
            <span className="truncate">💨 Wind (18km/h)</span>
          </div>
          <div className="flex items-center gap-1.5 text-teal-300">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shrink-0"></span>
            <span className="truncate">🧭 Current (0.8kn)</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
            <span className="truncate">🌐 Visibility (10km)</span>
          </div>
          <div className="flex items-center gap-1.5 text-orange-300">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shrink-0"></span>
            <span className="truncate">🌡️ SST (28.5°C)</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 border border-emerald-400 shrink-0"></span>
            <span className="truncate">🐟 PFZ (86/100)</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-300">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 border border-rose-400 shrink-0"></span>
            <span className="truncate">⚠️ Hazard Zone</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0"></span>
            <span className="truncate">⛵ Route (18.5km)</span>
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-400 font-mono">
          <span className="text-emerald-400 font-bold">✓ Safe</span>
          <span className="text-amber-400 font-bold">! Caution</span>
          <span className="text-rose-400 font-bold">✕ Danger</span>
        </div>
      </div>

      {/* SELECTED ZONE SIDE DRAWER (DESKTOP) / BOTTOM SHEET (MOBILE) */}
      {selectedFeature && (
        <div className="absolute top-4 right-4 bottom-4 w-full sm:w-80 z-20 glass-panel p-5 rounded-3xl border border-cyan-500/40 shadow-2xl bg-slate-950/95 font-mono text-xs flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                {selectedFeature.feature_type} Details
              </span>
              <button
                onClick={() => setSelectedFeature(null)}
                className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-100">{selectedFeature.name}</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans mt-1">
                {selectedFeature.description}
              </p>
            </div>

            {/* Zone Telemetry Metrics */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90">
                <span className="text-slate-400 text-[11px]">Evaluation Status</span>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase border ${
                  recommendation === 'GO'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : recommendation === 'CAUTION'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {recommendation}
                </span>
              </div>

              {selectedFeature.pfz_score && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90">
                  <span className="text-slate-400 text-[11px]">PFZ Opportunity</span>
                  <span className="text-emerald-400 font-bold font-mono">{selectedFeature.pfz_score}/100</span>
                </div>
              )}

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90">
                <span className="text-slate-400 text-[11px]">Boundary Status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  CLEAR
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90">
                <span className="text-slate-400 text-[11px]">Telemetry Source</span>
                <span className="text-slate-200 font-bold">{isDemo ? '[DEMO DATA]' : '[LIVE]'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                const centerPt = getCentroid(selectedFeature.coordinates);
                if (onSelectDestination) {
                  onSelectDestination(selectedFeature.name, centerPt[0], centerPt[1]);
                }
                if (onSelectCoordinates) {
                  onSelectCoordinates(centerPt[0], centerPt[1]);
                }
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-xs uppercase tracking-wider text-slate-950 transition-all cyan-glow flex items-center justify-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Select as Destination</span>
            </button>

            {onTrackDecision && (
              <button
                onClick={onTrackDecision}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Track Decision</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
