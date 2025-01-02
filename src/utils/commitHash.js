import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Path to the data directory and the commitHash.json file
const dataDir = path.join('src', 'data');
const commitFilePath = path.join(dataDir, 'commitHash.json');

// Ensure the directory exists, if not create it
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Get the short commit hash
const hash = execSync('git rev-parse --short HEAD').toString().trim();

// Save the commit hash to a JSON file
const commitData = { hash };
fs.writeFileSync(commitFilePath, JSON.stringify(commitData));

console.log(`Commit hash ${hash} saved to ${commitFilePath}`);

