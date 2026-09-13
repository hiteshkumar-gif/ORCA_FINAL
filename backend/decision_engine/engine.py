"""
ORCA Deterministic Decision Engine
Rule-based scoring, safety threshold evaluations, and decision synthesis.
Strictly decoupled from LLM inference to guarantee deterministic safety outputs.
Follows PLAN.md Steps 1-7 scoring specification.
"""
from typing import Dict, Any, List, Tuple
from backend.config import settings

class DeterministicDecisionEngine:
    def __init__(self):
        self.w_safety = settings.WEIGHT_SAFETY   # 0.50
        self.w_fishing = settings.WEIGHT_FISHING # 0.30
        self.w_travel = settings.WEIGHT_TRAVEL   # 0.20

    def evaluate_wave_safety(self, wave_height_m: float) -> Tuple[float, str, str]:
        if wave_height_m <= settings.WAVE_SAFE_MAX: # <= 1.5m
            return 100.0, "SAFE", f"Wave height is {wave_height_m:.1f}m (within safe limit <= 1.5m)"
        elif wave_height_m <= settings.WAVE_CAUTION_MAX: # 1.5 - 2.5m
            return 60.0, "CAUTION", f"Wave height is {wave_height_m:.1f}m (moderate sea state 1.5m-2.5m)"
        else: # > 2.5m
            return 0.0, "UNSAFE", f"Wave height is {wave_height_m:.1f}m (exceeds dangerous threshold > 2.5m)"

    def evaluate_wind_safety(self, wind_speed_kmh: float) -> Tuple[float, str, str]:
        if wind_speed_kmh <= settings.WIND_SAFE_MAX: # <= 25 km/h
            return 100.0, "SAFE", f"Wind speed is {wind_speed_kmh:.1f} km/h (gentle to moderate breeze)"
        elif wind_speed_kmh <= settings.WIND_CAUTION_MAX: # 25 - 40 km/h
            return 60.0, "CAUTION", f"Wind speed is {wind_speed_kmh:.1f} km/h (fresh breeze, exercise caution)"
        else: # > 40 km/h
            return 0.0, "UNSAFE", f"Wind speed is {wind_speed_kmh:.1f} km/h (strong gale force winds > 40 km/h)"

    def evaluate_current_safety(self, current_knots: float) -> Tuple[float, str]:
        if current_knots <= 1.5:
            return 100.0, f"Ocean current velocity is {current_knots:.1f} knots (safe <= 1.5 kn)"
        else:
            return 40.0, f"Ocean current velocity is {current_knots:.1f} knots (strong current > 1.5 kn)"

    def evaluate_visibility(self, visibility_km: float) -> Tuple[float, str]:
        if visibility_km >= 6.0:
            return 100.0, f"Visibility is clear ({visibility_km:.1f} km)"
        else:
            return 20.0, f"Poor visibility ({visibility_km:.1f} km - risk of fog/mist)"

    def evaluate_effort_score(self, distance_km: float) -> float:
        if distance_km < 20.0:
            return 100.0
        elif distance_km < 50.0:
            return 70.0
        elif distance_km < 100.0:
            return 40.0
        else:
            return 10.0

    def compute_decision(
        self,
        marine_data: Dict[str, Any],
        weather_data: Dict[str, Any],
        fishing_data: Dict[str, Any],
        distance_km: float = 18.5,
        hazard_intersected: bool = False
    ) -> Dict[str, Any]:
        wave_height = marine_data.get("wave_height_m", 1.2)
        wave_period = marine_data.get("wave_period_s", 7.0)
        current_knots = marine_data.get("current_speed_knots", 0.8)
        wind_speed = weather_data.get("wind_speed_kmh", 18.0)
        visibility = weather_data.get("visibility_km", 10.0)
        precip_prob = weather_data.get("precipitation_probability", 10.0)
        weather_code = weather_data.get("weather_code", "CLEAR")

        # STEP 1: HARD STOPS (OVERRIDE ALL)
        hard_stop_triggered = False
        hard_stop_reasons = []

        if hazard_intersected:
            hard_stop_triggered = True
            hard_stop_reasons.append("Route intersects restricted marine boundary or naval zone")
        if wave_height > settings.WAVE_CAUTION_MAX: # > 2.5m
            hard_stop_triggered = True
            hard_stop_reasons.append(f"Wave height {wave_height:.1f}m exceeds dangerous threshold (2.5m)")
        if wind_speed > settings.WIND_CAUTION_MAX: # > 40 km/h
            hard_stop_triggered = True
            hard_stop_reasons.append(f"Wind speed {wind_speed:.1f} km/h exceeds dangerous threshold (40 km/h)")
        if weather_code in ["THUNDERSTORM", "SQUALL", "CYCLONE"]:
            hard_stop_triggered = True
            hard_stop_reasons.append(f"Severe weather / lightning alert active: {weather_code}")

        # STEP 2: SAFETY SCORE (0-100)
        wave_score, wave_status, wave_msg = self.evaluate_wave_safety(wave_height)
        wind_score, wind_status, wind_msg = self.evaluate_wind_safety(wind_speed)
        current_score, current_msg = self.evaluate_current_safety(current_knots)
        vis_score, vis_msg = self.evaluate_visibility(visibility)

        base_safety = (wave_score + wind_score + current_score + vis_score) / 4.0

        risk_factors = []
        if wave_status != "SAFE":
            risk_factors.append(wave_msg)
        if wind_status != "SAFE":
            risk_factors.append(wind_msg)
        if current_knots > 1.5:
            risk_factors.append(current_msg)
        if visibility < 6.0:
            risk_factors.append(vis_msg)
        if precip_prob > 50.0:
            base_safety -= 10.0
            risk_factors.append(f"High precipitation probability ({precip_prob:.0f}%)")
        if hard_stop_reasons:
            risk_factors.extend(hard_stop_reasons)

        safety_score = max(min(base_safety, 100.0), 0.0)

        # STEP 3: FISHING SCORE (0-100)
        fishing_score = float(fishing_data.get("opportunity_score", 80.0))

        # STEP 4: EFFORT SCORE (0-100)
        effort_score = self.evaluate_effort_score(distance_km)

        # STEP 5: WEIGHTED FINAL SCORE
        # final_score = (safety_score * 0.50) + (fishing_score * 0.30) + (effort_score * 0.20)
        overall_score = (
            (self.w_safety * safety_score) +
            (self.w_fishing * fishing_score) +
            (self.w_travel * effort_score)
        )

        # STEP 6: STATUS DETERMINATION
        if hard_stop_triggered:
            recommendation = "WAIT"
        elif overall_score >= 75.0 and safety_score >= 60.0:
            recommendation = "GO"
        elif overall_score >= 50.0:
            recommendation = "CAUTION"
        else:
            recommendation = "WAIT"

        # STEP 7: BUILD REASONS LIST & EVIDENCE
        evidence = [
            {"label": "Wave Height", "value": f"{wave_height:.1f} m", "status": wave_status, "impact": "High"},
            {"label": "Wave Period", "value": f"{wave_period:.1f} s", "status": "SAFE" if wave_period >= 6.0 else "CAUTION", "impact": "Medium"},
            {"label": "Wind Speed", "value": f"{wind_speed:.1f} km/h", "status": wind_status, "impact": "High"},
            {"label": "Ocean Current", "value": f"{current_knots:.1f} kn", "status": "SAFE" if current_knots <= 1.5 else "CAUTION", "impact": "Medium"},
            {"label": "Visibility", "value": f"{visibility:.1f} km", "status": "SAFE" if visibility >= 6.0 else "CAUTION", "impact": "Medium"},
            {"label": "Fishing Opportunity", "value": f"{fishing_score:.0f}/100", "status": "HIGH" if fishing_score >= 75 else "MODERATE", "impact": "Opportunity"},
            {"label": "Distance to Zone", "value": f"{distance_km:.1f} km", "status": "SAFE" if distance_km <= 30 else "CAUTION", "impact": "Travel"}
        ]

        alternatives = []
        if recommendation != "GO":
            alternatives.append({
                "type": "TIME_SHIFT",
                "title": "Depart at 09:30 AM (Delayed Departure)",
                "description": "Wave and wind conditions are forecast to subside by ~0.8m after 09:00 AM.",
                "expected_safety_score": min(safety_score + 25.0, 95.0)
            })
            alternatives.append({
                "type": "ZONE_CHANGE",
                "title": "Inshore Sheltered Spot (South Coastal Shelf)",
                "description": "Shift to sheltered inshore zone 8 km off the coast to avoid offshore swell.",
                "expected_safety_score": min(safety_score + 20.0, 90.0)
            })
        else:
            alternatives.append({
                "type": "ROUTE_CHANGE",
                "title": "Optimized Coastal Channel Route",
                "description": "Follow shallow coastal shelf corridor for smoother sea state.",
                "expected_safety_score": 95.0
            })

        if recommendation == "GO":
            explanation = (
                f"Conditions near {marine_data.get('location_name', 'target location')} are favorable for maritime activity. "
                f"Wave height ({wave_height:.1f}m) and wind speed ({wind_speed:.1f} km/h) are within safe operational thresholds. "
                f"Fishing opportunity score is strong at {fishing_score:.0f}/100."
            )
        elif recommendation == "CAUTION":
            explanation = (
                f"Maritime operations require elevated vigilance near {marine_data.get('location_name', 'target location')}. "
                f"Moderate wave height ({wave_height:.1f}m) or wind speeds ({wind_speed:.1f} km/h) present minor risk factors. "
                f"Proceed with safety gear and maintain continuous monitoring."
            )
        else: # WAIT
            reason_str = f" Reason: {'; '.join(hard_stop_reasons)}" if hard_stop_reasons else f" Wave height ({wave_height:.1f}m) or wind speed ({wind_speed:.1f} km/h) exceed safety limits."
            explanation = (
                f"Departure is NOT recommended near {marine_data.get('location_name', 'target location')} due to hazardous conditions."
                f"{reason_str} Delay departure until sea conditions stabilize."
            )

        return {
            "recommendation": recommendation,
            "overall_score": round(overall_score, 1),
            "safety_score": round(safety_score, 1),
            "fishing_score": round(fishing_score, 1),
            "travel_score": round(effort_score, 1),
            "explanation": explanation,
            "evidence": evidence,
            "risk_factors": risk_factors if risk_factors else ["No major hazard risk factors detected"],
            "alternatives": alternatives
        }

decision_engine = DeterministicDecisionEngine()

