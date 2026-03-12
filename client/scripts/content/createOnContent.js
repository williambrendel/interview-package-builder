"use strict";

import { instantDisplay } from "../progressiveDisplay.js";
import { GLOBALS } from "../globals.js";
import { safeMdToHtml } from "./safeMdToHtml.js";
import { DOM } from "../cachedDomReferences.js";

// Destructure DOM elements.
const { content } = DOM;

/**
 * @function createOnContent
 * @description
 * Curried event-handler factory that renders a Markdown string as a full-page
 * content sub-tree with animated page transitions, a back button, and a
 * download button.
 *
 * The outer call captures the Markdown string and filename, returning an
 * `onclick` handler suitable for attaching to any trigger element. When
 * invoked, the handler animates the current `content` container out
 * (`page-exit`), replaces its children with the rendered sub-tree, then
 * animates it back in (`page-enter`).
 *
 * The back button reverses the process: it snapshots the new sub-tree into a
 * `DocumentFragment`, restores the previous children, and re-runs the
 * enter/exit animation cycle to return to the original view.
 *
 * **Page transition lifecycle:**
 * 1. Remove `page-enter`, add `page-exit` → triggers CSS exit animation.
 * 2. On `animationend` (guarded to ignore bubbled child events):
 *    - Remove `page-exit`, force reflow, stop any progressive display.
 *    - Swap content and scroll to top.
 *    - Add `page-enter` → triggers CSS enter animation.
 *
 * **Sub-tree structure:**
 * ```
 * div.chat-qa
 * ├── div.spread-row
 * │   ├── button.liquid-glass.qa-back   (with chevron icon + "Back" label)
 * │   └── button.liquid-glass.download  (from createDownloadButton)
 * ├── [rendered Markdown nodes]
 * ├── br
 * └── div.spread-row (cloned — back and download handlers re-attached)
 * ```
 *
 * @param {string} str
 * Raw Markdown string to render. Passed to {@link safeMdToHtml} for
 * sanitized HTML conversion and to {@link createDownloadButton} for PDF
 * export. Typically the `resume_markdown` field from the LLM output.
 *
 * @param {string} filename
 * Suggested filename for the downloaded PDF (without extension).
 * Forwarded directly to {@link createDownloadButton}.
 *
 * @returns {function(Event): void}
 * An `onclick` event handler that:
 * - Calls `event.stopPropagation()` and `event.preventDefault()`.
 * - Triggers the page-exit animation on the global `content` element.
 * - Replaces `content` children with the rendered Markdown sub-tree on
 *   `animationend`.
 *
 * @example
 * // Attach to a result card button
 * viewButton.onclick = createOnContent(output.resume_markdown, "resume");
 *
 * @example
 * // Attach to a list item
 * li.onclick = createOnContent(output.cover_letter_markdown, "cover-letter");
 *
 * @see {@link safeMdToHtml} for Markdown sanitization.
 * @see {@link createDownloadButton} for PDF download behavior.
 * @see {@link instantDisplay} for progressive display cancellation.
 * @see {@link GLOBALS} for the `stopDisplay` cancellation hook.
 */
export const createOnContent = (str, filename) => event => {
  event.stopPropagation();
  event.preventDefault();

  // Create new sub-tree.
  const newContent = document.createElement("div");
  newContent.setAttribute("class", "chat-qa");

  // Add back button to the new sub-tree.
  let current;
  const back = document.createElement("button");
  back.setAttribute("class", "liquid-glass qa-back");
  back.appendChild(document.createElement("img")).setAttribute("src", "../assets/icons/chevron-left.svg");
  back.appendChild(document.createTextNode("Back"));
  back.onclick = event => {
    event.stopPropagation();

    content.onanimationend = event => {
      if (event.target !== content) return; // ignore bubbled events from children
    
      if (content.classList.contains("page-exit")) {
        content.classList.remove("page-exit");
        void content.offsetWidth; // force reflow
        
        // Stop progressive display animation and instead instant display.
        GLOBALS.stopDisplay && GLOBALS.stopDisplay();
        instantDisplay(content);

        // Replace current with new sub-tree.
        content.innerHTML = ""; // Make sure it's empty.
        content.appendChild(current);
        content.scrollTo({
          top: 0,
          behavior: "instant"
        });
        content.classList.add("page-enter");
      }
    }
    content.classList.remove("page-enter");
    content.classList.add("page-exit");
  }

  const download = createDownloadButton(str, filename);
  const row = document.createElement("div");
  row.setAttribute("class", "spread-row");
  row.appendChild(back);
  row.appendChild(download);
  newContent.appendChild(row);

  // Add markdown to subtree.
  const template = document.createElement("template");
  template.innerHTML = safeMdToHtml(str);
  newContent.appendChild(template.content);

  // Add back again at the end.
  newContent.appendChild(document.createElement("br"));
  const bottomRow = row.cloneNode(true);
  bottomRow.firstElementChild.onclick = back.onclick;
  bottomRow.lastElementChild.onclick = download.onclick;
  newContent.appendChild(bottomRow);

  content.onanimationend = event => {
    if (event.target !== content) return; // ignore bubbled events from children

    if (content.classList.contains("page-exit")) {
      content.classList.remove("page-exit");
      void content.offsetWidth; // force reflow
      
      // Stop progressive display animation and instead instant display.
      GLOBALS.stopDisplay && GLOBALS.stopDisplay();
      instantDisplay(content);

      requestAnimationFrame(() => {
        // Create current sub-tree container.
        current = document.createDocumentFragment();
        for (let i = 0, children = content.childNodes, l = children.length; i !== l; ++i) {
          current.appendChild(children[i]);
        }

        // Replace current with new sub-tree.
        content.innerHTML = ""; // Make sure it's empty.
        content.appendChild(newContent);
        content.scrollTo({
          top: 0,
          behavior: "instant"
        });
        content.classList.add("page-enter");
      })
    }
  }
  content.classList.remove("page-enter");
  content.classList.add("page-exit");
}