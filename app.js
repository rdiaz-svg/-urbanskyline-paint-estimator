const USL_SYNC={url:localStorage.getItem("uslSyncUrl")||""};
async function uslApi(action,payload={}){const u=($("syncUrl")?.value||USL_SYNC.url).trim();if(!u)throw Error("Add the Apps Script Web App URL first.");localStorage.setItem("uslSyncUrl",u);USL_SYNC.url=u;const r=await fetch(u,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,...payload})});const d=await r.json();if(d.error)throw Error(d.error);return d}
let uslAddressTimer;
async function uslAddressSearch(q){const box=$("addressSuggestions");if(q.trim().length<4){box.innerHTML="";return}try{const d=await uslApi("addressAutocomplete",{input:q});box.innerHTML=(d.suggestions||[]).map(x=>`<button type="button" data-id="${x.placeId}">${x.text}</button>`).join("");box.querySelectorAll("button").forEach(b=>b.onclick=async()=>{const x=await uslApi("placeDetails",{placeId:b.dataset.id});$("address").value=x.street||x.formattedAddress;$("cityZip").value=[x.city,x.state,x.zip].filter(Boolean).join(" ");state.project.address=$("address").value;state.project.cityZip=$("cityZip").value;save();box.innerHTML=""})}catch(e){if($("syncMessage"))$("syncMessage").textContent=e.message}}
const ROOM_PRESETS=[["Living Room",16,20,9,1450],["Master Bedroom",14,18,9,1250],["Bedroom 1",11,12,9,950],["Bedroom 2",11,13,9,950],["Bedroom 3",11,12,9,950],["Bedroom 4",11,12,9,950],["Kitchen",12,16,9,1050],["Dining Room",12,14,9,1050],["Office / Study",10,12,9,900],["Laundry Room",7,9,9,600],["Hallway / Stairs",8,12,9,900],["Entry / Foyer",8,10,9,800],["Game / Media Room",14,16,9,1200],["Custom Room 1",10,10,9,900],["Custom Room 2",10,10,9,900],["Garage",24,24,9,1800]];
const fresh=()=>({project:{customerName:"",phone:"",email:"",address:"",cityZip:"",estimator:"Roberto Diaz",projectType:"Interior Painting",wallCondition:"Good",notes:""},rooms:ROOM_PRESETS.map(r=>({name:r[0],length:r[1],width:r[2],height:r[3],price:r[4],selected:false,package:"Full Room",walls:"Auto",ceiling:"Auto",trim:"Auto",baseboards:"Auto",doors:"Auto",windows:"Auto",closets:"No",crown:"No",doorCount:1,windowCount:1,closetWallSf:0,crownLf:0,wallColor:"Main Wall Color",wallSw:"",ceilingColor:"Ceiling White",ceilingSw:"",trimColor:"Trim White",trimSw:""}))});
let state;try{state=JSON.parse(localStorage.getItem("uslPaintApp"))||fresh()}catch(e){state=fresh()}const $=id=>document.getElementById(id),money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0),esc=s=>String(s||"").replaceAll('"','&quot;');function save(){localStorage.setItem("uslPaintApp",JSON.stringify(state));refreshAll()}function nav(v){document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.dataset.view===v));window.scrollTo(0,0);if(v==='proposal')renderProposal()}document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)nav(b.dataset.go)});
function bindProject(){Object.keys(state.project).forEach(k=>{const e=$(k);if(e){e.value=state.project[k]||'';e.oninput=()=>{state.project[k]=e.value;save()}}});document.querySelector('.save').onclick=()=>{save();nav('home')}}
function scopeValue(r,key){
  const v=r[key]||"Auto";
  if(v==="Yes") return true; if(v==="No") return false;
  if(key==="walls") return r.package!=="Custom" || true;
  if(key==="ceiling"||key==="baseboards"||key==="doors"||key==="windows") return r.package==="Full Room";
  return false;
}
function scopeSelect(i,key,val){return `<label>${key[0].toUpperCase()+key.slice(1)}<select data-i="${i}" data-k="${key}"><option ${val==='Auto'?'selected':''}>Auto</option><option ${val==='Yes'?'selected':''}>Yes</option><option ${val==='No'?'selected':''}>No</option></select></label>`}
function renderRooms(){const w=$('roomList');w.innerHTML='';state.rooms.forEach((r,i)=>{
  ['baseboards','doors','windows'].forEach(k=>{if(r[k]===undefined)r[k]='Auto'}); ['closets','crown'].forEach(k=>{if(r[k]===undefined)r[k]='No'}); if(r.doorCount===undefined)r.doorCount=1;if(r.windowCount===undefined)r.windowCount=1;if(r.closetWallSf===undefined)r.closetWallSf=0;if(r.crownLf===undefined)r.crownLf=0;
  const q=roomQty(r); const d=document.createElement('div');d.className='room-card';d.innerHTML=`<div class="room-head"><div><strong>${r.name}</strong><div class="muted">${r.length}' × ${r.width}' × ${r.height}' • ${Math.round(q.wallSf)} wall SF • ${Math.round(q.ceilingSf)} ceiling SF</div></div><button class="room-toggle ${r.selected?'on':''}" data-i="${i}">${r.selected?'Included':'Add'}</button></div>
  <div class="room-grid"><label>Length<input type="number" min="1" max="100" step="0.5" inputmode="decimal" data-i="${i}" data-k="length" value="${r.length}"></label><label>Width<input type="number" min="1" max="100" step="0.5" inputmode="decimal" data-i="${i}" data-k="width" value="${r.width}"></label><label>Height<input type="number" min="6" max="30" step="0.5" inputmode="decimal" data-i="${i}" data-k="height" value="${r.height}"></label></div>
  <label>Package<select data-i="${i}" data-k="package"><option ${r.package==='Full Room'?'selected':''}>Full Room</option><option ${r.package==='Walls Only'?'selected':''}>Walls Only</option><option ${r.package==='Custom'?'selected':''}>Custom</option></select></label>
  <div class="scope-title">SURFACES</div><div class="scope-grid">${scopeSelect(i,'walls',r.walls||'Auto')}${scopeSelect(i,'ceiling',r.ceiling)}${scopeSelect(i,'baseboards',r.baseboards)}${scopeSelect(i,'doors',r.doors)}${scopeSelect(i,'windows',r.windows)}${scopeSelect(i,'closets',r.closets)}${scopeSelect(i,'crown',r.crown)}</div>
  <div class="room-grid detail-grid"><label>Doors<input type="number" min="0" max="20" step="1" data-i="${i}" data-k="doorCount" value="${r.doorCount}"></label><label>Windows<input type="number" min="0" max="30" step="1" data-i="${i}" data-k="windowCount" value="${r.windowCount}"></label><label>Closet wall SF<input type="number" min="0" max="2000" step="1" data-i="${i}" data-k="closetWallSf" value="${r.closetWallSf}"></label><label>Crown LF<input type="number" min="0" max="1000" step="1" data-i="${i}" data-k="crownLf" value="${r.crownLf}"></label></div>
  <div class="scope-summary">Included: ${scopeSummary(r)}<br><small>Paintable: ${Math.round(q.includedWallSf)} wall/closet SF • ${Math.round(q.includedCeilingSf)} ceiling SF • ${Math.round(q.includedTrimEqSf)} trim-equivalent SF</small></div>`;w.appendChild(d)});
  w.querySelectorAll('.room-toggle').forEach(b=>b.onclick=()=>{state.rooms[+b.dataset.i].selected=!state.rooms[+b.dataset.i].selected;save();renderRooms();renderColors()});
  w.querySelectorAll('input,select').forEach(e=>e.onchange=()=>{const r=state.rooms[+e.dataset.i],k=e.dataset.k;r[k]=e.type==='number'?Math.max(0,Number(e.value)):e.value;if(k==='package'){if(e.value==='Full Room'){r.walls='Auto';r.ceiling='Auto';r.baseboards='Auto';r.doors='Auto';r.windows='Auto'}else if(e.value==='Walls Only'){r.walls='Auto';r.ceiling='Auto';r.baseboards='Auto';r.doors='Auto';r.windows='Auto'}}save();renderRooms();renderColors()})}
