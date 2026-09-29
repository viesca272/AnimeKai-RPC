// Record actual popup/help pages with mocked extension state. This is not a live Discord test.
// Requires Playwright, Chromium, and ffmpeg; optionally set CHROMIUM_EXECUTABLE and DEMO_COVER.
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const out = path.resolve(process.env.DEMO_OUTPUT || path.join(root, 'build/v7-demo'));
fs.mkdirSync(out, {recursive:true});
const extension = path.join(root, 'src/v7/extension');
const files = {
  '/':path.join(root, 'tests/v7/demo-frame.html'),
  '/cover.jpg':process.env.DEMO_COVER || path.join(extension, 'assets/rpc/animekai-512.png')
};
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const relative = url.pathname.replace(/^\/extension\//, '');
  const candidate = path.resolve(extension, relative);
  const file = files[url.pathname] || (url.pathname.startsWith('/extension/') && candidate.startsWith(extension + path.sep) ? candidate : null);
  if (!file || !fs.existsSync(file)) {response.writeHead(404);response.end();return;}
  const type = {'.html':'text/html','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[path.extname(file)];
  response.setHeader('Content-Type', type || 'application/octet-stream');
  response.end(fs.readFileSync(file));
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({headless:true,
    ...(process.env.CHROMIUM_EXECUTABLE ? {executablePath:process.env.CHROMIUM_EXECUTABLE} : {}),
    args:['--no-sandbox','--disable-dev-shm-usage']});
  try {
    const context = await browser.newContext({viewport:{width:1280,height:900},deviceScaleFactor:1});
    await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
    await context.addInitScript(({base}) => {
      if (!location.pathname.startsWith('/extension/')) return;
      const listeners = [];
      const sites = [{id:'animekai',name:'AnimeKai',home:'https://animekai.be/'},
        {id:'animepahe',name:'AnimePahe',home:'https://animepahe.com/',experimental:true},
        {id:'nineanime',name:'9anime',home:'https://9animehd.live/',experimental:true}];
      const state = {version:'7.0.0-alpha.1',sites,nativeConnected:false,discordConnected:false,playerAccess:false,
        lastError:'Demo: no desktop helper connected',current:null,
        settings:{enabled:true,enabledSites:{animekai:true,animepahe:false,nineanime:false},preset:'animekai',theme:'dark',
          accent:'#8b5cf6',background:'#0c0b12',cardBackground:'#16131d',
          backgroundGradient:'linear-gradient(145deg,#0c0b12,#25143b)',cardGradient:'linear-gradient(145deg,#1f162b,#120f1b)'}};
      window.demoState = state;
      window.demoMessages = [];
      window.demoPublish = () => listeners.forEach(listener => listener({type:'v7State',state}));
      window.chrome = {
        runtime:{getURL:file=>`${base}/extension/${file}`,onMessage:{addListener:fn=>listeners.push(fn)},
          sendMessage(message, callback) {
            window.demoMessages.push(message);
            if (message.type === 'setSettings') Object.assign(state.settings, message.settings);
            if (message.type === 'clear') state.current = null;
            const result = message.type === 'getState' ? structuredClone(state) : {ok:true};
            if (callback) queueMicrotask(()=>callback(result));
            return Promise.resolve(result);
          }},
        permissions:{request:async()=>false},
        tabs:{create:async({url})=>{if(url.startsWith(base)) location.href=url;}}
      };
    }, {base});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    let popup = page.frames().find(frame => frame.url().endsWith('popup.html'));
    await popup.waitForSelector('#siteSettings input');
    const screenshotPaths = [];
    let counter = 0;
    async function capture(seconds, tick) {
      for (let frame=0; frame<seconds*6; frame++) {
        if (tick && frame%6===0) await tick(frame/6);
        const name = path.join(out, `frame-${String(counter++).padStart(4,'0')}.png`);
        await page.screenshot({path:name});
        screenshotPaths.push(name);
        await page.waitForTimeout(110);
      }
    }
    async function chapter(number, title, description) {
      await page.evaluate(({number,title,description}) => {
        document.querySelector('#heading').textContent=title;
        document.querySelector('#description').textContent=description;
        document.querySelector('#count').textContent=`0${number} / 07`;
      }, {number,title,description});
    }
    async function playback(state, position=63) {
      await popup.evaluate(({base,state,position}) => {
        demoState.current = {kind:'watching',siteId:'animekai',siteName:'AnimeKai',siteHome:'https://animekai.be/',
          title:'Frieren: Beyond Journey’s End',episode:3,total:28,state,position,duration:1440,image:`${base}/cover.jpg`};
        demoPublish();
      }, {base,state,position});
      await page.evaluate(({base,state}) => {
        document.querySelector('#poster').src=`${base}/cover.jpg`;
        const badge=document.querySelector('#badge');badge.hidden=false;
        badge.src=`${base}/extension/assets/rpc/${state==='paused'?'pause':'play'}-256.png`;
        document.querySelector('#payload-title').textContent='Frieren';
        document.querySelector('#payload-state').textContent=`Episode 3 / 28 · ${state==='paused'?'Paused':'Watching'}`;
      }, {base,state});
    }
    await chapter(1,'Playback that follows along.','The actual V7 popup receives simulated episode data. The timer updates as playback advances.');
    await playback('playing');
    assert.equal(await popup.locator('#playback').innerText(),'playing');
    await capture(5, second=>playback('playing',63+second));
    await chapter(2,'Pause. Keep your place.','Playback switches to paused and the badge changes to a black circle with white pause bars.');
    await playback('paused',68);
    assert.equal(await popup.locator('#playback').innerText(),'paused');
    await capture(4);
    await chapter(3,'Seek and resume.','This fixture jumps to eight minutes, then resumes. Helper tests separately check the Discord timestamps.');
    await playback('playing',480);
    assert.equal(await popup.locator('#time').innerText(),'08:00 / 24:00');
    await capture(4, second=>playback('playing',480+second));
    await chapter(4,'A cover for each site.','Browsing uses the detected site’s own image. Live page detection is still awaiting verification.');
    for (const [siteId,siteName] of [['animekai','AnimeKai'],['nineanime','9anime'],['animepahe','AnimePahe']]) {
      await popup.evaluate(({siteId,siteName})=>{
        demoState.current={kind:'browsing',siteId,siteName,details:`Browsing ${siteName}`,browseState:'Finding something to watch',state:'browsing'};
        demoPublish();
      },{siteId,siteName});
      await page.evaluate(({base,siteId,siteName})=>{
        document.querySelector('#poster').src=`${base}/extension/assets/rpc/${siteId}-512.png`;
        document.querySelector('#badge').hidden=true;
        document.querySelector('#payload-title').textContent=`Browsing ${siteName}`;
        document.querySelector('#payload-state').textContent='Finding something to watch';
      },{base,siteId,siteName});
      await popup.locator('#cover').evaluate(image=>image.decode());
      assert.equal(await popup.locator('#anime').innerText(),`Browsing ${siteName}`);
      await capture(3);
    }
    await chapter(5,'Choose where to share.','Experimental sites start switched off. Enable a site yourself, then choose an appearance preset.');
    await popup.locator('[data-site="nineanime"]').check();
    assert(await popup.evaluate(()=>demoState.settings.enabledSites.nineanime));
    await popup.locator('[data-preset="borealis"]').click();
    assert.equal(await popup.locator('#presetName').innerText(),'Borealis');
    await popup.locator('#siteSettings').scrollIntoViewIfNeeded();
    await capture(5);
    await chapter(6,'Simple questions. Local answers.','The included help panel matches written FAQs. No account, AI request, or saved chat history.');
    await page.evaluate(()=>document.body.classList.add('help'));
    await popup.goto(`${base}/extension/help.html`);
    await popup.locator('#question').fill('Why is the player waiting?');
    await popup.locator('button[type="submit"]').click();
    assert.match(await popup.locator('#answer').innerText(),/Enable Player detection/);
    await capture(6);
    // Verify the unknown-question fallback and escaped output before the final scene.
    await popup.locator('#question').fill('<img src=x onerror=alert(1)> xyzzy');
    await popup.locator('button[type="submit"]').click();
    assert.match(await popup.locator('#answer').innerText(),/don’t have a matching FAQ/);
    assert.equal(await popup.locator('#answer img').count(),0);
    await chapter(7,'Ready for your next check.','V7 alpha is a test release. Real sites, embedded players, and a signed-in Discord desktop session still need checking.');
    await popup.goto(`${base}/extension/onboarding.html`);
    await popup.waitForSelector('#helperStatus');
    assert.match(await popup.locator('#helperStatus').innerText(),/not connected/);
    await capture(5);
    assert.deepEqual(errors, [], 'Browser JavaScript errors');
    await page.screenshot({path:path.join(out,'last-frame.png')});
    const video=path.join(out,'Anime-RPC-V7-demo.mp4');
    execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','6','-i',path.join(out,'frame-%04d.png'),
      '-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-r','30','-movflags','+faststart',video]);
    fs.writeFileSync(path.join(out,'ui-checks.json'),JSON.stringify({browser:await browser.version(),
      simulation:true,liveDiscord:false,checks:['playing','paused','seek','three site covers','site opt-in','appearance preset','FAQ match','FAQ fallback','escaped input','onboarding','no JS errors'],video},null,2));
    for(const file of screenshotPaths) fs.unlinkSync(file);
    console.log(JSON.stringify({video,bytes:fs.statSync(video).size,frames:counter,uiChecks:'passed'}));
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
