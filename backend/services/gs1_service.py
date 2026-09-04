import re

def perform_mock_gs1_lookup(raw_ocr_text: str) -> dict:
    """
    Simulates finding a barcode or GTIN in the text and doing a GS1 registry lookup.
    Because we don't have an enterprise API key, this is mocked for the hackathon demo.
    """
    # Look for a 13-digit number (EAN-13) or 12-digit (UPC) roughly in the text
    match = re.search(r'\b\d{12,13}\b', raw_ocr_text)
    
    if match:
        gtin = match.group(0)
        return {
            "gtin_found": True,
            "gtin": gtin,
            "registered_company": "Demo FMCG Pvt Ltd",
            "product_description": "Standard Packaged Good - 500g"
        }
    
    # If no barcode found in text, maybe it was a bad scan or not present
    # For the sake of the hackathon demo, if the user doesn't have an API key 
    # and the OCR text is empty, we will STILL return a mock match so they can see the UI.
    if "MRP" in raw_ocr_text.upper() or not raw_ocr_text.strip():
        return {
            "gtin_found": True,
            "gtin": "8901234567890",
            "registered_company": "Acme Corp India (Registered via GS1)",
            "product_description": "Acme Brand Packaged Food - 500g"
        }

    return {
        "gtin_found": False,
        "gtin": None,
        "registered_company": None,
        "product_description": None
    }
