# 🕵️‍♂️ deeplog - macOS Log Analyzer CLI

**deeplog** is a powerful and developer-friendly command-line tool that helps you **fetch**, **filter**, **analyze**, and **summarize** macOS system logs directly from the terminal.

> Built with Node.js. Supports colorized CLI output, JSON formatting, compression, and more.

---

## 🚀 Features

- 📥 Fetch system logs using native `log` command
- 🎯 Apply custom `--predicate` filters
- 🧾 Choose log format: `syslog` or `json`
- 💾 Save logs to custom file path (auto-creates folders)
- 📦 Automatically compress logs (`.gz`)
- 🗑️ Optionally delete original log file after compression
- 📊 Analyze logs:
  - Keyword highlights: `error`, `fail`, `timeout`, `disconnect`
  - Count of errors, warnings, info
  - Top 5 frequent messages
  - Top 5 active processes (with bar chart)
  - Save analysis to `.summary.json`

---

## 📦 Installation

```bash
git clone https://github.com/your-username/deeplog-cli-nodejs.git
cd deeplog-cli-nodejs
npm install
chmod +x bin/index.js

    Optionally add to your PATH or link globally:

npm link

💡 Usage
📥 Fetch Logs

node bin/index.js fetch --last 10m --output logs/errors.log

🧪 Add Filters

node bin/index.js fetch --last 30m \
  --output logs/errors.json \
  --predicate 'eventMessage CONTAINS "error"' \
  --style json

🧹 Auto-Compress & Delete

node bin/index.js fetch --last 5m \
  --output logs/errors.log \
  --delete-original

🔍 Analyze Logs

node bin/index.js analyze logs/errors.json

With Summary Output

node bin/index.js analyze logs/errors.json --save-summary

Creates: logs/errors.json.summary.json
📊 Sample Output

📊 Log Levels:
❌ Errors:     [███████████████████████████] 132
⚠️  Warnings:   [████████████]               45
ℹ️  Info:       [████████████████]           98

🧠 Top Processes:
ZscalerTunnel         [████████████████████████████] 4197
com.cisco.anyconnect  [████████████████████]        1620
Docker.app            [██████████]                  879
Cursor Helper         [███████]                     659
UPMServiceControl     [█████]                       480

📁 Project Structure

deeplog-cli-nodejs/
├── bin/
│ └── index.js # CLI entry point
├── commands/
│ ├── fetch.js # Fetch logs command
│ └── analyze.js # Analyze logs command
├── package.json
├── README.md

🧩 Planned Features

    🔔 Realtime log tailing

    📧 Email or webhook notifications for critical logs

    🌐 Web UI integration

    🧠 AI-based log anomaly detection

🛠️ Requirements
    macOS (uses log show)
    Node.js 18+

