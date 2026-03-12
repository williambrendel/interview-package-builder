const sendCommand = require("./sendCommand");

// Helper function to clear content, except node_module folder.
const clear = params => sendCommand(
  params,
  `rm -v -R !("node_modules")`
);

// Export.
module.exports = Object.freeze(Object.defineProperty(clear, "clear", {
  value: clear
}));