import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    // get the git hash
    const hash = execSync('git rev-parse HEAD').toString().trim();

    // create the JSON content
    const content = JSON.stringify({ hash });

    // write to file
    fs.writeFileSync(path.join(__dirname, '../data/commitHash.json'), content);
    console.log('Successfully wrote commit hash');
} catch (error) {
    console.error('Failed to write commit hash:', error);
    // write a fallback hash to prevent build failure
    fs.writeFileSync(
        path.join(__dirname, '../data/commitHash.json'),
        JSON.stringify({ hash: 'development' })
    );
}
