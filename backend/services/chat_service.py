import os
import json
from typing import List, Dict, Any, Optional
from backend.config import settings
from backend.providers.open_meteo import OpenMeteoMarineProvider, OpenMeteoWeatherProvider

class OrcaChatService:
    def __init__(self):
        self.system_instruction = (
            "You are ORCA — Marine Ecosystem Reasoning AI Specialist & Ocean Intelligence Assistant. "
            "You provide clear, accurate, helpful, and expert guidance on marine safety, oceanography, "
            "weather conditions, wave heights, potential fishing zones (PFZ), maritime vessel navigation routes, "
            "coastal ecology, and disaster management. "
            "CRITICAL INSTRUCTIONS:\n"
            "1. You MUST ALWAYS respond in the EXACT SAME LANGUAGE as the user's question (e.g., English, Hindi, Hinglish, Tamil, Telugu, Bengali, Spanish, French, Arabic, etc.).\n"
            "2. If asked about safety or recommendations, prioritize human life and vessel safety at sea.\n"
            "3. Be concise, professional, friendly, and authoritative in marine science and navigation.\n"
            "4. Use bullet points and markdown formatting for readability."
        )

    def chat(
        self,
        user_message: str,
        history: Optional[List[Dict[str, str]]] = None,
        language: Optional[str] = None,
        location: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        marine_summary: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Processes chat message using Gemini API (gemini-3.5-flash).
        Supports conversation context, active location context, live marine telemetry, and any human language.
        """
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return {
                "response": "Gemini API key is not configured in .env. Please set GEMINI_API_KEY to start chatting with ORCA AI.",
                "language_detected": "English",
                "status": "error"
            }

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)

            # Fetch Live Telemetry from Open-Meteo & Database if coordinates available
            live_telemetry_context = {}
            if latitude is not None and longitude is not None:
                try:
                    marine_prov = OpenMeteoMarineProvider()
                    weather_prov = OpenMeteoWeatherProvider()
                    m_data = marine_prov.get_marine_conditions(latitude, longitude)
                    w_data = weather_prov.get_weather_conditions(latitude, longitude)
                    if m_data:
                        live_telemetry_context.update({
                            "wave_height_m": m_data.get("wave_height_m"),
                            "wave_period_s": m_data.get("wave_period_s"),
                            "current_speed_knots": m_data.get("current_speed_knots"),
                            "marine_source": m_data.get("source")
                        })
                    if w_data:
                        live_telemetry_context.update({
                            "wind_speed_kmh": w_data.get("wind_speed_kmh"),
                            "wind_direction_deg": w_data.get("wind_direction_deg"),
                            "temperature_c": w_data.get("temperature_c"),
                            "visibility_km": w_data.get("visibility_km"),
                            "weather_source": w_data.get("source")
                        })
                except Exception as e:
                    pass

            # Query active alerts & background monitoring events from database
            active_alerts = []
            recent_events = []
            try:
                from backend.database.database import SessionLocal
                from backend.models.models import Alert, MonitoringEvent
                db = SessionLocal()
                try:
                    alerts_db = db.query(Alert).order_by(Alert.created_at.desc()).limit(3).all()
                    active_alerts = [{"title": a.title, "severity": a.severity, "message": a.message} for a in alerts_db]
                    events_db = db.query(MonitoringEvent).filter(MonitoringEvent.material_change_detected == True).order_by(MonitoringEvent.created_at.desc()).limit(3).all()
                    recent_events = [{"previous": e.previous_recommendation, "new": e.new_recommendation, "summary": e.change_summary} for e in events_db]
                finally:
                    db.close()
            except Exception as e:
                pass

            # Build Context Header for Location, Language, Live Telemetry & Database Alerts
            context_header = "\n--- Live System Datasets & Telemetry Context ---"
            if location:
                context_header += f"\nSelected Sector: {location}"
            if latitude is not None and longitude is not None:
                context_header += f" (Coordinates: Lat {latitude:.4f}, Long {longitude:.4f})"
            if live_telemetry_context:
                context_header += f"\nLive Provider Feed (Open-Meteo Real-Time): {json.dumps(live_telemetry_context)}"
            if marine_summary:
                context_header += f"\nUser Interactive Session Telemetry: {json.dumps(marine_summary)}"
            if active_alerts:
                context_header += f"\nActive System Alerts: {json.dumps(active_alerts)}"
            if recent_events:
                context_header += f"\nRecent Living Decision Events: {json.dumps(recent_events)}"

            if language and language != "auto":
                lang_names = {"en": "English", "hi": "Hindi", "pa": "Punjabi", "ta": "Tamil", "te": "Telugu", "bn": "Bengali", "mr": "Marathi"}
                target_lang = lang_names.get(language, language)
                context_header += f"\nRequested Response Language: {target_lang} (You MUST write your entire response in {target_lang})."
            else:
                context_header += "\nRequested Response Language: Auto Detect (Detect user language automatically and reply in that language)."

            # Build full prompt with conversation history context
            prompt_parts = [self.system_instruction, context_header, "\n--- Conversation History ---"]
            if history:
                for item in history[-6:]: # Keep last 6 messages for context
                    role = "User" if item.get("sender") == "user" else "ORCA AI"
                    prompt_parts.append(f"{role}: {item.get('text', '')}")
            
            prompt_parts.append(f"User: {user_message}\nORCA AI:")

            full_prompt = "\n".join(prompt_parts)

            response = None
            last_err = None
            for model_name in ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.6-flash']:
                for attempt in range(2):
                    try:
                        response = client.models.generate_content(
                            model=model_name,
                            contents=full_prompt,
                        )
                        if response and response.text:
                            break
                    except Exception as err:
                        last_err = err
                        import time
                        time.sleep(0.5)
                if response and response.text:
                    break

            if not response or not response.text:
                raise last_err or Exception("No response from Gemini API")

            reply_text = response.text.strip()

            return {
                "response": reply_text,
                "language_detected": "auto",
                "status": "success"
            }
        except Exception as e:
            return {
                "response": f"ORCA AI Chat System encountered an error: {str(e)}",
                "language_detected": "Unknown",
                "status": "error"
            }

orca_chat_service = OrcaChatService()
