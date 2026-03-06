const fs = require('fs');
const path = require('path');

const replacements = [
    [/var\(--surface-[123]\)/g, 'var(--surface-subtle)'],
    [/var\(--border-[12]\)/g, 'var(--border-subtle)'],
    [/var\(--text-muted\)/g, 'var(--text-secondary)'],
    [/var\(--danger\)/g, 'var(--state-alert)'],
    [/var\(--bg-default\)/g, 'var(--bg-primary)'],
    [/var\(--shadow-card\)/g, 'var(--shadow-base)'],
    [/var\(--shadow-inset\)/g, 'none'],
    [/var\(--ease-bounce(,\s*[^)]+)?\)/g, 'var(--ease-standard)'],
    [/var\(--accent-2\)/g, 'var(--accent)'],
    [/var\(--success\)/g, 'var(--state-success)'],
    [/var\(--warning\)/g, 'var(--state-warning)']
];

function processPath(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processPath(fullPath);
        } else if (fullPath.endsWith('.css') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            for (const [regex, replacement] of replacements) {
                content = content.replace(regex, replacement);
            }
            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated', fullPath);
            }
        }
    }
}

processPath('c:/Users/Dario Estrada/Downloads/MOVE OS/moveos-app/src');
console.log('Done!');
