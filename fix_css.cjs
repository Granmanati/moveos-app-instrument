const fs = require('fs');
const path = require('path');

const replacements = [
  [/linear-gradient\(.*?\)/g, 'var(--surface-subtle)'],
  [/rgba\(45,\s*124,\s*255,\s*[01]?\.?[0-9]*\)/g, 'var(--accent)'],
  [/box-shadow:\s*0.*?;/g, ''],
  [/border-color:\s*var\(--accent\)/g, 'border-color: var(--border-subtle)'],
  [/border:\s*.*var\(--accent\)/g, 'border: 1px solid var(--border-subtle)']
];

function processPath(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processPath(fullPath);
    } else if (fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      // Specifically target known hardcoded linear gradients in moveos
      content = content.replace(/background(-image)?:\s*linear-gradient\([^;]+;/g, 'background: var(--surface-subtle);');
      content = content.replace(/rgba\(45,\s*124,\s*255,\s*[01]?\.?[0-9]*\)/g, 'var(--border-subtle)');
      // For box shadow
      content = content.replace(/box-shadow:[^;]+;/g, '');

      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Cleaned CSS:', fullPath);
      }
    }
  }
}

processPath('c:/Users/Dario Estrada/Downloads/MOVE OS/moveos-app/src');
