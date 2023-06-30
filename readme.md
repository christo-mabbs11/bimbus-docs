<body>
    <div align="center">
        <h1 align="center">
            <img src="https://raw.githubusercontent.com/bitgangstudio/bimbus-cli/master/icons/bgs.png" width="38" />
            <img src="https://raw.githubusercontent.com/bitgangstudio/bimbus-cli/master/icons/openai.png" width="38" />
            <br/>
            Bimbus AI
        </h1>
        <p><strong>Automated Code Documentation</strong></p>
        <p><strong>Developed using OpenAI's GPT language model APIs</strong></p>
        <p align="center">
            <img src="https://img.shields.io/badge/Markdown-000000.svg?stylee&logo=Markdown&logoColor=white" alt="Markdown" />
            <img src="https://img.shields.io/badge/Node.js-339933.svg?style=flat&logo=node.js&logoColor=white" alt="Node JS" />
            <img src="https://img.shields.io/badge/npm-CB3837.svg?style=flat&logo=npm&logoColor=white" alt="NPM" />
            <img src="https://img.shields.io/badge/OpenAI-412991.svg?stylee&logo=OpenAI&logoColor=white" alt="OpenAI" />
        </p>
    </div>
</body>

Overview
-------------------

A sleek and powerful command line tool crafted with Node.js and fueled by OpenAI's cutting-edge technology. With Bimbus, effortlessly generate thorough and comprehensive documentation for your code files, whether it's PHP, TypeScript, or more.

Enhance understanding and maintainability of your codebase with ease, empowering collaboration and onboarding. Streamline your development process and unlock the full potential of your code, as Bimbus becomes your trusted ally in the pursuit of code documentation excellence.

System Requirements
-------------------

To use Bimbus, ensure that you have the following system requirements:

*   Node.js (v14 or higher)
*   npm (v18 or higher)

Installation
------------

To install Bimbus and its dependencies, follow these simple steps:

1. Download the Bimbus repository.
2. Open a terminal or command prompt.
3. Navigate to the downloaded repository directory.
4. Run the following command to install the required dependencies:

    $ npm install

5. Once the dependencies are installed, proceed with building the app by running the following command:

    $ npm run build

6. With these steps completed, Bimbus will be successfully installed and built, empowering you to effortlessly generate comprehensive documentation for your code files.

OpenAI API
------------

To use Bimbus AI, you will need to create an account with OpenAI to generate an API key. The steps below outline this setup process:

1. Go to the [OpenAI website](https://platform.openai.com/).
2. Click the "Sign up for free" button.
3. Fill out the registration form with your information and agree to the terms of service.
4. Once logged in, click on the "API" tab.
5. Follow the instructions to create a new API key.
6. Copy the API key and keep it in a secure place.

Usage
-----

To generate documentation using Bimbus, run the following command:

    $ node dist/index.js -t <OpenAI Access Token> -i <input-file-path> [-o <output-file-directory>] [-f <filetype>] [-v] [-h]

The command accepts the following arguments:

*   `-t` or `--token`: Specifies the OpenAI Access Token.
*   `-i` or `--input`: Specifies the path to the input file containing code to generate documentation for.
*   `-o` or `--output` (optional): Specifies the output directory where the generated documentation will be saved. If not provided, the documentation will be saved in the current working directory.
*   `-f` or `--filetype` (optional): Specifies the output file type for the generated documentation (default: markdown).
*   `-v` or `--verbose` (optional): Enables verbose output for detailed information (default: false).
*   `-h` or `--help`: Displays the help message for Bimbus.

Examples
--------

The following are some examples on how to run Bimbus.

Basic usage:

    $ node dist/index.js -t <OpenAI Access Token> -i path/to/code/file.js

Specifying an output directory:

    $ node dist/index.js -t <OpenAI Access Token> -i path/to/code/file.py -o output/docs/

Customizing the output file type:

    $ node dist/index.js -t <OpenAI Access Token> -i path/to/code/file.ts -f html

Enabling verbose output:

    $ node dist/index.js -t <OpenAI Access Token> -i path/to/code/file.py -v

Displaying help message:

    $ node dist/index.js --help

Contributions and Issues
------------------------

We welcome contributions and feedback! If you encounter any issues or have suggestions for improvements, please submit them in the [Issue Tracker](https://link-to-issue-tracker). Pull requests are also welcome.

License
-------

Bimbus is released under the [MIT License](https://raw.githubusercontent.com/bitgangstudio/bimbus-cli/master/LICENSE).

📝👩‍💻 Happy documenting with Bimbus!
