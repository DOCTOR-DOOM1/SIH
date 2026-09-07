import sys
import os
import json
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_pipeline():
    print("Sending test_label.jpg to the pipeline...")
    with open(os.path.join(os.path.dirname(__file__), '..', 'test_label.jpg'), "rb") as f:
        response = client.post(
            "/api/v1/analyze-label",
            files={"image": ("test_label.jpg", f, "image/jpeg")}
        )
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("\n--- PIPELINE RESULT ---")
        print(f"Overall Status: {data.get('overall_status')}")
        print(f"Confidence: {data.get('confidence_score')}")
        print(f"Extracted FSSAI: {data.get('extracted_fssai_number')}")
        print(f"Extracted GTIN: {data.get('extracted_barcode')}")
        print(f"Ledger Verification: {data.get('ledger_verification_message')}")
        
        print("\n--- CHECKS ---")
        for check in data.get("checks", []):
            print(f"[{check['status']}] {check['rule_name']}: {check['reasoning']}")
            if check['rule_name'] == "7A. Counterfeit Verification (Web/RAG Grounding)":
                print(f"  -> Explanation: {check['explanation_of_extraction']}")
                
        print("\nPipeline test complete.")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_pipeline()
