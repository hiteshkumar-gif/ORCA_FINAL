from typing import Dict, Any
from backend.providers.demo_provider import DemoSatelliteProvider

class SatelliteAgent:
    def __init__(self):
        self.name = "Satellite / Earth Observation Agent"
        self.provider = DemoSatelliteProvider()

    def execute(self, lat: float, lng: float) -> Dict[str, Any]:
        """Integrate satellite Earth Observation data (MOSDAC / ISRO / NOAA)."""
        return self.provider.get_satellite_data(lat, lng)
