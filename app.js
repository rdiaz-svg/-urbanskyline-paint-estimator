const USL_SYNC={url:localStorage.getItem("uslSyncUrl")||""};
async function uslApi(action,payload={}){const u=($("syncUrl")?.value||USL_SYNC.url).trim();if(!u)throw Error("Add the Apps Script Web App URL first.");localStorage.setItem("uslSyncUrl",u);USL_SYNC.url=u;const r=await fetch(u,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,...payload})});const d=await r.json();if(d.error)throw Error(d.error);return d}
let uslAddressTimer;
async function uslAddressSearch(q){const box=$("addressSuggestions");if(q.trim().length<4){box.innerHTML="";return}try{const d=await uslApi("addressAutocomplete",{input:q});box.innerHTML=(d.suggestions||[]).map(x=>`<button type="button" data-id="${x.placeId}">${x.text}</button>`).join("");box.querySelectorAll("button").forEach(b=>b.onclick=async()=>{const x=await uslApi("placeDetails",{placeId:b.dataset.id});$("address").value=x.street||x.formattedAddress;$("cityZip").value=[x.city,x.state,x.zip].filter(Boolean).join(" ");state.project.address=$("address").value;state.project.cityZip=$("cityZip").value;save();box.innerHTML=""})}catch(e){if($("syncMessage"))$("syncMessage").textContent=e.message}}
const ROOM_PRESETS=[["Living Room",16,20,9,1450],["Master Bedroom",14,18,9,1250],["Bedroom 1",11,12,9,950],["Bedroom 2",11,13,9,950],["Bedroom 3",11,12,9,950],["Bedroom 4",11,12,9,950],["Kitchen",12,16,9,1050],["Dining Room",12,14,9,1050],["Office / Study",10,12,9,900],["Laundry Room",7,9,9,600],["Hallway / Stairs",8,12,9,900],["Entry / Foyer",8,10,9,800],["Game / Media Room",14,16,9,1200],["Custom Room 1",10,10,9,900],["Custom Room 2",10,10,9,900],["Garage",24,24,9,1800]];
const fresh=()=>({project:{customerName:"",phone:"",email:"",address:"",cityZip:"",estimator:"Roberto Diaz",projectType:"Interior Painting",wallCondition:"Good",notes:""},rooms:ROOM_PRESETS.map(r=>({name:r[0],length:r[1],width:r[2],height:r[3],price:r[4],selected:false,package:"Full Room",walls:"Auto",ceiling:"Auto",trim:"Auto",baseboards:"Auto",doors:"Auto",windows:"Auto",closets:"No",crown:"No",doorCount:1,doorSides:"Both Sides",doorCasing:false,windowCount:1,closetWallSf:0,closetType:"None",closetLength:6,closetWidth:6,closetWalls:true,closetCeiling:true,closetBaseboards:true,crownLf:0,wallColor:"Main Wall Color",wallSw:"",ceilingColor:"Ceiling White",ceilingSw:"",trimColor:"Trim White",trimSw:""}))});
let state;try{state=JSON.parse(localStorage.getItem("uslPaintApp"))||fresh()}catch(e){state=fresh()}const $=id=>document.getElementById(id),money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0),money2=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(n||0),esc=s=>String(s||"").replaceAll('"','&quot;');function save(){localStorage.setItem("uslPaintApp",JSON.stringify(state));refreshAll()}function nav(v){document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.dataset.view===v));window.scrollTo(0,0);if(v==='proposal')renderProposal()}document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)nav(b.dataset.go)});
function bindProject(){Object.keys(state.project).forEach(k=>{const e=$(k);if(e){e.value=state.project[k]||'';e.oninput=()=>{state.project[k]=e.value;save()}}});document.querySelector('.save').onclick=()=>{save();nav('home')}}
const expandedRooms=new Set();
function normalizeRoom(r){
  ['baseboards','doors','windows'].forEach(k=>{if(r[k]===undefined)r[k]='Auto'});
  ['closets','crown'].forEach(k=>{if(r[k]===undefined)r[k]='No'});
  if(r.doorCount===undefined)r.doorCount=1;if(!r.doorSides)r.doorSides='Both Sides';if(r.doorCasing===undefined)r.doorCasing=false;if(r.windowCount===undefined)r.windowCount=1;if(r.crownLf===undefined)r.crownLf=0;
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
  ${include(r,'doors')?`${qtyStepper(i,'doorCount',q.doors,'Doors')}<div class="door-options"><div class="mini-title">DOOR PAINTING</div><div class="segmented"><button type="button" class="${r.doorSides==='Both Sides'?'active':''}" data-door-sides="Both Sides" data-i="${i}">Both Sides</button><button type="button" class="${r.doorSides==='One Side'?'active':''}" data-door-sides="One Side" data-i="${i}">One Side</button></div><button type="button" class="scope-chip ${r.doorCasing?'active':''}" data-bool="doorCasing" data-i="${i}">Include Door Casing / Trim</button></div>`:''}${include(r,'windows')?qtyStepper(i,'windowCount',q.windows,'Windows'):''}${include(r,'crown')?`<label class="single-field">Crown molding LF<input type="number" min="0" max="1000" step="1" data-i="${i}" data-k="crownLf" value="${r.crownLf}"></label>`:''}${closetEditor(i,r)}
  <details class="calc-details"><summary>View calculations</summary><div>Room walls: <strong>${Math.round(q.wallSf)} SF</strong> • Ceiling: <strong>${Math.round(q.ceilingSf)} SF</strong> • Baseboards: <strong>${Math.round(q.baseLf)} LF</strong></div>${include(r,'closets')?`<div>Closet walls: <strong>${Math.round(q.closetWallSf)} SF</strong> • Closet ceiling: <strong>${Math.round(q.closetCeilingSf)} SF</strong> • Closet baseboards: <strong>${Math.round(q.closetBaseLf)} LF</strong></div>`:''}<div>Paintable totals: <strong>${Math.round(q.includedWallSf)} wall SF</strong> • <strong>${Math.round(q.includedCeilingSf)} ceiling SF</strong> • <strong>${Math.round(q.includedTrimEqSf)} trim-equivalent SF</strong></div></details></div>`:(r.selected?`<div class="compact-scope">${summary}${include(r,'closets')?` • ${r.closetType||'Reach-in'} closet`:''}</div>`:'')}`;
  w.appendChild(d)});
  w.querySelectorAll('.room-toggle').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;state.rooms[i].selected=!state.rooms[i].selected;if(state.rooms[i].selected)expandedRooms.add(i);else expandedRooms.delete(i);save();renderRooms();renderColors()});
  w.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{const i=+b.dataset.edit;expandedRooms.has(i)?expandedRooms.delete(i):expandedRooms.add(i);renderRooms()});
  w.querySelectorAll('[data-package]').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;setPackage(state.rooms[i],b.dataset.package);save();renderRooms();renderColors()});
  w.querySelectorAll('[data-scope]').forEach(b=>b.onclick=()=>{const r=state.rooms[+b.dataset.i],k=b.dataset.scope;r[k]=include(r,k)?'No':'Yes';if(k==='closets'&&r[k]==='Yes'&&(r.closetType==='None'||!r.closetType))r.closetType='Reach-in';save();renderRooms();renderColors()});
  w.querySelectorAll('[data-door-sides]').forEach(b=>b.onclick=()=>{const r=state.rooms[+b.dataset.i];r.doorSides=b.dataset.doorSides;save();renderRooms()});
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
function roomQty(r){const L=Math.max(0,+r.length||0),W=Math.max(0,+r.width||0),H=Math.max(0,+r.height||0),wallSf=2*(L+W)*H,ceilingSf=L*W,baseLf=2*(L+W),doors=Math.max(0,+r.doorCount||0),windows=Math.max(0,+r.windowCount||0),crownLf=Math.max(0,+r.crownLf||0),cq=closetQty(r),closetWallSf=r.closetWalls?cq.wallSf:0,closetCeilingSf=r.closetCeiling?cq.ceilingSf:0,closetBaseLf=r.closetBaseboards?cq.baseLf:0;return{wallSf,ceilingSf,baseLf,doors,windows,crownLf,closetWallSf,closetCeilingSf,closetBaseLf,closetSf:closetWallSf,includedWallSf:(include(r,'walls')?wallSf:0)+(include(r,'closets')?closetWallSf:0),includedCeilingSf:(include(r,'ceiling')?ceilingSf:0)+(include(r,'closets')?closetCeilingSf:0),includedTrimEqSf:(include(r,'baseboards')?baseLf*.5:0)+(include(r,'doors')?doors*(r.doorSides==='One Side'?20:40)+(r.doorCasing?doors*12:0):0)+(include(r,'windows')?windows*15:0)+(include(r,'crown')?crownLf*.5:0)+(include(r,'closets')?closetBaseLf*.5:0)}}
function renderColors(){const w=$('colorList');w.innerHTML='';state.rooms.filter(r=>r.selected).forEach(r=>{const i=state.rooms.indexOf(r),d=document.createElement('div');d.className='color-card';d.innerHTML=`<strong>${r.name}</strong><div class="form-grid" style="margin-top:10px"><label>Wall Color<input data-i="${i}" data-k="wallColor" value="${esc(r.wallColor)}"></label><label>SW #<input data-i="${i}" data-k="wallSw" value="${esc(r.wallSw)}"></label><label>Ceiling Color<input data-i="${i}" data-k="ceilingColor" value="${esc(r.ceilingColor)}"></label><label>SW #<input data-i="${i}" data-k="ceilingSw" value="${esc(r.ceilingSw)}"></label><label>Trim Color<input data-i="${i}" data-k="trimColor" value="${esc(r.trimColor)}"></label><label>SW #<input data-i="${i}" data-k="trimSw" value="${esc(r.trimSw)}"></label></div>`;w.appendChild(d)});w.querySelectorAll('input').forEach(e=>e.oninput=()=>{state.rooms[+e.dataset.i][e.dataset.k]=e.value;save()})}
function include(r,s){if(!r.selected)return false;if(s==='walls'){const v=r.walls||'Auto';if(v==='Yes')return true;if(v==='No')return false;return r.package==='Full Room'||r.package==='Walls Only'}if(s==='trim')return include(r,'baseboards')||include(r,'doors')||include(r,'windows')||include(r,'crown');const v=r[s]===undefined?'Auto':r[s];if(v==='Yes')return true;if(v==='No')return false;if(s==='ceiling'||s==='baseboards'||s==='doors'||s==='windows')return r.package==='Full Room';return false}
const PRICING={minimumJob:250,targetMargin:0.40,materialPerGallon:48,painterDayRate:300,hoursPerDay:8,setupCleanupPct:0.15,wastePct:0.05};
const COVERAGE={'ProMar 200 Eggshell':400,'ProMar 200 Flat':400,'Emerald Urethane Trim Enamel':400};
const PRODUCTION={wallsFirst:210,wallsSecond:280,ceilingFirst:175,ceilingSecond:233,baseFirst:80,baseSecond:240,crownFirst:50,crownSecond:75,doorBoth:1.00,doorOne:0.50,doorCasing:0.50,window:1.25};
function componentHours(r,q=roomQty(r)){
  const wallHours=sf=>sf/PRODUCTION.wallsFirst+sf/PRODUCTION.wallsSecond;
  const ceilingHours=sf=>sf/PRODUCTION.ceilingFirst+sf/PRODUCTION.ceilingSecond;
  const baseHours=lf=>lf/PRODUCTION.baseFirst+lf/PRODUCTION.baseSecond;
  const crownHours=lf=>lf/PRODUCTION.crownFirst+lf/PRODUCTION.crownSecond;
  return {
    walls:include(r,'walls')?wallHours(q.wallSf):0,
    closets:include(r,'closets')?(wallHours(q.closetWallSf)+ceilingHours(q.closetCeilingSf)+baseHours(q.closetBaseLf)):0,
    ceiling:include(r,'ceiling')?ceilingHours(q.ceilingSf):0,
    baseboards:include(r,'baseboards')?baseHours(q.baseLf):0,
    doors:include(r,'doors')?q.doors*(r.doorSides==='One Side'?PRODUCTION.doorOne:PRODUCTION.doorBoth)+(r.doorCasing?q.doors*PRODUCTION.doorCasing:0):0,
    windows:include(r,'windows')?q.windows*PRODUCTION.window:0,
    crown:include(r,'crown')?crownHours(q.crownLf):0
  };
}
function roomMarketPrice(r,q=roomQty(r)){
  const h=componentHours(r,q), selected=h.walls+h.closets+h.ceiling+h.baseboards+h.doors+h.windows+h.crown;
  if(selected<=0)return 0;
  // Keep the existing Dallas room target as a market-reference price while labor payout is now production based.
  const full={...r,selected:true,package:'Full Room',walls:'Auto',ceiling:'Auto',baseboards:'Auto',doors:'Auto',windows:'Auto',closets:'No',crown:'No'};
  const fh=componentHours(full,q), fullHours=fh.walls+fh.ceiling+fh.baseboards+fh.doors+fh.windows;
  return fullHours>0?r.price*(selected/fullHours):0;
}
function calc(){
  let marketSale=0,productionHours=0;
  const groups={},roomBreakdown=[];
  const group=(surface,color,sw,product,sf)=>{
    const k=[surface,color||'Unassigned',sw||'',product].join('|');
    if(!groups[k])groups[k]={surface,color:color||'Unassigned',sw:sw||'',product,sf:0};
    groups[k].sf+=sf;
  };
  state.rooms.forEach(r=>{
    if(!r.selected)return;
    const q=roomQty(r),h=componentHours(r,q);
    const workHours=h.walls+h.closets+h.ceiling+h.baseboards+h.doors+h.windows+h.crown;
    if(workHours<=0)return;
    marketSale+=roomMarketPrice(r,q);
    productionHours+=workHours;
    roomBreakdown.push({name:r.name,total:workHours,...h});
    if(q.includedWallSf)group('Walls',r.wallColor,r.wallSw,'ProMar 200 Eggshell',q.includedWallSf);
    if(q.includedCeilingSf)group('Ceiling',r.ceilingColor,r.ceilingSw,'ProMar 200 Flat',q.includedCeilingSf);
    if(q.includedTrimEqSf)group('Trim',r.trimColor,r.trimSw,'Emerald Urethane Trim Enamel',q.includedTrimEqSf);
  });
  const setupCleanupHours=productionHours*PRICING.setupCleanupPct;
  const hours=productionHours+setupCleanupHours;
  const painterDays=hours/PRICING.hoursPerDay;
  const painterHourly=PRICING.painterDayRate/PRICING.hoursPerDay;
  const subcontractorPayout=hours*painterHourly;
  let gallons=0;
  Object.values(groups).forEach(g=>{
    g.coverage=COVERAGE[g.product]||400;
    g.baseGal=g.sf*2/g.coverage;
    g.calcGal=g.baseGal*(1+PRICING.wastePct);
    g.buyGal=Math.ceil(g.calcGal-1e-9);
    gallons+=g.buyGal;
  });
  const materialCost=gallons*PRICING.materialPerGallon,laborCost=subcontractorPayout,direct=materialCost+laborCost;
  const marginFloor=direct/(1-PRICING.targetMargin);
  const hasWork=state.rooms.some(r=>r.selected&&scopeSummary(r)!=='None');
  let sale=hasWork?Math.max(marketSale,marginFloor,PRICING.minimumJob):0;
  sale=Math.ceil(sale/5)*5;
  return{sale,direct,profit:sale-direct,margin:sale?(sale-direct)/sale:0,hours,productionHours,setupCleanupHours,painterDays,painterHourly,subcontractorPayout,days:hours?Math.ceil(painterDays):0,gallons,groups:Object.values(groups),roomBreakdown,selected:state.rooms.filter(r=>r.selected&&scopeSummary(r)!=='None').length,marketSale,marginFloor,minimumJob:hasWork?PRICING.minimumJob:0,materialCost,laborCost};
}
function refreshAll(){
  const c=calc(),p=state.project;
  $('homeProjectLabel').textContent=p.customerName||p.address||'No project started';
  $('homePrice').textContent=money(c.sale);
  $('statusRooms').textContent=c.selected;$('statusGallons').textContent=c.gallons;$('statusDays').textContent=c.days;$('statusMargin').textContent=Math.round(c.margin*100)+'%';
  $('salePrice').textContent=money(c.sale);$('directCost').textContent=money(c.direct);$('grossProfit').textContent=money(c.profit);$('grossMargin').textContent=Math.round(c.margin*100)+'%';
  $('laborHours').textContent=c.hours.toFixed(1);$('jobDays').textContent=c.days;$('paintGallons').textContent=c.gallons;$('selectedCount').textContent=c.selected;
  $('materialSummary').innerHTML=c.groups.length?c.groups.map(g=>`<div class="material-row"><span>${g.surface}<br><small>${g.color}${g.sw?' • '+g.sw:''}</small></span><span>${g.product}<br><small>${Math.round(g.sf)} sq ft • 2 coats • ${g.coverage} sq ft/gal</small><br><small>${g.baseGal.toFixed(2)} gal coating + 5% waste = <strong>${g.calcGal.toFixed(2)} gal required</strong></small></span><strong>Buy ${g.buyGal} gal</strong></div>`).join('')+'<p class="muted material-note">Paint is combined by matching product and color before rounding to whole gallons. Coverage assumption: 400 sq ft/gal; 2 coats; 5% waste.</p>':'<p class="muted">Select rooms to calculate materials.</p>';
  if($('marketComponentPrice'))$('marketComponentPrice').textContent=money(c.marketSale);
  if($('marginFloorPrice'))$('marginFloorPrice').textContent=money(c.marginFloor);
  if($('minimumJobPrice'))$('minimumJobPrice').textContent=money(c.minimumJob);
  if($('pricingRule'))$('pricingRule').textContent='Highest of component market price, 40% margin floor, or $250 minimum job';
  if($('productionHours'))$('productionHours').textContent=c.productionHours.toFixed(1);
  if($('setupCleanupHours'))$('setupCleanupHours').textContent=c.setupCleanupHours.toFixed(1);
  if($('painterDays'))$('painterDays').textContent=c.painterDays.toFixed(2);
  if($('painterDayRate'))$('painterDayRate').textContent=money(PRICING.painterDayRate);
  if($('painterHourlyRate'))$('painterHourlyRate').textContent=money2(c.painterHourly)+'/hr';
  if($('subcontractorPayout'))$('subcontractorPayout').textContent=money(c.subcontractorPayout);
  if($('materialCostInternal'))$('materialCostInternal').textContent=money(c.materialCost);
  if($('productionBreakdown'))$('productionBreakdown').innerHTML=c.roomBreakdown.length?c.roomBreakdown.map(r=>`<div class="status-row"><span>${r.name}<small class="prod-detail">Walls ${r.walls.toFixed(1)} • Ceiling ${r.ceiling.toFixed(1)} • Base ${r.baseboards.toFixed(1)} • Doors ${r.doors.toFixed(1)} • Windows ${r.windows.toFixed(1)}${r.closets?` • Closet ${r.closets.toFixed(1)}`:''}${r.crown?` • Crown ${r.crown.toFixed(1)}`:''}</small></span><strong>${r.total.toFixed(1)} hr</strong></div>`).join(''):'<p class="muted">Select rooms to see production hours.</p>';
}
[['applyWalls','wall'],['applyCeilings','ceiling'],['applyTrim','trim']].forEach(([id,k])=>{$(id).onclick=()=>{const color=$(k==='wall'?'defaultWallColor':k==='ceiling'?'defaultCeilingColor':'defaultTrimColor').value,sw=$(k==='wall'?'defaultWallSw':k==='ceiling'?'defaultCeilingSw':'defaultTrimSw').value;state.rooms.filter(r=>r.selected).forEach(r=>{r[k+'Color']=color;r[k+'Sw']=sw});save();renderColors()}});
$('newProjectBtn').onclick=()=>{if(confirm('Start a new estimate? This clears the current project on this device.')){state=fresh();save();bindProject();renderRooms();renderColors()}};$('printProposal').onclick=()=>{const p=state.project||{};const missing=[];if(!String(p.customerName||'').trim())missing.push('customer name');if(!String(p.address||'').trim())missing.push('street address');if(missing.length){alert('Complete '+missing.join(' and ')+' before finalizing the proposal.');nav('project');return}window.print()};
function plural(n,one,many){return `${n} ${n===1?one:many}`}
function proposalScope(r){const q=roomQty(r),items=[];if(include(r,'walls'))items.push('Walls');if(include(r,'ceiling'))items.push('Ceiling');if(include(r,'baseboards'))items.push(`${Math.round(q.baseLf)} LF baseboards`);if(include(r,'doors'))items.push(`${plural(q.doors,'interior door','interior doors')}, ${r.doorSides==='One Side'?'one side':'both sides'}${r.doorCasing?' + casing/trim':''}`);if(include(r,'windows'))items.push(plural(q.windows,'window','windows'));if(include(r,'closets')){const parts=[];if(r.closetWalls)parts.push('walls');if(r.closetCeiling)parts.push('ceiling');if(r.closetBaseboards)parts.push('baseboards');items.push(`${r.closetType||'Reach-in'} closet — ${parts.join(', ')}`)}if(include(r,'crown'))items.push(`${Math.round(q.crownLf)} LF crown molding`);return items.join('<br>')||'No work selected'}
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