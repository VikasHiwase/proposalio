import jsPDF from "jspdf";

// Sanitize text to handle special characters in PDF
const sanitizeText = (text) => {
  return text
    .replace(/₹/g, 'Rs ')     // Convert rupee symbol to 'Rs '
    .replace(/[–—]/g, '-')    // Convert em/en dashes to regular hyphen
    .replace(/[""]/g, '"')    // Convert smart quotes to regular quotes
    .replace(/['']/g, "'")    // Convert smart apostrophes
    .replace(/&/g, 'and')     // Convert & to 'and'
    .replace(/\|/g, '-');     // Convert | to hyphen
};

export function downloadProposalAsPDF({ proposal, clientName, yourName }) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ══════════════════════════════════════════════════════
  // Header
  // ══════════════════════════════════════════════════════
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 18, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("PROPOSAL", margin, 11);

  const date = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(date, pageWidth - margin, 11, { align: "right" });

  y = 28;

  // ══════════════════════════════════════════════════════
  // Title
  // ══════════════════════════════════════════════════════
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39);
  doc.text(`Proposal for ${clientName || "Client"}`, margin, y);
  y += 8;

  if (yourName) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Prepared by ${yourName}`, margin, y);
    y += 5;
  }

  // Divider
  y += 2;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ══════════════════════════════════════════════════════
  // Content
  // ══════════════════════════════════════════════════════
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);

  // Split by line, preserving structure
  const proposalLines = proposal.split("\n");
  let lineIndex = 0;

  while (lineIndex < proposalLines.length) {
    const rawLine = proposalLines[lineIndex];
    const line = rawLine.trim();

    // Skip empty lines
    if (!line) {
      lineIndex++;
      continue;
    }

    // Check if we need a new page
    if (y > pageHeight - margin - 10) {
      doc.addPage();
      y = margin;
    }

    // ─────────────────────────────────────────────────────
    // SUBJECT LINE
    // ─────────────────────────────────────────────────────
    if (line.startsWith("Subject:")) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(59, 130, 246);

      const subjectLines = doc.splitTextToSize(sanitizeText(line), contentWidth);
      subjectLines.forEach((subLine) => {
        if (y > pageHeight - margin - 10) {
          doc.addPage();
          y = margin;
        }
        doc.text(subLine, margin, y);
        y += 5.5;
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      y += 2; // Extra space after subject
    }

    // ─────────────────────────────────────────────────────
    // DIVIDER
    // ─────────────────────────────────────────────────────
    else if (line === "---") {
      y += 2;
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
    }

    // ─────────────────────────────────────────────────────

    // Investment line
    // ─────────────────────────────────────────────────────
    else if (line.startsWith("Investment:")) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(16, 185, 129); // Green color for investment

      const investmentLines = doc.splitTextToSize(sanitizeText(line), contentWidth);
      investmentLines.forEach((invLine) => {
        if (y > pageHeight - margin - 10) {
          doc.addPage();
          y = margin;
        }
        doc.text(invLine, margin, y);
        y += 5.5;
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      y += 2; // Extra space after investment
    }
    // ─────────────────────────────────────────────────────
    // P.S. LINE
    // ─────────────────────────────────────────────────────
    else if (line.startsWith("P.S.")) {
      y += 3;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);

      const psLines = doc.splitTextToSize(sanitizeText(line), contentWidth);

      psLines.forEach((psLine) => {
        if (y > pageHeight - margin - 10) {
          doc.addPage();
          y = margin;
        }
        doc.text(psLine, margin, y);
        y += 5;
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
    }

    // ─────────────────────────────────────────────────────
    // BULLET POINT
    // ─────────────────────────────────────────────────────
    else if (line.startsWith("•")) {
      doc.setTextColor(59, 130, 246);
      const bulletText = line.substring(1).trim();

      // Draw bullet
      doc.text("•", margin, y);
      doc.setTextColor(55, 65, 81);

      // Wrap bullet text with proper indentation
      const bulletWidth = contentWidth - 4;
      const bulletLines = doc.splitTextToSize(sanitizeText(bulletText), bulletWidth);

      bulletLines.forEach((bulletLine, idx) => {
        if (y > pageHeight - margin - 10) {
          doc.addPage();
          y = margin;
        }

        if (idx === 0) {
          doc.text(bulletLine, margin + 3, y);
        } else {
          doc.text(bulletLine, margin + 3, y);
        }
        y += 5.5;
      });

      y += 2; // Space after bullet
    }

    // ─────────────────────────────────────────────────────
    // REGULAR TEXT
    // ─────────────────────────────────────────────────────
    else {
      // Check if line is a heading (ends with colon)
      const isHeading = /:\s*$/.test(line);

      if (isHeading) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(17, 24, 39);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
      }

      const textLines = doc.splitTextToSize(sanitizeText(line), contentWidth);

      textLines.forEach((textLine) => {
        if (y > pageHeight - margin - 10) {
          doc.addPage();
          y = margin;
        }

        doc.text(textLine, margin, y);
        y += 5.5;
      });

      // Add extra space after headings
      y += isHeading ? 3 : 1;
    }

    lineIndex++;
  }

  // ══════════════════════════════════════════════════════
  // Footer
  // ══════════════════════════════════════════════════════
  const footerY = pageHeight - 8;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);

  const pageCount = doc.internal.pages.length - 1; // Subtract 1 for the extra page created by jsPDF
  doc.text("Generated with ProposalIO", margin, footerY);
  doc.text(`Page 1 of ${pageCount}`, pageWidth - margin, footerY, { align: "right" });

  // ══════════════════════════════════════════════════════
  // Save
  // ══════════════════════════════════════════════════════
  const filename = `Proposal_${(clientName || "Client")
    .replace(/\s+/g, "_")
    .substring(0, 20)}_${Date.now()}.pdf`;
  doc.save(filename);
}
