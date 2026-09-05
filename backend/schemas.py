from pydantic import BaseModel
from typing import List, Optional

class ComplianceRuleCheck(BaseModel):
    rule_name: str
    rule_clause_citation: Optional[str] = None
    status: str
    extracted_value: Optional[str] = None
    explanation_of_extraction: Optional[str] = None
    confidence_score: float
    reasoning: str

class GS1Data(BaseModel):
    gtin_found: bool
    gtin: Optional[str] = None
    registered_company: Optional[str] = None
    product_description: Optional[str] = None
    registered_mrp: Optional[float] = None
    image_url: Optional[str] = None
    ingredients_text: Optional[str] = None
    nutrition_grades: Optional[str] = None

class FSSAIData(BaseModel):
    license_number: Optional[str] = None
    is_registered: bool
    company_name: Optional[str] = None
    status_message: str



class GeminiAnalysisResult(BaseModel):
    is_image_clear: bool
    image_quality_feedback: str
    is_product_label: bool
    relevance_feedback: str
    overall_status: str
    confidence_score: float
    extracted_mrp_value: Optional[float] = None
    extracted_fssai_number: Optional[str] = None
    extracted_barcode: Optional[str] = None
    checks: List[ComplianceRuleCheck]
    raw_ocr_text: str

class LabelComplianceReport(BaseModel):
    # Core Gemini Output
    is_image_clear: bool
    image_quality_feedback: str
    is_product_label: bool
    relevance_feedback: str
    overall_status: str
    confidence_score: float
    checks: List[ComplianceRuleCheck]
    raw_ocr_text: str
    extracted_mrp_value: Optional[float] = None
    extracted_fssai_number: Optional[str] = None
    extracted_barcode: Optional[str] = None
    
    # Enriched Mock Verification Data
    gs1_data: Optional[GS1Data] = None
    fssai_data: Optional[FSSAIData] = None
