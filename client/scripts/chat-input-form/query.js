"use strict"

import { renderResults } from "../content/renderResults.js";
import { renderError } from "../content/renderError.js";
import { API } from "../api.js";
import { GLOBALS } from "../globals.js";
import { resetForm } from "./resetForm.js";
import { isThinking } from "./isThinking.js";
import { stopThinking } from "./stopThinking.js";
import { simulateQuery } from "./simulateQuery.js";

/**
 * @function query
 * @async
 * @description
 * Dispatches a chat message to the server and orchestrates the full
 * response lifecycle: sending the request, resetting the form, stopping
 * the thinking indicator, and initiating progressive rendering of the
 * result or error state.
 *
 * Sends a `POST` request to `API.queryUrl` with the user's message
 * serialised as JSON. On a successful response, the result is passed to
 * `renderResults` for progressive display. On any failure — whether an
 * HTTP error status or a network-level exception — the error is passed to
 * `renderError` instead, ensuring the UI always transitions out of the
 * thinking state.
 *
 * An `isThinking()` guard is applied before acting on a successful
 * response. This prevents a stale in-flight request from overwriting the
 * UI if the user has already cancelled or submitted a new query in the
 * interim. The guard is intentionally omitted in the `.catch` handler so
 * that errors always surface regardless of cancellation state.
 *
 * @param {string} message
 * The user's input text to send to the server as the query payload.
 *
 * @returns {Promise<void>}
 * Resolves once the response has been handled and rendering has begun.
 * The promise itself does not carry a return value — side effects are
 * managed via `GLOBALS.stopDisplay` and the render functions.
 *
 * @example
 * query("What is the capital of France?");
 *
 * @notes
 * - `resetForm()` is called as soon as the response arrives rather than
 *   after rendering completes, allowing the user to begin typing a
 *   follow-up immediately.
 * - `GLOBALS.stopDisplay` is set to the cancel handle returned by
 *   `renderResults` / `renderError`, enabling the stop button to interrupt
 *   a progressive render mid-sequence.
 * - The `.catch` block calls `stopThinking()` unconditionally. If the
 *   fetch error occurs before `resetForm()` ran (i.e., no `.then` fired),
 *   the form will retain the submitted text — this is a known trade-off
 *   and may be addressed by moving `resetForm()` into the catch handler
 *   as well if desired.
 *
 * @throws
 * Does not throw — all rejections are caught internally and routed to
 * `renderError`.
 */
export const query = async formData => fetch(API.queryUrl, {
  method: "POST",
  // headers: {
  //   "Content-Type": "application/json",
  // },
  body: formData
})
.then(response => {
  if (response.ok) return response.json();
  // Parse the body (e.g., as JSON) and then throw it
  return response.text().then(errorData => {
    throw `Status: ${response.status}\nData: ${errorData}`;
  });
})
.then(data => {

  // Reset form.
  resetForm();

  if (!isThinking()) return;

  // Stop thinking.
  stopThinking();

  console.log("Success:", data);
  GLOBALS.stopDisplay = renderResults(data, GLOBALS.endDisplay);
})
.catch (error => {
  console.error("Error:", error);
  stopThinking();
  GLOBALS.stopDisplay = renderError(error, GLOBALS.endDisplay);
});

// Add simulation, for debugging.
query.simulate = simulateQuery;