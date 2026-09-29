const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../../src/v7/extension');
async function setup(){
 const sent=[], listeners={};let frames=[];
 const event=()=>({addListener(fn){this.listener=fn;}});
 const chrome={runtime:{getURL:p=>'chrome-extension://test/'+p,onInstalled:event(),onMessage:event(),sendMessage:async()=>{},connectNative:()=>({postMessage:m=>sent.push(m),onMessage:event(),onDisconnect:event()})},
 permissions:{contains:async()=>true,onAdded:event(),onRemoved:event()},
 scripting:{getRegisteredContentScripts:async()=>[],registerContentScripts:async()=>{},unregisterContentScripts:async()=>{},executeScript:async()=>{}},
 storage:{local:{get:async value=>typeof value==='string'?{}:value,set:async()=>{}}},
 tabs:{query:async()=>[],onUpdated:event(),onRemoved:event(),onActivated:event()},
 webNavigation:{getAllFrames:async()=>frames,onCommitted:event()}};
 const ctx=vm.createContext({chrome,URL,console,fetch:async()=>({ok:true,json:async()=>({})}),setTimeout:()=>1,clearTimeout:()=>{},setInterval:()=>1,Date});
 ctx.importScripts=(...names)=>names.forEach(name=>vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),ctx));
 vm.runInContext(fs.readFileSync(path.join(root,'background.js'),'utf8'),ctx);await vm.runInContext('ready',ctx);
 return {ctx,chrome,sent,setFrames:f=>frames=f,run:code=>vm.runInContext(code,ctx)};
}
const top=(url='https://animekai.be/watch/show/ep-1')=>({tab:{id:1,url},frameId:0,url,documentId:'top-doc'});
const data={role:'top',url:top().url,kind:'watching',title:'Show',image:'https://img.test/a.png',episode:1,playerFrames:['https://player.test/embed'],media:{found:false,state:'waiting'}};
test('frame metadata cannot impersonate a top document',async()=>{
 const h=await setup();await h.ctx.acceptFrame({...top(),frameId:4},data);assert.equal(h.run('pages.size'),0);
});
test('valid nested player accepted, unrelated ad and stale document rejected',async()=>{
 const h=await setup();await h.ctx.acceptFrame(top(),data);
 h.setFrames([{frameId:0,parentFrameId:-1,documentId:'top-doc',url:top().url},{frameId:2,parentFrameId:0,documentId:'player',url:'https://player.test/embed'},{frameId:3,parentFrameId:2,documentId:'nested',url:'https://media.test/video'},{frameId:4,parentFrameId:0,documentId:'ad',url:'https://ads.test/embed'}]);
 await h.ctx.acceptFrame({...top(),frameId:3,documentId:'nested'},{media:{found:true,state:'playing',position:50,duration:300}});h.ctx.selectCurrent();assert.equal(h.run('current.state'),'playing');
 await h.ctx.acceptFrame({...top(),frameId:4,documentId:'ad'},{media:{found:true,state:'playing'}});assert.equal(h.run('pages.get(1).frames.has(4)'),false);
 await h.ctx.acceptFrame({...top(),frameId:3,documentId:'old'},{media:{found:true,state:'paused'}});assert.equal(h.run('pages.get(1).frames.get(3).media.state'),'playing');
});
test('navigation clears stale frames and removes selected activity',async()=>{
 const h=await setup();await h.ctx.acceptFrame(top(),{...data,media:{found:true,state:'playing'}});h.ctx.selectCurrent();
 h.chrome.tabs.onUpdated.listener(1,{url:'https://example.com'},{url:'https://example.com'});assert.equal(h.run('current'),null);assert.equal(h.sent.at(-1).type,'clear');
});
test('experimental sites are ignored until enabled',async()=>{
 const h=await setup();const sender=top('https://animepahe.com/play/a/b');await h.ctx.acceptFrame(sender,{...data,url:sender.url});assert.equal(h.run('pages.size'),0);
 h.run('settings.enabledSites.animepahe=true');await h.ctx.acceptFrame(sender,{...data,url:sender.url});h.ctx.selectCurrent();assert.equal(h.run('current.siteName'),'AnimePahe');
});
test('Clear activity suppresses future heartbeats until Refresh',async()=>{
 const h=await setup();await h.ctx.acceptFrame(top(),data);h.ctx.selectCurrent();
 const listener=h.chrome.runtime.onMessage.listener;listener({type:'clear'},{url:'chrome-extension://test/popup.html'},()=>{});
 h.sent.length=0;h.run('lastActivitySentAt=0');h.ctx.selectCurrent();assert.equal(h.sent.some(m=>m.type==='activity'),false);
 await h.ctx.refreshNow();assert.equal(h.run('activitySuppressed'),false);
});
test('page content cannot invoke repair or change settings',async()=>{
 const h=await setup();h.sent.length=0;h.chrome.runtime.onMessage.listener({type:'repair'},top(),()=>{});assert.equal(h.sent.length,0);
});
test('revoking player permission drops embedded frame media',async()=>{
 const h=await setup();await h.ctx.acceptFrame(top(),data);
 h.run('pages.get(1).frames.set(2,{media:{found:true,state:"playing"},receivedAt:Date.now()})');
 h.chrome.permissions.contains=async()=>false;await h.ctx.syncPlayerAccess();
 assert.equal(h.run('pages.get(1).frames.has(2)'),false);assert.equal(h.run('current.state'),'waiting');
});
test('sharing off clears the selected presence',async()=>{
 const h=await setup();await h.ctx.acceptFrame(top(),data);h.ctx.selectCurrent();
 h.chrome.runtime.onMessage.listener({type:'setSettings',settings:{enabled:false}},{url:'chrome-extension://test/popup.html'},()=>{});
 assert.equal(h.run('current'),null);assert.equal(h.sent.at(-1).type,'clear');
});
test('replacement cover survives heartbeats and resets for a new episode URL',async()=>{
 const h=await setup();await h.ctx.acceptFrame(top(),data);h.ctx.selectCurrent();
 h.ctx.applyCover('Show','https://img.test/replacement.png','Jikan');
 await h.ctx.acceptFrame(top(),data);h.ctx.selectCurrent();assert.equal(h.run('current.image'),'https://img.test/replacement.png');
 const sender=top('https://animekai.be/watch/show/ep-2');await h.ctx.acceptFrame(sender,{...data,url:sender.url});h.ctx.selectCurrent();assert.equal(h.run('current.image'),data.image);
});
