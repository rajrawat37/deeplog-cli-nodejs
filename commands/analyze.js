// commands/analyze.js

import { Command } from 'commander';
import fs from 'fs';
import chalk from 'chalk';
import path from 'path';

// Keywords to highlight in logs
const highlightKeywords = ['error', 'fail', 'timeout', 'disconnect'];
const regexKeywords = new RegExp(highlightKeywords.join('|'), 'gi');

// Format long process names for CLI display
function formatProcessName(name, maxLength = 30) {
  if (name.length <= maxLength) return name.padEnd(maxLength); //If the name is shorter or equal to maxLength, it is returned after padding extra spaces to the right.
  return name.slice(0, maxLength - 3) + '...'; // If name is longer than maxLength, it is truncated and '...' is appended.
}

const analyze = new Command('analyze');

analyze
  .description('Analyze a log file for errors, warnings, and insights')
  .argument('<path>', 'Path to the log file')
  .option('-s, --save-summary', 'Save a .summary.json report')
  .action((logFilePath, options) => {
    if (!fs.existsSync(logFilePath)) {
      console.error(chalk.red(`❌ File not found: ${logFilePath}`));
      process.exit(1);
    }

    const content = fs.readFileSync(logFilePath, 'utf8');
    const lines = content.split('\n');

    // 🔍 Process Extraction
    const processCounts = {};
    const processRegex = /process:\s*([^\s:"]+[^"\n]*)/i;

    for (let line of lines) {
      const match = line.match(processRegex);
      if (match) {
        const proc = match[1].trim().replace(/\\\//g, '/'); //  removes any surrounding whitespace & converts escaped slashes (\/) into real slashes (/)
        if (proc.length < 2 || /[%@]/.test(proc)) continue; // Skips invalid or placeholder names: Very short names like %s, %@
        processCounts[proc] = (processCounts[proc] || 0) + 1; // (undefined || 0 becomes 0) or (3 || 0 becomes 3)
      }
    }

    const topProcesses = Object.entries(processCounts)
      .sort((a, b) => b[1] - a[1]) //  sorts them by count descending (most used process first).
      .slice(0, 5) // keeps only the top 5 processes.
      .map(([proc, count]) => ({ proc, count })); // changes each array pair into a cleaner object format


    // 📊 Print Top Processes with Bar Charts
    if (topProcesses.length) {
      console.log(chalk.cyan('\n🧠 Top Processes:'));
      const maxProcCount = topProcesses[0].count;
      const colors = [chalk.green, chalk.blue, chalk.yellow, chalk.magenta, chalk.gray];

      topProcesses.forEach(({ proc, count }, i) => {
        const displayName = formatProcessName(proc);
        console.log(printProcessBar(displayName, count, maxProcCount, colors[i % colors.length]));
      });
    }

    // 📊 Log Level Count
    let errorCount = 0, warnCount = 0, infoCount = 0, othersCount = 0;
    const freq = {};

    console.log(chalk.cyan('\n🔍 Analyzing logs...\n'));

    for (let line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('error')) errorCount++;
      else if (lower.includes('warn')) warnCount++;
      else if (lower.includes('info')) infoCount++;

      const msgKey = line.slice(0, 120);
      freq[msgKey] = (freq[msgKey] || 0) + 1;
    }

    const topMessages = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([msg, count]) => ({
        msg: msg.split('\n')[0].slice(0, 80).trim() + (msg.length > 80 ? '...' : ''),
        count,
      }));

    const summary = {
      errors: errorCount,
      warnings: warnCount,
      infos: infoCount,
      topMessages,
      topProcesses
    };

    // 📊 Print Log Level Summary with Bar Charts
    console.log(chalk.green('\n📊 Log Levels:'));
    const maxCount = Math.max(errorCount, warnCount, infoCount);
    console.log(printBar('❌ Errors:', errorCount, maxCount, chalk.red));
    console.log(printBar('⚠️  Warnings:', warnCount, maxCount, chalk.yellow));
    console.log(printBar('ℹ️  Info:', infoCount, maxCount, chalk.blue));

    // 💾 Save JSON Summary if requested
    if (options.saveSummary) {
      const logDir = path.dirname(logFilePath);
      const logName = path.basename(logFilePath);
      const summaryPath = path.join(logDir, `${logName}.summary.json`);

      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      console.log(chalk.cyan(`\n📄 Summary saved to ${summaryPath}`));
    }

    console.log();
  });


// === Helpers ===

function printProcessBar(label, count, max, colorFn) {
  const barLength = 20;
  const filledLength = Math.round((count / max) * barLength); // Find relative proportion of this item compared to the highest value and then convert the fraction into characters, by multiplying by the bar length.
  const bar = colorFn('█'.repeat(filledLength).padEnd(barLength));
  return `  ${label} ${bar} ${String(count).padStart(4)}`;
}

function printBar(label, count, max, colorFn) {
  const barLength = 25;
  const filledLength = Math.round((count / max) * barLength);
  const bar = colorFn('█'.repeat(filledLength).padEnd(barLength));
  return `${label.padEnd(12)} ${bar} ${String(count).padStart(4)}`;
}

export default analyze;
