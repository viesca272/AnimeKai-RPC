const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const {parseHTML} = require('linkedom');
const root = path.resolve(__dirname, '../../src/v7/extension');
function context() {
  const ctx=vm.createContext({URL,console});
  for(const name of ['sites.js','adapters/animekai.js','adapters/animepahe.js','adapters/nineanime.js','playback.js']) vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),ctx);
  return ctx;
}
function read(html,url){return context().AnimeRPCSites.read(parseHTML(html).document,url);}
test('only explicit HTTPS site domains are accepted',()=>{
 const api=context().AnimeRPCSites;
 for(const url of ['https://evil-animekai.be','https://animekai.be.evil.test','http://animepahe.com','https://9animehd.live.evil.test','file:///animekai.be']) assert.equal(api.match(url),null);
 assert.equal(api.match('https://9animehd.live/watch/a').id,'nineanime');
});
test('AnimeKai extracts a fractional episode and scoped artwork',()=>{
 const d=read('<h1>Bleach - Episode 12.5 | AnimeKai</h1><div class="info">Episodes: 366</div><div class="poster"><img src="https://img.test/cover.png"></div>','https://animekai.be/watch/bleach/ep-12.5');
 assert.equal(d.title,'Bleach');assert.equal(d.episode,12.5);assert.equal(d.total,366);assert.equal(d.kind,'watching');
});
test('AnimePahe session IDs never become episode numbers',()=>{
 const d=read('<div class="theatre-info"><h1><a>Frieren</a></h1></div><button id="episodeMenu">Episode 4</button>','https://animepahe.com/play/123abc/789def');
 assert.equal(d.episode,4);assert.equal(d.title,'Frieren');assert.equal(d.total,null);
 const unknown=read('<h1>Frieren</h1>','https://animepahe.com/play/123/789');assert.equal(unknown.episode,null);
});
test('9anime season directory is browsing until a player appears',()=>{
 const url='https://9animehd.live/watch/jujutsu-kaisen/season/1/';
 assert.equal(read('<h1>JUJUTSU KAISEN - S01</h1>',url).kind,'browsing');
 const d=read('<h1>JUJUTSU KAISEN - S01</h1><div class="episodes"><h2>Episodes (59)</h2><button class="active" data-episode="2">For Myself</button></div><div id="player"><iframe src="https://player.test/2"></iframe></div>',url);
 assert.equal(d.kind,'watching');assert.equal(d.episode,2);assert.equal(d.total,59);assert.equal(d.playerFrames[0],'https://player.test/2');
});
test('unrelated page images and ad iframes are not chosen',()=>{
 const d=read('<h1>Show</h1><img src="https://ads.test/banner.png"><iframe src="https://ads.test/video"></iframe>','https://animekai.be/watch/show/ep-1');
 assert.equal(d.image,'');assert.equal(d.playerFrames.length,0);
});
test('paused, seeking, ended and unknown duration remain accurate',()=>{
 const api=context().AnimeRPCPlayback;
 const v={currentTime:15,duration:Infinity,paused:true,ended:false,seeking:false,readyState:4};
 assert.equal(api.mediaState(v).state,'paused');assert.equal(api.mediaState(v).duration,0);
 v.paused=false;v.seeking=true;assert.equal(api.mediaState(v).state,'buffering');
 v.seeking=false;assert.equal(api.mediaState(v).state,'playing');
 v.ended=true;assert.equal(api.mediaState(v).state,'ended');assert.equal(api.mediaState(null).state,'waiting');
});
test('playing tab wins; ties retain current tab without flicker',()=>{
 const {selectTab}=context().AnimeRPCPlayback;
 const candidates=[{tabId:1,kind:'browsing'},{tabId:2,kind:'watching',found:true,state:'paused'},{tabId:3,kind:'watching',found:true,state:'playing'}];
 assert.equal(selectTab(candidates,2,1).tabId,3);
 candidates.push({tabId:4,kind:'watching',found:true,state:'playing'});
 assert.equal(selectTab(candidates,3,4).tabId,3);
 assert.equal(selectTab(candidates.filter(x=>x.tabId!==3),3,2).tabId,4);
});
