from typing import Dict, Any
from backend.decision_engine.engine import decision_engine

class DecisionAgent:
    def __init__(self):
        self.name = "Decision Agent"
        self.engine = decision_engine

    def execute(
        self,
        marine_data: Dict[str, Any],
        weather_data: Dict[str, Any],
        fishing_data: Dict[str, Any],
        geo_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Combine all agent outputs and invoke deterministic engine calculation."""
        dist = geo_data.get("distance_km", 18.5)
        has_hazard = geo_data.get("hazard_intersected", False)
        
        return self.engine.compute_decision(
            marine_data=marine_data,
            weather_data=weather_data,
            fishing_data=fishing_data,
            distance_km=dist,
            hazard_intersected=has_hazard
        )
