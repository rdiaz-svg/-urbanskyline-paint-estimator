const USL_SYNC={url:localStorage.getItem("uslSyncUrl")||""};
async function uslApi(action,payload={}){const u=($("syncUrl")?.value||USL_SYNC.url).trim();if(!u)throw Error("Add the Apps Script Web App URL first.");localStorage.setItem("uslSyncUrl",u);USL_SYNC.url=u;const r=await fetch(u,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,...payload})});const d=await r.json();if(d.error)throw Error(d.error);return d}
let uslAddressTimer;
async function uslAddressSearch(q){const box=$("addressSuggestions");if(q.trim().length<4){box.innerHTML="";return}try{const d=await uslApi("addressAutocomplete",{input:q});box.innerHTML=(d.suggestions||[]).map(x=>`<button type="button" data-id="${x.placeId}">${x.text}</button>`).join("");box.querySelectorAll("button").forEach(b=>b.onclick=async()=>{const x=await uslApi("placeDetails",{placeId:b.dataset.id});$("address").value=x.street||x.formattedAddress;$("cityZip").value=[x.city,x.state,x.zip].filter(Boolean).join(" ");state.project.address=$("address").value;state.project.cityZip=$("cityZip").value;save();box.innerHTML=""})}catch(e){if($("syncMessage"))$("syncMessage").textContent=e.message}}
const ROOM_PRESETS=[["Living Room",16,20,9,1450],["Master Bedroom",14,18,9,1250],["Bedroom 1",11,12,9,950],["Bedroom 2",11,13,9,950],["Bedroom 3",11,12,9,950],["Bedroom 4",11,12,9,950],["Kitchen",12,16,9,1050],["Dining Room",12,14,9,1050],["Office / Study",10,12,9,900],["Laundry Room",7,9,9,600],["Hallway / Stairs",8,12,9,900],["Entry / Foyer",8,10,9,800],["Game / Media Room",14,16,9,1200],["Custom Room 1",10,10,9,900],["Custom Room 2",10,10,9,900],["Garage",24,24,9,1800]];
function isBedroomPreset(name){return name==='Master Bedroom'||/^Bedroom [1-4]$/.test(name||'')}
function defaultClosetType(name){return name==='Master Bedroom'?'Walk-in':isBedroomPreset(name)?'Reach-in':'None'}
function applyDefaultCloset(r){if(!isBedroomPreset(r.name))return;r.closets='Yes';r.closetType=defaultClosetType(r.name);r.closetLength=r.name==='Master Bedroom'?6:(r.closetLength||6);r.closetWidth=r.name==='Master Bedroom'?8:(r.closetWidth||6);r.closetWalls=true;r.closetCeiling=true;r.closetBaseboards=true;if(!r.closetOverride)r.closetOverride='auto'}
const fresh=()=>({materialSettings:{wallProduct:"ProMar 200 Zero VOC Interior Latex",wallCost:43.30,ceilingProduct:"Premium Ceiling Paint",ceilingCost:37.45,trimProduct:"Emerald Urethane Trim Enamel",trimCost:75.01,primerProduct:"ProBlock Premium All-Purpose Water-Based Interior/Exterior Primer",primerCost:27.95,suppliesPct:0},project:{customerName:"",phone:"",email:"",address:"",cityZip:"",estimator:"Roberto Diaz",projectType:"Interior Painting",wallCondition:"Good",notes:""},subcontractor:{name:"",startDate:"",paymentStatus:"Not Paid",datePaid:"",actualHours:"",agreedPayout:"",amountPaid:"",notes:""},rooms:ROOM_PRESETS.map(r=>({name:r[0],length:r[1],width:r[2],height:r[3],price:r[4],selected:false,package:"Full Room",walls:"Auto",ceiling:"Auto",trim:"Auto",baseboards:"Auto",doors:"Auto",windows:"Auto",closets:isBedroomPreset(r[0])?"Yes":"No",crown:"No",doorCount:1,doorSides:"Both Sides",doorCasing:false,windowCount:1,closetWallSf:0,closetType:defaultClosetType(r[0]),closetOverride:isBedroomPreset(r[0])?"auto":"none",closetLength:6,closetWidth:r[0]==="Master Bedroom"?8:6,closetWalls:true,closetCeiling:true,closetBaseboards:true,crownLf:0,wallColor:"Main Wall Color",wallSw:"",ceilingColor:"Ceiling White",ceilingSw:"",trimColor:"Trim White",trimSw:"",primerMode:"None",primerTarget:"Walls",repairs:{smallHole:0,mediumPatch:0,largeRepair:0,crackPatch:0,textureRepair:0,extensiveCaulk:0,stainPrep:0,wallpaperRemoval:0,customQty:0,customDescription:"Custom Extra",customHours:0,customMaterials:0}}))});
let state;try{state=JSON.parse(localStorage.getItem("uslPaintApp"))||fresh()}catch(e){state=fresh()}if(!state.subcontractor)state.subcontractor={name:"",startDate:"",paymentStatus:"Not Paid",datePaid:"",actualHours:"",agreedPayout:"",amountPaid:"",notes:""};const $=id=>document.getElementById(id),money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0),money2=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(n||0),esc=s=>String(s||"").replaceAll('"','&quot;');function save(){localStorage.setItem("uslPaintApp",JSON.stringify(state));refreshAll()}function nav(v){document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.dataset.view===v));window.scrollTo(0,0);if(v==='proposal')renderProposal();if(v==='subcontractor')renderSubcontractor()}document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)nav(b.dataset.go)});
function bindProject(){Object.keys(state.project).forEach(k=>{const e=$(k);if(e){e.value=state.project[k]||'';e.oninput=()=>{state.project[k]=e.value;save()}}});document.querySelector('.save').onclick=()=>{save();nav('home')}}
const expandedRooms=new Set();
const expandedRepairs=new Set();
function normalizeRoom(r){
  ['baseboards','doors','windows'].forEach(k=>{if(r[k]===undefined)r[k]='Auto'});
  ['closets','crown'].forEach(k=>{if(r[k]===undefined)r[k]='No'});
  if(r.doorCount===undefined)r.doorCount=1;if(!r.doorSides)r.doorSides='Both Sides';if(r.doorCasing===undefined)r.doorCasing=false;if(r.windowCount===undefined)r.windowCount=1;if(r.crownLf===undefined)r.crownLf=0;
  if(r.closetType===undefined)r.closetType=(+r.closetWallSf||0)>0?'Custom':'None';
  if(r.closetLength===undefined)r.closetLength=6;if(r.closetWidth===undefined)r.closetWidth=r.name==='Master Bedroom'?8:6;
  if(r.closetOverride===undefined){
    if(isBedroomPreset(r.name)&&r.package==='Full Room'&&(!r.closetType||r.closetType==='None')){applyDefaultCloset(r)}
    else r.closetOverride=(r.closets==='Yes'&&r.closetType&&r.closetType!=='None')?'manual':'none';
  }
  if(isBedroomPreset(r.name)&&r.package==='Full Room'&&r.closetOverride!=='none'&&r.closets!=='Yes')applyDefaultCloset(r);
  if(r.closetWalls===undefined)r.closetWalls=true;if(r.closetCeiling===undefined)r.closetCeiling=true;if(r.closetBaseboards===undefined)r.closetBaseboards=true;if(!r.primerMode)r.primerMode='None';if(!r.primerTarget)r.primerTarget='Walls';
  if(!r.repairs)r.repairs={}; const rp=r.repairs; [["smallHole",0],["mediumPatch",0],["largeRepair",0],["crackPatch",0],["textureRepair",0],["extensiveCaulk",0],["stainPrep",0],["wallpaperRemoval",0],["customQty",0],["customDescription","Custom Extra"],["customHours",0],["customMaterials",0]].forEach(([k,v])=>{if(rp[k]===undefined)rp[k]=v});
}
function setPackage(r,p){
  r.package=p;
  if(p==='Full Room'){r.walls='Auto';r.ceiling='Auto';r.baseboards='Auto';r.doors='Auto';r.windows='Auto';r.crown='No';if(isBedroomPreset(r.name)&&r.closetOverride!=='none')applyDefaultCloset(r);else if(!isBedroomPreset(r.name))r.closets='No'}
  else if(p==='Walls Only'){r.walls='Auto';r.ceiling='No';r.baseboards='No';r.doors='No';r.windows='No';r.closets='No';r.crown='No'}
  else {r.walls='No';r.ceiling='No';r.baseboards='No';r.doors='No';r.windows='No';r.closets='No';r.crown='No'}
}
function chipLabel(k){return {walls:'Walls',ceiling:'Ceiling',baseboards:'Baseboards',doors:'Doors',windows:'Windows',closets:'Closet',crown:'Crown'}[k]}
function qtyStepper(i,k,n,label){return `<div class="qty-stepper"><span>${label}</span><div><button type="button" data-step="-1" data-i="${i}" data-k="${k}">−</button><strong>${n}</strong><button type="button" data-step="1" data-i="${i}" data-k="${k}">+</button></div></div>`}
function closetEditor(i,r){
  const bedroomFull=isBedroomPreset(r.name)&&r.package==='Full Room';
  const rawIncluded=r.closets==='Yes'&&r.closetType!=='None';
  if(!bedroomFull&&!rawIncluded)return '';
  const type=rawIncluded?(r.closetType||defaultClosetType(r.name)):'None';
  return `<div class="closet-box"><div class="mini-title">CLOSET</div>${bedroomFull?`<p class="muted">Full Room includes the bedroom closet automatically. Choose No Closet only when this room does not have one.</p>`:''}<div class="segmented closet-types closet-types-three">
    ${['None','Reach-in','Walk-in'].map(t=>`<button type="button" class="${type===t?'active':''}" data-closet-type="${t}" data-i="${i}">${t==='None'?'No Closet':t}</button>`).join('')}
  </div>${type==='Walk-in'?`<div class="room-grid closet-dims"><label>Length<input type="number" min="2" max="30" step="0.5" data-i="${i}" data-k="closetLength" value="${r.closetLength}"></label><label>Width<input type="number" min="2" max="30" step="0.5" data-i="${i}" data-k="closetWidth" value="${r.closetWidth}"></label><label>Height<input value="${r.height}" disabled><small>Uses room height</small></label></div>`:''}
  ${type!=='None'?`<div class="closet-scope"><span>Paint</span>${[['closetWalls','Walls'],['closetCeiling','Ceiling'],['closetBaseboards','Baseboards']].map(([k,l])=>`<button type="button" class="scope-chip ${r[k]?'active':''}" data-bool="${k}" data-i="${i}">${l}</button>`).join('')}</div>`:''}</div>`
}
function repairHasSelection(r){normalizeRoom(r);const rp=r.repairs;return ['smallHole','mediumPatch','largeRepair','crackPatch','textureRepair','extensiveCaulk','stainPrep','wallpaperRemoval','customQty'].some(k=>(+rp[k]||0)>0)}
function repairSummaryText(r){normalizeRoom(r);const rp=r.repairs,parts=[];const labels={smallHole:'small hole',mediumPatch:'medium patch',largeRepair:'large repair',crackPatch:'crack/patch',textureRepair:'texture repair',extensiveCaulk:'caulking',stainPrep:'stain prep',wallpaperRemoval:'wallpaper removal'};Object.keys(labels).forEach(k=>{const q=+rp[k]||0;if(q)parts.push(`${q} ${labels[k]}${q===1?'':'s'}`)});if((+rp.customQty||0)>0)parts.push(`${rp.customQty} ${rp.customDescription||'custom extra'}`);return parts.join(' • ')}
function repairsEditor(i,r){const has=repairHasSelection(r),open=expandedRepairs.has(i);return `<div class="repair-collapsed ${has?'has-repairs':''}"><button type="button" class="repair-toggle" data-repair-toggle="${i}"><span>${has?'Repairs / Extras':'＋ Add Repairs / Extras'}</span><small>${has?repairSummaryText(r):'Only add work beyond normal paint preparation.'}</small><strong>${open?'Hide':'Edit'}</strong></button>${open?`<div class="repair-box"><div class="mini-title">REPAIRS & EXTRAS</div><p class="muted">Add only work beyond normal paint preparation.</p><div class="repair-list">${[['smallHole','Small drywall hole'],['mediumPatch','Medium drywall patch (2–6 in)'],['largeRepair','Large drywall repair (>6 in) — FIELD ESTIMATE'],['crackPatch','Crack / patching'],['textureRepair','Texture repair'],['extensiveCaulk','Extensive caulking'],['stainPrep','Water / stain damage prep'],['wallpaperRemoval','Wallpaper removal']].map(([k,label])=>`<div class="repair-row"><span>${label}</span><div class="qty-stepper"><button type="button" data-repair-step="-1" data-i="${i}" data-rk="${k}">−</button><strong>${r.repairs[k]||0}</strong><button type="button" data-repair-step="1" data-i="${i}" data-rk="${k}">+</button></div></div>`).join('')}</div><details class="calc-details"><summary>Custom extra</summary><div class="form-grid"><label>Description<input data-repair-text="customDescription" data-i="${i}" value="${esc(r.repairs.customDescription||'Custom Extra')}"></label><label>Quantity<input type="number" min="0" step="1" data-repair-num="customQty" data-i="${i}" value="${r.repairs.customQty||0}"></label><label>Labor hours / unit<input type="number" min="0" step="0.25" data-repair-num="customHours" data-i="${i}" value="${r.repairs.customHours||0}"></label><label>Materials / unit<input type="number" min="0" step="0.01" data-repair-num="customMaterials" data-i="${i}" value="${r.repairs.customMaterials||0}"></label></div></details></div>`:''}</div>`}
function renderRooms(){const w=$('roomList');w.innerHTML='';state.rooms.forEach((r,i)=>{
  normalizeRoom(r);const q=roomQty(r),open=expandedRooms.has(i),summary=scopeSummary(r),roomPrice=r.selected&&summary!=='None'?roomMarketPrice(r,q):0;
  const d=document.createElement('div');d.className='room-card '+(r.selected?'selected-room':'');
  d.innerHTML=`<div class="room-head"><div><strong>${r.name}</strong><div class="muted">${r.length}' × ${r.width}' × ${r.height}'${r.selected?' • '+summary:''}</div>${r.selected?`<div class="room-price">${money(roomPrice)} <small>component estimate</small></div>`:''}</div><div class="room-actions"><button class="edit-room" data-edit="${i}">${open?'Done':'Edit'}</button><button class="room-toggle ${r.selected?'on':''}" data-i="${i}">${r.selected?'Included':'Add'}</button></div></div>
  ${open?`<div class="edit-panel"><div class="room-grid"><label>Length<input type="number" min="1" max="100" step="0.5" inputmode="decimal" data-i="${i}" data-k="length" value="${r.length}"></label><label>Width<input type="number" min="1" max="100" step="0.5" inputmode="decimal" data-i="${i}" data-k="width" value="${r.width}"></label><label>Height<input type="number" min="6" max="30" step="0.5" inputmode="decimal" data-i="${i}" data-k="height" value="${r.height}"></label></div>
  <div class="mini-title">PACKAGE</div><div class="segmented package-buttons">${['Full Room','Walls Only','Custom'].map(x=>`<button type="button" class="${r.package===x?'active':''}" data-package="${x}" data-i="${i}">${x}</button>`).join('')}</div>
  ${r.package==='Custom'?`<div class="mini-title">WHAT ARE WE PAINTING?</div><div class="tap-scopes">${['walls','ceiling','baseboards','doors','windows','closets','crown'].map(k=>`<button type="button" class="scope-chip ${include(r,k)?'active':''}" data-scope="${k}" data-i="${i}">${chipLabel(k)}</button>`).join('')}</div>`:''}
  <div class="primer-box"><div class="mini-title">PRIMER</div><div class="segmented primer-modes">${['None','Spot Prime','Full Prime'].map(x=>`<button type="button" class="${r.primerMode===x?'active':''}" data-primer-mode="${x}" data-i="${i}">${x}</button>`).join('')}</div>${r.primerMode==='Full Prime'?`<div class="mini-title">PRIME SURFACES</div><div class="segmented primer-targets">${['Walls','Ceiling','Walls + Ceiling'].map(x=>`<button type="button" class="${r.primerTarget===x?'active':''}" data-primer-target="${x}" data-i="${i}">${x}</button>`).join('')}</div>`:r.primerMode==='Spot Prime'?`<p class="muted">Spot-prime allowance: 0.5 painter-hour and up to 1 gallon purchased for this room.</p>`:''}</div>
  ${repairsEditor(i,r)}
  ${include(r,'doors')?`${qtyStepper(i,'doorCount',q.doors,'Doors')}<div class="door-options"><div class="mini-title">DOOR PAINTING</div><div class="segmented"><button type="button" class="${r.doorSides==='Both Sides'?'active':''}" data-door-sides="Both Sides" data-i="${i}">Both Sides</button><button type="button" class="${r.doorSides==='One Side'?'active':''}" data-door-sides="One Side" data-i="${i}">One Side</button></div><button type="button" class="scope-chip ${r.doorCasing?'active':''}" data-bool="doorCasing" data-i="${i}">Include Door Casing / Trim</button></div>`:''}${include(r,'windows')?qtyStepper(i,'windowCount',q.windows,'Windows'):''}${include(r,'crown')?`<label class="single-field">Crown molding LF<input type="number" min="0" max="1000" step="1" data-i="${i}" data-k="crownLf" value="${r.crownLf}"></label>`:''}${closetEditor(i,r)}
  <details class="calc-details"><summary>View calculations</summary><div>Room walls: <strong>${Math.round(q.wallSf)} SF</strong> • Ceiling: <strong>${Math.round(q.ceilingSf)} SF</strong> • Baseboards: <strong>${Math.round(q.baseLf)} LF</strong></div>${include(r,'closets')?`<div>Closet walls: <strong>${Math.round(q.closetWallSf)} SF</strong> • Closet ceiling: <strong>${Math.round(q.closetCeilingSf)} SF</strong> • Closet baseboards: <strong>${Math.round(q.closetBaseLf)} LF</strong></div>`:''}<div>Paintable totals: <strong>${Math.round(q.includedWallSf)} wall SF</strong> • <strong>${Math.round(q.includedCeilingSf)} ceiling SF</strong> • <strong>${Math.round(q.includedTrimEqSf)} trim-equivalent SF</strong></div></details></div>`:(r.selected?`<div class="compact-scope">${summary}${include(r,'closets')?` • ${r.closetType||'Reach-in'} closet`:''}</div>`:'')}`;
  w.appendChild(d)});
  w.querySelectorAll('.room-toggle').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;state.rooms[i].selected=!state.rooms[i].selected;if(state.rooms[i].selected)expandedRooms.add(i);else expandedRooms.delete(i);save();renderRooms();renderColors()});
  w.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{const i=+b.dataset.edit;expandedRooms.has(i)?expandedRooms.delete(i):expandedRooms.add(i);renderRooms()});
  w.querySelectorAll('[data-package]').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;setPackage(state.rooms[i],b.dataset.package);save();renderRooms();renderColors()});
  w.querySelectorAll('[data-scope]').forEach(b=>b.onclick=()=>{const r=state.rooms[+b.dataset.i],k=b.dataset.scope;r[k]=include(r,k)?'No':'Yes';if(k==='closets'&&r[k]==='Yes'){if(r.closetType==='None'||!r.closetType)r.closetType=defaultClosetType(r.name)==='None'?'Reach-in':defaultClosetType(r.name);r.closetOverride='manual'}if(k==='closets'&&r[k]==='No')r.closetOverride='none';save();renderRooms();renderColors()});
  w.querySelectorAll('[data-primer-mode]').forEach(b=>b.onclick=()=>{const r=state.rooms[+b.dataset.i];r.primerMode=b.dataset.primerMode;save();renderRooms()});
  w.querySelectorAll('[data-primer-target]').forEach(b=>b.onclick=()=>{const r=state.rooms[+b.dataset.i];r.primerTarget=b.dataset.primerTarget;save();renderRooms()});
  w.querySelectorAll('[data-door-sides]').forEach(b=>b.onclick=()=>{const r=state.rooms[+b.dataset.i];r.doorSides=b.dataset.doorSides;save();renderRooms()});
  w.querySelectorAll('[data-bool]').forEach(b=>b.onclick=()=>{const r=state.rooms[+b.dataset.i];r[b.dataset.bool]=!r[b.dataset.bool];save();renderRooms()});
  w.querySelectorAll('[data-closet-type]').forEach(b=>b.onclick=()=>{const r=state.rooms[+b.dataset.i],t=b.dataset.closetType;if(t==='None'){r.closetType='None';r.closets='No';r.closetOverride='none'}else{r.closetType=t;r.closets='Yes';r.closetOverride='manual';if(t==='Walk-in'&&r.name==='Master Bedroom'&&(!(r.closetWidth>0)||r.closetWidth===6)){r.closetLength=6;r.closetWidth=8}}save();renderRooms();renderColors()});
  w.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{const r=state.rooms[+b.dataset.i],k=b.dataset.k;r[k]=Math.max(0,(+r[k]||0)+(+b.dataset.step));save();renderRooms()});
  w.querySelectorAll('[data-repair-toggle]').forEach(b=>b.onclick=()=>{const i=+b.dataset.repairToggle;expandedRepairs.has(i)?expandedRepairs.delete(i):expandedRepairs.add(i);renderRooms()});
  w.querySelectorAll('[data-repair-step]').forEach(b=>b.onclick=()=>{const r=state.rooms[+b.dataset.i];normalizeRoom(r);const k=b.dataset.rk;r.repairs[k]=Math.max(0,(+r.repairs[k]||0)+(+b.dataset.repairStep));save();renderRooms()});
  w.querySelectorAll('[data-repair-num]').forEach(e=>e.onchange=()=>{const r=state.rooms[+e.dataset.i];normalizeRoom(r);r.repairs[e.dataset.repairNum]=Math.max(0,+e.value||0);save();renderRooms()});
  w.querySelectorAll('[data-repair-text]').forEach(e=>e.oninput=()=>{const r=state.rooms[+e.dataset.i];normalizeRoom(r);r.repairs[e.dataset.repairText]=e.value;save()});
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
const PRICING={minimumJob:250,targetMargin:0.40,painterDayRate:300,hoursPerDay:8,setupCleanupPct:0.15,wastePct:0.10};
const COVERAGE_DEFAULT=400;
function materialSettings(){if(!state.materialSettings)state.materialSettings={};const m=state.materialSettings; if(!m.wallProduct)m.wallProduct="ProMar 200 Zero VOC Interior Latex"; if(!(m.wallCost>0))m.wallCost=43.30; if(!m.ceilingProduct)m.ceilingProduct="Premium Ceiling Paint"; if(!(m.ceilingCost>0))m.ceilingCost=37.45; if(!m.trimProduct)m.trimProduct="Emerald Urethane Trim Enamel"; if(!(m.trimCost>0))m.trimCost=75.01; if(!m.primerProduct)m.primerProduct="ProBlock Premium All-Purpose Water-Based Interior/Exterior Primer"; if(!(m.primerCost>0))m.primerCost=27.95; if(m.suppliesPct===undefined)m.suppliesPct=0; return m;}
function productCost(surface){const m=materialSettings();return surface==="Walls"?+m.wallCost:surface==="Ceiling"?+m.ceilingCost:+m.trimCost;}
function productName(surface){const m=materialSettings();return surface==="Walls"?m.wallProduct:surface==="Ceiling"?m.ceilingProduct:m.trimProduct;}
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
const REPAIR_RATES={
  smallHole:{label:'Small drywall hole (up to 2 in)',hours:0.50,materials:5},
  mediumPatch:{label:'Medium drywall patch (2–6 in)',hours:1.00,materials:12},
  crackPatch:{label:'Crack / patching',hours:0.75,materials:8},
  textureRepair:{label:'Texture repair',hours:1.00,materials:15},
  extensiveCaulk:{label:'Extensive caulking',hours:1.00,materials:12},
  stainPrep:{label:'Water / stain damage prep',hours:1.00,materials:15},
  wallpaperRemoval:{label:'Wallpaper removal',hours:2.00,materials:10}
};
function repairCalc(r){normalizeRoom(r);let hours=0,materials=0,items=[];Object.entries(REPAIR_RATES).forEach(([k,v])=>{const q=Math.max(0,+r.repairs[k]||0);if(q){hours+=q*v.hours;materials+=q*v.materials;items.push({label:v.label,qty:q,hours:q*v.hours,materials:q*v.materials})}});const lr=Math.max(0,+r.repairs.largeRepair||0);if(lr)items.push({label:'Large drywall repair (>6 in) — Field Estimate Required',qty:lr,hours:0,materials:0,fieldEstimate:true});const cq=Math.max(0,+r.repairs.customQty||0);if(cq){const h=cq*Math.max(0,+r.repairs.customHours||0),m=cq*Math.max(0,+r.repairs.customMaterials||0);hours+=h;materials+=m;items.push({label:r.repairs.customDescription||'Custom Extra',qty:cq,hours:h,materials:m})}return{hours,materials,items};}
function calc(){
  let marketSale=0,productionHours=0,primerHours=0,repairHours=0,repairMaterials=0;
  const groups={},roomBreakdown=[],primerGroups={};
  const group=(surface,color,sw,product,sf)=>{
    const k=[surface,color||'Unassigned',sw||'',product].join('|');
    if(!groups[k])groups[k]={surface,color:color||'Unassigned',sw:sw||'',product,sf:0};
    groups[k].sf+=sf;
  };
  state.rooms.forEach(r=>{
    if(!r.selected)return;
    const q=roomQty(r),h=componentHours(r,q),rep=repairCalc(r);
    const workHours=h.walls+h.closets+h.ceiling+h.baseboards+h.doors+h.windows+h.crown;
    if(workHours<=0)return;
    marketSale+=roomMarketPrice(r,q);
    productionHours+=workHours;
    let roomPrimerHours=0;
    if(r.primerMode==='Spot Prime'){roomPrimerHours=0.5; const k=materialSettings().primerProduct+'|Spot Prime'; if(!primerGroups[k])primerGroups[k]={product:materialSettings().primerProduct,sf:0,spotRooms:0}; primerGroups[k].spotRooms+=1;}
    if(r.primerMode==='Full Prime'){const target=r.primerTarget||'Walls';let psf=0;if(target.includes('Walls'))psf+=q.includedWallSf;if(target.includes('Ceiling'))psf+=q.includedCeilingSf;roomPrimerHours+=(target.includes('Walls')?q.includedWallSf/PRODUCTION.wallsFirst:0)+(target.includes('Ceiling')?q.includedCeilingSf/PRODUCTION.ceilingFirst:0);const k=materialSettings().primerProduct+'|Full Prime';if(!primerGroups[k])primerGroups[k]={product:materialSettings().primerProduct,sf:0,spotRooms:0};primerGroups[k].sf+=psf;}
    primerHours+=roomPrimerHours; repairHours+=rep.hours; repairMaterials+=rep.materials;
    roomBreakdown.push({name:r.name,total:workHours+roomPrimerHours+rep.hours,primer:roomPrimerHours,repairs:rep.hours,repairItems:rep.items,...h});
    if(q.includedWallSf)group('Walls',r.wallColor,r.wallSw,productName('Walls'),q.includedWallSf);
    if(q.includedCeilingSf)group('Ceiling',r.ceilingColor,r.ceilingSw,productName('Ceiling'),q.includedCeilingSf);
    if(q.includedTrimEqSf)group('Trim',r.trimColor,r.trimSw,productName('Trim'),q.includedTrimEqSf);
  });
  productionHours+=primerHours+repairHours;
  const setupCleanupHours=productionHours*PRICING.setupCleanupPct;
  const hours=productionHours+setupCleanupHours;
  const painterDays=hours/PRICING.hoursPerDay;
  const painterHourly=PRICING.painterDayRate/PRICING.hoursPerDay;
  const subcontractorPayout=hours*painterHourly;
  let gallons=0;
  Object.values(groups).forEach(g=>{
    g.coverage=COVERAGE_DEFAULT;
    g.baseGal=g.sf*2/g.coverage;
    g.calcGal=g.baseGal*(1+PRICING.wastePct);
    g.buyGal=Math.ceil(g.calcGal-1e-9);
    g.unitCost=productCost(g.surface);
    g.extCost=g.buyGal*g.unitCost;
    gallons+=g.buyGal;
  });
  let primerGallons=0,primerCost=0;Object.values(primerGroups).forEach(g=>{g.baseGal=g.sf/COVERAGE_DEFAULT;g.calcGal=g.baseGal*(1+PRICING.wastePct);g.buyGal=g.spotRooms+Math.ceil(g.calcGal-1e-9);g.unitCost=+materialSettings().primerCost;g.extCost=g.buyGal*g.unitCost;primerGallons+=g.buyGal;primerCost+=g.extCost;});gallons+=primerGallons;
  const finishPaintCost=Object.values(groups).reduce((sum,g)=>sum+g.extCost,0);const paintCost=finishPaintCost+primerCost;
  // UrbanSkyLine normal consumables allowance, based on total project painter-hours.
  // Small: <=8 hr $50 | Medium: <=24 hr $100 | Large: <=40 hr $150 | Very large: >40 hr $200.
  // Major repairs and specialty materials remain separate extras.
  let suppliesTier='None', suppliesCost=0;
  if(hours>0){
    if(hours<=8){suppliesTier='Small';suppliesCost=50;}
    else if(hours<=24){suppliesTier='Medium';suppliesCost=100;}
    else if(hours<=40){suppliesTier='Large';suppliesCost=150;}
    else{suppliesTier='Very Large';suppliesCost=200;}
  }
  const materialCost=paintCost+suppliesCost+repairMaterials,laborCost=subcontractorPayout,direct=materialCost+laborCost;
  const marginFloor=direct/(1-PRICING.targetMargin);
  const hasWork=state.rooms.some(r=>r.selected&&scopeSummary(r)!=='None');
  let sale=hasWork?Math.max(marketSale,marginFloor,PRICING.minimumJob):0;
  sale=Math.ceil(sale/5)*5;
  return{sale,direct,profit:sale-direct,margin:sale?(sale-direct)/sale:0,hours,productionHours,setupCleanupHours,painterDays,painterHourly,subcontractorPayout,days:hours?Math.ceil(painterDays):0,gallons,groups:Object.values(groups),primerGroups:Object.values(primerGroups),primerGallons,primerCost,roomBreakdown,selected:state.rooms.filter(r=>r.selected&&scopeSummary(r)!=='None').length,marketSale,marginFloor,minimumJob:hasWork?PRICING.minimumJob:0,materialCost,paintCost,suppliesCost,suppliesTier,repairHours,repairMaterials,laborCost};
}
function refreshAll(){
  const c=calc(),p=state.project;
  $('homeProjectLabel').textContent=p.customerName||p.address||'No project started';
  $('homePrice').textContent=money(c.sale);
  $('statusRooms').textContent=c.selected;$('statusGallons').textContent=c.gallons;$('statusDays').textContent=c.days;$('statusMargin').textContent=Math.round(c.margin*100)+'%';
  $('salePrice').textContent=money(c.sale);$('directCost').textContent=money(c.direct);$('grossProfit').textContent=money(c.profit);$('grossMargin').textContent=Math.round(c.margin*100)+'%';
  $('laborHours').textContent=c.hours.toFixed(1);$('jobDays').textContent=c.days;$('paintGallons').textContent=c.gallons;$('selectedCount').textContent=c.selected;
  $('materialSummary').innerHTML=(c.groups.length||c.primerGroups.length)?c.groups.map(g=>`<div class="material-row"><span>${g.surface}<br><small>${g.color}${g.sw?' • '+g.sw:''}</small></span><span>${g.product}<br><small>${Math.round(g.sf)} sq ft • 2 coats • ${g.coverage} sq ft/gal</small><br><small>${g.baseGal.toFixed(2)} gal coating + 10% waste = <strong>${g.calcGal.toFixed(2)} gal required</strong></small></span><strong>Buy ${g.buyGal} gal<br><small>${money2(g.unitCost)}/gal · ${money2(g.extCost)}</small></strong></div>`).join('')+c.primerGroups.map(g=>`<div class="material-row"><span>Primer<br><small>${g.spotRooms?'Spot Prime':'Full Prime'}</small></span><span>${g.product}<br><small>${g.spotRooms?g.spotRooms+' room spot-prime allowance':Math.round(g.sf)+' sq ft • 1 coat • 400 sq ft/gal'}</small>${g.spotRooms?'':`<br><small>${g.baseGal.toFixed(2)} gal coating + 10% waste = <strong>${g.calcGal.toFixed(2)} gal required</strong></small>`}</span><strong>Buy ${g.buyGal} gal<br><small>${money2(g.unitCost)}/gal · ${money2(g.extCost)}</small></strong></div>`).join('')+'<p class="muted material-note">Finish paint: 400 sq ft/gal; 2 coats; 10% waste. Full primer: 400 sq ft/gal; 1 coat; 10% waste. Primer is only included when selected.</p>':'<p class="muted">Select rooms to calculate materials.</p>';
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
  if($('materialCostInternal'))$('materialCostInternal').textContent=money2(c.materialCost); if($('repairLaborInternal'))$('repairLaborInternal').textContent=c.repairHours.toFixed(1)+' hr'; if($('repairMaterialInternal'))$('repairMaterialInternal').textContent=money2(c.repairMaterials); if($('paintCostInternal'))$('paintCostInternal').textContent=money2(c.paintCost); if($('suppliesCostInternal'))$('suppliesCostInternal').textContent=money2(c.suppliesCost); if($('suppliesTierInternal'))$('suppliesTierInternal').textContent=c.suppliesTier;
  if($('productionBreakdown'))$('productionBreakdown').innerHTML=c.roomBreakdown.length?c.roomBreakdown.map(r=>`<div class="status-row"><span>${r.name}<small class="prod-detail">Walls ${r.walls.toFixed(1)} • Ceiling ${r.ceiling.toFixed(1)} • Base ${r.baseboards.toFixed(1)} • Doors ${r.doors.toFixed(1)} • Windows ${r.windows.toFixed(1)}${r.closets?` • Closet ${r.closets.toFixed(1)}`:''}${r.crown?` • Crown ${r.crown.toFixed(1)}`:''}${r.primer?` • Primer ${r.primer.toFixed(1)}`:''}${r.repairs?` • Repairs ${r.repairs.toFixed(1)}`:''}</small></span><strong>${r.total.toFixed(1)} hr</strong></div>`).join(''):'<p class="muted">Select rooms to see production hours.</p>';
}
[['applyWalls','wall'],['applyCeilings','ceiling'],['applyTrim','trim']].forEach(([id,k])=>{$(id).onclick=()=>{const color=$(k==='wall'?'defaultWallColor':k==='ceiling'?'defaultCeilingColor':'defaultTrimColor').value,sw=$(k==='wall'?'defaultWallSw':k==='ceiling'?'defaultCeilingSw':'defaultTrimSw').value;state.rooms.filter(r=>r.selected).forEach(r=>{r[k+'Color']=color;r[k+'Sw']=sw});save();renderColors()}});
$('newProjectBtn').onclick=()=>{if(confirm('Start a new estimate? This clears the current project on this device.')){state=fresh();save();bindProject();bindSubcontractor();renderRooms();renderColors()}};if($('printSubcontractor'))$('printSubcontractor').onclick=()=>{document.body.classList.add('print-subcontractor');renderSubcontractor();window.print();setTimeout(()=>document.body.classList.remove('print-subcontractor'),300)};window.addEventListener('afterprint',()=>document.body.classList.remove('print-subcontractor'));$('printProposal').onclick=()=>{const p=state.project||{};const missing=[];if(!String(p.customerName||'').trim())missing.push('customer name');if(!String(p.address||'').trim())missing.push('street address');if(missing.length){alert('Complete '+missing.join(' and ')+' before finalizing the proposal.');nav('project');return}window.print()};
function plural(n,one,many){return `${n} ${n===1?one:many}`}
function proposalScope(r){const q=roomQty(r),items=[];if(include(r,'walls'))items.push('Walls');if(include(r,'ceiling'))items.push('Ceiling');if(include(r,'baseboards'))items.push(`${Math.round(q.baseLf)} LF baseboards`);if(include(r,'doors'))items.push(`${plural(q.doors,'interior door','interior doors')}, ${r.doorSides==='One Side'?'one side':'both sides'}${r.doorCasing?' + casing/trim':''}`);if(include(r,'windows'))items.push(plural(q.windows,'window','windows'));if(include(r,'closets')){const parts=[];if(r.closetWalls)parts.push('walls');if(r.closetCeiling)parts.push('ceiling');if(r.closetBaseboards)parts.push('baseboards');items.push(`${r.closetType||'Reach-in'} closet — ${parts.join(', ')}`)}if(include(r,'crown'))items.push(`${Math.round(q.crownLf)} LF crown molding`);if(r.primerMode&&r.primerMode!=='None')items.push(r.primerMode+(r.primerMode==='Full Prime'?' — '+(r.primerTarget||'Walls'):''));const rep=repairCalc(r);rep.items.forEach(x=>items.push(`${x.qty} × ${x.label}`));return items.join('<br>')||'No work selected'}
function proposalPaint(r){const m=materialSettings(),lines=[];if(include(r,'walls')||(include(r,'closets')&&r.closetWalls))lines.push(`Walls: ${m.wallProduct} — ${r.wallColor||'Color TBD'}${r.wallSw?' ('+r.wallSw+')':''}`);if(include(r,'ceiling')||(include(r,'closets')&&r.closetCeiling))lines.push(`Ceiling: ${m.ceilingProduct} — ${r.ceilingColor||'Color TBD'}${r.ceilingSw?' ('+r.ceilingSw+')':''}`);if(include(r,'baseboards')||include(r,'doors')||include(r,'windows')||include(r,'crown')||(include(r,'closets')&&r.closetBaseboards))lines.push(`Trim: ${m.trimProduct} — ${r.trimColor||'Color TBD'}${r.trimSw?' ('+r.trimSw+')':''}`);if(r.primerMode&&r.primerMode!=='None')lines.push(`Primer: ${materialSettings().primerProduct} — ${r.primerMode}${r.primerMode==='Full Prime'?' ('+(r.primerTarget||'Walls')+')':''}`);return lines.join('<br>')}
function renderProposal(){const c=calc(),p=state.project,hasFieldEstimate=state.rooms.some(r=>r.selected&&(+((r.repairs||{}).largeRepair)||0)>0),rows=state.rooms.filter(r=>r.selected&&scopeSummary(r)!=='None').map(r=>`<tr><td><strong>${r.name}</strong></td><td>${proposalScope(r)}</td><td>${proposalPaint(r)}</td></tr>`).join('');const fieldWarning=hasFieldEstimate?`<div class="field-estimate-warning"><strong>IMPORTANT — LARGE DRYWALL REPAIR PRICED SEPARATELY</strong><br>Large drywall repair requires a separate field estimate and is <strong>NOT included</strong> in the investment shown below.</div>`:'';const priceNote=hasFieldEstimate?`<p class="investment-scope-note"><strong>Painting scope only.</strong> Large drywall repair priced separately.</p>`:'';$('proposalContent').innerHTML=`<h2>UrbanSkyLine Design & Build LLC</h2><p><strong>Interior Painting Proposal</strong></p><p><strong>Customer:</strong> ${p.customerName||'—'}<br><strong>Project:</strong> ${p.address||'—'} ${p.cityZip||''}<br><strong>Estimator:</strong> ${p.estimator||'—'}</p><h3>Scope of Work</h3><p>Prepare listed surfaces as needed and apply two finish coats unless specifically noted otherwise.</p><table><thead><tr><th>Room / Area</th><th>Work Included</th><th>Paint System / Color</th></tr></thead><tbody>${rows||'<tr><td colspan="3">No work selected</td></tr>'}</tbody></table>${fieldWarning}<h3>Investment</h3><p style="font-size:28px;font-weight:800">${money(c.sale)}</p>${priceNote}<p>Estimated duration: ${c.days} day${c.days===1?'':'s'} • Estimated paint purchase: ${c.gallons} gallon${c.gallons===1?'':'s'}</p><p><strong>Notes:</strong> ${p.notes||'Standard preparation and two finish coats unless otherwise specified.'}</p>`}

