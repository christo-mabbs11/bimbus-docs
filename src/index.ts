#! /usr/bin/env node

//////////////////////////
// Import Dependencies //
////////////////////////

const { Command } = require("commander");
const fs = require("fs");
const path = require("path");
const figlet = require("figlet");
const { Configuration, OpenAIApi } = require("openai");

/////////////////////////
// Main Functionality //
///////////////////////

// Run the main function
main( );
async function main ( ) {

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
  const inputFile = options.input;
  const outputDir = options.output ? options.output : __dirname;

  // Info output
  console.log("Running Bimbus AI..\n");

  // If verbose is specified, print the details
  if (options.verbose) {

    // Print the details
    console.log("Open AI Token: ", openAIToken);
    console.log("Input File: ", inputFile);
    console.log("Output Directory: ", outputDir, "\n");

  }

  // Ensure the input file exists
  if ( !fs.existsSync(inputFile) ) {
    errorAndExit("Error: Input file does not exist");
  }

  // Ensure the input file is a file and not a directory
  if ( !fs.lstatSync(inputFile).isFile( ) ) {
    errorAndExit("Error: Input file is not a file");
  }

  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    errorAndExit("Error: Output directory does not exist");
  }

  // Info output
  console.log("Generating Documentation..\n");

  // Fetch the contents of the input file
  const input = fs.readFileSync(inputFile, "utf8");

  // Fetch the base name for the input file
  const inputBaseName = path.basename(inputFile);

  // Generate a series of prompts to send to the Open AI API
  const prompts : { [ id : string ] : string } = {
      "summary" : "You will be provided code from the file '"+inputBaseName+"'. Provide a high level summary on what you believe the purpose of the code is. Use a confident tone and respond in a single sentence.\n"+input+"\n",
      "details" : "You will be provided code from the file '"+inputBaseName+"'. Provide a high level summary on what you believe the purpose of the code is. Use a confident tone and respond in a single paragraph.\n"+input+"\n",
      "technical-summary" : "You will be provided code from the file '"+inputBaseName+"'. Provide a high level summary on the functionality of the code from a technical perspective. Use a confident tone and respond in a single sentence.\n"+input+"\n",
      "technical-details" : "You will be provided code from the file '"+inputBaseName+"'. Provide a high level summary on the functionality of the code from a technical perspective. Use a confident tone and respond in a single paragraph.\n"+input+"\n",
  };

  // Used to hold the replies
  var replies : { [ id : string ] : string } = { };

  // Loop through the prompts and generate the responses
  for (let i1 = 0 ; i1 < Object.keys(prompts).length ; i1++ ) {
    let key = Object.keys(prompts)[i1];
    replies[key] = await openAIChatCompletions( openAIToken, prompts[key] );
  }

  // Info output
  console.log("Done!");

}

//////////////////////////////////
// Library of helper functions //
////////////////////////////////

// Function to show and exit
function errorAndExit ( message: string ) {
  console.error(message,"\n");
  console.error("Run 'bimbus -h' for help\n");
  process.exit(1);
}

// Function that calls the open AI chat completions API endpoint
async function openAIChatCompletions( token: string, prompt: string ) : Promise<string> {

  const configuration = new Configuration({
    apiKey: token,
  });
  const openai = new OpenAIApi(configuration);
  
  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{role: "user", content: prompt}],
    temperature: 0.05,

  });

  // Fetch the reply
  const reply = chatCompletion.data.choices[0].message.content;

  // return the reply
  return reply;

}

