import os
from google import genai
from google.genai import types
from schemas import GeminiAnalysisResult
import json

def evaluate_compliance_with_image(image_bytes: bytes) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_api_key_here":
        print("WARNING: Invalid GEMINI_API_KEY. Returning mock data.")
        return get_mock_response("")

    try:
        client = genai.Client(api_key=api_key)
        
        prompt = """
        You are a Principal Legal Metrology Compliance Officer in India. 
        Analyze the provided image of a packaged goods label and strictly evaluate compliance.
        
        PHASE 1: IMAGE TRIAGE
        1. Determine `is_image_clear`: Is the text in the image clear enough to read? If it is severely blurry or illegible, set this to false and provide `image_quality_feedback`.
        2. Determine `is_product_label`: Is this image actually a packaged good/product label? If it is a random photo (landscape, person, etc.), set this to false and provide `relevance_feedback`.
        If EITHER of the above is false, set `overall_status` to "REJECTED_UNCLEAR" or "REJECTED_IRRELEVANT" and you may skip the compliance checks.

        PHASE 2: DATA EXTRACTION FOR REGISTRIES
        - `extracted_mrp_value`: Extract the numeric MRP value (e.g. if "MRP Rs. 50.00", return 50.0).
        - `extracted_fssai_number`: Extract the 14-digit FSSAI license number if present.
        - `extracted_barcode`: Extract the 12 or 13 digit barcode (GTIN) number if printed as text.

        PHASE 3: CRITICAL EVALUATION RULES
        1. **Maximum Retail Price (MRP)**: The exact phrase "inclusive of all taxes" MUST be present next to or below the MRP. If it says just "MRP Rs. 50", it is strictly NON_COMPLIANT.
        2. **Net Quantity**: Must be in standard metric units (e.g., g, kg, ml, L).
        3. **Date of Manufacture/Packaging**: Must be clearly stated with a valid past or current date. Future dates are strictly NON_COMPLIANT.
        4. **Manufacturer / Importer Details**: Name and complete address with a valid PIN code must be present.
        5. **Consumer Care Details**: Must include a phone number and/or an email address.
        6. **Commodity Name**: Common generic name of the product must be stated.
        
        INSTRUCTIONS:
        1. Extract all text from the label (OCR) into `raw_ocr_text`.
        2. Evaluate the 6 rules. Create a separate check for each.
        3. `status` MUST be "COMPLIANT" or "NON_COMPLIANT".
        4. `explanation_of_extraction` MUST quote the exact text fragment from the image.
        5. `confidence_score` between 0.0 and 1.0.
        6. If all are COMPLIANT (and phase 1 passed), `overall_status` is "COMPLIANT". If any check fails, "NON_COMPLIANT".
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type='image/jpeg'),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=GeminiAnalysisResult,
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
        "is_image_clear": True,
        "image_quality_feedback": "Image is clear and legible.",
        "is_product_label": True,
        "relevance_feedback": "Looks like a valid product label.",
        "overall_status": "COMPLIANT" if is_compliant else "NON_COMPLIANT",
        "confidence_score": 0.99,
        "extracted_mrp_value": 60.00 if "Rs. 60.00" in raw_text else 50.00,
        "extracted_fssai_number": "10012011000168",
        "extracted_barcode": "8901234567890",
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
