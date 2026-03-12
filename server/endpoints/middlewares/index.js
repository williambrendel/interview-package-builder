// Placeholder for additional middlewares.
module.exports = {
  cors: require("cors")(), // Enable CORS for all routes.
  json: require("./json"), // Parse JSON request bodies, except for multipart form data.
}