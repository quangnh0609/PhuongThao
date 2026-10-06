const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const deps = 'C:/Users/Nguye/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/';
const { chromium } = require(deps + 'playwright');
const { instance } = require(deps + '@viz-js/viz');
const root = path.resolve(__dirname, '../..');
const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// The source uses a restricted Mermaid grammar: quoted nodes and labeled arrows.
function toDot(source) {
  const nodes = new Map();
  const edges = [];
  const lines = source.trim().split(/\r?\n/);
  const direction = lines.shift().trim().endsWith('LR') ? 'LR' : 'TB';
  for (const line of lines.filter(line => line.trim())) {
    for (const match of line.matchAll(/\b([A-Z][A-Z0-9]*)\s*([\[{])"([^"]+)"[\]}]/g)) {
      nodes.set(match[1], { label: match[3], decision: match[2] === '{' });
    }
    const from = line.trim().match(/^([A-Z][A-Z0-9]*)/);
    const edge = line.match(/-->\s*(?:\|([^|]+)\|\s*)?([A-Z][A-Z0-9]*)/);
    if (!from || !edge) throw new Error('Unsupported Mermaid line: ' + line);
    edges.push({ from: from[1], to: edge[2], label: edge[1] || '' });
  }
  const statements = [...nodes].map(([id, node]) => {
    const label = node.label.split(/<br\s*\/?\s*>/i).map(escape).join('<BR/>');
    return `${id} [shape=${node.decision ? 'diamond' : 'box'}, style="${node.decision ? 'filled' : 'rounded,filled'}", fillcolor="${node.decision ? '#eef2f5' : '#ffffff'}", label=<${label}>];`;
  });
  for (const edge of edges) {
    if (!nodes.has(edge.from) || !nodes.has(edge.to)) throw new Error('Undefined flow node');
    statements.push(`${edge.from} -> ${edge.to} [label=${JSON.stringify(edge.label)}];`);
  }
  return `digraph { graph [rankdir=${direction}, bgcolor="transparent", pad="0.12", nodesep="0.25", ranksep="0.22"]; node [fontname="Arial", fontsize=12, color="#485666", penwidth=1, margin="0.10,0.07"]; edge [fontname="Arial", fontsize=10, color="#657384", arrowsize=0.65]; ${statements.join('\n')} }`;
}

(async () => {
  const { marked } = await import(pathToFileURL(deps + 'marked/lib/marked.esm.js').href);
  const viz = await instance();
  const markdown = fs.readFileSync(path.join(root, 'BRD.md'), 'utf8');
  let diagrams = 0;
  const prepared = markdown.replace(/```mermaid\s*\r?\n([\s\S]*?)```/g, (_, source) => {
    const svg = viz.renderString(toDot(source), { format: 'svg' }).replace(/<\?xml[^>]*>|<!DOCTYPE[\s\S]*?>/g, '');
    diagrams++;
    return '\n<div class="diagram"><img alt="Sơ đồ luồng nghiệp vụ" src="data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64') + '"></div>\n';
  });
  const html = `<!DOCTYPE html><html lang="vi"><meta charset="utf-8"><title>BRD - Phương Thảo</title>
  <style>
  @page { size:A4; margin:16mm 14mm 17mm; }
  * { box-sizing:border-box; } body { font-family:Arial,sans-serif; font-size:10pt; line-height:1.42; color:#202a35; margin:0; }
  h1 { font-size:23pt; line-height:1.22; color:#203d50; padding-bottom:6mm; border-bottom:2px solid #2a6873; margin:0 0 7mm; }
  h2 { font-size:16pt; color:#203d50; margin:0 0 5mm; break-before:page; break-after:avoid; }
  h2:first-of-type { break-before:avoid; }
  h3 { font-size:12pt; margin:5mm 0 3mm; break-after:avoid; }
  h4 { font-size:11pt; break-after:avoid; }
  p { margin:0 0 3mm; } li { margin:1mm 0; } ul { padding-left:6mm; }
  table { border-collapse:collapse; width:100%; table-layout:fixed; margin:3mm 0 5mm; font-size:9pt; }
  th,td { border:1px solid #bac6cd; padding:1.8mm; vertical-align:top; overflow-wrap:anywhere; line-height:1.3; }
  th { background:#edf3f5; text-align:left; color:#203d50; font-weight:700; }
  thead { display:table-header-group; } tr { break-inside:avoid; } tbody tr:nth-child(even) { background:#f8fafb; }
  code { font-family:Arial,sans-serif; font-size:0.94em; color:#334c5b; }
  .diagram { text-align:center; break-inside:avoid; margin:2mm 0 4mm; }
  .diagram img { width:100%; height:auto; max-height:215mm; object-fit:contain; }
  .flow-heading { break-before:page; margin-top:0; }
  .req-table td:first-child,.req-table th:first-child { width:16%; }
  .req-table td:nth-child(2),.req-table th:nth-child(2) { width:47%; }
  .req-table td:nth-child(3),.req-table th:nth-child(3) { width:18%; }
  .req-table td:nth-child(4),.req-table th:nth-child(4) { width:19%; }
  .rule-table td:first-child,.rule-table th:first-child { width:18%; }
  .rule-table td:nth-child(2),.rule-table th:nth-child(2) { width:60%; }
  .rule-table td:nth-child(3),.rule-table th:nth-child(3) { width:22%; }
  </style><body>${marked.parse(prepared)}</body></html>`;
  fs.mkdirSync(path.join(root, 'output/pdf'), { recursive: true });
  const htmlFile = path.join(__dirname, 'BRD-print.html');
  fs.writeFileSync(htmlFile, html);
  const browser = await chromium.launch({ headless:true, channel:'msedge' });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(htmlFile).href);
    await page.evaluate(() => {
      document.querySelectorAll('h3').forEach(h => { if (/^7\.[2-5]\./.test(h.textContent)) h.classList.add('flow-heading'); });
      document.querySelectorAll('table').forEach(table => {
        const cells = [...table.querySelectorAll('thead th')].map(c => c.textContent);
        if (cells.includes('Nguồn / cơ sở')) table.classList.add('req-table');
        if (cells.includes('Quy tắc') || cells.includes('Tiêu chí')) table.classList.add('rule-table');
      });
    });
    await page.pdf({ path:path.join(root,'output/pdf/BRD_PhuongThao.pdf'), format:'A4', printBackground:true, preferCSSPageSize:true,
      displayHeaderFooter:true,
      headerTemplate:'<div style="font-family:Arial;font-size:8px;width:100%;margin:0 14mm;color:#687680">PHƯƠNG THẢO | PT-BRD-001</div>',
      footerTemplate:'<div style="font-family:Arial;font-size:8px;width:100%;margin:0 14mm;color:#687680;display:flex;justify-content:space-between"><span>BRD 1.0 | Draft | 06/10/2026</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'
    });
    console.log(JSON.stringify({ diagrams, pdf:path.join(root,'output/pdf/BRD_PhuongThao.pdf') }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
