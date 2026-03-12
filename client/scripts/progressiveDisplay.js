"use strict";

/**
 * @constant {Object} ANIM_TYPES
 * @description
 * Registry mapping animation type keys to sets of HTML tag names that
 * should receive that animation treatment. Currently defines a single
 * type, `"fade"`, for media and embedded content elements that cannot
 * be meaningfully revealed character-by-character and are instead
 * faded in as a whole unit.
 *
 * Extend this object to introduce new animation categories — the
 * `getAnimType` resolver will pick them up automatically.
 */
const ANIM_TYPES = {
  fade: new Set(["img", "figure", "video", "iframe", "svg"]),
};

/**
 * @constant {number} DEFAULT_DELAY
 * @description
 * Default inter-character delay in milliseconds used by `progressiveText`
 * when no `delay` option is provided. Controls the perceived typing speed.
 */
const DEFAULT_DELAY = 5;

// --------------------------------------------------------------------------
// Animation type resolution
// --------------------------------------------------------------------------

/**
 * @function getAnimType
 * @description
 * Resolves the animation type for a given DOM node by looking up its
 * lowercase tag name against each set in `ANIM_TYPES`. Returns the
 * matching key (e.g. `"fade"`) or `defaultType` if no match is found.
 *
 * @param {Node} node - The DOM node to classify.
 * @param {string} [defaultType="regular"] - Fallback type when no match is found.
 * @returns {string} The animation type key.
 */
const getAnimType = (node, defaultType = "regular") => {
  const tagName = node && (node.tagName || "").toLowerCase() || "";
  if (!tagName) return defaultType;
  for (const k in ANIM_TYPES) {
    if (ANIM_TYPES[k].has(tagName)) return k;
  }
  return defaultType;
}

// --------------------------------------------------------------------------
// Visibility helpers
// --------------------------------------------------------------------------

/**
 * @function hide
 * @description
 * Hides an element node. In `keepSpace` mode the element is made invisible
 * but retains its layout footprint (via `visibility: hidden`), preventing
 * content reflow as nodes are progressively revealed. Otherwise the element
 * is removed from layout entirely via `display: none`.
 *
 * @param {Node} node - The node to hide.
 * @param {boolean} keepSpace - Whether to preserve layout space.
 * @returns {Node} The same node, for chaining.
 */
const hide = (node, keepSpace) => {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) return node;
  return keepSpace && (
    node.style.pointerEvents = "none",
    node.style.visibility = "hidden",
    node.style.opacity = "0",
    node
  ) || (
    node.style.display = "none",
    node
  );
}

/**
 * @function unhide
 * @description
 * Reverses the effect of `hide`. In `keepSpace` mode, clears the inline
 * visibility/opacity/pointerEvents styles and removes the `style` attribute
 * entirely if nothing else remains. Otherwise clears `display` and similarly
 * prunes an empty `style` attribute.
 *
 * @param {Node} node - The node to reveal.
 * @param {boolean} keepSpace - Must match the value used in the `hide` call.
 * @returns {Node} The same node, for chaining.
 */
const unhide = (node, keepSpace) => {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) return node;
  return keepSpace && (
    node.style.pointerEvents = "",
    node.style.visibility = "",
    node.style.opacity = "",
    node.style.cssText || node.removeAttribute("style"),
    node
  ) || (
    node.style.display = "",
    node.style.cssText || node.removeAttribute("style"),
    node
  );
}

// --------------------------------------------------------------------------
// Collapse / uncollapse
// --------------------------------------------------------------------------

