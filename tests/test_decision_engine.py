import pytest
from backend.decision_engine.engine import decision_engine

def test_wave_safety_thresholds():
    score_safe, status_safe, _ = decision_engine.evaluate_wave_safety(1.2)
    assert score_safe == 100.0
    assert status_safe == "SAFE"

    score_caut, status_caut, _ = decision_engine.evaluate_wave_safety(2.0)
    assert 50.0 <= score_caut < 100.0
    assert status_caut == "CAUTION"

    score_unsafe, status_unsafe, _ = decision_engine.evaluate_wave_safety(2.8)
    assert status_unsafe == "UNSAFE"
    assert score_unsafe < 50.0

def test_wind_safety_thresholds():
    score, status, _ = decision_engine.evaluate_wind_safety(18.0)
    assert score == 100.0
    assert status == "SAFE"

    score_gale, status_gale, _ = decision_engine.evaluate_wind_safety(45.0)
    assert status_gale == "UNSAFE"

def test_compute_decision_go():
    marine = {"wave_height_m": 1.2, "wave_period_s": 7.5}
    weather = {"wind_speed_kmh": 18.0, "visibility_km": 10.0, "precipitation_probability": 10.0, "weather_code": "CLEAR"}
    fishing = {"opportunity_score": 85.0}

    res = decision_engine.compute_decision(marine, weather, fishing, distance_km=18.5)
    assert res["recommendation"] == "GO"
    assert res["overall_score"] >= 75.0
    assert res["safety_score"] >= 70.0

def test_compute_decision_wait_on_high_waves():
    marine = {"wave_height_m": 2.8, "wave_period_s": 5.5}
    weather = {"wind_speed_kmh": 35.0, "visibility_km": 8.0, "precipitation_probability": 40.0, "weather_code": "CLEAR"}
    fishing = {"opportunity_score": 85.0}

    res = decision_engine.compute_decision(marine, weather, fishing, distance_km=18.5)
    assert res["recommendation"] == "WAIT"
