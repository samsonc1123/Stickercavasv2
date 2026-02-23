// rename.js
// Bulk-copy images from ./input to ./output as PREFIX#####.png
// Writes mapping.csv (old_name,new_name)

const fs = require('fs');
const path = require('path');
const PREFIX = 'BKH';
const START_AT = 1;
const INPUT = path.join(__dirname, 'input');
const OUTPUT = path.join(__dirname, 'output');
const DIGITS = 5;
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.tif', '.tiff']);

const pad = (n) => String(n).padStart(DIGITS, '0');

if (!fs.existsSync(INPUT)) fs.mkdirSync(INPUT, { recursive: true });
if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

const files = fs.readdirSync(INPUT)
  .filter(f => fs.statSync(path.join(INPUT, f)).isFile())
  .filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

let counter = START_AT;
const mapping = ['original,new_name'];

for (const f of files) {
  const code = `${PREFIX}${pad(counter)}`;
  const dest = path.join(OUTPUT, `${code}.png`);
  fs.copyFileSync(path.join(INPUT, f), dest);
  mapping.push(`${JSON.stringify(f)},${code}.png`);
  counter++;
}

fs.writeFileSync(path.join(OUTPUT, 'mapping.csv'), mapping.join('\n'), 'utf8');
console.log('DONE! Check ./output for renamed files and mapping.csv');
