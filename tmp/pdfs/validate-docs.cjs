const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('C:/Users/Nguye/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '../..');
const blocks = [];
for (const name of ['BRD.md', 'TOM_TAT_YEU_CAU_GIAI_PHAP_API.md']) {
  const content = fs.readFileSync(path.join(root, name), 'utf8');
  for (const match of content.matchAll(/```json\s*\r?\n([\s\S]*?)```/g)) JSON.parse(match[1]);
  for (const match of content.matchAll(/```mermaid\s*\r?\n([\s\S]*?)```/g)) blocks.push({name, source:match[1]});
}
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/') { res.end('<!DOCTYPE html><html><body></body></html>'); return; }
  const file = path.resolve(__dirname, '.' + pathname);
  if (!file.startsWith(__dirname + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (error, data) => { res.writeHead(error ? 404 : 200, {'Content-Type':'application/javascript'}); res.end(error ? 'Not found' : data); });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({headless:true, channel:'msedge'});
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    const results = await page.evaluate(async sources => {
      const {default:mermaid} = await import('/node_modules/mermaid/dist/mermaid.esm.min.mjs');
      mermaid.initialize({startOnLoad:false});
      const results = [];
      for (let i = 0; i < sources.length; i++) {
        const rendered = await mermaid.render('diagram' + i, sources[i].source);
        if (!rendered.svg.includes('<svg')) throw new Error('Blank diagram: ' + sources[i].name);
        results.push({file:sources[i].name, svgLength:rendered.svg.length});
      }
      return results;
    }, blocks);
    console.log(JSON.stringify({renderedDiagrams:results.length, results}));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {console.error(error);process.exit(1);});
