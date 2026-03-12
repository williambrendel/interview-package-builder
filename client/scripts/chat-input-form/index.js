"use strict"

import { DOM } from "../cachedDomReferences.js";
import { progressiveDisplay } from "../progressiveDisplay.js";
import { stopThinking } from "./stopThinking.js";
import { startThinking } from "./startThinking.js";
import { query } from "./query.js";
import { resize } from "./resize.js";
import { filePicker } from "./filePicker.js";
import { GLOBALS } from "../globals.js";
import "./dragAndDropFiles.js"

// Destructure DOM elements.
const {
  input,
  form,
  chatContainer,
  menuButton,
  stopButton,
  content,
  body
} = DOM;

/**
 * @description
 * Entry point for the chat input form module. Binds all event listeners
 * required for the chat interface to function, including stop/cancel
 * behaviour, the options menu toggle, textarea auto-resize, keyboard
 * shortcuts, and form submission.
 *
 * This module has no exported members — it operates entirely through DOM
 * side effects and is intended to be imported once at application
 * initialisation time.
 */

// --------------------------------------------------------------------------
// Stop button
// --------------------------------------------------------------------------

/**
 * @description
 * Handles clicks on the stop button. Cancels any in-progress query or
 * progressive display, then renders a short prompt inviting the user to
 * ask another question. `event.stopPropagation()` prevents the click from
 * bubbling to the body handler, which would otherwise close the menu.
 *
 * `GLOBALS.stopDisplay` is set to the cancel handle returned by
 * `progressiveDisplay` so that this new render can itself be interrupted
 * if needed.
 */
stopButton.onclick = event => {
  event.stopPropagation();

  stopThinking();
  GLOBALS.stopDisplay = progressiveDisplay(
    "<span>If there's anything else you want to know, ask away!</span>",
    content,
    { onDone: GLOBALS.endDisplay }
  );
}

// --------------------------------------------------------------------------
// Menu dismissal
// --------------------------------------------------------------------------

/**
 * @description
 * Closes the chat options menu when the user clicks anywhere on the body
 * or form that is not the menu button. Both `body.onclick` and
 * `form.onclick` are assigned the same handler. `event.stopPropagation()`
 * is included to prevent unintended bubbling side effects within the form.
 */
body.onclick =
form.onclick = event => (
  event.stopPropagation(),
  chatContainer.removeAttribute("menu-visible")
);

// --------------------------------------------------------------------------
// Textarea resize + layout logic
// Handles:
// - enabling/disabling send button
// - switching to multiline layout
// - auto-growing textarea height
// --------------------------------------------------------------------------

/**
 * @description
 * Triggers `resize()` on every `input` event so the textarea grows or
 * shrinks in real time as the user types or deletes text.
 */
input.oninput = resize;

/**
 * @description
 * Re-evaluates the textarea layout on viewport resize events (e.g., device
 * rotation or browser window resizing) to ensure the multiline breakpoint
 * calculation remains accurate.
 */
window.addEventListener("resize", resize);

/**
 * @description
 * Performs an initial layout synchronisation after the first paint. Uses
 * `requestAnimationFrame` to ensure DOM measurements are available.
 * Initialises the `rows` attribute to `1` if not already set, then calls
 * `resize()` to establish the correct starting height and empty state.
 */
requestAnimationFrame(() => (
  input.setAttribute("rows", input.getAttribute("rows") || 1),
  resize()
));

// --------------------------------------------------------------------------
// Keyboard behaviour
// Enter sends, Shift+Enter inserts newline
// --------------------------------------------------------------------------

/**
 * @description
 * Intercepts `Enter` keydown events on the textarea. A plain `Enter`
 * programmatically submits the form; `Shift+Enter` is allowed to pass
 * through, inserting a newline as expected. `preventDefault` suppresses
 * the default newline insertion on plain `Enter`.
 */
input.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.dispatchEvent(new Event("submit"));
  }
});

// --------------------------------------------------------------------------
// File picker
// --------------------------------------------------------------------------
menuButton.addEventListener("click", filePicker);

// --------------------------------------------------------------------------
// Form submission handler
// --------------------------------------------------------------------------

/**
 * @description
 * Handles form submission triggered either by the send button or by the
 * `Enter` keyboard shortcut. Trims the input value and, if non-empty:
 *
 * 1. Removes the `welcome` attribute from the content container, hiding
 *    any initial welcome/placeholder UI.
 * 2. Calls `startThinking()` to immediately enter the loading state and
 *    provide visual feedback.
 * 3. Dispatches the message to `query()` for server-side processing.
 *
 * Empty submissions (whitespace-only input) are silently ignored.
 */
form.addEventListener("submit", event => {
  event.preventDefault();

  // Get message.
  const message = input.value.trim();

  // Send message to server.
  if (message || GLOBALS.attachedFiles.size > 0) {
    // Remove welcome message.
    content.removeAttribute("welcome");
    message && console.log("Sending message:", message);

    GLOBALS.attachedFiles.size > 0 &&
      console.log(
        "Sending files:",
        Array.from(GLOBALS.attachedFiles.values()).map(f => f.name)
      );

    // Toggle thinking.
    startThinking();

    // 1. Create a FormData instance.
    const formData = new FormData();

    // 2. Append the files and the message (and any other metadata).
    formData.append("message", message);
    console.log(GLOBALS.attachedFiles, GLOBALS.attachedFiles.length);
    for (const [_, file] of GLOBALS.attachedFiles) {
      formData.append("files", file);
    }

    // Query + resolution.
    query(formData);
    // query.simulate();
  }
});