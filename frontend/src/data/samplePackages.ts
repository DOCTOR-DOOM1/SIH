import { SamplePackagePreset } from '../types/metrology';

// Helper to create an SVG data URL representing a product packaging label
function createPackageSvg(title: string, sub: string, accentColor: string, tags: string[]): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1c1917"/>
      <stop offset="100%" stop-color="#0c0a09"/>
    </linearGradient>
    <linearGradient id="badge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${accentColor}"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" rx="12" fill="url(#bg)" stroke="#333" stroke-width="2"/>
  <rect x="20" y="20" width="360" height="40" rx="6" fill="#292524"/>
  <text x="35" y="45" fill="${accentColor}" font-family="sans-serif" font-size="14" font-weight="bold" letter-spacing="1">STATUTORY PACKAGE EXHIBIT</text>
  <circle cx="360" cy="40" r="6" fill="${accentColor}"/>
  
  <!-- Product Label Simulation -->
  <rect x="30" y="75" width="340" height="150" rx="8" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
  <text x="45" y="105" fill="#ffffff" font-family="serif" font-size="18" font-weight="bold">${title}</text>
  <text x="45" y="125" fill="#a1a1aa" font-family="sans-serif" font-size="11">${sub}</text>
  
  <!-- Simulated barcode and declarations -->
  <line x1="45" y1="140" x2="355" y2="140" stroke="#27272a" stroke-width="1"/>
  
  <rect x="45" y="152" width="100" height="18" rx="4" fill="#27272a"/>
  <text x="52" y="165" fill="#e4e4e7" font-family="monospace" font-size="9">${tags[0] || 'RULE 6 CHECK'}</text>
  
  <rect x="155" y="152" width="95" height="18" rx="4" fill="#27272a"/>
  <text x="162" y="165" fill="#e4e4e7" font-family="monospace" font-size="9">${tags[1] || 'DECLARATION'}</text>

  <rect x="260" y="152" width="95" height="18" rx="4" fill="#27272a"/>
  <text x="267" y="165" fill="#e4e4e7" font-family="monospace" font-size="9">${tags[2] || 'METROLOGY'}</text>

  <!-- Simulated Barcode lines -->
  <g fill="#71717a">
    <rect x="45" y="185" width="3" height="25"/>
    <rect x="52" y="185" width="2" height="25"/>
    <rect x="57" y="185" width="5" height="25"/>
    <rect x="65" y="185" width="2" height="25"/>
    <rect x="70" y="185" width="4" height="25"/>
    <rect x="78" y="185" width="2" height="25"/>
    <rect x="83" y="185" width="6" height="25"/>
    <rect x="92" y="185" width="2" height="25"/>
    <rect x="97" y="185" width="4" height="25"/>
    <rect x="105" y="185" width="3" height="25"/>
  </g>
  <text x="120" y="200" fill="#a1a1aa" font-family="monospace" font-size="9">EAN: 8901234567890</text>
  <text x="45" y="255" fill="#71717a" font-family="sans-serif" font-size="9">LMRP 2011 Verified Sample • Directorate of Legal Metrology</text>
</svg>
  `.trim();
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export const SAMPLE_PACKAGES: SamplePackagePreset[] = [
  {
    id: 'sample-compliant-snack',
    title: 'Anand Premium Roasted Almonds',
    category: 'Packaged Food & Confectionery',
    tag: '100% Compliant',
    description: 'Fully compliant domestic package featuring all 6 declarations, valid metric unit (200g), complete address with PIN 560001, and tax-inclusive MRP.',
    expectedVerdict: 'COMPLIANT',
    imageThumbnail: createPackageSvg('Anand Roasted Almonds', 'Net Wt: 200g • MRP ₹249.00', '#10b981', ['Net Wt 200g', '₹249 Incl Taxes', 'PIN 560001']),
    extractedText: `Anand Premium Roasted Almonds (Salted)
Net Quantity: 200 g
MRP: Rs. 249.00 (inclusive of all taxes)
Month and Year of Mfg: 04/2025
Manufactured and Packed by:
Anand Agrotech Foods Pvt. Ltd.
Plot 45, Peenya Industrial Area, Bengaluru, Karnataka 560001
Customer Care: 1800-425-9988 | Email: care@anandagrotech.in
Made in India
FSSAI Lic No: 10019043002456
Batch No: AA-2025-04-09`,
    isImported: false
  },
  {
    id: 'sample-missing-tax-phrase',
    title: 'SunCrisp Multigrain Biscuits',
    category: 'Bakery & Biscuits',
    tag: 'Non-Compliant (MRP Clause Defect)',
    description: 'Violation of Rule 6(1)(e): MRP stated as ₹60 without mandatory qualifying clause "inclusive of all taxes". Also missing 6-digit PIN code.',
    expectedVerdict: 'NON-COMPLIANT',
    imageThumbnail: createPackageSvg('SunCrisp Multigrain', 'Net: 150g • MRP ₹60 ONLY', '#ef4444', ['Net Qty 150g', 'MRP ₹60.00', 'No PIN Code']),
    extractedText: `SunCrisp Healthy Multigrain Biscuits
Net Weight: 150g
MRP: Rs. 60.00
Mfg Date: 02/2025
Manufactured by:
SunCrisp Bakers Ltd, Industrial Estate, Sector 5, Gurugram, Haryana.
Consumer Helpline: 9811002233
Store in cool and dry place.`,
    isImported: false
  },
  {
    id: 'sample-non-standard-unit',
    title: 'Mountain Fresh Berry Energy Crunch',
    category: 'Breakfast Cereals',
    tag: 'Non-Compliant (Imperial Units)',
    description: 'Violation of Rule 11: Uses non-standard imperial unit "14.5 oz" instead of standard metric units. Consumer care phone/email also absent.',
    expectedVerdict: 'NON-COMPLIANT',
    imageThumbnail: createPackageSvg('Mountain Berry Crunch', 'Net Wt: 14.5 oz • Prohibited Unit', '#f59e0b', ['Net Wt 14.5 oz', '₹380.00', 'Care Absent']),
    extractedText: `Mountain Fresh Berry Energy Crunch
Net Weight: 14.5 oz (Non-standard declaration)
MRP: Rs. 380.00 (inclusive of all taxes)
Date of Packing: 03/2025
Packed by: Valley Foods & Grain Co, Plot 108, MIDC Pune, Maharashtra 411018
Please direct all queries to our website.`,
    isImported: false
  },
  {
    id: 'sample-imported-olive-oil',
    title: 'Oleum Terra Extra Virgin Olive Oil',
    category: 'Edible Oils (Imported)',
    tag: 'Compliant Import',
    description: 'Imported product under Rule 6(1)(aa): Declares Country of Origin (Spain), Importer complete postal address with PIN 400013, and standard volume unit (500 ml).',
    expectedVerdict: 'COMPLIANT',
    imageThumbnail: createPackageSvg('Oleum Terra Olive Oil', 'Country of Origin: Spain • 500 ml', '#10b981', ['Net Vol 500 ml', 'Origin: Spain', 'Importer PIN']),
    extractedText: `Oleum Terra Extra Virgin Cold Pressed Olive Oil
Net Quantity: 500 ml
MRP: Rs. 850.00 (inclusive of all taxes)
Date of Import: 01/2025
Country of Origin: Spain
Produced by: Oleo Hispania S.A., Sevilla, Spain
Imported and Marketed in India by:
Gourmet Imports India Pvt Ltd, Unit 3B, Lower Parel West, Mumbai 400013
Customer Support: 1800-220-4400 or feedback@gourmetimports.in`,
    isImported: true
  },
  {
    id: 'sample-future-date-defect',
    title: 'NectarPure Kashmiri Acacia Honey',
    category: 'Organic Natural Products',
    tag: 'Non-Compliant (Future Date Violation)',
    description: 'Violation of Rule 6(1)(d): Package has future manufacture date (12/2027) stamped on pack, an enforcement violation.',
    expectedVerdict: 'NON-COMPLIANT',
    imageThumbnail: createPackageSvg('NectarPure Acacia Honey', 'Mfg: 12/2027 • Post-Dated', '#ef4444', ['Net Qty 250 g', 'Future 12/2027', 'MRP ₹320']),
    extractedText: `NectarPure Organic Kashmiri Acacia Honey
Net Quantity: 250 g
MRP: Rs. 320.00 (inclusive of all taxes)
Date of Packing: 12/2027
Mfd by: Himalayan Pure Herbs & Honey, Industrial Area, Srinagar, J&K 190001
Customer Care: 1800-180-7799 | Email: contact@nectarpure.com
Made in India`,
    isImported: false
  },
  {
    id: 'sample-micro-font-advisory',
    title: 'Vedic Spice Royal Cardamom Blend',
    category: 'Spices & Condiments',
    tag: 'Advisory (Font Size Needs Check)',
    description: 'Rule 9 Heuristic: All 6 declarations are present and valid, but OCR bounding box heuristic detects character height (< 1.0mm) below the 2.0mm statutory minimum. Flags as "Needs Font Check".',
    expectedVerdict: 'COMPLIANT',
    imageThumbnail: createPackageSvg('Vedic Spice Cardamom', 'Net: 50g • Micro-print font < 1mm', '#fbbf24', ['Net Qty 50 g', 'MRP ₹85.00', 'Font < 1mm']),
    extractedText: `Vedic Spice Royal Cardamom Blend
Net Quantity: 50 g (micro-print < 1mm)
MRP: Rs. 85.00 (inclusive of all taxes)
Date of Mfg: 03/2025
Mfd and Packed by:
Vedic Spice Works Pvt Ltd, Plot 22, Spice Park, Kochi, Kerala 682001
Customer Care: 1800-425-8811 | Email: support@vedicspice.in
Made in India`,
    isImported: false
  }
];
