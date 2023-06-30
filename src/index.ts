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
  .option("-v --verbose", "Verbose Output")
  // Final processing
  .parse(process.argv);

// Fetch the options
const options = program.opts( );

// If the -h flag is specified, print the help and exit
if (options.help) {
  program.help( );
  process.exit(0);
}

// If the token is not specified, show an error and print the help
if (!options.token) {
  console.error("Error: Please specify an Open AI token using -t\n");
  console.error("Run 'bimbus -h' for help\n");
  process.exit(1);
}

// If the input file is not specified, show an error and print the help
if (!options.input) {
  console.error("Error: Please specify an input file using -i\n");
  console.error("Run 'bimbus -h' for help\n");
  process.exit(1);
}

// Fetch the input vars
const openAIToken = options.token;
const inputFile = path.basename(options.input);
const outputDir = options.output ? options.output : __dirname;

// Info output
console.log("Running Bimbus AI...");

// If verbose is specified, print the details
if (options.verbose) {

  // Print the details
  console.log("Open AI Token: ", openAIToken);
  console.log("Input File: ", inputFile);
  console.log("Output Directory: ", outputDir);

}

// Info output
console.log("\n");

// Info output
console.log("Done!");


//////////////////////////////////
// Library of helper functions //
////////////////////////////////



