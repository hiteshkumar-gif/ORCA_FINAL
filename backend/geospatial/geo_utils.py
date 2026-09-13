import math
from typing import List, Dict, Any, Tuple
# pyrefly: ignore [missing-import]
from haversine import haversine, Unit
from shapely.geometry import Point, Polygon, LineString

# Defined Hazard & Restricted Zones around major ports/coastal areas (e.g. Chennai Port Shipping Lane & Naval Reserve)
CHENNAI_PORT_RESTRICTED = Polygon([
    (80.290, 13.090),
    (80.320, 13.090),
    (80.320, 13.120),
    (80.290, 13.120)
])

CHENNAI_COASTAL_HAZARD = Polygon([
    (80.300, 13.020),
    (80.340, 13.020),
    (80.340, 13.050),
    (80.300, 13.050)
])

def calculate_distance_km(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """Calculate distance in km between (lat, lng) tuples."""
    return haversine(coord1, coord2, unit=Unit.KILOMETERS)

def check_route_hazard_intersection(route_points: List[Tuple[float, float]]) -> bool:
    """Check if a route line intersects restricted or hazard polygons (points as (lat, lng))."""
    if len(route_points) < 2:
        return False
    # Convert to (lng, lat) for Shapely standard
    line_coords = [(p[1], p[0]) for p in route_points]
    route_line = LineString(line_coords)
    return route_line.intersects(CHENNAI_PORT_RESTRICTED) or route_line.intersects(CHENNAI_COASTAL_HAZARD)

def generate_default_routes(start_lat: float, start_lng: float, end_lat: float, end_lng: float) -> List[Dict[str, Any]]:
    """Generate primary safe route and alternative coastal corridor."""
    dist = calculate_distance_km((start_lat, start_lng), (end_lat, end_lng))
    
    # Waypoint 1: Direct route
    mid_lat = (start_lat + end_lat) / 2.0
    mid_lng = (start_lng + end_lng) / 2.0
    
    # Waypoint 2: Sheltered Coastal Inshore Channel
    coastal_mid_lat = mid_lat + 0.015
    coastal_mid_lng = start_lng + (end_lng - start_lng) * 0.3

    direct_waypoints = [
        [start_lat, start_lng],
        [mid_lat, mid_lng],
        [end_lat, end_lng]
    ]

    coastal_waypoints = [
        [start_lat, start_lng],
        [coastal_mid_lat, coastal_mid_lng],
        [end_lat, end_lng]
    ]

    return [
        {
            "route_name": "Direct Deep-Water Corridor",
            "distance_km": round(dist, 1),
            "estimated_time_mins": int((dist / 18.0) * 60), # 18 km/h speed
            "safety_score": 92.0,
            "waypoints": direct_waypoints,
            "is_recommended": True
        },
        {
            "route_name": "Sheltered Inshore Channel",
            "distance_km": round(dist * 1.15, 1),
            "estimated_time_mins": int(((dist * 1.15) / 16.0) * 60),
            "safety_score": 95.0,
            "waypoints": coastal_waypoints,
            "is_recommended": False
        }
    ]

def get_map_layers(center_lat: float = 13.0827, center_lng: float = 80.2707) -> List[Dict[str, Any]]:
    """Return GeoJSON features for map overlays: Zone A, Zone B, Zone C, Hazard Zones, Boundaries."""
    return [
        {
            "feature_type": "PFZ",
            "name": "Zone A — Moderate PFZ",
            "zone_id": "ZONE_A",
            "pfz_score": 72,
            "coordinates": [
                [center_lat + 0.05, center_lng + 0.05],
                [center_lat + 0.09, center_lng + 0.05],
                [center_lat + 0.09, center_lng + 0.11],
                [center_lat + 0.05, center_lng + 0.11]
            ],
            "description": "Inshore fishing sector with moderate pelagic fish aggregation (PFZ Score: 72/100)."
        },
        {
            "feature_type": "PFZ",
            "name": "Zone B — High PFZ (Recommended)",
            "zone_id": "ZONE_B",
            "pfz_score": 86,
            "coordinates": [
                [center_lat + 0.08, center_lng + 0.12],
                [center_lat + 0.14, center_lng + 0.12],
                [center_lat + 0.14, center_lng + 0.20],
                [center_lat + 0.08, center_lng + 0.20]
            ],
            "description": "High Chlorophyll-a thermal front zone off coastal shelf with strong pelagic fish density (PFZ Score: 86/100)."
        },
        {
            "feature_type": "PFZ",
            "name": "Zone C — Very High PFZ",
            "zone_id": "ZONE_C",
            "pfz_score": 91,
            "coordinates": [
                [center_lat - 0.04, center_lng + 0.18],
                [center_lat + 0.03, center_lng + 0.18],
                [center_lat + 0.03, center_lng + 0.26],
                [center_lat - 0.04, center_lng + 0.26]
            ],
            "description": "Deep offshore upwelling zone with very high fish aggregation (PFZ Score: 91/100, extended transit distance)."
        },
        {
            "feature_type": "RESTRICTED_ZONE",
            "name": "Port Shipping Channel (Restricted Area)",
            "zone_id": "PORT_CHANNEL",
            "coordinates": [
                [center_lat + 0.01, center_lng + 0.02],
                [center_lat + 0.04, center_lng + 0.02],
                [center_lat + 0.04, center_lng + 0.05],
                [center_lat + 0.01, center_lng + 0.05]
            ],
            "description": "Commercial Vessel Traffic Zone — Fishing strictly prohibited by maritime port authority."
        },
        {
            "feature_type": "RESTRICTED_ZONE",
            "name": "Indian Exclusive Economic Zone (EEZ Outer Limit)",
            "zone_id": "EEZ_LIMIT",
            "coordinates": [
                [center_lat - 0.25, center_lng - 0.10],
                [center_lat + 0.35, center_lng - 0.10],
                [center_lat + 0.35, center_lng + 0.50],
                [center_lat - 0.25, center_lng + 0.50]
            ],
            "description": "Indian Exclusive Economic Zone maritime jurisdiction boundary."
        },
        {
            "feature_type": "HAZARD",
            "name": "Shallow Reef & Coastal Swell Hazard",
            "zone_id": "COASTAL_HAZARD",
            "coordinates": [
                [center_lat - 0.08, center_lng + 0.03],
                [center_lat - 0.04, center_lng + 0.03],
                [center_lat - 0.04, center_lng + 0.08],
                [center_lat - 0.08, center_lng + 0.08]
            ],
            "description": "High swell breaker zone with shallow navigation obstacles."
        }
    ]
