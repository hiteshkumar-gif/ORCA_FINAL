'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageSquare, Sparkles, User, Globe, RefreshCw, ChevronDown, Anchor, Waves, MapPin } from 'lucide-react';
import { getApiBase } from '@/lib/config';
import { useLocationLanguage } from '@/context/LocationLanguageContext';

interface ChatMessage {
  sender: 'user' | 'orca';
  text: string;
}

export default function OrcaChatbot() {
  const { location, language, marineConditions } = useLocationLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'orca',
      text: 'Ahoy! I am **ORCA AI Specialist**, powered by **Gemini 3.5 Flash**. Ask me anything about marine safety, fishing zones, weather conditions, vessel routes, or oceanography in **any language**!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: textToSend }];
    setMessages(newMessages);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: newMessages.slice(-6),
          language: language.code,
          location: `${location.city}${location.state ? `, ${location.state}` : ''}, ${location.country}`,
          latitude: location.latitude,
          longitude: location.longitude,
          marine_summary: marineConditions ? {
            wave_height_m: marineConditions.waveHeightM,
            wind_speed_knots: marineConditions.windSpeedKnots,
            sst_anomaly_c: marineConditions.sstAnomalyC,
            chlorophyll_mg_m3: marineConditions.chlorophyllMgM3,
            pfz_score: marineConditions.pfzScore,
            distance_nm: marineConditions.distanceNM
          } : undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { sender: 'orca', text: data.response }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'orca', text: '⚠️ Unable to connect to ORCA Gemini AI service right now. Please verify backend on port 8000.' }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'orca', text: '⚠️ Network connection error while calling Gemini AI Chat service.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    `Is fishing safe near ${location.city} tomorrow?`,
    `Kal subah ${location.city} se boat travel safe hai?`,
    'Wave height safety limits for small vessels',
    'PFZ Fishing potential in Bay of Bengal'
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* FLOATING TOGGLE BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-2xl transition-all duration-300 cyan-glow flex items-center justify-center gap-2"
          title="Open ORCA AI Multilingual Chatbot"
        >
          <div className="relative">
            <Bot className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
          </div>
          <span className="font-extrabold text-xs uppercase tracking-wider hidden sm:inline text-slate-950">
            Ask ORCA AI
          </span>
        </button>
      )}

      {/* CHATBOT DRAWER MODAL */}
      {isOpen && (
        <div className="w-[90vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-3xl glass-panel border border-cyan-500/40 shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl animate-in slide-in-from-bottom-5">
          {/* CHAT HEADER */}
          <div className="p-4 bg-slate-900/90 border-b border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-100">ORCA AI Specialist</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Gemini 3.5
                  </span>
                </div>
                {/* ACTIVE LOCATION & LANGUAGE CONTEXT BADGE */}
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                  <span className="flex items-center gap-1 text-cyan-300 font-bold truncate max-w-[150px]">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    {location.city}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-teal-300">
                    <Globe className="w-3 h-3 text-teal-400 shrink-0" />
                    {language.name}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MESSAGES LIST CONTAINER */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs scrollbar-thin">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'orca' && (
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-tl-none shadow-lg'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-cyan-400 font-mono text-[11px] p-2 bg-slate-900/40 rounded-xl w-fit border border-cyan-500/20">
                <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                <span>ORCA AI ({location.city} • {language.name}) is reasoning...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTED QUICK PROMPTS CHIPS */}
          <div className="px-3 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {samplePrompts.map((promptText, i) => (
              <button
                key={i}
                onClick={() => handleSend(promptText)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-500/20 text-[10px] text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-all shrink-0"
              >
                💡 {promptText}
              </button>
            ))}
          </div>

          {/* INPUT BAR */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ORCA in ${language.name === 'Auto Detect' ? 'any language' : language.name}...`}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder-slate-500 text-xs focus:outline-none transition-all font-sans"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cyan-glow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
