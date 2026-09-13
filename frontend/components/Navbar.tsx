'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Anchor, ShieldAlert, Activity, Cpu, Compass, BarChart3, User, Bell, LogIn, Menu, X } from 'lucide-react';
import LocationSelector from '@/components/LocationSelector';
import LanguageSelector from '@/components/LanguageSelector';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('orca_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Compass },
    { label: 'Decisions', href: '/decisions', icon: BarChart3 },
    { label: 'Monitoring', href: '/monitoring', icon: Activity },
    { label: 'Alerts', href: '/alerts', icon: ShieldAlert },
    { label: 'Agents', href: '/agents', icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-b border-cyan-500/20 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* LEFT: BRANDING LOGO */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30 group-hover:scale-105 transition-transform">
              <Anchor className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-wider text-slate-100 group-hover:text-cyan-400 transition-colors">
                  ORCA
                </span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  AI v1.0
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono tracking-tight hidden md:inline">
                Marine Intelligence & Decision Command
              </span>
            </div>
          </Link>

          {/* CENTER: DESKTOP NAV LINKS */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cyan-glow font-mono'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: LOCATION + LANGUAGE + PROFILE */}
          <div className="flex items-center gap-2 shrink-0">
            {/* LOCATION SELECTOR */}
            <LocationSelector />

            {/* LANGUAGE SELECTOR */}
            <LanguageSelector />

            {/* SMS INDICATOR */}
            <Link
              href="/profile"
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold hover:border-emerald-400 transition-all shrink-0"
              title="SMS Alerts Active"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>SMS ON</span>
            </Link>

            {/* USER PROFILE / SIGN IN */}
            {user ? (
              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 text-xs font-mono font-bold transition-all shrink-0"
              >
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold text-[9px]">
                  CH
                </div>
                <span className="truncate max-w-[100px]">{user.name || 'Captain'}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all cyan-glow shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden p-4 bg-slate-950/98 border-b border-cyan-500/30 backdrop-blur-2xl space-y-3 animate-in slide-in-from-top-4">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between font-mono text-xs">
            <Link
              href="/profile"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>SMS Alerts ON</span>
            </Link>

            {user ? (
              <Link href="/profile" className="flex items-center gap-2 text-cyan-300 font-bold">
                <User className="w-4 h-4" />
                <span>{user.name || 'Captain Hitesh'}</span>
              </Link>
            ) : (
              <Link href="/login" className="text-cyan-400 font-bold flex items-center gap-1">
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
