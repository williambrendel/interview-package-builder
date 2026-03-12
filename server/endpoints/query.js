"use strict";

const path = require("path");
const fs = require("fs").promises;
const multer = require("multer");
const { createEndpoint, statuses: { OK, BAD_REQUEST } } = require("./utilities");
const { parseResponseJson } = require("../io/parseResponseJson");
const {
  extractProfileMetadata,
  getProfileUrl,
  scrapMetatags,
  extractLinkedInUsername
} = require("../core/utilities/webscraping");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB in bytes
    files: 5                   // Maximum 5 files per request
  }
});
const { MarkItDown } = require("markitdown-ts");
const run = require("../core/llms/claude");
const printStatistics = require("../core/llms/printStatistics");
const { HAIKU45_CONFIG, SONNET45_CONFIG, temperature } = require("../core/llms/claude/config");

const PROMPT = fs.readFile(path.join(__dirname, "../prompts/create-resume.xml"), "utf-8");

// ---------------------------------------------------------------------------
// Endpoint
// ---------------------------------------------------------------------------

/**
 * @type {Endpoint}
 * @description
 * POST endpoint that accepts a natural language query, corrects its spelling,
 * vectorizes it, and returns a result.
 *
 * The request body is expected to be a JSON object. The query is resolved
 * from the first truthy value among: `q`, `question`, `query`, `data`,
 * `message`, `msg`.
 *
 * **Pre-loaded resources:** the spelling engine is initialized at module load
 * time via {@link spellingEnginePromise} and awaited on each request — after
 * the first request the promise resolves instantly.
 *
 * @param {Object}  req                    - Express request object.
 * @param {Object}  [req.body]             - POST payload.
 * @param {string}  [req.body.q]           - Query string (highest priority).
 * @param {string}  [req.body.question]    - Alias for `q`.
 * @param {string}  [req.body.query]       - Alias for `question`.
 * @param {string}  [req.body.data]        - Alias for `query`.
 * @param {string}  [req.body.message]     - Alias for `data`.
 * @param {string}  [req.body.msg]         - Alias for `message` (lowest priority).
 * @param {Object}  res                    - Express response object.
 *
 * @returns {void} Responds with one of:
 * | Status            | Body                        | Condition                          |
 * |-------------------|-----------------------------|------------------------------------|
 * | `400 Bad Request` | `{ error, query }`          | Spelling correction or vectorization failed |
 * | `200 OK`          | `{ ...output }`             | Success                            |
 *
 * @todo Implement vector search / response generation and populate `output`.
 */
const query = createEndpoint("post", "/query", upload.array("files"), async (req, res) => {
  let {
    msg, message = msg,
    data = message,
    query = data,
    question = query,
    q = question,
  } = req.body || {}, output = {};

  // req.files is now an array of objects containing Buffers
  const files = (req.files || []).map(file => ({
    name: file.originalname,
    mimtype: file.mimetype,
    data: file.buffer
  }));

  // Get prompt.
  const prompt = await PROMPT;

  try {
    // Read files.
    console.log("files:", files.length);
    let j = 0;
    for (let i = 0, l = files.length; i !== l; ++i) {
      const file = files[j], {
        name,
        data
      } = file;

      // Assess if we need to convert to markdown, like docx.
      // Assess if we need to encode content as utf-8 or base 64.
      const ext = (path.extname(name) || "").toLowerCase();
      switch (ext) {
        case ".txt":
        case ".md":
        case ".json":
        case ".xml":
        case ".htm":
        case ".html":
          (file.data = data.toString("utf-8")) && ++j;
          break;
        case ".pdf":
        case ".doc":
        case ".docx":
        case ".csv":
          const markitdown = new MarkItDown();
          const converted = await markitdown.convertBuffer(data, {
            file_extension: ext 
          });
          (file.data = converted.markdown.toString("utf-8")) && ++j;
          // console.log("converted:", file.data);
          break;
        default:
      }
    }
    files.length = j;
    q && files.unshift({ data: q });

    if (!files.length) {
      // Return output.
      res.status(OK).json({
        error: "Please provide your resume."
      });
      return;
    }

    // Try to scrap linkedin profile.
    let linkedin = new Set();
    for (const { data } of files) {
      const usernames = extractLinkedInUsername(data);
      for (const username of usernames) linkedin.add(username);
    }
    linkedin = Array.from(linkedin);
    const linkedProfileMetadata = [];
    for (const username of linkedin) linkedProfileMetadata.push(
      extractProfileMetadata(await scrapMetatags(getProfileUrl(username)))
    );
    linkedProfileMetadata.length && files.push({
      data: `LinkedIn profile(s) to improve for better visibility: ${JSON.stringify(linkedProfileMetadata)}`
    });
    console.log("linkedProfileMetadata:", linkedProfileMetadata);

    // Create config based on the complexity of the documents.
    const CONFIG = {
      ...getConfig(prompt, files),
      temperature: 0
    };

    // run llm.
    const response = await run(CONFIG, { data: prompt, enableCache: true }, ...files);

    // Print statistics.
    printStatistics(response);

    // Parse response.
    output = parseResponseJson(response.output.text);
    // console.log(output);

  } catch (error) {
    res.status(BAD_REQUEST).json({ error, query: q, files: files.map(f => f.name) });
    return;
  }

  // Return output.
  res.status(OK).json(output);
});

// Create config based on the complexity of the documents.
const getConfig = (prompt, docs, threshold = 20000) => {
  const totalChars = (prompt || "").length
    + docs.reduce((sum, f) => sum + (typeof f.data === "string" ? f.data.length : 0), 0);
  console.log(`📄 Total input chars: ${totalChars} — using ${totalChars > threshold ? "Sonnet" : "Haiku"}`);
  return totalChars > threshold ? SONNET45_CONFIG : HAIKU45_CONFIG;
};

/**
 * @ignore
 * Default export with freezing.
 */
module.exports = Object.freeze(Object.defineProperty(query, "query", {
  value: query
}));