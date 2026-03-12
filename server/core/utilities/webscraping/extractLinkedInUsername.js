"use strict";

/**
 * Extracts unique LinkedIn usernames from a block of text.
 *
 * Handles the following URL formats:
 * - `linkedin.com/in/username`
 * - `www.linkedin.com/in/username`
 * - `https://linkedin.com/in/username`
 * - `uk.linkedin.com/in/username` (locale subdomains)
 * - `linkedin.com/pub/username` (legacy public profiles)
 * - Trailing slashes and query strings are ignored
 *
 * @param {string} text - Raw text to scan (e.g. resume content, plain text).
 * @returns {string[]} Deduplicated array of LinkedIn username slugs.
 *
 * @example
 * extractLinkedInUsername("Visit linkedin.com/in/william-brendel for more.");
 * // => ["william-brendel"]
 */
const extractLinkedInUsername = text => {
  const pattern = /\b(?:https?:\/\/)?(?:[a-z]{2,3}\.)?(?:www\.)?linkedin\.com\/(?:in|pub)\/([A-Za-z0-9\-_%]+)(?:\/)?(?:\?[^\s]*)?/gi;
  const results = new Set();
  let match;
  while ((match = pattern.exec(text)) !== null) results.add(match[1]);

  return Array.from(results);
}

/**
 * @ignore
 * Default export with freezing.
 */
module.exports = Object.freeze(Object.defineProperty(extractLinkedInUsername, "extractLinkedInUsername", {
  value: extractLinkedInUsername
}));