function scopeSummary(r){return ['walls','ceiling','baseboards','doors','windows','closets','crown'].filter(k=>include(r,k)).map(k=>k==='baseboards'?'Baseboards':k[0].toUpperCase()+k.slice(1)).join(' • ')||'None'}
function roomQty(r){const L=Math.max(0,+r.length||0),W=Math.max(0,+r.width||0),H=Math.max(0,+r.height||0),wallSf=2*(L+W)*H,ceilingSf=L*W,baseLf=2*(L+W),doors=Math.max(0,+r.doorCount||0),windows=Math.max(0,+r.windowCount||0),closetSf=Math.max(0,+r.closetWallSf||0),crownLf=Math.max(0,+r.crownLf||0);return{wallSf,ceilingSf,baseLf,doors,windows,closetSf,crownLf,includedWallSf:(include(r,'walls')?wallSf:0)+(include(r,'closets')?closetSf:0),includedCeilingSf:include(r,'ceiling')?ceilingSf:0,includedTrimEqSf:(include(r,'baseboards')?baseLf*.5:0)+(include(r,'doors')?doors*40:0)+(include(r,'windows')?windows*15:0)+(include(r,'crown')?crownLf*.5:0)}}
function renderColors(){const w=$('colorList');w.innerHTML='';state.rooms.filter(r=>r.selected).forEach(r=>{const i=state.rooms.indexOf(r),d=document.createElement('div');d.className='color-card';d.innerHTML=`<strong>${r.name}</strong><div class="form-grid" style="margin-top:10px"><label>Wall Color<input data-i="${i}" data-k="wallColor" value="${esc(r.wallColor)}"></label><label>SW #<input data-i="${i}" data-k="wallSw" value="${esc(r.wallSw)}"></label><label>Ceiling Color<input data-i="${i}" data-k="ceilingColor" value="${esc(r.ceilingColor)}"></label><label>SW #<input data-i="${i}" data-k="ceilingSw" value="${esc(r.ceilingSw)}"></label><label>Trim Color<input data-i="${i}" data-k="trimColor" value="${esc(r.trimColor)}"></label><label>SW #<input data-i="${i}" data-k="trimSw" value="${esc(r.trimSw)}"></label></div>`;w.appendChild(d)});w.querySelectorAll('input').forEach(e=>e.oninput=()=>{state.rooms[+e.dataset.i][e.dataset.k]=e.value;save()})}
function include(r,s){if(!r.selected)return false;if(s==='walls'){const v=r.walls||'Auto';if(v==='Yes')return true;if(v==='No')return false;return true}if(s==='trim')return include(r,'baseboards')||include(r,'doors')||include(r,'windows')||include(r,'crown');const v=r[s]===undefined?'Auto':r[s];if(v==='Yes')return true;if(v==='No')return false;if(s==='ceiling'||s==='baseboards'||s==='doors'||s==='windows')return r.package==='Full Room';return false}
function calc(){let sale=0,hours=0;const groups={};const group=(surface,color,sw,product,sf)=>{const k=[surface,color||'Unassigned',sw||'',product].join('|');if(!groups[k])groups[k]={surface,color:color||'Unassigned',sw:sw||'',product,sf:0};groups[k].sf+=sf};state.rooms.forEach(r=>{if(!r.selected)return;sale+=r.package==='Walls Only'?r.price*.5:r.package==='Custom'?r.price*.75:r.price;const q=roomQty(r);if(q.includedWallSf)group('Walls',r.wallColor,r.wallSw,'ProMar 200 Eggshell',q.includedWallSf);if(q.includedCeilingSf)group('Ceiling',r.ceilingColor,r.ceilingSw,'ProMar 200 Flat',q.includedCeilingSf);if(q.includedTrimEqSf)group('Trim',r.trimColor,r.trimSw,'Emerald Urethane Trim Enamel',q.includedTrimEqSf);hours+=(q.includedWallSf/150)+(q.includedCeilingSf/180)+(include(r,'baseboards')?q.baseLf/30:0)+(include(r,'doors')?q.doors*.75:0)+(include(r,'windows')?q.windows*.35:0)+(include(r,'crown')?q.crownLf/35:0)+(r.selected?1.5:0)});let gallons=0;Object.values(groups).forEach(g=>{g.calcGal=g.sf*2/350*1.05;g.buyGal=Math.ceil(g.calcGal);gallons+=g.buyGal});const materialCost=gallons*48,laborCost=hours*28,direct=materialCost+laborCost;return{sale,direct,profit:sale-direct,margin:sale?(sale-direct)/sale:0,hours,days:hours?Math.ceil(hours/8):0,gallons,groups:Object.values(groups),selected:state.rooms.filter(r=>r.selected).length}}
function refreshAll(){const c=calc(),p=state.project;$('homeProjectLabel').textContent=p.customerName||p.address||'No project started';$('homePrice').textContent=money(c.sale);$('statusRooms').textContent=c.selected;$('statusGallons').textContent=c.gallons;$('statusDays').textContent=c.days;$('statusMargin').textContent=Math.round(c.margin*100)+'%';$('salePrice').textContent=money(c.sale);$('directCost').textContent=money(c.direct);$('grossProfit').textContent=money(c.profit);$('grossMargin').textContent=Math.round(c.margin*100)+'%';$('laborHours').textContent=c.hours.toFixed(1);$('jobDays').textContent=c.days;$('paintGallons').textContent=c.gallons;$('selectedCount').textContent=c.selected;$('materialSummary').innerHTML=c.groups.length?c.groups.map(g=>`<div class="material-row"><span>${g.surface}<br><small>${g.color}${g.sw?' • '+g.sw:''}</small></span><span>${g.product}<br><small>${Math.round(g.sf)} sq ft</small></span><strong>${g.buyGal} gal</strong></div>`).join(''):'<p class="muted">Select rooms to calculate materials.</p>'}
[['applyWalls','wall'],['applyCeilings','ceiling'],['applyTrim','trim']].forEach(([id,k])=>{$(id).onclick=()=>{const color=$(k==='wall'?'defaultWallColor':k==='ceiling'?'defaultCeilingColor':'defaultTrimColor').value,sw=$(k==='wall'?'defaultWallSw':k==='ceiling'?'defaultCeilingSw':'defaultTrimSw').value;state.rooms.filter(r=>r.selected).forEach(r=>{r[k+'Color']=color;r[k+'Sw']=sw});save();renderColors()}});
$('newProjectBtn').onclick=()=>{if(confirm('Start a new estimate? This clears the current project on this device.')){state=fresh();save();bindProject();renderRooms();renderColors()}};$('printProposal').onclick=()=>window.print();function renderProposal(){const c=calc(),p=state.project,rows=state.rooms.filter(r=>r.selected).map(r=>`<tr><td>${r.name}</td><td>${r.package}</td><td>${scopeSummary(r)}</td><td>${Math.round(roomQty(r).includedWallSf+roomQty(r).includedCeilingSf)} SF</td></tr>`).join('');$('proposalContent').innerHTML=`<h2>UrbanSkyLine Design & Build LLC</h2><p><strong>Interior Painting Proposal</strong></p><p><strong>Customer:</strong> ${p.customerName||'—'}<br><strong>Project:</strong> ${p.address||'—'} ${p.cityZip||''}<br><strong>Estimator:</strong> ${p.estimator||'—'}</p><h3>Scope</h3><table><thead><tr><th>Room</th><th>Package</th><th>Included Surfaces</th><th>Wall/Ceiling SF</th></tr></thead><tbody>${rows||'<tr><td colspan="4">No rooms selected</td></tr>'}</tbody></table><h3>Investment</h3><p style="font-size:28px;font-weight:800">${money(c.sale)}</p><p>Estimated duration: ${c.days} day${c.days===1?'':'s'} • Estimated paint purchase: ${c.gallons} gallon${c.gallons===1?'':'s'}</p><p><strong>Notes:</strong> ${p.notes||'Standard preparation and two finish coats unless otherwise specified.'}</p>`}
let deferredPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').hidden=false});$('installBtn').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null;$('installBtn').hidden=true}};

