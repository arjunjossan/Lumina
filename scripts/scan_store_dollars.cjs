const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('./src');
let total = 0;
files.forEach(f => {
  // Skip initialData.ts, scripts, etc.
  if (f.includes('scripts') || f.includes('initialData.ts') || f.includes('types.ts')) return;
  const content = fs.readFileSync(f, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    // Check if line contains $ as currency
    // e.g. >$ or `$ or "$ or '$ or ($ or -$ or +$
    if (/>\s*\$/.test(l) || /['"`]\s*\$/.test(l) || /\(\s*\$/.test(l) || /-\s*\$/.test(l) || /\+\s*\$/.test(l) || /₹\$/.test(l)) {
      console.log(`${f}:${idx + 1}: ${l.trim()}`);
      total++;
    }
  });
});
console.log(`Total occurrences found: ${total}`);
