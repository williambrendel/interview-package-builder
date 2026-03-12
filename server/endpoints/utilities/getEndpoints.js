"use strict";

const path = require("path");
const requireFiles = require("../../io/requireFiles");
const dir = path.dirname(__dirname);

/**
 * @function getEndpoints
 *
 * @description
 * Discovers and returns all {@link Endpoint} descriptors defined in the
 * parent directory, sorted and filtered for use as a registry.
 *
 * Internally delegates to {@link requireFiles}, which recursively requires all
 * modules found under `dir` (the parent of this file's directory). The
 * following paths are always excluded from discovery:
 * - `middlewares/`
 * - `utilities/`
 * - `index.js`
 *
 * Any additional entries passed via `blacklist` are appended to that list
 * before discovery runs. All results are deeply flattened (modules may
 * export arrays of endpoints) and sorted ascending by `route`, with `method`
 * as a tiebreaker.
 *
 * @param {...string} blacklist - Zero or more file or directory names to
 *                                exclude from endpoint discovery, in addition
 *                                to the built-in exclusions. Nested arrays
 *                                are accepted and flattened automatically.
 *
 * @returns {Endpoint[]} A sorted, flattened array of {@link Endpoint} descriptors.
 *
 * @example
 * // All endpoints, no additional exclusions
 * const endpoints = getEndpoints();
 *
 * @example
 * // Exclude specific endpoints from the registry
 * const endpoints = getEndpoints("healthcheck", "debug");
 */
const getEndpoints = (...blacklist) => requireFiles(
  dir,
  {
    blacklist: [
      "middlewares",
      "utilities",
      "index.js",
      ...blacklist.flat(Infinity)
    ],
    relative: path.dirname(__filename)
  }
).flat(Infinity).sort(
  (a, b) => (
    a.route < b.route && -1 ||
    (a.route > b.route && 1) ||
    (a.method < b.method && -1) ||
    1
  )
);

/**
 * @ignore
 * Default export with freezing.
 */
module.exports = Object.freeze(Object.defineProperty(getEndpoints, "getEndpoints", {
  value: getEndpoints
}));