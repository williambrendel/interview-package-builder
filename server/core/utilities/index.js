"use strict";

const math = require("./math");
const { correctQuery, createSpellingEngine } = require("./correctQuery");

module.exports = Object.freeze({
  // Math utilities.
  ...math,

  // Spell checking utilities.
  correctQuery,
  createSpellingEngine
});