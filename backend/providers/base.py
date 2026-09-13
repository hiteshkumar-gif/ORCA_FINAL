from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseMarineProvider(ABC):
    @abstractmethod
    def get_marine_conditions(self, lat: float, lng: float) -> Dict[str, Any]:
        pass

class BaseWeatherProvider(ABC):
    @abstractmethod
    def get_weather_conditions(self, lat: float, lng: float) -> Dict[str, Any]:
        pass

class BaseSatelliteProvider(ABC):
    @abstractmethod
    def get_satellite_data(self, lat: float, lng: float) -> Dict[str, Any]:
        pass

class BaseFishingProvider(ABC):
    @abstractmethod
    def get_fishing_opportunity(self, lat: float, lng: float) -> Dict[str, Any]:
        pass
