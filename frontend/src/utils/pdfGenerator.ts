import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ScanRecord } from '../types/metrology';

export function exportEnforcementPdf(record: ScanRecord) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top Amber Header Accent Bar (4mm)
  doc.setFillColor(251, 191, 36); // #fbbf24
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Secondary dark bar under it
  doc.setFillColor(24, 24, 24);
  doc.rect(0, 5, pageWidth, 2, 'F');

  // Official Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('GOVERNMENT OF INDIA • MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION', pageWidth / 2, 14, { align: 'center' });
  doc.text('DIRECTORATE OF LEGAL METROLOGY • ENFORCEMENT & COMPLIANCE DIVISION', pageWidth / 2, 18, { align: 'center' });

  // Main Report Title
  doc.setFontSize(15);
  doc.setTextColor(15, 15, 15);
  doc.text('STATUTORY COMPLIANCE AUDIT REPORT', pageWidth / 2, 26, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Under India\'s Legal Metrology (Packaged Commodities) Rules, 2011 [SIH-26034 Protocol]', pageWidth / 2, 31, { align: 'center' });

  // Thin dividing rule
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.4);
  doc.line(14, 34, pageWidth - 14, 34);

  // Metadata Box (Officer, ID, Date, Product)
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(14, 37, pageWidth - 28, 28, 2, 2, 'F');
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(14, 37, pageWidth - 28, 28, 2, 2, 'S');

  // Left Column of Meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.text('AUDIT ID:', 18, 43);
  doc.text('TIMESTAMP:', 18, 49);
  doc.text('COMMODITY:', 18, 55);
  doc.text('ORIGIN TYPE:', 18, 61);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 15, 15);
  doc.text(record.id, 44, 43);

  doc.setFont('courier', 'normal');
  doc.text(new Date(record.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), 44, 49);

  doc.setFont('helvetica', 'normal');
  doc.text(record.productName || 'Packaged Commodity', 44, 55);
  doc.text(record.isImported ? 'Imported Package (Rule 6(1)(aa) Active)' : 'Domestic Packaged Commodity', 44, 61);

  // Right Column of Meta
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICER:', 115, 43);
  doc.text('BADGE / ID:', 115, 49);
  doc.text('ZONAL STATION:', 115, 55);
  doc.text('VERDICT:', 115, 61);

  doc.setFont('helvetica', 'normal');
  doc.text(record.officerName, 142, 43);

  doc.setFont('courier', 'normal');
  doc.text(record.officerBadge, 142, 49);

  doc.setFont('helvetica', 'normal');
  doc.text(record.station || 'New Delhi Inspection Zone', 142, 55);

  const isCompliant = record.overallVerdict === 'COMPLIANT';
  doc.setFont('helvetica', 'bold');
  if (isCompliant) {
    doc.setTextColor(22, 101, 52); // green
    doc.text('COMPLIANT [PASSED]', 142, 61);
  } else {
    doc.setTextColor(185, 28, 28); // red
    doc.text('NON-COMPLIANT [VIOLATION]', 142, 61);
  }

  // Verdict Banner
  let bannerY = 69;
  if (isCompliant) {
    doc.setFillColor(240, 253, 244); // light green
    doc.roundedRect(14, bannerY, pageWidth - 28, 12, 1.5, 1.5, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(14, bannerY, pageWidth - 28, 12, 1.5, 1.5, 'S');
    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('✓ OVERALL VERDICT: COMPLIANT WITH LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011', pageWidth / 2, bannerY + 7.5, { align: 'center' });
  } else {
    doc.setFillColor(254, 242, 242); // light red
    doc.roundedRect(14, bannerY, pageWidth - 28, 12, 1.5, 1.5, 'F');
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(14, bannerY, pageWidth - 28, 12, 1.5, 1.5, 'S');
    doc.setTextColor(185, 28, 28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('⚠ OVERALL VERDICT: NON-COMPLIANT — STATUTORY VIOLATION(S) DETECTED', pageWidth / 2, bannerY + 7.5, { align: 'center' });
  }

  // Table Data Preparation
  // Columns: Declaration | Required | Detected | Status | Rule Reference
  const tableRows = record.results.map((item) => {
    let reqShort = 'Mandatory';
    if (item.id === 'origin') {
      reqShort = record.isImported ? 'Mandatory (Imports)' : 'Conditional (Rule 6)';
    }

    const detectedSnippet = item.extractedValue.length > 50 
      ? item.extractedValue.slice(0, 48) + '...' 
      : item.extractedValue;

    let statusDisplay = item.status.toUpperCase().replace(/_/g, ' ');
    if (item.status === 'font_size_needs_check') {
      statusDisplay = 'NEEDS FONT CHECK';
    }

    const confScore = Math.round((item.confidence || 0.94) * 100);

    return [
      item.name,
      reqShort,
      `${detectedSnippet} [${confScore}% Conf.]`,
      statusDisplay,
      item.ruleReference.replace('Legal Metrology (Packaged Commodities) Rules, 2011', 'LMRP 2011')
    ];
  });

  autoTable(doc, {
    startY: bannerY + 16,
    margin: { left: 14, right: 14 },
    head: [['Mandatory Declaration', 'Required', 'Detected Text / Value', 'Status', 'Statutory Citation']],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      textColor: [30, 30, 30],
      cellPadding: 3,
      lineColor: [220, 220, 220],
      lineWidth: 0.2,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [24, 24, 24],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 44, fontStyle: 'bold' },
      1: { cellWidth: 22 },
      2: { cellWidth: 48, font: 'courier' },
      3: { cellWidth: 26, fontStyle: 'bold', halign: 'center' },
      4: { cellWidth: 42, fontSize: 7, fontStyle: 'italic' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const text = String(data.cell.raw).toLowerCase();
        if (text.includes('check') || text.includes('font')) {
          data.cell.styles.textColor = [180, 83, 9];
          data.cell.styles.fillColor = [254, 243, 199];
        } else if (text.includes('compliant')) {
          data.cell.styles.textColor = [22, 101, 52];
          data.cell.styles.fillColor = [240, 253, 244];
        } else if (text.includes('missing')) {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fillColor = [254, 242, 242];
        } else if (text.includes('malformed')) {
          data.cell.styles.textColor = [180, 83, 9];
          data.cell.styles.fillColor = [254, 243, 199];
        } else {
          data.cell.styles.textColor = [100, 116, 139];
          data.cell.styles.fillColor = [241, 245, 249];
        }
      }
    },
  });

  // Calculate table end Y
  const finalY = (doc as any).lastAutoTable?.finalY || 160;

  // Font Size Advisory Banner (Rule 9)
  doc.setFillColor(254, 249, 195); // amber tint
  doc.roundedRect(14, finalY + 6, pageWidth - 28, 14, 1.5, 1.5, 'F');
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(14, finalY + 6, pageWidth - 28, 14, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14);
  doc.text('RULE 9 STATUTORY ADVISORY — FONT HEIGHT & SCHEDULE II CALIBRATION:', 18, finalY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(113, 63, 18);
  doc.text(
    'Digital vision extraction estimates relative proportion. Physical verification with a calibrated optical scale is required for net quantity numeral height (Min: 2mm for ≤200g, 4mm for 200g-1kg, 6mm for >1kg).',
    18,
    finalY + 16,
    { maxWidth: pageWidth - 36 }
  );

  // Evidence Package Thumbnail (if base64 is available and valid image)
  let signatureY = finalY + 26;
  if (record.imageThumbnail && record.imageThumbnail.startsWith('data:image')) {
    try {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(80, 80, 80);
      doc.text('PACKAGE EXHIBIT SNAPSHOT:', 14, finalY + 25);
      doc.addImage(record.imageThumbnail, 'JPEG', 14, finalY + 27, 28, 28);
      signatureY = finalY + 60;
    } catch (e) {
      console.warn('Could not add image thumbnail to PDF:', e);
    }
  }

  // Ensure signature fits on page or append
  if (signatureY > pageHeight - 35) {
    signatureY = pageHeight - 35;
  }

  // Official Signature Block
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);

  // Left: Officer Signature
  doc.line(14, signatureY + 15, 75, signatureY + 15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.text('Inspecting Officer Signature & Date', 14, signatureY + 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(`${record.officerName} [${record.officerBadge}]`, 14, signatureY + 23);

  // Right: Zonal Office Seal
  doc.line(pageWidth - 75, signatureY + 15, pageWidth - 14, signatureY + 15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.text('Legal Metrology Zonal Seal / Verification Stamp', pageWidth - 75, signatureY + 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('Department of Consumer Affairs, Govt. of India', pageWidth - 75, signatureY + 23);

  // Footer bar
  doc.setFillColor(24, 24, 24);
  doc.rect(0, pageHeight - 7, pageWidth, 7, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(200, 200, 200);
  doc.text(
    `MāpDrishti (मापदृष्टि) v1.0 • Generated for SIH26034 Enforcement Pilot • Monospace Ref: ${record.id} • Page 1 of 1`,
    pageWidth / 2,
    pageHeight - 2.5,
    { align: 'center' }
  );

  // Save the PDF
  const cleanId = record.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`MapDrishti_Enforcement_Audit_${cleanId}.pdf`);
}
