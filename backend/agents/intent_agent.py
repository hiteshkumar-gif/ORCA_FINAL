import re
import json
import os
from typing import Dict, Any
from backend.config import settings

class IntentAgent:
    def __init__(self):
        self.name = "Intent & Language Agent"

    def execute(
        self,
        user_query: str,
        override_location: str = None,
        override_lat: float = None,
        override_lng: float = None,
        override_language: str = None
    ) -> Dict[str, Any]:
        """
        Extract intent, location, time, and activity from user natural language prompt.
        Supports English, Hindi, Hinglish (e.g. "Kal subah Chennai se fishing ke liye jaana safe hai?").
        Uses Gemini API if key is available, else deterministic regex fallback.
        """
        parsed = None

        if settings.GEMINI_API_KEY:
            try:
                from google import genai
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                prompt = (
                    "Extract structured intent from this marine request as JSON:\n"
                    f"Query: \"{user_query}\"\n"
                    f"Context Location Hint: {override_location or 'Chennai'} ({override_lat or 13.0827}, {override_lng or 80.2707})\n\n"
                    "Return ONLY valid JSON with keys: intent (string), location (string), latitude (float), longitude (float), date (string), time (string), activity (string), language_detected (string).\n"
                    "Default coordinates for Chennai: 13.0827, 80.2707. Mumbai: 18.9220, 72.8347. Kochi: 9.9312, 76.2673. Vizag: 17.6868, 83.2185."
                )
                response = client.models.generate_content(
                    model='gemini-3.5-flash',
                    contents=prompt,
                )
                text = response.text.strip()
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0].strip()
                parsed = json.loads(text)
            except Exception as e:
                parsed = None

        if not parsed:
            # Fallback Deterministic NLP / Regex Parser
            q_lower = user_query.lower()

            # Location extraction
            location = "Chennai"
            lat, lng = 13.0827, 80.2707

            if "mumbai" in q_lower or "bombay" in q_lower:
                location = "Mumbai"
                lat, lng = 18.9220, 72.8347
            elif "kochi" in q_lower or "cochin" in q_lower:
                location = "Kochi"
                lat, lng = 9.9312, 76.2673
            elif "vizag" in q_lower or "visakhapatnam" in q_lower:
                location = "Vizag"
                lat, lng = 17.6868, 83.2185
            elif "goa" in q_lower:
                location = "Goa"
                lat, lng = 15.2993, 74.1240

            # Activity extraction
            activity = "fishing"
            if "sail" in q_lower or "boat" in q_lower or "travel" in q_lower:
                activity = "maritime_transit"

            # Language detection heuristic
            language = "English"
            if any(w in q_lower for w in ["kal", "subah", "jaana", "hai", "kya", "safe", "parson"]):
                language = "Hinglish / Hindi"

            # Time extraction
            time_slot = "morning"
            if "evening" in q_lower or "shaam" in q_lower:
                time_slot = "evening"
            elif "night" in q_lower or "raat" in q_lower:
                time_slot = "night"

            parsed = {
                "intent": "marine_trip_safety",
                "location": location,
                "latitude": lat,
                "longitude": lng,
                "date": "tomorrow",
                "time": time_slot,
                "activity": activity,
                "language_detected": language
            }

        # Apply active explicit location/lat/lng overrides if provided
        if override_lat is not None and override_lng is not None:
            parsed["latitude"] = override_lat
            parsed["longitude"] = override_lng
        if override_location:
            parsed["location"] = override_location.split(',')[0] # Main city name
        if override_language and override_language != "auto":
            parsed["language_detected"] = override_language

        return parsed

        # Fallback Deterministic NLP / Regex Parser
        q_lower = user_query.lower()

        # Location extraction
        location = "Chennai"
        lat, lng = 13.0827, 80.2707

        if "mumbai" in q_lower or "bombay" in q_lower:
            location = "Mumbai"
            lat, lng = 18.9220, 72.8347
        elif "kochi" in q_lower or "cochin" in q_lower:
            location = "Kochi"
            lat, lng = 9.9312, 76.2673
        elif "vizag" in q_lower or "visakhapatnam" in q_lower:
            location = "Vizag"
            lat, lng = 17.6868, 83.2185
        elif "goa" in q_lower:
            location = "Goa"
            lat, lng = 15.2993, 74.1240

        # Activity extraction
        activity = "fishing"
        if "sail" in q_lower or "boat" in q_lower or "travel" in q_lower:
            activity = "maritime_transit"

        # Language detection heuristic
        language = "English"
        if any(w in q_lower for w in ["kal", "subah", "jaana", "hai", "kya", "safe", "parson"]):
            language = "Hinglish / Hindi"

        # Time extraction
        time_slot = "morning"
        if "evening" in q_lower or "shaam" in q_lower:
            time_slot = "evening"
        elif "night" in q_lower or "raat" in q_lower:
            time_slot = "night"

        return {
            "intent": "marine_trip_safety",
            "location": location,
            "latitude": lat,
            "longitude": lng,
            "date": "tomorrow",
            "time": time_slot,
            "activity": activity,
            "language_detected": language
        }
