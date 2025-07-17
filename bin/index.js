#!/usr/bin/env node

import {Command} from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import zlib from 'zlib';

// Initialize the CLI parser
const program = new Command();

program.name('deeplog')
    .description('A CLI tool for parsing Splunk command line arguments')
    .version('1.0.0');

// Define the command to fetch MacOs logs
program.command('fetch')
    .description('Fetch logs from MacOs')
    .option('-o, --output <path>', 'Output file path for logs')
    .option('-l, --last <time>', 'Specify the time range for fetching logs')
    .option('-p, --predicate <expression>', 'Add a predicate filter for the logs')
    .option('-s, --style <style>', 'Specify the output style: syslog (default) or json')
    .option('-d, --delete-original', 'Delete the original log file after compression')
    .action(({ last, output, predicate, style, deleteOriginal}) => {

             if (!last || !output) {
                console.error('❌ Please provide both --last and --output options');
                process.exit(1);
            }

            const dir = path.dirname(output);
            const base = path.basename(output, path.extname(output));
            const ext = (style === 'json') ? '.json' : '.log';
            output = path.join(dir, base + ext);
            // dir stores name if in the ouput path enters the directory name in the terminal
            // !fs.existsSync(dir)means if the folder does not exist in current working directory then create the directory
            if (dir && !fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }

         
            console.log(chalk.green(`🚀 Fetching logs from past ${last}...`));
            
            // spawn - It is used to launch a new process with the specified command and arguments.
            // 'log' is the command to be executed, and args are the command line arguments
            const args = ['show', '--last', last];
            if (predicate) {
              args.push('--predicate', predicate);
            }
            if(style){
                args.push('--style', style);
            }


            const child = spawn('log', args);

            
            // fs.createWriteStream - It creates a writable stream to a file.
            // This file is now ready to receive log content line by line, like a pipe.
            const stream = fs.createWriteStream(output);

            child.stdout.pipe(stream); // pipe logs directly into file
            
            child.stderr.on('data', (data) => {
                console.error(chalk.red(`❌ stderr: ${data}`));
            });

            child.on('close', (code) => {
                if (code === 0) {
                    const { size } = fs.statSync(output);
                    console.log(chalk.green(`✅ Logs saved to ${output} (${(size / 1024).toFixed(2)} KB)`));
                } else {
                    console.error(chalk.red(`❌ Command exited with code ${code}`));
                }
            });

            child.on('error', (err) => {
                console.error(chalk.red(`❌ Error executing command: ${err.message}`));
            });
            child.on('exit', (code) => {
                if (code !== 0) {
                    console.error(chalk.red(`❌ Command exited with code ${code}`));
                }
            });

            stream.on('finish', () => {
                console.log(chalk.green('✅ Log file write completed.'));
                const zipPath = output + '.gz';
                const zipStream = fs.createWriteStream(zipPath);
                const gzip = zlib.createGzip();

                fs.createReadStream(output)
                    .pipe(gzip)
                    .pipe(zipStream)
                    .on('finish', () => {
                        console.log(chalk.green(`📦 Compressed to ${zipPath}`));

                        if (deleteOriginal) {
                            fs.unlinkSync(output);
                            console.log(chalk.gray(`🗑️  Deleted original log file: ${output}`));
                        } else {
                            console.log(chalk.yellow('⚠️  Original log file retained.'));
                        }
                    });
            });

    });
// Parse the command line arguments
program.parse(process.argv);        

// Export the program for testing or other purposes
export default program;



// Use this in terminal to run the script
// node bin/index.js fetch --last 10m --output logs/error.log --predicate 'eventMessage CONTAINS "error"' --style json
