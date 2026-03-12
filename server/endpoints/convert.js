"use strict";

const { createEndpoint, statuses: { OK, BAD_REQUEST } } = require("./utilities");
const generateDownloadablePdf = require("../io/generateDownloadablePdf");

// ---------------------------------------------------------------------------
// Endpoint
// ---------------------------------------------------------------------------

/**
 * @type {Endpoint}
 * @description
 * POST endpoint that accepts a Markdown string and returns a downloadable PDF
 * binary stream, styled with the "Executive Tech" resume theme.
 *
 * The request body is expected to be a JSON object. The Markdown content is
 * resolved from the first truthy value among: `markdown`, `md`, `content`,
 * `data`, `message`, `msg`.
 *
 * @param {Object}  req                      - Express request object.
 * @param {Object}  [req.body]               - POST payload.
 * @param {string}  [req.body.markdown]      - Markdown string (highest priority).
 * @param {string}  [req.body.md]            - Alias for `markdown`.
 * @param {string}  [req.body.content]       - Alias for `md`.
 * @param {string}  [req.body.data]          - Alias for `content`.
 * @param {string}  [req.body.message]       - Alias for `data`.
 * @param {string}  [req.body.msg]           - Alias for `message` (lowest priority).
 * @param {Object}  res                      - Express response object.
 *
 * @returns {void} Responds with one of:
 * | Status            | Body                        | Condition                        |
 * |-------------------|-----------------------------|----------------------------------|
 * | `400 Bad Request` | `{ error }`                 | Missing or invalid Markdown input |
 * | `200 OK`          | PDF binary stream           | Success                          |
 */
const convert = createEndpoint("post", "/convert", async (req, res) => {
  const {
    msg, message = msg,
    data = message,
    content = data,
    md = content,
    markdown = md,
  } = req.body || {};

  if (!markdown) {
    res.status(BAD_REQUEST).json({ error: "Please provide a markdown string to convert." });
    return;
  }

  try {
    const pdf = await generateDownloadablePdf(markdown);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
    res.setHeader("Content-Length", pdf.length);
    res.status(OK).send(pdf);

  } catch (error) {
    console.error("❌ convert error:", error);
    res.status(BAD_REQUEST).json({
      error: error instanceof Error
        ? { message: error.message, name: error.name, stack: error.stack }
        : error
    });
  }
});

/**
 * @ignore
 * Default export with freezing.
 */
module.exports = Object.freeze(Object.defineProperty(convert, "convert", {
  value: convert
}));