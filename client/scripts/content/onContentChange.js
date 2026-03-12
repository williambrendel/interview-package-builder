"use strict";

import { GLOBALS } from "../globals.js";
import { DOM } from "../cachedDomReferences.js";

// Destructure DOM elements.
const { content } = DOM;

/**
 * @function onContentChange
 * @description
 * Callback invoked whenever the content area changes during a progressive
 * display render (i.e., on each incremental content injection). Implements
 * an auto-scroll policy that keeps the latest content visible as it streams
 * in, while respecting an active user scroll so the reading position is
 * never forcibly overridden mid-read.
 *
 * When `GLOBALS.userScrolling` is `false` (the default — user is at or
 * near the bottom, or has not scrolled up), the content container is
 * scrolled to its bottom edge after each change. The scroll behaviour is
 * temporarily forced to `"auto"` (instant) before the `scrollTo` call and
 * reset afterward, overriding any CSS `scroll-behavior: smooth` that would
 * otherwise cause the container to lag behind fast-streaming content.
 *
 * When `GLOBALS.userScrolling` is `true`, the scroll call is skipped
 * entirely, preserving the user's current position.
 *
 * Intended to be passed as the `onChange` callback to `progressiveDisplay`.
 *
 * @returns {void}
 *
 * @example
 * GLOBALS.stopDisplay = progressiveDisplay(
 *   html,
 *   content,
 *   { onDone: GLOBALS.endDisplay, onChange: onContentChange }
 * );
 *
 * @notes
 * - `GLOBALS.userScrolling` is read directly from the `GLOBALS` object on
 *   each invocation rather than captured at import time. This ensures the
 *   latest value is always used, since the scroll event listener in
 *   `content/index.js` mutates `GLOBALS.userScrolling` asynchronously.
 *   Destructuring it at module load time would capture the initial `false`
 *   and never reflect subsequent updates — a subtle but critical
 *   distinction.
 * - The `scrollBehavior` override is necessary because `progressiveDisplay`
 *   may fire `onChange` many times per second; smooth scrolling would cause
 *   the view to perpetually chase the bottom without ever catching up.
 */
export const onContentChange = () => {
  // Smoothly scroll to the bottom
  GLOBALS.userScrolling || (
    content.style.scrollBehavior = "auto", // Override CSS
    content.scrollTo({
      top: content.scrollHeight,
      behavior: "auto"
    }),
    content.style.scrollBehavior = "" // Reset it
  );
}