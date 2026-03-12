"use strict";

/**
 * @typedef {Object} Endpoint
 * @property {string}     method        - HTTP method in lowercase (e.g. `"get"`, `"post"`).
 * @property {string}     route         - Normalized route path, always prefixed with `"/"`.
 * @property {string}     name          - Display name; derived from `route` if omitted.
 *                                        The root route `"/"` normalizes to `"root"`;
 *                                        any other leading `"/"` is stripped.
 * @property {string}     [description] - Optional human-readable description.
 * @property {Function[]} middlewares   - Express-compatible middleware functions applied
 *                                        before `process`. Always an array; empty if none
 *                                        were provided. Accepts a single `middleware`
 *                                        property on object-form configs as an alias.
 * @property {Function}   process       - Express-compatible handler `(req, res) => void`.
 *                                        Defaults to a minimal HTML info-page for the endpoint.
 * @property {Function}   toString      - Returns a pretty-printed JSON representation
 *                                        of the descriptor (non-enumerable).
 */

/**
 * @function createEndpoint
 *
 * @description
 * Creates and returns a normalized HTTP endpoint descriptor from either a
 * config object or positional arguments.
 *
 * Normalization rules applied (in order):
 * 1. If `type` is already an object it is shallow-cloned and used as the config;
 *    otherwise a new config object is constructed from the positional arguments.
 * 2. `method` is coerced to lowercase; falls back to `type.type`, then `"get"`.
 * 3. `route` falls back to `type.path`, then `type.name`, then `"/"`.
 *    Leading whitespace is trimmed and a `"/"` prefix is guaranteed.
 * 4. `name` falls back to `route`.
 *    - A `name` of `"/"` is replaced with `"root"`.
 *    - Otherwise any leading `"/"` is stripped.
 * 5. `process` defaults to an Express handler that returns a minimal HTML page
 *    displaying the endpoint's metadata.
 * 6. A non-enumerable `toString` method is defined (if absent) that serialises the
 *    descriptor to indented JSON.
 *
 * @param {Object|string} type
 *   Either a configuration object (see {@link Endpoint}) **or** the HTTP method
 *   string (e.g. `"get"`, `"POST"`) when using positional-argument form.
 * @param {string}   [route]       - Route path (positional form only).
 * @param {Function} [process]     - Express request handler `(req, res) => void`
 *                                   (positional form only).
 * @param {string}   [name]        - Display name for the endpoint
 *                                   (positional form only).
 * @param {string}   [description] - Human-readable description
 *                                   (positional form only).
 *
 * @returns {Endpoint} A normalized endpoint descriptor object.
 *
 * @example
 * // Object (config) form
 * const ep = createEndpoint({
 *   method: "POST",
 *   route: "/users",
 *   name: "Create User",
 *   description: "Creates a new user record.",
 *   process: (req, res) => res.json({ ok: true })
 * });
 * // ep.method  → "post"
 * // ep.route   → "/users"
 * // ep.name    → "users"   (leading "/" stripped)
 *
 * @example
 * // Positional-argument form
 * const ep = createEndpoint("GET", "/health", (_, res) => res.send("OK"), "health");
 * // ep.method → "get"
 * // ep.route  → "/health"
 * // ep.name   → "health"
 *
 * @example
 * // Minimal form — defaults only
 * const ep = createEndpoint("get", "/");
 * // ep.method  → "get"
 * // ep.route   → "/"
 * // ep.name    → "root"
 * // ep.process → default HTML info-page handler
 */
const createEndpoint = (
  type,
  route,
  ...processes
) => (
  type = type && typeof type === "object" && {...type} || {
    method: type,
    route,
    description: typeof processes[processes.length - 1] === "string" && typeof processes[processes.length - 2] === "string" && processes.pop(),
    name: typeof processes[processes.length - 1] === "string" && processes.pop(),
    process: processes.pop(),
    middlewares: processes
  },
  type.method = (type.type || type.method || "get").toLowerCase(),
  type.route || (type.route = type.path || type.name || "/"),
  type.route = type.route.trim(),
  type.route.startsWith("/") || (type.route = "/" + type.route),
  type.name || (type.name = type.route),
  type.name === "/" && (type.name = "root") || (
    type.name.startsWith("/") && (type.name = type.name.slice(1))
  ),
  Array.isArray(type.middlewares) || (type.middlewares = [type.middlewares]),
  type.middleware && (
    type.middlewares.push(type.middleware),
    delete type.middleware
  ),
  type.middlewares = type.middlewares.flat(Infinity).filter(f => typeof f === "function"),
  typeof type.process === "function" || (
    type.process = (_, res) => res.send(`<!DOCTYPE html>
<html lang="en-us">
  <head>
  </head>
  <body>
    <h1>${type.name}</h1>
    ${type.description || ""}
    <br/>
    <ul style="line-height: 150%">
    <li>
        <b>Method:</b> ${type.method.toUpperCase()}
      </li>
      <li>
        <b>Route:</b> ${type.route}
      </li>
      <li>
        <b>Description:</b> ${type.description || "none"}
      </li>
    </ul>
  </body>
</html>`)
  ),
  type.toString || Object.defineProperty(type, "toString", {
    value: () => {
      return JSON.stringify(type, null, 2);
    }
  }),
  type
);

/**
 * @ignore
 * Default export with freezing.
 */
module.exports = Object.freeze(Object.defineProperty(createEndpoint, "createEndpoint", {
  value: createEndpoint
}));