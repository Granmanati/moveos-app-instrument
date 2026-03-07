const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = {
    // Regex : Replacement
    'var\\(--duration-fast\\)': 'var(--mo-duration-fast)',
    'var\\(--duration-base\\)': 'var(--mo-duration-base)',
    'var\\(--duration-screen\\)': 'var(--mo-duration-base)',
    'var\\(--duration-button\\)': 'var(--mo-duration-fast)',
    'var\\(--duration-pipeline\\)': 'var(--mo-duration-slow)',
    'var\\(--duration-pulse\\)': 'var(--mo-duration-pulse)',
    'var\\(--duration-fill\\)': 'var(--mo-duration-progress)',
    'var\\(--ease-standard\\)': 'var(--mo-ease-standard)',
    'var\\(--ease-system\\)': 'var(--mo-ease-system)',
    'var\\(--ease-primary\\)': 'var(--mo-ease-standard)',
};

let changedCount = 0;

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
            if (file === 'tokens.css') continue;

            let content = fs.readFileSync(filePath, 'utf8');
            let changed = false;

            for (const [regexStr, replacement] of Object.entries(replacements)) {
                const regex = new RegExp(regexStr, 'g');
                if (regex.test(content)) {
                    content = content.replace(regex, replacement);
                    changed = true;
                }
            }

            if (changed) {
                fs.writeFileSync(filePath, content, 'utf8');
                changedCount++;
                console.log('Updated: ' + filePath);
            }
        }
    }
}

walkDir(srcDir);
console.log('Total animation files updated: ' + changedCount);