/**
 * @function collapse
 * @description
 * Prepares a node for progressive reveal by collapsing it to an invisible
 * initial state before the walk begins. The treatment differs by node type:
 *
 * - **Text nodes**: The original text is stashed in `_originalText` and the
 *   node content is cleared. In `keepSpace` mode the text node is wrapped in
 *   a `<span is-text-node-wrapper>` with `color: transparent` and
 *   `userSelect: none` so the empty space still occupies layout width,
 *   preventing line-length reflow as characters are typed in.
 *
 * - **Fade-type elements** (img, video, etc.): Hidden via `hide()` and
 *   additionally set to `opacity: 0` so the fade transition has a defined
 *   starting value.
 *
 * - **Other element nodes**: Hidden via `hide()` only.
 *
 * @param {Node} node - The node to collapse.
 * @param {boolean} keepSpace - Whether to preserve layout space for text nodes.
 * @returns {Node} The same node.
 */
const collapse = (node, keepSpace) => {
  if (!node || (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.TEXT_NODE)) return node;
  if (node.nodeType === Node.TEXT_NODE) {
    node._originalText = node.textContent;
    if (keepSpace && node.textContent.trim()) {
      // Wrap the text node in a transparent placeholder so it holds space
      // while the content is being typed in character by character.
      const wrapper = document.createElement("span");
      wrapper.style.color = "transparent";
      wrapper.style.userSelect = "none";
      wrapper.setAttribute("is-text-node-wrapper", "");
      node.parentNode.insertBefore(wrapper, node);
      wrapper.appendChild(node);
    } else {
      node.textContent = "";
    }
    return node;
  }
  hide(node, keepSpace);
  const animType = getAnimType(node);
  if (animType === "fade") {
    // Ensure opacity starts at 0 so the CSS transition has a defined origin.
    node.style.opacity = "0";
  }
  return node;
}

/**
 * @function uncollapse
 * @description
 * Reverses a `collapse` call, restoring a node to its visible initial state
 * without animation. Used for element nodes that are neither text nor
 * fade-type — they are simply made visible again as the walker reaches them.
 *
 * For text nodes, restores `_originalText` and unwraps the
 * `is-text-node-wrapper` span if one was inserted by `collapse`.
 *
 * For fade-type elements, clears opacity/transition styles and prunes an
 * empty `style` attribute.
 *
 * @param {Node} node - The node to uncollapse.
 * @param {boolean} keepSpace - Must match the value used in `collapse`.
 * @returns {Node} The same node.
 */
const uncollapse = (node, keepSpace) => {
  if (!node || (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.TEXT_NODE)) return node;

  if (node.nodeType === Node.TEXT_NODE) {
    if (node._originalText !== undefined) {
      node.textContent = node._originalText;
      delete node._originalText;
    }
    // Remove the keepSpace wrapper span if one was inserted during collapse.
    const wrapper = node.parentNode?.hasAttribute("is-text-node-wrapper") ? node.parentNode : null;
    if (wrapper) {
      wrapper.parentNode.insertBefore(node, wrapper);
      wrapper.remove();
    }
    return node;
  }

  unhide(node, keepSpace);
  const animType = getAnimType(node);
  if (animType === "fade") {
    node.style.opacity = "";
    node.style.transition = "";
    node.style.cssText || node.removeAttribute("style");
  }
  return node;
}

// --------------------------------------------------------------------------
// Animation primitives
// --------------------------------------------------------------------------

/**
 * @function fadeIn
 * @async
 * @description
 * Reveals a single element node with a CSS opacity transition. The element
 * is first unhidden at opacity 0, then a `requestAnimationFrame` tick later
 * its opacity is set to 1, triggering the transition. Resolves when
 * `transitionend` fires or when the safety timeout elapses — whichever
 * comes first.
 *
 * Integrates with the shared `state` object for cancellation: if
 * `state.cancel` is set before or during the animation, the promise
 * resolves immediately without completing the transition.
 *
 * The `getBoundingClientRect()` call between setting `opacity: 0` and
 * dispatching the `rAF` is a forced synchronous layout flush. Without it,
 * browsers may batch the opacity-0 assignment with the subsequent opacity-1
 * update, causing the transition to be skipped entirely.
 *
 * @param {Element} node - The element to fade in.
 * @param {Object} [options={}]
 * @param {number} [options.delay] - Transition duration in milliseconds.
 * @param {boolean} [options.keepSpace] - Passed to `unhide`.
 * @param {Function} [options.onChange] - Called after the node is unhidden.
 * @param {Object} state - Shared cancellation/tracking state object.
 * @returns {Promise<Node>} Resolves with the node once the fade is complete.
 */
