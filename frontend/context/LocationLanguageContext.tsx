'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LocationState {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  source: 'auto' | 'manual';
}

export interface LanguageState {
  code: string; // 'auto' | 'en' | 'hi' | 'pa' | 'ta' | 'te' | 'bn' | 'mr'
  name: string;
  source: 'auto' | 'manual';
}

export interface LocationSearchResult {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

export interface MarineConditionsState {
  waveHeightM: number;
  windSpeedKnots: number;
  sstAnomalyC: number;
  chlorophyllMgM3: number;
  pfzScore: number;
  distanceNM: number;
}

interface LocationLanguageContextType {
  location: LocationState;
  language: LanguageState;
  marineConditions: MarineConditionsState;
  detectingLocation: boolean;
  locationError: string | null;
  setLocation: (loc: Partial<LocationState>) => void;
  setLanguage: (lang: { code: string; name: string }) => void;
  setMarineConditions: (conds: Partial<MarineConditionsState>) => void;
  detectLocation: () => Promise<void>;
  searchLocations: (query: string) => Promise<LocationSearchResult[]>;
  clearLocationError: () => void;
}

const defaultLocation: LocationState = {
  city: 'Chennai',
  state: 'Tamil Nadu',
  country: 'India',
  latitude: 13.0827,
  longitude: 80.2707,
  source: 'manual',
};

const defaultLanguage: LanguageState = {
  code: 'auto',
  name: 'Auto Detect',
  source: 'auto',
};

const PRESET_MARITIME_CITIES: LocationSearchResult[] = [
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707, displayName: 'Chennai, Tamil Nadu, India' },
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 18.9220, longitude: 72.8347, displayName: 'Mumbai, Maharashtra, India' },
  { city: 'Kochi', state: 'Kerala', country: 'India', latitude: 9.9312, longitude: 76.2673, displayName: 'Kochi, Kerala, India' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', latitude: 17.6868, longitude: 83.2185, displayName: 'Visakhapatnam (Vizag), Andhra Pradesh, India' },
  { city: 'Panaji (Goa)', state: 'Goa', country: 'India', latitude: 15.4989, longitude: 73.8278, displayName: 'Panaji, Goa, India' },
  { city: 'Mangalore', state: 'Karnataka', country: 'India', latitude: 12.9141, longitude: 74.8560, displayName: 'Mangalore, Karnataka, India' },
  { city: 'Puducherry', state: 'Puducherry', country: 'India', latitude: 11.9416, longitude: 79.8083, displayName: 'Puducherry, Union Territory, India' },
  { city: 'Porbandar', state: 'Gujarat', country: 'India', latitude: 21.6417, longitude: 69.6293, displayName: 'Porbandar, Gujarat, India' },
  { city: 'Paradip', state: 'Odisha', country: 'India', latitude: 20.3164, longitude: 86.6114, displayName: 'Paradip, Odisha, India' },
  { city: 'Haldia', state: 'West Bengal', country: 'India', latitude: 22.0667, longitude: 88.0667, displayName: 'Haldia, West Bengal, India' },
  { city: 'Tuticorin', state: 'Tamil Nadu', country: 'India', latitude: 8.7642, longitude: 78.1348, displayName: 'Tuticorin (Thoothukudi), Tamil Nadu, India' },
  { city: 'Port Blair', state: 'Andaman & Nicobar', country: 'India', latitude: 11.6233, longitude: 92.7265, displayName: 'Port Blair, Andaman & Nicobar Islands, India' }
];

const defaultMarineConditions: MarineConditionsState = {
  waveHeightM: 1.8,
  windSpeedKnots: 18.4,
  sstAnomalyC: 0.4,
  chlorophyllMgM3: 1.85,
  pfzScore: 72,
  distanceNM: 12.5
};

const LocationLanguageContext = createContext<LocationLanguageContextType | undefined>(undefined);

