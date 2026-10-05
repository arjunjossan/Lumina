const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (!full.includes('node_modules') && !full.includes('.git') && !full.includes('dist')) {
        results = results.concat(walk(full));
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('./src');
const occurrences = {};

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Find $ which is used as currency:
    // e.g. ">$", "'$", '"$', " $", ">- $", ">-$", "$", or `${...}` preceded by $ like `$${
    if (
      line.includes('>$') || 
      line.includes("'$") || 
      line.includes('"$') || 
      line.includes('`$') || 
      line.includes('($') || 
      line.includes('$${') ||
      line.includes('-$') ||
      line.includes('+$') ||
      line.includes('Over $') ||
      line.includes('over $') ||
      line.includes('USD') ||
      line.includes('dollar') ||
      line.includes('Dollar')
    ) {
      if (!occurrences[f]) occurrences[f] = [];
      occurrences[f].push({ line: idx + 1, text: line.trim() });
    }
  });
});

for (const [file, items] of Object.entries(occurrences)) {
  console.log(`${file} (${items.length} occurrences):`);
  items.slice(0, 5).forEach(it => console.log(`  L${it.line}: ${it.text}`));
}
