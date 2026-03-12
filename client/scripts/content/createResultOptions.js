"use strict";

import { createResultOption } from "./createResultOption.js";
import { sendFeedback } from "./sendFeedback.js";
import { DOM } from "../cachedDomReferences.js";

// Destructure DOM elements.
const { form, input } = DOM;

/**
 * @function createResultOptions
 * @description
 * Builds and returns the action bar rendered at the bottom of a query
 * answer card. The bar is a container `<div>` holding a configurable set
 * of action buttons — copy, thumbs up, thumbs down, share, and retry —
 * each conditionally included based on the `options` argument.
 *
 * Options are controlled by a flexible flag system: setting `all: true`
 * enables every button at once, while individual flags (`copy`, `thumbsUp`,
 * etc.) allow fine-grained control. `feedback: true` is a convenience alias
 * that enables both `thumbsUp` and `thumbsDown` together. Individual flags
 * take precedence over `all` if explicitly provided.
 *
 * Each button is built via `createResultOption`, which handles template
 * caching and icon/label rendering. Buttons that depend on browser APIs
 * (`navigator.clipboard` for copy, `navigator.share` for share) are only
 * appended when the relevant API is available, ensuring graceful degradation
 * on unsupported platforms.
 *
 * @param {Object} item
 * The result object for the answer being displayed. Passed through to
 * `sendFeedback` and used to extract the question text for copy and retry
 * actions (`item.qa.question.main || item.qa.question`).
 *
 * @param {Object} summary
 * The query summary object. Passed through to `sendFeedback` to associate
 * feedback with the correct query context.
 *
 * @param {Object} [options]
 * Feature flags controlling which buttons are rendered.
 *
 * @param {boolean} [options.all=false]
 * Master switch. When `true`, enables all buttons unless individually
 * overridden.
 *
 * @param {boolean} [options.feedback=all]
 * Enables both `thumbsUp` and `thumbsDown` when `true`. Defaults to the
 * value of `all`.
 *
 * @param {boolean} [options.thumbsUp=feedback]
 * Individually controls the thumbs-up button. Defaults to `feedback`.
 *
 * @param {boolean} [options.thumbsDown=feedback]
 * Individually controls the thumbs-down button. Defaults to `feedback`.
 *
 * @param {boolean} [options.copy=all]
 * Controls the copy-to-clipboard button. Only rendered if
 * `navigator.clipboard` is available. Defaults to `all`.
 *
 * @param {boolean} [options.share=all]
 * Controls the native share button. Only rendered if `navigator.share`
 * is available. Defaults to `all`.
 *
 * @param {boolean} [options.retry=all]
 * Controls the retry button, which repopulates the input with the question
 * and refocuses the textarea. Defaults to `all`.
 *
 * @returns {HTMLDivElement}
 * A `<div class="qa-result-options liquid-glass">` element containing the
 * configured action buttons, ready to be appended to a result card.
 *
 * @example
 * // Render all options for a successful result:
 * const optionsBar = createResultOptions(best, summary, { all: true });
 * html.appendChild(optionsBar);
 *
 * @example
 * // Render only feedback buttons:
 * const optionsBar = createResultOptions(best, summary, { feedback: true });
 *
 * @notes
 * - The share payload includes a branded Unicode title and a formatted
 *   Q&A text body with contact information. Update the hardcoded phone
 *   number and domain if the contact details change.
 * - `navigator.share` is not available in all browsers (notably desktop
 *   Chrome and Firefox as of 2025); the share button will be silently
 *   omitted in those environments.
 */
export const createResultOptions = (item, summary, options) => {

  // Collect the options to display.
  const {
    all = false,
    feedback = all,
    retry = all,
    copy = all,
    share = all,
    thumbsUp = feedback,
    thumbsDown = feedback
  } = options || {};

  // Create container.
  const container = document.createElement("div");
  container.setAttribute("class", "qa-result-options liquid-glass");

  // Copy.
  copy && navigator.clipboard && container.appendChild(createResultOption({
    src: "./assets/icons/copy.svg",
    checkSrc: "./assets/icons/check.svg",
    onclick: async event => {
      event.stopPropagation();
      const q = item.qa.question.main || item.qa.question;
      q && (await navigator.clipboard.writeText(q));
    },
    title: "Copy this question to clipboard"
  }));

  // Thumbs Up.
  thumbsUp && container.appendChild(createResultOption({
    src: "./assets/icons/thumb-up.svg",
    checkSrc: "./assets/icons/check.svg",
    onclick: event => {
      event.stopPropagation();
      // Send feedback here.
      sendFeedback("positive", item, summary);
    },
    title: "Click to send positive feedback"
  }));

  // Thumbs down.
  thumbsDown && container.appendChild(createResultOption({
    src: "./assets/icons/thumb-down.svg",
    checkSrc: "./assets/icons/check.svg",
    onclick: event => {
      event.stopPropagation();
      // Send feedback here.
      sendFeedback("negative", item, summary);
    },
    title: "Click to send negative feedback"
  }));

  // Share.
  share && navigator.share && container.appendChild(createResultOption({
    src: "./assets/icons/share.svg",
    onclick: async event => {
      event.stopPropagation();
      try {
        const q = item.qa.question.main || item.qa.question;
        const technical = item.qa.answer.technical || item.qa.answer;
        const plain = item.qa.answer.plain || technical;
        const url = `asknereus.com${summary && summary.query && `/?query=${encodeURIComponent(summary.query)}` || ""}`;
        await navigator.share({
          title: "🔱 𝘍𝘳𝘰𝘮 𝘕𝘦𝘳𝘦𝘶𝘴\n",
          text: `𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻:\n\n${q}\n\n𝗔𝗻𝘀𝘄𝗲𝗿:\n\n${plain}\n\nℹ️  For more information, contact us at:\n+1 (925) 470-0491\nor visit:\n${url}`,
          // url, // URL to share (current page in this example)
        });
        console.log("Data was shared successfully");
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Share failed:", err.message);
        }
      }
    },
    title: "Click to share"
  }));

  // Retry.
  retry && container.appendChild(createResultOption({
    src: "./assets/icons/retry.svg",
    checkSrc: "./assets/icons/check.svg",
    onclick: event => {
      event.stopPropagation();
      const q = item.qa.question.main || item.qa.question;
      q && (
        form.removeAttribute("empty"),
        input.value = q,
        input.oninput(),
        input.focus()
      );
    },
    title: "Click to query with this question"
  }));

  return container;
}