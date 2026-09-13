import { Waves, Wind, Compass, Eye, Thermometer, Fish, ShieldAlert, Navigation } from 'lucide-react';

export interface FactorDefinition {
  id: string;
  label: string;
  category: string;
  unit: string;
  iconName: string;
  colorHex: string;
  textClass: string;
  borderClass: string;
  bgClass: string;
  glowClass: string;
  safeLimitText: string;
  cautionLimitText: string;
  unsafeLimitText: string;
  description: string;
}

export interface FactorValue {
  id: string;
  label: string;
  value: number | string;
  unit: string;
  numericValue: number;
  status: 'SAFE' | 'CAUTION' | 'DANGER' | 'NORMAL' | 'HIGH';
  statusText: string;
  impact: string;
  percent: number;
  source: 'LIVE' | 'CACHED' | 'DEMO DATA';
  isChanged?: boolean;
  definition: FactorDefinition;
}

export const MARINE_FACTORS_CONFIG: Record<string, FactorDefinition> = {
  wave_height: {
    id: 'wave_height',
    label: 'Wave Height',
    category: 'Marine Hydrodynamics',
    unit: 'm',
    iconName: 'Waves',
    colorHex: '#06b6d4',
    textClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/40',
    bgClass: 'bg-cyan-500/10',
    glowClass: 'cyan-glow',
    safeLimitText: '≤ 1.5 m (Safe)',
    cautionLimitText: '1.5 – 2.5 m (Caution)',
    unsafeLimitText: '> 2.5 m (Dangerous High Swell)',
    description: 'Significant ocean wave height measured from trough to crest by Open-Meteo buoy model.'
  },
  wind_speed: {
    id: 'wind_speed',
    label: 'Wind Speed',
    category: 'Atmospheric Breeze',
    unit: 'km/h',
    iconName: 'Wind',
    colorHex: '#8b5cf6',
    textClass: 'text-violet-400',
    borderClass: 'border-violet-500/40',
    bgClass: 'bg-violet-500/10',
    glowClass: 'shadow-[0_0_15px_rgba(139,92,246,0.3)]',
    safeLimitText: '≤ 25 km/h (Gentle Breeze)',
    cautionLimitText: '25 – 40 km/h (Fresh Breeze)',
    unsafeLimitText: '> 40 km/h (Gale Force Hazard)',
    description: '10m atmospheric wind velocity measured across coastal operational shelf.'
  },
  ocean_current: {
    id: 'ocean_current',
    label: 'Ocean Current',
    category: 'Surface Currents',
    unit: 'knots',
    iconName: 'Compass',
    colorHex: '#14b8a6',
    textClass: 'text-teal-400',
    borderClass: 'border-teal-500/40',
    bgClass: 'bg-teal-500/10',
    glowClass: 'shadow-[0_0_15px_rgba(20,184,166,0.3)]',
    safeLimitText: '≤ 1.5 kn (Slack Water)',
    cautionLimitText: '1.5 – 2.5 kn (Moderate Drift)',
    unsafeLimitText: '> 2.5 kn (Strong Rip/Drift)',
    description: 'Surface current speed impacting vessel drift, fuel efficiency, and net positioning.'
  },
  visibility: {
    id: 'visibility',
    label: 'Navigational Visibility',
    category: 'Atmospheric Optics',
    unit: 'km',
    iconName: 'Eye',
    colorHex: '#f59e0b',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/40',
    bgClass: 'bg-amber-500/10',
    glowClass: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    safeLimitText: '≥ 6.0 km (Clear Horizontal View)',
    cautionLimitText: '3.0 – 6.0 km (Haze / Mist)',
    unsafeLimitText: '< 3.0 km (Dense Fog Hazard)',
    description: 'Horizontal line-of-sight visual distance for safe collision avoidance and navigation.'
  },
  sea_surface_temp: {
    id: 'sea_surface_temp',
    label: 'Sea Surface Temp (SST)',
    category: 'Thermal Satellite Data',
    unit: '°C',
    iconName: 'Thermometer',
    colorHex: '#f97316',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-500/40',
    bgClass: 'bg-orange-500/10',
    glowClass: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]',
    safeLimitText: '26.0 – 30.0 °C (Nominal Range)',
    cautionLimitText: '24 – 26 °C or 30 – 31 °C',
    unsafeLimitText: '< 24 °C or > 31 °C (Thermal Anomaly)',
    description: 'Ocean skin temperature from NOAA ERDDAP / AVHRR telemetry indicating thermal fronts.'
  },
  pfz_score: {
    id: 'pfz_score',
    label: 'PFZ Fishing Yield',
    category: 'Biological Abundance',
    unit: '/100',
    iconName: 'Fish',
    colorHex: '#10b981',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/40',
    bgClass: 'bg-emerald-500/10',
    glowClass: 'emerald-glow',
    safeLimitText: '≥ 75 / 100 (High Aggregation)',
    cautionLimitText: '50 – 74 / 100 (Moderate Yield)',
    unsafeLimitText: '< 50 / 100 (Low Probability)',
    description: 'INCOIS Chlorophyll & SST thermal gradient overlay predicting pelagic fish aggregation.'
  },
  severe_hazard: {
    id: 'severe_hazard',
    label: 'Severe Hazard / Weather',
    category: 'Maritime Risk Alert',
    unit: 'State',
    iconName: 'ShieldAlert',
    colorHex: '#ef4444',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/40',
    bgClass: 'bg-rose-500/10',
    glowClass: 'rose-glow',
    safeLimitText: 'CLEAR / CLEAR_SKY (Nominal)',
    cautionLimitText: 'RAIN / OVERCAST (Elevated Alert)',
    unsafeLimitText: 'THUNDERSTORM / CYCLONE (Hard Stop)',
    description: 'Real-time severe weather alert monitoring for active lightning, squall lines, or cyclones.'
  },
  route_distance: {
    id: 'route_distance',
    label: 'Distance & Effort',
    category: 'Logistics Range',
    unit: 'km',
    iconName: 'Navigation',
    colorHex: '#a855f7',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/40',
    bgClass: 'bg-purple-500/10',
    glowClass: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]',
    safeLimitText: '< 20 km (Low Effort / Coastal)',
    cautionLimitText: '20 – 50 km (Moderate Transit)',
    unsafeLimitText: '≥ 50 km (High Fuel Consumption)',
    description: 'Transit distance from departure point to target fishing zone corridor.'
  }
};

