const { Command } = require("commander");
const figlet = require("figlet");

// Create a new program
const program = new Command( );

// Print the banner
console.log(figlet.textSync("Bimbus AI"));

// Define the details
program
  .version("1.0.0")
  .description("An example CLI for managing a directory")
  .option("-t [value]", "Open AI Access Token")
  .option("-i [value]", "Input File")
  .option("-o [value]", "Output Directory")
  .parse(process.argv);

// Fetch the options
const options = program.opts( );

