"use strict";

const path = require("path");
const fs = require("fs");
const getFilenames = require("./getFilenames");

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} RequireFilesOptions
 * @description Options object for {@link requireFiles}.
 *
 * @property {Function}         [reject]       - Error handler invoked with an `Error`
 *                                               when a file cannot be required after all
 *                                               resolution strategies are exhausted.
 *                                               Defaults to `console.error`. Pass `null`
 *                                               to suppress error reporting.
 * @property {number}           [modifiedTime] - Maximum file age in milliseconds.
 *                                               Forwarded to {@link getFilenames}.
 * @property {Set|Array|string} [blacklist]    - File or directory names to exclude.
 *                                               Forwarded to {@link getFilenames}.
 * @property {Set|Array|string} [extensions]   - Allowed file extensions.
 *                                               Forwarded to {@link getFilenames}.
 * @property {boolean|string}   [relative]     - Relative-path base for discovered
 *                                               filenames. `true` resolves to the
 *                                               directory of `requireFiles` itself.
 *                                               Forwarded to {@link getFilenames}.
 * @property {boolean}          [recursive=true] - Whether to recurse into subdirectories.
 *                                               Forwarded to {@link getFilenames}.
 */

/**
 * @function requireFiles
 * @description
 * Discovers and `require`s all matching files under `dir`, returning their
 * exported values as an array. Falsy exports are silently omitted.
 *
 * **Resolution strategy** — for each discovered filename, three `require`
 * attempts are made in order until one succeeds:
 * 1. `require(filename)` — absolute or already-resolvable path.
 * 2. `require(path.join(dir, filename))` — relative to the scan directory.
 * 3. `require(path.join("./", filename))` — relative to the working directory.
 *
 * If all three attempts throw, `reject` is called with an aggregated `Error`
 * and the file is skipped.
 *
 * @param {string}               dir                          - File or directory path to scan.
 * @param {RequireFilesOptions}  [options]                    - Load and filter options.
 * @param {Function}             [options.reject]             - Error handler for failed requires.
 * @param {number}               [options.modifiedTime]       - Maximum file age in ms.
 * @param {Set|Array|string}     [options.blacklist]          - Names to exclude.
 * @param {Set|Array|string}     [options.extensions]         - Allowed extensions.
 * @param {boolean|string}       [options.relative]           - Relative-path base.
 * @param {boolean}              [options.recursive=true]     - Recurse into subdirectories.
 *
 * @returns {Array<*>} Array of exported values from all successfully required
 *                     files. Falsy exports are excluded. Returns an empty array
 *                     if no files are discovered or all fail to load.
 *
 * @throws Never — load errors are routed to `reject` and the offending file
 *                 is skipped, so the function always returns an array.
 *
 * @example
 * // All .js files under a directory
 * const modules = requireFiles("/app/routes");
 *
 * @example
 * // With blacklist and relative paths
 * const modules = requireFiles("/app/routes", {
 *   blacklist: ["index.js", "middlewares"],
 *   relative: true
 * });
 *
 * @example
 * // Suppress error reporting
 * const modules = requireFiles("/app/routes", { reject: null });
 *
 * @example
 * // Custom error handler
 * const modules = requireFiles("/app/routes", { reject: err => logger.warn(err) });
 */
const requireFiles = (dir, {
  reject,
  modifiedTime,
  blacklist,
  extensions,
  relative,
  recursive = true
} = {}) => {
  dir || (dir = path.dirname(path.dirname(__filename)));
  relative === true && (relative = dir);

  const filenames = getFilenames(dir, {
    modifiedTime,
    blacklist,
    extensions,
    relative,
    recursive
  });

  const output = [];
  for (const filename of filenames) {
    let paths = new Set([
      filename,
      path.resolve(dir || "", filename),
      path.join("./", filename),
      path.resolve(relative, filename),
      path.resolve(path.dirname(__filename), filename),
      path.resolve(path.dirname(path.dirname(__filename)), filename),
      path.resolve(dir, "endpoints", filename),
      path.resolve(relative, "endpoints", filename)
    ]), out, e;

    for (const p of paths) {
      if (!fs.existsSync(p)) continue;
      try {
        out = require(p);
        out && output.push(out);
      } catch (err) {
        // File exists but failed to load — report and stop trying other paths.
        reject && reject(err);
        console.error(err);
      }
      break; // either succeeded or failed — don't try other paths
    }
    out || (
      e = new Error(`Failed requiring:\n•  ${Array.from(paths).join("\n•  ")}`),
      reject && reject(e),
      console.error(e)
    );
  }
  return output;
}

/**
 * @ignore
 * Default export with freezing.
 */
module.exports = Object.freeze(Object.defineProperty(requireFiles, "requireFiles", {
  value: requireFiles
}));