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
  confidence: number;
  violationReason?: string;
  fontSizeNeedsCheck?: boolean;
  estimatedHeightMm?: number;
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
  overallVerdict: 'COMPLIANT' | 'NON-COMPLIANT';
  results: DeclarationResult[];
  imageThumbnail: string;
  fullExtractedText: string;
  textBlocks: TextBlock[];
  fontSizeAdvisory: FontSizeAdvisory;
  isImported: boolean;
  notes?: string;
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
