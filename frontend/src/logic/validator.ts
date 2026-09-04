import { DeclarationResult, FontSizeAdvisory, TextBlock, ValidationStatus } from '../types/metrology';

export interface ValidationOutput {
  results: DeclarationResult[];
  overallVerdict: 'COMPLIANT' | 'NON-COMPLIANT';
  complianceRate: number;
  fontSizeAdvisory: FontSizeAdvisory;
  isImportedDetected: boolean;
}

// Standard units prescribed under Rule 11 & Schedule III of Legal Metrology (Packaged Commodities) Rules, 2011
export const STANDARD_UNITS = [
  'g', 'gm', 'gram', 'grams',
  'kg', 'kilogram', 'kilograms',
  'ml', 'millilitre', 'milliliter', 'millilitres',
  'l', 'lt', 'ltr', 'litre', 'liter', 'litres',
  'm', 'meter', 'metre', 'meters', 'metres',
  'cm', 'centimeter', 'centimetre',
  'mm', 'millimeter',
  'sq.m', 'sq.cm', 'cu.m', 'cu.cm',
  'units', 'unit', 'u', 'pcs', 'piece', 'pieces', 'n', 'no', 'nos', 'number', 'count'
];

export const NON_STANDARD_UNITS = [
  'oz', 'ounce', 'ounces', 'lb', 'lbs', 'pound', 'pounds', 'gallon', 'fluid oz', 'fl oz', 'quart', 'pt', 'pint', 'grain'
];

/**
 * Validates the 6 mandatory declarations as per India's Legal Metrology (Packaged Commodities) Rules, 2011.
 * 
 * @param extractedText Full OCR text extracted from package
 * @param rawBlocks Optional array of text lines / blocks
 * @param hints Optional hints from Gemini vision (e.g. isImported, smallFontFlag)
 */
