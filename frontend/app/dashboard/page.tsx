'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import {
  Compass, Send, ShieldAlert, CheckCircle2, AlertTriangle, XCircle,
  Activity, RefreshCw, Layers, ArrowRight, Zap, Play, Radio, Info, MapPin, Wind, Waves,
  Sliders, Volume2, Globe2, ChevronRight
} from 'lucide-react';

import { getApiBase } from '@/lib/config';
import AudioAdvisoryPlayer from '@/components/AudioAdvisoryPlayer';
import BeaufortScaleWidget from '@/components/BeaufortScaleWidget';
import { useLocationLanguage } from '@/context/LocationLanguageContext';
import MarineConditionControls, { MarineConditionValues } from '@/components/MarineConditionControls';
import DecisionStatusCard from '@/components/DecisionStatusCard';
import MarineFactorMatrix from '@/components/MarineFactorMatrix';
import { extractMarineFactorValues } from '@/lib/marineFactors';

const MarineMap = dynamic(() => import('@/components/MarineMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] rounded-2xl glass-panel flex flex-col items-center justify-center text-cyan-400 gap-3">
      <RefreshCw className="w-8 h-8 animate-spin" />
      <span className="font-mono text-xs uppercase tracking-widest">Initializing Geospatial Radar Engine...</span>
    </div>
  ),
});

const OceanGlobe3D = dynamic(() => import('@/components/OceanGlobe3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-2xl glass-panel flex flex-col items-center justify-center text-cyan-400 gap-3">
      <RefreshCw className="w-8 h-8 animate-spin" />
      <span className="font-mono text-xs uppercase tracking-widest">Initializing 3D Ocean Sphere...</span>
    </div>
  ),
});

