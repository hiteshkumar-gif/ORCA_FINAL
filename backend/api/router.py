import random
from datetime import datetime
from typing import List, Optional
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, Query as FastAPIQuery
from sqlalchemy.orm import Session

from backend.database.database import get_db, Base, engine
from backend.models.models import Decision, DecisionSnapshot, AgentRun, Alert, MonitoringEvent, Feedback
from backend.schemas.schemas import (
    UserQueryRequest, QueryResponse, DecisionResult,
    SimulateConditionChangeRequest, FeedbackRequest, GeoFeature,
    ChatRequest, ChatResponse
)
from backend.agents.orchestrator import orchestrator
from backend.services.monitoring_service import monitoring_service
from backend.services.chat_service import orca_chat_service
from backend.geospatial.geo_utils import get_map_layers, generate_default_routes

from backend.api.auth import auth_router

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/api")
router.include_router(auth_router)

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ORCA Marine Ecosystem Reasoning API",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@router.post("/chat", response_model=ChatResponse)
def execute_chat(payload: ChatRequest):
    """Interactive Multilingual AI Chatbot endpoint powered by Gemini API."""
    history_dicts = [{"sender": item.sender, "text": item.text} for item in payload.history] if payload.history else []
    result = orca_chat_service.chat(
        payload.message,
        history=history_dicts,
        language=payload.language,
        location=payload.location,
        latitude=payload.latitude,
        longitude=payload.longitude,
        marine_summary=payload.marine_summary
    )
    return ChatResponse(
        response=result["response"],
        language_detected=result.get("language_detected", "auto"),
        status=result.get("status", "success")
    )


@router.post("/query", response_model=QueryResponse)
def execute_query(payload: UserQueryRequest, db: Session = Depends(get_db)):
    """Primary entry point for natural language requests."""
    query = payload.query
    loc_name = payload.location or (payload.user_location.name if payload.user_location else None)
    lat = payload.latitude or (payload.user_location.latitude if payload.user_location else None)
    lng = payload.longitude or (payload.user_location.longitude if payload.user_location else None)

    pipeline_result, agent_traces = orchestrator.process_query(
        query,
        location=loc_name,
        latitude=lat,
        longitude=lng,
        language=payload.language
    )

    intent = pipeline_result["intent"]
    dec = pipeline_result["decision"]
    marine = pipeline_result["marine_data"]
    weather = pipeline_result["weather_data"]
    fishing = pipeline_result["fishing_data"]
    geo = pipeline_result["geo_data"]
    routes = pipeline_result["routes"]

    # Generate code e.g. ORCA-1042
    code_number = random.randint(1000, 9999)
    decision_code = f"ORCA-{code_number}"

    db_decision = Decision(
        decision_code=decision_code,
        original_query=query,
        location_name=intent["location"],
        latitude=intent["latitude"],
        longitude=intent["longitude"],
        activity=intent["activity"],
        target_time=intent["time"],
        recommendation=dec["recommendation"],
        overall_score=dec["overall_score"],
        safety_score=dec["safety_score"],
        fishing_score=dec["fishing_score"],
        travel_score=dec["travel_score"],
        explanation=dec["explanation"],
        evidence_json=dec["evidence"],
        risk_factors_json=dec["risk_factors"],
        alternatives_json=dec["alternatives"],
        route_details_json=routes,
        fishing_zone_json=fishing,
        status="DECIDED",
        is_monitored=False,
        is_demo=marine.get("is_live", False) == False
    )

    db.add(db_decision)
    db.commit()
    db.refresh(db_decision)

    # Save initial Snapshot
    initial_snapshot = DecisionSnapshot(
        decision_id=db_decision.id,
        recommendation=dec["recommendation"],
        overall_score=dec["overall_score"],
        wave_height_m=marine["wave_height_m"],
        wave_period_s=marine["wave_period_s"],
        wind_speed_kmh=weather["wind_speed_kmh"],
        wind_direction_deg=weather["wind_direction_deg"],
        visibility_km=weather["visibility_km"],
        precipitation_prob=weather["precipitation_probability"],
        reason_for_snapshot="INITIAL"
    )
    db.add(initial_snapshot)

    # Save Agent Run Logs
    for trace in agent_traces:
        agent_run = AgentRun(
            decision_id=db_decision.id,
            agent_name=trace["agent_name"],
            status=trace["status"],
            duration_ms=trace["duration_ms"],
            output_summary=trace["message"]
        )
        db.add(agent_run)

    db.commit()

    decision_res = DecisionResult(
        decision_id=db_decision.id,
        decision_code=db_decision.decision_code,
        original_query=db_decision.original_query,
        location_name=db_decision.location_name,
        latitude=db_decision.latitude,
        longitude=db_decision.longitude,
        activity=db_decision.activity,
        target_time=db_decision.target_time or "morning",
        recommendation=db_decision.recommendation,
        overall_score=db_decision.overall_score,
        safety_score=db_decision.safety_score,
        fishing_score=db_decision.fishing_score,
        travel_score=db_decision.travel_score,
        explanation=db_decision.explanation,
        evidence=db_decision.evidence_json,
        risk_factors=db_decision.risk_factors_json,
        alternatives=db_decision.alternatives_json,
        routes=db_decision.route_details_json or [],
        fishing_zone=db_decision.fishing_zone_json,
        geo_features=[GeoFeature(**f) for f in geo["geo_layers"]],
        status=db_decision.status,
        is_monitored=db_decision.is_monitored,
        is_demo=db_decision.is_demo,
        created_at=db_decision.created_at.isoformat(),
        last_checked_at=db_decision.last_checked_at.isoformat()
    )

    return {
        "decision": decision_res,
        "agent_traces": agent_traces
    }

