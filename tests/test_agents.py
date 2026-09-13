from backend.agents.orchestrator import orchestrator

def test_agent_orchestration():
    query = "Can I go fishing near Chennai tomorrow morning?"
    result, traces = orchestrator.process_query(query)

    assert "decision" in result
    assert "marine_data" in result
    assert "weather_data" in result
    assert len(traces) >= 7
    assert result["decision"]["recommendation"] in ["GO", "CAUTION", "WAIT"]
