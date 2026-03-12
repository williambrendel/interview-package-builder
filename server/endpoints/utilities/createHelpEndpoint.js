"use strict";

const createEndpoint = require("./createEndpoint");
const getEndpoints = require("./getEndpoints");

/**
 * @function createHelpEndpoint
 *
 * @description
 * Creates a GET {@link Endpoint} that renders an HTML directory of all registered
 * endpoints, optionally excluding specific routes from the listing.
 *
 * The generated page displays each endpoint's name, HTTP method, route (as a
 * clickable anchor for GET routes), and description. The endpoint list is
 * sourced from {@link getEndpoints}, with any blacklisted entries filtered out
 * before the HTML is built.
 *
 * @param {string}    [route="/help"] - Route path to mount the help endpoint on.
 *                                      Defaults to `"/help"` if omitted or falsy.
 * @param {...string} blacklist       - Zero or more route names or paths to exclude
 *                                      from the rendered endpoint listing.
 *
 * @returns {Endpoint} A normalized GET {@link Endpoint} descriptor whose `process`
 *                     handler responds with the pre-built HTML directory page.
 *
 * @example
 * // Default route, no exclusions
 * const helpEp = createHelpEndpoint();
 * // helpEp.method → "get"
 * // helpEp.route  → "/help"
 *
 * @example
 * // Custom route, with exclusions
 * const helpEp = createHelpEndpoint("/docs", "healthcheck", "root");
 * // helpEp.route  → "/docs"
 * // "healthcheck" and "root" endpoints are omitted from the listing
 */
const createHelpEndpoint = (route, endpoints, ...blacklist) => {
  // Normalize input.
  blacklist.push(endpoints);
  blacklist = blacklist.flat(Infinity);
  endpoints = [];
  let j = 0;
  for (const v of blacklist) {
    v && (
      typeof v === "string" && (blacklist[j++] = v)
      || (typeof v === "object" && endpoints.push(v))
    )
  }
  blacklist.length = j;
  endpoints.length || (endpoints = getEndpoints(...blacklist));

  // Create html.
  const description = "List of all endpoints";
  let html = `<!DOCTYPE html>
  <html lang="en-us">
    <head>
    </head>
    <body>
      <h1>Help</h1>
      ${description}
      <br/>
      <br/>
  `;

  for (let i = 0, l = endpoints.length; i !== l; ++i) {
    const {name, method = "GET", route, description } = endpoints[i];
    html += `
      <hr/>
      <h2>${name}</h2>
      <ul style="line-height: 150%">
      <li>
          <b>Method:</b> ${method.toUpperCase()}
        </li>
        <li>
          <b>Route:</b> ${method.toLowerCase() === "get" && `<a href="${route}" target="_blank" title="Route for ${name}">${route}</a>` || route}
        </li>
        <li>
          <b>Description:</b> ${description || "none"}
        </li>
      </ul>
      <br/>
      <br/>
  `
  }
  
  html += "  </body>\n</html>";

  // Endpoint.
  return createEndpoint("get", route || "/help", (req, res) => {
    res.send(html);
  }, "help", description);
}

/**
 * @ignore
 * Default export with freezing.
 */
module.exports = Object.freeze(Object.defineProperty(createHelpEndpoint, "createHelpEndpoint", {
  value: createHelpEndpoint
}));