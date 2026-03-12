"use strict"

import { createThinkingElement } from "./createThinkingElement.js";
import { DOM } from "../cachedDomReferences.js";

// Destructure DOM elements.
const { body, content } = DOM;

/**
 * @function startThinking
 * @description
 * Transitions the application into the "thinking" state in response to a
 * new query submission. Performs three coordinated side effects:
 *
 * 1. **Sets the thinking flag** — adds the `thinking` attribute to
 *    `<body>`, enabling CSS-driven UI changes (e.g., disabling the input,
 *    showing stop controls) and providing a queryable state for async
 *    guards via `isThinking()`.
 *
 * 2. **Clears the content area** — wipes any previously rendered response
 *    from the content container so the loader renders into a clean slate.
 *
 * 3. **Injects the loader element** — appends the thinking indicator
 *    produced by `createThinkingElement` into the content container,
 *    providing immediate visual feedback to the user.
 *
 * This function is the counterpart to `stopThinking`, which reverses all
 * three effects. It should be called synchronously at the point of query
 * dispatch, before any async operation begins.
 *
 * @param {string} [text]
 * Optional label to display in the thinking indicator (e.g., "Searching…").
 * Passed directly to `createThinkingElement`. Defaults to "Thinking…" if
 * omitted.
 *
 * @returns {void}
 *
 * @example
 * startThinking();          // Shows default "Thinking…" indicator
 * startThinking("Loading…") // Shows custom label
 *
 * @notes
 * - Uses the comma operator to chain three expressions as a single arrow
 *   function body — functionally equivalent to a sequential block with
 *   three statements.
 * - Directly setting `content.innerHTML = ""` is intentional for
 *   performance; it avoids iterating child nodes for a container that is
 *   always fully replaced on each query cycle.
 */
export const startThinking = text => (
  // Set the thinking state.
  body.setAttribute("thinking", ""),
  content.innerHTML = "",
  content.appendChild(createThinkingElement(text))
);