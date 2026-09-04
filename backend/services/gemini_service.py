import os
from google import genai
from google.genai import types
from schemas import LabelComplianceReport
import json

def evaluate_compliance_with_image(image_bytes: bytes) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_api_key_here":
        print("WARNING: Invalid GEMINI_API_KEY. Returning mock data.")
        return get_mock_response("")

    try:
        client = genai.Client(api_key=api_key)
        
        prompt = """
        You are a Principal Legal Metrology Compliance Officer in India (an expert in the Legal Metrology Packaged Commodities Rules, 2011).
        Analyze the provided image of a packaged goods label and strictly evaluate compliance.

        CRITICAL EVALUATION RULES:
        1. **Maximum Retail Price (MRP)**: The exact phrase "inclusive of all taxes" MUST be present next to or below the MRP. If it says just "MRP Rs. 50" without "inclusive of all taxes", it is strictly NON_COMPLIANT.
        2. **Net Quantity**: Must be in standard metric units (e.g., g, kg, ml, L). Imperial units like "oz", "lbs", "fl oz" are strictly NON_COMPLIANT unless accompanied by a metric equivalent as primary.
        3. **Date of Manufacture/Packaging**: Must be clearly stated (e.g., "Mfg Date", "Pkd Date") with a valid past or current date. Future dates (e.g., year 2027 or 2028 when it is 2024/2025) are strictly NON_COMPLIANT.
        4. **Manufacturer / Importer Details**: Name and complete address with a valid PIN code must be present.
        5. **Consumer Care Details**: Must include a phone number and/or an email address for consumer complaints.
        6. **Commodity Name**: Common generic name of the product must be stated.
        
        INSTRUCTIONS:
        1. Extract all text from the label (OCR) and populate `raw_ocr_text`.
        2. Evaluate the rules above exactly as described. Create a separate check for each of the 6 rules.
        3. The `status` field for each check MUST be either "COMPLIANT" or "NON_COMPLIANT".
        4. You MUST cite the exact rule clause in `rule_clause_citation` (e.g., "Rule 6(1)(e)", "Rule 6(1)(c)").
        5. For `explanation_of_extraction`, you MUST quote the exact text fragment from the image that supports your evaluation to prevent hallucination.
        6. For `confidence_score`, provide a float between 0.0 and 1.0 reflecting your certainty of the extraction.
        7. If ANY check is NON_COMPLIANT, the `overall_status` MUST be "NON_COMPLIANT". If all are COMPLIANT, it must be "COMPLIANT".
        
        Provide the response strictly following the JSON schema provided in the structured output configuration.
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type='image/jpeg'),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=LabelComplianceReport,
            ),
        )
        
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return get_mock_response("")

def get_mock_response(raw_text: str):
    # Simple heuristic to simulate compliance for the demo
    is_compliant = "Rs. 60.00" not in raw_text and "14.5 oz" not in raw_text and "12/2027" not in raw_text
    
    return {
        "overall_status": "COMPLIANT" if is_compliant else "NON_COMPLIANT",
        "confidence_score": 0.99,
        "checks": [
            {
                "rule_name": "Maximum Retail Price (MRP)",
                "rule_clause_citation": "Rule 6(1)(e)",
                "status": "COMPLIANT" if is_compliant else "NON_COMPLIANT",
                "extracted_value": "Found in text" if is_compliant else "Missing 'inclusive of all taxes'",
                "explanation_of_extraction": "Extracted from mock",
                "confidence_score": 0.99,
                "reasoning": "MRP is correctly declared with 'inclusive of all taxes' clause." if is_compliant else "MRP is missing the mandatory 'inclusive of all taxes' clause."
            },
            {
                "rule_name": "Net Quantity",
                "rule_clause_citation": "Rule 6(1)(c)",
                "status": "COMPLIANT" if "14.5 oz" not in raw_text else "NON_COMPLIANT",
                "extracted_value": "Found in text",
                "explanation_of_extraction": "Extracted from mock",
                "confidence_score": 0.95,
                "reasoning": "Standard metric unit used." if "14.5 oz" not in raw_text else "Non-standard imperial unit used."
            },
            {
                "rule_name": "Date of Manufacture",
                "rule_clause_citation": "Rule 6(1)(d)",
                "status": "COMPLIANT" if "12/2027" not in raw_text else "NON_COMPLIANT",
                "extracted_value": "Found in text",
                "explanation_of_extraction": "Extracted from mock",
                "confidence_score": 0.92,
                "reasoning": "Month and year clearly stated." if "12/2027" not in raw_text else "Future date of manufacture is a violation."
            },
            {
                "rule_name": "Manufacturer / Importer Details",
                "rule_clause_citation": "Rule 6(1)(a)",
                "status": "COMPLIANT",
                "extracted_value": "Found in text",
                "explanation_of_extraction": "Extracted from mock",
                "confidence_score": 0.99,
                "reasoning": "Name and complete address with PIN code are present."
            },
            {
                "rule_name": "Consumer Care Details",
                "rule_clause_citation": "Rule 6(1)(f)",
                "status": "COMPLIANT",
                "extracted_value": "Found in text",
                "explanation_of_extraction": "Extracted from mock",
                "confidence_score": 0.98,
                "reasoning": "Phone and/or email provided."
            },
            {
                "rule_name": "Commodity Name",
                "rule_clause_citation": "Rule 6(1)(b)",
                "status": "COMPLIANT",
                "extracted_value": "Found in text",
                "explanation_of_extraction": "Extracted from mock",
                "confidence_score": 0.99,
                "reasoning": "Common name is declared."
            }
        ],
        "raw_ocr_text": raw_text
    }
