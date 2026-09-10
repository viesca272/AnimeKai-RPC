(() => {
  const cfg = window.ANIMEKAI_SITE || {};
  const ready = cfg.githubOwner && !cfg.githubOwner.includes("YOUR_") && cfg.githubRepo;
  const repo = ready ? `https://github.com/${cfg.githubOwner}/${cfg.githubRepo}` : "";
  document.querySelectorAll("[data-release-link]").forEach(a => { a.href = repo ? `${repo}/releases/latest` : "#install"; });
  document.querySelectorAll("[data-source-link]").forEach(a => { a.href = repo || "#"; });
  const stores={chrome:cfg.chromeStoreUrl,edge:cfg.edgeStoreUrl,opera:cfg.operaStoreUrl};
  document.querySelectorAll("[data-store]").forEach(a=>{const u=stores[a.dataset.store];a.href=u||"#v6";if(u)a.textContent=a.textContent.replace("Coming soon","Install");});
  const picker=document.querySelector("#accentPicker"), hex=document.querySelector("#accentHex");
  const apply=v=>{const x=v.replace("#","");if(!/^[0-9a-f]{6}$/i.test(x))return;const rgb=[0,2,4].map(i=>parseInt(x.slice(i,i+2),16));document.documentElement.style.setProperty("--accent",v);document.documentElement.style.setProperty("--accent-rgb",rgb.join(","));if(hex)hex.textContent=v.toUpperCase();localStorage.setItem("animekai-site-accent",v);};
  if(picker){const saved=localStorage.getItem("animekai-site-accent");if(saved){picker.value=saved;apply(saved)}picker.addEventListener("input",e=>apply(e.target.value));}
  const repair=document.querySelector("#repairDemo");
  if(repair){repair.addEventListener("click",()=>{const rows=[...document.querySelectorAll(".check")];repair.disabled=true;repair.textContent="Scanning…";rows.forEach(r=>{r.className="check";r.querySelector(".state").textContent="Checking…"});rows.forEach((r,i)=>setTimeout(()=>{const s=r.querySelector(".state");if(i===2){r.classList.add("fix");s.textContent="Repaired ✓"}else{r.classList.add("done");s.textContent="Healthy ✓"}if(i===rows.length-1){repair.disabled=false;repair.textContent="Run demo again";document.querySelector("#repairStatus").textContent="Repair complete • 1 issue fixed"}},450+i*400));});}
  document.querySelectorAll("[data-year]").forEach(e=>e.textContent=new Date().getFullYear());
})();
