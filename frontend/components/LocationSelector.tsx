'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, Check, AlertCircle, RefreshCw, X, Compass, Globe, CheckCircle2 } from 'lucide-react';
import { useLocationLanguage, LocationSearchResult } from '@/context/LocationLanguageContext';

export default function LocationSelector() {
  const {
    location,
    detectingLocation,
    locationError,
    setLocation,
    detectLocation,
    searchLocations,
    clearLocationError
  } = useLocationLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Manual coordinate inputs
  const [manualLat, setManualLat] = useState<string>(location.latitude.toString());
  const [manualLng, setManualLng] = useState<string>(location.longitude.toString());
  const [selectedCandidate, setSelectedCandidate] = useState<LocationSearchResult | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Sync manual inputs when location changes
  useEffect(() => {
    setManualLat(location.latitude.toString());
    setManualLng(location.longitude.toString());
  }, [location]);

  // Handle search debouncing
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocations(searchQuery);
      if (active) {
        setSearchResults(results);
        setIsSearching(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, searchLocations]);

  // Close modal on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectCandidate = (candidate: LocationSearchResult) => {
    setSelectedCandidate(candidate);
    setManualLat(candidate.latitude.toFixed(4));
    setManualLng(candidate.longitude.toFixed(4));
  };

  const handleConfirmLocation = () => {
    if (selectedCandidate) {
      setLocation({
        city: selectedCandidate.city,
        state: selectedCandidate.state,
        country: selectedCandidate.country,
        latitude: selectedCandidate.latitude,
        longitude: selectedCandidate.longitude,
        source: 'manual'
      });
    } else {
      const parsedLat = parseFloat(manualLat);
      const parsedLng = parseFloat(manualLng);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        setLocation({
          city: location.city || 'Custom Sector',
          state: location.state || '',
          country: location.country || '',
          latitude: parsedLat,
          longitude: parsedLng,
          source: 'manual'
        });
      }
    }
    setIsOpen(false);
    setSelectedCandidate(null);
  };

  return (
    <>
      {/* NAV TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-200 text-xs font-mono font-bold transition-all shrink-0 max-w-[130px] sm:max-w-[160px]"
        title="Set Target Marine Location"
        aria-label={`Current location: ${location.city}. Click to change.`}
      >
        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="truncate font-bold">
          {location.city}
        </span>
      </button>

      {/* LOCATION PANEL MODAL */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-lg rounded-3xl glass-panel border border-cyan-500/40 shadow-2xl overflow-hidden backdrop-blur-2xl bg-slate-950/95 text-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95"
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-modal-title"
          >
            {/* MODAL HEADER */}
            <div className="p-5 bg-slate-900/90 border-b border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Compass className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h3 id="location-modal-title" className="font-extrabold text-base text-white tracking-wide">
                    LOCATION
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Set target coordinates for live marine reasoning
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label="Close location modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 space-y-6 overflow-y-auto font-sans scrollbar-thin">
              
              {/* CURRENT ACTIVE LOCATION DISPLAY */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Current Location
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {location.source === 'auto' ? 'Auto GPS Detected' : 'Manual Selection'}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-extrabold text-slate-100">
                      📍 {location.city}
                      {location.state ? `, ${location.state}` : ''}
                      {location.country ? `, ${location.country}` : ''}
                    </h4>
                    <p className="text-xs font-mono text-slate-400 mt-1">
                      Lat: <span className="text-cyan-300 font-bold">{location.latitude.toFixed(4)}</span>, Lon: <span className="text-cyan-300 font-bold">{location.longitude.toFixed(4)}</span>
                    </p>
                  </div>
                </div>

                {/* AUTOMATIC LOCATION DETECT BUTTON */}
                <button
                  onClick={detectLocation}
                  disabled={detectingLocation}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 hover:border-cyan-400 disabled:opacity-50"
                >
                  {detectingLocation ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                      <span>Detecting Browser Geolocation...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 text-cyan-400" />
                      <span>Detect My Location (GPS)</span>
                    </>
                  )}
                </button>

                {/* GEOLOCATION ERROR ALERT */}
                {locationError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-mono flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold">Location Error</p>
                      <p className="text-[11px] text-rose-300 mt-0.5">{locationError}</p>
                    </div>
                    <button onClick={clearLocationError} className="text-rose-400 hover:text-rose-200">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* SEARCH LOCATION SECTION */}
              <div className="space-y-3">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                  Search Location
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search city or place (e.g. Chennai, Mumbai, Kochi)..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 text-xs focus:outline-none transition-all font-sans"
                  />
                  {isSearching && (
                    <RefreshCw className="w-4 h-4 absolute right-3.5 top-3 text-cyan-400 animate-spin" />
                  )}
                </div>

                {/* SEARCH RESULTS LIST */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                  {searchResults.map((item, idx) => {
                    const isSelected =
                      selectedCandidate?.displayName === item.displayName ||
                      (location.city === item.city && !selectedCandidate);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectCandidate(item)}
                        className={`w-full p-2.5 rounded-xl text-left text-xs font-mono transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-200'
                            : 'bg-slate-900/60 border border-slate-800 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-slate-100">{item.displayName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Lat: {item.latitude.toFixed(4)}, Lon: {item.longitude.toFixed(4)}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MANUAL COORDINATES INPUTS */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
                  Coordinates (Lat / Lon)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={manualLat}
                      onChange={(e) => {
                        setManualLat(e.target.value);
                        setSelectedCandidate(null);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-slate-100 font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={manualLng}
                      onChange={(e) => {
                        setManualLng(e.target.value);
                        setSelectedCandidate(null);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-slate-100 font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                ORCA Deterministic Location Core
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLocation}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cyan-glow flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Location</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
