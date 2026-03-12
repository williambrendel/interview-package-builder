const clear = require("./clear");
const promisify = require("./promisify");
const upload = require("./upload");
const updateNodeModules = require("./updateNodeModules");

// Helper function to deploy.
const deploy = promisify(async (input, params, outputPath) => {
  try {
    const res = [];
    res.push(await clear(params)); // Clear server folder except node_modules
    res.push(await upload(input, params, outputPath)); // Upload endpoints
    res.push(await updateNodeModules(params)); // Update node modules
    return res;
  } catch (error) {
    throw error;
  }
});

// Export.
module.exports = Object.freeze(Object.defineProperty(deploy, "deploy", {
  value: deploy
}));