from typing import Dict, Any, List

class SafetyAgent:
    def __init__(self):
        self.name = "Safety Agent"

    def execute(self, marine_data: Dict[str, Any], weather_data: Dict[str, Any], geo_data: Dict[str, Any]) -> Dict[str, Any]:
        """Synthesize wave, wind, visibility, and spatial hazard evidence factors."""
        wave = marine_data.get("wave_height_m", 1.2)
        wind = weather_data.get("wind_speed_kmh", 18.0)
        vis = weather_data.get("visibility_km", 10.0)
        has_hazard = geo_data.get("hazard_intersected", False)

        factors = []
        if wave > 2.5:
            factors.append("CRITICAL: Wave height exceeds safe operational limits (>2.5m)")
        elif wave > 1.5:
            factors.append("CAUTION: Moderate sea swell (1.5m - 2.5m)")

        if wind > 40.0:
            factors.append("CRITICAL: Strong gale winds (>40 km/h)")
        elif wind > 25.0:
            factors.append("CAUTION: Fresh breeze (25 - 40 km/h)")

        if vis < 4.0:
            factors.append("WARNING: Low visibility environment (< 4 km)")

        if has_hazard:
            factors.append("WARNING: Planned path traverses shipping lane / hazardous reef")

        return {
            "factors": factors,
            "has_critical_hazards": any("CRITICAL" in f for f in factors),
            "hazard_count": len(factors)
        }