export function validateDeclarations(
  extractedText: string,
  rawBlocks: TextBlock[] = [],
  hints?: { isImported?: boolean; smallFontRisk?: boolean; fontNotes?: string }
): ValidationOutput {
  const normalized = (extractedText || '').replace(/\r?\n/g, ' ').trim();
  const lower = normalized.toLowerCase();

  // 1. Manufacturer / Packer / Importer Details (Rule 6(1)(a))
  // Must include a name and postal address (heuristic: contains a 6-digit Indian PIN code)
  const pinRegex = /\b([1-9][0-9]{5})\b/;
  const mfgNamePatterns = /(?:mfg(?:\s+by|\.|\s*:)|manufactured\s+by|packed\s+by|mkt\s+by|marketed\s+by|imported\s+by|pkg\s+by|mfd\s+by|unit\s+of|factory|processor)/i;
  
  let mfgStatus: ValidationStatus = 'missing';
  let mfgValue = 'MISSING (No manufacturer or address found)';
  let mfgDetails = 'Requires manufacturer/packer name and complete postal address including 6-digit PIN code.';
  let mfgReason: string | undefined;

  const pinMatch = normalized.match(pinRegex);
  const hasMfgPrefix = mfgNamePatterns.test(normalized);

  // Search in blocks or text snippet
  const mfgSnippetMatch = normalized.match(/(?:(?:mfg|manufactured|packed|marketed|mfd|pkg)\s*by[:\s]*)([^.]+?)(?:\.|\n|Net|MRP|Customer|$)/i) 
    || normalized.match(/(?:(?:address|factory|plant|unit)[:\s]*)([^.]+?)(?:\.|\n|Net|MRP|Customer|$)/i);

  if (mfgSnippetMatch && mfgSnippetMatch[0]) {
    mfgValue = mfgSnippetMatch[0].trim().slice(0, 100);
  } else if (pinMatch) {
    mfgValue = `Address with PIN ${pinMatch[1]} detected`;
  }

  if (pinMatch && (hasMfgPrefix || mfgSnippetMatch)) {
    mfgStatus = 'compliant';
    mfgDetails = `Valid manufacturer identity and postal address detected with PIN code ${pinMatch[1]}.`;
  } else if (hasMfgPrefix && !pinMatch) {
    mfgStatus = 'malformed';
    mfgDetails = 'Manufacturer name/prefix detected, but postal address lacks a valid 6-digit Indian PIN code.';
    mfgReason = 'Missing 6-digit Postal PIN Code';
  } else if (pinMatch && !hasMfgPrefix) {
    mfgStatus = 'malformed';
    mfgDetails = '6-digit PIN code found, but manufacturer or packer entity name is ambiguous or missing.';
    mfgReason = 'Ambiguous manufacturer entity name';
  } else {
    mfgStatus = 'missing';
    mfgReason = 'Neither manufacturer name nor postal address with PIN found';
  }

  // 2. Net Quantity (Rule 11 & 12, Schedule III)
  // Must contain a number + unit (standard list: g, kg, ml, l, pcs/units). Flag non-standard units (oz, lbs).
  let netQtyStatus: ValidationStatus = 'missing';
  let netQtyValue = 'MISSING';
  let netQtyDetails = 'Net quantity must be declared using standard SI units (g, kg, ml, l, m, cm) or piece count (N, units, pcs).';
  let netQtyReason: string | undefined;

  const netQtyRegex = /(?:net\s*(?:wt|weight|qty|quantity|volume|content|contents)?[:\s]*)?(\d+(?:\.\d+)?)\s*([a-zA-Z°]+(?:\s*[a-zA-Z]+)?)/i;
  // Specific pattern scanning for number followed immediately by standard or non-standard unit
  const explicitQtyMatch = normalized.match(/(?:net\s*(?:weight|wt|qty|quantity|vol|volume)?[:\s]*)?(\d+(?:\.\d+)?)\s*(kg|g|gm|grams|ml|ltr|litre|litres|liter|liters|meter|m|cm|oz|ounces|lbs|lb|units?|pcs|pieces?|nos?|n)\b/i);

  if (explicitQtyMatch) {
    const rawNum = explicitQtyMatch[1];
    const rawUnit = explicitQtyMatch[2].toLowerCase().replace(/\./g, '');
    netQtyValue = `${rawNum} ${explicitQtyMatch[2]}`;

    if (NON_STANDARD_UNITS.includes(rawUnit)) {
      netQtyStatus = 'malformed';
      netQtyDetails = `Non-standard imperial unit '${explicitQtyMatch[2]}' used. Rule 11 mandates metric units (g, kg, ml, l) or count.`;
      netQtyReason = `Non-standard unit used (${explicitQtyMatch[2]})`;
    } else if (STANDARD_UNITS.includes(rawUnit)) {
      netQtyStatus = 'compliant';
      netQtyDetails = `Valid net quantity declared in standard metric unit: ${rawNum} ${rawUnit}.`;
    } else {
      netQtyStatus = 'malformed';
      netQtyDetails = `Detected unit '${rawUnit}' is not in the list of standard statutory units.`;
      netQtyReason = 'Unrecognized unit of measurement';
    }
  } else {
    netQtyStatus = 'missing';
    netQtyReason = 'No clear numerical quantity with unit found';
  }

  // 3. Maximum Retail Price (MRP) (Rule 6(1)(e))
  // Must contain "MRP" or "Maximum Retail Price" AND ₹/Rs. amount AND the phrase "inclusive of all taxes"
  let mrpStatus: ValidationStatus = 'missing';
  let mrpValue = 'MISSING';
  let mrpDetails = 'MRP must declare currency amount (₹ or Rs.) with mandatory phrase "inclusive of all taxes" (or "incl. of all taxes").';
  let mrpReason: string | undefined;

  const mrpKeywordsRegex = /(?:m\.?r\.?p\.?|max(?:imum)?\s*retail\s*price|retail\s*price)/i;
  const currencyAmountRegex = /(?:₹|rs\.?|inr)\s*(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(?:₹|rs\.?|inr)/i;
  const taxInclusiveRegex = /(?:incl(?:usive)?\.?\s*(?:of)?\s*all\s*taxes|incl\.?\s*taxes|inclusive\s*taxes|all\s*taxes\s*incl(?:usive)?)/i;

  const hasMrpKeyword = mrpKeywordsRegex.test(normalized);
  const amountMatch = normalized.match(currencyAmountRegex);
  const hasTaxPhrase = taxInclusiveRegex.test(normalized);

  // Extract snippet
  const mrpSnippet = normalized.match(/(?:m\.?r\.?p\.?|max(?:imum)?\s*retail\s*price)[^.,\n]{1,60}/i);
  if (mrpSnippet) {
    mrpValue = mrpSnippet[0].trim();
  } else if (amountMatch) {
    mrpValue = amountMatch[0].trim();
  }

  if (hasMrpKeyword && amountMatch && hasTaxPhrase) {
    mrpStatus = 'compliant';
    mrpDetails = `Compliant MRP declaration with price amount and mandatory "inclusive of all taxes" declaration.`;
  } else if (hasMrpKeyword && amountMatch && !hasTaxPhrase) {
    mrpStatus = 'malformed';
    mrpDetails = `MRP amount is present (${mrpValue}), but mandatory statutory clause "inclusive of all taxes" is MISSING.`;
    mrpReason = 'Missing mandatory phrase "inclusive of all taxes"';
  } else if (!hasMrpKeyword && amountMatch && hasTaxPhrase) {
    mrpStatus = 'malformed';
    mrpDetails = `Tax phrase and amount found, but explicit "MRP" / "Maximum Retail Price" label is absent.`;
    mrpReason = 'Missing standard "MRP" prefix';
  } else {
    mrpStatus = 'missing';
    mrpReason = 'No Maximum Retail Price (MRP) declaration detected';
  }

  // 4. Month & Year of Manufacture / Packing / Import (Rule 6(1)(d))
  // Must be valid month+year, not older than sane range (e.g. > 5 years ago), not a future date beyond current year/month
  let mfgDateStatus: ValidationStatus = 'missing';
  let mfgDateValue = 'MISSING';
  let mfgDateDetails = 'Must declare month and year of manufacture or packaging (e.g. MM/YYYY or MMM YYYY).';
  let mfgDateReason: string | undefined;

  const datePattern = /(?:(?:mfg|packed|pkd|mfd|imported|pkg|date|dom)[:\s.]*)?((?:0[1-9]|1[0-2]|[A-Za-z]{3,9})[\s/.-]+(?:20[1-9][0-9]|[1-9][0-9]))\b/i;
  const dateMatch = normalized.match(datePattern);

  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const currentYear = 2026; // based on environment timestamp
  const currentMonth = 9;

  if (dateMatch) {
    const rawDateStr = dateMatch[1].trim();
    mfgDateValue = rawDateStr;
    
    // Parse month & year
    const parts = rawDateStr.split(/[\s/.-]+/);
    if (parts.length >= 2) {
      let month = 0;
      let year = 0;

      // Handle month as number or name
      const p0 = parts[0].toLowerCase();
      const monthIdx = monthNames.findIndex(m => p0.startsWith(m));
      if (monthIdx !== -1) {
        month = monthIdx + 1;
      } else {
        month = parseInt(parts[0], 10);
      }

      year = parseInt(parts[1], 10);
      if (year < 100) year += 2000;

      if (month >= 1 && month <= 12 && year >= 2018 && year <= currentYear + 1) {
        // Check future date
        if (year > currentYear || (year === currentYear && month > currentMonth + 1)) {
          mfgDateStatus = 'malformed';
          mfgDateDetails = `Date indicates future manufacturing date (${month}/${year}), which is non-compliant under Rule 6(1)(d).`;
          mfgDateReason = 'Post-dated / Future manufacture date violation';
        } else {
          mfgDateStatus = 'compliant';
          mfgDateDetails = `Valid month & year of manufacture/packaging detected (${month.toString().padStart(2, '0')}/${year}).`;
        }
      } else if (year < 2018) {
        mfgDateStatus = 'malformed';
        mfgDateDetails = `Manufacture date (${rawDateStr}) is older than standard statutory limit (pre-2018).`;
        mfgDateReason = 'Date is beyond sane enforcement validity window';
      } else {
        mfgDateStatus = 'malformed';
        mfgDateDetails = `Date string '${rawDateStr}' does not match statutory MM/YYYY format.`;
        mfgDateReason = 'Invalid month or year format';
      }
    } else {
      mfgDateStatus = 'malformed';
      mfgDateReason = 'Unparseable date structure';
    }
  } else {
    mfgDateStatus = 'missing';
    mfgDateReason = 'No date of manufacture, packing, or import found';
  }

  // 5. Consumer Care / Contact Details (Rule 6(1)(f))
  // Must include either phone number pattern (toll-free / 10-digit / landline) or email pattern
  let careStatus: ValidationStatus = 'missing';
  let careValue = 'MISSING';
  let careDetails = 'Consumer care details must include a reachable telephone number and/or valid email address for customer grievance.';
  let careReason: string | undefined;

  const phoneRegex = /(?:(?:\+91[\s-]*)?|(?:1800[\s-]*\d{2,4}[\s-]*\d{2,4})|(?:0\d{2,4}[\s-]*\d{6,8})|(?:\b[6-9]\d{9}\b))/;
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  const carePrefixRegex = /(?:customer\s*care|consumer\s*care|helpline|support|feedback|call\s*us|grievance)/i;

  const phoneMatch = normalized.match(phoneRegex);
  const emailMatch = normalized.match(emailRegex);
  const hasCarePrefix = carePrefixRegex.test(normalized);

  if (phoneMatch && emailMatch) {
    careStatus = 'compliant';
    careValue = `${phoneMatch[0]} | ${emailMatch[0]}`;
    careDetails = `Comprehensive consumer care provided with both telephone (${phoneMatch[0]}) and email (${emailMatch[0]}).`;
  } else if (phoneMatch) {
    careStatus = 'compliant';
    careValue = phoneMatch[0];
    careDetails = `Reachable consumer care phone number detected (${phoneMatch[0]}).`;
  } else if (emailMatch) {
    careStatus = 'compliant';
    careValue = emailMatch[0];
    careDetails = `Reachable consumer care email detected (${emailMatch[0]}).`;
  } else if (hasCarePrefix) {
    careStatus = 'malformed';
    careValue = 'Consumer care mentioned without digits/email';
    careDetails = 'Customer care section header found, but neither valid 10-digit/1800 phone number nor email address was resolved.';
    careReason = 'Missing contact phone or email in care section';
  } else {
    careStatus = 'missing';
    careReason = 'No consumer care phone number or email address found';
  }

  // 6. Country of Origin (Rule 6(1)(aa))
  // Only required if package language/other markers suggest an imported product — otherwise mark "Not Applicable"
  const importKeywords = /(?:imported\s+by|country\s+of\s+origin|made\s+in\s+(?!india)|product\s+of\s+(?!india)|mfd\s+in\s+(?!india)|origin:|import\s+license|customs)/i;
  const domesticOriginKeywords = /(?:made\s+in\s+india|product\s+of\s+india|mfd\s+in\s+india|produce\s+of\s+india|origin:\s*india)/i;

  const suggestsImport = hints?.isImported || importKeywords.test(normalized);
  const statesDomesticOrigin = domesticOriginKeywords.test(normalized);

  let originStatus: ValidationStatus = 'not_applicable';
  let originValue = 'Not Applicable (Domestic Packaged Commodity)';
  let originDetails = 'Rule 6(1)(aa) specifies Country of Origin declaration is mandatory for imported products. Not required for domestic goods.';
  let originReason: string | undefined;

  const countryMatch = normalized.match(/(?:country\s+of\s+origin|made\s+in|product\s+of|origin)[:\s]*([a-zA-Z\s]{2,25})/i);

  if (suggestsImport) {
    if (countryMatch && countryMatch[1]) {
      originStatus = 'compliant';
      originValue = countryMatch[0].trim();
      originDetails = `Imported commodity has compliant Country of Origin declaration (${countryMatch[1].trim()}) per Rule 6(1)(aa).`;
    } else {
      originStatus = 'missing';
      originValue = 'MISSING (Import markers detected)';
      originDetails = 'Packaging suggests an imported commodity (or foreign packer), but explicit statutory Country of Origin declaration is MISSING.';
      originReason = 'Imported product without declared Country of Origin';
    }
  } else if (statesDomesticOrigin) {
    originStatus = 'compliant';
    originValue = statesDomesticOrigin ? 'Made in India' : (countryMatch ? countryMatch[0].trim() : 'India');
    originDetails = 'Voluntary explicit declaration of domestic origin (India) per statutory standards.';
  } else {
    originStatus = 'not_applicable';
  }

  // Helper function to evaluate text font size heuristic and confidence from OCR bounding boxes / hints
  const getHeuristicForDeclaration = (
    declId: string,
    currentStatus: ValidationStatus,
    extractedSnippet: string
  ): { status: ValidationStatus; confidence: number; fontSizeNeedsCheck: boolean; estimatedHeightMm?: number; note?: string } => {
    // 1. Find matching text block if available
    const matchedBlock = rawBlocks.find((b) => {
      if (b.category && (
        (declId === 'mfg_details' && (b.category === 'mfg_address' || b.category === 'mfg_name')) ||
        (declId === 'net_qty' && b.category === 'net_qty') ||
        (declId === 'mrp' && b.category === 'mrp') ||
        (declId === 'mfg_date' && b.category === 'mfg_date') ||
        (declId === 'consumer_care' && b.category === 'consumer_care') ||
        (declId === 'origin' && b.category === 'country_of_origin')
      )) {
        return true;
      }
      return extractedSnippet && extractedSnippet !== 'MISSING' && b.text && (
        b.text.toLowerCase().includes(extractedSnippet.slice(0, 15).toLowerCase()) ||
        extractedSnippet.toLowerCase().includes(b.text.slice(0, 15).toLowerCase())
      );
    });

    // 2. Resolve confidence score (from Gemini text block, or calculated based on compliance status)
    let confidence = matchedBlock?.confidence;
    if (typeof confidence !== 'number') {
      if (currentStatus === 'compliant') confidence = 0.94;
      else if (currentStatus === 'malformed') confidence = 0.82;
      else if (currentStatus === 'not_applicable') confidence = 0.98;
      else confidence = 0.38;
    }

    // 3. OCR Bounding Box and Font Size Heuristic
    // Check if text height appears below minimum prescribed font size (< 1mm visually, or heightRatio < 0.014, or flagged by OCR)
    const hasSmallFontFlag = Boolean(
      matchedBlock?.fontSizeNeedsCheck ||
      (matchedBlock?.estimatedHeightMm !== undefined && matchedBlock.estimatedHeightMm < 1.0) ||
      (matchedBlock?.boundingBox?.heightRatio !== undefined && matchedBlock.boundingBox.heightRatio < 0.014) ||
      (hints?.smallFontRisk && (declId === 'net_qty' || declId === 'mrp' || declId === 'mfg_details')) ||
      (normalized.toLowerCase().includes('micro-print') || normalized.toLowerCase().includes('small font') || normalized.toLowerCase().includes('< 1mm'))
    );

    const estimatedMm = matchedBlock?.estimatedHeightMm || (hasSmallFontFlag ? 0.8 : (declId === 'net_qty' ? 3.5 : 2.4));

    // If declaration passed statutory syntax checks but font size is suspect (< 1mm visually):
    // Flag as 'font_size_needs_check' instead of a hard 'malformed' or 'missing' status.
    if (currentStatus === 'compliant' && hasSmallFontFlag) {
      return {
        status: 'font_size_needs_check',
        confidence: Number(confidence.toFixed(2)),
        fontSizeNeedsCheck: true,
        estimatedHeightMm: estimatedMm,
        note: `Font height estimated at ~${estimatedMm}mm (< 1.0mm threshold). Rule 9 mandates minimum 2.0mm-6.0mm depending on package size; manual optical gauge verification required.`
      };
    }

    return {
      status: currentStatus,
      confidence: Number(confidence.toFixed(2)),
      fontSizeNeedsCheck: hasSmallFontFlag,
      estimatedHeightMm: estimatedMm
    };
  };

  const mfgH = getHeuristicForDeclaration('mfg_details', mfgStatus, mfgValue);
  const netQtyH = getHeuristicForDeclaration('net_qty', netQtyStatus, netQtyValue);
  const mrpH = getHeuristicForDeclaration('mrp', mrpStatus, mrpValue);
  const mfgDateH = getHeuristicForDeclaration('mfg_date', mfgDateStatus, mfgDateValue);
  const careH = getHeuristicForDeclaration('consumer_care', careStatus, careValue);
  const originH = getHeuristicForDeclaration('origin', originStatus, originValue);

  // Build the 6 structured declaration results
  const results: DeclarationResult[] = [
    {
      id: 'mfg_details',
      name: 'Name & Address of Manufacturer / Packer / Importer',
      status: mfgH.status,
      extractedValue: mfgValue,
      ruleReference: 'Rule 6(1)(a), Legal Metrology (Packaged Commodities) Rules, 2011',
      legalCitation: 'Rule 6(1)(a)',
      requirementText: 'Name and complete address of the manufacturer, or where manufacturer is not the packer, name and address of the manufacturer and packer, including postal PIN code.',
      details: mfgH.note ? `${mfgDetails} ${mfgH.note}` : mfgDetails,
      confidence: mfgH.confidence,
      violationReason: mfgReason,
      fontSizeNeedsCheck: mfgH.fontSizeNeedsCheck,
      estimatedHeightMm: mfgH.estimatedHeightMm
    },
    {
      id: 'net_qty',
      name: 'Net Quantity',
      status: netQtyH.status,
      extractedValue: netQtyValue,
      ruleReference: 'Rule 11 & 12, Legal Metrology (Packaged Commodities) Rules, 2011',
      legalCitation: 'Rule 11, Rule 12 & Schedule III',
      requirementText: 'Net quantity must be declared in standard SI metric units (weight in g/kg, volume in ml/l, length in m/cm) or piece count (N/units). Imperial units (oz, lbs) are prohibited.',
      details: netQtyH.note ? `${netQtyDetails} ${netQtyH.note}` : netQtyDetails,
      confidence: netQtyH.confidence,
      violationReason: netQtyReason,
      fontSizeNeedsCheck: netQtyH.fontSizeNeedsCheck,
      estimatedHeightMm: netQtyH.estimatedHeightMm
    },
    {
      id: 'mrp',
      name: 'Maximum Retail Price (MRP)',
      status: mrpH.status,
      extractedValue: mrpValue,
      ruleReference: 'Rule 6(1)(e), Legal Metrology (Packaged Commodities) Rules, 2011',
      legalCitation: 'Rule 6(1)(e)',
      requirementText: 'Maximum Retail Price in Indian Rupees, inclusive of all taxes, with the exact or equivalent phrase "inclusive of all taxes" or "incl. of all taxes".',
      details: mrpH.note ? `${mrpDetails} ${mrpH.note}` : mrpDetails,
      confidence: mrpH.confidence,
      violationReason: mrpReason,
      fontSizeNeedsCheck: mrpH.fontSizeNeedsCheck,
      estimatedHeightMm: mrpH.estimatedHeightMm
    },
    {
      id: 'mfg_date',
      name: 'Month & Year of Manufacture / Packing / Import',
      status: mfgDateH.status,
      extractedValue: mfgDateValue,
      ruleReference: 'Rule 6(1)(d), Legal Metrology (Packaged Commodities) Rules, 2011',
      legalCitation: 'Rule 6(1)(d)',
      requirementText: 'Month and year in which the commodity is manufactured, packed or imported, expressed in numerals or words (e.g., 05/2024 or May 2024).',
      details: mfgDateH.note ? `${mfgDateDetails} ${mfgDateH.note}` : mfgDateDetails,
      confidence: mfgDateH.confidence,
      violationReason: mfgDateReason,
      fontSizeNeedsCheck: mfgDateH.fontSizeNeedsCheck,
      estimatedHeightMm: mfgDateH.estimatedHeightMm
    },
    {
      id: 'consumer_care',
      name: 'Consumer Care / Contact Details',
      status: careH.status,
      extractedValue: careValue,
      ruleReference: 'Rule 6(1)(f), Legal Metrology (Packaged Commodities) Rules, 2011',
      legalCitation: 'Rule 6(1)(f)',
      requirementText: 'Name, address, telephone number and/or email address of the person or company who can be contacted by the consumer in case of complaints or queries.',
      details: careH.note ? `${careDetails} ${careH.note}` : careDetails,
      confidence: careH.confidence,
      violationReason: careReason,
      fontSizeNeedsCheck: careH.fontSizeNeedsCheck,
      estimatedHeightMm: careH.estimatedHeightMm
    },
    {
      id: 'origin',
      name: 'Country of Origin (For Imports)',
      status: originH.status,
      extractedValue: originValue,
      ruleReference: 'Rule 6(1)(aa), Legal Metrology (Packaged Commodities) Rules, 2011',
      legalCitation: 'Rule 6(1)(aa)',
      requirementText: 'Name of the country of origin or manufacture, mandatory where the packaged commodity is imported into India.',
      details: originH.note ? `${originDetails} ${originH.note}` : originDetails,
      confidence: originH.confidence,
      violationReason: originReason,
      fontSizeNeedsCheck: originH.fontSizeNeedsCheck,
      estimatedHeightMm: originH.estimatedHeightMm
    }
  ];

  // Overall verdict: Only hard violations (missing or malformed) trigger NON-COMPLIANT
  // font_size_needs_check is an advisory flag requiring physical verification rather than a hard fail
  const hardViolations = results.filter(r => r.status === 'missing' || r.status === 'malformed');
  const fontSizeFlags = results.filter(r => r.status === 'font_size_needs_check');
  const isCompliant = hardViolations.length === 0;
  
  const compliantOrAdvisoryCount = results.filter(
    r => r.status === 'compliant' || r.status === 'not_applicable' || r.status === 'font_size_needs_check'
  ).length;
  const complianceRate = Math.round((compliantOrAdvisoryCount / results.length) * 100);

  // Font size advisory check per Rule 9 & Schedule II
  const hasSmallFontItem = fontSizeFlags.length > 0 || hints?.smallFontRisk;
  const fontSizeAdvisory: FontSizeAdvisory = {
    flag: hasSmallFontItem ? 'manual_verification_required' : 'manual_verification_required',
    prescribedRule: 'Rule 9 & Schedule II (Minimum Font Height of Numerals & Letters)',
    message: hasSmallFontItem
      ? `Estimated OCR bounding box indicates text element(s) in ${fontSizeFlags.map(f => f.name).join(', ') || 'package declarations'} may be below the statutory minimum (< 1.0mm). Physical measurement with a calibrated optical metric gauge is required.`
      : (hints?.fontNotes || 'Font height on physical package requires manual measurement with a calibrated metric gauge. Under Rule 9, minimum numeral height is 2.0 mm (≤200g/ml), 4.0 mm (200g-1kg/l), or 6.0 mm (>1kg/l).'),
    guidanceTable: '≤ 200g/ml: Min 2.0 mm | 200g to 1kg/l: Min 4.0 mm | > 1kg/l: Min 6.0 mm'
  };

  return {
    results,
    overallVerdict: isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT',
    complianceRate,
    fontSizeAdvisory,
    isImportedDetected: Boolean(suggestsImport)
  };
}