export function LocationLanguageProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<LocationState>(defaultLocation);
  const [language, setLanguageState] = useState<LanguageState>(defaultLanguage);
  const [marineConditions, setMarineConditionsState] = useState<MarineConditionsState>(defaultMarineConditions);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const setMarineConditions = (conds: Partial<MarineConditionsState>) => {
    setMarineConditionsState(prev => ({ ...prev, ...conds }));
  };

  // Restore saved state from localStorage on mount
  useEffect(() => {
    try {
      const savedLoc = localStorage.getItem('orca_location');
      if (savedLoc) {
        const parsed = JSON.parse(savedLoc);
        if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
          setLocationState(parsed);
        }
      }
      const savedLang = localStorage.getItem('orca_language');
      if (savedLang) {
        const parsedLang = JSON.parse(savedLang);
        if (parsedLang && parsedLang.code) {
          setLanguageState(parsedLang);
        }
      }
    } catch (e) {
      console.warn("Error restoring ORCA location/language state from localStorage", e);
    }
  }, []);

  const setLocation = (newFields: Partial<LocationState>) => {
    setLocationState((prev) => {
      const updated = { ...prev, ...newFields };
      try {
        localStorage.setItem('orca_location', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setLocationError(null);
  };

  const setLanguage = (lang: { code: string; name: string }) => {
    const updated: LanguageState = {
      code: lang.code,
      name: lang.name,
      source: lang.code === 'auto' ? 'auto' : 'manual',
    };
    setLanguageState(updated);
    try {
      localStorage.setItem('orca_language', JSON.stringify(updated));
    } catch (e) {}
  };

  const clearLocationError = () => setLocationError(null);

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser. Please select your location manually.");
      return;
    }

    setDetectingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          // Reverse geocoding via OpenStreetMap Nominatim
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || 'Detected Sector';
            const state = addr.state || addr.region || '';
            const country = addr.country || 'India';

            setLocation({
              city,
              state,
              country,
              latitude: lat,
              longitude: lon,
              source: 'auto'
            });
          } else {
            throw new Error("Reverse geocoding response not OK");
          }
        } catch (err) {
          // Fallback reverse geocoding heuristic
          setLocation({
            city: 'Current Vessel Position',
            state: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
            country: '',
            latitude: lat,
            longitude: lon,
            source: 'auto'
          });
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied. Please allow location access in your browser or search manually.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is currently unavailable. Please search for a city manually.");
            break;
          case error.TIMEOUT:
            setLocationError("Location detection request timed out. Please try again or select location manually.");
            break;
          default:
            setLocationError("An error occurred while detecting location. Please use manual selection.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const searchLocations = async (searchQuery: string): Promise<LocationSearchResult[]> => {
    if (!searchQuery.trim()) return PRESET_MARITIME_CITIES;

    const qLower = searchQuery.toLowerCase().trim();

    // 1. Filter local presets
    const localMatches = PRESET_MARITIME_CITIES.filter((item) =>
      item.city.toLowerCase().includes(qLower) ||
      item.state.toLowerCase().includes(qLower) ||
      item.displayName.toLowerCase().includes(qLower)
    );

    // 2. Fetch from OpenStreetMap Nominatim API if remote search is needed
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        const remoteResults: LocationSearchResult[] = data.map((item: any) => {
          const parts = (item.display_name || '').split(', ');
          const city = parts[0] || searchQuery;
          const state = parts.length > 2 ? parts[parts.length - 2] : '';
          const country = parts[parts.length - 1] || 'India';
          return {
            city,
            state,
            country,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            displayName: item.display_name || `${city}, ${country}`
          };
        });

        // Deduplicate
        const combined = [...localMatches];
        for (const remote of remoteResults) {
          if (!combined.some(c => Math.abs(c.latitude - remote.latitude) < 0.05 && Math.abs(c.longitude - remote.longitude) < 0.05)) {
            combined.push(remote);
          }
        }
        return combined;
      }
    } catch (e) {
      console.warn("Nominatim search failed, returning local presets", e);
    }

    return localMatches;
  };

  return (
    <LocationLanguageContext.Provider
      value={{
        location,
        language,
        marineConditions,
        detectingLocation,
        locationError,
        setLocation,
        setLanguage,
        setMarineConditions,
        detectLocation,
        searchLocations,
        clearLocationError
      }}
    >
      {children}
    </LocationLanguageContext.Provider>
  );
}

export function useLocationLanguage() {
  const context = useContext(LocationLanguageContext);
  if (!context) {
    throw new Error('useLocationLanguage must be used within a LocationLanguageProvider');
  }
  return context;
}
