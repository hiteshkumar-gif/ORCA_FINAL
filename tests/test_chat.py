# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_chat_endpoint_english():
    res = client.post("/api/chat", json={"message": "What is ORCA marine intelligence system?"})
    assert res.status_code == 200
    data = res.json()
    assert "response" in data
    assert len(data["response"]) > 0

def test_chat_endpoint_multilingual():
    res = client.post("/api/chat", json={"message": "Kya chennai me fishing safe hai?"})
    assert res.status_code == 200
    data = res.json()
    assert "response" in data
    assert len(data["response"]) > 0
