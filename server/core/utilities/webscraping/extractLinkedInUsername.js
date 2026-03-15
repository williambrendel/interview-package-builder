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

"use strict";

const extractLinkedInUsername = text => {
  // 1. Split the text into lines to handle PDF wrap-arounds
  const lines = text.split(/\r?\n/).map(l => l.trim());
  const results = new Set();
  
  // 2. Regex to find the start of a LinkedIn URL
  const pattern = /(?:linkedin\.com\/(?:in|pub)\/)([A-Za-z0-9\-]+)/i;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(pattern);
    
    if (match) {
      let slug = match[1];
      
      // 3. CHECK FOR WRAP-AROUND: If the slug ends in a hyphen and there is a next line
      if (slug.endsWith('-') && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        
        // Only append the next line if it looks like a continuation 
        // (starts with alphanumeric, no spaces, not a header like "SUMMARY")
        const continuationMatch = nextLine.match(/^([A-Za-z0-9\-]+)(?:\/|\s|$)/);
        
        if (continuationMatch) {
          // Join them! (e.g., "tristan-" + "perera")
          slug += continuationMatch[1];
        }
      }

      // Final cleanup: remove trailing slashes or hyphens
      const cleanSlug = slug.replace(/[\/-]+$/, "").toLowerCase();
      if (cleanSlug) results.add(cleanSlug);
    }
  }

  return Array.from(results);
};

/**
 * @ignore
 * Default export with freezing.
 */
module.exports = Object.freeze(Object.defineProperty(extractLinkedInUsername, "extractLinkedInUsername", {
  value: extractLinkedInUsername
}));