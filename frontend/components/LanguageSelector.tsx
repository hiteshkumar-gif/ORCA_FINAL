'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLocationLanguage } from '@/context/LocationLanguageContext';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName?: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'auto', name: 'Auto Detect', nativeName: '🌐 Automatic' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLocationLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (lang: LanguageOption) => {
    setLanguage({ code: lang.code, name: lang.name });
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* NAV TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-200 text-xs font-mono font-bold transition-all shrink-0"
        title="Select AI Chat Communication Language"
        aria-label={`Select language. Current: ${language.name}`}
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
        <span className="font-bold">{language.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* DROPDOWN PANEL */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl bg-slate-950/95 backdrop-blur-2xl z-50 p-1.5 space-y-0.5 animate-in fade-in-50 slide-in-from-top-2 font-mono text-xs">
          <div className="px-3 py-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 mb-1">
            Communication Language
          </div>
          {LANGUAGES.map((item) => {
            const isSelected = language.code === item.code;
            return (
              <button
                key={item.code}
                onClick={() => handleSelectLanguage(item)}
                className={`w-full px-3 py-2 rounded-xl text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{item.name}</span>
                  {item.nativeName && item.code !== 'auto' && item.code !== 'en' && (
                    <span className="text-[10px] text-slate-400">({item.nativeName})</span>
                  )}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
