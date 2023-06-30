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

Bimbus is a command line tool built with Node.js that leverages OpenAI technology to generate thorough documentation for code files, such as .php, .ts, and more. With Bimbus, you can easily generate comprehensive documentation to enhance the understanding and maintainability of your codebase.

System Requirements
-------------------

To use Bimbus, ensure that you have the following system requirements:

*   Node.js (v14 or higher)
*   npm (v18 or higher)

Installation
------------

To install Bimbus, follow these steps:

1.  Download the Bimbus repository.
2.  Open a terminal or command prompt.
3.  Navigate to the downloaded repository directory.
4.  Run the following bash script to install Bimbus:

    $ ./install.sh
    

#### 🔐 OpenAI API

To use the README-AI application, you will need to create an account with OpenAI to generate an API key. The steps below outline this setup process:

<details closed><summary>OpenAI API User Guide</summary>

1. Go to the [OpenAI website](https://platform.openai.com/).
2. Click the "Sign up for free" button.
3. Fill out the registration form with your information and agree to the terms of service.
4. Once logged in, click on the "API" tab.
5. Follow the instructions to create a new API key.
6. Copy the API key and keep it in a secure place.

</details>
<br>

Usage
-----

To generate documentation using Bimbus, run the following command:

    $ node dist/index.js -t <OpenAI Access Token> -i <input-file-path> [-o <output-file-directory>]
    

The command accepts the following arguments:

*   `-t` or `--token`: Specifies the OpenAI Access Token.
*   `-i` or `--input`: Specifies the path to the input file containing code to generate documentation for.
*   `-o` or `--output` (optional): Specifies the output directory where the generated documentation will be saved. If not provided, the documentation will be saved in the current working directory.

Examples
--------

Here are a few examples demonstrating the usage of Bimbus:

    $ bimbus -t your-access-token -i /path/to/code.php
    

    $ bimbus -t your-access-token -i /path/to/code.ts -o /path/to/output/directory
    

Additional Resources
--------------------

For more information on how to use Bimbus and customize its behavior, refer to the [Bimbus Documentation](https://link-to-bimbus-documentation).

Contributions and Issues
------------------------

We welcome contributions and feedback! If you encounter any issues or have suggestions for improvements, please submit them in the [Issue Tracker](https://link-to-issue-tracker). Pull requests are also welcome.

License
-------

Bimbus is released under the [MIT License](https://link-to-license).

📝👩‍💻 Happy documenting with Bimbus!