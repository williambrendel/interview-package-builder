const Globals = {
  OUTPUT_PATH: "server",
  PARAMS: "../secrets/dev.json",
  INPUT: [
    "./database",
    "./endpoints",
    "./io",
    "./secrets",
    "./app.js",
    "./package.json"
  ]
}

// Export.
module.exports = Object.freeze(Object.defineProperty(Globals, "Globals", {
  value: Globals
}));
