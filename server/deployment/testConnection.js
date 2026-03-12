const { Client } = require("node-scp");
const getParams = require("./getParams");

// Helper function to test a connection.
// like: testConnection("../secrets/dev.json");
const testConnection = async params => {
  params = getParams(params);

  // Connect.
  try {
    const client = await Client(params);
    console.log("✅  Success, connected to instance");

    // Close connection.
    client.close();
    console.log("✅  Connection closed");
  } catch (e) {
    return Promise.reject(e);
  } finally {
    return Promise.resolve();
  }
}

// Export.
module.exports = Object.freeze(Object.defineProperty(testConnection, "testConnection", {
  value: testConnection
}));