"use strict"

import { DOM } from "../cachedDomReferences.js";
import { GLOBALS } from "../globals.js";

// Destructure DOM elements.
const {
  input,
  form,
  leftActions,
  rightActions
} = DOM;

/**
 * @function resize
 * @description
 * Synchronises the textarea's visual state and the form's layout class with
 * the current input content. Should be called on every `input` event, on
 * `window` resize, and once after the first paint to ensure the initial
 * layout is correct.
 *
 * Manages three distinct concerns in a single pass:
 *
 * **1. Empty state toggling**
 * Adds or removes the `empty` attribute on the form element based on
 * whether the textarea has content. This attribute is used by CSS (and
 * potentially other logic) to enable or disable the send button — the
 * button should only be interactive when there is text or an attached file
 * to submit.
 *
 * **2. Multiline layout switching**
 * Adds the `multiline` CSS class to the form when the textarea's scroll
 * height exceeds its client height, indicating that content has wrapped
 * onto more than one line. The class is removed again once the content
 * fits within a single line, using a heuristic based on character count
 * and available horizontal space (accounting for left/right action button
 * widths and a fixed padding allowance of 16px). The character-width
 * multiplier of `12` is an approximation of average character width in
 * pixels for the textarea's font.
 *
 * **3. Auto-height growth**
 * Resets the textarea's `height` to `"auto"` before applying
 * `scrollHeight` as the explicit pixel height. The reset step is necessary
 * to allow the element to shrink back when content is deleted; without it,
 * the height would only ever grow.
 *
 * @returns {void}
 *
 * @example
 * input.oninput = resize;
 * window.addEventListener("resize", resize);
 * requestAnimationFrame(resize); // Initial sync
 *
 * @notes
 * - The character-width heuristic (`length * 12`) is an approximation and
 *   may need tuning if the textarea font size or family changes.
 * - This function reads several layout properties (`scrollHeight`,
 *   `clientHeight`, `clientWidth`) and therefore triggers a layout
 *   reflow. Avoid calling it in tight loops or inside `requestAnimationFrame`
 *   callbacks that run continuously.
 */
export const resize = () => {
  // Toggle "empty" state:
  // Send button should only activate when text or files exist
  GLOBALS.attachedFiles.size || (
    input.value
      ? form.removeAttribute("empty")
      : form.setAttribute("empty", "")
  );

  // Enable multiline layout if content exceeds one line
  input.scrollHeight > input.clientHeight &&
    form.classList.add("multiline");

  // Collapse back to single-line layout when text fits again
  (input.value.length * 12 <
    form.clientWidth -
    leftActions.clientWidth -
    rightActions.clientWidth -
    16) &&
    form.classList.remove("multiline");

  // Auto-resize textarea height to fit content
  input.style.height = "auto";                 // Reset first
  input.style.height = input.scrollHeight + "px"; // Then grow
};