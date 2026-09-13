from typing import Dict, Any
from backend.providers.demo_provider import DemoFishingProvider

class FishingOpportunityAgent:
    def __init__(self):
        self.name = "Fishing Opportunity Agent"
        self.provider = DemoFishingProvider()

    def execute(self, lat: float, lng: float, satellite_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Evaluate potential fishing zones (PFZ), environmental suitability, fish density."""
        data = self.provider.get_fishing_opportunity(lat, lng)
        if satellite_data and satellite_data.get("chlorophyll_a_mg_m3", 0) > 2.5:
            data["opportunity_score"] = min(data["opportunity_score"] + 5.0, 98.0)
        return data
