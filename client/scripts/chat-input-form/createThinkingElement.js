"use strict";

let node = null;
let timers = [];

/**
 * @function createThinkingElement
 * @description
 * Creates and returns a DOM span containing the thinking-state loader UI
 * element. The element renders a pulsing indicator and a status label that
 * automatically updates at 30 seconds and 1 minute to reflect extended
 * wait times.
 *
 * Implements optional node reuse via a module-scoped element cache. On the
 * first call (or when `reuseNode` is `false`), a new `<span>` is created.
 * On subsequent calls with `reuseNode` enabled, the existing element is
 * reused — avoiding repeated DOM construction.
 *
 * Any previously scheduled message timers are cleared on each call to
 * prevent stale updates from a prior thinking state bleeding into a new one.
 *
 * @param {string} [text="Thinking…"]
 * The initial label text rendered beside the animated indicator.
 *
 * @param {boolean} [reuseNode=true]
 * When `true`, skips re-creating the element if one already exists in the
 * module cache. Set to `false` to force a fresh element.
 *
 * @returns {HTMLSpanElement}
 * A span element containing:
 * `<span class="thinking-loader"><b>●</b> <span>{text}</span></span>`
 * Ready to be appended directly to a container element.
 *
 * @example
 * content.appendChild(createThinkingElement());
 *
 * @example
 * // Force a fresh element
 * content.appendChild(createThinkingElement("Searching…", false));
 */
export const createThinkingElement = (text = "Thinking…", reuseNode = true) => {

  // Clear any previously scheduled timers.
  timers.forEach(clearTimeout);
  timers = [];

  if (!node || !reuseNode) {
    node = document.createElement("span");
    node.className = "thinking-loader";
    node.innerHTML = `<b>●</b> &nbsp; <span class="thinking-text"></span>`;
  }

  const label = node.querySelector(".thinking-text");
  label.textContent = text;

  timers.push(setTimeout(() => {
    label.textContent = "Still thinking…";
  }, 5000));

  timers.push(setTimeout(() => {
    label.textContent = "This may take a minute…";
  }, 15000));

  timers.push(setTimeout(() => {
    label.textContent = "This may take a minute…literally";
  }, 22000));

  timers.push(setTimeout(() => {
    label.textContent = "Worth the wait…";
  }, 30000));

  timers.push(setTimeout(() => {
    label.textContent = "Almost there…";
  }, 45000));

  timers.push(setTimeout(() => {
    label.textContent = "Just a few more seconds…";
  }, 60000));

  timers.push(setTimeout(() => {
    label.textContent = "Finalizing your package…";
  }, 75000));

  return node;
};

/**
 * @function clearThinkingTimers
 * @description
 * Cancels any pending thinking-state message timers. Call this when the
 * response arrives to prevent stale updates after the element is removed.
 */
export const clearThinkingTimers = () => {
  timers.forEach(clearTimeout);
  timers = [];
};