const fadeIn = async (
  node,
  { delay, keepSpace, onChange } = {},
  state
) => new Promise(resolve => {
  state || (state = {});
  if (!node || node.nodeType !== Node.ELEMENT_NODE || state.cancel) return resolve(node);

  const ontransitionend = () => {
    // Clean up transition styles once animation completes.
    node.style.transition = "";
    node.style.opacity = "";
    node.removeEventListener("transitionend", ontransitionend);
    resolve(node);
  }
  node.addEventListener("transitionend", ontransitionend);
  unhide(node, keepSpace);
  node.style.opacity = "0";
  node.style.transition = `opacity ${delay}ms ease`;

  // Force a synchronous layout flush so the browser registers opacity: 0
  // before the rAF sets opacity: 1 — without this the transition is skipped.
  node.getBoundingClientRect();
  typeof onChange === "function" && onChange();

  state.animationFrameRequestIds || (state.animationFrameRequestIds = []);
  state.timeoutIds || (state.timeoutIds = []);
  state.resolveFunctions || (state.resolveFunctions = []);
  state.resolveFunctions.push(() => resolve(node));
  state.animationFrameRequestIds.push(requestAnimationFrame(() => {
    if (state.cancel) return resolve(node);
    node.style.opacity = "1";
  }));

  // Safety timeout: guarantees resolution even if transitionend never fires
  // (e.g. if the element is removed from the DOM mid-transition).
  state.timeoutIds.push(setTimeout(() => resolve(node), state.cancel ? 0 : 2 * delay + 10));
});

/**
 * @function progressiveText
 * @async
 * @description
 * Reveals a text node one character at a time, producing a typewriter
 * effect. On each tick, one additional character of the original text is
 * written to the node via `textContent`, then a `setTimeout` schedules the
 * next tick after `delay` milliseconds. Each tick is wrapped in a
 * `requestAnimationFrame` to ensure the write is synchronised with the
 * browser's paint cycle and to allow clean cancellation.
 *
 * The source text is taken from `_originalText` (stashed by `collapse`) if
 * present, falling back to live content properties. This ordering matters:
 * by the time `progressiveText` is called, the node's `textContent` may
 * have already been cleared by `collapse`.
 *
 * If a `keepSpace` wrapper span was inserted by `collapse`, the first frame
 * removes its transparency styles before writing the first character — this
 * ensures the text colour transitions cleanly from transparent to its
 * natural inherited value without a flash. The wrapper is removed entirely
 * once the full text has been written.
 *
 * Cancellation is handled in two places to ensure the `keepSpace` wrapper
 * is always cleaned up regardless of when cancel fires:
 * - **Pre-start** (`state.cancel` already true before `f()` is called):
 *   the wrapper is unwrapped and `resolve` is called directly before
 *   the typewriter loop begins.
 * - **Mid-type** (cancel set while inside the `rAF` callback): the `else`
 *   branch of the character loop handles unwrapping before resolving.
 * Both paths use optional chaining (`parentNode?.insertBefore`) defensively
 * in case the wrapper has been detached from the DOM by the time cancel fires.
 *
 * @param {Node} node - The text node (or element) to type into.
 * @param {Object} [options={}]
 * @param {number} [options.delay] - Milliseconds between each character.
 * @param {boolean} [options.keepSpace] - Whether `keepSpace` wrappers are in use.
 * @param {Function} [options.onChange] - Called after each character is written.
 * @param {Object} state - Shared cancellation/tracking state object.
 * @returns {Promise<Node>} Resolves with the node once all characters are written.
 */
