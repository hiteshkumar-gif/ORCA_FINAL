import datetime
from sqlalchemy.orm import Session
from backend.database.database import SessionLocal
from backend.models.models import Decision, DecisionSnapshot, MonitoringEvent, Alert
from backend.agents.orchestrator import orchestrator
from backend.agents.monitoring_agent import MonitoringAgent

class MonitoringService:
    def __init__(self):
        self.agent = MonitoringAgent()

    def check_active_decisions(self):
        """Periodic background check for all decisions under active monitoring."""
        db: Session = SessionLocal()
        try:
            active_decisions = db.query(Decision).filter(
                Decision.is_monitored == True,
                Decision.status.in_(["MONITORING", "DECIDED", "CHANGED"])
            ).all()

            for d in active_decisions:
                # Fetch latest snapshot
                latest_snapshot = db.query(DecisionSnapshot).filter(
                    DecisionSnapshot.decision_id == d.id
                ).order_by(DecisionSnapshot.snapshot_time.desc()).first()

                if not latest_snapshot:
                    continue

                old_snap_dict = {
                    "wave_height_m": latest_snapshot.wave_height_m,
                    "wind_speed_kmh": latest_snapshot.wind_speed_kmh,
                    "weather_code": "CLEAR"
                }

                # Get fresh condition (from orchestrator / demo provider)
                pipeline_result, _ = orchestrator.process_query(d.original_query)
                new_marine = pipeline_result["marine_data"]
                new_weather = pipeline_result["weather_data"]

                is_material, summary, delta_dict = self.agent.detect_material_change(
                    old_snap_dict, new_marine, new_weather
                )

                if is_material:
                    new_dec = pipeline_result["decision"]
                    old_rec = d.recommendation
                    new_rec = new_dec["recommendation"]

                    # Update decision state
                    d.recommendation = new_rec
                    d.overall_score = new_dec["overall_score"]
                    d.safety_score = new_dec["safety_score"]
                    d.explanation = new_dec["explanation"]
                    d.evidence_json = new_dec["evidence"]
                    d.risk_factors_json = new_dec["risk_factors"]
                    d.alternatives_json = new_dec["alternatives"]
                    d.status = "CHANGED" if new_rec != old_rec else d.status
                    d.last_checked_at = datetime.datetime.utcnow()

                    # Record Monitoring Event
                    event = MonitoringEvent(
                        decision_id=d.id,
                        previous_recommendation=old_rec,
                        new_recommendation=new_rec,
                        material_change_detected=True,
                        change_summary=summary,
                        delta_json=delta_dict
                    )
                    db.add(event)

                    # Create Alert
                    severity = "CRITICAL" if new_rec == "WAIT" else ("HIGH" if new_rec == "CAUTION" else "MEDIUM")
                    alert = Alert(
                        decision_id=d.id,
                        title=f"Condition Shift Detected for {d.decision_code}",
                        message=f"Status shifted from {old_rec} → {new_rec}. Reason: {summary}",
                        severity=severity,
                        alert_type="CONDITION_CHANGE"
                    )
                    db.add(alert)

                    # Add new snapshot
                    snap = DecisionSnapshot(
                        decision_id=d.id,
                        recommendation=new_rec,
                        overall_score=new_dec["overall_score"],
                        wave_height_m=new_marine["wave_height_m"],
                        wave_period_s=new_marine["wave_period_s"],
                        wind_speed_kmh=new_weather["wind_speed_kmh"],
                        wind_direction_deg=new_weather["wind_direction_deg"],
                        visibility_km=new_weather["visibility_km"],
                        reason_for_snapshot="PERIODIC_MONITOR_CHECK"
                    )
                    db.add(snap)

                    db.commit()

        except Exception as e:
            db.rollback()
        finally:
            db.close()

    def simulate_change_and_reevaluate(
        self,
        db: Session,
        decision_id: str,
        wave_height_m: float = 2.7,
        wind_speed_kmh: float = 45.0,
        weather_code: str = "THUNDERSTORM"
    ) -> Decision:
        """Triggered for hackathon demonstration to demonstrate Living Decision Lifecycle."""
        d = db.query(Decision).filter(Decision.id == decision_id).first()
        if not d:
            return None

        old_rec = d.recommendation

        # Re-run orchestrator with simulated condition overrides
        pipeline_result, traces = orchestrator.process_query(
            query=d.original_query,
            override_wave=wave_height_m,
            override_wind=wind_speed_kmh,
            override_code=weather_code
        )

        new_marine = pipeline_result["marine_data"]
        new_weather = pipeline_result["weather_data"]
        new_dec = pipeline_result["decision"]
        new_rec = new_dec["recommendation"]

        summary = f"Simulated extreme wave increase to {wave_height_m}m & wind to {wind_speed_kmh} km/h ({weather_code})"

        # Update decision model
        d.recommendation = new_rec
        d.overall_score = new_dec["overall_score"]
        d.safety_score = new_dec["safety_score"]
        d.fishing_score = new_dec["fishing_score"]
        d.travel_score = new_dec["travel_score"]
        d.explanation = (
            f"ALERT: Condition change detected! Wave height increased from 1.2m → {wave_height_m}m. "
            f"Your previous recommendation ({old_rec}) is no longer suitable because wave conditions have crossed the configured safety threshold."
        )
        d.evidence_json = new_dec["evidence"]
        d.risk_factors_json = new_dec["risk_factors"]
        d.alternatives_json = new_dec["alternatives"]
        d.status = "CHANGED"
        d.last_checked_at = datetime.datetime.utcnow()

        # Add Event
        event = MonitoringEvent(
            decision_id=d.id,
            previous_recommendation=old_rec,
            new_recommendation=new_rec,
            material_change_detected=True,
            change_summary=summary,
            delta_json={
                "wave_height_delta_m": wave_height_m - 1.2,
                "wind_speed_delta_kmh": wind_speed_kmh - 18.0,
                "weather_code": weather_code
            }
        )
        db.add(event)

        # Add Alert
        alert = Alert(
            decision_id=d.id,
            title=f"⚠ Living Decision Alert - {d.decision_code}",
            message=f"Wave height increased from 1.2m → {wave_height_m}m. Recommendation shifted from {old_rec} → {new_rec}.",
            severity="CRITICAL",
            alert_type="CONDITION_CHANGE",
            sms_sent=True,
            phone_number="+91 98765 43210"
        )
        db.add(alert)

        # Dispatch Automatic SMS Alert
        try:
            from backend.services.sms_service import sms_service
            sms_service.dispatch_alert_sms(
                phone_number="+91 98765 43210",
                decision_code=d.decision_code,
                old_rec=old_rec,
                new_rec=new_rec,
                reason=summary
            )
        except Exception as e:
            pass

        # Add Snapshot
        snap = DecisionSnapshot(
            decision_id=d.id,
            recommendation=new_rec,
            overall_score=new_dec["overall_score"],
            wave_height_m=wave_height_m,
            wave_period_s=5.8,
            wind_speed_kmh=wind_speed_kmh,
            wind_direction_deg=225.0,
            visibility_km=4.5,
            reason_for_snapshot="SIMULATED_CHANGE"
        )
        db.add(snap)

        db.commit()
        db.refresh(d)
        return d

monitoring_service = MonitoringService()
