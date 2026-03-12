"use strict";

import { safeMdToHtml } from "./safeMdToHtml.js";

/**
 * @function renderSection
 * @description
 * Creates and returns a `DocumentFragment` containing an optional heading
 * and optional rendered Markdown content, suitable for injection into any
 * container element.
 *
 * Accepts either positional arguments or a single options object. When an
 * object is passed as `title`, its `title`, `text`, and `flag` properties
 * are destructured automatically, allowing both calling conventions to
 * coexist.
 *
 * **Fragment structure:**
 * ```
 * DocumentFragment
 * ├── h1.title[.{flag}]   (if title is provided)
 * └── [rendered Markdown nodes via safeMdToHtml]  (if text is provided)
 * ```
 *
 * @param {string|Object} title
 * Section heading text, or an options object with the following shape:
 * @param {string} [title.title] - Heading text.
 * @param {string} [title.text]  - Markdown body content.
 * @param {string} [title.flag]  - Additional CSS class applied to the heading.
 *
 * @param {string} [text]
 * Raw Markdown string to render as the section body. Converted to sanitized
 * HTML via {@link safeMdToHtml} and appended after the heading. Ignored if
 * falsy.
 *
 * @param {string} [flag]
 * Additional CSS class name appended to the heading element alongside the
 * base `"title"` class. Useful for applying variant styles (e.g. `"success"`,
 * `"warning"`). Ignored if falsy.
 *
 * @returns {DocumentFragment}
 * A document fragment containing the heading and/or rendered Markdown nodes.
 * Returns an empty fragment if both `title` and `text` are falsy.
 *
 * @example
 * // Positional arguments
 * content.appendChild(renderSection("Analysis", output.analysis));
 *
 * @example
 * // With a flag for variant styling
 * content.appendChild(renderSection("Warning", text, "warning"));
 *
 * @example
 * // Options object
 * content.appendChild(renderSection({
 *   title: "Suggestions",
 *   text: output.suggestions,
 *   flag: "highlight"
 * }));
 *
 * @see {@link safeMdToHtml} for Markdown sanitization and conversion.
 */
export const renderSection = (title, text, flag) => {
  typeof title === "object" && title && (
    text = title.text,
    flag = title.flag,
    title = title.title
  );
  const html = document.createDocumentFragment();
  let elmt;
  title && (
    elmt = html.appendChild(document.createElement("h1")),
    elmt.setAttribute("class", `title ${flag || ""}`),
    elmt.textContent = title
  );
  text && (
    elmt = document.createElement("template"),
    elmt.innerHTML = safeMdToHtml(text),
    html.appendChild(elmt.content)
  );

  return html;
}