#!/usr/bin/env node

import { Command } from 'commander';
import fetch from '../commands/fetch.js'; // modularized
import analyze from '../commands/analyze.js'; 

const program = new Command();

program
  .name('deeplog')
  .description('A CLI tool for parsing and analyzing macOS logs')
  .version('1.0.0');

// Add commands
program.addCommand(fetch);
program.addCommand(analyze); 

program.parse(process.argv);



// deeplog fetch --last 10m --output logs/sys.log --style json
// node bin/index.js analyze logs/sys.json