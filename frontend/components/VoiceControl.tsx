'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Square, Pause, Loader2 } from 'lucide-react';
import { getApiBase } from '@/lib/config';

interface VoiceControlProps {
  text: string;
  language?: string;
  autoPlay?: boolean;
}

export default function VoiceControl({ text, language = 'en', autoPlay = false }: VoiceControlProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (autoPlay && !isPlaying && !isLoading && !audioUrlRef.current) {
      handlePlay();
    }
  }, [autoPlay]);

  const handlePlay = async () => {
    setError(null);
    
    // Stop any other audio elements playing
    const allAudios = document.getElementsByTagName('audio');
    for (let i = 0; i < allAudios.length; i++) {
      allAudios[i].pause();
    }
    
    // If we already have the audio, just play it
    if (audioRef.current && audioUrlRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    // Otherwise, generate the audio
    setIsLoading(true);
    
    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onended = () => setIsPlaying(false);
      audio.onpause = () => setIsPlaying(false);
      audio.onplay = () => setIsPlaying(true);
      
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('TTS Error:', err);
      setError('Voice unavailable — text response is still available.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      {!isPlaying && !isLoading && (
        <button
          onClick={handlePlay}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 transition-all text-xs font-semibold cyan-glow"
        >
          <Volume2 className="w-3.5 h-3.5" />
          Listen
        </button>
      )}

      {isLoading && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-medium">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          Generating voice...
        </div>
      )}

      {isPlaying && (
        <div className="flex items-center gap-2">
          <button
            onClick={handlePause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30 transition-all text-xs font-semibold"
          >
            <Pause className="w-3.5 h-3.5" />
            Pause
          </button>
          
          <button
            onClick={handleStop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all text-xs font-semibold"
          >
            <Square className="w-3 h-3 fill-current" />
            Stop
          </button>
          
          {/* Simple equalizer animation to indicate playing */}
          <div className="flex items-end gap-[2px] h-3 ml-1 opacity-70">
            <div className="w-1 bg-cyan-400 rounded-t-sm animate-[bounce_0.8s_infinite] h-full"></div>
            <div className="w-1 bg-cyan-400 rounded-t-sm animate-[bounce_0.5s_infinite] h-2/3"></div>
            <div className="w-1 bg-cyan-400 rounded-t-sm animate-[bounce_0.6s_infinite] h-4/5"></div>
            <div className="w-1 bg-cyan-400 rounded-t-sm animate-[bounce_0.9s_infinite] h-1/2"></div>
          </div>
        </div>
      )}

      {error && (
        <span className="text-[10px] text-red-400 ml-1 italic">{error}</span>
      )}
    </div>
  );
}
