#! /usr/bin/env node

//////////////////////////
// Import Dependencies //
////////////////////////

const { Command } = require("commander");
const fs = require("fs");
const path = require("path");
const figlet = require("figlet");
const { Configuration, OpenAIApi } = require("openai");
import { Document, Packer, Paragraph, TextRun } from "docx";
const cliProgress = require('cli-progress');
const colors = require('ansi-colors');

/////////////////////////
// Main Functionality //
///////////////////////

// Run the main function
main( );
async function main ( ) {

  // Create a new program
  const program = new Command( );

  // Print the banner
  console.log("\n");
  console.log(figlet.textSync("BIMBUS AI"));

  // Define the details
  program
    // Program Details
    .version("1.0.0")
    .description("Bimbus AI is a tool that uses Open AI to generate documentation for code files")
    // Bimbus AI Functions
    .option("-t --token [value]", "Open AI Access Token")
    .option("-i --input [value]", "Input File")
    .option("-o --output [value]", "Output Directory")
    .option("-f --filetype [value]", "Output File Type")
    .option("-v --verbose", "Verbose Output")
    // Final processing
    .parse(process.argv);

  // Fetch the options
  const options = program.opts( );

  // If the -h flag is specified, print the help and exit
  if (options.help) {
    errorAndExit("");
  }

  // Info output
  console.log("\n🔍 Assessing Input..\n");

  // If the token is not specified, show an error and print the help
  if (!options.token) {
    errorAndExit("Error: Please specify an Open AI token using -t\n");
  }

  // If the input file is not specified, show an error and print the help
  if (!options.input) {
    errorAndExit("Error: Please specify an input file using -i");
  }

  // If outputType is specified, ensure it is valid
  // Valid values are markdown, docx and txt
  if (options.filetype) {
    if (options.filetype !== "markdown" && options.filetype !== "docx" && options.filetype !== "text" && options.filetype !== "html") {
      errorAndExit("Error: Invalid output type specified");
    }
  }

  // Fetch the input vars
  const openAIToken = options.token;
  const inputFile = options.input;
  const outputDir = options.output ? options.output : __dirname;

  // If no output type is specified, default to markdown
  const outputType = options.filetype ? options.filetype : "markdown";

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

  // Ensure the output directory is a directory and not a file
  if ( !fs.lstatSync(outputDir).isDirectory( ) ) {
    errorAndExit("Error: Output directory is not a directory");
  }

  // Fetch the base name for the input file
  const inputBaseName = path.basename(inputFile);

  // Info output
  console.log("📄 Processing '"+inputBaseName+"'..\n");

  // Info output
  console.log("📚 Generating Documentation..\n");

  // Fetch the contents of the input file
  let input = fs.readFileSync(inputFile, "utf8");

  // Determine how many lines in the file
  let linesCount = input.split("\n").length;

  // Arrays used to keep track of different information
  let descriptionBlocks : string[] = [ ];
  let techDescriptionBlocks : string[] = [ ];
  let descriptionFunctionalBlocks : string[] = [ ];
  let functionBlocks : string[] = [ ];

  // Loop through the code until we reach the end of the file
  let increment = 100;
  let counter = 0;
  while (true) {

    // Fetch the start and end index
    let breakLoop = false;
    let startIndex = counter * increment;
    let endIndex = startIndex + 200;
    if ( endIndex > linesCount ) { endIndex = linesCount; breakLoop = true; }

    // Fetch the code
    let code = input.split("\n").slice(startIndex, endIndex).join("\n");

    // Add line numbers to the code
    let codeLines = code.split("\n");
    let codeWithLineNumbers = "";
    for (let i1 = 0 ; i1 < codeLines.length ; i1++ ) {
      codeWithLineNumbers += (startIndex+i1+1) + " " + codeLines[i1] + "\n";
    }

    // Fetch non-tech description
    let prompt1 = "You will be provided a snippet of code from the file '"+inputBaseName+"' between lines "+startIndex+" and "+endIndex+".\n";
    prompt1 += "You are taking on the role of a senior developer explaining code to a designer with no technical experience.\n";
    prompt1 += "Explain what this code does in non-technical terms.\n";
    prompt1 += "Include line numbers in your explanation.\n";
    prompt1 += "Provide this information as a list that begins with dashes.\n";
    prompt1 += "Include line numbers in your explanation.\n";
    if (counter > 0) {

      // Fetch the last 3 lines from the the descriptionBlocks
      let last3Lines = descriptionBlocks[descriptionBlocks.length-1].split("\n").slice(-3).join("\n");

      // Add the last 3 lines to the prompt
      prompt1 += "Continue on from the three lines below.\n";
      prompt1 += last3Lines + "\n";

    }    
    prompt1 += "\n" + codeWithLineNumbers+"\n";
    let message1 = await openAIChatCompletions(openAIToken, prompt1, options.verbose );

    // Debug
    // console.log(prompt1);
    // console.log(message1);

    // Break the message into lines
    let message1Lines = message1.split("\n");

    // Add the message1 lines to the descriptionBlocks array
    for (let i1 = 0 ; i1 < message1Lines.length ; i1++ ) {

      // If this line is not empty
      if (message1Lines[i1].trim( ) !== "") {
        descriptionBlocks.push(message1Lines[i1]);
      }

    }

    // Fetch the code blocks
    // techDescriptionBlocks
    // functionBlocks

    // If break loop is true, break the loop
    if (breakLoop) { break; }

    // Increment the counter
    counter++;

  }

  // Compile the description blocks into a single string
  let descriptionBlocksString = descriptionBlocks.join("\n");

  // Create prompt to summarise 
  let prompt2 = "You will be provided information about a file '"+inputBaseName+"'. Provide a high level summary on the functionality of '"+inputBaseName+"' and what it is used for from a non-technical perspective. Provide only a single sentence.\n"+descriptionBlocksString+"\n";

  // Fetch the summary
  let summary = await openAIChatCompletions(openAIToken, prompt2, options.verbose );

  // Quit out 
  // console.log(descriptionBlocks);
  console.log(prompt2);
  console.log(summary);
  return;

  // Generate a series of prompts to send to the Open AI API
  var prompts : { [ id : string ] : string } = {
      "Introduction" : "You will be provided code from the file '"+inputBaseName+"'. Summarise and produce an introduction of '"+inputBaseName+"'. Provide only a single sentence.\n"+input+"\n",
      "Summary" : "You will be provided code from the file '"+inputBaseName+"'. Provide a high level summary on the functionality of '"+inputBaseName+"' and what it is used for from a non-technical perspective. Provide about 5 sentences.\n"+input+"\n",
      "Details" : "You will be provided code from the file '"+inputBaseName+"'. Provide a high level summary on the functionality of '"+inputBaseName+"' and what it is used for from a non-technical perspective. Provide about 5 paragraphs.\n"+input+"\n",
      "Technical Summary" : "You will be provided code from the file '"+inputBaseName+"'. Provide information on the functionality of the code from '"+inputBaseName+"' from a purely technical perspective for an experienced developer. Provide about 5 sentences.\n"+input+"\n",
      "Technical Details" : "You will be provided code from the file '"+inputBaseName+"'. Provide information on the functionality of the code from '"+inputBaseName+"' from a purely technical perspective for an experienced developer. Provide about 5 paragraphs.\n"+input+"\n",
  };

  // Used to hold the replies
  var replies : { [ id : string ] : string } = { };

  // create a new progress bar instance and use shades_classic theme
  const progressBar = new cliProgress.SingleBar({
    format: '🚀 Generating.. |' + colors.cyan('{bar}') + '| {percentage}% | {value}/{total} Jobs | Est Remaining: {speed}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
  });

  // Start the progress bar with a total value of 200 and start value of 0
  progressBar.start(Object.keys(prompts).length, 0, { speed: "N/A" } );

  // Get the current starting time in milliseconds
  let startTime = new Date( ).getTime( );

  // Loop through the prompts and generate the responses
  for (let i1 = 0 ; i1 < Object.keys(prompts).length ; i1++ ) {

    // Fetch the reply
    let key = Object.keys(prompts)[i1];
    replies[key] = await openAIChatCompletions( openAIToken, prompts[key], options.verbose );

    // Get the updated time in milliseconds
    let currentTime = new Date( ).getTime( );

    // Find the time difference in seconds
    let timeDifference = (currentTime - startTime) / 1000;

    // Determine how long the job will take
    let i2 = i1 + 1;
    let remainingJobs = Object.keys(prompts).length - i2;
    let tspeed = (timeDifference/i2*remainingJobs).toFixed(1) + "s";

    // Update the progress bar
    progressBar.update((i1+1), { speed: tspeed });

  }

  // stop the progress bar
  progressBar.stop( );

  // Info output
  console.log("\n📝 Writing Output..\n");

  // Write the output to a file
  await writeOutputToFile( outputDir, outputType, replies, inputBaseName );

  // Info output
  console.log("🎉 All Done!\n");

}

