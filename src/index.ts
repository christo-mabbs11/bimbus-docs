#! /usr/bin/env node

//////////////////////////
// Import Dependencies //
////////////////////////

const { Command } = require("commander");
const fs = require("fs");
const path = require("path");
const figlet = require("figlet");
const { Configuration, OpenAIApi } = require("openai");
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
  console.log(figlet.textSync("BimBus AI"));

  // Define the details
  program
    // Program Details
    .version("1.0.0")
    .description("Bimbus AI is a tool that uses Open AI to generate documentation for code files")
    // Bimbus AI Functions
    .option("-t --token [value]", "Open AI Access Token")
    .option("-i --input [value]", "Input File")
    .option("-m --model [value]", "Open AI Model, accepts gpt-3.5-turbo or gpt-4, default is gpt-3.5-turbo")
    .option("-o --output [value]", "Output Directory")
    .option("-f --filetype [value]", "Output File Type")
    .option("-k --keep", "Keep Files")
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
  // Valid values are markdown and html
  if (options.filetype) {
    if (options.filetype !== "markdown" && options.filetype !== "html") {
      errorAndExit("Error: Invalid output type specified");
    }
  }

  // If the model is specified, check it is valid (default is gpt-3.5-turbo and other valid value is gpt-4)
  // Throw an error if it is not valid
  // Otherwise, set the model
  var cgptmodel = "gpt-3.5-turbo";
  if (options.model) {
    if (options.model !== "gpt-3.5-turbo" && options.model !== "gpt-4") {
      errorAndExit("Error: Invalid model specified");
    } else {
      cgptmodel = options.model;
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
  let purposeBlocks : string[] = [ ];
  let descriptionBlocks : string[] = [ ];
  let techDescriptionBlocks : string[] = [ ];

  // Setup vars for looping
  let initialProcessIncrement = 100;
  let initialProcessCounter = 0;

  // Determine how many times we need to loop + 3 for the extra prompts
  let totalProgressLoops = Math.ceil(linesCount/initialProcessIncrement) + 3;
  let totalProgressCounter = 1;

  // Calculate initial speed (roughly 30 seconds per job)
  let initialSpeed = convertTimeFormatMS(totalProgressLoops*30);

  // create a new progress bar instance and use shades_classic theme
  var progressBar = new cliProgress.SingleBar({
    format: '🚀 ' + colors.cyan('{bar}') + ' {percentage}% | {value}/{total} Jobs | Est Remaining: {speed} {loading} ',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
  });

  // Start the progress bar with a total value of 200 and start value of 0
  progressBar.start(totalProgressLoops, 0, { speed: initialSpeed, loading : "" } );

  // Call to have the progress bar updated
  updateProgressBar(progressBar);

  // Get the current starting time in milliseconds for processing chat gpt completions
  var startTime = new Date( ).getTime( );

  // Loop through the code until we reach the end of the file
  while (true) {

    // Fetch the start and end index
    let breakLoop = false;
    let startIndex = initialProcessCounter * initialProcessIncrement - 20;
    let endIndex = startIndex + initialProcessIncrement;
    if ( startIndex < 0 ) { startIndex = 0; }
    if ( endIndex > linesCount ) { endIndex = linesCount; breakLoop = true; }

    // Fetch the code
    let code = input.split("\n").slice(startIndex, endIndex).join("\n");

    // Add line numbers to the code
    let codeLines = code.split("\n");
    let codeWithLineNumbers = "";
    for (let i1 = 0 ; i1 < codeLines.length ; i1++ ) {
      codeWithLineNumbers += (startIndex+i1+1) + " " + codeLines[i1] + "\n";
    }

    ////////////////////////////////
    // Fetch purpose description //
    //////////////////////////////
    
    let prompt0 = "You will be provided a snippet of code from the file '"+inputBaseName+"' between lines "+startIndex+" and "+endIndex+".\n";
    prompt0 += "You are taking on the role of a senior developer explaining code to a junior developer.\n";
    prompt0 += "Explain what the purpose of this code from a very high level in simple, non-technical terms.\n";
    prompt0 += "Include line numbers in your explanation.\n";
    prompt0 += "Provide this information as a simple list that begins with dashes and provides the line numbers at the beginning.\n";
    prompt0 += "Use the following format:\n";
    prompt0 += "- Lines 0-1: Lorem Ipsum dolor sit amet\n";
    if (initialProcessCounter > 0) {

      // Fetch the last line of the previous prompt
      let lastLine = purposeBlocks[purposeBlocks.length-1];

      // Add the last line to the prompt
      prompt0 += "Continue on from the line below.\n";
      prompt0 += lastLine+"\n";

    }
    prompt0 += "Remember to use the following format:\n";
    prompt0 += "- Lines 0-1: Lorem Ipsum dolor sit amet\n";
    prompt0 += "\n" + codeWithLineNumbers+"\n";
    let message0 = await openAIChatCompletions(openAIToken, cgptmodel, prompt0, options.verbose, 0 );

    // Break the message into lines
    let message0Lines = message0.split("\n");

    // Add the message1 lines to the purposeBlocks array
    for (let i1 = 0 ; i1 < message0Lines.length ; i1++ ) {

      // If this line is not empty
      if (message0Lines[i1].trim( ) !== "") {
        purposeBlocks.push(message0Lines[i1]);
      }

    }

    /////////////////////////////////
    // Fetch non-tech description //
    ///////////////////////////////
    
    let prompt1 = "You will be provided a snippet of code from the file '"+inputBaseName+"' between lines "+startIndex+" and "+endIndex+".\n";
    prompt1 += "You are taking on the role of a senior developer explaining code to a junior developer.\n";
    prompt1 += "Explain what this code does at a high level in very simple, non-technical terms.\n";
    prompt1 += "Include line numbers in your explanation.\n";
    prompt1 += "Provide this information as a simple list that begins with dashes and provides the line numbers at the beginning.\n";
    prompt1 += "Use the following format:\n";
    prompt1 += "- Lines 0-1: Lorem Ipsum dolor sit amet\n";
    if (initialProcessCounter > 0) {

      // Fetch the last line of the previous prompt
      let lastLine = descriptionBlocks[descriptionBlocks.length-1];

      // Add the last line to the prompt
      prompt1 += "Continue on from the line below.\n";
      prompt1 += lastLine+"\n";

    }
    prompt1 += "Remember to use the following format:\n";
    prompt1 += "- Lines 0-1: Lorem Ipsum dolor sit amet\n";
    prompt1 += "\n" + codeWithLineNumbers+"\n";
    let message1 = await openAIChatCompletions(openAIToken, cgptmodel, prompt1, options.verbose, 0 );

    // Break the message into lines
    let message1Lines = message1.split("\n");

    // Add the message1 lines to the descriptionBlocks array
    for (let i1 = 0 ; i1 < message1Lines.length ; i1++ ) {

      // If this line is not empty
      if (message1Lines[i1].trim( ) !== "") {
        descriptionBlocks.push(message1Lines[i1]);
      }

    }

    /////////////////////////////
    // Fetch tech description //
    ///////////////////////////
    
    let prompt2 = "You will be provided a snippet of code from the file '"+inputBaseName+"' between lines "+startIndex+" and "+endIndex+".\n";
    prompt2 += "You are taking on the role of a senior developer explaining code to another senior developer.\n";
    prompt2 += "Explain what this code does in highly detailed, complex, technical terms.\n";
    prompt2 += "Include line numbers in your explanation.\n";
    prompt2 += "Provide this information as a simple list that begins with dashes and provides the line numbers at the beginning.\n";
    prompt2 += "Use the following format:\n";
    prompt2 += "- Lines 0-1: Lorem Ipsum dolor sit amet\n";
    if (initialProcessCounter > 0) {

      // Fetch the last line of the previous prompt
      let lastLine = descriptionBlocks[descriptionBlocks.length-1];

      // Add the last line to the prompt
      prompt2 += "Continue on from the line below.\n";
      prompt2 += lastLine+"\n";

    }
    prompt2 += "Remember to use the following format:\n";
    prompt2 += "- Lines 0-1: Lorem Ipsum dolor sit amet\n";
    prompt2 += "\n" + codeWithLineNumbers+"\n";
    let message2 = await openAIChatCompletions(openAIToken, cgptmodel, prompt2, options.verbose, 0 );

    // Break the message into lines
    let message2Lines = message2.split("\n");

    // Add the message1 lines to the descriptionBlocks array
    for (let i1 = 0 ; i1 < message2Lines.length ; i1++ ) {

      // If this line is not empty
      if (message2Lines[i1].trim( ) !== "") {
        techDescriptionBlocks.push(message2Lines[i1]);
      }

    }

    // If break loop is true, break the loop
    if (breakLoop) { break; }

    // initialProcessIncrement the initialProcessCounter
    initialProcessCounter++;

    // Get the updated time in milliseconds
    let currentTime = new Date( ).getTime( );

    // Find the time difference in seconds
    let timeDifference = (currentTime - startTime) / 1000;

    // Update the total progress counter
    totalProgressCounter++;

    // Determine how long the job will take
    let remainingJobs = totalProgressLoops - totalProgressCounter;
    let tspeed =  convertTimeFormatMS(timeDifference/totalProgressCounter*remainingJobs);

    // Update the progress bar
    progressBar.update(totalProgressCounter, { speed: tspeed });

  }

  // Compile the description blocks into a single string
  let purposeBlocksString = purposeBlocks.join("\n");
  let descriptionBlocksString = descriptionBlocks.join("\n");
  let techDescriptionBlocksString = techDescriptionBlocks.join("\n");

  // If we have the keep option
  if (options.keep) {

    // Save this data to file
    writeProcessingDataToFile ( outputDir, purposeBlocksString, "purpose", inputBaseName );
    writeProcessingDataToFile ( outputDir, descriptionBlocksString, "description", inputBaseName );
    writeProcessingDataToFile ( outputDir, techDescriptionBlocksString, "technical", inputBaseName );

  }

  // Only keep the first 400 lines for each of the string blocks
  purposeBlocksString = purposeBlocksString.split("\n").slice(0,400).join("\n");
  descriptionBlocksString = descriptionBlocksString.split("\n").slice(0,400).join("\n");
  techDescriptionBlocksString = techDescriptionBlocksString.split("\n").slice(0,400).join("\n");

  // Determine output length based on length of the string blocks
  let purposeBlockLength = purposeBlocksString.split("\n").length;
  let purposeBlockLengthOutput = "2"; if ( purposeBlockLength > 50 ) { purposeBlockLengthOutput = "4"; } else if ( purposeBlockLength > 30 ) { purposeBlockLengthOutput = "3"; }
  let descriptionBlockLength = descriptionBlocksString.split("\n").length;
  let descriptionBlockLengthOutput = "4"; if ( descriptionBlockLength > 50 ) { descriptionBlockLengthOutput = "8"; } else if ( descriptionBlockLength > 30 ) { descriptionBlockLengthOutput = "6"; }
  let techDescriptionBlockLength = techDescriptionBlocksString.split("\n").length;
  let techDescriptionBlockLengthOutput = "6"; if ( techDescriptionBlockLength > 50 ) { techDescriptionBlockLengthOutput = "12"; } else if ( techDescriptionBlockLength > 30 ) { techDescriptionBlockLengthOutput = "9"; }

  // Generate a series of prompts to send to the Open AI API
  var prompts : { [ id : string ] : string } = {
      "Introduction" : "You will be provided information about a file '" + inputBaseName + "' below. Provide a high level summary on the purpose of '" + inputBaseName + ". Write around " + purposeBlockLengthOutput + " paragraphs.\n\n" + purposeBlocksString+"\n",
      "Summary" : "You will be provided information about a file '" + inputBaseName + "' below. Provide a high level summary on the functionality of '" + inputBaseName + " and what it is used for from a non-technical perspective. Write around " + descriptionBlockLengthOutput + " paragraphs. Be sure to include an introduction.\n\n" + descriptionBlocksString+"\n",
      "Technical Details" : "You will be provided information about a file '" + inputBaseName + "' below. Summarise an article of paragraphs on the functionality of the code from '" + inputBaseName + " from a purely technical perspective for an experienced developer. Use plain english and write a summarised article of paragraphs. Write around " + techDescriptionBlockLengthOutput + " paragraphs. Be sure to include an introduction.\n\n" + techDescriptionBlocksString+"\n",
  };

  // Used to hold the replies
  var replies : { [ id : string ] : string } = { };

  // Loop through the prompts and generate the responses
  for (let i1 = 0 ; i1 < Object.keys(prompts).length ; i1++ ) {

    // Fetch the reply
    let key = Object.keys(prompts)[i1];
    replies[key] = await openAIChatCompletions(openAIToken, cgptmodel, prompts[key], options.verbose );

    // Get the updated time in milliseconds
    let currentTime = new Date( ).getTime( );

    // Find the time difference in seconds
    let timeDifference = (currentTime - startTime) / 1000;

    // Update the total progress counter
    totalProgressCounter++;

    // Determine how long the job will take
    let remainingJobs = totalProgressLoops - totalProgressCounter;
    let tspeed = convertTimeFormatMS(timeDifference/totalProgressCounter*remainingJobs);

    // If this is the last job
    if (i1 === Object.keys(prompts).length-1) {

      // Update the progress bar
      progressBar.update(totalProgressCounter, { speed: tspeed, loading : "  " });
      
      // stop the progress bar
      progressBar.stop( );

    } else {

      // Update the progress bar
      progressBar.update(totalProgressCounter, { speed: tspeed });

    }

  }

  // Loop through the replies object
  for (let i1 = 0 ; i1 < Object.keys(replies).length ; i1++ ) {

    // Fetch the key
    let key = Object.keys(replies)[i1];

    // If this is the 'Summary' or 'Technical Details' key
    if (key === "Summary" || key === "Technical Details") {

      // Split the file up
      let fileLines = replies[key].split("\n");

      // Loop through the file lines and count the number of paragraphs
      let paragraphCount = 0;
      for (let i2 = 0 ; i2 < fileLines.length ; i2++ ) {

        // If this line is empty
        if (fileLines[i2] === "") {

          // initialProcessIncrement the paragraph count
          paragraphCount++;

        }

      }

      // If there is more than 2 paragraphs
      if (paragraphCount > 2) {

        // Remove the first paragraph
        fileLines.splice(0,1);

        // Remove the first line if it is empty
        if (fileLines[0] === "") {
          fileLines.splice(0,1);
        }

        // Add the file lines back to the replies object
        replies[key] = fileLines.join("\n");

      }

    }

  }

  // Info output
  console.log("\n📝 Writing Output..\n");

  // Write the output to a file
  await writeOutputToFile( outputDir, outputType, replies, inputBaseName );

  // Info output
  console.log("🎉 All Done!\n");

  // Quit the program
  process.exit(0);

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
async function openAIChatCompletions( token: string, cgptmodel : string, prompt: string, verbose : boolean, temperature : number = 0.1 ) : Promise<string> {

  // Try attempt to run the API call
  let attempts = 0;
  while ( true ) {

    // Try to run the API call
    try {

      var configuration = new Configuration({
        apiKey: token,
      });
      var openai = new OpenAIApi(configuration);

      var chatCompletion = await openai.createChatCompletion({
        model: cgptmodel,
        messages: [{role: "user", content: prompt}],
        temperature: temperature,

      });

      // Break the loop
      break;

    } catch (error : any ) {

      // Fetch the error message
      var errorMessage = error.message + "\nSee https://platform.openai.com/docs/guides/error-codes/api-errors for more details.\n\n";

    }

    // If we've tried 3 times
    if ( attempts++ > 3 ) {

      // Throw an error
      throw new Error( errorMessage );

    }

  }

  // If verbose is enabled, print the details
  if (verbose) {

    // Print the tokens processed
    let tokensProcessed = chatCompletion.data.usage.total_tokens;
    console.log("Tokens Processed:", tokensProcessed);

  }

  // Fetch the reply
  let reply = chatCompletion.data.choices[0].message.content;

  // return the reply
  return reply;

}

// Function to take the proessing data and write it to a file
async function writeProcessingDataToFile ( outputDir: string, saveData: string, saveFile : string, originalFileName: string ) {

  // Replace .'s with -'s in the originalFileName
  let updatedFileName = originalFileName.replace(/\./g, "-");

  // Produce the final output file name
  let currentDate = new Date( ).toISOString( ).slice(0,10);
  let outputFileName = updatedFileName + "--" + saveFile + "--" + currentDate + ".txt";

  // Create the full directory path and file name, including the extension
  let fullFilePath = path.join(outputDir,outputFileName);

  // Write the output to a file
  fs.writeFileSync(fullFilePath, saveData);

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
      outputText += "## " + key + "\n\n";
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

// Function to run and update the progress bar
function updateProgressBar ( progressBar : any, loadingIndex : number = 0 ) {

  // If this loading bar is stopped
  // Quit the function
  if (progressBar == null || progressBar.isStopped) {
    return;
  }

  // Declare the loading string
  let spindex = 0;
  var spinner = [
    "⣾⣽⣻⢿⡿⣟⣯⣷",
    "▁▂▃▄▅▆▇█▇▆▅▄▃▁",
    "←↖↑↗→↘↓↙",
    "▉▊▋▌▍▎▏▎▍▌▋▊▉",
    "▖▘▝▗",
    "┤┘┴└├┌┬┐",
    "◢◣◤◥",
    "◰◳◲◱",
    "◴◷◶◵",
    "◐◓◑◒",
    "◡◡⊙⊙◠◠",
    "⠁⠂⠄⡀⢀⠠⠐⠈",
  ];

  // Fetch the loading character
  var loading = spinner[spindex][loadingIndex];

  // Set the loading text on the progress bar
  progressBar.update({ loading : loading });

  // Update the loading index
  loadingIndex++;
  if (loadingIndex >= spinner[spindex].length) {
    loadingIndex = 0;
  }

  // Call this function after a short delay
  setTimeout(updateProgressBar, 100, progressBar, loadingIndex);

}

// Function takes seconds as a number and returns and returns time as a string in the format xm xs
function convertTimeFormatMS ( seconds : number ) {

  // Round the seconds to the nearest second
  seconds = Math.round(seconds);

  // Determine the number of minutes
  let minutes = Math.floor(seconds / 60);

  // Determine the number of seconds
  let remainingSeconds = seconds % 60;

  // Create string to be returned
  let timeString = "";
  if (minutes > 0) {
    timeString += minutes + "m";
  }
  if ( minutes > 0 && remainingSeconds > 0 ) {
    timeString += " ";
  }
  if (remainingSeconds > 0) {
    timeString += remainingSeconds + "s";
  }

  // If the time string is empty, set it to 0s
  if (timeString === "") {
    timeString = "0s";
  }

  // Return the time string
  return timeString;

}
