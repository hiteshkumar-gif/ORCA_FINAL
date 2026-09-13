'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, Volume2, Bell, RefreshCw } from 'lucide-react';
import { getApiBase } from '@/lib/config';

export default function AlertsPage() {
  const API_BASE = getApiBase();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const url = severityFilter === 'ALL' ? `${API_BASE}/api/alerts` : `${API_BASE}/api/alerts?severity=${severityFilter}`;
      const res = await axios.get(url);
      setAlerts(res.data);
    } catch (err) {
      console.error('Fetch alerts error', err);
    } finally {
      setLoading(false);
    }
  };

  const playSonarBeep = () => {
    if (typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {}
  };

  const handleAcknowledge = (id: string) => {
    playSonarBeep();
    setAcknowledgedIds((prev) => [...prev, id]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-rose-400" />
            Marine & Decision Alert Center
          </h1>
          <p className="text-sm text-slate-400 font-mono mt-1">
            Real-time severity-categorized weather, hazard, and decision shift notifications.
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 font-mono text-xs">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                severityFilter === sev
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-12 rounded-3xl text-center text-slate-400 font-mono">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-3" />
          Fetching real-time marine alerts...
        </div>
      ) : alerts.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center text-slate-400 font-mono">
          No active alerts recorded. All sea operational sectors nominal.
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((a) => {
            const isAck = acknowledgedIds.includes(a.id);
            const sevColor =
              a.severity === 'CRITICAL'
                ? 'bg-rose-950/60 border-rose-500/60 text-rose-200'
                : a.severity === 'HIGH'
                ? 'bg-amber-950/60 border-amber-500/60 text-amber-200'
                : 'bg-slate-900/80 border-slate-800 text-slate-200';

            return (
              <div
                key={a.id}
                className={`p-5 rounded-3xl glass-panel border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${sevColor} ${
                  isAck ? 'opacity-50 grayscale' : ''
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        a.severity === 'CRITICAL'
                          ? 'bg-rose-500 text-slate-950'
                          : a.severity === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {a.severity}
                    </span>
                    <h3 className="font-bold text-sm text-slate-100">{a.title}</h3>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">{a.message}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(a.created_at).toLocaleTimeString()}
                  </span>

                  {!isAck ? (
                    <button
                      onClick={() => handleAcknowledge(a.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Ack</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold px-2.5 py-1 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                      Acknowledged
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
