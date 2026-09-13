from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class LocationQuery(BaseModel):
    name: str
    latitude: float
    longitude: float

class UserQueryRequest(BaseModel):
    query: str
    user_location: Optional[LocationQuery] = None
    language: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class IntentResult(BaseModel):
    intent: str = "marine_trip_safety"
    location: str = "Chennai"
    latitude: float = 13.0827
    longitude: float = 80.2707
    date: str = "tomorrow"
    time: str = "morning"
    activity: str = "fishing"
    language_detected: str = "English"

class MarineConditionData(BaseModel):
    wave_height_m: float
    wave_period_s: float
    current_speed_knots: float
    sea_surface_temp_c: float
    timestamp: str
    source: str
    is_live: bool = False

class WeatherConditionData(BaseModel):
    wind_speed_kmh: float
    wind_direction_deg: float
    temperature_c: float
    visibility_km: float
    precipitation_probability: float
    weather_code: str
    timestamp: str
    source: str
    is_live: bool = False

class SatelliteData(BaseModel):
    sst_anomaly_c: float
    chlorophyll_a_mg_m3: float
    cloud_cover_percent: float
    sensor_source: str = "MOSDAC / MODIS Aqua"
    is_live: bool = False

class FishingOpportunityData(BaseModel):
    opportunity_score: float # 0-100
    potential_zone_name: str
    distance_km: float
    chlorophyll_indicator: str
    fish_density_index: str # High, Moderate, Low
    best_hours: str

class GeoFeature(BaseModel):
    feature_type: str # RESTRICTED_ZONE, HAZARD, PFZ, ROUTE_CORRIDOR
    name: str
    coordinates: List[List[float]] # GeoJSON ring or line
    description: str

class SafetyAssessmentResult(BaseModel):
    safety_score: float # 0-100
    risk_level: str # LOW, MODERATE, HIGH, CRITICAL
    factors: List[str]
    evidence_items: List[Dict[str, Any]]
    passed_rules: List[str]
    failed_rules: List[str]

class RouteOption(BaseModel):
    route_name: str
    distance_km: float
    estimated_time_mins: int
    safety_score: float
    waypoints: List[List[float]] # [[lat, lng], ...]
    is_recommended: bool = False

class AlternativeOption(BaseModel):
    type: str # TIME_SHIFT, ROUTE_CHANGE, ZONE_CHANGE
    title: str
    description: str
    expected_safety_score: float

class DecisionResult(BaseModel):
    decision_id: str
    decision_code: str
    original_query: str
    location_name: str
    latitude: float
    longitude: float
    activity: str
    target_time: str

    recommendation: str # GO, CAUTION, WAIT
    overall_score: float
    safety_score: float
    fishing_score: float
    travel_score: float

    explanation: str
    evidence: List[Dict[str, Any]]
    risk_factors: List[str]
    alternatives: List[AlternativeOption]
    routes: List[RouteOption]
    fishing_zone: Optional[Dict[str, Any]] = None
    geo_features: List[GeoFeature] = []

    status: str
    is_monitored: bool
    is_demo: bool
    created_at: str
    last_checked_at: str

class AgentStepTrace(BaseModel):
    agent_name: str
    status: str # SUCCESS, RUNNING, FAILED
    duration_ms: float
    message: str

class QueryResponse(BaseModel):
    decision: DecisionResult
    agent_traces: List[AgentStepTrace]

class SimulateConditionChangeRequest(BaseModel):
    wave_height_m: Optional[float] = 2.7
    wind_speed_kmh: Optional[float] = 45.0
    weather_code: Optional[str] = "THUNDERSTORM"

class MonitoringStatusResponse(BaseModel):
    decision_id: str
    decision_code: str
    current_status: str
    is_monitored: bool
    last_checked_at: str
    latest_event: Optional[Dict[str, Any]] = None

class FeedbackRequest(BaseModel):
    rating: int # 1-5
    outcome: str # SUCCESSFUL_TRIP, TURNED_BACK, HAZARD_ENCOUNTERED, FISH_CAUGHT
    notes: Optional[str] = None

class ChatMessage(BaseModel):
    sender: str # "user" or "orca"
    text: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    language: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    marine_summary: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    language_detected: Optional[str] = "auto"
    status: str = "success"

