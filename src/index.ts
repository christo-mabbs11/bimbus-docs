const { Command } = require("commander");
const figlet = require("figlet");


const program = new Command();

console.log(figlet.textSync("Bimbus AI"));

program
  .version("1.0.0")
  .description("An example CLI for managing a directory")
  .option("-t [value]", "Open AI Access Token")
  .option("-i [value]", "Input File")
  .option("-o [value]", "Output Directory")
  .parse(process.argv);

const options = program.opts( );

