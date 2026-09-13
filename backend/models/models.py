import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, default="Captain Hitesh (Fisherman)")
    email = Column(String, unique=True, nullable=False)
    phone_number = Column(String, nullable=True, default="+91 98765 43210")
    password_hash = Column(String, nullable=True)
    sms_alerts_enabled = Column(Boolean, default=True)
    wave_alert_threshold_m = Column(Float, default=2.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    decisions = relationship("Decision", back_populates="user")

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(String, primary_key=True, default=generate_uuid)
    decision_code = Column(String, unique=True, index=True) # e.g. ORCA-1042
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    original_query = Column(Text, nullable=False)
    location_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    activity = Column(String, default="fishing")
    target_time = Column(String, nullable=True)

    recommendation = Column(String, nullable=False) # GO / CAUTION / WAIT
    overall_score = Column(Float, nullable=False)
    safety_score = Column(Float, nullable=False)
    fishing_score = Column(Float, nullable=False)
    travel_score = Column(Float, nullable=False)

    explanation = Column(Text, nullable=False)
    evidence_json = Column(JSON, nullable=False)
    risk_factors_json = Column(JSON, nullable=False)
    alternatives_json = Column(JSON, nullable=False)
    route_details_json = Column(JSON, nullable=True)
    fishing_zone_json = Column(JSON, nullable=True)

    status = Column(String, default="DECIDED") # DECIDED, MONITORING, CHANGED, COMPLETED, CANCELLED
    is_monitored = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_checked_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="decisions")
    snapshots = relationship("DecisionSnapshot", back_populates="decision", cascade="all, delete-orphan")
    monitoring_events = relationship("MonitoringEvent", back_populates="decision", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="decision", cascade="all, delete-orphan")
    agent_runs = relationship("AgentRun", back_populates="decision", cascade="all, delete-orphan")

class DecisionSnapshot(Base):
    __tablename__ = "decision_snapshots"

    id = Column(String, primary_key=True, default=generate_uuid)
    decision_id = Column(String, ForeignKey("decisions.id"), nullable=False)
    recommendation = Column(String, nullable=False)
    overall_score = Column(Float, nullable=False)

    wave_height_m = Column(Float, nullable=False)
    wave_period_s = Column(Float, nullable=True)
    wind_speed_kmh = Column(Float, nullable=False)
    wind_direction_deg = Column(Float, nullable=True)
    visibility_km = Column(Float, nullable=True)
    precipitation_prob = Column(Float, nullable=True)

    snapshot_time = Column(DateTime, default=datetime.utcnow)
    reason_for_snapshot = Column(String, default="INITIAL") # INITIAL, PERIODIC_CHECK, SIMULATED_CHANGE, ALERT_TRIGGER

    decision = relationship("Decision", back_populates="snapshots")

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String, primary_key=True, default=generate_uuid)
    decision_id = Column(String, ForeignKey("decisions.id"), nullable=True)
    agent_name = Column(String, nullable=False)
    status = Column(String, default="SUCCESS") # SUCCESS, FAILED, RUNNING
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_ms = Column(Float, nullable=True)
    input_summary = Column(Text, nullable=True)
    output_summary = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)

    decision = relationship("Decision", back_populates="agent_runs")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=generate_uuid)
    decision_id = Column(String, ForeignKey("decisions.id"), nullable=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    alert_type = Column(String, default="CONDITION_CHANGE") # CONDITION_CHANGE, WEATHER_WARNING, HAZARD_ENTERED
    is_read = Column(Boolean, default=False)
    sms_sent = Column(Boolean, default=True)
    phone_number = Column(String, nullable=True, default="+91 98765 43210")
    created_at = Column(DateTime, default=datetime.utcnow)

class MonitoringEvent(Base):
    __tablename__ = "monitoring_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    decision_id = Column(String, ForeignKey("decisions.id"), nullable=False)
    previous_recommendation = Column(String, nullable=False)
    new_recommendation = Column(String, nullable=False)
    material_change_detected = Column(Boolean, default=False)
    change_summary = Column(Text, nullable=False)
    delta_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    decision = relationship("Decision", back_populates="monitoring_events")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(String, primary_key=True, default=generate_uuid)
    decision_id = Column(String, ForeignKey("decisions.id"), nullable=False)
    user_rating = Column(Integer, nullable=False) # 1-5 stars
    actual_outcome = Column(String, nullable=False) # SUCCESSFUL_TRIP, TURNED_BACK, HAZARD_ENCOUNTERED, FISH_CAUGHT
    user_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    decision = relationship("Decision", back_populates="feedback")
