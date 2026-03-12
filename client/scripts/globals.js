"use strict";

/**
 * @namespace GLOBALS
 * @description
 * Shared mutable state container for the chat input form module. Acts as a
 * central store for runtime references that need to be accessible and
 * cancellable across multiple independent modules without tight coupling.
 *
 * The object is intentionally kept minimal — it holds only the state that
 * must survive across asynchronous boundaries (e.g., an in-progress
 * progressive display that may need to be interrupted by a stop action or
 * a new query submission).
 *
 * @property {Function|null} stopDisplay
 * A cancellation handle for the currently active `progressiveDisplay`
 * operation. Set to the cancel function returned by `progressiveDisplay`
 * when a display begins, and reset to `null` via `endDisplay` when it
 * completes naturally. Should be called directly to interrupt an ongoing
 * display early (e.g., when the user submits a new query or clicks stop).
 *
 * @property {Function} endDisplay
 * Callback intended to be passed as the `onDone` handler to
 * `progressiveDisplay`. Resets `stopDisplay` to `null` once a display
 * sequence completes, ensuring stale cancel handles are not retained.
 *
 * @property {boolean} userScrolling
 * Tracks whether the user is actively scrolling the content area. When
 * `true`, automatic scroll-to-bottom behaviour during progressive display
 * should be suppressed so that the user's reading position is not
 * disrupted mid-render. Set to `true` on scroll input and reset to `false`
 * once the user's scroll activity is considered complete (e.g., on a
 * scroll-end event or after a debounce period).
 *
 * @property {number} scrollTop
 * A snapshot of the content container's last known `scrollTop` value, in
 * pixels. Used alongside `userScrolling` to determine scroll intent —
 * for example, to distinguish a user-initiated upward scroll from a
 * programmatic downward scroll triggered by new content being appended.
 * Should be updated whenever the scroll position is sampled.
 */
export const GLOBALS = {
  stopDisplay: null,
  endDisplay: () => GLOBALS.stopDisplay = null,
  userScrolling: false,
  scrollTop: 0,
  attachedFiles: new Map()
}