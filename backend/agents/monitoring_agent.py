from typing import Dict, Any, Tuple
from backend.config import settings

class MonitoringAgent:
    def __init__(self):
        self.name = "Monitoring Agent"

    def detect_material_change(
        self,
        old_snapshot: Dict[str, Any],
        new_marine: Dict[str, Any],
        new_weather: Dict[str, Any]
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Evaluate material delta thresholds:
        - Wave change > 0.5m
        - Wind change > 10 km/h
        - Severe weather warning change
        """
        old_wave = old_snapshot.get("wave_height_m", 1.2)
        new_wave = new_marine.get("wave_height_m", 1.2)
        wave_delta = new_wave - old_wave

        old_wind = old_snapshot.get("wind_speed_kmh", 18.0)
        new_wind = new_weather.get("wind_speed_kmh", 18.0)
        wind_delta = new_wind - old_wind

        new_code = new_weather.get("weather_code", "CLEAR")
        old_code = old_snapshot.get("weather_code", "CLEAR")

        delta_dict = {
            "wave_height_delta_m": round(wave_delta, 2),
            "wind_speed_delta_kmh": round(wind_delta, 2),
            "old_wave": old_wave,
            "new_wave": new_wave,
            "old_wind": old_wind,
            "new_wind": new_wind
        }

        changes = []
        is_material = False

        if abs(wave_delta) >= settings.WAVE_CHANGE_THRESHOLD_M:
            is_material = True
            changes.append(f"Wave height changed by {wave_delta:+.1f}m ({old_wave:.1f}m → {new_wave:.1f}m)")

        if abs(wind_delta) >= settings.WIND_CHANGE_THRESHOLD_KMH:
            is_material = True
            changes.append(f"Wind speed changed by {wind_delta:+.1f} km/h ({old_wind:.1f} km/h → {new_wind:.1f} km/h)")

        if new_code != old_code and new_code in ["THUNDERSTORM", "SQUALL"]:
            is_material = True
            changes.append(f"Weather alert updated: {new_code}")

        summary = "; ".join(changes) if changes else "No material condition changes detected."
        return is_material, summary, delta_dict
