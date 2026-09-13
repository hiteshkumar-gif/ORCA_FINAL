'use client';

import React, { useState } from 'react';
import { Sliders, RefreshCw, Zap, Wind, Waves, Thermometer, Droplets, Fish, Navigation, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useLocationLanguage } from '@/context/LocationLanguageContext';

export interface MarineConditionValues {
  waveHeightM: number;
  windSpeedKmh: number;
  sstAnomalyC: number;
  chlorophyllMgM3: number;
  pfzScore: number;
  distanceKm: number;
}

interface MarineConditionControlsProps {
  initialValues?: Partial<MarineConditionValues>;
  onConditionChange: (newValues: MarineConditionValues) => void;
  loading?: boolean;
}

export default function MarineConditionControls({
  initialValues,
  onConditionChange,
  loading = false
}: MarineConditionControlsProps) {
  const { location } = useLocationLanguage();

  const [values, setValues] = useState<MarineConditionValues>({
    waveHeightM: initialValues?.waveHeightM ?? 1.2,
    windSpeedKmh: initialValues?.windSpeedKmh ?? 18.0,
    sstAnomalyC: initialValues?.sstAnomalyC ?? 0.4,
    chlorophyllMgM3: initialValues?.chlorophyllMgM3 ?? 2.8,
    pfzScore: initialValues?.pfzScore ?? 89,
    distanceKm: initialValues?.distanceKm ?? 15.4
  });

  const handleChange = (key: keyof MarineConditionValues, val: number) => {
    const updated = { ...values, [key]: val };
    setValues(updated);
    onConditionChange(updated);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 space-y-6 shadow-2xl backdrop-blur-2xl">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              Interactive Marine Parameter Controls
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Adjust oceanographic factors to trigger live deterministic engine re-evaluation
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
          📍 {location.city} Sector
        </span>
      </div>

      {/* 6 ADJUSTABLE INDICATOR SLIDERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
        
        {/* 1. WAVE HEIGHT */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold">
              <Waves className="w-4 h-4 text-cyan-400" />
              Significant Wave Height
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              values.waveHeightM <= 1.5 ? 'bg-emerald-500/20 text-emerald-300' : values.waveHeightM <= 2.5 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {values.waveHeightM.toFixed(1)} m
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="4.5"
            step="0.1"
            value={values.waveHeightM}
            onChange={(e) => handleChange('waveHeightM', parseFloat(e.target.value))}
            className="w-full cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>0.5m (Calm)</span>
            <span>1.5m (Limit)</span>
            <span>4.5m (Storm)</span>
          </div>
        </div>

        {/* 2. WIND SPEED */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold">
              <Wind className="w-4 h-4 text-teal-400" />
              Surface Wind Velocity
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              values.windSpeedKmh <= 25 ? 'bg-emerald-500/20 text-emerald-300' : values.windSpeedKmh <= 40 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {values.windSpeedKmh.toFixed(0)} km/h
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="65"
            step="1"
            value={values.windSpeedKmh}
            onChange={(e) => handleChange('windSpeedKmh', parseFloat(e.target.value))}
            className="w-full cursor-pointer accent-teal-400"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>5 km/h (Breeze)</span>
            <span>25 km/h (Limit)</span>
            <span>65 km/h (Gale)</span>
          </div>
        </div>

        {/* 3. SEA SURFACE TEMP ANOMALY */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold">
              <Thermometer className="w-4 h-4 text-amber-400" />
              SST Anomaly (°C)
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300">
              {values.sstAnomalyC >= 0 ? `+${values.sstAnomalyC.toFixed(1)}` : values.sstAnomalyC.toFixed(1)} °C
            </span>
          </div>
          <input
            type="range"
            min="-2.0"
            max="3.5"
            step="0.1"
            value={values.sstAnomalyC}
            onChange={(e) => handleChange('sstAnomalyC', parseFloat(e.target.value))}
            className="w-full cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>-2.0°C</span>
            <span>0.0°C (Nominal)</span>
            <span>+3.5°C</span>
          </div>
        </div>

        {/* 4. CHLOROPHYLL DENSITY */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold">
              <Droplets className="w-4 h-4 text-emerald-400" />
              Chlorophyll-a Concentration
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300">
              {values.chlorophyllMgM3.toFixed(1)} mg/m³
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="5.0"
            step="0.1"
            value={values.chlorophyllMgM3}
            onChange={(e) => handleChange('chlorophyllMgM3', parseFloat(e.target.value))}
            className="w-full cursor-pointer accent-emerald-400"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>0.2 (Low)</span>
            <span>2.5 (High)</span>
            <span>5.0 (Bloom)</span>
          </div>
        </div>

        {/* 5. PFZ FISHING SCORE */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold">
              <Fish className="w-4 h-4 text-teal-300" />
              PFZ Opportunity Score
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-500/20 text-teal-300">
              {values.pfzScore.toFixed(0)} / 100
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="1"
            value={values.pfzScore}
            onChange={(e) => handleChange('pfzScore', parseFloat(e.target.value))}
            className="w-full cursor-pointer accent-teal-300"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>10 (Low Density)</span>
            <span>50 (Moderate)</span>
            <span>100 (Prime PFZ)</span>
          </div>
        </div>

        {/* 6. TRAVEL DISTANCE */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold">
              <Navigation className="w-4 h-4 text-indigo-400" />
              Sector Distance / Effort
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300">
              {values.distanceKm.toFixed(1)} km
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="120"
            step="1"
            value={values.distanceKm}
            onChange={(e) => handleChange('distanceKm', parseFloat(e.target.value))}
            className="w-full cursor-pointer accent-indigo-400"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>5 km (Inshore)</span>
            <span>50 km (Offshore)</span>
            <span>120 km (Deep Sea)</span>
          </div>
        </div>

      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-cyan-400 pt-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Re-evaluating ORCA Deterministic Rules...</span>
        </div>
      )}
    </div>
  );
}
