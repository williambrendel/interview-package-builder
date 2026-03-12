const { Client } = require("ssh2");
const getParams = require("./getParams");

// Helper function to test a connection.
// like: testConnection("../secrets/dev.json");
const sendCommand = async (...args) => new Promise(function (resolve, reject) {
  args = args.flat(Infinity);
  let commands = [], params = {};
  for (let i = 0, l = args.length, a; i !== l; ++i) {
    typeof (a = args[i]) === "string" && commands.push(a)
    || (typeof a === "object" && Object.assign(params, a));
  }

  try {
    params = getParams(params);
  } catch {}

  for (let i = 0, l = commands.length; i !== l; ++i) {
    try {
      params = getParams(commands[i]);
      commands.splice(i, 1);
      break;
    } catch {}
  }

  if (!Object.keys(params).length) {
    const error = Error("Missing parameters");
    if (reject) reject(error);
    else throw error;
  }

  const log = params.logging === true && (params.log || console.log)
    || (typeof params.logging === "function" && params.logging)
    || (typeof params.log === "function" && params.logging === undefined && params.log)
    || (() => {})

  commands = (commands.join("\n") + "\n").replace(/exit/gi, "").replace(/\n+/g, "\n") + "exit\n";
  log("params", params);
  log("commands", commands);

  // Connect.
  const client = new Client();
  client.on("ready", () => {
    log("Client :: ready");

    // Configure shell.
    client.shell((error, stream) => {
      if (error) {
        if (reject) reject(error);
        else throw error;
      }

      // Close connection when stream is closed.
      let d;
      stream.on("data", data => {
        log(`${data}`);
        d = data;
      }).on("close", async () => {
        log("Stream :: close");
        await client.end();
        resolve && resolve(d);
      });

      // Done.
      stream.end(commands);
    });
  }).connect(params);
});

// Export.
module.exports = Object.freeze(Object.defineProperty(sendCommand, "sendCommand", {
  value: sendCommand
}));