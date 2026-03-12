const updateNodeModules = require("../updateNodeModules");
const { PARAMS } = require("../globals");

// Update node modules.
updateNodeModules(PARAMS)
.then(() => {
  console.log("✅ Update node modules done")
})
.catch(error => {
  console.error("⛔️ ", error);
});