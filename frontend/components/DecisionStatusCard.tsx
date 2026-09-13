'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, XCircle, Activity, Award, CheckCircle2, Zap, ArrowUpRight } from 'lucide-react';
import VoiceControl from './VoiceControl';

interface DecisionStatusCardProps {
  recommendation: 'GO' | 'CAUTION' | 'WAIT' | string;
  overallScore: number;
  safetyScore: number;
  fishingScore: number;
  travelScore: number;
  explanation: string;
  locationName: string;
  decisionCode: string;
  isMonitored?: boolean;
}

export default function DecisionStatusCard({
  recommendation,
  overallScore,
  safetyScore,
  fishingScore,
  travelScore,
  explanation,
  locationName,
  decisionCode,
  isMonitored = false
}: DecisionStatusCardProps) {

  const statusConfig = {
    GO: {
      color: 'from-emerald-500/20 via-teal-500/10 to-slate-900',
      border: 'border-emerald-500/50 hover:border-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 emerald-glow',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      title: 'GO — CONDITIONS SAFE FOR SAIL',
      desc: 'All wave, wind, and oceanographic thresholds are within safe operational limits.'
    },
    CAUTION: {
      color: 'from-amber-500/20 via-yellow-500/10 to-slate-900',
      border: 'border-amber-500/50 hover:border-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.35)]',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      title: 'CAUTION — MODERATE SEA HAZARDS',
      desc: 'Elevated wave swell or wind speed detected. Proceed only with certified safety gear.'
    },
    WAIT: {
      color: 'from-rose-500/20 via-red-500/10 to-slate-900',
      border: 'border-rose-500/50 hover:border-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/60 rose-glow',
      icon: XCircle,
      iconColor: 'text-rose-400',
      title: 'WAIT — UNSAFE MARINE CONDITIONS',
      desc: 'Significant wave height or wind velocity exceeds safe maritime limits. Delay departure.'
    }
  };

  const current = statusConfig[recommendation as keyof typeof statusConfig] || statusConfig.GO;
  const StatusIcon = current.icon;

  return (
    <div className={`relative p-6 sm:p-8 rounded-3xl glass-panel border ${current.border} bg-gradient-to-br ${current.color} shadow-2xl space-y-6 overflow-hidden backdrop-blur-2xl transition-all duration-500`}>
      
      {/* BACKGROUND DECORATIVE SHIMMER */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-cyan-400 font-bold px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
              {decisionCode || 'ORCA-9327'}
            </span>
            <span className="text-[10px] font-mono uppercase text-slate-400">
              {isMonitored ? '🟢 Background Watch Active' : 'Deterministic Rule Engine Verified'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">
            {locationName}
          </h2>
        </div>

        {/* ANIMATED STATUS BADGE */}
        <AnimatePresence mode="wait">
          <motion.div
            key={recommendation}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`px-5 py-2.5 rounded-2xl text-lg font-mono font-extrabold tracking-wider border flex items-center gap-2.5 ${current.badge}`}
          >
            <StatusIcon className={`w-6 h-6 ${current.iconColor} animate-pulse`} />
            <span>{recommendation}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* SCORES BREAKDOWN GRID */}
      <div className="grid grid-cols-3 gap-4 font-mono text-center">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase text-slate-500 font-bold block">Overall Index</span>
          <motion.span
            key={overallScore}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-extrabold text-cyan-400 block"
          >
            {overallScore.toFixed(1)}
          </motion.span>
          <span className="text-[9px] text-slate-500 block">/ 100</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase text-slate-500 font-bold block">Safety Core (50%)</span>
          <motion.span
            key={safetyScore}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-2xl font-extrabold block ${safetyScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}
          >
            {safetyScore.toFixed(1)}
          </motion.span>
          <span className="text-[9px] text-slate-500 block">/ 100</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase text-slate-500 font-bold block">Fishing Yield (30%)</span>
          <motion.span
            key={fishingScore}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-extrabold text-teal-300 block"
          >
            {fishingScore.toFixed(1)}
          </motion.span>
          <span className="text-[9px] text-slate-500 block">/ 100</span>
        </div>
      </div>

      {/* RATIONALE EXPLANATION */}
      <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
        <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          Deterministic Explainability Synthesis
        </span>
        <p className="text-xs text-slate-200 leading-relaxed font-sans">
          {explanation}
        </p>
        <VoiceControl text={explanation} />
      </div>

      {/* DETERMINISTIC FORMULA CAPTION */}
      <div className="text-[10px] font-mono text-slate-500 text-center flex items-center justify-center gap-2 pt-1 border-t border-slate-800/60">
        <span>Formula: 0.50 × Safety + 0.30 × Fishing + 0.20 × Travel Effort</span>
      </div>
    </div>
  );
}
