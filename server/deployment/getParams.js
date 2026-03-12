const fs = require("fs");
const Path = require("path");

// Helper function to get input parameters.
const getParams = params => {
  // Normalize input. Load connection file if necessary.
  typeof params === "string" && (params = require(params));
  const {
    server,
    instance = server,
    ec2 = instance,
    connection = ec2
  } = params || {};

  try {
    const c = typeof connection === "string" && require(connection) || connection || {},
    p = c.server || c.ec2 || c.instance || c || {};
    p && (params = p);
  } catch {}
  params.username || (params.username = params.user);
  delete params.user;

  // Check if we have the necessary info for connection.
  if (!(params.host && params.username && (
    params.password ||
    params.privateKey ||
    params.passphrase
  ))) {
    throw Error(`Missing parameters ${JSON.stringify(params || {})}`);
  }
  
  // Grab passkey from a file if needed.
  let pk;
  if (typeof params.privateKey === "string") {
    try {
      pk = fs.readFileSync(params.privateKey);
    } catch {}
    if (!pk) {
      try {
        pk = fs.readFileSync(Path.join("../", params.privateKey));
      } catch {}
    }
    if (!pk) {
      try {
        pk = fs.readFileSync(Path.resolve(__dirname, "server/", params.privateKey));
      } catch {}
    }
    if (!pk) {
      try {
        pk = fs.readFileSync(Path.resolve(__dirname, "server/../", params.privateKey));
      } catch {}
    }
  }

  pk && (params.privateKey = pk);

  return params;
}

// Export.
module.exports = Object.freeze(Object.defineProperty(getParams, "getParams", {
  value: getParams
}));