"use strict"

import { DOM } from "../cachedDomReferences.js";

// Destructure DOM elements.
const { body } = DOM;

/**
 * @function isThinking
 * @description
 * Determines whether the application is currently in the "thinking" state
 * by inspecting the presence of the `thinking` attribute on the document
 * body element.
 *
 * The thinking state is a DOM-driven boolean flag: it is set by
 * `startThinking` via `body.setAttribute("thinking", "")` and cleared by
 * `stopThinking` via `body.removeAttribute("thinking")`. This approach
 * allows CSS to react to the state directly (e.g., showing a loading
 * animation) while keeping the state check dependency-free and
 * synchronous.
 *
 * Intended to be used as a guard in asynchronous callbacks — for example,
 * to bail out of a query resolution if the user has already cancelled or
 * submitted a new query before the response arrived.
 *
 * @returns {boolean}
 * `true` if the `thinking` attribute is present on `<body>`, indicating
 * an in-progress query; `false` otherwise.
 *
 * @example
 * if (!isThinking()) return; // Discard stale async response
 */
export const isThinking = () => body.hasAttribute("thinking");