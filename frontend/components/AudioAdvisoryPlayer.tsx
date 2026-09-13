'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio, Play, Pause, RefreshCw } from 'lucide-react';

interface AudioAdvisoryPlayerProps {
  text: string;
  locationName?: string;
  recommendation?: string;
}

export default function AudioAdvisoryPlayer({ text, locationName, recommendation }: AudioAdvisoryPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ta' | 'hi'>('en');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setSupported(false);
    }
  }, []);

  const handleTogglePlay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel(); // Stop ongoing speech

      let textToRead = text;
      let langCode = 'en-US';

      if (language === 'ta') {
        langCode = 'ta-IN';
        textToRead = `கடல் எச்சரிக்கை செய்தி. ${locationName ? locationName + ' கடல்பகுதி.' : ''} நிலை: ${recommendation === 'GO' ? 'பாதுகாப்பானது' : 'எச்சரிக்கை'}. ${text}`;
      } else if (language === 'hi') {
        langCode = 'hi-IN';
        textToRead = `समुद्री चेतावनी अलर्ट। ${locationName ? locationName + ' तटीय क्षेत्र।' : ''} स्थिति: ${recommendation === 'GO' ? 'सुरक्षित' : 'सावधान'}. ${text}`;
      }

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = langCode;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  if (!supported) return null;

  return (
    <div className="p-3.5 rounded-2xl glass-panel border border-cyan-500/30 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
          <Radio className={`w-5 h-5 ${isPlaying ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
              Audio Dispatch Broadcast
            </span>
            {isPlaying && (
              <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Broadcast
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 font-sans line-clamp-1">
            Hands-Free Ocean Voice Advisory
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Language selector */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 font-mono text-[10px]">
          {(['en', 'ta', 'hi'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                if (isPlaying) {
                  window.speechSynthesis.cancel();
                  setIsPlaying(false);
                }
              }}
              className={`px-2 py-0.5 rounded font-bold uppercase transition-all ${
                language === lang
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Play/Stop button */}
        <button
          onClick={handleTogglePlay}
          className={`p-2 rounded-xl flex items-center justify-center font-bold transition-all shrink-0 ${
            isPlaying
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-cyan-500 to-blue-600 text-slate-950 hover:bg-cyan-400 cyan-glow'
          }`}
          title={isPlaying ? "Stop Dispatch" : "Listen to Advisory"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>
      </div>
    </div>
  );
}
