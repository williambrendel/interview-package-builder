"use strict";

const createEndpoint = require("./createEndpoint");
const createHealthCheckEndpoints = require("./createHealthCheckEndpoints");
const createHelpEndpoint = require("./createHelpEndpoint");
const getEndpoints = require("./getEndpoints");
const httpCodes = require("./httpCodes");

/**
 * @ignore
 * Default export.
 */
module.exports = {
  createEndpoint,
  createHealthCheckEndpoints,
  createHelpEndpoint,
  getEndpoints,
  httpCodes,
  statuses: httpCodes.statuses
}