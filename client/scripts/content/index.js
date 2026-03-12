"use strict"

import { progressiveDisplay } from "../progressiveDisplay.js";
import { DOM } from "../cachedDomReferences.js";
import { API } from "../api.js";
import { GLOBALS } from "../globals.js";
import { createWelcomeElement } from "./createWelcomeElement.js";

// Destructure DOM elements.
const { content, input, form } = DOM;

/**
 * @file content/index.js
 * @description
 * Entry point for the content display module. Initialises the content area
 * with the welcome screen on load, then binds the scroll event listener
 * that drives the auto-scroll suppression logic used during progressive
 * rendering.
 *
 * This module has no exported members — it operates entirely through DOM
 * side effects and is intended to be imported once at application startup
 * via the root `index.js`.
 */

// --------------------------------------------------------------------------
// Welcome screen initialisation
// --------------------------------------------------------------------------

/**
 * @description
 * Clears the content area and immediately begins a progressive reveal of
 * the welcome element. `delay: 0` removes the inter-character typing delay
 * so the element appears as a single unit, while `fadeInDelay: 1000`
 * defers the CSS fade-in by one second, giving other startup transitions
 * (such as the body `loading` attribute removal) time to complete first.
 * `keepSpace: true` preserves whitespace within the element during display.
 */
content.innerHTML = "";
const params = new URLSearchParams(window.location.search);
const md = params.get("md") || "";
const query = params.get("query") || "";
if (md) {
  fetch(API.markdownUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: decodeURIComponent(md)
    })
  })
  .then(response => {
    if (response.ok) return response.json();
    // Parse the body (e.g., as JSON) and then throw it
    return response.text().then(errorData => {
      throw `Status: ${response.status}\nData: ${errorData}`;
    });
  })
  .then(({ content: text } = {}) => {
    requestAnimationFrame(() => {
      content.removeAttribute("welcome");
      content.innerHTML = `<div class="chat-qa">${mdToHtml(text)}</div>`;
    });
  })
  .catch (error => {
    console.error("Error:", error);
  });
} else if (query) {
  input.value = decodeURIComponent(query);
  input.oninput();
  form.dispatchEvent(new Event("submit"));
} else {
  progressiveDisplay(createWelcomeElement(), content, { delay: 0, fadeInDelay: 1000, keepSpace: true });
}

// --------------------------------------------------------------------------
// Scroll position tracking
// --------------------------------------------------------------------------

/**
 * @description
 * Tracks the user's scroll position within the content area and updates
 * `GLOBALS.userScrolling` to control whether `onContentChange` should
 * auto-scroll to the bottom during a progressive render.
 *
 * Two conditions are evaluated on each scroll event:
 *
 * **Near the bottom** (`distanceToBottom < 20` and scroll moved down or
 * stayed still): Sets `GLOBALS.userScrolling = false`, re-enabling
 * auto-scroll. The 20px threshold provides a small tolerance so that
 * users who are nearly at the bottom are not left behind as new content
 * streams in.
 *
 * **Scrolled up** (`GLOBALS.scrollTop > scrolledFromTop`): Sets
 * `GLOBALS.userScrolling = true`, suppressing auto-scroll and preserving
 * the user's reading position.
 *
 * `GLOBALS.scrollTop` is updated on every scroll event to provide a
 * reference for the direction check on the next event.
 *
 * @notes
 * - The direction check uses `GLOBALS.scrollTop` (not a bare `scrollTop`
 *   variable) to access the previously stored value. Using the bare
 *   identifier would reference `undefined` and break the upward-scroll
 *   detection.
 * - The threshold of `20px` for "near bottom" is a UX heuristic. Tighten
 *   it to `0` for strict bottom-only auto-scroll, or increase it if users
 *   report being pulled to the bottom while still reading.
 */
content.addEventListener("scroll", () => {
  const totalHeight = content.scrollHeight;       // Total content height
  const scrolledFromTop = content.scrollTop;      // Pixels hidden at top
  const visibleHeight = content.clientHeight;     // Visible height of box

  // Distance remaining to the bottom
  const distanceToBottom = totalHeight - scrolledFromTop - visibleHeight;

  // Logic: "If less than 20px from bottom, do something"
  if (distanceToBottom < 20 && GLOBALS.scrollTop <= scrolledFromTop) {
    GLOBALS.userScrolling = false;
  } else if (GLOBALS.scrollTop && GLOBALS.scrollTop > scrolledFromTop) {
    GLOBALS.userScrolling = true;
  }

  // Update scrollTop.
  GLOBALS.scrollTop = scrolledFromTop;
});