from backend.agents.monitoring_agent import MonitoringAgent

def test_material_change_detection():
    agent = MonitoringAgent()
    old_snap = {"wave_height_m": 1.2, "wind_speed_kmh": 18.0, "weather_code": "CLEAR"}
    new_marine = {"wave_height_m": 2.7}
    new_weather = {"wind_speed_kmh": 45.0, "weather_code": "THUNDERSTORM"}

    is_material, summary, delta = agent.detect_material_change(old_snap, new_marine, new_weather)
    assert is_material is True
    assert "Wave height changed" in summary
    assert delta["wave_height_delta_m"] == 1.5
