# ORCA — Marine Ecosystem Reasoning with Collaborative Agents

> **Agentic AI-Powered Marine Intelligence & Decision-Support Platform**
> Converting fragmented oceanographic, weather, satellite, and geospatial data into explainable, continuously monitored decisions for maritime operators, fishermen, and disaster management authorities.

---

## Architecture & System Overview

```
                                  ┌───────────────────────────────────────────┐
                                  │       Next.js Command Center UI           │
                                  │ (Leaflet, Framer Motion, Glassmorphism)   │
                                  └─────────────────────┬─────────────────────┘
                                                        │ REST / Streaming JSON
                                  ┌─────────────────────▼─────────────────────┐
                                  │        FastAPI Backend Gateway            │
                                  └─────────────────────┬─────────────────────┘
                                                        │
                                  ┌─────────────────────▼─────────────────────┐
                                  │           Agent Orchestrator              │
                                  └──────┬──────────────┬──────────────┬──────┘
                                         │              │              │
                    ┌────────────────────▼──┐    ┌──────▼──────┐    ┌──▼──────────────────┐
                    │ Intent & Lang Agent   │    │ Geospatial  │    │ Data Agents         │
                    │ (Multilingual/Gemini) │    │ Agent       │    │ (Marine, Weather, EO│
                    └───────────────────────┘    └─────────────┘    └─────────────────────┘
                                         │              │              │
                                         └──────────────┼──────────────┘
                                                        │ Structured Pydantic IPC
                                  ┌─────────────────────▼─────────────────────┐
                                  │      Deterministic Decision Engine        │
                                  │   (Rule-based Scoring & Safety Limits)    │
                                  └─────────────────────┬─────────────────────┘
                                                        │ Decision & Evidence
                                  ┌─────────────────────▼─────────────────────┐
                                  │      Living Decision & Monitoring         │
                                  │      (APScheduler / Event Engine)         │
                                  └───────────────────────────────────────────┘
```

---

## Key Features

1. **Deterministic Safety Core**: Safety decisions are strictly calculated by rule-based Python algorithms (`decision_engine/`), decoupled from direct LLM inference to guarantee absolute reliability.
2. **12 Collaborative AI Agents**:
   - `Orchestrator Agent`: Task distribution and parallel execution management.
   - `Intent & Language Agent`: Multilingual intent understanding (English, Hindi, Hinglish, Tamil).
   - `Marine Data Agent`: Wave height, period, ocean current velocity.
   - `Weather Agent`: Wind speed, direction, temperature, visibility, precipitation.
   - `Satellite / EO Agent`: Chlorophyll-a concentration & sea surface temp anomaly.
   - `Fishing Opportunity Agent`: Potential Fishing Zones (PFZ) & pelagic density scoring.
   - `Geospatial Agent`: Haversine distance, Shapely polygon hazard intersection, GeoJSON maps.
   - `Safety Agent`: Risk factor synthesis and safety rule verification.
   - `Route Optimization Agent`: Deep-water direct & sheltered inshore route corridors.
   - `Decision Agent`: Multi-agent data synthesis and decision engine invocation.
   - `Monitoring Agent`: Material change detection (wave delta > 0.5m, wind delta > 10 km/h).
   - `Feedback / Learning Agent`: Post-mission outcome logging & score calibration.
3. **Living Decision Lifecycle**:
   - Recommendations remain active (`DECIDE` → `TRACK` → `WATCH` → `CHANGE` → `REPAIR/WAIT` → `RE-MONITOR` → `COMPLETE` → `FEEDBACK`).
4. **Data Transparency**: Explicit `is_live: boolean` metadata on all responses cleanly distinguishes Live Open-Meteo API data from Demo Simulation data.

---

## Deterministic Scoring Model

- **Wave Height Rules**:
  - `<= 1.5m`: **SAFE** (100 pts)
  - `1.5m - 2.5m`: **CAUTION** (60 pts)
  - `> 2.5m`: **UNSAFE** (20 pts)
- **Wind Speed Rules**:
  - `<= 25 km/h`: **SAFE** (100 pts)
  - `25 - 40 km/h`: **CAUTION** (60 pts)
  - `> 40 km/h`: **UNSAFE** (15 pts)
- **Weighted Score**:
  `overall_score = 0.50 * safety_score + 0.30 * fishing_score + 0.20 * travel_score`
- **Decision Mapping**:
  - `overall_score >= 75`: **GO**
  - `55 <= overall_score < 75`: **CAUTION**
  - `overall_score < 55` (or Safety < 45): **WAIT**

---

## Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ / npm

### Backend Setup
```bash
# Initialize virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend tests
PYTHONPATH=. pytest tests/

# Launch FastAPI backend server (Port 8000)
PYTHONPATH=. uvicorn backend.main:app --reload --port 8000
```
Swagger API Documentation is available at: `http://localhost:8000/docs`

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Build Next.js application
npm run build

# Launch frontend dev server (Port 3000)
npm run dev -- --port 3000
```
Access Command Center UI at: `http://localhost:3000/dashboard`

---

## Hackathon Demonstration Flow

1. Open `http://localhost:3000/dashboard`.
2. Submit prompt: *"Can I go fishing near Chennai tomorrow morning?"*.
3. View **GO** recommendation, score breakdowns (Overall: 80, Safety: 70, Fishing: 89), evidence cards, and interactive Leaflet map.
4. Click **Monitor Decision** to transition state to `MONITORING`.
5. Click **Simulate Condition Change** to trigger extreme wave swell (1.2m → 2.7m).
6. Observe live UI update: Status shifts **GO → WAIT**, alert notification appears, and explanation details why waves exceeded safety limits.

---

## Google Cloud Deployment

ORCA is containerized and Google Cloud Run ready.

```bash
# Build & deploy using Google Cloud Build
gcloud builds submit --config cloudbuild.yaml .
```

---

## License

Apache 2.0 - Developed for Marine Ecosystem Intelligence & Safety.
