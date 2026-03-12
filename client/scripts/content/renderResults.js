"use strict";

import { progressiveDisplay, instantDisplay } from "../progressiveDisplay.js";
import { DOM } from "../cachedDomReferences.js";
import { API } from "../api.js";
import { GLOBALS } from "../globals.js";
import { safeMdToHtml } from "./safeMdToHtml.js";
import { createResultOptions } from "./createResultOptions.js";
import { onContentChange } from "./onContentChange.js";

// Destructure DOM elements.
const { content, input, form } = DOM;

/**
 * @function renderResults
 * @description
 * The primary result renderer for the chat interface. Receives the parsed
 * server response, builds a fully structured result card as a DOM tree,
 * and hands it off to `progressiveDisplay` for an animated reveal into the
 * content area.
 *
 * The card's content is determined by `summary.statusCode`, which the
 * server uses to signal the quality of the match found:
 *
 * | Code | Meaning              | UI behaviour                                      |
 * |------|----------------------|---------------------------------------------------|
 * | `1`  | Perfect match        | Shows question, answer, options, and related Qs   |
 * | `2`  | Ambiguous result     | Adds clarification prompt above the answer        |
 * | `3`  | No answer found      | Shows an error card with a reformulation suggestion|
 * | `4`  | Query too vague      | Shows a vague-input card with alternative Qs      |
 * | `5`  | Second-pass result   | Same layout as `2` with different intro copy      |
 *
 * Cases `2`, `5`, `1`, and the `default` fall through a shared code path
 * (via `switch` fall-through) that renders the full answer card. Cases `3`
 * and `4` have their own dedicated card layouts and do not fall through.
 *
 * Interactive elements (suggestion buttons, "You May Also Like" buttons,
 * the retry-via-clarification button) are wired with `onclick` handlers
 * that repopulate the input field and programmatically submit the form,
 * allowing one-click query refinement.
 *
 * @param {Object} data
 * The parsed JSON response from the server.
 *
 * @param {Object} [data.best]
 * The top-ranked result object. Contains a `qa` property with nested
 * `question` (`{ main }`) and `answer` (`{ plain, technical }`) fields.
 *
 * @param {Object} [data.summary]
 * Metadata about the query resolution.
 *
 * @param {string} [data.summary.query]
 * The original user query string, shown in blockquotes on non-perfect-match
 * cards.
 *
 * @param {number} [data.summary.statusCode]
 * Server-assigned match quality code. See the table above.
 *
 * @param {string} [data.summary.bestQuestion]
 * The closest matching question found in the knowledge base. Used as the
 * text for suggestion buttons on status `3`, `4`, `2`, and `5` cards.
 *
 * @param {Array}  [data.other=[]]
 * Array of additional result objects. Rendered as "You May Also Like"
 * buttons on status `1`/`2`/`5` cards (up to 5) and as alternative
 * suggestion buttons on status `4` cards (up to 4).
 *
 * @returns {Function}
 * The `cancel` function returned by `progressiveDisplay`. Should be
 * assigned to `GLOBALS.stopDisplay` by the caller so that the render
 * can be interrupted by the stop button.
 *
 * @example
 * GLOBALS.stopDisplay = renderResults(data);
 *
 * @notes
 * - `mdToHtml` is a global function attached to `window` via a `<script>`
 *   tag in `index.html`. It does not need to be imported — it is available
 *   in all module contexts through the global scope.
 * - The `switch` statement uses intentional fall-through from cases `2`
 *   and `5` into `1` and `default`. If new status codes are added, take
 *   care to add explicit `break` statements where fall-through is not
 *   desired.
 * - Contact details (phone number, SMS URL) are hardcoded in several card
 *   variants and should be centralised in a config if they are subject to
 *   change.
 */