const progressiveText = async (
  node,
  { delay, keepSpace, onChange } = {},
  state
) => new Promise(resolve => {
  state || (state = {});
  if (!node || state.cancel) return resolve(node);

  const text = (node._originalText || node.textContent || node.content || node.innerHTML || node.value || "");
  const len = text.length;
  let i = 0;

  if (!len) return resolve(node);

  delete node._originalText;

  // Check if a keepSpace wrapper was inserted for this text node.
  const wrapper = node.parentNode?.hasAttribute("is-text-node-wrapper") ? node.parentNode : null;
  
  unhide(node, keepSpace);
  state.animationFrameRequestIds || (state.animationFrameRequestIds = []);
  state.timeoutIds || (state.timeoutIds = []);
  state.resolveFunctions || (state.resolveFunctions = []);
  state.resolveFunctions.push(() => resolve(node));
  node.nodeType === Node.ELEMENT_NODE && (node.style.display = "");

  const f = () => state.animationFrameRequestIds.push(requestAnimationFrame(() => {
    i++;
    // On the first character, remove the transparent wrapper styles so the
    // text colour becomes visible before any characters are written.
    if (wrapper && i === 1) {
      wrapper.style.color = "";
      wrapper.style.userSelect = "";
    }
    node.textContent = text.slice(0, i);
    typeof onChange === "function" && onChange();
    if (i !== len && !state.cancel) {
      // Schedule the next character after the configured delay.
      state.timeoutIds.push(setTimeout(f, delay));
    } else {
      // All characters written (or cancelled) — unwrap and resolve.
      if (wrapper) {
        wrapper.parentNode?.insertBefore(node, wrapper);
        wrapper.remove();
      }
      resolve(node);
    }
  }));

  if (state.cancel) {
    if (wrapper) {
      wrapper.parentNode?.insertBefore(node, wrapper);
      wrapper.remove();
    }
    return resolve(node);
  }
  f();
});

// --------------------------------------------------------------------------
// Cancellation
// --------------------------------------------------------------------------

/**
 * @function cancel
 * @description
 * Immediately halts all in-progress animations associated with a `state`
 * object. Sets `state.cancel = true` as a flag checked by all async
 * animation loops, then synchronously cancels every pending
 * `requestAnimationFrame`, clears every pending `setTimeout`, and calls
 * every stored resolve function to settle any outstanding promises.
 *
 * After cancellation, all nodes will remain in whatever partially-revealed
 * state they were in at the moment of cancellation. Callers that need to
 * show full content after cancelling (e.g. the stop button) are responsible
 * for resetting or replacing the content themselves.
 *
 * @param {Object} state - The shared state object for the animation sequence.
 * @returns {Object} The same state object, now with `cancel: true`.
 */
const cancel = state => {
  if (state) {
    state.cancel = true;
    if (state.animationFrameRequestIds) {
      for (let i = 0, arr = state.animationFrameRequestIds, l = arr.length; i !== l; ++i) {
        cancelAnimationFrame(arr[i]);
      }
    }
    if (state.timeoutIds) {
      for (let i = 0, arr = state.timeoutIds, l = arr.length; i !== l; ++i) {
        clearTimeout(arr[i]);
      }
    }
    if (state.resolveFunctions) {
      for (let i = 0, arr = state.resolveFunctions, l = arr.length; i !== l; ++i) {
        arr[i]();
      }
    }
  }
  return state;
}

// --------------------------------------------------------------------------
// Orchestration
// --------------------------------------------------------------------------

