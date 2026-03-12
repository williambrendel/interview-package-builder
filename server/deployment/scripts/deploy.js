const deploy = require("../deploy");
const {
  INPUT,
  PARAMS,
  OUTPUT_PATH,
} = require("../globals");

// Deploy.
deploy(INPUT, PARAMS, OUTPUT_PATH)
.then(() => {
  console.log("✅ Deployment done")
})
.catch(error => {
  console.error("⛔️ ", error);
});