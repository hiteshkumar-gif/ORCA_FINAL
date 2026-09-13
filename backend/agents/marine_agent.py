from typing import Dict, Any
from backend.providers.open_meteo import OpenMeteoMarineProvider
from backend.providers.demo_provider import DemoMarineProvider
from backend.config import settings

class MarineAgent:
    def __init__(self):
        self.name = "Marine Data Agent"
        self.live_provider = OpenMeteoMarineProvider()
        self.demo_provider = DemoMarineProvider()

    def execute(self, lat: float, lng: float, override_wave: float = None) -> Dict[str, Any]:
        """Collect wave height, wave period, currents, sea surface conditions."""
        if not settings.DEMO_MODE:
            live_data = self.live_provider.get_marine_conditions(lat, lng)
            if live_data:
                return live_data
        
        # Fallback or explicit DEMO mode
        return self.demo_provider.get_marine_conditions(lat, lng, override_wave=override_wave)
