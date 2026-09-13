'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { ArrowLeft, Clock, Activity, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Info, RefreshCw, Star, Download, Printer, Radio } from 'lucide-react';
import Link from 'next/link';
import { getApiBase } from '@/lib/config';
import AudioAdvisoryPlayer from '@/components/AudioAdvisoryPlayer';
import MarineFactorMatrix from '@/components/MarineFactorMatrix';
import { extractMarineFactorValues } from '@/lib/marineFactors';

const MarineMap = dynamic(() => import('@/components/MarineMap'), { ssr: false });

export default function DecisionDetailPage() {
  const API_BASE = getApiBase();
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [outcome, setOutcome] = useState('SUCCESSFUL_TRIP');
  const [notes, setNotes] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/decisions/${id}`);
      setData(res.data);
    } catch (err) {
      console.error('Fetch detail error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/decisions/${id}/feedback`, {
        rating,
        outcome,
        notes
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error('Feedback submit error', err);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 font-mono">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-3" />
        Loading Decision Audit Trace & Snapshot History...
      </div>
    );
  }

  if (!data || !data.decision) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 font-mono">
        Decision record not found.
      </div>
    );
  }

  const dec = data.decision;
  const snapshots = data.snapshots || [];
  const events = data.monitoring_events || [];
  const agentRuns = data.agent_runs || [];

  const centerCoords: [number, number] = [dec.latitude, dec.longitude];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0 print:m-0">
      {/* Back button & Action controls */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/decisions" className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300">
          <ArrowLeft className="w-4 h-4" />
          Back to Decision Registry
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print Audit Report</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-cyan-400 font-bold px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30">
              {dec.decision_code}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Created: {new Date(dec.created_at).toLocaleString()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2">
            "{dec.original_query}"
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Sector: {dec.location_name} (Lat {dec.latitude.toFixed(4)}°, Lng {dec.longitude.toFixed(4)}°)
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center p-4 rounded-2xl bg-slate-900/80 border border-slate-800 min-w-[120px]">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Recommendation</span>
            <span className={`text-2xl font-extrabold font-mono ${dec.recommendation === 'GO' ? 'text-emerald-400' : dec.recommendation === 'CAUTION' ? 'text-amber-400' : 'text-rose-400'}`}>
              {dec.recommendation}
            </span>
          </div>
          <div className="text-center p-4 rounded-2xl bg-slate-900/80 border border-slate-800 min-w-[100px]">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Overall Score</span>
            <span className="text-2xl font-extrabold font-mono text-cyan-400">{dec.overall_score}/100</span>
          </div>
        </div>
      </div>

      {/* Audio Dispatch Player */}
      <AudioAdvisoryPlayer
        text={dec.explanation}
        locationName={dec.location_name}
        recommendation={dec.recommendation}
      />

      {/* 8 PRIMARY MARINE FACTOR MATRIX */}
      <MarineFactorMatrix
        factors={extractMarineFactorValues(dec)}
        isMonitored={dec.is_monitored}
        lastCheckedAt={dec.last_checked_at}
        title="Evaluated 8 Marine Primary Factors"
        subtitle={`Historical snapshot recorded for sector: ${dec.location_name}`}
      />

      {/* Detail Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Map & Evidence (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Map view */}
          <div className="glass-panel p-4 rounded-3xl border-cyan-500/30 space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider px-1">
              Geospatial Sector Map
            </h3>
            <div className="h-[360px] w-full rounded-2xl overflow-hidden">
              <MarineMap
                center={centerCoords}
                zoom={10}
                features={dec.geo_features || []}
                routes={dec.routes || []}
                locationName={dec.location_name}
              />
            </div>
          </div>

          {/* Deterministic Explanation */}
          <div className="glass-panel p-6 rounded-3xl border-cyan-500/30 space-y-3">
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
              Deterministic Explainability Rationale
            </span>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {dec.explanation}
            </p>
          </div>

          {/* Snapshot History Timeline */}
          {snapshots.length > 0 && (
            <div className="glass-panel p-6 rounded-3xl border-cyan-500/30 space-y-4">
              <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider">
                Snapshot Condition History ({snapshots.length} Records)
              </h3>
              <div className="space-y-3">
                {snapshots.map((s: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">
                        {new Date(s.snapshot_time).toLocaleTimeString()} — {s.reason}
                      </span>
                      <span className="text-slate-200">Wave: {s.wave_height_m}m | Wind: {s.wind_speed_kmh} km/h</span>
                    </div>
                    <span className="text-cyan-400 font-bold">{s.overall_score}/100</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Feedback Form & Agent Audit (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Feedback Form */}
          <div className="glass-panel p-6 rounded-3xl border-cyan-500/30 space-y-4 font-mono text-xs">
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Post-Mission Outcome Feedback
            </h3>

            {feedbackSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
                <span>Thank you! Your feedback has been recorded for rule calibration.</span>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="text-slate-400 block mb-1">Rating (1 to 5 Stars)</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-slate-100 focus:outline-none"
                  >
                    <option value={5}>5 Stars - Extremely Accurate</option>
                    <option value={4}>4 Stars - Good Advice</option>
                    <option value={3}>3 Stars - Moderate</option>
                    <option value={2}>2 Stars - Cautionary</option>
                    <option value={1}>1 Star - Inaccurate</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Actual Sea Trip Outcome</label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-slate-100 focus:outline-none"
                  >
                    <option value="SUCCESSFUL_TRIP">Successful & Safe Catch</option>
                    <option value="DELAYED_DEPARTURE">Delayed Departure Due to Swell</option>
                    <option value="RETURNED_EARLY">Returned Early (High Wind)</option>
                    <option value="NO_TRIP">Trip Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Operator Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter post-mission observations..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none h-20 font-sans text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cyan-glow"
                >
                  Submit Mission Feedback
                </button>
              </form>
            )}
          </div>

          {/* Agent Audit Runs */}
          {agentRuns.length > 0 && (
            <div className="glass-panel p-6 rounded-3xl border-cyan-500/30 space-y-3 font-mono text-xs">
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                Multi-Agent Audit Trace ({agentRuns.length} Runs)
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {agentRuns.map((a: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">{a.agent_name}</span>
                      <span className="text-[9px] text-emerald-400">{a.duration_ms} ms</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">{a.output_summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