export const renderResults = data => {
  const {
    error,
    analysis,
    suggestions,
    resume_markdown,
    resume = resume_markdown,
    professional_summary,
    summary = professional_summary,
    cover_letter_markdown,
    cover_letter = cover_letter_markdown,
    cover = cover_letter,
    linkedin_improvements,
    linkedin,
    first_name,
    first = first_name,
    middle_name,
    middle = middle_name,
    last_name,
    last = last_name,
    full_name = [first, middle, last].filter(x => x).join(" "),
    name = full_name
  } = data;

  // Result card.
  const html = document.createElement("div");
  html.setAttribute("class", "chat-qa");

  // Error.
  if (error) {
    const text = [
      "Uh Oh…",
      "Dang it!",
      "Hmm…",
      "Nothing surfaced",
      "Lost at sea",
      "Crickets…",
      "Nope…",
      "Not a clue"
    ];
    html.appendChild(renderSection(text[Math.floor(Math.max(Math.random() * text.length - 0.0001, 0))], error));
  } else {

    // Analysis, resume and other.
    html.appendChild(renderSection("Let's Get You Hired"));
    html.appendChild(document.createElement("h2")).textContent = `Hi ${name || "there"}!`;
    html.appendChild(document.createElement("span")).textContent = "Everything you need to ace your interview is below. Want to go further? Talk to one of our HR experts for personalized coaching and offer negotiation support.";
    html.appendChild(document.createElement("br"));
    let analysisAndSuggestions = "", analysisAndSuggestionsTitle = "";
    analysis && (
      analysisAndSuggestions += `# Analysis\n\n${analysis}\n\n`,
      analysisAndSuggestionsTitle += "Analysis"
    );
    suggestions && (
      analysisAndSuggestions += `# Suggestions\n\n${suggestions}`,
      analysisAndSuggestionsTitle += analysisAndSuggestionsTitle && " & Suggestions" || "Suggestions"
    );
    analysisAndSuggestions && html.appendChild(createFileButton(analysisAndSuggestionsTitle, analysisAndSuggestions, `${analysisAndSuggestionsTitle.toLowerCase().replace(/[\s\&]+/g,"_")}.pdf`));
    resume && html.appendChild(createFileButton("Resume", resume, "corrected_resume.pdf"));
    cover && html.appendChild(createFileButton("Cover Letter", `# Cover Letter\n\n${cover}`, "cover_letter.pdf"));
    summary && html.appendChild(createFileButton("Professional Summary", `# Professional Summary\n\n${summary}`, "professional_summary.pdf"));
    linkedin && html.appendChild(createFileButton("For LinkedIn", `# LinkedIn Improvements\n\n**LinkedIn username:** [${linkedin}](${linkedin})\n\n${linkedin_improvements}`, "for_linkedin.pdf"));

    // Expert.
    html.appendChild(createContactUs());

    // Analysis.
    // analysis && html.appendChild(renderSection("Analysis", analysis));

    // Suggestions.
    // suggestions && html.appendChild(renderSection("Suggestions", suggestions));

    // Add options.
    // elmt = document.createElement("div");
    // elmt.setAttribute("class", "qa-result-options-container");
    // elmt.appendChild(createResultOptions(best, summary, { all: true }));
    // html.appendChild(elmt);
  }
  
  return progressiveDisplay(
    html,
    content,
    { onDone: GLOBALS.endDisplay, onChange: onContentChange }
  );
}

const renderSection = (title, text, flag) => {
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

const createOnContent = (str, filename) => event => {
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

const createFileButton = (title, text, filename) => {
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

const createDownloadButton = (md, filename) => {
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

const createContactUs = id => {
  id === undefined && (id = Math.round(Math.random() * 6));
  const html = document.createElement("button");
  html.setAttribute("class", "liquid-glass contact-us");
  html.appendChild(document.createElement("img")).setAttribute("src", `../assets/expert-${id}.png`);
  const elmt = html.appendChild(document.createElement("div"));
  elmt.appendChild(document.createElement("span")).textContent = "You've got the package. Let's get you the offer.";
  elmt.appendChild(document.createElement("span")).textContent = "Talk to one of our HR experts";
  return html;
}