#! /usr/bin/env node

const { Command } = require("commander");
const fs = require("fs");
const path = require("path");
const figlet = require("figlet");

// Create a new program
const program = new Command( );

// Print the banner
console.log(figlet.textSync("Bimbus AI"));

// Define the details
program
  // Program Details
  .version("1.0.0")
  .description("An example CLI for managing a directory")
  // Bimbus AI Functions
  .option("-t --token [value]", "Open AI Access Token")
  .option("-i --input [value]", "Input File")
  .option("-o --output [value]", "Output Directory")
  // Directory Functions
  .option("-l, --ls  [value]", "List directory contents")
  .option("-m, --mkdir <value>", "Create a directory")
  .option("-t, --touch <value>", "Create a file")
  // Final processing
  .parse(process.argv);

// Fetch the options
const options = program.opts();

// Function to list the contents of a directory
async function listDirContents(filepath: string) {
  try {
    const files = await fs.promises.readdir(filepath);
    const detailedFilesPromises = files.map(async (file: string) => {
      let fileDetails = await fs.promises.lstat(path.resolve(filepath, file));
      const { size, birthtime } = fileDetails;
      return { filename: file, "size(KB)": size, created_at: birthtime };
    });
    const detailedFiles = await Promise.all(detailedFilesPromises);
    console.table(detailedFiles);
  } catch (error) {
    console.error("Error occurred while reading the directory!", error);
  }
}

// Function to create a directory
function createDir(filepath: string) {
  if (!fs.existsSync(filepath)) {
    fs.mkdirSync(filepath);
    console.log("The directory has been created successfully");
  }
}

// Functio to create a file
function createFile(filepath: string) {
  fs.openSync(filepath, "w");
  console.log("An empty file has been created");
}

// Process the options
if (options.token) {
  // ...
}
if (options.input) {
  // ...
}
if (options.output) {
  // ...
}
if (options.ls) {
  const filepath = typeof options.ls === "string" ? options.ls : __dirname;
  listDirContents(filepath);
}
if (options.mkdir) {
  createDir(path.resolve(__dirname, options.mkdir));
}
if (options.touch) {
  createFile(path.resolve(__dirname, options.touch));
}

// Print the help if no options are passed
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

