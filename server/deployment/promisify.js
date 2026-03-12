const asyncify = require("./asyncify");

// Helper function to promisify a function.
const promisify = (
  func
) => typeof (func = asyncify(func)) === "function"
&& async function (...args) {
  return new Promise(async function (resolve, reject) {
    try {
      const res = await func(...args);
      resolve && resolve(res);
    } catch (error) {
      if (reject) reject(error);
      else throw error;
    }
  });
} || func;

// Export.
module.exports = Object.freeze(Object.defineProperty(promisify, "promisify", {
  value: promisify
}));