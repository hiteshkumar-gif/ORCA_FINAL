'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Phone, Bell, ShieldAlert, CheckCircle2, Save, ArrowLeft, Anchor, Compass, Globe, Radio } from 'lucide-react';
import Link from 'next/link';
import { getApiBase } from '@/lib/config';

export default function ProfilePage() {
  const API_BASE = getApiBase();
  const [name, setName] = useState('Captain Hitesh');
  const [vesselName, setVesselName] = useState('Sea Sovereign (TN-02-MM-8492)');
  const [vesselType, setVesselType] = useState('Mechanized Trawler (18m)');
  const [homePort, setHomePort] = useState('Chennai Fishing Harbour');
  const [engineHp, setEngineHp] = useState(160);
  const [languagePref, setLanguagePref] = useState('en');

  const [phone, setPhone] = useState('+91 98765 43210');
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [threshold, setThreshold] = useState(2.0);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/me`);
      setName(res.data.name || 'Captain Hitesh');
      setPhone(res.data.phone_number || '+91 98765 43210');
      setSmsEnabled(res.data.sms_alerts_enabled !== false);
      setThreshold(res.data.wave_alert_threshold_m || 2.0);
    } catch (err) {
      console.error('Fetch profile error', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await axios.post(`${API_BASE}/api/auth/sms-config`, {
        phone_number: phone,
        sms_alerts_enabled: smsEnabled,
        wave_alert_threshold_m: Number(threshold)
      });

      // Save local vessel state
      const vesselState = { name, vesselName, vesselType, homePort, engineHp, languagePref, phone };
      localStorage.setItem('orca_vessel_config', JSON.stringify(vesselState));
      setMessage('Vessel specifications and emergency dispatch settings saved successfully!');
    } catch (err) {
      console.error('Save profile error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300">
          <ArrowLeft className="w-4 h-4" />
          Back to Command Center
        </Link>
      </div>

      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <Anchor className="w-7 h-7 text-cyan-400" />
            Vessel Specification & Operator Profile
          </h1>
          <p className="text-sm text-slate-400 font-mono mt-1">
            Configure vessel telemetry parameters, home port base, and automated SMS alert dispatch limits.
          </p>
        </div>

        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Vessel Telemetry Active
        </span>
      </div>

      {message && (
        <div className="p-4 rounded-2xl glass-panel bg-emerald-950/80 border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Vessel Hardware Specs (7 cols) */}
        <div className="md:col-span-7 glass-panel p-6 rounded-3xl border-cyan-500/30 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Anchor className="w-4 h-4 text-cyan-400" />
            Vessel Hardware & Operational Specs
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">Operator Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl py-2.5 px-3 text-slate-100 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Vessel Name & Reg ID</label>
                <input
                  type="text"
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl py-2.5 px-3 text-slate-100 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">Vessel Classification</label>
                <select
                  value={vesselType}
                  onChange={(e) => setVesselType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl py-2.5 px-3 text-slate-100 focus:outline-none"
                >
                  <option value="Mechanized Trawler (18m)">Mechanized Trawler (18m)</option>
                  <option value="Small Motorized Skiff (7m)">Small Motorized Skiff (7m)</option>
                  <option value="Deep Sea Longliner (24m)">Deep Sea Longliner (24m)</option>
                  <option value="Naval Coast Guard Patrol (35m)">Naval Coast Guard Patrol (35m)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Primary Home Port</label>
                <select
                  value={homePort}
                  onChange={(e) => setHomePort(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl py-2.5 px-3 text-slate-100 focus:outline-none"
                >
                  <option value="Chennai Fishing Harbour">Chennai Fishing Harbour (Tamil Nadu)</option>
                  <option value="Visakhapatnam Port">Visakhapatnam Port (Andhra Pradesh)</option>
                  <option value="Kochi Fishing Harbour">Kochi Fishing Harbour (Kerala)</option>
                  <option value="Tuticorin Port">Tuticorin Port (Tamil Nadu)</option>
                  <option value="Sasoon Dock Mumbai">Sasoon Dock (Mumbai)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">Engine Horsepower (HP)</label>
                <input
                  type="number"
                  value={engineHp}
                  onChange={(e) => setEngineHp(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl py-2.5 px-3 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Preferred Audio Language</label>
                <select
                  value={languagePref}
                  onChange={(e) => setLanguagePref(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl py-2.5 px-3 text-slate-100 focus:outline-none"
                >
                  <option value="en">English Dispatch</option>
                  <option value="ta">தமிழ் (Tamil Dispatch)</option>
                  <option value="hi">हिंदी (Hindi Dispatch)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Emergency SMS Dispatch Limits (5 cols) */}
        <div className="md:col-span-5 glass-panel p-6 rounded-3xl border-cyan-500/30 space-y-4 font-mono text-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Bell className="w-4 h-4 text-cyan-400" />
              Automatic SMS Dispatch Limits
            </h3>

            <div>
              <label className="text-slate-400 block mb-1">Alert Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl py-2.5 pl-9 pr-3 text-slate-100 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div>
                <span className="font-bold text-slate-200 block">Automatic SMS Dispatch</span>
                <span className="text-[10px] text-slate-400">Receive SMS when sea conditions shift</span>
              </div>
              <input
                type="checkbox"
                checked={smsEnabled}
                onChange={(e) => setSmsEnabled(e.target.checked)}
                className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Wave Alert Trigger Limit ({threshold}m)</label>
              <input
                type="range"
                min="1.0"
                max="3.5"
                step="0.1"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1.0m (Sensitive)</span>
                <span>2.0m (Standard)</span>
                <span>3.5m (Gale)</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cyan-glow flex items-center justify-center gap-2 mt-4"
          >
            <Save className="w-4 h-4" />
            <span>Save Vessel Specification</span>
          </button>
        </div>

      </form>
    </div>
  );
}
