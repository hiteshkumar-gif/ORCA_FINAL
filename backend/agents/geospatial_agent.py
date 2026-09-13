from typing import Dict, Any, List
from backend.geospatial.geo_utils import get_map_layers, check_route_hazard_intersection, calculate_distance_km

class GeospatialAgent:
    def __init__(self):
        self.name = "Geospatial Agent"

    def execute(self, lat: float, lng: float, target_lat: float = None, target_lng: float = None) -> Dict[str, Any]:
        """Perform spatial queries, hazard intersection checks, marine boundaries & GeoJSON rendering."""
        t_lat = target_lat if target_lat is not None else lat + 0.08
        t_lng = target_lng if target_lng is not None else lng + 0.12

        distance = calculate_distance_km((lat, lng), (t_lat, t_lng))
        map_layers = get_map_layers(center_lat=lat, center_lng=lng)

        route_pts = [(lat, lng), ((lat + t_lat) / 2, (lng + t_lng) / 2), (t_lat, t_lng)]
        has_hazard = check_route_hazard_intersection(route_pts)

        return {
            "distance_km": round(distance, 1),
            "hazard_intersected": has_hazard,
            "geo_layers": map_layers,
            "target_coordinates": [t_lat, t_lng]
        }
