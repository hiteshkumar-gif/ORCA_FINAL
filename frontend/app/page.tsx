'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Cpu, Activity, ArrowRight, CheckCircle2, Radio } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-24 py-12">
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-widest uppercase mb-4 cyan-glow">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          Agentic AI Marine Intelligence & Decision Core
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-100 tracking-tight leading-tight">
          Marine Ecosystem Reasoning with{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent cyan-text-glow">
            Collaborative AI Agents
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
          Converting fragmented oceanographic, weather, satellite, and geospatial data into explainable, continuously monitored decisions for maritime operators, fishermen, and disaster management authorities.
        </p>

        {/* CALL TO ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm uppercase tracking-wider transition-all cyan-glow flex items-center justify-center gap-3"
          >
            <Compass className="w-5 h-5" />
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/agents"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel text-slate-200 hover:text-cyan-300 border-cyan-500/30 hover:border-cyan-400 font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3"
          >
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>Explore Agent Observatory</span>
          </Link>
        </div>

        {/* 2D MARINE TELEMETRY RADAR HERO PANEL */}
        <div className="pt-6 max-w-5xl mx-auto text-left">
          <div className="glass-panel p-8 rounded-3xl border-cyan-500/30 space-y-6 bg-slate-950/60 cyan-glow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                    <span>Live Marine Telemetry & Reasoning Engine</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Direct integration with Open-Meteo, INCOIS PFZ, MODIS Satellite & Geospatial Risk Layers
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30 font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Continuous Real-Time Telemetry Active
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">Active Sector</span>
                <span className="text-sm font-bold text-slate-100">Chennai Coastal Sector</span>
                <span className="text-[10px] text-cyan-400 block pt-1">Lat 13.0827°N, Long 80.2707°E</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">Surface Wave Telemetry</span>
                <span className="text-sm font-bold text-cyan-300">1.8 m (7.0s period)</span>
                <span className="text-[10px] text-emerald-400 block pt-1">Open-Meteo Live Feed</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">Surface Wind Velocity</span>
                <span className="text-sm font-bold text-teal-300">18.4 kn (240° SW)</span>
                <span className="text-[10px] text-emerald-400 block pt-1">Live Anemometer Stream</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">Satellite PFZ Index</span>
                <span className="text-sm font-bold text-emerald-300">PFZ Score 72 / 100</span>
                <span className="text-[10px] text-indigo-300 block pt-1">MODIS Chlorophyll-a 1.85 mg/m³</span>
              </div>
            </div>
          </div>
        </div>

        {/* LIVE METRICS TICKER BAR */}
        <div className="pt-10 max-w-5xl mx-auto">
          <div className="glass-panel p-4 rounded-2xl border border-cyan-500/20 grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Agents Orchestrated</span>
              <span className="text-base font-extrabold text-cyan-400 block">12 Parallel AI Agents</span>
            </div>
            <div className="space-y-1 border-l border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Safety Guarantee</span>
              <span className="text-base font-extrabold text-emerald-400 block">100% Deterministic Engine</span>
            </div>
            <div className="space-y-1 border-l border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Multilingual Support</span>
              <span className="text-base font-extrabold text-teal-300 block">EN, Tamil, Hindi, Hinglish</span>
            </div>
            <div className="space-y-1 border-l border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Lifecycle Watch</span>
              <span className="text-base font-extrabold text-indigo-300 block">APScheduler Live Loop</span>
            </div>
          </div>
        </div>

        {/* FEATURE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="glass-panel p-6 rounded-3xl border-cyan-500/20 glass-card-hover space-y-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-100">12 Specialized AI Agents</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Parallel execution across Intent, Marine, Weather, Satellite, Fishing Opportunity, Geospatial, Safety, Route, and Monitoring agents.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border-cyan-500/20 glass-card-hover space-y-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-100">Deterministic Safety Core</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Critical safety decisions are governed by rule-based Python algorithms with configurable thresholds, guaranteed decoupled from direct LLM output.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border-cyan-500/20 glass-card-hover space-y-3">
            <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 w-fit">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-100">Living Decision Lifecycle</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Continuous background monitoring detects material condition changes (e.g. wave height shifts &gt; 0.5m) and automatically updates recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* LIVING DECISION LIFECYCLE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
            Continuous Operational Safety
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
            Living Decision Lifecycle Workflow
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm font-sans leading-relaxed">
            Unlike static advice tools, ORCA recommendations stay alive, continuously checking environmental deltas until mission completion.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border-cyan-500/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            {[
              { step: '01', title: 'DECIDE', desc: 'Natural language intent extracted & deterministic score calculated' },
              { step: '02', title: 'WATCH', desc: 'APScheduler background loop monitors marine deltas' },
              { step: '03', title: 'CHANGE', desc: 'Material wave/wind delta triggers re-evaluation alert' },
              { step: '04', title: 'REPAIR / WAIT', desc: 'Audio alert issued with delayed departure or sheltered route' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-3 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/30">
                  STEP {item.step}
                </span>
                <h4 className="font-extrabold text-slate-100 text-base mt-2">{item.title}</h4>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
