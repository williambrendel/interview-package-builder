"use strict";

import { progressiveDisplay } from "../progressiveDisplay.js";
import { GLOBALS } from "../globals.js";
import { DOM } from "../cachedDomReferences.js";
import { onContentChange } from "./onContentChange.js";

// Destructure DOM elements.
const { content } = DOM;

/**
 * @function renderError
 * @description
 * Renders a fetch or server error into the content area using
 * `progressiveDisplay`, providing the same animated reveal behaviour as
 * a successful result. Called from the `.catch` handler in `query.js`
 * after `stopThinking` has already cleared the content area and the
 * thinking state.
 *
 * The error is coerced to a string via template literal interpolation,
 * so it handles both `Error` objects (via their `.toString()` / `message`)
 * and raw string errors (as thrown by the HTTP error branch in `query.js`,
 * e.g. `"Status: 500\nData: ..."` ).
 *
 * Returns the `cancel` handle from `progressiveDisplay` so the caller can
 * assign it to `GLOBALS.stopDisplay`, allowing the stop button to interrupt
 * an error render just as it would a normal result render.
 *
 * @param {string|Error} error
 * The error to display. String errors are rendered as-is; `Error` objects
 * are coerced to their string representation.
 *
 * @returns {Function}
 * The `cancel` function returned by `progressiveDisplay`. Should be
 * assigned to `GLOBALS.stopDisplay` by the caller so that the render
 * can be interrupted if needed.
 *
 * @example
 * .catch(error => {
 *   console.error("Error:", error);
 *   stopThinking();
 *   GLOBALS.stopDisplay = renderError(error);
 * });
 */
export const renderError = error => {
  return progressiveDisplay(
    (error && `${error}` || "").toLowerCase().includes("!doctype") && error
    || `<div class="chat-qa error">
      <img src="../assets/icons/error.svg" />
      ${error}
    </div>`,
    content,
    { onDone: GLOBALS.endDisplay, onChange: onContentChange }
  );
}