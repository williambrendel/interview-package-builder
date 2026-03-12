"use strict";

import { progressiveDisplay } from "../progressiveDisplay.js";
import { DOM } from "../cachedDomReferences.js";
import { GLOBALS } from "../globals.js";
import { createResultOptions } from "./createResultOptions.js";
import { onContentChange } from "./onContentChange.js";
import { createContactUs } from "./createContactUs.js";
import { createFileButton } from "./createFileButton.js";
import { renderSection } from "./renderSection.js"

// Destructure DOM elements.
const { content } = DOM;

/**
 * @function renderResults
 * @description
 * Primary result renderer for the interview package builder. Receives the
 * parsed LLM response, builds a fully structured result card as a DOM tree,
 * and hands it off to {@link progressiveDisplay} for an animated reveal into
 * the `content` container.
 *
 * **Result card structure (success path):**
 * ```
 * div.chat-qa
 * ├── h1.title               "Let's Get You Hired"
 * ├── h2                     "Hi {name}!"
 * ├── span                   Intro / upsell copy
 * ├── br
 * ├── button.file            Analysis & Suggestions  (if present)
 * ├── button.file            Resume                  (if present)
 * ├── button.file            Cover Letter            (if present)
 * ├── button.file            Professional Summary    (if present)
 * ├── button.file            For LinkedIn            (if present)
 * └── button.contact-us      HR expert upsell banner
 * ```
 *
 * **Error path:**
 * If `data.error` is truthy, a single error card is rendered with a randomly
 * selected humorous heading and the error message as body text. No file
 * buttons or upsell banner are shown.
 *
 * **Name resolution:**
 * The greeting resolves the candidate's name from the LLM output via a
 * priority chain: `first_name + middle_name + last_name` → `full_name` →
 * `name`. Falls back to `"there"` if no name fields are present.
 *
 * **Field aliasing:**
 * Several LLM output fields are aliased for convenience:
 * | Alias            | Source field           |
 * |------------------|------------------------|
 * | `resume`         | `resume_markdown`      |
 * | `summary`        | `professional_summary` |
 * | `cover_letter`   | `cover_letter_markdown`|
 * | `cover`          | `cover_letter`         |
 *
 * @param {Object}  data                          - Parsed JSON response from the LLM endpoint.
 * @param {string}  [data.error]                  - Error message. If truthy, renders an error card.
 * @param {string}  [data.analysis]               - Markdown analysis of the original resume.
 * @param {string}  [data.suggestions]            - Markdown action plan derived from the analysis.
 * @param {string}  [data.resume_markdown]        - Full ATS-optimized resume in Markdown.
 * @param {string}  [data.professional_summary]   - 3-line professional summary hook.
 * @param {string}  [data.cover_letter_markdown]  - Tailored cover letter in Markdown, or null.
 * @param {string}  [data.linkedin]               - LinkedIn profile URL, or null.
 * @param {string}  [data.linkedin_improvements]  - Markdown LinkedIn improvement suggestions.
 * @param {string}  [data.first_name]             - Candidate first name.
 * @param {string}  [data.middle_name]            - Candidate middle name.
 * @param {string}  [data.last_name]              - Candidate last name.
 * @param {string}  [data.full_name]              - Pre-composed full name (overrides first/middle/last).
 * @param {string}  [data.name]                   - Alias for `full_name` (lowest priority).
 *
 * @returns {Function}
 * The `cancel` function returned by {@link progressiveDisplay}. Should be
 * assigned to `GLOBALS.stopDisplay` by the caller so the render can be
 * interrupted if needed.
 *
 * @example
 * GLOBALS.stopDisplay = renderResults(data);
 *
 * @see {@link createFileButton}  for individual downloadable content cards.
 * @see {@link createContactUs}   for the HR expert upsell banner.
 * @see {@link renderSection}     for heading + Markdown fragment rendering.
 * @see {@link progressiveDisplay} for the animated DOM reveal mechanism.
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