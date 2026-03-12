const scrapMetatags = require("./scrapMetatags");

// Helper function to get the right url.
const getProfileUrl = (url, base = "https://linkedin.com/in") => (
  url = url.slice((url || "").lastIndexOf("/") + 1).split(/\?\#/)[0],
  base.charAt(base.length - 1) === "/" && (base + url) || (base + "/" + url)
);

// Helper function to parse description.
const parseDescription = description => (
  (description || "").split("·").reduce((out, cur, i) => {
    let [key, value] =  (cur || "").split(":");
    !i && (out.description = key.trim())
    || (value && (out[(key = key.trim()).charAt(0).toLowerCase() + key.slice(1)] = value.trim()))
    return out;
  }, {})
);

// Helper function to get metadata from metatags.
const extractProfileMetadata = metaTags => ({
  title: metaTags.title || metaTags["og:title"] || metaTags["twitter:title"],
  ...parseDescription(metaTags.description || metaTags["og:description"] || metaTags["twitter:description"]),
  firstName: metaTags["profile:first_name"],
  lastName: metaTags["profile:last_name"],
  image: metaTags["twitter:image"],
  linkedIn: metaTags["og:url"]
});

// Main function to get the linkedIn profile metadata.
const scrapLinkedInProfileMetadata = async profileUrl => (
  scrapMetatags(getProfileUrl(profileUrl))
  .then(metaTags => (
    extractProfileMetadata(metaTags)
  ))
);

// Exports.
scrapLinkedInProfileMetadata.getProfileUrl = getProfileUrl;
scrapLinkedInProfileMetadata.extractProfileMetadata = extractProfileMetadata;

/**
 * @ignore
 * Default export with freezing.
 */
module.exports = Object.freeze(Object.defineProperty(scrapLinkedInProfileMetadata, "scrapLinkedInProfileMetadata", {
  value: scrapLinkedInProfileMetadata
}));