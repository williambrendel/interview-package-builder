"use strict";

const express = require("express");
const endpoints = require("./endpoints") || [];
const Middlewares = require("./endpoints/middlewares") || {};
const app = express();

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * @type {number}
 * @description Port the HTTP server listens on.
 */
const PORT = 3001;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// Register application-level middlewares exported from the middlewares module.
for (const k in Middlewares) {
  app.use(Middlewares[k]);
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/**
 * @description
 * Registers each {@link Endpoint} descriptor from the endpoints registry onto
 * the Express application. Each descriptor must carry a valid `method`,
 * `route`, and `process` handler.
 *
 * @throws {Error} If an endpoint descriptor has a falsy `method` field.
 */
for (let i = 0, l = endpoints.length; i !== l; ++i) {
  const { method, route, middlewares, process } = endpoints[i];
  if (!method) throw Error(`⛔️ Empty method for ${JSON.stringify(endpoints[i] || {})}`);
  console.log(`🖥️ Initializing ${method.toUpperCase()} ${route}`);
  app[method](route, ...middlewares, process);
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

/**
 * @type {import("http").Server}
 * @description
 * Active HTTP server instance. Timeout values are tuned to remain within
 * AWS Elastic Load Balancer's idle timeout window:
 * - `keepAliveTimeout` — 65 s (must exceed ELB's 60 s idle timeout).
 * - `headersTimeout`   — 80 s (must exceed `keepAliveTimeout`).
 */
const server = app.listen(PORT, () => {
  console.log(`✅ listen to ${PORT}`);
});
server.keepAliveTimeout = 65000;
server.headersTimeout   = 80000;

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/**
 * @type {import("express").Application}
 * @description The configured Express application instance.
 */
module.exports = app;