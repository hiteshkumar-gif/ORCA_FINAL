from typing import Dict, Any
from datetime import datetime
from backend.providers.base import BaseMarineProvider, BaseWeatherProvider, BaseSatelliteProvider, BaseFishingProvider

class DemoMarineProvider(BaseMarineProvider):
    def get_marine_conditions(self, lat: float, lng: float, override_wave: float = None) -> Dict[str, Any]:
        wave_height = override_wave if override_wave is not None else 1.2
        return {
            "location_name": "Chennai Coastal Shelf",
            "wave_height_m": wave_height,
            "wave_period_s": 7.2 if wave_height < 2.0 else 5.8,
            "current_speed_knots": 1.4 if wave_height < 2.0 else 2.6,
            "sea_surface_temp_c": 28.6,
            "timestamp": datetime.utcnow().isoformat(),
            "source": "ORCA Synthetic Marine Simulator (DEMO DATA)",
            "is_live": False
        }

class DemoWeatherProvider(BaseWeatherProvider):
    def get_weather_conditions(self, lat: float, lng: float, override_wind: float = None, override_code: str = None) -> Dict[str, Any]:
        wind_speed = override_wind if override_wind is not None else 18.0
        weather_code = override_code if override_code is not None else "CLEAR"
        return {
            "wind_speed_kmh": wind_speed,
            "wind_direction_deg": 225.0, # SW monsoon breeze
            "temperature_c": 31.2,
            "visibility_km": 10.0 if weather_code == "CLEAR" else 4.5,
            "precipitation_probability": 15.0 if weather_code == "CLEAR" else 80.0,
            "weather_code": weather_code,
            "timestamp": datetime.utcnow().isoformat(),
            "source": "ORCA Synthetic Weather Simulator (DEMO DATA)",
            "is_live": False
        }

class DemoSatelliteProvider(BaseSatelliteProvider):
    def get_satellite_data(self, lat: float, lng: float) -> Dict[str, Any]:
        return {
            "sst_anomaly_c": 0.4,
            "chlorophyll_a_mg_m3": 2.8, # High chlorophyll indicator for fishing
            "cloud_cover_percent": 22.0,
            "sensor_source": "MOSDAC / Oceansat-2 (DEMO DATA)",
            "is_live": False
        }

class DemoFishingProvider(BaseFishingProvider):
    def get_fishing_opportunity(self, lat: float, lng: float) -> Dict[str, Any]:
        return {
            "opportunity_score": 84.0,
            "potential_zone_name": "Chennai East PFZ-Sector 4",
            "distance_km": 18.5,
            "chlorophyll_indicator": "High Concentration (2.8 mg/m³)",
            "fish_density_index": "High (Pelagic Aggregation)",
            "best_hours": "05:30 AM - 10:00 AM",
            "source": "INCOIS PFZ Model Simulation (DEMO DATA)",
            "is_live": False
        }
