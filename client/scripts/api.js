"use strict";

/**
 * @constant {string} BASE_URL
 * @description
 * The root URL of the local development API server. All endpoint paths are
 * constructed relative to this value, ensuring that the host and port only
 * need to be updated in one place if the server address changes.
 *
 * @default "http://localhost:3001"
 */
const BASE_URL = "http://localhost:3001";

/**
 * @namespace API
 * @description
 * Centralised registry of REST API endpoint URLs used throughout the
 * application. All fetch calls should reference this object rather than
 * constructing URLs inline, so that endpoint paths remain consistent and
 * easy to update across environments.
 *
 * All URLs are derived from `BASE_URL`, which currently targets a local
 * development server. To point the application at a staging or production
 * backend, only `BASE_URL` needs to change.
 *
 * @property {string} baseUrl
 * The root URL of the API server. Useful for constructing dynamic or
 * one-off endpoint paths not covered by the named properties below.
 *
 * @property {string} queryUrl
 * Endpoint for submitting a chat query. Accepts a `POST` request with a
 * JSON body containing a `query` string field, and returns the model's
 * response. Used by `query.js`.
 *
 * @property {string} feedbackUrl
 * Endpoint for submitting user feedback on a response. Intended for
 * thumbs-up / thumbs-down or similar rating signals sent after a query
 * has been answered.
 *
 * @example
 * fetch(API.queryUrl, {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ query: "Hello" })
 * });
 */
export const API = {
  baseUrl: BASE_URL,
  queryUrl: `${BASE_URL}/query`,
  feedbackUrl: `${BASE_URL}/feedback`,
  markdownUrl: `${BASE_URL}/markdown`,
}