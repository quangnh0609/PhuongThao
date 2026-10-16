// Export each business folder's docs/*.md to self-contained HTML in its output/
// (docs/X.md -> output/X.html). The Mermaid library is embedded, so diagrams
// render when the page opens (no network, no server). To print, use the browser's Print.
// Usage: node tools/export-html.cjs                                  (every business folder)
//        node tools/export-html.cjs 01.Ket_noi_website_1             (one folder)
//        node tools/export-html.cjs 01.Ket_noi_website_1/docs/BRD_PhuongThao.md   (one document)
const fs = require('fs');
const path = require('path');
const { marked } = require('./node_modules/marked/lib/marked.esm.js');

const root = path.resolve(__dirname, '..');
const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mermaidJs = fs.readFileSync(path.join(__dirname, 'node_modules/mermaid/dist/mermaid.min.js'), 'utf8');

const style = `
@page { size:A4; margin:16mm 14mm 17mm; }
* { box-sizing:border-box; }
body { font-family:Arial,sans-serif; font-size:10pt; line-height:1.42; color:#202a35; margin:0 auto; padding:0 16px; max-width:210mm; background:#fff; }
h1 { font-size:23pt; line-height:1.22; color:#203d50; padding-bottom:6mm; border-bottom:2px solid #2a6873; margin:6mm 0 7mm; }
h2 { font-size:16pt; color:#203d50; margin:8mm 0 5mm; break-after:avoid; }
h3 { font-size:12pt; color:#203d50; margin:5mm 0 3mm; break-after:avoid; }
p { margin:0 0 3mm; } li { margin:1mm 0; } ul { padding-left:6mm; }
table { border-collapse:collapse; width:100%; margin:3mm 0 5mm; font-size:9pt; }
th,td { border:1px solid #bac6cd; padding:1.8mm; vertical-align:top; overflow-wrap:anywhere; line-height:1.3; }
th { background:#edf3f5; text-align:left; color:#203d50; font-weight:700; }
thead { display:table-header-group; } tr { break-inside:avoid; } tbody tr:nth-child(even) { background:#f8fafb; }
code { font-family:Consolas,monospace; font-size:0.9em; color:#334c5b; overflow-wrap:anywhere; }
pre { background:#f3f6f8; border:1px solid #d9e1e6; padding:3mm; margin:2mm 0 4mm; white-space:pre-wrap; overflow-wrap:anywhere; break-inside:avoid; line-height:1.26; }
.diagram { text-align:center; break-inside:avoid; margin:2mm 0 4mm; overflow-x:auto; }
.diagram pre.mermaid { margin:0; padding:0; border:0; background:none; white-space:pre; font-family:Arial,sans-serif; }
.diagram svg { max-width:100% !important; height:auto; max-height:225mm; }
@media print { body { padding:0; max-width:none; } h1 { margin-top:0; } }`;

// Business folders are the root folders that contain docs/ (the _mau template has no .md).
const markdownIn = dir => fs.existsSync(dir)
  ? fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => path.join(dir, f)) : [];
const args = process.argv.slice(2);
const targets = args.length ? args : fs.readdirSync(root).filter(d => fs.existsSync(path.join(root, d, 'docs')));
const sources = targets.flatMap(target => {
  const full = path.resolve(root, target);
  if (!fs.existsSync(full)) throw new Error('Not found: ' + target);
  return fs.statSync(full).isDirectory() ? markdownIn(path.join(full, 'docs')) : [full];
});
for (const source of sources) {
  const name = path.relative(root, source);
  const markdown = fs.readFileSync(source, 'utf8');
  const title = (markdown.match(/^# (.+)$/m) || [, path.basename(source)])[1];
  const diagrams = [];
  const prepared = markdown.replace(/```mermaid\s*\r?\n([\s\S]*?)```/g, (_, source) => {
    diagrams.push(source);
    return `\n\nMERMAID_BLOCK_${diagrams.length - 1}\n\n`;
  });
  const body = marked.parse(prepared).replace(/<p>MERMAID_BLOCK_(\d+)<\/p>/g, (_, i) =>
    `<div class="diagram"><pre class="mermaid">${escape(diagrams[i])}</pre></div>`);
  const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title>
<style>${style}</style></head><body>${body}
<script>${mermaidJs}</script>
<script>
mermaid.initialize({ startOnLoad:false, theme:'neutral', fontFamily:'Arial', sequence:{ mirrorActors:false } });
mermaid.run();
</script></body></html>`;
  const outDir = path.join(path.dirname(path.dirname(source)), 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, path.basename(source, '.md') + '.html');
  fs.writeFileSync(file, html);
  console.log(JSON.stringify({ source: name, diagrams: diagrams.length, html: path.relative(root, file) }));
}
