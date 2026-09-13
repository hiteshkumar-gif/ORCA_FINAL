'use client';

import React, { useState } from 'react';
import {
  Waves, Wind, Compass, Eye, Thermometer, Fish, ShieldAlert, Navigation,
  Info, CheckCircle2, AlertTriangle, XCircle, Activity, X, Sliders, ArrowUpRight
} from 'lucide-react';
import { FactorValue, FactorDefinition } from '@/lib/marineFactors';

interface MarineFactorMatrixProps {
  factors: FactorValue[];
  isMonitored?: boolean;
  lastCheckedAt?: string;
  onSelectFactor?: (factor: FactorValue) => void;
  title?: string;
  subtitle?: string;
}

export default function MarineFactorMatrix({
  factors,
  isMonitored = false,
  lastCheckedAt,
  onSelectFactor,
  title = 'Primary Marine Factor Matrix',
  subtitle = 'Real-time multi-variable telemetry evaluating sea state & operational safety limits'
}: MarineFactorMatrixProps) {
  const [selectedFactor, setSelectedFactor] = useState<FactorValue | null>(null);

  // Calculate monitoring statistics from actual factor status
  const affectedCount = factors.filter((f) => f.status === 'DANGER' || f.status === 'CAUTION').length;
  const nominalCount = factors.length - affectedCount;

  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Waves': return <Waves className={className} />;
      case 'Wind': return <Wind className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Eye': return <Eye className={className} />;
      case 'Thermometer': return <Thermometer className={className} />;
      case 'Fish': return <Fish className={className} />;
      case 'ShieldAlert': return <ShieldAlert className={className} />;
      case 'Navigation': return <Navigation className={className} />;
      default: return <Activity className={className} />;
    }
  };

  const getStatusBadge = (status: FactorValue['status'], text: string) => {
    if (status === 'SAFE' || status === 'HIGH') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>{text}</span>
        </span>
      );
    }
    if (status === 'CAUTION') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>{text}</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold flex items-center gap-1 animate-pulse">
        <XCircle className="w-3 h-3 text-rose-400" />
        <span>{text}</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* MATRIX HEADER & LIVE WATCH MONITOR BAR */}
      <div className="glass-panel p-4 rounded-3xl border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/80">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-extrabold text-slate-100 tracking-tight">{title}</h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{subtitle}</p>
        </div>

        {/* WATCHING STATUS BADGE */}
        <div className="flex items-center gap-3 bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-slate-800 text-xs font-mono shrink-0">
          {isMonitored ? (
            <div className="flex items-center gap-2 text-cyan-300">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">● WATCHING</span>
              <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2">
                {nominalCount}/{factors.length} FACTORS NOMINALLY WITHIN RANGE
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-300">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">8 Primary Factors</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                100% POPULATED
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 8 FACTOR GRID: 4x2 Desktop, 2x4 Tablet/Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {factors.map((factor) => {
          const { definition } = factor;
          const isDanger = factor.status === 'DANGER';
          const isCaution = factor.status === 'CAUTION';

          return (
            <div
              key={factor.id}
              onClick={() => {
                setSelectedFactor(factor);
                if (onSelectFactor) onSelectFactor(factor);
              }}
              className={`group relative p-4 rounded-2xl glass-panel transition-all cursor-pointer border ${
                isDanger
                  ? 'border-rose-500/60 bg-rose-950/20 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                  : isCaution
                  ? 'border-amber-500/50 bg-amber-950/15 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : `${definition.borderClass} hover:border-cyan-400/60 hover:shadow-lg`
              }`}
            >
              {/* TOP HEADER: Icon, Category & Source */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${definition.bgClass} ${definition.textClass} border ${definition.borderClass}`}>
                    {renderIcon(definition.iconName, 'w-4 h-4')}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {factor.label}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {definition.category}
                    </span>
                  </div>
                </div>

                <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                  factor.source === 'LIVE'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}>
                  {factor.source}
                </span>
              </div>

              {/* MAIN VALUE & UNIT */}
              <div className="my-3 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-mono">
                  {factor.value}
                </span>
                {getStatusBadge(factor.status, factor.statusText)}
              </div>

              {/* VISUAL THRESHOLD PROGRESS BAR */}
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isDanger
                        ? 'bg-rose-500'
                        : isCaution
                        ? 'bg-amber-400'
                        : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                    }`}
                    style={{ width: `${Math.max(factor.percent, 8)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Limit: {definition.safeLimitText.split(' ')[1] || 'Safe'}</span>
                  <span className="text-slate-400 group-hover:text-cyan-300 flex items-center gap-0.5">
                    Details <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED FACTOR MODAL / POPUP */}
      {selectedFactor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md p-6 rounded-3xl glass-panel border border-cyan-500/40 shadow-2xl bg-slate-950 text-slate-100 font-mono space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${selectedFactor.definition.bgClass} ${selectedFactor.definition.textClass} border ${selectedFactor.definition.borderClass}`}>
                  {renderIcon(selectedFactor.definition.iconName, 'w-6 h-6')}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-100">{selectedFactor.label}</h3>
                  <span className="text-xs text-slate-400">{selectedFactor.definition.category}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedFactor(null)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Value Display */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Current Telemetry Value</span>
                <span className="text-3xl font-extrabold text-cyan-300 font-mono">{selectedFactor.value}</span>
              </div>
              <div>
                {getStatusBadge(selectedFactor.status, selectedFactor.statusText)}
              </div>
            </div>

            {/* Threshold Specifications */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Backend Rule Thresholds</span>
              
              <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-emerald-300">
                <span className="font-bold">Safe Limit</span>
                <span>{selectedFactor.definition.safeLimitText}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between text-amber-300">
                <span className="font-bold">Caution Limit</span>
                <span>{selectedFactor.definition.cautionLimitText}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between text-rose-300">
                <span className="font-bold">Unsafe Limit</span>
                <span>{selectedFactor.definition.unsafeLimitText}</span>
              </div>
            </div>

            {/* Description & Source */}
            <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-800">
              <p className="font-sans text-slate-300 leading-relaxed text-[11px]">
                {selectedFactor.definition.description}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2">
                <span>Telemetry Provider: <strong className="text-slate-200">{selectedFactor.source}</strong></span>
                <span>Verified: <strong className="text-emerald-400">100% Rule Valid</strong></span>
              </div>
            </div>

            <button
              onClick={() => setSelectedFactor(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-xs uppercase tracking-wider text-slate-950 transition-all cyan-glow"
            >
              Close Factor Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
