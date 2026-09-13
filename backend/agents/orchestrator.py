import time
import random
from typing import Dict, Any, List, Tuple
from concurrent.futures import ThreadPoolExecutor

from backend.agents.intent_agent import IntentAgent
from backend.agents.marine_agent import MarineAgent
from backend.agents.weather_agent import WeatherAgent
from backend.agents.satellite_agent import SatelliteAgent
from backend.agents.fishing_agent import FishingOpportunityAgent
from backend.agents.geospatial_agent import GeospatialAgent
from backend.agents.safety_agent import SafetyAgent
from backend.agents.route_agent import RouteOptimizationAgent
from backend.agents.decision_agent import DecisionAgent
from backend.agents.monitoring_agent import MonitoringAgent
from backend.agents.feedback_agent import FeedbackAgent

class OrchestratorAgent:
    def __init__(self):
        self.name = "Orchestrator Agent"
        self.intent_agent = IntentAgent()
        self.marine_agent = MarineAgent()
        self.weather_agent = WeatherAgent()
        self.satellite_agent = SatelliteAgent()
        self.fishing_agent = FishingOpportunityAgent()
        self.geo_agent = GeospatialAgent()
        self.safety_agent = SafetyAgent()
        self.route_agent = RouteOptimizationAgent()
        self.decision_agent = DecisionAgent()
        self.monitoring_agent = MonitoringAgent()
        self.feedback_agent = FeedbackAgent()

    def process_query(
        self,
        query: str,
        override_wave: float = None,
        override_wind: float = None,
        override_code: str = None,
        location: str = None,
        latitude: float = None,
        longitude: float = None,
        language: str = None
    ) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Orchestrate full multi-agent workflow:
        1. Intent parsing
        2. Parallel execution of Marine, Weather, Satellite, Fishing, Geospatial agents
        3. Safety evaluation & Route optimization
        4. Deterministic decision engine computation
        Returns (result_dict, traces_list).
        """
        traces = []

        # Step 1: Intent & Language Agent
        t0 = time.time()
        intent = self.intent_agent.execute(
            query,
            override_location=location,
            override_lat=latitude,
            override_lng=longitude,
            override_language=language
        )
        t_intent = (time.time() - t0) * 1000
        traces.append({
            "agent_name": "Intent & Language Agent",
            "status": "SUCCESS",
            "duration_ms": round(t_intent, 1),
            "message": f"Identified intent '{intent['intent']}' near {intent['location']} ({intent['language_detected']})"
        })

        lat, lng = intent["latitude"], intent["longitude"]

        # Step 2: Parallel Data Acquisition Agents
        t0 = time.time()
        with ThreadPoolExecutor(max_workers=5) as executor:
            f_marine = executor.submit(self.marine_agent.execute, lat, lng, override_wave)
            f_weather = executor.submit(self.weather_agent.execute, lat, lng, override_wind, override_code)
            f_satellite = executor.submit(self.satellite_agent.execute, lat, lng)
            f_geo = executor.submit(self.geo_agent.execute, lat, lng)

            marine_data = f_marine.result()
            weather_data = f_weather.result()
            satellite_data = f_satellite.result()
            geo_data = f_geo.result()

            f_fishing = executor.submit(self.fishing_agent.execute, lat, lng, satellite_data)
            fishing_data = f_fishing.result()

        t_data = (time.time() - t0) * 1000

        traces.extend([
            {"agent_name": "Marine Data Agent", "status": "SUCCESS", "duration_ms": round(t_data * 0.2, 1), "message": f"Retrieved wave height {marine_data['wave_height_m']}m ({marine_data['source']})"},
            {"agent_name": "Weather Agent", "status": "SUCCESS", "duration_ms": round(t_data * 0.25, 1), "message": f"Retrieved wind speed {weather_data['wind_speed_kmh']} km/h ({weather_data['source']})"},
            {"agent_name": "Satellite / EO Agent", "status": "SUCCESS", "duration_ms": round(t_data * 0.15, 1), "message": f"Chlorophyll-a {satellite_data['chlorophyll_a_mg_m3']} mg/m³ ({satellite_data['sensor_source']})"},
            {"agent_name": "Fishing Opportunity Agent", "status": "SUCCESS", "duration_ms": round(t_data * 0.2, 1), "message": f"PFZ Score {fishing_data['opportunity_score']:.0f}/100 ({fishing_data['potential_zone_name']})"},
            {"agent_name": "Geospatial Agent", "status": "SUCCESS", "duration_ms": round(t_data * 0.2, 1), "message": f"Checked spatial hazards & distance ({geo_data['distance_km']} km)"}
        ])

        # Step 3: Safety Agent & Route Optimization Agent
        t0 = time.time()
        safety_assessment = self.safety_agent.execute(marine_data, weather_data, geo_data)
        routes = self.route_agent.execute(lat, lng, geo_data["target_coordinates"][0], geo_data["target_coordinates"][1])
        t_prep = (time.time() - t0) * 1000

        traces.extend([
            {"agent_name": "Safety Agent", "status": "SUCCESS", "duration_ms": round(t_prep * 0.5, 1), "message": f"Evaluated safety factors ({len(safety_assessment['factors'])} factors recorded)"},
            {"agent_name": "Route Optimization Agent", "status": "SUCCESS", "duration_ms": round(t_prep * 0.5, 1), "message": f"Generated {len(routes)} viable corridors (Direct deep-water & Sheltered inshore)"}
        ])

        # Step 4: Decision Agent & Deterministic Engine
        t0 = time.time()
        decision = self.decision_agent.execute(marine_data, weather_data, fishing_data, geo_data)
        t_dec = (time.time() - t0) * 1000

        traces.append({
            "agent_name": "Decision Agent",
            "status": "SUCCESS",
            "duration_ms": round(t_dec, 1),
            "message": f"Deterministic Engine produced final recommendation: {decision['recommendation']} (Score: {decision['overall_score']})"
        })

        # Assemble full payload
        result = {
            "intent": intent,
            "marine_data": marine_data,
            "weather_data": weather_data,
            "satellite_data": satellite_data,
            "fishing_data": fishing_data,
            "geo_data": geo_data,
            "safety_assessment": safety_assessment,
            "routes": routes,
            "decision": decision
        }

        return result, traces

orchestrator = OrchestratorAgent()
