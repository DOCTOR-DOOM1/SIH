import pytest
from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Legal Metrology Label Compliance Checker API is running"}

@patch("main.extract_text_and_boxes")
@patch("main.analyze_bounding_boxes")
@patch("main.evaluate_compliance")
@patch("main.firebase_admin._apps")
def test_analyze_label(mock_firebase, mock_gemini, mock_opencv, mock_vision):
    # Setup Mocks
    mock_firebase.return_value = False  # Skip Firebase upload in tests
    
    mock_vision.return_value = ("MOCK TEXT", [{"text": "MOCK TEXT", "vertices": []}])
    
    mock_opencv.return_value = [{"text": "MOCK TEXT", "area": 100}]
    
    mock_gemini.return_value = {
        "overall_status": "COMPLIANT",
        "confidence_score": 0.99,
        "checks": [
            {
                "rule_name": "Test Rule",
                "status": "PASS",
                "extracted_value": "MOCK TEXT",
                "reasoning": "Mocked Reasoning"
            }
        ],
        "raw_ocr_text": "MOCK TEXT"
    }

    # Create dummy image
    dummy_image = b"dummy image data"
    files = {"image": ("test.jpg", dummy_image, "image/jpeg")}
    
    # Execute Request
    response = client.post("/api/v1/analyze-label", files=files)
    
    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["overall_status"] == "COMPLIANT"
    assert data["confidence_score"] == 0.99
    assert len(data["checks"]) == 1
    assert data["raw_ocr_text"] == "MOCK TEXT"
