from typing import Dict, Any, List
from backend.geospatial.geo_utils import generate_default_routes

class RouteOptimizationAgent:
    def __init__(self):
        self.name = "Route Optimization Agent"

    def execute(self, start_lat: float, start_lng: float, target_lat: float, target_lng: float) -> List[Dict[str, Any]]:
        """Evaluate direct and sheltered alternative routes based on hazards & sea conditions."""
        return generate_default_routes(start_lat, start_lng, target_lat, target_lng)
