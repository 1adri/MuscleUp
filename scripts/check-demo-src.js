const fs = require('fs');
const path = require('path');
const p = process.cwd();
const file = path.join(p, 'lib', 'exercise-library.ts');
const s = fs.readFileSync(file, 'utf8');
const re = /demoSrc:\s*"([^"]+)"/g;
let m;
let missing = 0;
console.log('Checking demoSrc files from', file);
while ((m = re.exec(s)) !== null) {
  const rel = m[1];
  const full = path.join(p, 'public', rel.replace(/\//g, path.sep));
  const ok = fs.existsSync(full);
  console.log((ok ? 'OK     ' : 'MISSING') + ' ' + rel + ' -> ' + (ok ? full : 'NOT FOUND'));
  if (!ok) missing++;
}
if (missing === 0) console.log('All demoSrc files found');
else console.log(missing + ' missing files');
