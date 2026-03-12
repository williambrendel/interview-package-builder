"use strict";

const createEndpoint = require("./createEndpoint");
const { statuses: { OK } } = require("./httpCodes");

/**
 * @type {string}
 * @description Static HTML response body returned by the GET healthcheck endpoint.
 */
const GET_CONTENT = `<!DOCTYPE html>
<html lang="en-us">
  <head>
  </head>
  <body>
    <h1>Health Check</h1>
    Success!
  </body>
</html>`;

/**
 * @type {{ msg: string }}
 * @description Static JSON response body returned by the POST healthcheck endpoint.
 */
const POST_CONTENT = {
  msg: "Healtcheck succeeded"
};

/**
 * @typedef {Object} HealthCheckEndpoints
 * @property {Endpoint} 0 - GET healthcheck endpoint. Responds with an HTML success page.
 * @property {Endpoint} 1 - POST healthcheck endpoint. Responds with a JSON success message.
 */

/**
 * @function createHealthCheckEndpoints
 *
 * @description
 * Creates a pair of GET and POST {@link Endpoint} descriptors used to verify
 * that the server (EC2 instance) is alive and reachable.
 *
 * Both endpoints share the same route and return a `200 OK` response:
 * - **GET** responds with a minimal HTML success page.
 * - **POST** responds with a JSON object `{ msg: "Healthcheck succeeded" }`.
 *
 * @param {string} [route="/healthcheck"] - Route path to mount both endpoints on.
 *                                          Defaults to `"/healthcheck"` if omitted or falsy.
 *
 * @returns {HealthCheckEndpoints} A two-element array of normalized {@link Endpoint} descriptors.
 *
 * @example
 * // Default route
 * const [getEp, postEp] = createHealthCheckEndpoints();
 * // getEp.method  → "get"
 * // getEp.route   → "/healthcheck"
 * // postEp.method → "post"
 * // postEp.route  → "/healthcheck"
 *
 * @example
 * // Custom route
 * const [getEp, postEp] = createHealthCheckEndpoints("/ping");
 * // getEp.route  → "/ping"
 * // postEp.route → "/ping"
 */
const createHealthCheckEndpoints = route => {
 // Endpoint.
  return [
    createEndpoint("get", route || "/healthcheck", (req, res) => {
      res.status(OK).send(GET_CONTENT);
    }, "healthcheck", "Healthcheck GET endpoint"),
    createEndpoint("post", route || "/healthcheck", (req, res) => {
      res.status(OK).json(POST_CONTENT);
    }, "healthcheck", "Healthcheck POST endpoint")
  ];
}

/**
 * @ignore
 * Default export with freezing.
 */
module.exports = Object.freeze(Object.defineProperty(createHealthCheckEndpoints, "createHealthCheckEndpoints", {
  value: createHealthCheckEndpoints
}));