/**
 * @function start
 * @async
 * @description
 * Orchestrates the full progressive display sequence for a fragment. This
 * is the core engine that all public APIs ultimately delegate to.
 *
 * **Pipeline:**
 * 1. **Normalise** — if `fragment` is a string, it is parsed into a
 *    `DocumentFragment` via a `<template>` element.
 * 2. **Collapse** — a `TreeWalker` traverses every element and text node in
 *    the fragment and calls `collapse` on each, hiding them all before any
 *    are attached to the live DOM.
 * 3. **Attach** — the collapsed fragment is appended to `container` in a
 *    single operation, avoiding repeated reflows.
 * 4. **Unveil** — a second `TreeWalker` over the now-live container walks
 *    each node and applies the appropriate reveal:
 *    - Fade-type elements → `fadeIn`
 *    - Text nodes and childless text-bearing elements → `progressiveText`
 *    - All other elements → `uncollapse` (instant, no animation)
 *    Each step `await`s its animation before moving to the next node,
 *    producing the left-to-right, top-to-bottom reveal sequence.
 * 5. **Done** — `onDone` is called once the final node has been unveiled.
 *
 * @param {string|DocumentFragment|Element} fragment
 * The content to display. Strings are parsed as HTML; DOM nodes are used
 * directly.
 *
 * @param {Element} container
 * The element to append the revealed content into.
 *
 * @param {Object} [options={}]
 * @param {number} [options.delay=DEFAULT_DELAY]
 * Inter-character delay in milliseconds for text nodes.
 *
 * @param {number} [options.fadeInDelay=delay]
 * Transition duration in milliseconds for fade-type elements. Defaults to
 * the same value as `delay` if not specified separately.
 *
 * @param {boolean} [options.keepSpace]
 * When `true`, hidden nodes retain their layout footprint during the reveal,
 * preventing content reflow as the animation progresses.
 *
 * @param {Function} [options.onDone]
 * Called once all nodes have been unveiled. Typically `GLOBALS.endDisplay`.
 *
 * @param {Function} [options.onChange]
 * Called after each individual node reveal step. Used by `onContentChange`
 * to trigger auto-scroll after each increment.
 *
 * @param {Object} state - Shared cancellation/tracking state object.
 * @returns {Promise<Object>} Resolves with the state object once complete.
 */
const start = async (
  fragment,
  container,
  { delay = DEFAULT_DELAY, fadeInDelay = delay, keepSpace, onDone, onChange } = {},
  state
) => {
  // Normalise: parse HTML strings into a DocumentFragment.
  let innerHTML;
  typeof fragment === "string" && (
    innerHTML = fragment,
    (fragment = document.createElement("template")).innerHTML = innerHTML,
    fragment = fragment.content
  );

  // Initialise shared state if not provided by the caller.
  let walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  state || (state = {});

  // Pass 1: collapse every node in the fragment before attaching to the DOM.
  // This ensures no content is visible during the append operation.
  let node;
  while ((node = walker.nextNode())) {
    collapse(node, keepSpace);
  }

  // Attach the fully-collapsed fragment to the live DOM in one operation.
  container.appendChild(fragment);

  // Pass 2: walk the now-live container and unveil nodes one by one.
  walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);

  while ((node = walker.nextNode())) {
    const animType = getAnimType(node);

    if (animType === "fade") {
      // Media/embed elements: reveal with an opacity transition.
      await fadeIn(node, { delay: fadeInDelay, keepSpace, onChange }, state);
    } else if (node.nodeType === Node.TEXT_NODE || (
        !node.childNodes.length
        && node.textContent
      )
    ) {
      // Text nodes and leaf elements with text: typewriter character reveal.
      await progressiveText(node, { delay, keepSpace, onChange }, state);
    } else {
      // Structural/container elements: instant reveal, no animation.
      uncollapse(node, keepSpace);
      typeof onChange === "function" && onChange();
    }
  }

  typeof onDone === "function" && onDone();

  return state;
}

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

/**
 * @function createProgressiveDisplay
 * @description
 * Factory that creates a progressive display controller without starting
 * it immediately. Returns an object with `startAnim` and `cancelAnim`
 * functions, giving the caller explicit control over when the animation
 * begins and a handle to stop it at any point.
 *
 * Useful when the animation should be deferred or conditionally started
 * based on external state.
 *
 * @param {string|DocumentFragment|Element} fragment - Content to display.
 * @param {Element} container - Target container element.
 * @param {Object} [options] - See `start` for full options documentation.
 *
 * @returns {{ startAnim: Function, cancelAnim: Function }}
 * - `startAnim()` — begins the animation sequence.
 * - `cancelAnim()` — immediately halts all in-progress animations.
 *
 * @example
 * const { startAnim, cancelAnim } = createProgressiveDisplay(html, content, options);
 * startAnim();
 * // Later, if needed:
 * cancelAnim();
 */
