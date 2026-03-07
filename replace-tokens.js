const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = {
  // Regex : Replacement
  'var\\(--bg-primary\\)': 'var(--background)',
  'var\\(--surface-primary\\)': 'var(--card)',
  'var\\(--surface-secondary\\)': 'var(--surface-muted)',
  'var\\(--surface-subtle\\)': 'var(--card)',
  'var\\(--border-subtle\\)': 'var(--border)',
  'var\\(--accent\\)': 'var(--primary)',
  'var\\(--state-success\\)': 'var(--success)',
  'var\\(--state-warning\\)': 'var(--warning)',
  'var\\(--state-alert\\)': 'var(--destructive)',
  'var\\(--text-primary\\)': 'var(--foreground)',
  'var\\(--text-secondary\\)': 'var(--mo-color-text-secondary)',
  'var\\(--text-tertiary\\)': 'var(--mo-color-text-tertiary)',
  'var\\(--font-primary\\)': 'var(--font-sans)',
  'var\\(--sp-1\\)': 'var(--mo-space-2)',
  'var\\(--sp-2\\)': 'var(--mo-space-4)',
  'var\\(--sp-3\\)': 'var(--mo-space-6)',
  'var\\(--sp-4\\)': 'var(--mo-space-8)',
  'var\\(--sp-5\\)': 'var(--mo-space-12)',
  'var\\(--sp-6\\)': 'var(--mo-space-16)',
  '#0[bB]0[fF]14': 'var(--background)',
  '#141[aA]22': 'var(--card)',
  '#10161[dD]': 'var(--surface-muted)',
  '#1[cC]2430': 'var(--border)',
  '#2[dD]7[cC][fF][fF]': 'var(--primary)',
  '#18[bB]67[aA]': 'var(--success)',
  '#[eE]8[aA]23[aA]': 'var(--warning)',
  '#[eE]45462': 'var(--destructive)',
  '#[fF][fF][bB]020': 'var(--warning)',
  '#[fF]4[fF]7[fF][bB]': 'var(--foreground)',
  '#8[aA]93[aA]3': 'var(--mo-color-text-secondary)',
  '#667085': 'var(--mo-color-text-tertiary)',
  '#fff': 'var(--foreground)',
  '#FFF': 'var(--foreground)',
  '#ffffff': 'var(--foreground)',
  '#FFFFFF': 'var(--foreground)',
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
      // skip tokens.css
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
        console.log(`Updated: ${filePath}`);
      }
    }
  }
}

walkDir(srcDir);
console.log('Total files updated: ' + changedCount);
