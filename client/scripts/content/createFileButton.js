"use strict";

import { createDownloadButton } from "./createDownloadButton.js";
import { createOnContent } from "./createOnContent.js"

/**
 * @function createFileButton
 * @description
 * Creates and returns a styled button element representing a downloadable
 * content file. Displays a file icon and title label, with an embedded
 * download button and a full-page content view triggered on click.
 *
 * Accepts either positional arguments or a single options object. When an
 * object is passed as `title`, its `title` and `text` properties are
 * destructured automatically.
 *
 * **Element structure:**
 * ```
 * button.file.liquid-glass
 * ├── img[src="../assets/icons/large-file.svg"]
 * ├── span  {title}
 * └── button.liquid-glass.download  (from createDownloadButton)
 * ```
 *
 * Clicking the outer button triggers {@link createOnContent}, which animates
 * a full-page Markdown content view into the `content` container. The
 * embedded download button triggers a direct PDF export without navigating
 * away.
 *
 * @param {string|Object} title
 * Display label for the file button, or an options object with the following shape:
 * @param {string} [title.title] - Display label.
 * @param {string} [title.text]  - Markdown content string.
 *
 * @param {string} [text]
 * Raw Markdown string to render on click and convert to PDF on download.
 * Passed to both {@link createOnContent} and {@link createDownloadButton}.
 *
 * @param {string} [filename]
 * Suggested filename for the downloaded PDF. Forwarded to
 * {@link createDownloadButton}. Defaults to `"resume.pdf"` if omitted.
 *
 * @returns {HTMLButtonElement}
 * A button element with class `"file liquid-glass"` containing a file icon,
 * title label, and embedded download button. Ready to be appended to any
 * container.
 *
 * @example
 * // Positional arguments
 * container.appendChild(createFileButton("Resume", output.resume_markdown, "resume.pdf"));
 *
 * @example
 * // Options object
 * container.appendChild(createFileButton({
 *   title: "Cover Letter",
 *   text: output.cover_letter_markdown
 * }, undefined, "cover-letter.pdf"));
 *
 * @see {@link createDownloadButton} for PDF download behavior.
 * @see {@link createOnContent} for full-page Markdown content view.
 */
export const createFileButton = (title, text, filename) => {
  typeof title === "object" && title && (
    text = title.text,
    title = title.title
  );

  const elmt = document.createElement("button");
  elmt.setAttribute("class", "file liquid-glass");
  elmt.appendChild(document.createElement("img")).setAttribute("src", "../assets/icons/large-file.svg");
  elmt.appendChild(document.createElement("span")).textContent = title;
  elmt.appendChild(createDownloadButton(text, filename));
  elmt.onclick = createOnContent(text, filename);

  return elmt;
}