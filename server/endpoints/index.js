const {
  getEndpoints,
  createHelpEndpoint,
  createHealthCheckEndpoints
} = require("./utilities");

const endpoints = module.exports = getEndpoints();

// Add root and help endpoints if needed.
let hasRoot = false, hasHelp = false;
for (let i = 0, l = endpoints.length; i !== l; ++i) {
  endpoints[i].route === "/" && (hasRoot = true);
  endpoints[i].route === "/help" && (hasHelp = true);
}

hasRoot || endpoints.unshift(createHelpEndpoint("/", endpoints, "/"));
hasHelp || endpoints.push(createHelpEndpoint("/help", endpoints, "/help"));

endpoints.push(...createHealthCheckEndpoints("/healthcheck"));