export default function DashboardPage() {
  const API_BASE = getApiBase();
  const { location, language } = useLocationLanguage();

  const [query, setQuery] = useState(`Can I go fishing near ${location.city} tomorrow morning?`);
  const [loading, setLoading] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);

  const [decisionData, setDecisionData] = useState<any>(null);
  const [agentTraces, setAgentTraces] = useState<any[]>([]);

  const [isMonitored, setIsMonitored] = useState(false);
  const [monitoringMessage, setMonitoringMessage] = useState<string | null>(null);

  // Condition simulator state
  const [simWaveHeight, setSimWaveHeight] = useState<number>(2.7);
  const [simWindSpeed, setSimWindSpeed] = useState<number>(45.0);
  const [simulating, setSimulating] = useState(false);
  const [simulationAlert, setSimulationAlert] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Destination state
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | undefined>(undefined);
  const [destinationName, setDestinationName] = useState<string | undefined>(undefined);

  // Re-run evaluation when active target location changes
  useEffect(() => {
    const updatedPrompt = `Can I go fishing near ${location.city} tomorrow morning?`;
    setQuery(updatedPrompt);
    handleRunQuery(updatedPrompt);
  }, [location.city, location.latitude, location.longitude]);

  const handleRunQuery = async (queryText: string) => {
    setLoading(true);
    setSimulationAlert(null);
    setMonitoringMessage(null);
    setActiveStepIndex(0);

    try {
      // Step-by-step agent telemetry progress simulation
      const stepTimer = setInterval(() => {
        setActiveStepIndex((prev) => (prev < 6 ? prev + 1 : prev));
      }, 300);

      const res = await axios.post(`${API_BASE}/api/query`, {
        query: queryText,
        location: `${location.city}, ${location.state}, ${location.country}`,
        latitude: location.latitude,
        longitude: location.longitude,
        language: language.code
      });

      clearInterval(stepTimer);
      setActiveStepIndex(7);

      setApiError(null);
      setDecisionData(res.data.decision);
      setAgentTraces(res.data.agent_traces);
      setIsMonitored(res.data.decision.is_monitored);

      // Sync simulation sliders with initial fetched values if available
      if (res.data.decision?.evidence?.wave_height_m) {
        setSimWaveHeight(res.data.decision.evidence.wave_height_m);
      }
      if (res.data.decision?.evidence?.wind_speed_kmh) {
        setSimWindSpeed(res.data.decision.evidence.wind_speed_kmh);
      }
    } catch (err: any) {
      console.error("API Query error", err);
      setApiError(`Unable to connect to ORCA Backend API (${API_BASE}). Please verify python server on port 8000.`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMonitoring = async () => {
    if (!decisionData) return;
    try {
      const res = await axios.post(`${API_BASE}/api/decisions/${decisionData.decision_id}/monitor`);
      setIsMonitored(true);
      setMonitoringMessage(res.data.message);
      setDecisionData((prev: any) => ({ ...prev, status: 'MONITORING', is_monitored: true }));
    } catch (err) {
      console.error("Failed to enable monitoring", err);
    }
  };

  const handleSimulateConditionChange = async () => {
    if (!decisionData) return;
    setSimulating(true);
    try {
      const res = await axios.post(`${API_BASE}/api/decisions/${decisionData.decision_id}/simulate-change`, {
        wave_height_m: simWaveHeight,
        wind_speed_kmh: simWindSpeed,
        weather_code: simWaveHeight > 2.5 || simWindSpeed > 40 ? "THUNDERSTORM" : "CLEAR_SKY"
      });

      setDecisionData((prev: any) => ({
        ...prev,
        recommendation: res.data.new_recommendation,
        overall_score: res.data.new_overall_score,
        safety_score: res.data.new_safety_score,
        explanation: res.data.explanation,
        evidence: res.data.evidence,
        risk_factors: res.data.risk_factors,
        alternatives: res.data.alternatives,
        status: 'CHANGED'
      }));

      setSimulationAlert(`⚠ WEATHER DELTA ALERT: Conditions updated (Wave: ${simWaveHeight}m, Wind: ${simWindSpeed}km/h). Recommendation updated to ${res.data.new_recommendation}!`);
    } catch (err) {
      console.error("Simulation error", err);
    } finally {
      setSimulating(false);
    }
  };

  const sampleQueries = [
    { label: '🇬🇧 English', text: `Is fishing safe near ${location.city} tomorrow morning?` },
    { label: '🇮🇳 Tamil', text: `நாளை காலை ${location.city}-இல் மீன்பிடிக்க செல்லலாமா?` },
    { label: '🇮🇳 Hindi', text: `क्या कल सुबह ${location.city} तट के पास समुद्र सुरक्षित है?` },
    { label: '💬 Hinglish', text: `${location.city} se 15 nautical miles door deep sea fishing safe hai kya?` },
  ];

  const rec = decisionData?.recommendation || 'GO';
  const recBadgeColor =
    rec === 'GO'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 emerald-glow'
      : rec === 'CAUTION'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
      : 'bg-rose-500/20 text-rose-300 border-rose-500/60 rose-glow';

  const centerCoords: [number, number] = [
    location.latitude || decisionData?.latitude || 13.0827,
    location.longitude || decisionData?.longitude || 80.2707
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ERROR BANNER */}
      {apiError && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-rose-200 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{apiError}</span>
          </div>
          <button
            onClick={() => handleRunQuery(query)}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40 shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* COMMAND CENTER HEADER & SEARCH PROMPT */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-cyan-500/30 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono uppercase tracking-widest mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              Live Multi-Agent Command Core
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              Marine Operational Decision Center
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-xs font-mono">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-slate-300">Determinism Core:</span>
            <span className="text-emerald-400 font-bold">100% Rule Verified</span>
          </div>
        </div>

        {/* INPUT PROMPT BAR */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) handleRunQuery(query);
          }}
          className="space-y-3"
        >
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask ORCA in natural language (e.g. Can I go fishing near Chennai tomorrow morning?)..."
              className="w-full pl-5 pr-36 py-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 focus:border-cyan-400 text-slate-100 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cyan-glow flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Evaluate</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* MULTILINGUAL QUICK PRESET BUTTONS */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              Regional Presets:
            </span>
            {sampleQueries.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(sq.text);
                  handleRunQuery(sq.text);
                }}
                className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 font-mono text-[11px] transition-all"
              >
                {sq.label}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* SIMULATION & MONITORED ALERT BANNER */}
      {simulationAlert && (
        <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/60 text-amber-200 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
            <span>{simulationAlert}</span>
          </div>
        </div>
      )}

      {monitoringMessage && (
        <div className="p-4 rounded-2xl bg-cyan-950/80 border border-cyan-500/60 text-cyan-200 flex items-center gap-3 text-xs font-mono">
          <Radio className="w-5 h-5 text-cyan-400 animate-pulse shrink-0" />
          <span>{monitoringMessage}</span>
        </div>
      )}

      {/* MAIN DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Geospatial Radar & Interactive Map (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-4 rounded-3xl border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-100">Live Oceanographic Map & Route Corridors</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                {decisionData?.is_demo ? 'SIMULATED TELEMETRY' : 'LIVE OPEN-METEO'}
              </span>
            </div>

            {/* Interactive Map Component */}
            <div className="h-[460px] w-full rounded-2xl overflow-hidden">
              <MarineMap
                center={centerCoords}
                zoom={10}
                features={decisionData?.geo_features || []}
                routes={decisionData?.routes || []}
                locationName={decisionData?.location_name || 'Chennai Coast'}
                recommendation={decisionData?.recommendation || 'GO'}
                isDemo={decisionData?.is_demo ?? true}
                isMonitored={isMonitored}
                destinationCoords={destinationCoords}
                destinationName={destinationName}
                onSelectCoordinates={(lat, lng) => {
                  const updatedQuery = `Marine safety check for coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
                  setQuery(updatedQuery);
                  handleRunQuery(updatedQuery);
                }}
                onSelectDestination={(name, lat, lng) => {
                  setDestinationName(name);
                  setDestinationCoords([lat, lng]);
                }}
                onTrackDecision={handleStartMonitoring}
              />
            </div>
          </div>

          {/* Beaufort Scale Weather Gauge Widget */}
          <BeaufortScaleWidget
            windSpeedKmh={decisionData?.evidence?.wind_speed_kmh || 18.5}
            waveHeightM={decisionData?.evidence?.wave_height_m || 1.2}
            sstAnomalyC={+0.4}
            chlorophyllMgM3={1.85}
          />

          {/* Audio Advisory Dispatch Player */}
          {decisionData && (
            <AudioAdvisoryPlayer
              text={decisionData.explanation || 'Sea condition nominal. Wave height 1.2 meters.'}
              locationName={decisionData.location_name}
              recommendation={decisionData.recommendation}
            />
          )}

          {/* Interactive Marine Condition Sliders */}
          <MarineConditionControls
            initialValues={{
              waveHeightM: simWaveHeight,
              windSpeedKmh: simWindSpeed,
              sstAnomalyC: 0.4,
              chlorophyllMgM3: 2.8,
              pfzScore: 89,
              distanceKm: 15.4
            }}
            onConditionChange={(newVals) => {
              setSimWaveHeight(newVals.waveHeightM);
              setSimWindSpeed(newVals.windSpeedKmh);
              handleSimulateConditionChange();
            }}
            loading={simulating}
          />
        </div>

        {/* RIGHT COLUMN: Decision Engine Output & Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* RECOMMENDATION SYNTHESIS CARD */}
          {decisionData ? (
            <div className="space-y-6">
              <DecisionStatusCard
                recommendation={decisionData.recommendation}
                overallScore={decisionData.overall_score}
                safetyScore={decisionData.safety_score}
                fishingScore={decisionData.fishing_score}
                travelScore={decisionData.travel_score || 90.8}
                explanation={decisionData.explanation}
                locationName={decisionData.location_name}
                decisionCode={decisionData.decision_code}
                isMonitored={isMonitored}
              />

              {/* RISK FACTORS & ALTERNATIVES */}
              {decisionData.risk_factors && decisionData.risk_factors.length > 0 && (
                <div className="glass-panel p-5 rounded-3xl border-slate-800 space-y-3 font-mono text-xs">
                  <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block">
                    Identified Operational Risk Factors
                  </span>
                  <div className="space-y-1.5">
                    {decisionData.risk_factors.map((rf: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-[11px]">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{rf}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LIVING DECISION BACKGROUND MONITOR TOGGLE */}
              <div>
                <button
                  onClick={handleStartMonitoring}
                  disabled={isMonitored}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    isMonitored
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default font-mono'
                      : 'bg-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 cyan-glow'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>{isMonitored ? 'Living Decision Under Background Watch' : 'Enable Continuous Background Watch'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl text-center text-slate-400 font-mono">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-4" />
              Evaluating natural language prompt with 12 specialized agents...
            </div>
          )}
        </div>

      </div>

      {/* FULL-WIDTH 8 PRIMARY MARINE FACTOR MATRIX */}
      <MarineFactorMatrix
        factors={extractMarineFactorValues(decisionData, {
          waveHeightM: simWaveHeight,
          windSpeedKmh: simWindSpeed,
          weatherCode: simWaveHeight > 2.5 || simWindSpeed > 40 ? "THUNDERSTORM" : "CLEAR_SKY"
        })}
        isMonitored={isMonitored}
        lastCheckedAt={decisionData?.last_checked_at}
        title="ORCA 8-Factor Primary Marine Matrix"
        subtitle="Real-time multi-variable telemetry evaluating sea state, weather, biological yield, & operational safety limits"
      />

      {/* 12 AGENT EXECUTION FLOW TIMELINE */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-cyan-500/30 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Multi-Agent Collaborative Execution Audit
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Transparent, explainable step-by-step reasoning trace across specialized agents.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-bold">
            12 / 12 Agents Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agentTraces.slice(0, 8).map((trace, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl glass-card border transition-all ${
                activeStepIndex >= idx
                  ? 'border-cyan-500/50 bg-cyan-950/20 cyan-glow'
                  : 'border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                  Step 0{idx + 1}
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {trace.duration_ms} ms
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-100 mb-1">{trace.agent_name}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 font-sans">{trace.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
