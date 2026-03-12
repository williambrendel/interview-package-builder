"use strict"

import { DOM } from "../cachedDomReferences.js";
import { GLOBALS } from "../globals.js";

// Destructure DOM elements.
const { body, content } = DOM;

/**
 * @function stopThinking
 * @description
 * Exits the "thinking" state and resets the content area, optionally
 * cancelling any in-progress `progressiveDisplay` operation. This is the
 * direct counterpart to `startThinking` and should be called whenever the
 * thinking state needs to be torn down — whether due to a completed query,
 * a failed request, or an explicit user cancellation via the stop button.
 *
 * Performs three coordinated side effects:
 *
 * 1. **Clears the thinking flag** — removes the `thinking` attribute from
 *    `<body>`, reversing CSS-driven UI states and causing `isThinking()`
 *    to return `false`.
 *
 * 2. **Clears the content area** — wipes the content container's innerHTML,
 *    removing the thinking indicator and any partial content that may have
 *    been injected.
 *
 * 3. **Cancels an active display** — if `GLOBALS.stopDisplay` holds a
 *    function reference (i.e., a `progressiveDisplay` cancel handle is
 *    active), it is invoked to halt the streaming render mid-sequence.
 *    The guard (`typeof ... === "function"`) ensures safety when called
 *    before any display has started or after one has already completed.
 *
 * @returns {void}
 *
 * @example
 * // Called on successful query resolution after response is ready:
 * stopThinking();
 * GLOBALS.stopDisplay = renderResults(data, GLOBALS.endDisplay);
 *
 * @example
 * // Called on fetch error to reset UI before rendering the error state:
 * stopThinking();
 * GLOBALS.stopDisplay = renderError(error, GLOBALS.endDisplay);
 *
 * @notes
 * - Uses the comma operator to chain three expressions as a single arrow
 *   function body.
 * - Does not reset `GLOBALS.stopDisplay` to `null` itself — that is the
 *   responsibility of `GLOBALS.endDisplay`, which is passed as the `onDone`
 *   callback to each `progressiveDisplay` call.
 */
export const stopThinking = () => (
  body.removeAttribute("thinking"),
  content.innerHTML = "",
  typeof GLOBALS.stopDisplay === "function" && GLOBALS.stopDisplay()
);