function subcontractorIncludedItems(r){
  const q=roomQty(r),items=[];
  if(include(r,'walls'))items.push('Walls — all walls, 2 finish coats');
  if(include(r,'ceiling'))items.push('Ceiling — 2 finish coats');
  if(include(r,'baseboards'))items.push(`Baseboards — ${Math.round(q.baseLf)} LF, 2 finish coats`);
  if(include(r,'doors'))items.push(`${plural(q.doors,'Interior door','Interior doors')} — ${r.doorSides==='One Side'?'one side':'both sides'}${r.doorCasing?' + casing/trim':''}`);
  if(include(r,'windows'))items.push(`${plural(q.windows,'Window','Windows')} — trim/casing`);
  if(include(r,'closets')){const parts=[];if(r.closetWalls)parts.push('walls');if(r.closetCeiling)parts.push('ceiling');if(r.closetBaseboards)parts.push('baseboards');items.push(`${r.closetType||'Reach-in'} closet — ${parts.join(', ')}`)}
  if(include(r,'crown'))items.push(`Crown molding — ${Math.round(q.crownLf)} LF`);
  if(r.primerMode&&r.primerMode!=='None')items.push(r.primerMode==='Spot Prime'?'Spot prime as specified':`Full prime — ${r.primerTarget||'Walls'}`);
  const rep=repairCalc(r);rep.items.forEach(x=>items.push(`${x.qty} × ${x.label}`));
  return items;
}
function subcontractorExcludedItems(r){
  const items=[];
  if(!include(r,'walls'))items.push('Walls');
  if(!include(r,'ceiling'))items.push('Ceiling');
  if(!include(r,'baseboards'))items.push('Baseboards');
  if(!include(r,'doors'))items.push('Doors / door trim');
  if(!include(r,'windows'))items.push('Windows / window trim');
  if(!include(r,'closets'))items.push('Closet');
  if(!include(r,'crown'))items.push('Crown molding');
  return items;
}
function subcontractorPaintLines(r){
  const m=materialSettings(),lines=[];
  if(include(r,'walls')||(include(r,'closets')&&r.closetWalls))lines.push(`<strong>Walls:</strong> ${m.wallProduct} · ${r.wallColor||'Color TBD'}${r.wallSw?' · '+r.wallSw:''} · Eggshell`);
  if(include(r,'ceiling')||(include(r,'closets')&&r.closetCeiling))lines.push(`<strong>Ceiling:</strong> ${m.ceilingProduct} · ${r.ceilingColor||'Color TBD'}${r.ceilingSw?' · '+r.ceilingSw:''} · Flat`);
  if(include(r,'baseboards')||include(r,'doors')||include(r,'windows')||include(r,'crown')||(include(r,'closets')&&r.closetBaseboards))lines.push(`<strong>Trim / Doors:</strong> ${m.trimProduct} · ${r.trimColor||'Color TBD'}${r.trimSw?' · '+r.trimSw:''}`);
  if(r.primerMode&&r.primerMode!=='None')lines.push(`<strong>Primer:</strong> ${m.primerProduct} · ${r.primerMode}${r.primerMode==='Full Prime'?' · '+(r.primerTarget||'Walls'):''}`);
  return lines;
}
function bindSubcontractor(){
  const sc=state.subcontractor||(state.subcontractor={name:'',startDate:'',paymentStatus:'Not Paid',datePaid:'',actualHours:'',agreedPayout:'',amountPaid:'',notes:''});
  const fields=[['subName','name'],['subStartDate','startDate'],['subPaymentStatus','paymentStatus'],['subDatePaid','datePaid'],['subActualHours','actualHours'],['subAgreedPayout','agreedPayout'],['subAmountPaid','amountPaid'],['subNotes','notes']];
  fields.forEach(([id,k])=>{const e=$(id);if(!e)return;e.value=sc[k]??'';e.oninput=()=>{sc[k]=e.value;localStorage.setItem('uslPaintApp',JSON.stringify(state));renderSubcontractor();};});
}
function renderSubcontractor(){
  bindSubcontractor();
  const c=calc(),p=state.project||{},sc=state.subcontractor||{};
  const agreed=String(sc.agreedPayout||'').trim()!==''?+sc.agreedPayout:c.subcontractorPayout;
  const actualHours=String(sc.actualHours||'').trim()!==''?+sc.actualHours:null;
  const amountPaid=+sc.amountPaid||0;
  const balance=Math.max(0,agreed-amountPaid);
  const hasFieldEstimate=state.rooms.some(r=>r.selected&&(+((r.repairs||{}).largeRepair)||0)>0);
  const rooms=state.rooms.filter(r=>r.selected&&scopeSummary(r)!=='None').map(r=>{
    const included=subcontractorIncludedItems(r),excluded=subcontractorExcludedItems(r),paint=subcontractorPaintLines(r);
    return `<div class="wo-room"><div class="wo-room-title"><h3>${r.name}</h3><span>${r.package||'Custom'}</span></div><div class="wo-columns"><div><h4>WORK INCLUDED</h4>${included.length?`<ul class="scope-checklist">${included.map(x=>`<li>${x}</li>`).join('')}</ul>`:'<p>None</p>'}</div><div><h4>NOT INCLUDED</h4>${excluded.length?`<ul class="scope-excluded">${excluded.map(x=>`<li>${x}</li>`).join('')}</ul>`:'<p>All standard room surfaces included.</p>'}</div></div>${paint.length?`<div class="wo-paint"><h4>PAINT / COLOR</h4>${paint.map(x=>`<div>${x}</div>`).join('')}</div>`:''}</div>`;
  }).join('');
  const warning=hasFieldEstimate?`<div class="field-estimate-warning"><strong>LARGE DRYWALL REPAIR — FIELD ESTIMATE REQUIRED</strong><br>This repair is outside the automatic payout calculation. Confirm scope and payout before work begins.</div>`:'';
  const payoutLabel=String(sc.agreedPayout||'').trim()!==''?'Agreed subcontractor payout':'Estimated subcontractor payout';
  const paidStatus=sc.paymentStatus||'Not Paid';
  const paidInfo=paidStatus==='Paid'?`Paid ${money(amountPaid||agreed)}${sc.datePaid?' · '+sc.datePaid:''}`:paidStatus==='Partial'?`Partial payment ${money(amountPaid)} · Balance ${money(balance)}`:`Not paid · Balance ${money(agreed)}`;
  const el=$('subcontractorContent');if(!el)return;
  el.innerHTML=`<div class="wo-header"><div><div class="eyebrow">URBANSKYLINE DESIGN &amp; BUILD, LLC</div><h2>Subcontractor Work Order &amp; Payout</h2></div><span class="private-chip">INTERNAL</span></div><div class="wo-project"><div><strong>Customer / Project</strong><br>${p.customerName||'—'}<br>${p.address||'—'} ${p.cityZip||''}</div><div><strong>Subcontractor</strong><br>${sc.name||'—'}<br>${sc.startDate?'Start: '+sc.startDate:'Start date: —'}</div></div><div class="wo-summary"><div><small>Painter-hours</small><strong>${c.hours.toFixed(1)}</strong></div><div><small>Painter-days</small><strong>${c.painterDays.toFixed(2)}</strong></div><div><small>${payoutLabel}</small><strong>${money(agreed)}</strong></div><div><small>Payment status</small><strong>${paidStatus}</strong><span>${paidInfo}</span></div></div>${warning}<div class="wo-scope-heading"><h2>Detailed Scope of Work</h2><p>Complete only the surfaces and repairs specifically listed below. Standard finish work is two coats unless noted otherwise.</p></div>${rooms||'<div class="panel"><p>No rooms selected.</p></div>'}<div class="wo-final"><div><h3>Production &amp; Payout</h3><p>Estimated painter-hours: <strong>${c.hours.toFixed(1)}</strong><br>Estimated painter-days (8 hr): <strong>${c.painterDays.toFixed(2)}</strong><br>Painter rate equivalent: <strong>${money2(c.painterHourly)}/hr</strong><br>${payoutLabel}: <strong>${money(agreed)}</strong>${actualHours!==null?`<br>Actual painter-hours: <strong>${actualHours.toFixed(1)}</strong>`:''}</p></div><div><h3>Payment</h3><p>Status: <strong>${paidStatus}</strong><br>Amount paid: <strong>${money(amountPaid)}</strong><br>Balance: <strong>${money(balance)}</strong>${sc.datePaid?`<br>Date paid: <strong>${sc.datePaid}</strong>`:''}</p></div></div>${sc.notes?`<div class="wo-notes"><h3>Job / Crew Notes</h3><p>${String(sc.notes).replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\n','<br>')}</p></div>`:''}<div class="wo-signatures"><div>Subcontractor acknowledgment / signature<br><span></span></div><div>Date<br><span></span></div></div><p class="wo-private-note">Internal work order. Customer sale price, material costs, gross profit and margin are intentionally excluded.</p>`;
}
function bindMaterialSettings(){const m=materialSettings();[['wallProduct','wallProduct'],['wallCost','wallCost'],['ceilingProduct','ceilingProduct'],['ceilingCost','ceilingCost'],['trimProduct','trimProduct'],['trimCost','trimCost'],['primerProduct','primerProduct'],['primerCost','primerCost'],['suppliesPct','suppliesPct']].forEach(([id,k])=>{const e=$(id);if(!e)return;e.value=m[k];e.oninput=()=>{m[k]=e.type==='number'?+e.value:e.value;save();}});}
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

bindProject();bindMaterialSettings();bindSubcontractor();renderRooms();renderColors();refreshAll();
