"use strict";

const { mdToPdf } = require("md-to-pdf");

/**
 * @fileoverview PDF generation utility for converting Markdown resume content
 * into a downloadable, professionally styled PDF buffer using md-to-pdf.
 * @module generateDownloadablePdf
 */

/**
 * CSS stylesheet applied to the generated PDF.
 * Uses the Inter font family (via Google Fonts) and applies an "Executive Tech"
 * visual theme with blue section headings, structured typography, and
 * print-safe page-break rules.
 *
 * @constant {string}
 */
const stylesheet = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    line-height: 1.5;
    color: #1f2937;
    padding: 10px;
  }

  h1 {
    font-size: 26pt;
    font-weight: 800;
    margin-bottom: 0;
    color: #000;
    letter-spacing: -0.03em;
  }

  p { margin-bottom: 8px; }

  h2 {
    font-size: 12pt;
    font-weight: 700;
    text-transform: uppercase;
    color: #2563eb;
    border-bottom: 1.5px solid #e5e7eb;
    padding-bottom: 4px;
    margin-top: 24px;
    letter-spacing: 0.05em;
  }

  h3 {
    font-size: 11pt;
    font-weight: 700;
    margin-top: 16px;
    margin-bottom: 2px;
    color: #111827;
    display: flex;
    justify-content: space-between;
  }

  em {
    font-style: normal;
    font-weight: 500;
    color: #6b7280;
    font-size: 10pt;
  }

  ul {
    padding-left: 20px;
    margin-top: 4px;
  }

  li {
    margin-bottom: 4px;
  }

  strong {
    color: #111827;
  }

  code {
    font-family: 'SFMono-Regular', Consolas, monospace;
    background: #f3f4f6;
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 9pt;
  }

  .page-break {
    page-break-after: always;
  }

  h3, h3 + p, h3 + ul {
    break-after: avoid;
  }

  li {
    break-inside: avoid;
  }

  h2, h3 {
    break-after: avoid;
  }

  p, li {
    orphans: 3;
    widows: 3;
  }

  hr {
    display: none;
  }
`;

/**
 * Converts a Markdown string into a professionally styled, downloadable PDF buffer.
 *
 * Renders the provided Markdown content using {@link https://www.npmjs.com/package/md-to-pdf md-to-pdf},
 * applying the {@link stylesheet} for an "Executive Tech" visual theme. The resulting
 * PDF is formatted for A4 with standard margins and is suitable for resume delivery.
 *
 * @async
 * @function generateDownloadablePdf
 * @param {string} markdownContent - The Markdown string to render as a PDF.
 *   Typically the `resume_markdown` field from the LLM output schema.
 * @returns {Promise<Buffer>} Resolves with a binary PDF buffer ready to be
 *   streamed or written to disk.
 *
 * @example
 * const pdfBuffer = await generateDownloadablePdf(output.resume_markdown);
 * res.setHeader("Content-Type", "application/pdf");
 * res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
 * res.send(pdfBuffer);
 */
const generateDownloadablePdf = async markdownContent => {
  const pdf = await mdToPdf(
    { content: markdownContent },
    {
      css: stylesheet,
      pdf_options: {
        format: "A4",
        margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
        printBackground: true,
      },
    }
  );

  return pdf.content;
};

/**
 * @ignore
 * Default export with freezing.
 */
module.exports = Object.freeze(Object.defineProperty(generateDownloadablePdf, "generateDownloadablePdf", {
  value: generateDownloadablePdf
}));