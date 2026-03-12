// Utility function to make a function async.
const asyncify = func => (
  typeof func === "function"
  && !func.constructor.name.toLowerCase().includes("async")
  && async function(...args) { return func(...args); }
  || func
);

// Export.
module.exports = Object.freeze(Object.defineProperty(asyncify, "asyncify", {
  value: asyncify
}));
