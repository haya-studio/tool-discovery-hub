const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(root,'data/directory.json'),'utf8'));
const htmlFiles = fs.readdirSync(root).filter(f=>f.endsWith('.html'));
assert.equal(htmlFiles.length,19);
const productionBase = 'https://haya-studio.github.io/tool-discovery-hub/';
const settings = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'config.js'),'utf8'), settings);
assert.equal(settings.window.SITE_CONFIG.siteUrl, productionBase);
const sitemap = fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
assert.equal(sitemapUrls.length,19);
assert.equal(new Set(sitemapUrls).size,19);
assert.equal(fs.readFileSync(path.join(root,'robots.txt'),'utf8'),
 `User-agent: *\nAllow: /\nSitemap: ${productionBase}sitemap.xml\n`);
assert.ok(fs.existsSync(path.join(root,'.nojekyll')));
for (const file of htmlFiles) {
 const html=fs.readFileSync(path.join(root,file),'utf8');
 const expectedUrl = new URL(file==='index.html'?'./':file,productionBase).href;
 assert.equal(html.match(/<link rel="canonical" href="([^"]+)"/)[1],expectedUrl);
 assert.equal(html.match(/<meta property="og:url" content="([^"]+)"/)[1],expectedUrl);
 assert.ok(sitemapUrls.includes(expectedUrl), `${file}: missing sitemap entry`);
 assert.doesNotMatch(html,/haya-tool-template-v1/);
 assert.match(html,/<html lang="en">/);
 assert.equal((html.match(/<h1>/g)||[]).length,1,`${file}: exactly one h1`);
 assert.match(html,/<meta name="description" content="[^"]+">/);
 for(const [,target] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  if (/^(https:|mailto:|#)/.test(target)) continue;
  assert.ok(!target.startsWith('/'),`${file}: relative path required`);
  assert.ok(fs.existsSync(path.join(root,target.split(/[?#]/)[0])),`${file}: broken ${target}`);
 }
 assert.doesNotMatch(html,/stripe|premium|example\.com|XXXXX|\[SEO|commerce-disclosure/i);
}
const contact = fs.readFileSync(path.join(root,'contact.html'),'utf8');
if (!settings.window.SITE_CONFIG.email) assert.doesNotMatch(contact,/mailto:/);
const submission = fs.readFileSync(path.join(root,'submit.html'),'utf8');
if (!settings.window.SITE_CONFIG.toolFormUrl) assert.doesNotMatch(submission,/Open tool submission form/);
if (!settings.window.SITE_CONFIG.problemFormUrl) assert.doesNotMatch(submission,/Open problem submission form/);
for(const kind of ['categories','tools','problems']) {
 assert.equal(new Set(data[kind].map(x=>x.id)).size,data[kind].length);
 for(const item of data[kind]) assert.match(item.id,/^[a-z0-9-]+$/);
}
for(const t of data.tools) {
 assert.ok(data.categories.some(c=>c.id===t.category));
 assert.ok(['free','paid','unknown'].includes(t.pricing));
 assert.ok(['yes','no','unknown'].includes(t.signup));
 assert.ok(t.problems.every(id=>data.problems.some(p=>p.id===id)));
}
// Build in memory: production subdirectory URLs, hidden/unset forms, and HTML/URL escaping.
function generated(config,dataOverride=data) {
 const outputs={};
 const fakeFs={readFileSync(file){const name=path.basename(file);if(name==='config.js')return 'window.SITE_CONFIG = '+JSON.stringify(config);if(name==='directory.json')return JSON.stringify(dataOverride);throw Error(file)},writeFileSync(file,value){outputs[path.basename(file)]=value}};
 const fakeVm={runInNewContext(source,context){vm.runInNewContext(source,context)}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'build.cjs'),'utf8'),{require(name){return name==='node:fs'?fakeFs:name==='node:vm'?fakeVm:require(name)},__dirname:root,URL,console:{log(){}}});
 return outputs;
}
const config={siteName:'Test <Brand>',siteUrl:'https://owner.github.io/repo/',email:'',toolFormUrl:'',problemFormUrl:''};
let out=generated(config);
assert.match(out['index.html'],/rel="canonical" href="https:\/\/owner.github.io\/repo\/"/);
assert.match(out['sitemap.xml'],/https:\/\/owner.github.io\/repo\/tool-yomitan.html/);
assert.doesNotMatch(out['submit.html'],/Open tool submission form/);
assert.match(out['index.html'],/Test &lt;Brand&gt;/);
out=generated({...config,toolFormUrl:'https://docs.google.com/forms/d/e/test/viewform',problemFormUrl:'javascript:alert(1)'});
assert.match(out['submit.html'],/Open tool submission form/);
assert.doesNotMatch(out['submit.html'],/href="javascript:/);
const malicious=JSON.parse(JSON.stringify(data));malicious.tools[0].name='<img src=x onerror=alert(1)>';malicious.tools[0].url='javascript:alert(1)';
out=generated(config,malicious);
assert.match(out['tools.html'],/&lt;img src=x onerror=alert\(1\)&gt;/);
assert.doesNotMatch(out['tool-ankieditor.html'],/href="javascript:/);
// Execute the real filter code with a minimal DOM contract.
class Select {constructor(values){this.options=values.map(value=>({value}));this.value='';}}
function filters(query) {
 const events={};const fields={q:{value:''},category:new Select(['','anki','language','productivity']),pricing:new Select(['','free','paid','unknown']),signup:new Select(['','yes','no','unknown'])};
 const form={elements:{namedItem:n=>fields[n]},addEventListener:(n,f)=>events[n]=f};
 const cards=data.tools.map(t=>({dataset:{category:t.category,pricing:t.pricing,signup:t.signup,search:[t.name,t.summary,...t.features,...data.problems.filter(p=>t.problems.includes(p.id)).map(p=>p.title)].join(' ').toLowerCase()},hidden:false}));
 const count={};const empty={};const elements={filters:form,'result-count':count,'empty-state':empty};
 const location={search:query,pathname:'/repo/tools.html',hash:''};
 vm.runInNewContext(fs.readFileSync(path.join(root,'assets/common/common.js'),'utf8'),{URLSearchParams,URL,HTMLSelectElement:Select,document:{getElementById:id=>elements[id]||null,querySelectorAll:()=>cards},location,history:{replaceState(a,b,url){location.result=url}},window:{addEventListener(){}},setTimeout:f=>f()});
 return {cards,fields,events,location,count,empty};
}
let result=filters('?q=subtitles');assert.equal(result.cards.filter(c=>!c.hidden).length,1);
result=filters('?category=anki&pricing=free&signup=no');assert.equal(result.cards.filter(c=>!c.hidden).length,2);
result=filters('?pricing=paid');assert.equal(result.empty.hidden,false);assert.equal(result.count.textContent,'0 tools found');
result=filters('?category=invalid');assert.equal(result.cards.filter(c=>!c.hidden).length,5);
result=filters('?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E');assert.equal(result.cards.filter(c=>!c.hidden).length,0);
result=filters('?q=unknown');result.fields.q.value='';result.events.input();assert.equal(result.cards.filter(c=>!c.hidden).length,5);
assert.match(result.location.result,/^\/repo\/tools.html$/);
console.log('PASS: 19 pages, internal assets/links, production canonical/OGP/sitemap/robots URLs, data relationships, hidden forms/email, XSS escaping, and search/filter/empty states.');
