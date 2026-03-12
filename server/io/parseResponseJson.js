"use strict";

/**
 * @function parseResponseJson
 * @description
 * Parses a JSON string from a Claude API response, stripping markdown code fences
 * if present and applying escape normalization fallbacks before parsing.
 *
 * Claude occasionally wraps JSON output in ` ```json ``` ` or ` ``` ``` ` fences,
 * or emits literal newlines inside string values. This function normalises all
 * known failure modes before calling `JSON.parse`.
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
  let clean = text.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();

  const jsonMatch = clean.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) clean = jsonMatch[1];

  // Pass 1 — try parsing as-is.
  try { return JSON.parse(clean); } catch {}

  // Pass 2 — escape literal newlines only inside string values.
  try {
    const escaped = clean.replace(
      /"((?:[^"\\]|\\.)*)"/gs,
      (_, inner) => `"${inner.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")}"`
    );
    return JSON.parse(escaped);
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