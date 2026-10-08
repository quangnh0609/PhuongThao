const fs = require('fs');
const path = require('path');
const http = require('http');
const { pathToFileURL } = require('url');
const deps = 'C:/Users/Nguye/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/';
const { chromium } = require(deps + 'playwright');
const root = path.resolve(__dirname, '../..');
const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

(async () => {
  const { marked } = await import(pathToFileURL(deps + 'marked/lib/marked.esm.js').href);
  const markdown = fs.readFileSync(path.join(root, 'TOM_TAT_YEU_CAU_GIAI_PHAP_API.md'), 'utf8');
  const updatedDate = markdown.match(/Ngày cập nhật: (\d{2}\/\d{2}\/\d{4})/)[1];
  const diagrams = [];
  const prepared = markdown.replace(/```mermaid\s*\r?\n([\s\S]*?)```/g, (_, source) => {
    const index = diagrams.push(source.trim()) - 1;
    return `\n\nFLOW_PLACEHOLDER_${index}\n\n`;
  });
  let body = marked.parse(prepared);
  for (let index = 0; index < diagrams.length; index++) {
    body = body.replace(`<p>FLOW_PLACEHOLDER_${index}</p>`, `<div class="diagram"><pre class="mermaid">${escape(diagrams[index])}</pre></div>`);
  }
  const html = `<!DOCTYPE html><html lang="vi"><meta charset="utf-8"><title>Phương Thảo - Yêu cầu, giải pháp và API</title>
  <style>
    @page { size:A4; margin:15mm 14mm 17mm; }
    * { box-sizing:border-box; }
    body { font-family:Arial,sans-serif; font-size:10pt; line-height:1.4; color:#25313b; margin:0; }
    h1 { font-size:23pt; line-height:1.22; color:#224658; margin:0 0 6mm; padding-bottom:5mm; border-bottom:2px solid #386c76; }
    h2 { font-size:16pt; color:#224658; margin:6mm 0 4mm; break-before:page; break-after:avoid; }
    h2:first-of-type { break-before:avoid; }
    h3 { font-size:12pt; color:#224658; margin:5mm 0 3mm; break-after:avoid; }
    p { margin:0 0 3mm; } ul { padding-left:6mm; } li { margin:1.2mm 0; }
    table { width:100%; border-collapse:collapse; table-layout:fixed; margin:3mm 0 4mm; font-size:9.5pt; }
    th,td { border:1px solid #bac7ce; padding:2mm; vertical-align:top; overflow-wrap:anywhere; }
    th { background:#eef4f6; text-align:left; color:#224658; }
    tr { break-inside:avoid; } thead { display:table-header-group; }
    td:first-child,th:first-child { width:27%; }
    tbody tr:nth-child(even) { background:#f8fafb; }
    code { font-family:Consolas,monospace; font-size:8.6pt; overflow-wrap:anywhere; }
    pre { background:#f3f6f8; border:1px solid #d9e1e6; padding:3mm; margin:2mm 0 4mm; white-space:pre-wrap; overflow-wrap:anywhere; break-inside:avoid; line-height:1.26; }
    pre code { font-size:8.5pt; }
    .diagram { break-inside:avoid; margin:3mm 0 4mm; text-align:center; }
    .diagram svg { width:100%; height:auto; max-height:213mm; }
    .new-page { break-before:page; margin-top:0; }
  </style><body>${body}
  <script type="module">
    import mermaid from '/node_modules/mermaid/dist/mermaid.esm.min.mjs';
    mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:'base',fontFamily:'Arial',themeVariables:{fontFamily:'Arial',fontSize:'16px',primaryColor:'#edf4f7',primaryTextColor:'#25313b',primaryBorderColor:'#547184',lineColor:'#657b8a',noteBkgColor:'#f6f3e7',noteBorderColor:'#b4a875',actorBkg:'#eaf2f6',actorBorder:'#547184',actorTextColor:'#25313b',signalTextColor:'#25313b',labelBoxBkgColor:'#f3f6f8',labelBoxBorderColor:'#b6c5ce'},sequence:{useMaxWidth:false,mirrorActors:false,wrap:true,wrapPadding:8,width:220,height:45,actorMargin:20,messageMargin:15,noteMargin:6,actorFontSize:16,messageFontSize:16,noteFontSize:15,diagramMarginX:8,diagramMarginY:8}});
    try { await mermaid.run({querySelector:'.mermaid'}); await document.fonts.ready; window.diagramsReady=true; } catch(error) { window.diagramError=String(error); }
  </script></body></html>`;
  fs.mkdirSync(path.join(root,'output/pdf'),{recursive:true});
  fs.writeFileSync(path.join(__dirname,'summary-print.html'),html);
  const server = http.createServer((req,res) => {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file = pathname === '/' ? path.join(__dirname,'summary-print.html') : path.resolve(__dirname,'.' + pathname);
    if (!file.startsWith(__dirname + path.sep)) { res.writeHead(403); res.end(); return; }
    const ext = path.extname(file);
    const type = ext === '.html' ? 'text/html; charset=utf-8' : ['.js','.mjs'].includes(ext) ? 'application/javascript' : 'application/octet-stream';
    fs.readFile(file,(error,data) => { res.writeHead(error ? 404 : 200,{'Content-Type':type}); res.end(error ? 'Not found' : data); });
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  let browser;
  try {
    browser = await chromium.launch({headless:true,channel:'msedge'});
    const page = await browser.newPage({viewport:{width:1100,height:1200}});
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.waitForFunction(() => window.diagramsReady || window.diagramError, null, {timeout:30000});
    const error = await page.evaluate(() => window.diagramError);
    if (error) throw new Error(error);
    const dimensions = await page.evaluate(() => {
      const firstDiagram = document.querySelector('.diagram svg');
      if (firstDiagram) firstDiagram.style.maxHeight='175mm';
      document.querySelectorAll('table').forEach(table => {
        if (table.querySelector('th')?.textContent === 'Yêu cầu') {
          table.querySelectorAll('tr').forEach(row => {
            if (row.children[0]) row.children[0].style.width='73%';
            if (row.children[1]) row.children[1].style.width='27%';
          });
        }
      });
      document.querySelectorAll('h3').forEach(h => {
        if (/^2\.[2-4]\.|^3\.[2-6]\./.test(h.textContent)) h.classList.add('new-page');
      });
      document.querySelectorAll('p').forEach(p => {
        if (p.children.length === 1 && p.firstElementChild.tagName === 'STRONG') p.style.breakAfter='avoid';
      });
      return [...document.querySelectorAll('.diagram svg')].map(svg => ({viewBox:svg.getAttribute('viewBox'),textCount:svg.querySelectorAll('text').length}));
    });
    const output = path.join(root,'output/pdf/PhuongThao_YeuCau_GiaiPhap_API.pdf');
    await page.pdf({path:output,format:'A4',printBackground:true,preferCSSPageSize:true,displayHeaderFooter:true,
      headerTemplate:'<div style="font-family:Arial;font-size:8px;width:100%;margin:0 14mm;color:#687680">PHƯƠNG THẢO | YÊU CẦU, GIẢI PHÁP VÀ API</div>',
      footerTemplate:`<div style="font-family:Arial;font-size:8px;width:100%;margin:0 14mm;color:#687680;display:flex;justify-content:space-between"><span>${updatedDate} | Đặc tả API cơ bản</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`});
    console.log(JSON.stringify({output,diagrams:dimensions}));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {console.error(error);process.exit(1);});
