import unittest

import app


class StressDetectionTests(unittest.TestCase):
    def test_detects_high_stress_from_negative_chat(self):
        score = app.estimate_stress_level(
            "I feel hopeless, can't sleep, and I keep crying all day.",
            ["I have been overwhelmed at work and feel exhausted."],
            "Anxious and overwhelmed",
        )
        self.assertGreaterEqual(score, 8)

    def test_detects_low_stress_from_positive_chat(self):
        score = app.estimate_stress_level(
            "I feel calm, confident, and happy after taking a walk today.",
            ["I am relaxed and excited for my day."],
            "Need a smile, joke, or mood boost",
        )
        self.assertLess(score, 5)


if __name__ == "__main__":
    unittest.main()
