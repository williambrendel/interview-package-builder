"use strict"

import { DOM } from "../cachedDomReferences.js";
import { resize } from "./resize.js";
import { GLOBALS } from "../globals.js";

// Destructure DOM elements.
const { input, form, chatFiles } = DOM;

/**
 * @function resetForm
 * @description
 * Restores the chat input form to its default empty state after a query has
 * been dispatched. Called immediately upon receiving a response (or
 * simulated response) so that the user can begin composing a follow-up
 * message without waiting for the answer to finish rendering.
 *
 * Performs three side effects:
 *
 * 1. **Clears the textarea** — sets `input.value` to an empty string,
 *    removing the submitted message text.
 *
 * 2. **Re-evaluates layout** — calls `resize()` to synchronise the
 *    textarea height and form layout class with the now-empty value.
 *    Without this step the textarea would retain the height it grew to
 *    while the user was typing.
 *
 * 3. **Resets file attachment state** — sets the `empty` attribute on the
 *    form, signalling that no files are attached. This disables the send
 *    button and resets any file-related UI managed via CSS attribute
 *    selectors.
 *
 * @returns {void}
 *
 * @example
 * // Typical usage inside a query resolution callback:
 * resetForm();
 * if (!isThinking()) return;
 * stopThinking();
 * GLOBALS.stopDisplay = renderResults(data, GLOBALS.endDisplay);
 *
 * @notes
 * - `resize()` is called *before* the `empty` attribute is set. The
 *   attribute is therefore set redundantly after resize, which also sets it
 *   when `input.value` is falsy — this is intentional to guarantee the
 *   attribute is present even if `resize` behaviour changes in the future.
 */
export const resetForm = () => {
  // Reset input.
  input.value = "";
  input.blur();
  chatFiles.innerHTML = "";
  GLOBALS.attachedFiles.clear();
  resize();

  // Clear file state.
  form.setAttribute("empty", "");
}