@router.get("/decisions")
def list_decisions(
    status: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    query = db.query(Decision)
    if status:
        query = query.filter(Decision.status == status)
    decisions = query.order_by(Decision.created_at.desc()).limit(limit).all()

    return [
        {
            "id": d.id,
            "decision_code": d.decision_code,
            "original_query": d.original_query,
            "location_name": d.location_name,
            "recommendation": d.recommendation,
            "overall_score": d.overall_score,
            "safety_score": d.safety_score,
            "status": d.status,
            "is_monitored": d.is_monitored,
            "created_at": d.created_at.isoformat(),
            "last_checked_at": d.last_checked_at.isoformat()
        } for d in decisions
    ]

@router.get("/decisions/{decision_id}")
def get_decision_detail(decision_id: str, db: Session = Depends(get_db)):
    d = db.query(Decision).filter(Decision.id == decision_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Decision not found")

    snapshots = db.query(DecisionSnapshot).filter(DecisionSnapshot.decision_id == d.id).order_by(DecisionSnapshot.snapshot_time.asc()).all()
    events = db.query(MonitoringEvent).filter(MonitoringEvent.decision_id == d.id).order_by(MonitoringEvent.created_at.desc()).all()
    agent_runs = db.query(AgentRun).filter(AgentRun.decision_id == d.id).all()
    feedback_entries = db.query(Feedback).filter(Feedback.decision_id == d.id).all()

    geo_layers = get_map_layers(center_lat=d.latitude, center_lng=d.longitude)

    return {
        "decision": {
            "decision_id": d.id,
            "decision_code": d.decision_code,
            "original_query": d.original_query,
            "location_name": d.location_name,
            "latitude": d.latitude,
            "longitude": d.longitude,
            "activity": d.activity,
            "target_time": d.target_time,
            "recommendation": d.recommendation,
            "overall_score": d.overall_score,
            "safety_score": d.safety_score,
            "fishing_score": d.fishing_score,
            "travel_score": d.travel_score,
            "explanation": d.explanation,
            "evidence": d.evidence_json,
            "risk_factors": d.risk_factors_json,
            "alternatives": d.alternatives_json,
            "routes": d.route_details_json or [],
            "fishing_zone": d.fishing_zone_json,
            "geo_features": geo_layers,
            "status": d.status,
            "is_monitored": d.is_monitored,
            "is_demo": d.is_demo,
            "created_at": d.created_at.isoformat(),
            "last_checked_at": d.last_checked_at.isoformat()
        },
        "snapshots": [
            {
                "snapshot_time": s.snapshot_time.isoformat(),
                "recommendation": s.recommendation,
                "overall_score": s.overall_score,
                "wave_height_m": s.wave_height_m,
                "wind_speed_kmh": s.wind_speed_kmh,
                "reason": s.reason_for_snapshot
            } for s in snapshots
        ],
        "monitoring_events": [
            {
                "id": e.id,
                "created_at": e.created_at.isoformat(),
                "previous": e.previous_recommendation,
                "new": e.new_recommendation,
                "summary": e.change_summary,
                "delta": e.delta_json
            } for e in events
        ],
        "agent_runs": [
            {
                "agent_name": a.agent_name,
                "status": a.status,
                "duration_ms": a.duration_ms,
                "output_summary": a.output_summary
            } for a in agent_runs
        ],
        "feedback": [
            {
                "rating": f.user_rating,
                "outcome": f.actual_outcome,
                "notes": f.user_notes,
                "created_at": f.created_at.isoformat()
            } for f in feedback_entries
        ]
    }

@router.post("/decisions/{decision_id}/monitor")
def toggle_monitoring(decision_id: str, db: Session = Depends(get_db)):
    d = db.query(Decision).filter(Decision.id == decision_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Decision not found")

    d.is_monitored = True
    d.status = "MONITORING"
    d.last_checked_at = datetime.utcnow()
    db.commit()

    return {
        "status": "success",
        "decision_id": d.id,
        "is_monitored": True,
        "current_status": "MONITORING",
        "message": f"Living Decision {d.decision_code} is now under continuous background watch."
    }

@router.post("/decisions/{decision_id}/simulate-change")
def simulate_condition_change(
    decision_id: str,
    payload: SimulateConditionChangeRequest = None,
    db: Session = Depends(get_db)
):
    """
    Hackathon Demo Endpoint:
    Simulates severe condition change (wave height shift to 2.7m) and re-evaluates decision GO -> WAIT.
    """
    req_wave = payload.wave_height_m if payload and payload.wave_height_m is not None else 2.7
    req_wind = payload.wind_speed_kmh if payload and payload.wind_speed_kmh is not None else 45.0
    req_code = payload.weather_code if payload and payload.weather_code is not None else "THUNDERSTORM"

    updated_decision = monitoring_service.simulate_change_and_reevaluate(
        db, decision_id, wave_height_m=req_wave, wind_speed_kmh=req_wind, weather_code=req_code
    )

    if not updated_decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    return {
        "status": "success",
        "decision_id": updated_decision.id,
        "decision_code": updated_decision.decision_code,
        "previous_recommendation": "GO",
        "new_recommendation": updated_decision.recommendation,
        "new_overall_score": updated_decision.overall_score,
        "new_safety_score": updated_decision.safety_score,
        "explanation": updated_decision.explanation,
        "evidence": updated_decision.evidence_json,
        "risk_factors": updated_decision.risk_factors_json,
        "alternatives": updated_decision.alternatives_json
    }

@router.post("/decisions/{decision_id}/feedback")
def submit_feedback(decision_id: str, payload: FeedbackRequest, db: Session = Depends(get_db)):
    d = db.query(Decision).filter(Decision.id == decision_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Decision not found")

    fb = Feedback(
        decision_id=d.id,
        user_rating=payload.rating,
        actual_outcome=payload.outcome,
        user_notes=payload.notes
    )
    db.add(fb)
    db.commit()

    return {"status": "success", "message": "Feedback recorded for model improvement."}

@router.get("/monitoring")
def list_monitored_decisions(db: Session = Depends(get_db)):
    decisions = db.query(Decision).filter(Decision.is_monitored == True).order_by(Decision.last_checked_at.desc()).all()
    events = db.query(MonitoringEvent).order_by(MonitoringEvent.created_at.desc()).limit(10).all()

    return {
        "active_count": len(decisions),
        "decisions": [
            {
                "id": d.id,
                "decision_code": d.decision_code,
                "original_query": d.original_query,
                "location_name": d.location_name,
                "recommendation": d.recommendation,
                "overall_score": d.overall_score,
                "status": d.status,
                "last_checked_at": d.last_checked_at.isoformat()
            } for d in decisions
        ],
        "recent_events": [
            {
                "id": e.id,
                "decision_id": e.decision_id,
                "previous": e.previous_recommendation,
                "new": e.new_recommendation,
                "summary": e.change_summary,
                "created_at": e.created_at.isoformat()
            } for e in events
        ]
    }

@router.get("/alerts")
def list_alerts(severity: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity)
    alerts = query.order_by(Alert.created_at.desc()).limit(30).all()

    return [
        {
            "id": a.id,
            "decision_id": a.decision_id,
            "title": a.title,
            "message": a.message,
            "severity": a.severity,
            "alert_type": a.alert_type,
            "is_read": a.is_read,
            "created_at": a.created_at.isoformat()
        } for a in alerts
    ]

@router.get("/agents")
def list_agent_observatory(db: Session = Depends(get_db)):
    agent_names = [
        "Orchestrator Agent", "Intent & Language Agent", "Marine Data Agent",
        "Weather Agent", "Satellite / Earth Observation Agent", "Fishing Opportunity Agent",
        "Geospatial Agent", "Safety Agent", "Route Optimization Agent",
        "Decision Agent", "Monitoring Agent", "Feedback / Learning Agent"
    ]

    res = []
    for name in agent_names:
        total_runs = db.query(AgentRun).filter(AgentRun.agent_name == name).count()
        last_run = db.query(AgentRun).filter(AgentRun.agent_name == name).order_by(AgentRun.start_time.desc()).first()

        res.append({
            "agent_name": name,
            "status": "ACTIVE",
            "total_executions": total_runs,
            "last_duration_ms": last_run.duration_ms if last_run else 12.5,
            "last_execution": last_run.start_time.isoformat() if last_run else datetime.utcnow().isoformat(),
            "last_message": last_run.output_summary if last_run else "Ready for task execution"
        })

    return res

@router.get("/map/layers")
def get_map_layers_endpoint(lat: float = 13.0827, lng: float = 80.2707):
    return {
        "center": [lat, lng],
        "layers": get_map_layers(center_lat=lat, center_lng=lng),
        "routes": generate_default_routes(lat, lng, lat + 0.08, lng + 0.12)
    }