//////////////////////////////////
// Library of helper functions //
////////////////////////////////

// Function to show and exit
function errorAndExit ( message: string ) {
  console.error(colors.red(message),"\n");
  console.error("Run 'bimbus -h' for help\n");
  process.exit(1);
}

// Function that calls the open AI chat completions API endpoint
async function openAIChatCompletions( token: string, prompt: string, verbose : boolean ) : Promise<string> {

  const configuration = new Configuration({
    apiKey: token,
  });
  const openai = new OpenAIApi(configuration);
  
  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{role: "user", content: prompt}],
    temperature: 0.1,

  });

  // If verbose is enabled, print the details
  if (verbose) {

    // Print the tokens processed
    let tokensProcessed = chatCompletion.data.usage.total_tokens;
    console.log("Tokens Processed:", tokensProcessed);

  }

  // Fetch the reply
  const reply = chatCompletion.data.choices[0].message.content;

  // return the reply
  return reply;

}

// Function to take the output and write it to a file
async function writeOutputToFile ( outputDir: string, outputType: string, output: { [ id : string ] : string }, originalFileName: string ) {

  // Replace .'s with -'s in the originalFileName
  let updatedFileName = originalFileName.replace(/\./g, "-");

  // Produce the final output file name
  let currentDate = new Date( ).toISOString( ).slice(0,10);
  let outputFileName = updatedFileName + "--" + currentDate;

  // Create the file extension based on the output type
  let fileExtension = "";
  if (outputType === "markdown") {
    fileExtension = ".md";
  } else if (outputType === "docx") {
    fileExtension = ".docx";
  } else if (outputType === "text") {
    fileExtension = ".txt";
  } else if (outputType === "html") {
    fileExtension = ".html";
  }

  // Create the full directory path and file name, including the extension
  let fullFilePath = path.join(outputDir, outputFileName + fileExtension);

  // Create different output based on the output type and save it
  let outputText = "";
  if (outputType === "markdown") {

    // Add the title to the output
    outputText += "# " + originalFileName + " Documentation\n\n";

    // Loop through the output and add it to the outputText
    for (let i1 = 0 ; i1 < Object.keys(output).length ; i1++ ) {
      let key = Object.keys(output)[i1];
      outputText += "## " + key + "\n";
      outputText += output[key] + "\n\n";
    }

    // Write the output to a file
    fs.writeFileSync(fullFilePath, outputText);

  } else if (outputType === "docx") {

    // Create the paragraphs
    const paragraphs = [ ];
    for (let i1 = 0 ; i1 < Object.keys(output).length ; i1++ ) {
      let key = Object.keys(output)[i1];
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: key,
            bold: true,
          }),
          new TextRun({
            text: "\n\n",
          }),
          new TextRun({
            text: output[key],
          }),
          new TextRun({
            text: "\n\n",
          }),
        ],
      }));
    }

    // Create the document
    const doc = new Document({
      sections: [{
        children: paragraphs,
      }],
    });

    // Used to export the file into a .docx file
    Packer.toBuffer(doc).then((buffer) => {
      fs.writeFileSync(fullFilePath, buffer);
    });

  } else if (outputType === "text") {

    // Add the title to the output
    outputText += originalFileName + " Documentation\n\n";

    // Loop through the output and add it to the outputText
    for (let i1 = 0 ; i1 < Object.keys(output).length ; i1++ ) {
      let key = Object.keys(output)[i1];
      outputText += key + "\n";
      outputText += output[key] + "\n\n";
    }

    // Write the output to a file
    fs.writeFileSync(fullFilePath, outputText);

  } else if (outputType === "html") {

    // Add the title to the output
    outputText += "<h1>" + originalFileName + " Documentation</h1>\n\n";

    // Loop through the output and add it to the outputText
    for (let i1 = 0 ; i1 < Object.keys(output).length ; i1++ ) {
      let key = Object.keys(output)[i1];
      outputText += "<h2>" + key + "</h2>\n";
      outputText += "<p>" + output[key] + "</p>\n\n";
    }

    // Write the output to a file
    fs.writeFileSync(fullFilePath, outputText);

  }

}

