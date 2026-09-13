'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Cpu, Activity, CheckCircle2, Clock, Zap, Layers, RefreshCw } from 'lucide-react';
import { getApiBase } from '@/lib/config';

export default function AgentsPage() {
  const API_BASE = getApiBase();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/agents`);
      setAgents(res.data);
      if (res.data.length > 0) setSelectedAgent(res.data[0]);
    } catch (err) {
      console.error('Fetch agents error', err);
    } finally {
      setLoading(false);
    }
  };

  const agentDescriptions: Record<string, string> = {
    "Orchestrator Agent": "Parallel task dispatch & execution pipeline coordinator across all 12 specialized agents.",
    "Intent & Language Agent": "Extracts location, target departure time, vessel activity, and regional language intent (EN, TA, HI).",
    "Marine Data Agent": "Fetches wave height, wave period T_p, swell direction, and ocean current velocity.",
    "Weather Agent": "Retrieves surface wind velocity, gust speed, air temperature, visibility, and precipitation probability.",
    "Satellite / Earth Observation Agent": "Analyzes MODIS Chlorophyll-a density clusters and Sea Surface Temperature (SST) anomalies.",
    "Fishing Opportunity Agent": "Computes Potential Fishing Zone (PFZ) pelagic density score and target species availability.",
    "Geospatial Agent": "Performs Haversine distance math, Shapely polygon hazard intersection, and GeoJSON map formatting.",
    "Safety Agent": "Synthesizes multi-source risk factors and verifies deterministic safety rule boundaries.",
    "Route Optimization Agent": "Generates Direct Deep-Water and Inshore Sheltered route corridors with ETA & fuel calculations.",
    "Decision Agent": "Synthesizes multi-agent evidence payloads and invokes the Python Deterministic Scoring Engine.",
    "Monitoring Agent": "Monitors active living decision snapshots via APScheduler loop and flags material deltas (>0.5m wave, >10km/h wind).",
    "Feedback / Learning Agent": "Logs post-mission vessel outcomes and calibrates safety model scoring thresholds."
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <Cpu className="w-7 h-7 text-cyan-400" />
            Agent Observatory Command Center
          </h1>
          <p className="text-sm text-slate-400 font-mono mt-1">
            Real-time execution telemetry and audit logs across all 12 specialized collaborative AI agents.
          </p>
        </div>

        <button
          onClick={fetchAgents}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-xs font-bold transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {loading ? (
        <div className="glass-panel p-12 rounded-3xl text-center text-slate-400 font-mono">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-3" />
          Loading Agent Observatory telemetry...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: 12 Agents Grid List (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((ag, idx) => {
              const isSelected = selectedAgent?.agent_name === ag.agent_name;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedAgent(ag)}
                  className={`p-4 rounded-2xl glass-panel border cursor-pointer transition-all space-y-3 ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/30 cyan-glow'
                      : 'border-slate-800 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <h3 className="font-bold text-xs text-slate-100">{ag.agent_name}</h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                      {ag.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans line-clamp-2 leading-relaxed">
                    {agentDescriptions[ag.agent_name] || ag.last_message}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-[9px] uppercase block text-slate-500">Executions</span>
                      <span className="text-cyan-300 font-bold">{ag.total_executions} tasks</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase block text-slate-500">Latency</span>
                      <span className="text-slate-200">{ag.last_duration_ms} ms</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Agent Activity Inspector (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedAgent ? (
              <div className="glass-panel p-6 rounded-3xl border-cyan-500/30 space-y-4 sticky top-24">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Agent Telemetry Inspector</span>
                    <h2 className="text-lg font-extrabold text-slate-100">{selectedAgent.agent_name}</h2>
                  </div>
                  <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Cpu className="w-5 h-5" />
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Agent Core Responsibility</span>
                    <p className="text-slate-200 font-sans text-xs leading-relaxed">
                      {agentDescriptions[selectedAgent.agent_name] || 'Specialized agent task execution.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Last Output Dispatch</span>
                    <p className="text-cyan-300 font-mono text-xs">{selectedAgent.last_message}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Last Execution</span>
                      <span className="text-slate-200 font-bold">{new Date(selectedAgent.last_execution).toLocaleTimeString()}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Execution Status</span>
                      <span className="text-emerald-400 font-bold">{selectedAgent.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-8 rounded-3xl text-center text-slate-400 font-mono text-xs">
                Select an agent on the left to inspect detailed telemetry.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
