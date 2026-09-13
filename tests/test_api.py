# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_query_endpoint():
    res = client.post("/api/query", json={"query": "Can I go fishing near Chennai tomorrow morning?"})
    assert res.status_code == 200
    data = res.json()
    assert "decision" in data
    assert "agent_traces" in data
    assert data["decision"]["recommendation"] in ["GO", "CAUTION", "WAIT"]

def test_hackathon_demo_flow():
    # 1. Execute query
    q_res = client.post("/api/query", json={"query": "Safe fishing near Chennai?"})
    decision_id = q_res.json()["decision"]["decision_id"]

    # 2. Toggle monitoring
    m_res = client.post(f"/api/decisions/{decision_id}/monitor")
    assert m_res.status_code == 200
    assert m_res.json()["is_monitored"] is True

    # 3. Simulate condition change (wave 1.2m -> 2.7m)
    c_res = client.post(f"/api/decisions/{decision_id}/simulate-change", json={"wave_height_m": 2.7, "wind_speed_kmh": 45.0})
    assert c_res.status_code == 200
    assert c_res.json()["new_recommendation"] == "WAIT"
