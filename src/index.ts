#! /usr/bin/env node

//////////////////////////
// Import Dependencies //
////////////////////////

const { Command } = require("commander");
const fs = require("fs");
const path = require("path");
const figlet = require("figlet");

/////////////////////////
// Main Functionality //
///////////////////////

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
const options = program.opts( );

// If not options are specified, show an error and print the help
if (!process.argv.slice(2).length) {
  console.error("No options specified!");
  program.outputHelp();
  process.exit(1);
}

// If the input file is not specified, show an error and print the help
if (!options.input) {
  console.error("Please specify an input file");
  program.outputHelp();
  process.exit(1);
}

// Fetch the input vars
const openAIToken = options.token;
const inputFile = path.basename(options.input);
const outputDir = options.output ? options.output : __dirname;

// Debug
console.log("Open AI Token: ", openAIToken);
console.log("Input File: ", inputFile);
console.log("Output Directory: ", outputDir);
process.exit(1);

//////////////////////////////////
// Library of helper functions //
////////////////////////////////

// Function to list the contents of a directory
// const filepath = typeof options.ls === "string" ? options.ls : __dirname;
// listDirContents(filepath);
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
// createDir(path.resolve(__dirname, options.mkdir));
function createDir(filepath: string) {
  if (!fs.existsSync(filepath)) {
    fs.mkdirSync(filepath);
    console.log("The directory has been created successfully");
  }
}

// Functio to create a file
createFile(path.resolve(__dirname, options.touch));
function createFile(filepath: string) {
  fs.openSync(filepath, "w");
  console.log("An empty file has been created");
}

