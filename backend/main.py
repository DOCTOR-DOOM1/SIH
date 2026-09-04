from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from schemas import LabelComplianceReport, ComplianceRuleCheck
from firebase_app import get_firestore_client, get_storage_bucket
from services.vision_service import extract_text_and_boxes
from services.opencv_service import analyze_bounding_boxes
from services.gemini_service import evaluate_compliance_with_image
from services.gs1_service import perform_live_barcode_lookup
import uuid
import time
import firebase_admin

app = FastAPI(title="Legal Metrology Label Compliance Checker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Legal Metrology Label Compliance Checker API is running"}

@app.post("/api/v1/analyze-label", response_model=LabelComplianceReport)
async def analyze_label(
    image: UploadFile = File(...),
    barcode: str = Form(None)
):
    # 1. Read image bytes
    image_bytes = await image.read()
    
    # 2. Upload to Firebase Storage
    image_url = None
    if firebase_admin._apps:
        try:
            bucket = get_storage_bucket()
            blob_name = f"labels/{uuid.uuid4()}_{image.filename}"
            blob = bucket.blob(blob_name)
            blob.upload_from_string(image_bytes, content_type=image.content_type)
            blob.make_public()
            image_url = blob.public_url
        except Exception as e:
            print(f"Firebase Upload Error: {e}")

from services.fssai_service import perform_mock_fssai_lookup
    
    # 3. Gemini Multimodal Analysis (OCR + Triage + Compliance)
    gemini_result = evaluate_compliance_with_image(image_bytes)
    report_dict = gemini_result.copy()

    # If the image is rejected, skip the lookups
    if report_dict.get("overall_status") in ["REJECTED_UNCLEAR", "REJECTED_IRRELEVANT"]:
        report_dict["gs1_data"] = None
        report_dict["fssai_data"] = None
        report_dict["mrp_verification"] = None
    else:
        # 4. GS1 Live/Mock Lookup
        barcode_query = barcode or report_dict.get("extracted_barcode") or report_dict.get("raw_ocr_text", "")
        gs1_data = perform_live_barcode_lookup(barcode_query)
        report_dict["gs1_data"] = gs1_data

        # 5. FSSAI Mock Lookup
        fssai_number = report_dict.get("extracted_fssai_number", "")
        fssai_data = perform_mock_fssai_lookup(fssai_number)
        report_dict["fssai_data"] = fssai_data.model_dump()

        # 6. MRP Forgery Check
        gemini_mrp = report_dict.get("extracted_mrp_value")
        registered_mrp = gs1_data.get("registered_mrp")
        
        mrp_verification = {
            "extracted_mrp": gemini_mrp,
            "registered_mrp": registered_mrp,
            "is_match": False,
            "verification_message": "Verification failed."
        }
        
        if gemini_mrp is not None and registered_mrp is not None:
            if abs(gemini_mrp - registered_mrp) < 0.01:
                mrp_verification["is_match"] = True
                mrp_verification["verification_message"] = "Extracted MRP matches registered price."
            else:
                mrp_verification["verification_message"] = f"Forgery Alert: Printed MRP (Rs. {gemini_mrp}) does not match registered MRP (Rs. {registered_mrp})."
        elif gemini_mrp is None:
            mrp_verification["verification_message"] = "Could not extract MRP from image."
        elif registered_mrp is None:
            mrp_verification["verification_message"] = "Product has no registered MRP in database."
            
        report_dict["mrp_verification"] = mrp_verification

    # 7. Human Review Override
    if report_dict.get("confidence_score", 1.0) < 0.75 and report_dict.get("overall_status") not in ["REJECTED_UNCLEAR", "REJECTED_IRRELEVANT"]:
        report_dict["overall_status"] = "NEEDS_MANUAL_REVIEW"
    
    if "raw_ocr_text" not in report_dict or not report_dict["raw_ocr_text"]:
        report_dict["raw_ocr_text"] = "OCR Extraction failed."

    # 8. Log to Firestore
    if firebase_admin._apps:
        try:
            db = get_firestore_client()
            doc_ref = db.collection("compliance_logs").document()
            log_data = report_dict.copy()
            log_data["timestamp"] = time.time()
            log_data["image_url"] = image_url
            doc_ref.set(log_data)
        except Exception as e:
            print(f"Firestore Log Error: {e}")

    # Return structured Pydantic model
    return LabelComplianceReport(**report_dict)

@app.get("/api/v1/history")
async def get_history():
    if not firebase_admin._apps:
        # Return mock history if Firebase isn't configured
        return [
            {"id": 1, "product_name": "Britannia Good Day", "timestamp": time.time() - 3600, "overall_status": "COMPLIANT"},
            {"id": 2, "product_name": "Local Honey Jar", "timestamp": time.time() - 86400, "overall_status": "NEEDS_MANUAL_REVIEW"},
            {"id": 3, "product_name": "Imported Candy Pack", "timestamp": time.time() - 150000, "overall_status": "NON_COMPLIANT"}
        ]
    
    try:
        db = get_firestore_client()
        docs = db.collection("compliance_logs").order_by("timestamp", direction="DESCENDING").limit(10).stream()
        
        history = []
        for doc in docs:
            data = doc.to_dict()
            # We don't need the massive raw_ocr_text for the sidebar list
            history.append({
                "id": doc.id,
                "timestamp": data.get("timestamp"),
                "overall_status": data.get("overall_status"),
                "confidence_score": data.get("confidence_score")
            })
        return history
    except Exception as e:
        print(f"History Fetch Error: {e}")
        return []
