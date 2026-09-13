'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Anchor, ShieldAlert, CheckCircle2, Phone, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { getApiBase } from '@/lib/config';

export default function LoginPage() {
  const API_BASE = getApiBase();
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('fisherman@orca.ai');
  const [password, setPassword] = useState('orca12345');
  const [name, setName] = useState('Captain Hitesh');
  const [phone, setPhone] = useState('+91 98765 43210');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const endpoint = isRegister ? `${API_BASE}/api/auth/register` : `${API_BASE}/api/auth/login`;
      const payload = isRegister
        ? { name, email, phone_number: phone, password }
        : { email, password };

      const res = await axios.post(endpoint, payload);

      if (res.data.token) {
        localStorage.setItem('orca_token', res.data.token);
        localStorage.setItem('orca_user', JSON.stringify(res.data.user));
        setSuccess('Authentication successful! Redirecting to Command Center...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      }
    } catch (err: any) {
      console.error('Auth error', err);
      setError(err.response?.data?.detail || 'Authentication failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setEmail('fisherman@orca.ai');
    setPassword('orca12345');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, {
        email: 'fisherman@orca.ai',
        password: 'orca12345'
      });
      localStorage.setItem('orca_token', res.data.token);
      localStorage.setItem('orca_user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err) {
      console.error('Demo login error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl border-cyan-500/30 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 mb-2 cyan-glow">
            <Anchor className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            {isRegister ? 'Create Operator Account' : 'Sign In to ORCA Command'}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Access Living Decision monitoring and automatic SMS hazard alerts.
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-mono">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {isRegister && (
            <div>
              <label className="text-slate-400 block mb-1">Operator Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl py-2.5 pl-9 pr-3 text-slate-100 placeholder-slate-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-400 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl py-2.5 pl-9 pr-3 text-slate-100 placeholder-slate-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="text-slate-400 block mb-1">Mobile Phone Number (for Automatic SMS Alerts)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl py-2.5 pl-9 pr-3 text-slate-100 placeholder-slate-500 focus:outline-none"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl py-2.5 pl-9 pr-3 text-slate-100 placeholder-slate-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cyan-glow flex items-center justify-center gap-2"
          >
            <span>{isRegister ? 'Register Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Sign In */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <button
            onClick={handleDemoSignIn}
            className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Quick Demo Sign-In (Captain Hitesh)</span>
          </button>

          <div className="text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-cyan-400 hover:underline font-mono"
            >
              {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register Here'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
