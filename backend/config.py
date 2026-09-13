import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "ORCA"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    SECRET_KEY: str = "orca-secret-key-change-in-production-32-chars"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    DEMO_MODE: bool = True
    OPEN_METEO_BASE_URL: str = "https://marine-api.open-meteo.com/v1"
    OPEN_METEO_WEATHER_URL: str = "https://api.open-meteo.com/v1/forecast"
    GEMINI_API_KEY: str = ""

    DATABASE_URL: str = "sqlite:///./orca.db"

    MONITORING_INTERVAL_MINUTES: int = 5
    WAVE_CHANGE_THRESHOLD_M: float = 0.5
    WIND_CHANGE_THRESHOLD_KMH: float = 10.0
    SAFETY_SCORE_CHANGE_THRESHOLD: float = 10.0

    WEIGHT_SAFETY: float = 0.50
    WEIGHT_FISHING: float = 0.30
    WEIGHT_TRAVEL: float = 0.20

    # Wave Thresholds (in meters)
    WAVE_SAFE_MAX: float = 1.5
    WAVE_CAUTION_MAX: float = 2.5

    # Wind Thresholds (in km/h)
    WIND_SAFE_MAX: float = 25.0
    WIND_CAUTION_MAX: float = 40.0

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
