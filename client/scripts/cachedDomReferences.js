/**
 * @namespace DOM
 * @description
 * A module-level cache of frequently accessed DOM element references,
 * queried once at initialisation time and reused throughout the
 * application's lifetime.
 *
 * Querying the DOM via `getElementById` or `document.head` / `document.body`
 * on every use is inexpensive in isolation, but caching the references here
 * provides a single authoritative source of truth for element IDs, makes
 * typos immediately apparent at startup rather than silently at call sites,
 * and keeps consuming modules free from direct `document` API calls.
 *
 * All references are resolved synchronously when this module is first
 * imported. Consuming modules should therefore ensure the DOM is ready
 * before importing (e.g., by placing script tags at the end of `<body>` or
 * using `type="module"`, which defers execution automatically).
 *
 * @property {HTMLHeadElement} head
 * Reference to `document.head`. Available for dynamic stylesheet or meta
 * tag injection.
 *
 * @property {HTMLBodyElement} body
 * Reference to `document.body`. Used as the target for thinking-state
 * attribute toggling (`thinking` attribute) and global click dismissal.
 *
 * @property {HTMLTextAreaElement} input
 * The primary chat input textarea (`#chat-input`). Receives user-typed
 * messages and is cleared by `resetForm` after submission.
 *
 * @property {HTMLFormElement} form
 * The chat input form element (`#chat-input-form`). Hosts the `empty` and
 * `multiline` state attributes used for CSS-driven layout changes, and is
 * the target of programmatic `submit` event dispatches.
 *
 * @property {HTMLElement} chatContainer
 * The outer container wrapping the entire chat input UI
 * (`#chat-input-container`). Receives the `menu-visible` attribute to
 * toggle the options menu open and closed.
 *
 * @property {HTMLButtonElement} menuButton
 * The button that opens or closes the chat options menu
 * (`#chat-menu-button`).
 *
 * @property {HTMLElement} leftActions
 * The container holding left-side action buttons within the input bar
 * (`#chat-input-left-buttons`). Its `clientWidth` is used by `resize()` to
 * calculate the available horizontal space for single-line layout detection.
 *
 * @property {HTMLElement} rightActions
 * The container holding right-side action buttons within the input bar
 * (`#chat-input-right-buttons`). Its `clientWidth` is used alongside
 * `leftActions` in the same layout calculation.
 *
 * @property {HTMLButtonElement} stopButton
 * The button that cancels an in-progress query or progressive display
 * (`#stop`). Its `onclick` handler is bound in `index.js`.
 *
 * @property {HTMLElement} content
 * The main content display area (`#content`). Receives the thinking
 * indicator during loading and the progressively rendered response after
 * a query resolves. Cleared between query cycles.
 *
 * @example
 * import { DOM } from "./cachedDomReferences.js";
 * const { input, form, content } = DOM;
 *
 * @notes
 * - If an element is not found at query time (e.g., due to a mismatched
 *   ID), the corresponding property will be `null`. No runtime warning is
 *   emitted — failures will surface only when a consuming module attempts
 *   to access a property on the null reference.
 */
export const DOM = {
  // General.
  head: document.head,
  body: document.body,

  // Chat input form.
  input: document.getElementById("chat-input"),
  form: document.getElementById("chat-input-form"),
  chatContainer: document.getElementById("chat-input-container"),
  chatFiles: document.getElementById("chat-files"),
  menuButton: document.getElementById("chat-menu-button"),
  leftActions: document.getElementById("chat-input-left-buttons"),
  rightActions: document.getElementById("chat-input-right-buttons"),
  stopButton: document.getElementById("stop"),
  // callUs: document.getElementById("chat-menu-call-us"),
  // textUs: document.getElementById("chat-menu-text-us"),
  // emailUs: document.getElementById("chat-menu-email-us"),
  dropOverlay: document.getElementById("drop-overlay"),

  // Chat content.
  content: document.getElementById("content")
}