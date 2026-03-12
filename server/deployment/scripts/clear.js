const clear = require("../clear");
const { PARAMS } = require("../globals");

// Clear.
clear(PARAMS)
.then(() => {
  console.log("✅ Clear done")
})
.catch(error => {
  console.error("⛔️ ", error);
});