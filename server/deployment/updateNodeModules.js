const sendCommand = require("./sendCommand");

// Helper function to update the node modules.
const updateNodeModules = params => sendCommand(
  params,
  "cd server",
   "npm install"
);

// Export.
module.exports = Object.freeze(Object.defineProperty(updateNodeModules, "updateNodeModules", {
  value: updateNodeModules
}));