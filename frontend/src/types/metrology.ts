export type ValidationStatus = 'compliant' | 'missing' | 'malformed' | 'not_applicable' | 'font_size_needs_check';

export interface TextBlock {
  text: string;
  category?: string;
  confidence?: number;
  boundingBox?: {
    ymin?: number;
    xmin?: number;
    ymax?: number;
    xmax?: number;
    heightRatio?: number; // relative height on package (0.0 to 1.0)
  };
  estimatedHeightMm?: number;
  fontSizeNeedsCheck?: boolean;
}

export interface DeclarationResult {
  id: string;
  name: string;
  status: ValidationStatus;
  extractedValue: string;
  ruleReference: string;
  details: string;
  requirementText: string;
  legalCitation: string;
  confidence?: number;
  violationReason?: string;
  fontSizeNeedsCheck?: boolean;
  estimatedHeightMm?: number;
}

export interface GS1Data {
  gtin_found: boolean;
  gtin?: string;
  registered_company?: string;
  product_description?: string;
  registered_mrp?: number;
  image_url?: string;
  ingredients_text?: string;
  nutrition_grades?: string;
}

export interface FSSAIData {
  is_registered: boolean;
  license_number?: string;
  company_name?: string;
  status_message?: string;
}

export interface MRPVerification {
  is_match: boolean;
  extracted_mrp?: number;
  registered_mrp?: number;
  verification_message: string;
}

export interface ComplianceCheck {
  rule_name: string;
  status: string;
  extracted_value?: string;
  rule_clause_citation?: string;
  explanation_of_extraction?: string;
  reasoning: string;
  confidence_score?: number;
}

export interface FontSizeAdvisory {
  flag: 'manual_verification_required' | 'proportional_acceptable';
  prescribedRule: string;
  message: string;
  guidanceTable: string;
}

export interface ScanRecord {
  id: string;
  timestamp: string;
  officerName: string;
  officerBadge: string;
  station: string;
  productName: string;
  overallVerdict: 'COMPLIANT' | 'NON-COMPLIANT' | 'REJECTED_UNCLEAR' | 'REJECTED_IRRELEVANT' | 'NEEDS_MANUAL_REVIEW';
  results: DeclarationResult[];
  imageThumbnail: string;
  fullExtractedText: string;
  textBlocks: TextBlock[];
  fontSizeAdvisory: FontSizeAdvisory;
  isImported: boolean;
  notes?: string;
  gs1Data?: GS1Data;
  fssaiData?: FSSAIData;
  mrpVerification?: MRPVerification;
  isImageClear?: boolean;
  imageQualityFeedback?: string;
  isProductLabel?: boolean;
  relevanceFeedback?: string;
  extractedFssai?: string;
  extractedBarcode?: string;
}

export interface OfficerProfile {
  name: string;
  badgeId: string;
  designation: string;
  station: string;
  jurisdiction: string;
}

export interface SamplePackagePreset {
  id: string;
  title: string;
  category: string;
  tag: string;
  description: string;
  expectedVerdict: 'COMPLIANT' | 'NON-COMPLIANT';
  extractedText: string;
  imageThumbnail: string;
  isImported?: boolean;
}
