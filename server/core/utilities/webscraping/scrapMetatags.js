"use strict";

// Imports.
const cheerio = require("cheerio");
const getRandomUserAgent = require("./getRandomUserAgent");

// Main function to get the metaTags.
const scrapMetatags= async url => (
  fetch(url, {
    headers: {
      "User-Agent": getRandomUserAgent(),
    },
  })
  .then(res => res.text())
  .then(html => {

    const $ = cheerio.load(html);

    // Extract all meta tags
    const metaTags = {};
    $('meta').each((i, el) => {
        const name = $(el).attr('name') || $(el).attr('property') || $(el).attr('http-equiv');
        const content = $(el).attr('content');
        if (name && content) {
            metaTags[name] = content;
        }
    });

    // Output meta tags.
    return metaTags;
  })
);

/**
 * @ignore
 * Default export with freezing.
 */
module.exports = Object.freeze(Object.defineProperty(scrapMetatags, "scrapMetatags", {
  value: scrapMetatags
}));