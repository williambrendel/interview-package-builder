"use strict";

import { API } from "../api.js";

/**
 * @function createDownloadButton
 * @description
 * Creates and returns a styled button element that converts a Markdown string
 * to a PDF and triggers a browser file download when clicked.
 *
 * On click, the button posts the Markdown content to {@link API.convertUrl},
 * receives an `application/pdf` binary response, and initiates a download via
 * a temporary object URL. The button is disabled and its label updated to
 * "Downloading..." during the request, then restored to its original state in
 * the `finally` block regardless of success or failure.
 *
 * **Download lifecycle:**
 * 1. POST `{ markdown }` to `/convert` → receives PDF `Blob`.
 * 2. Create a temporary object URL via `URL.createObjectURL`.
 * 3. Programmatically click a hidden `<a>` element to trigger the download.
 * 4. Immediately revoke the object URL to release memory.
 *
 * @param {string} md
 * Raw Markdown string to convert. Sent as the `markdown` field in the
 * POST request body. Typically the `resume_markdown` field from the LLM
 * output schema.
 *
 * @param {string} [filename="resume.pdf"]
 * Suggested filename for the downloaded file. Used as the `download`
 * attribute on the temporary anchor element. Defaults to `"resume.pdf"`
 * if not provided or falsy.
 *
 * @returns {HTMLButtonElement}
 * A button element with class `"liquid-glass download"` and an async
 * `onclick` handler. Ready to be appended directly to any container.
 *
 * @example
 * const btn = createDownloadButton(output.resume_markdown, "john-doe-resume.pdf");
 * toolbar.appendChild(btn);
 *
 * @example
 * // Filename defaults to "resume.pdf" if omitted
 * const btn = createDownloadButton(output.resume_markdown);
 * toolbar.appendChild(btn);
 *
 * @see {@link API.convertUrl} for the PDF conversion endpoint.
 */
export const createDownloadButton = (md, filename) => {
  const elmt = document.createElement("button");
  elmt.textContent = "Download";
  elmt.setAttribute("class", "liquid-glass download");
  elmt.onclick = async event => {
    event.stopPropagation();
    event.preventDefault();

    try {
      elmt.textContent = "Downloading...";
      elmt.disabled = true;

      const response = await fetch(API.convertUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: md })
      });

      if (!response.ok) throw new Error(`Failed to generate PDF: ${response.status}`);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "resume.pdf";
      a.click();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
    } finally {
      elmt.textContent = "Download";
      elmt.disabled = false;
    }
  };

  return elmt;
};