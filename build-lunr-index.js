// Build a compact client-side search store after Hugo has rendered index.json.
// No npm packages are required.
const fs = require('fs');
const path = require('path');

const root = __dirname;
const generated = path.join(root, 'public', 'index.json');
const content = path.join(root, 'content');

if (!fs.existsSync(generated)) {
  throw new Error('Kjør Hugo før build-lunr-index.js.');
}

const pages = JSON.parse(fs.readFileSync(generated, 'utf8'));
const pdfs = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
      const relative = path.relative(content, full).split(path.sep).join('/');
      const parts = relative.split('/');
      const title = path.basename(entry.name, path.extname(entry.name))
        .replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
      pdfs.push({
        uri: `/${encodeURI(relative)}`,
        title,
        path: `Dokumenter / ${parts.slice(0, -1).join(' / ') || 'Filer'}`,
        section: 'dokumenter',
        type: 'document',
        description: 'PDF-dokument',
        content: `${title} ${parts.join(' ')}`
      });
    }
  }
}

walk(content);
const output = JSON.stringify([...pages, ...pdfs]);
fs.writeFileSync(path.join(root, 'static', 'lunr-index.json'), output);
fs.writeFileSync(path.join(root, 'public', 'lunr-index.json'), output);
console.log(`Søkeindeks: ${pages.length} sider og ${pdfs.length} PDF-er.`);
