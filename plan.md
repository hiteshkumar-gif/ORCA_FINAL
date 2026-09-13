# ORCA — Technical Architecture & Implementation Specification

## 1. Executive Summary

ORCA (Marine Ecosystem Reasoning with Collaborative Agents) is an AI-powered marine decision-support system designed to convert complex oceanographic, meteorological, satellite, and geospatial data into clear, explainable, and continuously monitored operational recommendations (`GO`, `CAUTION`, `WAIT`) for fishermen and maritime operators.

---

## 2. Multi-Agent System Architecture

The application uses a 12-agent collaborative architecture:
1. **Orchestrator Agent**: Manages multi-agent execution pipeline.
2. **Intent & Language Agent**: Multilingual query parsing (English, Hindi, Hinglish, Tamil).
3. **Marine Data Agent**: Open-Meteo REST API integration for wave height, period, ocean current.
4. **Weather Agent**: Open-Meteo REST API integration for wind speed, direction, visibility, precipitation.
5. **Satellite / EO Agent**: NOAA ERDDAP / MOSDAC SST anomaly & chlorophyll-a indicators.
6. **Fishing Opportunity Agent**: Potential Fishing Zones (PFZ) yield scoring.
7. **Geospatial Agent**: Haversine distance, boundary polygon intersections, and route corridors.
8. **Safety Agent**: Safety threshold validation and risk factor synthesis.
9. **Route Optimization Agent**: Direct deep-water & sheltered inshore channels.
10. **Decision Agent**: Synthesizes agent telemetry and calls deterministic decision engine.
11. **Monitoring Agent**: Background watch engine tracking material condition changes.
12. **Feedback Agent**: Mission outcome logging & score calibration.

---

## 3. Deterministic Decision Engine Logic

```
STEP 1: HARD STOPS (immediate WAIT)
  - Hazard / Boundary intersection
  - Wave height > 2.5m
  - Wind speed > 40 km/h
  - Weather code IN [THUNDERSTORM, SQUALL, CYCLONE]

STEP 2: SAFETY SCORE (0-100)
  - Wave score: <=1.5m -> 100 | <=2.5m -> 60 | >2.5m -> 0
  - Wind score: <=25km/h -> 100 | <=40km/h -> 60 | >40km/h -> 0
  - Current score: <=1.5kn -> 100 | >1.5kn -> 40
  - Visibility score: >=6km -> 100 | <6km -> 20
  - Safety score = mean(wave_score, wind_score, current_score, visibility_score)

STEP 3: FISHING SCORE (0-100)
  - PFZ Score directly from satellite/ocean model

STEP 4: EFFORT SCORE (0-100)
  - distance < 20km -> 100 | < 50km -> 70 | < 100km -> 40 | else -> 10

STEP 5: WEIGHTED FINAL SCORE
  - overall_score = (safety_score * 0.50) + (fishing_score * 0.30) + (effort_score * 0.20)

STEP 6: STATUS DETERMINATION
  - overall_score >= 75 and safety_score >= 60 -> GO
  - overall_score >= 50 -> CAUTION
  - else -> WAIT
```

---

## 4. 8 Primary Marine Factors

1. **Wave Height** (`wave_height_m`) — meters
2. **Wind Speed** (`wind_speed_kmh`) — km/h
3. **Ocean Current** (`current_speed_knots`) — knots
4. **Visibility** (`visibility_km`) — km
5. **Sea Surface Temp (SST)** (`sea_surface_temp_c`) — °C
6. **PFZ Fishing Yield** (`opportunity_score`) — /100
7. **Severe Hazard Alert** (`weather_code`) — State
8. **Transit Distance** (`distance_km`) — km

---

## 5. Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Leaflet, Lucide Icons
- **Backend**: FastAPI, Python 3.10+, SQLite (SQLAlchemy), Pydantic V2, Open-Meteo REST API
- **Deployment**: Docker, Google Cloud Build / Cloud Run ready
