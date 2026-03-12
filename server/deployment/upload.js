const { Client } = require("node-scp");
const fs = require("fs");
const Path = require("path");
const getParams = require("./getParams");

// Helper function to upload content to server.
const upload = async (input, params, out) => new Promise(async function (resolve, reject) {
  try {
    // If only one input for everything.
    if (!params) {
      try {
        typeof input === "string" && (
          params = require(input),
          input = params.dir || params.inputDir || params.in || params.input || params.files || params.filename || params.path || params.directory || params.folder,
          out = params.out || params.output || params.outputDir || params.outputFolder || params.outputPath || params.outputDirectory
        );
      } catch {}
      try {
        typeof input === "object" && input && !Array.isArray(input) && (
          params = input,
          input = params.dir || params.inputDir || params.files || params.filename || params.in || params.input || params.path || params.directory || params.folder,
          out = params.out || params.output || params.outputDir || params.outputFolder || params.outputPath || params.outputDirectory
        );
      } catch {}
    }

    // Normalize input. Load connection file if necessary.
    params = getParams(params);

    // Get input directory if not yet.
    params && !input && typeof params === "object" && (
      input = params.dir || params.inputDir || params.in || params.input || params.files || params.filename || params.path || params.directory || params.folder
    );
    delete params.dir;
    delete params.inputDir;
    delete params.in;
    delete params.input;
    delete params.files;
    delete params.filename;
    input === params.path && delete params.path;
    delete params.directory;
    delete params.folder;

    // Get output directory if not yet.
    params && !out && typeof params === "object" && (
      out = params.out || params.output || params.outputDir || params.outputFolder || params.outputPath || params.outputDirectory
    );
    delete params.out;
    delete params.output;
    delete params.outputDir;
    delete params.outputFolder;
    delete params.outputPath;
    delete params.outputDirectory;

    // Check if we have the necessary info for connection.
    if (!input) {
      const error = Error(`Missing input directory or file(s)`);
      if (reject) reject(error);
      else throw error;
    }

    Array.isArray(input) || (input = [input]);
    input = input.flat(Infinity).filter(x => x).map(x => `${x}`);
    
    // Connect.
    const client = await Client(params);
    console.log("🖥️  Connected to server instance.");
    console.log("🖥️  To be uploaded:");
    for(let i = 0, l = input.length; i !== l; ++i) {
      console.log(`  ‣  ${input[i]}`);
    }

    // Try to create output folder.
    try {
      out && await client.mkdir(
        out
        // attributes: InputAttributes
      );
    } catch {}

    const loaded = [];
    for (let i = 0, l = input.length, f, o; i !== l; ++i) {
      f = input[i];
      Array.isArray(f) && (
        f = f[0],
        o = f[1]
      ) || (o = "");
      o || (o = Path.basename(f));
      out && (o = Path.join(out, o || ""));

      // Upload data.
      if (fs.lstatSync(f).isDirectory()) {
        console.log(`📂  Loading: ${f}`);
        await client.uploadDir(
          f,
          o
          // options?: TransferOptions
        );
      } else {
        console.log(`📄  Loading: ${f}`);
        await client.uploadFile(
          f,
          o
          // options?: TransferOptions
        );
      }
      loaded.push(o);
    }

    console.log("✅  Data loaded");
    for(let i = 0, l = loaded.length; i !== l; ++i) {
      console.log(`  ‣  ${loaded[i]}`);
    }

    // Close connection.
    await client.close();
    console.log("✅  Connection closed");
    resolve && resolve();
  } catch (error) {
    if (reject) reject (error);
    else throw error;
  }
});

// Export.
module.exports = Object.freeze(Object.defineProperty(upload, "upload", {
  value: upload
}));