'use client';

import React from 'react';
import { Wind, Waves, Thermometer, Droplet, ShieldAlert } from 'lucide-react';

interface BeaufortWidgetProps {
  windSpeedKmh?: number;
  waveHeightM?: number;
  sstAnomalyC?: number;
  chlorophyllMgM3?: number;
}

export default function BeaufortScaleWidget({
  windSpeedKmh = 18.5,
  waveHeightM = 1.2,
  sstAnomalyC = +0.4,
  chlorophyllMgM3 = 1.85,
}: BeaufortWidgetProps) {
  // Compute Beaufort Scale force from wind speed in km/h
  // Formula approx: Force = round((wind_kmh / 3.01) ** (2/3))
  const getBeaufortForce = (kmh: number) => {
    const knots = kmh / 1.852;
    if (knots < 1) return { force: 0, name: 'Calm', desc: 'Mirror-like sea surface' };
    if (knots <= 3) return { force: 1, name: 'Light Air', desc: 'Ripples with appearance of scales' };
    if (knots <= 6) return { force: 2, name: 'Light Breeze', desc: 'Small wavelets, crests do not break' };
    if (knots <= 10) return { force: 3, name: 'Gentle Breeze', desc: 'Large wavelets, crests begin to break' };
    if (knots <= 16) return { force: 4, name: 'Moderate Breeze', desc: 'Small waves, frequent white horses' };
    if (knots <= 21) return { force: 5, name: 'Fresh Breeze', desc: 'Moderate waves, many white horses' };
    if (knots <= 27) return { force: 6, name: 'Strong Breeze', desc: 'Large waves, spray appears' };
    if (knots <= 33) return { force: 7, name: 'High Wind', desc: 'Sea heaps up, white foam blown in streaks' };
    if (knots <= 40) return { force: 8, name: 'Gale', desc: 'Moderately high waves of greater length' };
    return { force: 9, name: 'Severe Gale', desc: 'High waves, dense foam streaks' };
  };

  const beaufort = getBeaufortForce(windSpeedKmh);

  return (
    <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-cyan-400" />
          Marine Telemetry & Sea State Gauge
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
          Beaufort Force {beaufort.force}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        {/* Wind Speed & Beaufort */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
            <Wind className="w-3 h-3 text-cyan-400" />
            Wind Velocity
          </div>
          <div className="text-sm font-bold text-slate-100">{windSpeedKmh} km/h</div>
          <div className="text-[9px] text-cyan-300 truncate">{beaufort.name}</div>
        </div>

        {/* Wave Height */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
            <Waves className="w-3 h-3 text-teal-400" />
            Significant Wave
          </div>
          <div className="text-sm font-bold text-slate-100">{waveHeightM} meters</div>
          <div className="text-[9px] text-teal-300">T_p: 6.8s Period</div>
        </div>

        {/* SST Anomaly */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-amber-400" />
            SST Anomaly
          </div>
          <div className="text-sm font-bold text-amber-300">+{sstAnomalyC}°C</div>
          <div className="text-[9px] text-slate-400">28.4°C Surface</div>
        </div>

        {/* Chlorophyll Density */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
            <Droplet className="w-3 h-3 text-emerald-400" />
            Chlorophyll-A
          </div>
          <div className="text-sm font-bold text-emerald-400">{chlorophyllMgM3} mg/m³</div>
          <div className="text-[9px] text-emerald-300 font-bold">PFZ High Density</div>
        </div>
      </div>
    </div>
  );
}
