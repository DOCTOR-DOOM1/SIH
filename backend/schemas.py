from pydantic import BaseModel
from typing import List, Optional

class ComplianceRuleCheck(BaseModel):
    rule_name: str
    rule_clause_citation: Optional[str] = None
    status: str
    extracted_value: Optional[str] = None
    reasoning: str

class GS1Data(BaseModel):
    gtin_found: bool
    gtin: Optional[str] = None
    registered_company: Optional[str] = None
    product_description: Optional[str] = None

class LabelComplianceReport(BaseModel):
    overall_status: str
    confidence_score: float
    checks: List[ComplianceRuleCheck]
    raw_ocr_text: str
    gs1_data: Optional[GS1Data] = None
