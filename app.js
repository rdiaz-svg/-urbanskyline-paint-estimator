const USL_SYNC={url:localStorage.getItem("uslSyncUrl")||""};
async function uslApi(action,payload={}){const u=($("syncUrl")?.value||USL_SYNC.url).trim();if(!u)throw Error("Add the Apps Script Web App URL first.");localStorage.setItem("uslSyncUrl",u);USL_SYNC.url=u;const r=await fetch(u,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,...payload})});const d=await r.json();if(d.error)throw Error(d.error);return d}
let uslAddressTimer;
async function uslAddressSearch(q){const box=$("addressSuggestions");if(q.trim().length<4){box.innerHTML="";return}try{const d=await uslApi("addressAutocomplete",{input:q});box.innerHTML=(d.suggestions||[]).map(x=>`<button type="button" data-id="${x.placeId}">${x.text}</button>`).join("");box.querySelectorAll("button").forEach(b=>b.onclick=async()=>{const x=await uslApi("placeDetails",{placeId:b.dataset.id});$("address").value=x.street||x.formattedAddress;$("cityZip").value=[x.city,x.state,x.zip].filter(Boolean).join(" ");state.project.address=$("address").value;state.project.cityZip=$("cityZip").value;save();box.innerHTML=""})}catch(e){if($("syncMessage"))$("syncMessage").textContent=e.message}}
const ROOM_PRESETS=[["Living Room",16,20,9,1450],["Master Bedroom",14,18,9,1250],["Bedroom 1",11,12,9,950],["Bedroom 2",11,13,9,950],["Bedroom 3",11,12,9,950],["Bedroom 4",11,12,9,950],["Kitchen",12,16,9,1050],["Dining Room",12,14,9,1050],["Office / Study",10,12,9,900],["Laundry Room",7,9,9,600],["Hallway / Stairs",8,12,9,900],["Entry / Foyer",8,10,9,800],["Game / Media Room",14,16,9,1200],["Custom Room 1",10,10,9,900],["Custom Room 2",10,10,9,900],["Garage",24,24,9,1800]];
const fresh=()=>({project:{customerName:"",phone:"",email:"",address:"",cityZip:"",estimator:"Roberto Diaz",projectType:"Interior Painting",wallCondition:"Good",notes:""},rooms:ROOM_PRESETS.map(r=>({name:r[0],length:r[1],width:r[2],height:r[3],price:r[4],selected:false,package:"Full Room",walls:"Auto",ceiling:"Auto",trim:"Auto",baseboards:"Auto",doors:"Auto",windows:"Auto",closets:"No",crown:"No",doorCount:1,windowCount:1,closetWallSf:0,closetType:"None",closetLength:6,closetWidth:6,closetWalls:true,closetCeiling:true,closetBaseboards:true,crownLf:0,wallColor:"Main Wall Color",wallSw:"",ceilingColor:"Ceiling White",ceilingSw:"",trimColor:"Trim White",trimSw:""}))});
let state;try{state=JSON.parse(localStorage.getItem("uslPaintApp"))||fresh()}catch(e){state=fresh()}const $=id=>document.getElementById(id),money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0),esc=s=>String(s||"").replaceAll('"','&quot;');function save(){localStorage.setItem("uslPaintApp",JSON.stringify(state));refreshAll()}function nav(v){document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.dataset.view===v));window.scrollTo(0,0);if(v==='proposal')renderProposal()}document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)nav(b.dataset.go)});
function bindProject(){Object.keys(state.project).forEach(k=>{const e=$(k);if(e){e.value=state.project[k]||'';e.oninput=()=>{state.project[k]=e.value;save()}}});document.querySelector('.save').onclick=()=>{save();nav('home')}}
const expandedRooms=new Set();
function normalizeRoom(r){
  ['baseboards','doors','windows'].forEach(k=>{if(r[k]===undefined)r[k]='Auto'});
  ['closets','crown'].forEach(k=>{if(r[k]===undefined)r[k]='No'});
  if(r.doorCount===undefined)r.doorCount=1;if(r.windowCount===undefined)r.windowCount=1;if(r.crownLf===undefined)r.crownLf=0;
  if(r.closetType===undefined)r.closetType=(+r.closetWallSf||0)>0?'Custom':'None';
  if(r.closetLength===undefined)r.closetLength=6;if(r.closetWidth===undefined)r.closetWidth=6;
  if(r.closetWalls===undefined)r.closetWalls=true;if(r.closetCeiling===undefined)r.closetCeiling=true;if(r.closetBaseboards===undefined)r.closetBaseboards=true;
}
function setPackage(r,p){
  r.package=p;
  if(p==='Full Room'){r.walls='Auto';r.ceiling='Auto';r.baseboards='Auto';r.doors='Auto';r.windows='Auto';r.closets='No';r.crown='No'}
  else if(p==='Walls Only'){r.walls='Auto';r.ceiling='No';r.baseboards='No';r.doors='No';r.windows='No';r.closets='No';r.crown='No'}
  else {r.walls='No';r.ceiling='No';r.baseboards='No';r.doors='No';r.windows='No';r.closets='No';r.crown='No'}
}
function chipLabel(k){return {walls:'Walls',ceiling:'Ceiling',baseboards:'Baseboards',doors:'Doors',windows:'Windows',closets:'Closet',crown:'Crown'}[k]}
function qtyStepper(i,k,n,label){return `<div class="qty-stepper"><span>${label}</span><div><button type="button" data-step="-1" data-i="${i}" data-k="${k}">−</button><strong>${n}</strong><button type="button" data-step="1" data-i="${i}" data-k="${k}">+</button></div></div>`}
function closetEditor(i,r){
  if(!include(r,'closets'))return '';
  const type=r.closetType||'None';
  return `<div class="closet-box"><div class="mini-title">CLOSET</div><div class="segmented closet-types">
    ${['Reach-in','Walk-in'].map(t=>`<button type="button" class="${type===t?'active':''}" data-closet-type="${t}" data-i="${i}">${t}</button>`).join('')}
  </div>${type==='Walk-in'?`<div class="room-grid closet-dims"><label>Length<input type="number" min="2" max="30" step="0.5" data-i="${i}" data-k="closetLength" value="${r.closetLength}"></label><label>Width<input type="number" min="2" max="30" step="0.5" data-i="${i}" data-k="closetWidth" value="${r.closetWidth}"></label><label>Height<input value="${r.height}" disabled><small>Uses room height</small></label></div>`:''}
  <div class="closet-scope"><span>Paint</span>${[['closetWalls','Walls'],['closetCeiling','Ceiling'],['closetBaseboards','Baseboards']].map(([k,l])=>`<button type="button" class="scope-chip ${r[k]?'active':''}" data-bool="${k}" data-i="${i}">${l}</button>`).join('')}</div></div>`
}
function renderRooms(){const w=$('roomList');w.innerHTML='';state.rooms.forEach((r,i)=>{
  normalizeRoom(r);const q=roomQty(r),open=expandedRooms.has(i),summary=scopeSummary(r),roomPrice=r.selected&&summary!=='None'?roomMarketPrice(r,q):0;
  const d=document.createElement('div');d.className='room-card '+(r.selected?'selected-room':'');
  d.innerHTML=`<div class="room-head"><div><strong>${r.name}</strong><div class="muted">${r.length}' × ${r.width}' × ${r.height}'${r.selected?' • '+summary:''}</div>${r.selected?`<div class="room-price">${money(roomPrice)} <small>component estimate</small></div>`:''}</div><div class="room-actions"><button class="edit-room" data-edit="${i}">${open?'Done':'Edit'}</button><button class="room-toggle ${r.selected?'on':''}" data-i="${i}">${r.selected?'Included':'Add'}</button></div></div>
  ${open?`<div class="edit-panel"><div class="room-grid"><label>Length<input type="number" min="1" max="100" step="0.5" inputmode="decimal" data-i="${i}" data-k="length" value="${r.length}"></label><label>Width<input type="number" min="1" max="100" step="0.5" inputmode="decimal" data-i="${i}" data-k="width" value="${r.width}"></label><label>Height<input type="number" min="6" max="30" step="0.5" inputmode="decimal" data-i="${i}" data-k="height" value="${r.height}"></label></div>
  <div class="mini-title">PACKAGE</div><div class="segmented package-buttons">${['Full Room','Walls Only','Custom'].map(x=>`<button type="button" class="${r.package===x?'active':''}" data-package="${x}" data-i="${i}">${x}</button>`).join('')}</div>
  ${r.package==='Custom'?`<div class="mini-title">WHAT ARE WE PAINTING?</div><div class="tap-scopes">${['walls','ceiling','baseboards','doors','windows','closets','crown'].map(k=>`<button type="button" class="scope-chip ${include(r,k)?'active':''}" data-scope="${k}" data-i="${i}">${chipLabel(k)}</button>`).join('')}</div>`:''}
  ${include(r,'doors')?qtyStepper(i,'doorCount',q.doors,'Doors'):''}${include(r,'windows')?qtyStepper(i,'windowCount',q.windows,'Windows'):''}${include(r,'crown')?`<label class="single-field">Crown molding LF<input type="number" min="0" max="1000" step="1" data-i="${i}" data-k="crownLf" value="${r.crownLf}"></label>`:''}${closetEditor(i,r)}
  <details class="calc-details"><summary>View calculations</summary><div>Room walls: <strong>${Math.round(q.wallSf)} SF</strong> • Ceiling: <strong>${Math.round(q.ceilingSf)} SF</strong> • Baseboards: <strong>${Math.round(q.baseLf)} LF</strong></div>${include(r,'closets')?`<div>Closet walls: <strong>${Math.round(q.closetWallSf)} SF</strong> • Closet ceiling: <strong>${Math.round(q.closetCeilingSf)} SF</strong> • Closet baseboards: <strong>${Math.round(q.closetBaseLf)} LF</strong></div>`:''}<div>Paintable totals: <strong>${Math.round(q.includedWallSf)} wall SF</strong> • <strong>${Math.round(q.includedCeilingSf)} ceiling SF</strong> • <strong>${Math.round(q.includedTrimEqSf)} trim-equivalent SF</strong></div></details></div>`:(r.selected?`<div class="compact-scope">${summary}${include(r,'closets')?` • ${r.closetType||'Reach-in'} closet`:''}</div>`:'')}`;
  w.appendChild(d)});
  w.querySelectorAll('.room-toggle').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;state.rooms[i].selected=!state.rooms[i].selected;if(state.rooms[i].selected)expandedRooms.add(i);else expandedRooms.delete(i);save();renderRooms();renderColors()});
  w.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{const i=+b.dataset.edit;expandedRooms.has(i)?expandedRooms.delete(i):expandedRooms.add(i);renderRooms()});
  w.querySelectorAll('[data-package]').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;setPackage(state.rooms[i],b.dataset.package);save();renderRooms();renderColors()});
  w.querySelectorAll('[data-scope]').forEach(b=>b.onclick=()=>{const r=state.rooms[+b.dataset.i],k=b.dataset.scope;r[k]=include(r,k)?'No':'Yes';if(k==='closets'&&r[k]==='Yes'&&(r.closetType==='None'||!r.closetType))r.closetType='Reach-in';save();renderRooms();renderColors()});
  w.querySelectorAll('[data-bool]').forEach(b=>b.onclick=()=>{const r=state.rooms[+b.dataset.i];r[b.dataset.bool]=!r[b.dataset.bool];save();renderRooms()});
  w.querySelectorAll('[data-closet-type]').forEach(b=>b.onclick=()=>{const r=state.rooms[+b.dataset.i];r.closetType=b.dataset.closetType;r.closets='Yes';save();renderRooms()});
  w.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{const r=state.rooms[+b.dataset.i],k=b.dataset.k;r[k]=Math.max(0,(+r[k]||0)+(+b.dataset.step));save();renderRooms()});
  w.querySelectorAll('input[data-k]').forEach(e=>e.onchange=()=>{const r=state.rooms[+e.dataset.i],k=e.dataset.k;r[k]=Math.max(0,Number(e.value));save();renderRooms();renderColors()});
}
function scopeSummary(r){return ['walls','ceiling','baseboards','doors','windows','closets','crown'].filter(k=>include(r,k)).map(chipLabel).join(' • ')||'None'}
function closetQty(r){
  if(!include(r,'closets'))return{wallSf:0,ceilingSf:0,baseLf:0};const H=Math.max(0,+r.height||0),type=r.closetType||'Reach-in';
  if(type==='Reach-in'){const width=6,depth=2;return{wallSf:(width+2*depth)*H,ceilingSf:width*depth,baseLf:width+2*depth}}
  const L=Math.max(2,+r.closetLength||6),W=Math.max(2,+r.closetWidth||6);return{wallSf:2*(L+W)*H,ceilingSf:L*W,baseLf:2*(L+W)};
}
function roomQty(r){const L=Math.max(0,+r.length||0),W=Math.max(0,+r.width||0),H=Math.max(0,+r.height||0),wallSf=2*(L+W)*H,ceilingSf=L*W,baseLf=2*(L+W),doors=Math.max(0,+r.doorCount||0),windows=Math.max(0,+r.windowCount||0),crownLf=Math.max(0,+r.crownLf||0),cq=closetQty(r),closetWallSf=r.closetWalls?cq.wallSf:0,closetCeilingSf=r.closetCeiling?cq.ceilingSf:0,closetBaseLf=r.closetBaseboards?cq.baseLf:0;return{wallSf,ceilingSf,baseLf,doors,windows,crownLf,closetWallSf,closetCeilingSf,closetBaseLf,closetSf:closetWallSf,includedWallSf:(include(r,'walls')?wallSf:0)+(include(r,'closets')?closetWallSf:0),includedCeilingSf:(include(r,'ceiling')?ceilingSf:0)+(include(r,'closets')?closetCeilingSf:0),includedTrimEqSf:(include(r,'baseboards')?baseLf*.5:0)+(include(r,'doors')?doors*40:0)+(include(r,'windows')?windows*15:0)+(include(r,'crown')?crownLf*.5:0)+(include(r,'closets')?closetBaseLf*.5:0)}}
function renderColors(){const w=$('colorList');w.innerHTML='';state.rooms.filter(r=>r.selected).forEach(r=>{const i=state.rooms.indexOf(r),d=document.createElement('div');d.className='color-card';d.innerHTML=`<strong>${r.name}</strong><div class="form-grid" style="margin-top:10px"><label>Wall Color<input data-i="${i}" data-k="wallColor" value="${esc(r.wallColor)}"></label><label>SW #<input data-i="${i}" data-k="wallSw" value="${esc(r.wallSw)}"></label><label>Ceiling Color<input data-i="${i}" data-k="ceilingColor" value="${esc(r.ceilingColor)}"></label><label>SW #<input data-i="${i}" data-k="ceilingSw" value="${esc(r.ceilingSw)}"></label><label>Trim Color<input data-i="${i}" data-k="trimColor" value="${esc(r.trimColor)}"></label><label>SW #<input data-i="${i}" data-k="trimSw" value="${esc(r.trimSw)}"></label></div>`;w.appendChild(d)});w.querySelectorAll('input').forEach(e=>e.oninput=()=>{state.rooms[+e.dataset.i][e.dataset.k]=e.value;save()})}
function include(r,s){if(!r.selected)return false;if(s==='walls'){const v=r.walls||'Auto';if(v==='Yes')return true;if(v==='No')return false;return r.package==='Full Room'||r.package==='Walls Only'}if(s==='trim')return include(r,'baseboards')||include(r,'doors')||include(r,'windows')||include(r,'crown');const v=r[s]===undefined?'Auto':r[s];if(v==='Yes')return true;if(v==='No')return false;if(s==='ceiling'||s==='baseboards'||s==='doors'||s==='windows')return r.package==='Full Room';return false}
const PRICING={minimumJob:250,targetMargin:0.40,setupShare:0.10,materialPerGallon:48,laborPerHour:28};
function componentHours(r,q=roomQty(r)){
  return {
    walls:(include(r,'walls')?q.wallSf:0)/150,
    closets:include(r,'closets')?((q.closetWallSf/150)+(q.closetCeilingSf/180)+(q.closetBaseLf/30)):0,
    ceiling:(include(r,'ceiling')?q.ceilingSf:0)/180,
    baseboards:include(r,'baseboards')?q.baseLf/30:0,
    doors:include(r,'doors')?q.doors*.75:0,
    windows:include(r,'windows')?q.windows*.35:0,
    crown:include(r,'crown')?q.crownLf/35:0
  };
}
function roomMarketPrice(r,q=roomQty(r)){
  const fullBaseHours=(q.wallSf/150)+(q.ceilingSf/180)+(q.baseLf/30)+(q.doors*.75)+(q.windows*.35);
  if(fullBaseHours<=0)return 0;
  const h=componentHours(r,q);
  const selectedBase=h.walls+h.ceiling+h.baseboards+h.doors+h.windows;
  const extras=h.closets+h.crown;
  if(selectedBase+extras<=0)return 0;
  const setupPart=r.price*PRICING.setupShare;
  const productionPool=r.price*(1-PRICING.setupShare);
  const impliedHourly=productionPool/fullBaseHours;
  return setupPart + (selectedBase*impliedHourly) + (extras*impliedHourly);
}
function calc(){let marketSale=0,hours=0;const groups={};const group=(surface,color,sw,product,sf)=>{const k=[surface,color||'Unassigned',sw||'',product].join('|');if(!groups[k])groups[k]={surface,color:color||'Unassigned',sw:sw||'',product,sf:0};groups[k].sf+=sf};state.rooms.forEach(r=>{if(!r.selected)return;const q=roomQty(r);const h=componentHours(r,q),workHours=h.walls+h.closets+h.ceiling+h.baseboards+h.doors+h.windows+h.crown; if(workHours<=0)return;marketSale+=roomMarketPrice(r,q);if(q.includedWallSf)group('Walls',r.wallColor,r.wallSw,'ProMar 200 Eggshell',q.includedWallSf);if(q.includedCeilingSf)group('Ceiling',r.ceilingColor,r.ceilingSw,'ProMar 200 Flat',q.includedCeilingSf);if(q.includedTrimEqSf)group('Trim',r.trimColor,r.trimSw,'Emerald Urethane Trim Enamel',q.includedTrimEqSf);hours+=workHours+1.5});let gallons=0;Object.values(groups).forEach(g=>{g.calcGal=g.sf*2/350*1.05;g.buyGal=Math.ceil(g.calcGal);gallons+=g.buyGal});const materialCost=gallons*PRICING.materialPerGallon,laborCost=hours*PRICING.laborPerHour,direct=materialCost+laborCost;const marginFloor=direct/(1-PRICING.targetMargin);const hasWork=state.rooms.some(r=>r.selected&&scopeSummary(r)!=='None');let sale=hasWork?Math.max(marketSale,marginFloor,PRICING.minimumJob):0;sale=Math.ceil(sale/5)*5;return{sale,direct,profit:sale-direct,margin:sale?(sale-direct)/sale:0,hours,days:hours?Math.ceil(hours/8):0,gallons,groups:Object.values(groups),selected:state.rooms.filter(r=>r.selected).length,marketSale,marginFloor,minimumJob:hasWork?PRICING.minimumJob:0,materialCost,laborCost}}
function refreshAll(){const c=calc(),p=state.project;$('homeProjectLabel').textContent=p.customerName||p.address||'No project started';$('homePrice').textContent=money(c.sale);$('statusRooms').textContent=c.selected;$('statusGallons').textContent=c.gallons;$('statusDays').textContent=c.days;$('statusMargin').textContent=Math.round(c.margin*100)+'%';$('salePrice').textContent=money(c.sale);$('directCost').textContent=money(c.direct);$('grossProfit').textContent=money(c.profit);$('grossMargin').textContent=Math.round(c.margin*100)+'%';$('laborHours').textContent=c.hours.toFixed(1);$('jobDays').textContent=c.days;$('paintGallons').textContent=c.gallons;$('selectedCount').textContent=c.selected;$('materialSummary').innerHTML=c.groups.length?c.groups.map(g=>`<div class="material-row"><span>${g.surface}<br><small>${g.color}${g.sw?' • '+g.sw:''}</small></span><span>${g.product}<br><small>${Math.round(g.sf)} sq ft</small></span><strong>${g.buyGal} gal</strong></div>`).join(''):'<p class="muted">Select rooms to calculate materials.</p>'; if($('marketComponentPrice'))$('marketComponentPrice').textContent=money(c.marketSale);if($('marginFloorPrice'))$('marginFloorPrice').textContent=money(c.marginFloor);if($('minimumJobPrice'))$('minimumJobPrice').textContent=money(c.minimumJob);if($('pricingRule'))$('pricingRule').textContent='Highest of component market price, 40% margin floor, or $250 minimum job'}
[['applyWalls','wall'],['applyCeilings','ceiling'],['applyTrim','trim']].forEach(([id,k])=>{$(id).onclick=()=>{const color=$(k==='wall'?'defaultWallColor':k==='ceiling'?'defaultCeilingColor':'defaultTrimColor').value,sw=$(k==='wall'?'defaultWallSw':k==='ceiling'?'defaultCeilingSw':'defaultTrimSw').value;state.rooms.filter(r=>r.selected).forEach(r=>{r[k+'Color']=color;r[k+'Sw']=sw});save();renderColors()}});
$('newProjectBtn').onclick=()=>{if(confirm('Start a new estimate? This clears the current project on this device.')){state=fresh();save();bindProject();renderRooms();renderColors()}};$('printProposal').onclick=()=>window.print();
function plural(n,one,many){return `${n} ${n===1?one:many}`}
function proposalScope(r){const q=roomQty(r),items=[];if(include(r,'walls'))items.push('Walls');if(include(r,'ceiling'))items.push('Ceiling');if(include(r,'baseboards'))items.push(`${Math.round(q.baseLf)} LF baseboards`);if(include(r,'doors'))items.push(plural(q.doors,'interior door','interior doors'));if(include(r,'windows'))items.push(plural(q.windows,'window','windows'));if(include(r,'closets')){const parts=[];if(r.closetWalls)parts.push('walls');if(r.closetCeiling)parts.push('ceiling');if(r.closetBaseboards)parts.push('baseboards');items.push(`${r.closetType||'Reach-in'} closet — ${parts.join(', ')}`)}if(include(r,'crown'))items.push(`${Math.round(q.crownLf)} LF crown molding`);return items.join('<br>')||'No work selected'}
function proposalPaint(r){const lines=[];if(include(r,'walls')||(include(r,'closets')&&r.closetWalls))lines.push(`Walls: ProMar 200 Eggshell — ${r.wallColor||'Color TBD'}${r.wallSw?' ('+r.wallSw+')':''}`);if(include(r,'ceiling')||(include(r,'closets')&&r.closetCeiling))lines.push(`Ceiling: ProMar 200 Flat — ${r.ceilingColor||'Color TBD'}${r.ceilingSw?' ('+r.ceilingSw+')':''}`);if(include(r,'baseboards')||include(r,'doors')||include(r,'windows')||include(r,'crown')||(include(r,'closets')&&r.closetBaseboards))lines.push(`Trim: Emerald Urethane Trim Enamel — ${r.trimColor||'Color TBD'}${r.trimSw?' ('+r.trimSw+')':''}`);return lines.join('<br>')}
function renderProposal(){const c=calc(),p=state.project,rows=state.rooms.filter(r=>r.selected&&scopeSummary(r)!=='None').map(r=>`<tr><td><strong>${r.name}</strong></td><td>${proposalScope(r)}</td><td>${proposalPaint(r)}</td></tr>`).join('');$('proposalContent').innerHTML=`<h2>UrbanSkyLine Design & Build LLC</h2><p><strong>Interior Painting Proposal</strong></p><p><strong>Customer:</strong> ${p.customerName||'—'}<br><strong>Project:</strong> ${p.address||'—'} ${p.cityZip||''}<br><strong>Estimator:</strong> ${p.estimator||'—'}</p><h3>Scope of Work</h3><p>Prepare listed surfaces as needed and apply two finish coats unless specifically noted otherwise.</p><table><thead><tr><th>Room / Area</th><th>Work Included</th><th>Paint System / Color</th></tr></thead><tbody>${rows||'<tr><td colspan="3">No work selected</td></tr>'}</tbody></table><h3>Investment</h3><p style="font-size:28px;font-weight:800">${money(c.sale)}</p><p>Estimated duration: ${c.days} day${c.days===1?'':'s'} • Estimated paint purchase: ${c.gallons} gallon${c.gallons===1?'':'s'}</p><p><strong>Notes:</strong> ${p.notes||'Standard preparation and two finish coats unless otherwise specified.'}</p>`}
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