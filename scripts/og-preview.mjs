import fs from 'node:fs';
import path from 'node:path';

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
const cards = walk('dist/og')
  .filter((f) => f.endsWith('.png'))
  .map((f) => ({
    path: path.relative('dist', f).replace(/\\/g, '/'),
    /* Every build rewrites these at the same URL and a browser is entitled to reuse
       what it has, so the preview asks for the file that is actually on disk. */
    stamp: Math.round(fs.statSync(f).mtimeMs),
  }))
  .sort((a, b) => a.path.localeCompare(b.path));
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Social cards</title><style>
body{margin:0;padding:2rem;background:#111;color:#eee;font:14px/1.5 system-ui,sans-serif}
h1{font-size:1.1rem;margin:0 0 1.5rem;font-weight:600}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:1.5rem}
figure{margin:0}
img{width:100%;display:block;border-radius:8px;border:1px solid #333}
figcaption{margin-top:.4rem;color:#8a8a96;font-family:ui-monospace,monospace;font-size:12px}
</style></head><body><h1>${cards.length} social cards, 1200x630</h1><div class="grid">
${cards.map((c) => `<figure><img src="/${c.path}?v=${c.stamp}" width="1200" height="630" loading="lazy" alt=""><figcaption>${c.path}</figcaption></figure>`).join('\n')}
</div></body></html>`;
fs.writeFileSync('dist/_og-preview.html', html);
console.log('preview page lists', cards.length, 'cards');
