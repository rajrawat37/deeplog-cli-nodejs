#!/usr/bin/env node

import {Command} from 'commander';

// Initialize the CLI parser
const program = new Command();

program.name('splunk-cli-parser')
    .description('A CLI tool for parsing Splunk command line arguments')
    .version('1.0.0');

// Define the command to parse Splunk CLI arguments
program.argument('<file>', 'Splunk CLI arguments to parse')
       .action((file) =>{ 
            console.log(`Parsing Splunk CLI arguments from file: ${file}`);
       })
// Parse the command line arguments
program.parse(process.argv);        

// Export the program for testing or other purposes
export default program;
