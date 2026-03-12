"use strict";

/**
 * @function parseResponseJson
 * @description
 * Parses a JSON string from a Claude API response, stripping markdown code fences
 * if present before parsing.
 *
 * Claude occasionally wraps JSON output in ` ```json ``` ` or ` ``` ``` ` fences.
 * This function normalises both forms before calling `JSON.parse`, so callers
 * do not need to handle fence-stripping themselves.
 *
 * @param {string} text - Raw text from `response.output.text`.
 *
 * @returns {*} Parsed JSON value (object, array, string, number, etc.).
 *
 * @throws {SyntaxError} Re-throws the `JSON.parse` error after logging the
 *   first 500 characters of the cleaned string for debugging.
 *
 * @example
 * const data = parseResponseJson('```json\n{"key":"value"}\n```');
 * // → { key: "value" }
 *
 * @example
 * const data = parseResponseJson('{"key":"value"}');
 * // → { key: "value" }
 */
const parseResponseJson = text => {
  const clean = text.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
  try {
    return JSON.parse(clean);
  } catch (err) {
    console.error(`❌ Failed to parse JSON:\n${clean.slice(0, 500)}`);
    throw err;
  }
};

/**
 * @ignore
 * Default export with freezing.
 */
module.exports = Object.freeze(Object.defineProperty(parseResponseJson, "parseResponseJson", {
  value: parseResponseJson
}));