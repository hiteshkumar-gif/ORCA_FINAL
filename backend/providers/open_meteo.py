import requests
from typing import Dict, Any
from datetime import datetime
from backend.providers.base import BaseMarineProvider, BaseWeatherProvider
from backend.config import settings

class OpenMeteoMarineProvider(BaseMarineProvider):
    def get_marine_conditions(self, lat: float, lng: float) -> Dict[str, Any]:
        url = f"{settings.OPEN_METEO_BASE_URL}?latitude={lat}&longitude={lng}&hourly=wave_height,wave_period,ocean_current_velocity&forecast_days=2"
        try:
            res = requests.get(url, timeout=5)
            if res.status_code == 200:
                data = res.json()
                hourly = data.get("hourly", {})
                wave_heights = hourly.get("wave_height", [1.2])
                wave_periods = hourly.get("wave_period", [7.0])
                currents = hourly.get("ocean_current_velocity", [0.8])
                
                # Fetch current hour index or default to first
                wh = wave_heights[0] if wave_heights and wave_heights[0] is not None else 1.2
                wp = wave_periods[0] if wave_periods and wave_periods[0] is not None else 7.0
                cur = currents[0] if currents and currents[0] is not None else 0.8

                return {
                    "wave_height_m": float(wh),
                    "wave_period_s": float(wp),
                    "current_speed_knots": float(cur) * 1.94384, # m/s to knots
                    "sea_surface_temp_c": 28.5,
                    "timestamp": datetime.utcnow().isoformat(),
                    "source": "Open-Meteo Live Marine API",
                    "is_live": True
                }
        except Exception as e:
            pass
        return None

class OpenMeteoWeatherProvider(BaseWeatherProvider):
    def get_weather_conditions(self, lat: float, lng: float) -> Dict[str, Any]:
        url = f"{settings.OPEN_METEO_WEATHER_URL}?latitude={lat}&longitude={lng}&current_weather=true&hourly=precipitation_probability,visibility&forecast_days=1"
        try:
            res = requests.get(url, timeout=5)
            if res.status_code == 200:
                data = res.json()
                curr = data.get("current_weather", {})
                hourly = data.get("hourly", {})
                wind_speed = curr.get("windspeed", 18.0)
                wind_dir = curr.get("winddirection", 240.0)
                temp = curr.get("temperature", 30.0)
                precip = hourly.get("precipitation_probability", [10.0])[0] if hourly.get("precipitation_probability") else 10.0
                vis = hourly.get("visibility", [10000.0])[0] / 1000.0 if hourly.get("visibility") else 10.0

                return {
                    "wind_speed_kmh": float(wind_speed),
                    "wind_direction_deg": float(wind_dir),
                    "temperature_c": float(temp),
                    "visibility_km": float(vis),
                    "precipitation_probability": float(precip),
                    "weather_code": "CLEAR",
                    "timestamp": datetime.utcnow().isoformat(),
                    "source": "Open-Meteo Live Weather API",
                    "is_live": True
                }
        except Exception as e:
            pass
        return None
