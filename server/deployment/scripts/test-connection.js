const testConnection = require("../testConnection");
const { PARAMS } = require("../globals");

// Test connection.
testConnection(PARAMS)
.then(() => {
  console.log("✅ Test Connection done")
})
.catch(error => {
  console.error("⛔️ ", error);
});