export function extractMarineFactorValues(
  decisionData: any,
  liveSimOverrides?: { waveHeightM?: number; windSpeedKmh?: number; weatherCode?: string }
): FactorValue[] {
  const isDemo = decisionData?.is_demo ?? true;
  const sourceLabel: 'LIVE' | 'CACHED' | 'DEMO DATA' = isDemo ? 'DEMO DATA' : 'LIVE';

  // 1. WAVE HEIGHT
  const waveVal = liveSimOverrides?.waveHeightM ?? decisionData?.evidence_map?.wave_height_m ?? decisionData?.evidence?.find((e: any) => e.label?.includes('Wave'))?.value ?? 1.2;
  const numWave = typeof waveVal === 'number' ? waveVal : parseFloat(String(waveVal).replace(/[^0-9.]/g, '')) || 1.2;
  let waveStatus: 'SAFE' | 'CAUTION' | 'DANGER' = 'SAFE';
  if (numWave > 2.5) waveStatus = 'DANGER';
  else if (numWave > 1.5) waveStatus = 'CAUTION';

  // 2. WIND SPEED
  const windVal = liveSimOverrides?.windSpeedKmh ?? decisionData?.evidence_map?.wind_speed_kmh ?? decisionData?.evidence?.find((e: any) => e.label?.includes('Wind'))?.value ?? 18.0;
  const numWind = typeof windVal === 'number' ? windVal : parseFloat(String(windVal).replace(/[^0-9.]/g, '')) || 18.0;
  let windStatus: 'SAFE' | 'CAUTION' | 'DANGER' = 'SAFE';
  if (numWind > 40.0) windStatus = 'DANGER';
  else if (numWind > 25.0) windStatus = 'CAUTION';

  // 3. OCEAN CURRENT
  const curVal = decisionData?.evidence_map?.current_speed_knots ?? decisionData?.evidence?.find((e: any) => e.label?.includes('Current'))?.value ?? 0.8;
  const numCurrent = typeof curVal === 'number' ? curVal : parseFloat(String(curVal).replace(/[^0-9.]/g, '')) || 0.8;
  let currentStatus: 'SAFE' | 'CAUTION' | 'DANGER' = 'SAFE';
  if (numCurrent > 2.5) currentStatus = 'DANGER';
  else if (numCurrent > 1.5) currentStatus = 'CAUTION';

  // 4. VISIBILITY
  const visVal = decisionData?.evidence_map?.visibility_km ?? decisionData?.evidence?.find((e: any) => e.label?.includes('Visibility'))?.value ?? 10.0;
  const numVis = typeof visVal === 'number' ? visVal : parseFloat(String(visVal).replace(/[^0-9.]/g, '')) || 10.0;
  let visStatus: 'SAFE' | 'CAUTION' | 'DANGER' = 'SAFE';
  if (numVis < 3.0) visStatus = 'DANGER';
  else if (numVis < 6.0) visStatus = 'CAUTION';

  // 5. SEA SURFACE TEMP
  const sstVal = decisionData?.evidence_map?.sea_surface_temp_c ?? 28.5;
  const numSst = typeof sstVal === 'number' ? sstVal : parseFloat(String(sstVal).replace(/[^0-9.]/g, '')) || 28.5;
  let sstStatus: 'SAFE' | 'CAUTION' | 'DANGER' = 'SAFE';
  if (numSst < 24.0 || numSst > 31.0) sstStatus = 'DANGER';
  else if (numSst < 26.0 || numSst > 30.0) sstStatus = 'CAUTION';

  // 6. PFZ FISHING SCORE
  const pfzVal = decisionData?.fishing_score ?? decisionData?.evidence_map?.opportunity_score ?? 84.0;
  const numPfz = typeof pfzVal === 'number' ? pfzVal : parseFloat(String(pfzVal).replace(/[^0-9.]/g, '')) || 84.0;
  let pfzStatus: 'SAFE' | 'CAUTION' | 'DANGER' | 'HIGH' = 'HIGH';
  if (numPfz >= 75) pfzStatus = 'SAFE';
  else if (numPfz >= 50) pfzStatus = 'CAUTION';
  else pfzStatus = 'DANGER';

  // 7. SEVERE HAZARD
  const codeVal = liveSimOverrides?.weatherCode ?? decisionData?.evidence_map?.weather_code ?? (numWave > 2.5 || numWind > 40 ? 'THUNDERSTORM' : 'CLEAR_SKY');
  let hazardStatus: 'SAFE' | 'CAUTION' | 'DANGER' = 'SAFE';
  if (['THUNDERSTORM', 'SQUALL', 'CYCLONE'].includes(codeVal)) hazardStatus = 'DANGER';
  else if (['RAIN', 'OVERCAST', 'HEAVY_RAIN'].includes(codeVal)) hazardStatus = 'CAUTION';

  // 8. ROUTE DISTANCE
  const distVal = decisionData?.routes?.[0]?.distance_km ?? decisionData?.evidence_map?.distance_km ?? 18.5;
  const numDist = typeof distVal === 'number' ? distVal : parseFloat(String(distVal).replace(/[^0-9.]/g, '')) || 18.5;
  let distStatus: 'SAFE' | 'CAUTION' | 'DANGER' = 'SAFE';
  if (numDist >= 50) distStatus = 'DANGER';
  else if (numDist >= 20) distStatus = 'CAUTION';

  return [
    {
      id: 'wave_height',
      label: 'Wave Height',
      value: `${numWave.toFixed(1)} m`,
      unit: 'm',
      numericValue: numWave,
      status: waveStatus,
      statusText: waveStatus === 'SAFE' ? 'SAFE' : waveStatus === 'CAUTION' ? 'MODERATE' : 'THRESHOLD EXCEEDED',
      impact: 'High Safety Impact',
      percent: Math.min(Math.round((numWave / 3.5) * 100), 100),
      source: sourceLabel,
      isChanged: numWave > 2.5,
      definition: MARINE_FACTORS_CONFIG.wave_height
    },
    {
      id: 'wind_speed',
      label: 'Wind Speed',
      value: `${numWind.toFixed(1)} km/h`,
      unit: 'km/h',
      numericValue: numWind,
      status: windStatus,
      statusText: windStatus === 'SAFE' ? 'SAFE' : windStatus === 'CAUTION' ? 'FRESH BREEZE' : 'GALE FORCE ALERT',
      impact: 'High Safety Impact',
      percent: Math.min(Math.round((numWind / 60) * 100), 100),
      source: sourceLabel,
      isChanged: numWind > 40,
      definition: MARINE_FACTORS_CONFIG.wind_speed
    },
    {
      id: 'ocean_current',
      label: 'Ocean Current',
      value: `${numCurrent.toFixed(1)} kn`,
      unit: 'knots',
      numericValue: numCurrent,
      status: currentStatus,
      statusText: currentStatus === 'SAFE' ? 'SLACK WATER' : currentStatus === 'CAUTION' ? 'MODERATE DRIFT' : 'STRONG RIP DRIFT',
      impact: 'Medium Drift Impact',
      percent: Math.min(Math.round((numCurrent / 3.0) * 100), 100),
      source: sourceLabel,
      definition: MARINE_FACTORS_CONFIG.ocean_current
    },
    {
      id: 'visibility',
      label: 'Visibility',
      value: `${numVis.toFixed(1)} km`,
      unit: 'km',
      numericValue: numVis,
      status: visStatus,
      statusText: visStatus === 'SAFE' ? 'CLEAR VISION' : visStatus === 'CAUTION' ? 'HAZE / MIST' : 'POOR FOG VISIBILITY',
      impact: 'Navigation Safety',
      percent: Math.min(Math.round((numVis / 12) * 100), 100),
      source: sourceLabel,
      definition: MARINE_FACTORS_CONFIG.visibility
    },
    {
      id: 'sea_surface_temp',
      label: 'Sea Surface Temp',
      value: `${numSst.toFixed(1)} °C`,
      unit: '°C',
      numericValue: numSst,
      status: sstStatus,
      statusText: sstStatus === 'SAFE' ? 'NOMINAL TEMP' : 'THERMAL ANOMALY',
      impact: 'Thermal Boundary',
      percent: Math.min(Math.round(((numSst - 20) / 15) * 100), 100),
      source: isDemo ? 'DEMO DATA' : 'LIVE',
      definition: MARINE_FACTORS_CONFIG.sea_surface_temp
    },
    {
      id: 'pfz_score',
      label: 'PFZ Fishing Yield',
      value: `${numPfz.toFixed(0)} /100`,
      unit: '/100',
      numericValue: numPfz,
      status: pfzStatus,
      statusText: numPfz >= 75 ? 'HIGH YIELD' : numPfz >= 50 ? 'MODERATE YIELD' : 'LOW PROBABILITY',
      impact: 'Economic Yield',
      percent: Math.min(Math.round(numPfz), 100),
      source: 'DEMO DATA', // Curated INCOIS reference GeoJSON
      definition: MARINE_FACTORS_CONFIG.pfz_score
    },
    {
      id: 'severe_hazard',
      label: 'Severe Hazard Alert',
      value: codeVal,
      unit: 'State',
      numericValue: hazardStatus === 'DANGER' ? 100 : hazardStatus === 'CAUTION' ? 50 : 0,
      status: hazardStatus,
      statusText: hazardStatus === 'SAFE' ? 'ALL CLEAR' : hazardStatus === 'CAUTION' ? 'ELEVATED WATCH' : 'CRITICAL STORM ALERT',
      impact: 'Immediate Hard Stop',
      percent: hazardStatus === 'DANGER' ? 100 : hazardStatus === 'CAUTION' ? 50 : 10,
      source: sourceLabel,
      isChanged: hazardStatus === 'DANGER',
      definition: MARINE_FACTORS_CONFIG.severe_hazard
    },
    {
      id: 'route_distance',
      label: 'Transit Distance',
      value: `${numDist.toFixed(1)} km`,
      unit: 'km',
      numericValue: numDist,
      status: distStatus,
      statusText: distStatus === 'SAFE' ? 'COASTAL SHIFTS' : distStatus === 'CAUTION' ? 'MID-TRANSIT' : 'EXTENDED RANGE',
      impact: 'Fuel & Effort',
      percent: Math.min(Math.round((numDist / 60) * 100), 100),
      source: sourceLabel,
      definition: MARINE_FACTORS_CONFIG.route_distance
    }
  ];
}