window.uslTestConnection=async function(){
  const msg=$("syncMessage"), btn=$("testSync");
  try{
    const u=($("syncUrl")?.value||USL_SYNC.url||"").trim();
    if(!u) throw Error("Web App URL is empty.");
    if(!u.endsWith("/exec")) throw Error("Web App URL must end in /exec.");
    localStorage.setItem("uslSyncUrl",u); USL_SYNC.url=u;
    if(msg){msg.textContent="Testing connection...";msg.className="sync-status working";}
    if(btn){btn.disabled=true;btn.textContent="Testing...";}
    const r=await fetch(u+"?t="+Date.now(),{method:"GET",cache:"no-store",redirect:"follow"});
    const text=await r.text();
    let d; try{d=JSON.parse(text)}catch(_){throw Error("Apps Script returned non-JSON.");}
    if(d.error) throw Error(d.error);
    if(msg){msg.textContent=d.message||"Connected to UrbanSkyLine Google Sheet.";msg.className="sync-status success";}
  }catch(e){
    if(msg){msg.textContent="TEST FAILED: "+(e.message||e);msg.className="sync-status error";}
  }finally{
    if(btn){btn.disabled=false;btn.textContent="Test";}
  }
};

window.uslLoadSheet=async function(){
  const msg=$("syncMessage"), btn=$("pullSheet");
  try{
    if(msg){msg.textContent="Loading current estimate from Google Sheet...";msg.className="sync-status working";}
    if(btn){btn.disabled=true;btn.textContent="Loading...";}
    const d=await uslApi("loadEstimate");
    if(!d.state) throw Error("No estimate data returned.");
    state=d.state; save(); bindProject(); renderRooms(); renderColors(); refreshAll();
    if(msg){msg.textContent="Loaded current estimate from Google Sheet.";msg.className="sync-status success";}
  }catch(e){
    if(msg){msg.textContent="LOAD FAILED: "+(e.message||e);msg.className="sync-status error";}
  }finally{
    if(btn){btn.disabled=false;btn.textContent="Load Sheet";}
  }
};

window.uslSaveSheet=async function(){
  const msg=$("syncMessage"), btn=$("pushSheet");
  try{
    if(msg){msg.textContent="Saving current estimate to Google Sheet...";msg.className="sync-status working";}
    if(btn){btn.disabled=true;btn.textContent="Saving...";}
    await uslApi("saveEstimate",{state});
    if(msg){msg.textContent="Saved current estimate to Google Sheet.";msg.className="sync-status success";}
  }catch(e){
    if(msg){msg.textContent="SAVE FAILED: "+(e.message||e);msg.className="sync-status error";}
  }finally{
    if(btn){btn.disabled=false;btn.textContent="Save to Sheet";}
  }
};

const syncInput=$("syncUrl");
if(syncInput) syncInput.value=USL_SYNC.url;
$("address")?.addEventListener("input",e=>{
  clearTimeout(uslAddressTimer);
  uslAddressTimer=setTimeout(()=>uslAddressSearch(e.target.value),350);
});

bindProject();renderRooms();renderColors();refreshAll();