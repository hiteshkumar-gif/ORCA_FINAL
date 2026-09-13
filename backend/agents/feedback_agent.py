from typing import Dict, Any

class FeedbackAgent:
    def __init__(self):
        self.name = "Feedback / Learning Agent"

    def process_feedback(self, decision_id: str, rating: int, actual_outcome: str, user_notes: str = None) -> Dict[str, Any]:
        """Collect mission outcome and user feedback for continuous evaluation."""
        return {
            "decision_id": decision_id,
            "rating": rating,
            "actual_outcome": actual_outcome,
            "notes": user_notes,
            "learning_score_impact": "Log saved for model evaluation. Safety thresholds remain deterministically enforced."
        }
