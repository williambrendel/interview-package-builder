"use strict"

let node = null;

/**
 * @function createThinkingElement
 * @description
 * Creates and returns a DOM fragment containing the thinking-state loader
 * UI element. The element renders a pulsing indicator and a configurable
 * status label, intended to be injected into the content area while
 * awaiting a query response.
 *
 * Implements optional node reuse via a module-scoped `template` element
 * cache. On the first call (or when `reuseNode` is `false`), a new
 * `<template>` is created and its `innerHTML` is set. On subsequent calls
 * with `reuseNode` enabled, the existing template is reused and only
 * cloned — avoiding repeated DOM construction for what is typically a
 * static element.
 *
 * Because a `DocumentFragment` is returned via `cloneNode(true)`, each
 * call yields an independent, insertable subtree regardless of whether the
 * template node was reused.
 *
 * @param {string} [text="Thinking…"]
 * The label text rendered beside the animated indicator. Can be customised
 * to reflect different loading states (e.g., "Searching…", "Generating…").
 *
 * @param {boolean} [reuseNode=true]
 * When `true`, skips re-creating the template element if one already
 * exists in the module cache. Set to `false` to force a fresh element —
 * useful if the `text` content needs to change between calls.
 *
 * @returns {DocumentFragment}
 * A cloned document fragment containing:
 * `<span class="thinking-loader"><b>●</b> {text}</span>`
 * Ready to be appended directly to a container element.
 *
 * @example
 * content.appendChild(createThinkingElement("Searching…"));
 *
 * @example
 * // Force a fresh element with updated text
 * content.appendChild(createThinkingElement("Retrying…", false));
 *
 * @notes
 * - The `<b>●</b>` bullet is expected to be animated via CSS on the
 *   `.thinking-loader` class (e.g., a pulsing or blinking keyframe).
 * - Changing `text` on a repeat call has no effect unless `reuseNode` is
 *   `false`, since the cached template retains its original innerHTML.
 */
export const createThinkingElement = (text = "Thinking… this may take a minute", reuseNode = true) => (
  node && reuseNode || (
    (node = document.createElement("template")).innerHTML = `<span class="thinking-loader"><b>●</b> ${text}</span>`
  ),
  node.content.cloneNode(true)
);