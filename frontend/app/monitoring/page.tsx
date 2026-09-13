'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Activity, ShieldAlert, Clock, ArrowRight, RefreshCw, Radio, Play } from 'lucide-react';
import { getApiBase } from '@/lib/config';

export default function MonitoringPage() {
  const API_BASE = getApiBase();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoring();
    const interval = setInterval(fetchMonitoring, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoring = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/monitoring`);
      setData(res.data);
    } catch (err) {
      console.error('Fetch monitoring error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <Activity className="w-7 h-7 text-cyan-400 animate-pulse" />
            Living Decision Monitoring Control Room
          </h1>
          <p className="text-sm text-slate-400 font-mono mt-1">
            APScheduler continuous background loop tracking active decision conditions and material weather deltas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{data?.active_count || 0} Decisions Monitored</span>
          </div>

          <button
            onClick={fetchMonitoring}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-xs font-bold transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Poll Now</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-12 rounded-3xl text-center text-slate-400 font-mono">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-3" />
          Loading Monitoring Service Telemetry...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Active Monitored Decisions (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono">
              Active Living Decisions under Watch ({data?.decisions?.length || 0})
            </h3>

            {data?.decisions?.length === 0 ? (
              <div className="glass-panel p-8 rounded-3xl text-center text-slate-400 font-mono text-xs">
                No decisions currently under continuous background monitoring. Enable "Background Watch" in Command Center!
              </div>
            ) : (
              <div className="space-y-4">
                {data?.decisions?.map((d: any) => (
                  <div key={d.id} className="glass-panel p-5 rounded-3xl border-slate-800 space-y-3 glass-card-hover">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-cyan-400 font-bold px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30">
                          {d.decision_code}
                        </span>
                        <span className="text-xs font-mono text-slate-200 font-bold">{d.location_name}</span>
                      </div>

                      <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold ${d.recommendation === 'GO' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}`}>
                        {d.recommendation}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans">"{d.original_query}"</p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-3">
                      <span>Last checked: {new Date(d.last_checked_at).toLocaleTimeString()}</span>
                      <Link href={`/decisions/${d.id}`} className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
                        <span>Inspect Audit Trace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Recent Monitoring Events (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider font-mono">
              Material Condition Delta Log
            </h3>

            <div className="space-y-3">
              {data?.recent_events?.length === 0 ? (
                <div className="glass-panel p-8 rounded-3xl text-center text-slate-400 font-mono text-xs">
                  No weather delta shift events logged yet. All marine parameters steady.
                </div>
              ) : (
                data?.recent_events?.map((e: any) => (
                  <div key={e.id} className="glass-panel p-4 rounded-2xl border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-amber-400">{e.previous} → {e.new}</span>
                      <span className="text-slate-500 text-[10px]">{new Date(e.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">{e.summary}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
