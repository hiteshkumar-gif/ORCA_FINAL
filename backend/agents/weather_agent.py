from typing import Dict, Any
from backend.providers.open_meteo import OpenMeteoWeatherProvider
from backend.providers.demo_provider import DemoWeatherProvider
from backend.config import settings

class WeatherAgent:
    def __init__(self):
        self.name = "Weather Agent"
        self.live_provider = OpenMeteoWeatherProvider()
        self.demo_provider = DemoWeatherProvider()

    def execute(self, lat: float, lng: float, override_wind: float = None, override_code: str = None) -> Dict[str, Any]:
        """Collect wind speed, direction, visibility, rain, temperature."""
        if not settings.DEMO_MODE:
            live_data = self.live_provider.get_weather_conditions(lat, lng)
            if live_data:
                return live_data

        return self.demo_provider.get_weather_conditions(lat, lng, override_wind=override_wind, override_code=override_code)
