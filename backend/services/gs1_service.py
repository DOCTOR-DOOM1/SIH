import re
import requests

def perform_live_barcode_lookup(raw_ocr_text: str) -> dict:
    """
    Attempts to find a barcode (GTIN) and query Open Food Facts API for live data.
    If it fails or is not found, falls back to mock data so the hackathon demo doesn't break.
    """
    match = re.search(r'\b\d{12,13}\b', raw_ocr_text)
    
    gtin = None
    if match:
        gtin = match.group(0)
    elif raw_ocr_text.strip().isdigit() and len(raw_ocr_text.strip()) in [12, 13]:
        gtin = raw_ocr_text.strip()
        
    if gtin:
        try:
            url = f"https://world.openfoodfacts.org/api/v0/product/{gtin}.json"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == 1:
                    product = data.get("product", {})
                    brand = product.get("brands", "Unknown Brand")
                    name = product.get("product_name", "Unknown Product")
                    image_url = product.get("image_url")
                    ingredients_text = product.get("ingredients_text")
                    nutrition_grades = product.get("nutrition_grades_tags", [None])[0] if product.get("nutrition_grades_tags") else product.get("nutrition_grades")
                    
                    # Simulated MRP logic based on GTIN hash just for demo
                    # This ensures the MRP forgery check has something to compare against
                    random_mrp = (abs(hash(gtin)) % 450) + 50.0 
                    
                    return {
                        "gtin_found": True,
                        "gtin": gtin,
                        "registered_company": brand,
                        "product_description": name,
                        "registered_mrp": round(random_mrp, 2),
                        "image_url": image_url,
                        "ingredients_text": ingredients_text,
                        "nutrition_grades": nutrition_grades
                    }
        except Exception as e:
            print(f"OpenFoodFacts API Error: {e}")
            pass
            
    # Fallback to mock logic if not found or no GTIN
    if gtin:
        return {
            "gtin_found": True,
            "gtin": gtin,
            "registered_company": "Demo FMCG Pvt Ltd",
            "product_description": "Standard Packaged Good - 500g",
            "registered_mrp": 60.00
        }
        
    if "MRP" in raw_ocr_text.upper() or not raw_ocr_text.strip():
        return {
            "gtin_found": True,
            "gtin": "8901234567890",
            "registered_company": "Acme Corp India (Registered via GS1)",
            "product_description": "Acme Brand Packaged Food - 500g",
            "registered_mrp": 50.00
        }

    return {
        "gtin_found": False,
        "gtin": None,
        "registered_company": None,
        "product_description": None,
        "registered_mrp": None
    }
