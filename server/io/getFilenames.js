"use strict";

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * @function makeSet
 * @description Coerces a variety of input types into a `Set`.
 *
 * | Input type    | Result                           |
 * |---------------|----------------------------------|
 * | `Set`         | Returned as-is                   |
 * | falsy         | Empty `Set`                      |
 * | `Array`       | `new Set(input)`                 |
 * | `string`      | `new Set([input])`               |
 * | any iterable  | `new Set(Array.from(input))`     |
 *
 * @param {Set|Array|string|Iterable|*} input - Value to coerce.
 * @returns {Set} A `Set` representation of the input.
 */
const makeSet = input => {
  (input instanceof Set)
  || (!input && (input = new Set))
  || (Array.isArray(input) && (input = new Set(input)))
  || (
    (typeof input === "string" && (input = new Set([input])))
    || (input = new Set(Array.from(input) || []))
  );
  return input;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} GetFilenamesOptions
 * @description Options object for {@link getFilenames}.
 *
 * @property {number}           [modifiedTime]                       - Maximum file age in
 *                                                                      milliseconds. Files whose
 *                                                                      `mtime` is older than
 *                                                                      `Date.now() - modifiedTime`
 *                                                                      are excluded.
 * @property {Set|Array|string} [blacklist=["node_modules","secrets"]] - File or directory names
 *                                                                      to skip entirely.
 * @property {Set|Array|string} [extensions=".js"]                   - Allowed file extensions
 *                                                                      (with or without leading
 *                                                                      `"."`). Matching is
 *                                                                      case-insensitive.
 * @property {boolean|string}   [relative]                           - If `true`, paths are made
 *                                                                      relative to `__dirname`.
 *                                                                      If a string, relative to
 *                                                                      that directory. Omit for
 *                                                                      absolute paths.
 * @property {boolean}          [recursive=true]                     - When `false`, only the
 *                                                                      top-level directory is
 *                                                                      scanned. Defaults to `true`.
 */

/**
 * @function getFilenames
 * @description
 * Collects file paths under a given file or directory path, applying optional
 * filters for extension, blacklist, and modification time.
 *
 * If `filepath` points to a **file**, it is returned directly (subject to
 * `extensions` and `modifiedTime` filters). If it points to a **directory**,
 * its contents are scanned recursively and filtered entry-by-entry.
 *
 * **Extension normalization:** each entry in `extensions` is lower-cased and
 * a `"."` prefix is added if absent, so `"js"`, `".js"`, and `".JS"` are
 * all equivalent.
 *
 * **Inclusion rules (all must pass):**
 * - Entry name is not in `blacklist`.
 * - File extension (lower-cased) is in `extensions` (or `extensions` is empty).
 * - If `modifiedTime` is set, `Date.now() - mtime < modifiedTime`.
 *
 * @param {string} filepath
 *   Path to a file or directory to scan.
 * @param {GetFilenamesOptions} [options={}]
 *   Filtering and output options.
 *
 * @returns {string[]} Matched file paths. Absolute unless `options.relative` is
 *                     set, in which case paths are prefixed with `"./"` or `"../"`.
 *                     Returns an empty array if nothing matches.
 *
 * @throws {NodeJS.ErrnoException} If `fs.readdirSync` or `fs.lstatSync` fails
 *                                 (e.g. `ENOENT`, `EACCES`).
 * @throws {Error} If `filepath` is neither a file nor a directory.
 *
 * @example
 * // All .js files under a directory
 * const files = getFilenames("/app/routes");
 *
 * @example
 * // Single file input
 * const files = getFilenames("/app/routes/index.js");
 * // => ["/app/routes/index.js"]  (or [] if filtered out)
 *
 * @example
 * // .ts files modified in the last 60 s, relative paths, top-level only
 * const files = getFilenames("/app/src", {
 *   extensions: ".ts",
 *   modifiedTime: 60_000,
 *   relative: true,
 *   blacklist: ["node_modules", "__tests__"],
 *   recursive: false
 * });
 */
const getFilenames = (
  filepath,
  {
    modifiedTime,
    blacklist = ["node_modules", "secrets"],
    extensions = ".js",
    relative,
    recursive = true
  } = {}
) => {
  relative === true && (relative = __dirname);

  // Normalize filters.
  blacklist  = makeSet(blacklist);
  extensions = makeSet(extensions);
  extensions.forEach(v => extensions.add(v.toLowerCase()));
  extensions.forEach(v => v.charAt(0) !== "." && extensions.add("." + v));

  // Resolve and stat the input path.
  const resolved = path.resolve(filepath);
  const stat     = fs.lstatSync(resolved);

  let files = [];

  if (stat.isFile()) {
    const ext  = path.extname(resolved).toLowerCase();
    const aged = modifiedTime && (Date.now() - stat.mtimeMs >= modifiedTime);
    const extOk = !extensions.size || extensions.has(ext);
    !aged && extOk && files.push(resolved);

  } else if (stat.isDirectory()) {
    const entries = fs.readdirSync(resolved, { recursive, withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (blacklist.has(entry.name)) continue;

      const ext = path.extname(entry.name).toLowerCase();
      if (extensions.size && !extensions.has(ext)) continue;

      const fullPath = path.resolve(entry.parentPath || entry.path, entry.name);

      if (blacklist.has(path.basename(path.dirname(fullPath)))) continue;
      if (modifiedTime) {
        const { mtimeMs } = fs.lstatSync(fullPath);
        if (Date.now() - mtimeMs >= modifiedTime) continue;
      }

      files.push(fullPath);
    }
  } else {
    throw new Error(`"${resolved}" is neither a file nor a directory.`);
  }

  if (relative) {
    files = files.map(file => {
      file = path.relative(relative, file);
      return file.startsWith("../") ? file : "./" + file;
    });
  }

  return files;
}

/**
 * @ignore
 * Default export with freezing.
 */
module.exports = Object.freeze(Object.defineProperty(getFilenames, "getFilenames", {
  value: getFilenames
}));