export const createProgressiveDisplay = (
  fragment,
  container,
  options
) => {
  const state = {},
    cancelAnim = () => cancel(state),
    startAnim = () => start(fragment, container, options, state);
  return { startAnim, cancelAnim };
}

/**
 * @function progressiveDisplay
 * @description
 * The primary public API. Immediately starts a progressive display
 * animation and returns a `cancel` function that can be called at any
 * time to halt the sequence. This is the function used throughout the
 * application.
 *
 * Internally delegates to `createProgressiveDisplay` and calls `startAnim`
 * immediately, returning `cancelAnim` as the cancel handle. The cancel
 * function should be stored in `GLOBALS.stopDisplay` so that the stop
 * button and new query submissions can interrupt an in-progress render.
 *
 * @param {string|DocumentFragment|Element} fragment
 * The content to display. Accepts an HTML string, a `DocumentFragment`,
 * or a DOM element.
 *
 * @param {Element} container
 * The element to append content into. Typically the `#content` element.
 *
 * @param {Object} [options]
 * @param {number} [options.delay=5] - Inter-character typing delay in ms.
 * @param {number} [options.fadeInDelay=delay] - Fade transition duration in ms.
 * @param {boolean} [options.keepSpace] - Preserve layout space during reveal.
 * @param {Function} [options.onDone] - Called when the animation completes.
 * @param {Function} [options.onChange] - Called after each reveal step.
 *
 * @returns {Function}
 * A `cancel` function. Call it to immediately halt all pending animations
 * for this display instance.
 *
 * @example
 * GLOBALS.stopDisplay = progressiveDisplay(
 *   `<span>${responseText}</span>`,
 *   content,
 *   { onDone: GLOBALS.endDisplay, onChange: onContentChange }
 * );
 *
 * @example
 * // Cancel mid-render:
 * GLOBALS.stopDisplay();
 */
export const progressiveDisplay = (
  fragment,
  container,
  options
) => {
  const { startAnim, cancelAnim } = createProgressiveDisplay(
    fragment,
    container,
    options
  );
  startAnim();
  return cancelAnim;
}

/**
 * @function instantDisplay
 * @description
 * Immediately reveals all content in a container that was partially or
 * fully collapsed by `progressiveDisplay`. Traverses every node via a
 * TreeWalker and resets inline styles and text content to their fully
 * visible state — the equivalent of progressiveDisplay completing instantly.
 *
 * @param {Element} container - The element to fully reveal.
 */
export const instantDisplay = container => {
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
  );

  let node;
  while ((node = walker.nextNode())) {

    // Text nodes: restore original text stashed by collapse, and unwrap
    // any is-text-node-wrapper span inserted for keepSpace mode.
    if (node.nodeType === Node.TEXT_NODE) {
      if (node._originalText !== undefined) {
        node.textContent = node._originalText;
        delete node._originalText;
      }
      const wrapper = node.parentNode?.hasAttribute("is-text-node-wrapper")
        ? node.parentNode
        : null;
      if (wrapper) {
        wrapper.parentNode.insertBefore(node, wrapper);
        wrapper.remove();
      }
      continue;
    }

    // Element nodes: clear all inline styles set by hide() / collapse().
    node.style.display     = "";
    node.style.visibility  = "";
    node.style.opacity     = "";
    node.style.transition  = "";
    node.style.color       = "";
    node.style.userSelect  = "";
    node.style.pointerEvents = "";
    if (!node.style.cssText) node.removeAttribute("style");
  }
}