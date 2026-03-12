"use strict";

import { API } from "../api.js";

/**
 * @function sendFeedback
 * @async
 * @description
 * Submits a user feedback signal for a specific query result to the
 * server. Designed to be called from the thumbs-up and thumbs-down option
 * buttons rendered by `createResultOptions`, passing the sentiment,
 * the result item, and the query summary as context.
 *
 * Sends a `POST` request to `API.feedbackUrl` with the feedback payload
 * serialised as JSON. On a successful response the parsed JSON is logged.
 * On an HTTP error, the error details are logged to the console rather
 * than thrown, allowing the UI to remain unaffected by feedback failures.
 *
 * @param {string} [feedback="neutral"]
 * The sentiment signal to record. Typically `"positive"` (thumbs up) or
 * `"negative"` (thumbs down). Defaults to `"neutral"` if omitted.
 *
 * @param {Object} item
 * The full result object for the answer that is being rated. Included in
 * the request body as `output` to give the server complete context about
 * which answer received the feedback.
 *
 * @param {Object} summary
 * The query summary object returned alongside the results. Included in
 * the request body to associate the feedback with the specific search
 * context (query string, status code, best question match, etc.).
 *
 * @returns {Promise<void>}
 * Resolves once the response has been handled. Does not return a value —
 * feedback outcomes are currently handled via `console.log` / `console.error`
 * only. UI-level acknowledgement (e.g., a success banner) is marked as a
 * TODO in the implementation.
 *
 * @example
 * sendFeedback("positive", item, summary);
 * sendFeedback("negative", item, summary);
 *
 * @notes
 * - HTTP errors are currently swallowed (logged, not thrown) so that a
 *   failed feedback submission never disrupts the user experience. If
 *   surface-level error handling is added in the future, the commented-out
 *   `throw` in the `.then` error branch should be reinstated.
 * - Two TODOs remain in the implementation: displaying a confirmation or
 *   error banner after the feedback response is received.
 *
 * @throws
 * Does not throw — all HTTP and network errors are caught and logged
 * internally.
 */
export const sendFeedback = async (feedback = "neutral", item, summary) => {
  return fetch(API.feedbackUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: {
        summary,
        output: item,
        feedback: feedback
      }
    })
  })
  .then(response => {
    if (response.ok) return response.json();
    // Parse the body (e.g., as JSON) and then throw it
    return response.text().then(errorData => {
      // TODO
      // Do something with the data, like display a banner?
      //throw `Status: ${response.status}\nData: ${errorData}`;
      console.error(`Status: ${response.status}\nData: ${errorData}`);
    });
  })
  .then(data => {
    // TODO
    // Do something with the data, like display a banner?
    const { message } = data || {};
    message && console.log(message);
  });
}