const USL_DEFAULT_SYNC_URL="https://script.google.com/macros/s/AKfycbwhX9GfXUH19Hq1OxlPZ8IXnHQmiNVOz6cySrgI6Dea0kxQv9K1NoKws3XTNmZOfCc/exec";
function validSyncUrl(u){return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/i.test(String(u||"").trim())}
(function captureMobileSetupLink(){try{const q=new URLSearchParams(location.search),api=q.get("api");if(api&&validSyncUrl(api)){localStorage.setItem("uslSyncUrl",api.trim());q.delete("api");const clean=location.pathname+(q.toString()?"?"+q.toString():"")+location.hash;history.replaceState(null,"",clean)}}catch(_){}})();
const USL_SYNC={url:localStorage.getItem("uslSyncUrl")||USL_DEFAULT_SYNC_URL};
function addressConnectionMessage(text,kind="muted"){const e=$("addressHelp");if(!e)return;e.textContent=text;e.className="address-help "+kind}
async function uslApi(action,payload={}){const u=($("syncUrl")?.value||USL_SYNC.url).trim();if(!u)throw Error("Google connection is not set up on this device.");if(!validSyncUrl(u))throw Error("Web App URL must be the Google Apps Script /exec URL.");localStorage.setItem("uslSyncUrl",u);USL_SYNC.url=u;const r=await fetch(u,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},cache:"no-store",redirect:"follow",body:JSON.stringify({action,...payload})});if(!r.ok)throw Error("Google connection returned HTTP "+r.status);const d=await r.json();if(d.error)throw Error(d.error);return d}
let uslAddressTimer;
async function uslAddressSearch(q){const box=$("addressSuggestions");if(q.trim().length<4){box.innerHTML="";addressConnectionMessage(USL_SYNC.url?"Type at least 4 characters for Google address suggestions.":"Address suggestions need Google connection on this device. Use Mobile Setup below once.");return}try{if(!USL_SYNC.url&&!($("syncUrl")?.value||"").trim()){box.innerHTML="";addressConnectionMessage("Address suggestions are not connected on this device. Paste the Apps Script /exec URL below once, or open a Mobile Setup Link.","warning");return}addressConnectionMessage("Searching Google addresses…","working");const d=await uslApi("addressAutocomplete",{input:q});const suggestions=d.suggestions||[];box.innerHTML=suggestions.map(x=>`<button type="button" data-id="${x.placeId}">${x.text}</button>`).join("");addressConnectionMessage(suggestions.length?"Select an address below.":"No matching addresses found.",suggestions.length?"success":"muted");box.querySelectorAll("button").forEach(b=>b.onclick=async()=>{try{const x=await uslApi("placeDetails",{placeId:b.dataset.id});$("address").value=x.street||x.formattedAddress;$("cityZip").value=[x.city,x.state,x.zip].filter(Boolean).join(" ");state.project.address=$("address").value;state.project.cityZip=$("cityZip").value;save();box.innerHTML="";addressConnectionMessage("Address selected from Google.","success")}catch(err){addressConnectionMessage("ADDRESS LOOKUP FAILED: "+(err.message||err),"error")}})}catch(e){addressConnectionMessage("ADDRESS SEARCH FAILED: "+(e.message||e),"error");if($("syncMessage"))$("syncMessage").textContent=e.message}}
const ROOM_PRESETS=[["Living Room",16,20,9,1450],["Master Bedroom",14,18,9,1250],["Bedroom 1",11,12,9,950],["Bedroom 2",11,13,9,950],["Bedroom 3",11,12,9,950],["Bedroom 4",11,12,9,950],["Master Bathroom",10,12,9,950],["Bathroom 1",8,10,9,750],["Bathroom 2",8,10,9,750],["Half Bath / Powder Room",5,6,9,450],["Kitchen",12,16,9,1050],["Dining Room",12,14,9,1050],["Office / Study",10,12,9,900],["Laundry Room",7,9,9,600],["Hallway / Stairs",8,12,9,900],["Entry / Foyer",8,10,9,800],["Game / Media Room",14,16,9,1200],["Custom Room 1",10,10,9,900],["Custom Room 2",10,10,9,900],["Garage",24,24,9,1800]];
function isBedroomPreset(name){return name==='Master Bedroom'||/^Bedroom [1-4]$/.test(name||'')}
function defaultClosetType(name){return name==='Master Bedroom'?'Walk-in':isBedroomPreset(name)?'Reach-in':'None'}
function applyDefaultCloset(r){if(!isBedroomPreset(r.name))return;r.closets='Yes';r.closetType=defaultClosetType(r.name);r.closetLength=r.name==='Master Bedroom'?6:(r.closetLength||6);r.closetWidth=r.name==='Master Bedroom'?8:(r.closetWidth||6);r.closetWalls=true;r.closetCeiling=true;r.closetBaseboards=true;if(!r.closetOverride)r.closetOverride='auto'}
const fresh=()=>({pricing:{targetMargin:0.40},cabinets:[],materialSettings:{wallProduct:"ProMar 200 Zero VOC Interior Latex",wallCost:43.30,ceilingProduct:"Premium Ceiling Paint",ceilingCost:37.45,trimProduct:"Emerald Urethane Trim Enamel",trimCost:75.01,primerProduct:"ProBlock Premium All-Purpose Water-Based Interior/Exterior Primer",primerCost:27.95,suppliesPct:0},project:{customerName:"",phone:"",email:"",address:"",cityZip:"",estimator:"Roberto Diaz",projectType:"Interior Painting",wallCondition:"Good",notes:"",photoProjectId:"p_"+Date.now()+"_"+Math.random().toString(36).slice(2,8)},subcontractor:{name:"",startDate:"",paymentStatus:"Not Paid",datePaid:"",actualHours:"",agreedPayout:"",amountPaid:"",notes:""},rooms:ROOM_PRESETS.map(r=>({name:r[0],length:r[1],width:r[2],height:r[3],price:r[4],selected:false,package:"Full Room",walls:"Auto",ceiling:"Auto",trim:"Auto",baseboards:"Auto",doors:"Auto",windows:"Auto",closets:isBedroomPreset(r[0])?"Yes":"No",crown:"Auto",crownPresent:true,doorCount:1,doorSides:"Both Sides",doorCasing:false,windowCount:1,closetWallSf:0,closetType:defaultClosetType(r[0]),closetOverride:isBedroomPreset(r[0])?"auto":"none",closetLength:6,closetWidth:r[0]==="Master Bedroom"?8:6,closetWalls:true,closetCeiling:true,closetBaseboards:true,crownLf:0,wallColor:"Main Wall Color",wallSw:"",ceilingColor:"Ceiling White",ceilingSw:"",trimColor:"Trim White",trimSw:"",primerMode:"None",primerTarget:"Walls",repairs:{smallHole:0,mediumPatch:0,largeRepair:0,crackPatch:0,textureRepair:0,extensiveCaulk:0,stainPrep:0,wallpaperRemoval:0,customQty:0,customDescription:"Custom Extra",customHours:0,customMaterials:0}}))});
let state;try{state=JSON.parse(localStorage.getItem("uslPaintApp"))||fresh()}catch(e){state=fresh()}if(!state.pricing)state.pricing={targetMargin:0.40};if(!(state.pricing.targetMargin>=0.20&&state.pricing.targetMargin<0.90))state.pricing.targetMargin=0.40;if(!state.subcontractor)state.subcontractor={name:"",startDate:"",paymentStatus:"Not Paid",datePaid:"",actualHours:"",agreedPayout:"",amountPaid:"",notes:""};if(!state.workflow)state.workflow={mode:"estimate",estimateStatus:"Draft",projectStatus:"Not Started",approvedAt:"",approvedSnapshot:null,changeOrders:[]};if(!Array.isArray(state.workflow.changeOrders))state.workflow.changeOrders=[];if(!state.workflow.approvalSignature)state.workflow.approvalSignature=null;if(!state.subcontractor.signature)state.subcontractor.signature=null;if(!state.subcontractor.signedAt)state.subcontractor.signedAt='';if(!state.subcontractor.signedName)state.subcontractor.signedName='';if(!Array.isArray(state.cabinets))state.cabinets=[];if(!state.project.photoProjectId){state.project.photoProjectId="p_"+Date.now()+"_"+Math.random().toString(36).slice(2,8);localStorage.setItem("uslPaintApp",JSON.stringify(state));}
const HISTORY_KEY="uslPaintHistory";
function loadHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY))||[]}catch(e){return []}}
function saveHistory(items){localStorage.setItem(HISTORY_KEY,JSON.stringify(items))}
function stateForArchive(src){return JSON.parse(JSON.stringify(src))}
function archiveCurrentProject(){
  const w=state.workflow||{}; if(!(w.mode==='project'&&w.approvedSnapshot))return null;
  const snap=w.approvedSnapshot,t=snap.totals||{}, id=snap.archiveId||('job_'+Date.now()+'_'+Math.random().toString(36).slice(2,7));
  snap.archiveId=id;
  const item={id,customerName:snap.project?.customerName||state.project?.customerName||'Unnamed Project',address:snap.project?.address||state.project?.address||'',approvedAt:w.approvedAt||snap.capturedAt||new Date().toISOString(),contract:Number(t.sale||0),status:w.projectStatus||'Approved',savedAt:new Date().toISOString(),state:stateForArchive(state)};
  let items=loadHistory(); const i=items.findIndex(x=>x.id===id); if(i>=0)items[i]=item; else items.unshift(item); saveHistory(items); return id;
}
function startNewEstimate(){
  const isProject=state.workflow?.mode==='project'&&state.workflow?.approvedSnapshot;
  const msg=isProject?'Save this approved project to Project History and start a new estimate?':'Start a new estimate? Current unsaved estimate information will be cleared.';
  if(!confirm(msg))return;
  if(isProject)archiveCurrentProject();
  state=fresh(); localStorage.setItem('uslPaintApp',JSON.stringify(state)); bindProject();bindPhotoInputs();bindSubcontractor();renderRooms();renderCabinets();renderColors();refreshAll();nav('project');
}
function openHistoryProject(id){
  const item=loadHistory().find(x=>x.id===id); if(!item||!item.state)return;
  if(state.workflow?.mode==='project'&&state.workflow?.approvedSnapshot)archiveCurrentProject();
  state=stateForArchive(item.state); localStorage.setItem('uslPaintApp',JSON.stringify(state)); bindProject();bindPhotoInputs();bindSubcontractor();renderRooms();renderCabinets();renderColors();refreshAll();nav('execution');
}
function renderHistory(){
  const el=$('historyList'); if(!el)return; const items=loadHistory();
  if(!items.length){el.innerHTML='<p class="muted">No saved projects yet. Approved projects will appear here when you start a new estimate.</p>';return;}
  el.innerHTML=items.map(x=>`<button class="history-item" type="button" data-history-id="${x.id}"><span><strong>${x.customerName}</strong><small>${x.address||'No address'} · ${new Date(x.approvedAt).toLocaleDateString()}</small></span><span><strong>${money(x.contract)}</strong><small>${x.status}</small></span></button>`).join('');
  el.querySelectorAll('[data-history-id]').forEach(b=>b.onclick=()=>openHistoryProject(b.dataset.historyId));
}
const $=id=>document.getElementById(id),money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n||0),money2=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(n||0),esc=s=>String(s||"").replaceAll('"','&quot;');function save(){localStorage.setItem("uslPaintApp",JSON.stringify(state));showSaved();refreshAll()}
function showSaved(){const e=$("savedIndicator");if(!e)return;e.textContent="Saved ✓";e.classList.add("visible");clearTimeout(window.__savedTimer);window.__savedTimer=setTimeout(()=>e.classList.remove("visible"),1800)}

function formatUsPhone(v){const d=String(v||'').replace(/\D/g,'').slice(0,10);if(d.length<=3)return d;if(d.length<=6)return d.slice(0,3)+'-'+d.slice(3);return d.slice(0,3)+'-'+d.slice(3,6)+'-'+d.slice(6)}
function bindPhoneFormatting(){const e=$('phone');if(!e)return;const apply=()=>{const formatted=formatUsPhone(e.value);if(e.value!==formatted)e.value=formatted;state.project.phone=formatted;localStorage.setItem('uslPaintApp',JSON.stringify(state));showSaved()};e.value=formatUsPhone(state.project.phone||e.value);state.project.phone=e.value;e.oninput=apply;e.onchange=apply;e.onblur=apply}
function duplicateRoom(i){const src=state.rooms[i];if(!src)return;const copy=JSON.parse(JSON.stringify(src));copy.name=src.name+' Copy';copy.selected=true;state.rooms.splice(i+1,0,copy);save();renderRooms();renderColors()}
function estimateAudit(){const issues=[],warnings=[];if(!String(state.project.customerName||'').trim())issues.push('Customer name is missing.');if(!String(state.project.address||'').trim())issues.push('Project address is missing.');const digits=String(state.project.phone||'').replace(/\D/g,'');if(digits.length!==10)warnings.push('Customer phone should contain 10 digits.');const selected=state.rooms.filter(r=>r.selected);if(!selected.length && !(state.cabinets||[]).length)issues.push('No rooms or cabinet work selected.');selected.forEach(r=>{if(!(Number(r.length)>0&&Number(r.width)>0&&Number(r.height)>0))issues.push(r.name+': measurements are incomplete.');if(r.repairs&&Number(r.repairs.largeRepair||0)>0)warnings.push(r.name+': large drywall repair requires a field estimate.');});const c=calc();if(!(c.sale>0))issues.push('Estimate price is $0.');if(Number(state.pricing?.targetMargin||.4)<.4)warnings.push('Courtesy Project Credit is active because margin is below the 40% standard target.');const all=[...issues,...warnings];alert(all.length?('ESTIMATE AUDIT\n\n'+issues.map(x=>'❌ '+x).concat(warnings.map(x=>'⚠️ '+x)).join('\n')+'\n\n'+(issues.length?'Fix required items before customer approval.':'Ready to review with customer.')):'ESTIMATE AUDIT\n\n✓ Ready to review with customer.');return !issues.length}
function toggleCustomerView(){document.body.classList.toggle('customer-view');const on=document.body.classList.contains('customer-view');const b=$('customerViewBtn');if(b)b.textContent=on?'Exit Customer View':'Customer View';if(on)nav(isApprovedProject()?'currentcontract':'proposal')}

function isApprovedProject(){return state.workflow?.mode==='project'&&!!state.workflow?.approvedSnapshot}
function approvedChangeOrders(){return (state.workflow?.changeOrders||[]).filter(x=>x.status==='Approved')}
function changeOrderNet(){return approvedChangeOrders().reduce((sum,x)=>sum+(x.type==='deduct'?-1:1)*Number(x.amount||0),0)}
function currentContractTotal(){const base=Number(state.workflow?.approvedSnapshot?.totals?.sale||0);return base+changeOrderNet()}
function currentProjectMetrics(){
  const s=state.workflow?.approvedSnapshot,t=s?.totals||{},approved=approvedChangeOrders();
  let hours=Math.max(0,Number(t.hours||0)),gallons=Math.max(0,Number(t.gallons||0));
  const areas=new Set((s?.rooms||[]).filter(r=>r.selected&&scopeSummary(r)!=='None').map(r=>r.name));
  approved.forEach(co=>{
    const sign=co.type==='deduct'?-1:1;
    hours+=sign*Math.max(0,Number(co.hours||0));
    if(sign>0&&co.area)areas.add(co.area);
    try{
      let r=coRoomTemplate(co.area||'Custom Area');
      r.length=Math.max(1,Number(co.length||r.length||10));
      r.width=Math.max(1,Number(co.width||r.width||10));
      r.height=Math.max(6,Number(co.height||r.height||9));
      r.doorCount=Math.max(0,Math.round(Number(co.doorCount||0)));
      r.windowCount=Math.max(0,Math.round(Number(co.windowCount||0)));
      const scopes=Array.isArray(co.scopes)&&co.scopes.length?co.scopes:(co.scope==='Full Room'?['Full Room']:String(co.scope||'').split(' + ').map(x=>({'Walls':'Walls Only','Ceiling':'Ceiling Only','Baseboards':'Baseboards Only','Doors':'Doors Only','Windows':'Windows Only','Crown':'Crown Only'}[x]||x)).filter(Boolean));
      r=applyCoScopes(r,scopes.length?scopes:['Full Room']);normalizeRoom(r);
      const originalRooms=state.rooms;let cc;
      try{state.rooms=[r];cc=calc();}finally{state.rooms=originalRooms}
      gallons+=sign*Math.max(0,Number(cc?.gallons||0));
    }catch(e){}
  });
  hours=Math.max(0,hours);gallons=Math.max(0,Math.round(gallons));
  return {areas:areas.size,gallons,hours,painterDays:hours/8,currentContract:currentContractTotal(),status:state.workflow?.projectStatus||'Approved'};
}
function nav(v){
  if(isApprovedProject()&&['rooms','colors','estimate','materials'].includes(v)){
    alert('This estimate is approved and locked. Any scope or price change must be created as a Change Order.');
    v='changeorders';
  }
  document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.dataset.view===v));window.scrollTo(0,0);if(v==='proposal'){if(isApprovedProject()&&state.workflow.approvedSnapshot?.proposalHTML&&$('proposalContent'))$('proposalContent').innerHTML=state.workflow.approvedSnapshot.proposalHTML;else renderProposal()}if(v==='subcontractor')renderSubcontractor();if(v==='execution')renderExecution();if(v==='history')renderHistory();if(v==='changeorders')renderChangeOrders();if(v==='currentcontract')renderCurrentContractSummary()}document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)nav(b.dataset.go)});

const PHOTO_DB_NAME="uslPaintPhotoDB",PHOTO_STORE="photos",PHOTO_LIMIT=12;
function photoDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(PHOTO_DB_NAME,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(PHOTO_STORE)){const st=db.createObjectStore(PHOTO_STORE,{keyPath:"id"});st.createIndex("projectId","projectId",{unique:false})}};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function getProjectPhotos(){const db=await photoDb();return new Promise((resolve,reject)=>{const tx=db.transaction(PHOTO_STORE,"readonly"),st=tx.objectStore(PHOTO_STORE),idx=st.index("projectId"),r=idx.getAll(state.project.photoProjectId);r.onsuccess=()=>resolve((r.result||[]).sort((a,b)=>a.created-b.created));r.onerror=()=>reject(r.error)})}
async function addPhotoRecord(rec){const db=await photoDb();return new Promise((resolve,reject)=>{const tx=db.transaction(PHOTO_STORE,"readwrite");tx.objectStore(PHOTO_STORE).put(rec);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
async function deletePhotoRecord(id){const db=await photoDb();return new Promise((resolve,reject)=>{const tx=db.transaction(PHOTO_STORE,"readwrite");tx.objectStore(PHOTO_STORE).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
function compressPhoto(file){return new Promise((resolve,reject)=>{const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{try{const max=1600,scale=Math.min(1,max/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale)),c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);c.toBlob(blob=>{URL.revokeObjectURL(url);blob?resolve(blob):reject(new Error('Could not process photo'))},'image/jpeg',0.78)}catch(e){URL.revokeObjectURL(url);reject(e)}};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Could not read photo'))};img.src=url})}
async function renderProjectPhotos(){const grid=$('projectPhotoGrid'),msg=$('photoMessage');if(!grid)return;try{const photos=await getProjectPhotos();grid.innerHTML='';msg.textContent=photos.length?`${photos.length} photo${photos.length===1?'':'s'} saved on this device.`:'No photos added.';photos.forEach(ph=>{const url=URL.createObjectURL(ph.blob),card=document.createElement('div');card.className='photo-card';card.innerHTML=`<img alt="Estimate photo"><button type="button" class="photo-remove">Remove</button>`;card.querySelector('img').src=url;card.querySelector('img').onload=()=>URL.revokeObjectURL(url);card.querySelector('.photo-remove').onclick=async()=>{await deletePhotoRecord(ph.id);renderProjectPhotos()};grid.appendChild(card)})}catch(e){msg.textContent='Photos are unavailable on this browser: '+(e.message||e)}}
async function handlePhotoFiles(files){const msg=$('photoMessage');if(!files||!files.length)return;try{const current=await getProjectPhotos(),slots=Math.max(0,PHOTO_LIMIT-current.length);if(!slots){msg.textContent=`Photo limit reached (${PHOTO_LIMIT}). Remove a photo before adding another.`;return}const chosen=[...files].slice(0,slots);msg.textContent='Processing photos…';for(const f of chosen){if(!f.type.startsWith('image/'))continue;const blob=await compressPhoto(f);await addPhotoRecord({id:'ph_'+Date.now()+'_'+Math.random().toString(36).slice(2),projectId:state.project.photoProjectId,created:Date.now(),name:f.name||'Job photo',blob})}await renderProjectPhotos();if(files.length>slots)msg.textContent+=` Limit is ${PHOTO_LIMIT} photos per project.`}catch(e){msg.textContent='Could not save photo: '+(e.message||e)}}
function bindPhotoInputs(){const take=$('takePhotoInput'),upload=$('uploadPhotoInput');if(take)take.onchange=async()=>{await handlePhotoFiles(take.files);take.value=''};if(upload)upload.onchange=async()=>{await handlePhotoFiles(upload.files);upload.value=''};renderProjectPhotos()}

function bindProject(){Object.keys(state.project).forEach(k=>{const e=$(k);if(e){e.value=k==='phone'?formatUsPhone(state.project[k]||''):(state.project[k]||'');if(k==='phone'){state.project.phone=e.value;e.oninput=()=>{const formatted=formatUsPhone(e.value);if(e.value!==formatted)e.value=formatted;state.project.phone=formatted;localStorage.setItem('uslPaintApp',JSON.stringify(state));showSaved()};e.onchange=e.oninput;e.onblur=e.oninput}else{e.oninput=()=>{state.project[k]=e.value;save()}}}});const saveBtn=document.querySelector('.save');if(saveBtn)saveBtn.onclick=()=>{state.project.phone=formatUsPhone(state.project.phone||$('phone')?.value||'');if($('phone'))$('phone').value=state.project.phone;save();nav('home')}}
const expandedRooms=new Set();
const expandedRepairs=new Set();
function normalizeRoom(r){
  ['baseboards','doors','windows'].forEach(k=>{if(r[k]===undefined)r[k]='Auto'});
  ['closets','crown'].forEach(k=>{if(r[k]===undefined)r[k]='No'});
  if(r.doorCount===undefined)r.doorCount=1;if(!r.doorSides)r.doorSides='Both Sides';if(r.doorCasing===undefined)r.doorCasing=false;if(r.windowCount===undefined)r.windowCount=1;if(r.crownLf===undefined)r.crownLf=0;if(r.crownPresent===undefined)r.crownPresent=true;
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
  if(p==='Full Room'){r.walls='Auto';r.ceiling='Auto';r.baseboards='Auto';r.doors='Auto';r.windows='Auto';r.crown='Auto';r.crownPresent=true;if(!(+r.crownLf>0))r.crownLf=2*(Math.max(0,+r.length||0)+Math.max(0,+r.width||0));if(isBedroomPreset(r.name))applyDefaultCloset(r);else r.closets='No'}
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
  ${r.package==='Full Room'?`<div class="crown-presence-box"><div class="mini-title">CROWN MOLDING</div><p class="muted">Full Room includes crown molding when present.</p><div class="segmented"><button type="button" class="${r.crownPresent!==false?'active':''}" data-crown-present="yes" data-i="${i}">Crown Present</button><button type="button" class="${r.crownPresent===false?'active':''}" data-crown-present="no" data-i="${i}">No Crown</button></div></div>`:''}
  <div class="primer-box"><div class="mini-title">PRIMER</div><div class="segmented primer-modes">${['None','Spot Prime','Full Prime'].map(x=>`<button type="button" class="${r.primerMode===x?'active':''}" data-primer-mode="${x}" data-i="${i}">${x}</button>`).join('')}</div>${r.primerMode==='Full Prime'?`<div class="mini-title">PRIME SURFACES</div><div class="segmented primer-targets">${['Walls','Ceiling','Walls + Ceiling'].map(x=>`<button type="button" class="${r.primerTarget===x?'active':''}" data-primer-target="${x}" data-i="${i}">${x}</button>`).join('')}</div>`:r.primerMode==='Spot Prime'?`<p class="muted">Spot-prime allowance: 0.5 painter-hour and up to 1 gallon purchased for this room.</p>`:''}</div>
  ${repairsEditor(i,r)}
  ${include(r,'doors')?`${qtyStepper(i,'doorCount',q.doors,'Doors')}<div class="door-options"><div class="mini-title">DOOR PAINTING</div><div class="segmented"><button type="button" class="${r.doorSides==='Both Sides'?'active':''}" data-door-sides="Both Sides" data-i="${i}">Both Sides</button><button type="button" class="${r.doorSides==='One Side'?'active':''}" data-door-sides="One Side" data-i="${i}">One Side</button></div><button type="button" class="scope-chip ${r.doorCasing?'active':''}" data-bool="doorCasing" data-i="${i}">Include Door Casing / Trim</button></div>`:''}${include(r,'windows')?qtyStepper(i,'windowCount',q.windows,'Windows'):''}${include(r,'crown')?`<label class="single-field">Crown molding LF<input type="number" min="0" max="1000" step="1" data-i="${i}" data-k="crownLf" value="${Math.round(q.crownLf)}"><small>Defaults to the room perimeter; edit if the actual crown length is different.</small></label>`:''}${closetEditor(i,r)}
  <details class="calc-details"><summary>View calculations</summary><div>Room walls: <strong>${Math.round(q.wallSf)} SF</strong> • Ceiling: <strong>${Math.round(q.ceilingSf)} SF</strong> • Baseboards: <strong>${Math.round(q.baseLf)} LF</strong></div>${include(r,'closets')?`<div>Closet walls: <strong>${Math.round(q.closetWallSf)} SF</strong> • Closet ceiling: <strong>${Math.round(q.closetCeilingSf)} SF</strong> • Closet baseboards: <strong>${Math.round(q.closetBaseLf)} LF</strong></div>`:''}<div>Paintable totals: <strong>${Math.round(q.includedWallSf)} wall SF</strong> • <strong>${Math.round(q.includedCeilingSf)} ceiling SF</strong> • <strong>${Math.round(q.includedTrimEqSf)} trim-equivalent SF</strong></div></details></div>`:(r.selected?`<div class="compact-scope">${summary}${include(r,'closets')?` • ${r.closetType||'Reach-in'} closet`:''}</div>`:'')}`;
  w.appendChild(d)});
  w.querySelectorAll('.room-toggle').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;state.rooms[i].selected=!state.rooms[i].selected;if(state.rooms[i].selected)expandedRooms.add(i);else expandedRooms.delete(i);save();renderRooms();renderColors()});
  w.querySelectorAll('[data-duplicate]').forEach(b=>b.onclick=()=>duplicateRoom(+b.dataset.duplicate));
  w.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{const i=+b.dataset.edit;expandedRooms.has(i)?expandedRooms.delete(i):expandedRooms.add(i);renderRooms()});
  w.querySelectorAll('[data-package]').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;setPackage(state.rooms[i],b.dataset.package);save();renderRooms();renderColors()});
  w.querySelectorAll('[data-scope]').forEach(b=>b.onclick=()=>{const r=state.rooms[+b.dataset.i],k=b.dataset.scope;r[k]=include(r,k)?'No':'Yes';if(k==='closets'&&r[k]==='Yes'){if(r.closetType==='None'||!r.closetType)r.closetType=defaultClosetType(r.name)==='None'?'Reach-in':defaultClosetType(r.name);r.closetOverride='manual'}if(k==='closets'&&r[k]==='No')r.closetOverride='none';if(k==='crown'&&r[k]==='Yes'&&!(+r.crownLf>0)){r.crownLf=2*(Math.max(0,+r.length||0)+Math.max(0,+r.width||0))}save();renderRooms();renderColors()});
  w.querySelectorAll('[data-crown-present]').forEach(b=>b.onclick=()=>{const r=state.rooms[+b.dataset.i];r.crownPresent=b.dataset.crownPresent==='yes';r.crown=r.crownPresent?'Auto':'No';if(r.crownPresent&&!(+r.crownLf>0))r.crownLf=2*(Math.max(0,+r.length||0)+Math.max(0,+r.width||0));save();renderRooms();renderColors()});
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
function roomQty(r){const L=Math.max(0,+r.length||0),W=Math.max(0,+r.width||0),H=Math.max(0,+r.height||0),wallSf=2*(L+W)*H,ceilingSf=L*W,baseLf=2*(L+W),doors=Math.max(0,+r.doorCount||0),windows=Math.max(0,+r.windowCount||0),crownLf=(Math.max(0,+r.crownLf||0)||(include(r,'crown')?2*(L+W):0)),cq=closetQty(r),closetWallSf=r.closetWalls?cq.wallSf:0,closetCeilingSf=r.closetCeiling?cq.ceilingSf:0,closetBaseLf=r.closetBaseboards?cq.baseLf:0;return{wallSf,ceilingSf,baseLf,doors,windows,crownLf,closetWallSf,closetCeilingSf,closetBaseLf,closetSf:closetWallSf,includedWallSf:(include(r,'walls')?wallSf:0)+(include(r,'closets')?closetWallSf:0),includedCeilingSf:(include(r,'ceiling')?ceilingSf:0)+(include(r,'closets')?closetCeilingSf:0),includedTrimEqSf:(include(r,'baseboards')?baseLf*.5:0)+(include(r,'doors')?doors*(r.doorSides==='One Side'?20:40)+(r.doorCasing?doors*12:0):0)+(include(r,'windows')?windows*15:0)+(include(r,'crown')?crownLf*.5:0)+(include(r,'closets')?closetBaseLf*.5:0)}}

const CABINET_DEFAULTS={area:'Kitchen Cabinets',doors:20,drawers:8,boxLf:20,endPanels:2,interiorLf:0,condition:'Good',hardware:true,grainFill:false,color:'Cabinet Color',sw:'',selected:true};
const CABINET_PRODUCTION={door:1.25,drawer:0.65,boxLf:0.45,endPanel:0.50,interiorLf:0.75,hardwarePiece:0.08};
const CABINET_EQSF={door:18,drawer:6,boxLf:10,endPanel:8,interiorLf:18};
function normalizeCabinet(c){Object.entries(CABINET_DEFAULTS).forEach(([k,v])=>{if(c[k]===undefined)c[k]=v});return c}
function addCabinet(area='Kitchen Cabinets'){state.cabinets=state.cabinets||[];state.cabinets.push({...CABINET_DEFAULTS,area});save();renderCabinets();refreshAll()}
function cabinetCalc(c){normalizeCabinet(c);const doors=Math.max(0,+c.doors||0),drawers=Math.max(0,+c.drawers||0),boxLf=Math.max(0,+c.boxLf||0),ends=Math.max(0,+c.endPanels||0),interiorLf=Math.max(0,+c.interiorLf||0);const pieces=doors+drawers;let base=doors*CABINET_PRODUCTION.door+drawers*CABINET_PRODUCTION.drawer+boxLf*CABINET_PRODUCTION.boxLf+ends*CABINET_PRODUCTION.endPanel+interiorLf*CABINET_PRODUCTION.interiorLf+(c.hardware?pieces*CABINET_PRODUCTION.hardwarePiece:0);const mult={Good:1,Moderate:1.15,'Heavy Prep':1.35,'Peeling / Chipping':1.55}[c.condition]||1;if(c.grainFill)base+=pieces*0.25;const hours=base*mult;const sf=doors*CABINET_EQSF.door+drawers*CABINET_EQSF.drawer+boxLf*CABINET_EQSF.boxLf+ends*CABINET_EQSF.endPanel+interiorLf*CABINET_EQSF.interiorLf;const finishBaseGal=sf*2/COVERAGE_DEFAULT,finishRequiredGal=finishBaseGal*(1+PRICING.wastePct),primerBaseGal=sf/COVERAGE_DEFAULT,primerRequiredGal=primerBaseGal*(1+PRICING.wastePct);const finishGal=Math.ceil(finishRequiredGal-1e-9);const primerGal=Math.ceil(primerRequiredGal-1e-9);const m=materialSettings(),paintCost=finishGal*m.trimCost+primerGal*m.primerCost;return{hours,sf,finishBaseGal,finishRequiredGal,primerBaseGal,primerRequiredGal,finishGal,primerGal,paintCost,doors,drawers,boxLf,ends,interiorLf}}
function cabinetScopeText(c){const a=[];if(+c.doors)a.push(`${c.doors} doors`);if(+c.drawers)a.push(`${c.drawers} drawer fronts`);if(+c.boxLf)a.push(`${c.boxLf} LF boxes/frames`);if(+c.endPanels)a.push(`${c.endPanels} end panels`);if(+c.interiorLf)a.push(`${c.interiorLf} LF interiors`);return a.join(' • ')||'Cabinet painting'}
function renderCabinets(){const w=$('cabinetList');if(!w)return;state.cabinets=state.cabinets||[];w.innerHTML=state.cabinets.length?state.cabinets.map((c,i)=>{normalizeCabinet(c);const q=cabinetCalc(c);return `<div class="panel cabinet-card"><div class="panel-heading"><div><h3>${esc(c.area)}</h3><p class="muted">${cabinetScopeText(c)}</p></div><button class="danger cabinet-remove" type="button" data-cab-remove="${i}">Remove</button></div><div class="form-grid"><label>Cabinet Area<select data-cab-i="${i}" data-cab-k="area"><option>Kitchen Cabinets</option><option>Bathroom Vanity</option><option>Laundry Cabinets</option><option>Built-ins</option><option>Custom Cabinets</option></select></label><label>Condition / Prep<select data-cab-i="${i}" data-cab-k="condition"><option>Good</option><option>Moderate</option><option>Heavy Prep</option><option>Peeling / Chipping</option></select></label><label>Doors<input type="number" min="0" step="1" inputmode="numeric" data-cab-i="${i}" data-cab-k="doors" value="${c.doors}"></label><label>Drawer Fronts<input type="number" min="0" step="1" inputmode="numeric" data-cab-i="${i}" data-cab-k="drawers" value="${c.drawers}"></label><label>Cabinet Boxes / Frames (LF)<input type="number" min="0" step="1" inputmode="decimal" data-cab-i="${i}" data-cab-k="boxLf" value="${c.boxLf}"></label><label>End Panels<input type="number" min="0" step="1" inputmode="numeric" data-cab-i="${i}" data-cab-k="endPanels" value="${c.endPanels}"></label></div><details class="calc-details"><summary>Advanced cabinet options</summary><div class="form-grid"><label>Interior Cabinet Surfaces (LF)<input type="number" min="0" step="1" inputmode="decimal" data-cab-i="${i}" data-cab-k="interiorLf" value="${c.interiorLf}"></label><label>Cabinet Color<input data-cab-i="${i}" data-cab-k="color" value="${esc(c.color)}"></label><label>SW #<input data-cab-i="${i}" data-cab-k="sw" value="${esc(c.sw)}"></label></div><div class="segmented"><button type="button" data-cab-bool="hardware" data-cab-i="${i}" class="${c.hardware?'active':''}">Hardware Remove / Reinstall</button><button type="button" data-cab-bool="grainFill" data-cab-i="${i}" class="${c.grainFill?'active':''}">Wood Grain Filling</button></div></details><div class="cabinet-preview"><strong>${q.hours.toFixed(1)} production hr</strong><span>${q.finishGal} gal finish + ${q.primerGal} gal primer</span></div></div>`}).join(''):'<div class="panel compact"><p class="muted">No cabinet painting added. Add a kitchen, vanity, laundry cabinet, built-in, or custom cabinet scope.</p></div>';
 w.querySelectorAll('[data-cab-i][data-cab-k]').forEach(e=>{const i=+e.dataset.cabI,k=e.dataset.cabK;if(e.tagName==='SELECT')e.value=state.cabinets[i][k];e.onchange=()=>{state.cabinets[i][k]=e.type==='number'?Math.max(0,+e.value||0):e.value;save();renderCabinets();refreshAll()}});w.querySelectorAll('[data-cab-bool]').forEach(b=>b.onclick=()=>{const c=state.cabinets[+b.dataset.cabI];c[b.dataset.cabBool]=!c[b.dataset.cabBool];save();renderCabinets();refreshAll()});w.querySelectorAll('[data-cab-remove]').forEach(b=>b.onclick=()=>{state.cabinets.splice(+b.dataset.cabRemove,1);save();renderCabinets();refreshAll()});}

function renderColors(){const w=$('colorList');w.innerHTML='';state.rooms.filter(r=>r.selected).forEach(r=>{const i=state.rooms.indexOf(r),d=document.createElement('div');d.className='color-card';d.innerHTML=`<strong>${r.name}</strong><div class="form-grid" style="margin-top:10px"><label>Wall Color<input data-i="${i}" data-k="wallColor" value="${esc(r.wallColor)}"></label><label>SW #<input data-i="${i}" data-k="wallSw" value="${esc(r.wallSw)}"></label><label>Ceiling Color<input data-i="${i}" data-k="ceilingColor" value="${esc(r.ceilingColor)}"></label><label>SW #<input data-i="${i}" data-k="ceilingSw" value="${esc(r.ceilingSw)}"></label><label>Trim Color<input data-i="${i}" data-k="trimColor" value="${esc(r.trimColor)}"></label><label>SW #<input data-i="${i}" data-k="trimSw" value="${esc(r.trimSw)}"></label></div>`;w.appendChild(d)});w.querySelectorAll('input').forEach(e=>e.oninput=()=>{state.rooms[+e.dataset.i][e.dataset.k]=e.value;save()})}
function include(r,s){if(!r.selected)return false;if(s==='walls'){const v=r.walls||'Auto';if(v==='Yes')return true;if(v==='No')return false;return r.package==='Full Room'||r.package==='Walls Only'}if(s==='trim')return include(r,'baseboards')||include(r,'doors')||include(r,'windows')||include(r,'crown');const v=r[s]===undefined?'Auto':r[s];if(v==='Yes')return true;if(v==='No')return false;if(s==='crown'&&r.package==='Full Room')return r.crownPresent!==false;if(s==='ceiling'||s==='baseboards'||s==='doors'||s==='windows')return r.package==='Full Room';return false}
const PRICING={minimumJob:250,painterDayRate:300,hoursPerDay:8,setupCleanupPct:0.15,wastePct:0.10};
function targetMargin(){const m=+(state.pricing?.targetMargin??0.40);return Math.min(0.89,Math.max(0.20,m))}
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
  const full={...r,selected:true,package:'Full Room',walls:'Auto',ceiling:'Auto',baseboards:'Auto',doors:'Auto',windows:'Auto',crown:'Auto',crownPresent:true};
  if(isBedroomPreset(r.name)){full.closets='Yes';if(!full.closetType||full.closetType==='None')full.closetType=defaultClosetType(r.name)}else full.closets='No';
  const fq=roomQty(full),fh=componentHours(full,fq), fullHours=fh.walls+fh.closets+fh.ceiling+fh.baseboards+fh.doors+fh.windows+fh.crown;
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
  // Specialized cabinet painting module: prep + doors/drawers/boxes + primer + two finish coats.
  let cabinetHours=0,cabinetPaintCost=0,cabinetFinishGallons=0,cabinetPrimerGallons=0;
  (state.cabinets||[]).forEach(cab=>{if(cab.selected===false)return;const q=cabinetCalc(cab);if(q.hours<=0)return;cabinetHours+=q.hours;cabinetPaintCost+=q.paintCost;cabinetFinishGallons+=q.finishGal;cabinetPrimerGallons+=q.primerGal;roomBreakdown.push({name:cab.area,total:q.hours,primer:0,repairs:0,walls:0,closets:0,ceiling:0,baseboards:0,doors:q.hours,windows:0,crown:0,cabinet:true});});
  productionHours+=cabinetHours;
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
  gallons+=cabinetFinishGallons+cabinetPrimerGallons;
  const finishPaintCost=Object.values(groups).reduce((sum,g)=>sum+g.extCost,0);const paintCost=finishPaintCost+primerCost+cabinetPaintCost;
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
  const selectedMargin=targetMargin();
  const marginFloor=direct/(1-selectedMargin);
  const standardTargetMargin=0.40;
  const standardMarginFloor=direct/(1-standardTargetMargin);
  const hasWork=state.rooms.some(r=>r.selected&&scopeSummary(r)!=='None')||(state.cabinets||[]).some(c=>c.selected!==false&&cabinetCalc(c).hours>0);
  let sale=hasWork?Math.max(marketSale,marginFloor,PRICING.minimumJob):0;
  sale=Math.ceil(sale/5)*5;
  let standardInvestment=hasWork?Math.max(marketSale,standardMarginFloor,PRICING.minimumJob):0;
  standardInvestment=Math.ceil(standardInvestment/5)*5;
  const courtesyCredit=selectedMargin<standardTargetMargin?Math.max(0,standardInvestment-sale):0;
  return{sale,direct,profit:sale-direct,margin:sale?(sale-direct)/sale:0,targetMargin:selectedMargin,standardTargetMargin,standardMarginFloor,standardInvestment,courtesyCredit,hours,productionHours,setupCleanupHours,painterDays,painterHourly,subcontractorPayout,days:hours?Math.ceil(painterDays):0,gallons,groups:Object.values(groups),primerGroups:Object.values(primerGroups),primerGallons,primerCost,roomBreakdown,selected:state.rooms.filter(r=>r.selected&&scopeSummary(r)!=='None').length+(state.cabinets||[]).filter(c=>c.selected!==false&&cabinetCalc(c).hours>0).length,marketSale,marginFloor,minimumJob:hasWork?PRICING.minimumJob:0,materialCost,paintCost,suppliesCost,suppliesTier,repairHours,repairMaterials,laborCost,cabinetHours,cabinetPaintCost,cabinetFinishGallons,cabinetPrimerGallons};
}
function refreshAll(){renderWorkflow();
  const c=calc(),p=state.project;
  const w=state.workflow||{}, isProject=w.mode==='project'&&w.approvedSnapshot, snap=isProject?w.approvedSnapshot:null, t=snap?.totals||{};
  $('homeProjectLabel').textContent=(isProject?(snap?.project?.customerName||snap?.project?.address):(p.customerName||p.address))||'No project started';
  if($('homeHeroEyebrow'))$('homeHeroEyebrow').textContent=isProject?'CURRENT PROJECT':'CURRENT ESTIMATE';
  if($('homeHeroSubtitle'))$('homeHeroSubtitle').textContent=isProject?(changeOrderNet()?`Original ${money(t.sale)} · approved changes ${(changeOrderNet()>=0?'+':'')+money(changeOrderNet())}`:'Approved contract · locked estimate'):'Customer-facing estimate workflow';
  $('homePrice').textContent=isProject?money(currentContractTotal()):money(c.sale);
  if($('estimateWorkflowLabel'))$('estimateWorkflowLabel').textContent=isProject?'Approved Estimate Reference':'Estimate Workflow';
  if($('estimateReferenceBadge'))$('estimateReferenceBadge').hidden=!isProject;
  if(isProject){
    const pm=currentProjectMetrics();
    if($('statusRoomsLabel'))$('statusRoomsLabel').textContent='Authorized areas';
    if($('statusGallonsLabel'))$('statusGallonsLabel').textContent='Current paint gallons';
    if($('statusDaysLabel'))$('statusDaysLabel').textContent='Current painter-days';
    if($('statusMarginLabel'))$('statusMarginLabel').textContent='Current contract';
    $('statusRooms').textContent=pm.areas;
    $('statusGallons').textContent=pm.gallons;
    $('statusDays').textContent=pm.painterDays.toFixed(2);
    $('statusMargin').textContent=money(pm.currentContract);
  }else{
    if($('statusRoomsLabel'))$('statusRoomsLabel').textContent='Selected rooms';
    if($('statusGallonsLabel'))$('statusGallonsLabel').textContent='Paint gallons';
    if($('statusDaysLabel'))$('statusDaysLabel').textContent='Estimated days';
    if($('statusMarginLabel'))$('statusMarginLabel').textContent='Gross margin';
    $('statusRooms').textContent=c.selected;
    $('statusGallons').textContent=c.gallons;
    $('statusDays').textContent=c.days;
    $('statusMargin').textContent=Math.round(c.margin*100)+'%';
  }
  $('salePrice').textContent=money(c.sale);$('directCost').textContent=money(c.direct);$('grossProfit').textContent=money(c.profit);$('grossMargin').textContent=Math.round(c.margin*100)+'%';if($('standardInvestmentInternal'))$('standardInvestmentInternal').textContent=money(c.standardInvestment);if($('courtesyCreditInternal'))$('courtesyCreditInternal').textContent=c.courtesyCredit>0?'−'+money(c.courtesyCredit):'—';
  $('laborHours').textContent=c.hours.toFixed(1);$('jobDays').textContent=c.days;$('paintGallons').textContent=c.gallons;$('selectedCount').textContent=c.selected;
  const cabinetFinishMap=new Map();let cabinetPrimerBuy=0,cabinetPrimerBase=0,cabinetPrimerRequired=0;
  (state.cabinets||[]).forEach(cab=>{if(cab.selected===false)return;const q=cabinetCalc(cab);if(q.hours<=0)return;const key=(cab.color||'Cabinet Color')+'|'+(cab.sw||'');const prev=cabinetFinishMap.get(key)||{color:cab.color||'Cabinet Color',sw:cab.sw||'',baseGal:0,requiredGal:0,buyGal:0};prev.baseGal+=q.finishBaseGal;prev.requiredGal+=q.finishRequiredGal;prev.buyGal+=q.finishGal;cabinetFinishMap.set(key,prev);cabinetPrimerBase+=q.primerBaseGal;cabinetPrimerRequired+=q.primerRequiredGal;cabinetPrimerBuy+=q.primerGal;});
  const cm=materialSettings();
  const cabinetMaterialHtml=[...cabinetFinishMap.values()].map(g=>`<div class="material-row cabinet-material-row"><span>Cabinet Finish<br><small>${g.color}${g.sw?' • '+g.sw:''}</small></span><span>${cm.trimProduct}<br><small>Specialty cabinet coating • 2 finish coats</small><br><small>${g.baseGal.toFixed(2)} gal coating + 10% waste = <strong>${g.requiredGal.toFixed(2)} gal required</strong></small></span><strong>Buy ${g.buyGal} gal<br><small>${money2(cm.trimCost)}/gal · ${money2(g.buyGal*cm.trimCost)}</small></strong></div>`).join('')+(cabinetPrimerBuy?`<div class="material-row cabinet-material-row"><span>Cabinet Primer<br><small>Bonding / prep primer</small></span><span>${cm.primerProduct}<br><small>1 primer coat</small><br><small>${cabinetPrimerBase.toFixed(2)} gal coating + 10% waste = <strong>${cabinetPrimerRequired.toFixed(2)} gal required</strong></small></span><strong>Buy ${cabinetPrimerBuy} gal<br><small>${money2(cm.primerCost)}/gal · ${money2(cabinetPrimerBuy*cm.primerCost)}</small></strong></div>`:'');
  $('materialSummary').innerHTML=(c.groups.length||c.primerGroups.length||cabinetMaterialHtml)?c.groups.map(g=>`<div class="material-row"><span>${g.surface}<br><small>${g.color}${g.sw?' • '+g.sw:''}</small></span><span>${g.product}<br><small>${Math.round(g.sf)} sq ft • 2 coats • ${g.coverage} sq ft/gal</small><br><small>${g.baseGal.toFixed(2)} gal coating + 10% waste = <strong>${g.calcGal.toFixed(2)} gal required</strong></small></span><strong>Buy ${g.buyGal} gal<br><small>${money2(g.unitCost)}/gal · ${money2(g.extCost)}</small></strong></div>`).join('')+c.primerGroups.map(g=>`<div class="material-row"><span>Primer<br><small>${g.spotRooms?'Spot Prime':'Full Prime'}</small></span><span>${g.product}<br><small>${g.spotRooms?g.spotRooms+' room spot-prime allowance':Math.round(g.sf)+' sq ft • 1 coat • 400 sq ft/gal'}</small>${g.spotRooms?'':`<br><small>${g.baseGal.toFixed(2)} gal coating + 10% waste = <strong>${g.calcGal.toFixed(2)} gal required</strong></small>`}</span><strong>Buy ${g.buyGal} gal<br><small>${money2(g.unitCost)}/gal · ${money2(g.extCost)}</small></strong></div>`).join('')+cabinetMaterialHtml+'<p class="muted material-note">Finish paint: 400 sq ft/gal; 2 coats; 10% waste. Full primer: 400 sq ft/gal; 1 coat; 10% waste. Cabinet primer and finish quantities are included whenever cabinet work is selected.</p>':'<p class="muted">Select rooms or cabinet work to calculate materials.</p>';
  if($('marketComponentPrice'))$('marketComponentPrice').textContent=money(c.marketSale);
  if($('marginFloorPrice'))$('marginFloorPrice').textContent=money(c.marginFloor);if($('marginFloorLabel'))$('marginFloorLabel').textContent=Math.round(c.targetMargin*100)+'% margin floor';
  if($('minimumJobPrice'))$('minimumJobPrice').textContent=money(c.minimumJob);
  if($('pricingRule'))$('pricingRule').textContent='Highest of component market price, '+Math.round(c.targetMargin*100)+'% margin floor, or $250 minimum job';
  if($('productionHours'))$('productionHours').textContent=c.productionHours.toFixed(1);
  if($('setupCleanupHours'))$('setupCleanupHours').textContent=c.setupCleanupHours.toFixed(1);
  if($('painterDays'))$('painterDays').textContent=c.painterDays.toFixed(2);
  if($('painterDayRate'))$('painterDayRate').textContent=money(PRICING.painterDayRate);
  if($('painterHourlyRate'))$('painterHourlyRate').textContent=money2(c.painterHourly)+'/hr';
  if($('subcontractorPayout'))$('subcontractorPayout').textContent=money(c.subcontractorPayout);
  if($('materialCostInternal'))$('materialCostInternal').textContent=money2(c.materialCost); if($('repairLaborInternal'))$('repairLaborInternal').textContent=c.repairHours.toFixed(1)+' hr'; if($('repairMaterialInternal'))$('repairMaterialInternal').textContent=money2(c.repairMaterials); if($('paintCostInternal'))$('paintCostInternal').textContent=money2(c.paintCost); if($('suppliesCostInternal'))$('suppliesCostInternal').textContent=money2(c.suppliesCost); if($('suppliesTierInternal'))$('suppliesTierInternal').textContent=c.suppliesTier;
  if($('productionBreakdown'))$('productionBreakdown').innerHTML=c.roomBreakdown.length?c.roomBreakdown.map(r=>`<div class="status-row"><span>${r.name}<small class="prod-detail">Walls ${r.walls.toFixed(1)} • Ceiling ${r.ceiling.toFixed(1)} • Base ${r.baseboards.toFixed(1)} • Doors ${r.doors.toFixed(1)} • Windows ${r.windows.toFixed(1)}${r.closets?` • Closet ${r.closets.toFixed(1)}`:''}${r.crown?` • Crown ${r.crown.toFixed(1)}`:''}${r.primer?` • Primer ${r.primer.toFixed(1)}`:''}${r.repairs?` • Repairs ${r.repairs.toFixed(1)}`:''}</small></span><strong>${r.total.toFixed(1)} hr</strong></div>`).join(''):'<p class="muted">Select rooms to see production hours.</p>';  renderMarginControls();
}

function renderMarginControls(){const m=Math.round(targetMargin()*100),custom=$("customMargin");document.querySelectorAll("[data-margin]").forEach(b=>b.classList.toggle("active",+b.dataset.margin===m));if(custom)custom.value=[20,25,30,35,40].includes(m)?"":m;if($("targetMarginDisplay"))$("targetMarginDisplay").textContent=m+"%";}
function setTargetMarginPct(v){let pct=Math.round(+v||40);pct=Math.max(20,Math.min(89,pct));state.pricing=state.pricing||{};state.pricing.targetMargin=pct/100;save();renderMarginControls()}
document.querySelectorAll("[data-margin]").forEach(b=>b.onclick=()=>setTargetMarginPct(b.dataset.margin));if($("customMargin"))$("customMargin").onchange=e=>{if(String(e.target.value).trim()!=="")setTargetMarginPct(e.target.value)};
[['applyWalls','wall'],['applyCeilings','ceiling'],['applyTrim','trim']].forEach(([id,k])=>{$(id).onclick=()=>{const color=$(k==='wall'?'defaultWallColor':k==='ceiling'?'defaultCeilingColor':'defaultTrimColor').value,sw=$(k==='wall'?'defaultWallSw':k==='ceiling'?'defaultCeilingSw':'defaultTrimSw').value;state.rooms.filter(r=>r.selected).forEach(r=>{r[k+'Color']=color;r[k+'Sw']=sw});save();renderColors()}});

// V6.9 — Estimate Mode / Project Mode foundation
function snapshotApprovedEstimate(){
  const c=calc();
  return {
    capturedAt:new Date().toISOString(),
    project:JSON.parse(JSON.stringify(state.project||{})),
    rooms:JSON.parse(JSON.stringify(state.rooms||[])),
    cabinets:JSON.parse(JSON.stringify(state.cabinets||[])),
    colors:JSON.parse(JSON.stringify(state.colors||{})),
    pricing:JSON.parse(JSON.stringify(state.pricing||{})),
    totals:{sale:c.sale,directCost:c.direct,grossProfit:c.profit,margin:c.margin,targetMargin:c.targetMargin,standardInvestment:c.standardInvestment,courtesyCredit:c.courtesyCredit,hours:c.hours,painterDays:c.painterDays,calendarDays:c.days,subcontractorPayout:c.subcontractorPayout,gallons:c.gallons||0},
    proposalHTML:$('proposalContent')?($('proposalContent').innerHTML||''):''
  };
}
function renderWorkflow(){
  const w=state.workflow||(state.workflow={mode:'estimate',estimateStatus:'Draft',projectStatus:'Not Started',approvedAt:'',approvedSnapshot:null});
  const isProject=w.mode==='project'&&w.approvedSnapshot;
  const title=$('modeTitle'),sub=$('modeSubtitle'),badge=$('modeBadge'),content=$('workflowContent');
  if(title)title.textContent=isProject?'PROJECT MODE':'ESTIMATE MODE';
  if(sub)sub.textContent=isProject?'Active · execute the approved scope without changing the estimate':'Active · customer intake, scope, colors, pricing & proposal';
  if(badge)badge.textContent=isProject?'PROJECT':'ACTIVE';
  if($('proposalHomeTitle'))$('proposalHomeTitle').textContent=isProject?'Current Customer Contract':'Customer Proposal';
  if($('proposalHomeSubtitle'))$('proposalHomeSubtitle').textContent=isProject?'Original proposal + all approved change orders':'Review and print customer-ready scope';
  if($('proposalPageTitle'))$('proposalPageTitle').textContent=isProject?'Original Approved Proposal':'Proposal';
  const proposalCard=$('proposalHomeCard'); if(proposalCard) proposalCard.dataset.go=isProject?'currentcontract':'proposal'; const psb=$('proposalSignBtn');if(psb){psb.hidden=isProject;psb.textContent='Review & Sign Proposal';}
  if(!content)return;
  if(!isProject){
    content.innerHTML=`<div class="status-row"><span>Estimate status</span><strong>${w.estimateStatus||'Draft'}</strong></div><p class="muted">When the customer approves the proposal, convert it to a project. UrbanSkyLine will preserve a locked snapshot of the approved scope, price and estimated costs.</p><button class="primary full" id="convertProjectBtn" type="button">Review & Sign Proposal</button>`;
    const b=$('convertProjectBtn'); if(b)b.onclick=convertToProject;
  }else{
    const s=w.approvedSnapshot,t=s.totals||{};
    content.innerHTML=`<div class="status-row"><span>Project status</span><strong>${w.projectStatus||'Approved'}</strong></div><div class="status-row"><span>Original approved contract</span><strong>${money(t.sale)}</strong></div><div class="status-row"><span>Approved change orders</span><strong>${changeOrderNet()>=0?'+':''}${money(changeOrderNet())}</strong></div><div class="status-row"><span>Current contract total</span><strong>${money(currentContractTotal())}</strong></div><div class="status-row"><span>Approved on</span><strong>${w.approvedAt?new Date(w.approvedAt).toLocaleString():'—'}</strong></div><p class="muted">Approved estimate locked. Any post-approval scope or price change must be a Change Order.</p><button class="primary full" type="button" data-go="execution">Open Project Execution</button><button class="secondary full" type="button" data-go="currentcontract">Current Customer Contract</button><button class="secondary full" type="button" data-go="changeorders">Change Orders</button><div class="workflow-actions"><button class="secondary" type="button" data-go="history">Project History</button><button class="secondary" type="button" id="newEstimateModeBtn">+ New Estimate</button></div>`; const nb=$('newEstimateModeBtn');if(nb)nb.onclick=startNewEstimate;
  }
}
function convertToProject(){
  if(isApprovedProject()){alert('This proposal is already approved and locked. Use Change Orders for any new scope or price change.');nav('currentcontract');return;}
  const p=state.project||{}, selected=(state.rooms||[]).filter(r=>r.selected);
  if(!String(p.customerName||'').trim()||!String(p.address||'').trim()){alert('Complete customer name and project address before approval.');nav('project');return;}
  if(!selected.length){alert('Select at least one room before approval.');nav('rooms');return;}
  renderProposal();
  const c=calc();
  openSignatureModal({
    type:'proposal',
    title:'Approve Painting Proposal',
    signerName:p.customerName||'',
    summary:`<strong>Final Investment: ${money(c.sale)}</strong><br>${selected.length} authorized room${selected.length===1?'':'s'} · ${p.address||''}`,
    acceptance:'I have reviewed and accept the scope of work, exclusions, investment, and terms shown in this proposal and authorize UrbanSkyLine Design & Build LLC to proceed.',
    acceptLabel:'Accept Proposal & Sign',
    onSigned:(sig)=>finalizeProposalApproval(sig)
  });
}
function finalizeProposalApproval(sig){
  renderProposal();
  const signedAt=sig.signedAt||new Date().toISOString();
  const block=signatureRecordHTML(sig,'Customer Approval');
  if($('proposalContent'))$('proposalContent').insertAdjacentHTML('beforeend',block);
  const snap=snapshotApprovedEstimate();
  snap.customerSignature=JSON.parse(JSON.stringify(sig));
  state.workflow={mode:'project',estimateStatus:'Approved',projectStatus:'Approved',approvedAt:signedAt,approvedSnapshot:snap,approvalSignature:JSON.parse(JSON.stringify(sig)),changeOrders:[]};
  localStorage.setItem('uslPaintApp',JSON.stringify(state));archiveCurrentProject();refreshAll();renderWorkflow();nav('execution');
}
function renderExecution(){
  const w=state.workflow||{},s=w.approvedSnapshot,el=$('approvedSnapshot');
  if(!s){if(el)el.innerHTML='<p>No approved estimate snapshot yet.</p>';return;}
  const t=s.totals||{},rooms=(s.rooms||[]).filter(r=>r.selected).map(r=>r.name).join(', ')||'—';
  if(el)el.innerHTML=`<div class="snapshot-grid"><div><small>Customer</small><strong>${s.project?.customerName||'—'}</strong></div><div><small>Approved Contract</small><strong>${money(t.sale)}</strong></div><div><small>Rooms</small><strong>${rooms}</strong></div><div><small>Estimated Painter Hours</small><strong>${Number(t.hours||0).toFixed(1)}</strong></div><div><small>Estimated Direct Cost</small><strong>${money(t.directCost)}</strong></div><div><small>Expected Margin</small><strong>${Math.round((t.margin||0)*100)}%</strong></div></div>`;
  const coNet=changeOrderNet(),current=currentContractTotal();
  if($('executionStatus'))$('executionStatus').textContent=w.projectStatus||'Approved';
  if($('executionContract'))$('executionContract').textContent=money(t.sale);
  if($('executionCost'))$('executionCost').textContent=money(t.directCost);
  if($('executionProfit'))$('executionProfit').textContent=money(t.grossProfit);
  let controls=$('executionContract')?.closest('.panel');
  if(controls){let extra=controls.querySelector('.co-execution-summary');if(!extra){extra=document.createElement('div');extra.className='co-execution-summary';const btn=controls.querySelector('#viewApprovedProposal');controls.insertBefore(extra,btn)}extra.innerHTML=`<div class="status-row"><span>Approved change orders</span><strong>${coNet>=0?'+':''}${money(coNet)}</strong></div><div class="status-row contract-current"><span>Current contract total</span><strong>${money(current)}</strong></div><button class="primary full" type="button" data-go="currentcontract">Current Customer Contract</button><button class="secondary full" type="button" data-go="changeorders">Open Change Orders</button>`}
}
function nextChangeOrderNumber(){return (state.workflow?.changeOrders||[]).reduce((m,x)=>Math.max(m,Number(x.number||0)),0)+1}
function coRoomTemplate(name){
  const approved=(state.workflow?.approvedSnapshot?.rooms||[]).find(x=>x.name===name);
  if(approved){const r=JSON.parse(JSON.stringify(approved));r.selected=true;return r;}
  let r=(fresh().rooms||[]).find(x=>x.name===name);
  if(!r){r=(fresh().rooms||[]).find(x=>x.name==='Custom Room 1');r.name=name||'Custom Area';r.price=900;}
  r=JSON.parse(JSON.stringify(r));r.selected=true;return r;
}
function getCoScopes(){
  const raw=String($('coScope')?.value||'Full Room');
  const scopes=raw.split('|').filter(Boolean);
  return scopes.length?scopes:['Full Room'];
}
function setCoScopes(scopes){
  const clean=[...new Set((scopes||[]).filter(Boolean))];
  if($('coScope'))$('coScope').value=(clean.length?clean:['Full Room']).join('|');
}
function applyCoScopes(r,scopes){
  scopes=scopes&&scopes.length?scopes:['Full Room'];
  if(scopes.includes('Full Room')){setPackage(r,'Full Room');return r;}
  setPackage(r,'Custom');
  if(scopes.includes('Walls Only'))r.walls='Yes';
  if(scopes.includes('Ceiling Only'))r.ceiling='Yes';
  if(scopes.includes('Baseboards Only'))r.baseboards='Yes';
  if(scopes.includes('Doors Only'))r.doors='Yes';
  if(scopes.includes('Windows Only'))r.windows='Yes';
  if(scopes.includes('Crown Only')){r.crown='Yes';r.crownPresent=true;r.crownLf=2*(Math.max(0,+r.length||0)+Math.max(0,+r.width||0));}
  return r;
}
function coScopeLabel(scope){return {'Full Room':'Full Room','Walls Only':'Walls','Ceiling Only':'Ceiling','Baseboards Only':'Baseboards','Doors Only':'Doors','Windows Only':'Windows','Crown Only':'Crown','Cabinet Painting':'Cabinet Painting'}[scope]||scope||'Full Room'}
function coScopesLabel(scopes){
  scopes=scopes&&scopes.length?scopes:['Full Room'];
  if(scopes.includes('Full Room'))return 'Full Room';
  return scopes.map(coScopeLabel).join(' + ');
}
function coStoredScopes(co){
  if(Array.isArray(co?.scopes)&&co.scopes.length)return co.scopes;
  const raw=String(co?.scope||'').trim();
  if(!raw)return [];
  if(raw==='Full Room')return ['Full Room'];
  const reverse={'Walls':'Walls Only','Ceiling':'Ceiling Only','Baseboards':'Baseboards Only','Doors':'Doors Only','Windows':'Windows Only','Crown':'Crown Only'};
  return raw.split('+').map(x=>x.trim()).map(x=>reverse[x]||x).filter(Boolean);
}
function coHasScope(co,scope){const scopes=coStoredScopes(co);return scopes.includes('Full Room')||scopes.includes(scope);}
function coDefaultDescription(){const area=$('coArea')?.value||'Area',scope=coScopesLabel(getCoScopes()),type=$('coType')?.value==='deduct'?'Remove':'Add';return `${type} ${area} — ${scope}`}
let coDescriptionAuto=true;
function updateCoGuidedUI(){
  const type=$('coType')?.value||'add',scopes=getCoScopes();
  document.querySelectorAll('[data-co-type]').forEach(b=>b.classList.toggle('active',b.dataset.coType===type));
  document.querySelectorAll('[data-co-scope]').forEach(b=>b.classList.toggle('active',scopes.includes(b.dataset.coScope)));
  document.querySelectorAll('[data-co-detail="doors"]').forEach(x=>x.hidden=!scopes.includes('Doors Only')&&!scopes.includes('Full Room'));
  document.querySelectorAll('[data-co-detail="windows"]').forEach(x=>x.hidden=!scopes.includes('Windows Only')&&!scopes.includes('Full Room'));document.querySelectorAll('[data-co-detail="cabinets"]').forEach(x=>x.hidden=!scopes.includes('Cabinet Painting'));
  if($('coPriceLabel'))$('coPriceLabel').textContent=type==='deduct'?'Customer Contract Deduction':'Customer Change Order';
  const existing=(state.workflow?.approvedSnapshot?.rooms||[]).find(x=>x.name===$('coArea')?.value);
  if($('coAreaHint'))$('coAreaHint').textContent=existing?'Using the dimensions saved in the approved estimate. You can adjust them below if this change applies to a different area.':'Using the standard room preset. Adjust measurements only if needed.';
}
function calculateChangeOrderAuto(updateDescription=false){
  if(!$('coArea'))return null;
  const area=$('coArea').value||'Living Room',scopes=getCoScopes();
  if(scopes.includes('Cabinet Painting')){const cab={...CABINET_DEFAULTS,area,doors:Math.max(0,+$('coCabDoors')?.value||0),drawers:Math.max(0,+$('coCabDrawers')?.value||0),boxLf:Math.max(0,+$('coCabBoxLf')?.value||0),endPanels:Math.max(0,+$('coCabEnds')?.value||0)};const q=cabinetCalc(cab),prod=q.hours,setup=prod*PRICING.setupCleanupPct,hours=prod+setup,direct=hours*(PRICING.painterDayRate/PRICING.hoursPerDay)+q.paintCost+50,amount=Math.ceil(Math.max(PRICING.minimumJob,direct/(1-targetMargin()))/5)*5,margin=amount?(amount-direct)/amount:0,sign=$('coType')?.value==='deduct'?-1:1;if($('coAmount'))$('coAmount').textContent=(sign<0?'-':'+')+money(amount);if($('coDirectCost'))$('coDirectCost').textContent=money(direct);if($('coHours'))$('coHours').textContent=hours.toFixed(1);if($('coMargin'))$('coMargin').textContent=Math.round(margin*100)+'%';if($('coMarginDisplay'))$('coMarginDisplay').value=Math.round(targetMargin()*100)+'%';if($('coNewContract'))$('coNewContract').textContent=money(currentContractTotal()+sign*amount);if($('coPricingNote'))$('coPricingNote').textContent=`Cabinet pricing: ${hours.toFixed(1)} painter-hours + primer/finish materials · ${Math.round(targetMargin()*100)}% target margin.`;if(updateDescription&&$('coDescription')&&coDescriptionAuto)$('coDescription').value=`${$('coType')?.value==='deduct'?'Remove':'Add'} ${area} — Cabinet Painting (${cabinetScopeText(cab)})`;updateCoGuidedUI();return{description:String($('coDescription')?.value||'Cabinet Painting').trim(),type:$('coType')?.value||'add',amount,directCost:direct,hours,area,scope:'Cabinet Painting',scopes:['Cabinet Painting'],cabinet:JSON.parse(JSON.stringify(cab)),margin};}
  let r=coRoomTemplate(area);
  r.length=Math.max(1,Number($('coLength')?.value||r.length||10));r.width=Math.max(1,Number($('coWidth')?.value||r.width||10));r.height=Math.max(6,Number($('coHeight')?.value||r.height||9));r.doorCount=Math.max(0,Math.round(Number($('coDoorCount')?.value||0)));r.windowCount=Math.max(0,Math.round(Number($('coWindowCount')?.value||0)));
  r=applyCoScopes(r,scopes);normalizeRoom(r);
  const originalRooms=state.rooms;let c;
  try{state.rooms=[r];c=calc();}finally{state.rooms=originalRooms}
  const amount=Math.max(0,c?.sale||0),directCost=Math.max(0,c?.direct||0),hours=Math.max(0,c?.hours||0),margin=Math.max(0,c?.margin||0),sign=$('coType')?.value==='deduct'?-1:1;
  if($('coAmount'))$('coAmount').textContent=(sign<0?'-':'+')+money(amount);if($('coDirectCost'))$('coDirectCost').textContent=money(directCost);if($('coHours'))$('coHours').textContent=hours.toFixed(1);if($('coMargin'))$('coMargin').textContent=Math.round(margin*100)+'%';if($('coMarginDisplay'))$('coMarginDisplay').value=Math.round(targetMargin()*100)+'%';if($('coNewContract'))$('coNewContract').textContent=money(currentContractTotal()+sign*amount);
  if($('coPricingNote'))$('coPricingNote').textContent=`Automatic pricing: market reference ${money(c.marketSale)} · ${Math.round(c.targetMargin*100)}% margin floor ${money(c.marginFloor)} · minimum job ${money(c.minimumJob)}. Highest rule = ${money(c.sale)}.`;
  if(updateDescription&&$('coDescription')&&coDescriptionAuto)$('coDescription').value=coDefaultDescription();
  updateCoGuidedUI();
  return {description:String($('coDescription')?.value||coDefaultDescription()).trim(),type:$('coType')?.value||'add',amount,directCost,hours,area,scope:coScopesLabel(scopes),scopes:[...scopes],length:r.length,width:r.width,height:r.height,doorCount:r.doorCount,windowCount:r.windowCount,margin};
}
function populateChangeOrderBuilder(){
  const area=$('coArea');if(!area)return;
  if(!area.options.length){
    const approved=(state.workflow?.approvedSnapshot?.rooms||[]).filter(r=>r.selected);
    if(approved.length){const g=document.createElement('optgroup');g.label='Approved project rooms';approved.forEach(r=>g.appendChild(new Option(r.name,r.name)));area.appendChild(g);}
    const names=new Set(approved.map(r=>r.name));const g2=document.createElement('optgroup');g2.label='New area / room';ROOM_PRESETS.filter(x=>!names.has(x[0])).forEach(x=>g2.appendChild(new Option(x[0],x[0])));g2.appendChild(new Option('Custom Area','Custom Area'));area.appendChild(g2);
  }
  if(!$('coScope').value)setCoScopes(['Full Room']);syncCoDimensions(true);calculateChangeOrderAuto(true);updateCoGuidedUI();
}
function syncCoDimensions(force=false){
  const area=$('coArea');if(!area)return;const approved=(state.workflow?.approvedSnapshot?.rooms||[]).find(x=>x.name===area.value),preset=ROOM_PRESETS.find(x=>x[0]===area.value),base=approved|| (preset?{length:preset[1],width:preset[2],height:preset[3]}:null);
  if(base){if(force||!$('coLength').value)$('coLength').value=base.length;if(force||!$('coWidth').value)$('coWidth').value=base.width;if(force||!$('coHeight').value)$('coHeight').value=base.height;if(force&&approved){$('coDoorCount').value=Math.max(0,Number(approved.doorCount||0));$('coWindowCount').value=Math.max(0,Number(approved.windowCount||0));}}
  else if(force){$('coLength').value=10;$('coWidth').value=10;$('coHeight').value=9;$('coDoorCount').value=1;$('coWindowCount').value=1;}
  calculateChangeOrderAuto(true);updateCoGuidedUI();
}
function readChangeOrderForm(){
  const data=calculateChangeOrderAuto(false);if(!data)return null;
  data.description=String($('coDescription')?.value||data.description).trim();if(!data.description){alert('Enter the change-order scope or description.');return null}if(!(data.amount>0)){alert('Select a scope that produces a calculated price.');return null}return data;
}
function clearChangeOrderForm(){coDescriptionAuto=true;if($('coType'))$('coType').value='add';setCoScopes(['Full Room']);if($('coDoorCount'))$('coDoorCount').value=1;if($('coWindowCount'))$('coWindowCount').value=1;if($('coDescription'))$('coDescription').value='';if($('coArea'))$('coArea').selectedIndex=0;syncCoDimensions(true);updateCoGuidedUI()}
function saveChangeOrder(status){
  if(!isApprovedProject()){alert('Change Orders are available only after an estimate is approved.');return;}
  const data=readChangeOrderForm();if(!data)return;
  const num=nextChangeOrderNumber();
  if(status==='Approved'){
    const sign=data.type==='deduct'?-1:1,updated=currentContractTotal()+sign*data.amount;
    const customer=state.workflow?.approvedSnapshot?.project?.customerName||state.project?.customerName||'';
    openSignatureModal({type:'changeorder',title:`Approve Change Order #${num}`,signerName:customer,summary:`<strong>${data.description}</strong><br>${data.type==='deduct'?'Contract Deduction':'Change Order'}: ${sign<0?'-':'+'}${money(data.amount)}<br>Contract after approval: <strong>${money(updated)}</strong>`,acceptance:'I have reviewed and approve this Change Order. I understand it changes the authorized project scope and current contract total while the original approved proposal remains unchanged.',acceptLabel:'Approve Change Order & Sign',onSigned:(sig)=>finalizeNewChangeOrder(data,num,sig)});
    return;
  }
  const rec={id:'co_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),number:num,...data,status:'Draft',createdAt:new Date().toISOString(),approvedAt:'',signature:null};
  state.workflow.changeOrders=state.workflow.changeOrders||[];state.workflow.changeOrders.push(rec);save();archiveCurrentProject();clearChangeOrderForm();renderChangeOrders();renderExecution();
}
function finalizeNewChangeOrder(data,num,sig){
  const rec={id:'co_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),number:num,...data,status:'Approved',createdAt:new Date().toISOString(),approvedAt:sig.signedAt||new Date().toISOString(),signature:JSON.parse(JSON.stringify(sig))};
  state.workflow.changeOrders=state.workflow.changeOrders||[];state.workflow.changeOrders.push(rec);save();archiveCurrentProject();clearChangeOrderForm();renderChangeOrders();renderExecution();nav('changeorders');
}
function approveExistingChangeOrder(id){
  const co=(state.workflow?.changeOrders||[]).find(x=>x.id===id);if(!co||co.status==='Approved')return;
  const sign=co.type==='deduct'?-1:1,updated=currentContractTotal()+sign*Number(co.amount||0),customer=state.workflow?.approvedSnapshot?.project?.customerName||state.project?.customerName||'';
  openSignatureModal({type:'changeorder',title:`Approve Change Order #${co.number}`,signerName:customer,summary:`<strong>${co.description}</strong><br>${co.type==='deduct'?'Contract Deduction':'Change Order'}: ${sign<0?'-':'+'}${money(co.amount)}<br>Contract after approval: <strong>${money(updated)}</strong>`,acceptance:'I have reviewed and approve this Change Order. I understand it changes the authorized project scope and current contract total while the original approved proposal remains unchanged.',acceptLabel:'Approve Change Order & Sign',onSigned:(sig)=>{co.status='Approved';co.approvedAt=sig.signedAt||new Date().toISOString();co.signature=JSON.parse(JSON.stringify(sig));save();archiveCurrentProject();renderChangeOrders();renderExecution();}});
}
function renderChangeOrders(){
  if(!isApprovedProject()){nav('home');return}
  const s=state.workflow.approvedSnapshot,t=s.totals||{},list=state.workflow.changeOrders||[],net=changeOrderNet(),current=currentContractTotal();
  if($('coOriginalContract'))$('coOriginalContract').textContent=money(t.sale);if($('coApprovedTotal'))$('coApprovedTotal').textContent=(net>=0?'+':'')+money(net);if($('coCurrentContract'))$('coCurrentContract').textContent=money(current);
  populateChangeOrderBuilder();
  const el=$('changeOrderList');if(el){
    if(!list.length)el.innerHTML='<p class="muted">No change orders yet. The original approved estimate remains unchanged.</p>';
    else el.innerHTML=list.slice().reverse().map(co=>{const signed=co.type==='deduct'?-1:1;return `<div class="change-order-item"><div class="co-head"><div><strong>Change Order #${co.number}</strong><small>${new Date(co.createdAt).toLocaleString()}</small></div><span class="co-status ${co.status.toLowerCase()}">${co.status}</span></div><p>${co.description}</p>${co.area?`<small class="muted">${co.area} · ${co.scope||''}${co.length?` · ${co.length}×${co.width}×${co.height} ft`:''}</small>`:''}<div class="status-row"><span>${co.type==='deduct'?'Contract deduction':'Contract addition'}</span><strong>${signed<0?'-':'+'}${money(co.amount)}</strong></div>${co.directCost?`<div class="status-row"><span>Estimated direct cost</span><strong>${money(co.directCost)}</strong></div>`:''}${co.hours?`<div class="status-row"><span>Painter hours</span><strong>${Number(co.hours).toFixed(1)}</strong></div>`:''}${co.status==='Draft'?`<button class="secondary full" type="button" data-approve-co="${co.id}">Approve Change Order</button>`:`${co.signature?`<div class="co-signature-mini"><span class="signature-badge">✓ CUSTOMER SIGNED</span><img src="${co.signature.dataUrl}" alt="Customer signature"><small>${co.signature.name||''} · ${co.approvedAt?new Date(co.approvedAt).toLocaleString():'—'}</small></div>`:`<small class="muted">Approved ${co.approvedAt?new Date(co.approvedAt).toLocaleString():'—'} · Legacy approval (no signature captured)</small>`}`}</div>`}).join('');
    el.querySelectorAll('[data-approve-co]').forEach(b=>b.onclick=()=>approveExistingChangeOrder(b.dataset.approveCo));
  }
}
function viewApprovedProposal(){
  const s=state.workflow?.approvedSnapshot;if(!s)return;
  nav('proposal');
  if(s.proposalHTML&&$('proposalContent'))$('proposalContent').innerHTML=s.proposalHTML;
}

// V7.0 — Touch signature system
let activeSignatureRequest=null,signatureDrawing=false,signatureHasInk=false,signatureLast=null;
function signatureRecordHTML(sig,label){if(!sig?.dataUrl)return '';return `<div class="signed-record"><span class="signature-badge">✓ SIGNED</span><strong>${label||'Signature'}</strong><img class="signature-image" src="${sig.dataUrl}" alt="Signature"><div><strong>${sig.name||'—'}</strong><small>${sig.signedAt?new Date(sig.signedAt).toLocaleString():'—'}</small></div></div>`;}
function resizeSignatureCanvas(){const c=$('signatureCanvas');if(!c)return;const rect=c.getBoundingClientRect(),ratio=Math.max(1,window.devicePixelRatio||1);const old=c.toDataURL();c.width=Math.round(rect.width*ratio);c.height=Math.round(rect.height*ratio);const ctx=c.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=2.5;ctx.strokeStyle='#24140b';if(signatureHasInk){const img=new Image();img.onload=()=>ctx.drawImage(img,0,0,rect.width,rect.height);img.src=old;}}
function clearSignatureCanvas(){const c=$('signatureCanvas');if(!c)return;const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);signatureHasInk=false;signatureLast=null;const h=$('signatureHint');if(h)h.hidden=false;}
function signaturePoint(e){const c=$('signatureCanvas'),r=c.getBoundingClientRect(),p=e.touches?.[0]||e;return {x:p.clientX-r.left,y:p.clientY-r.top};}
function startSignature(e){if(!activeSignatureRequest)return;e.preventDefault();signatureDrawing=true;signatureLast=signaturePoint(e);try{$('signatureCanvas').setPointerCapture?.(e.pointerId)}catch(_){};}
function moveSignature(e){if(!signatureDrawing)return;e.preventDefault();const c=$('signatureCanvas'),ctx=c.getContext('2d'),p=signaturePoint(e);ctx.beginPath();ctx.moveTo(signatureLast.x,signatureLast.y);ctx.lineTo(p.x,p.y);ctx.stroke();signatureLast=p;signatureHasInk=true;const h=$('signatureHint');if(h)h.hidden=true;}
function endSignature(e){if(signatureDrawing)e?.preventDefault?.();signatureDrawing=false;signatureLast=null;}
function openSignatureModal(opts){activeSignatureRequest=opts||{};const m=$('signatureModal');if(!m)return;const title=$('signatureTitle'),summary=$('signatureSummary'),name=$('signatureName'),accept=$('signatureAcceptance'),btn=$('signatureAccept');if(title)title.textContent=opts.title||'Signature';if(summary)summary.innerHTML=opts.summary||'';if(name)name.value=opts.signerName||'';if(accept)accept.textContent=opts.acceptance||'';if(btn)btn.textContent=opts.acceptLabel||'Accept & Sign';m.hidden=false;m.setAttribute('aria-hidden','false');document.body.classList.add('signature-open');requestAnimationFrame(()=>{resizeSignatureCanvas();clearSignatureCanvas();});}
function closeSignatureModal(){const m=$('signatureModal');if(m){m.hidden=true;m.setAttribute('aria-hidden','true');}document.body.classList.remove('signature-open');activeSignatureRequest=null;clearSignatureCanvas();}
function acceptSignature(){if(!activeSignatureRequest)return;const name=String($('signatureName')?.value||'').trim();if(!name){alert('Enter the signer’s printed name.');$('signatureName')?.focus();return;}if(!signatureHasInk){alert('Please sign in the signature box before continuing.');return;}const c=$('signatureCanvas'),sig={name,dataUrl:c.toDataURL('image/png'),signedAt:new Date().toISOString(),type:activeSignatureRequest.type||'signature'};const cb=activeSignatureRequest.onSigned;closeSignatureModal();if(typeof cb==='function')cb(sig);}
function signSubcontractorWorkOrder(){if(!isApprovedProject()){alert('Convert the estimate to a project before signing the work order.');return;}const sc=state.subcontractor||{},snap=state.workflow?.approvedSnapshot,t=snap?.totals||{},coHours=approvedChangeOrders().reduce((sum,co)=>sum+(co.type==='deduct'?-1:1)*Number(co.hours||0),0),hours=Math.max(0,Number(t.hours||0)+coHours),payout=Number(sc.agreedPayout||0)>0?Number(sc.agreedPayout):hours*37.5;openSignatureModal({type:'subcontractor',title:'Work Order Acknowledgment',signerName:sc.name||'',summary:`<strong>Current authorized work order</strong><br>${hours.toFixed(1)} painter-hours · Agreed/estimated payout ${money(payout)}`,acceptance:'I acknowledge the current authorized work scope, approved Change Orders, job instructions, and agreed payout shown on this Work Order.',acceptLabel:'Acknowledge & Sign',onSigned:(sig)=>{state.subcontractor.signature=JSON.parse(JSON.stringify(sig));state.subcontractor.signedAt=sig.signedAt;state.subcontractor.signedName=sig.name;if(!state.subcontractor.name)state.subcontractor.name=sig.name;save();archiveCurrentProject();bindSubcontractor();renderSubcontractor();nav('subcontractor');}});}
$('signatureCanvas')?.addEventListener('pointerdown',startSignature);$('signatureCanvas')?.addEventListener('pointermove',moveSignature);$('signatureCanvas')?.addEventListener('pointerup',endSignature);$('signatureCanvas')?.addEventListener('pointercancel',endSignature);$('signatureClear')?.addEventListener('click',clearSignatureCanvas);$('signatureClose')?.addEventListener('click',closeSignatureModal);$('signatureAccept')?.addEventListener('click',acceptSignature);$('signatureModal')?.addEventListener('click',e=>{if(e.target===$('signatureModal'))closeSignatureModal();});window.addEventListener('resize',()=>{if(!$('signatureModal')?.hidden)resizeSignatureCanvas();});


// V7.1.1 — iPad input UX + bathroom room presets
// V7.1 — Email & Share signed customer documents
function safeFileName(value){return String(value||'Customer').trim().replace(/[^a-z0-9]+/gi,'_').replace(/^_+|_+$/g,'').slice(0,60)||'Customer'}
async function imageToDataUrl(src){try{const res=await fetch(src,{cache:'force-cache'});const blob=await res.blob();return await new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=reject;fr.readAsDataURL(blob)})}catch(_){return src}}
async function customerDocumentHTML(kind){
  const isContract=kind==='contract';
  if(isContract)renderCurrentContractSummary();else if(!isApprovedProject())renderProposal();
  const source=isContract?$('currentContractContent'):$('proposalContent');
  if(!source)throw new Error('Document is not available.');
  let body=source.innerHTML;
  const logo=await imageToDataUrl('urban-skyline-logo.png');
  body=body.replaceAll('src="urban-skyline-logo.png"',`src="${logo}"`);
  const title=isContract?'Current Customer Contract':'Painting Proposal';
  const style=`body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;color:#24170f;background:#fff;margin:0;padding:28px;line-height:1.42}main{max-width:920px;margin:auto}.proposal-brand{display:flex;align-items:center;gap:16px;border-bottom:2px solid #d9bd88;padding-bottom:14px;margin-bottom:16px}.proposal-logo{width:140px;max-height:90px;object-fit:contain;border-radius:8px;background:#140c07;padding:6px}h2,h3,h4{color:#3d2917}table{width:100%;border-collapse:collapse;margin:12px 0 18px}th,td{padding:9px 8px;border-bottom:1px solid #eadfce;text-align:left;vertical-align:top}.contract-amount{text-align:right;white-space:nowrap}.contract-summary-hero{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0}.contract-summary-hero>div{border:1px solid #dfd2bd;border-radius:12px;padding:12px;background:#fbf7ef}.contract-summary-hero small,.contract-summary-hero strong{display:block}.contract-summary-hero strong{font-size:22px}.contract-summary-hero .current{background:#f1e3c6}.contract-total-line{display:flex;justify-content:space-between;padding:16px 0;border-top:2px solid #b88939;border-bottom:2px solid #b88939;font-size:20px}.proposal-pricing-breakdown{max-width:520px;border:1px solid #e2d0ae;border-radius:14px;overflow:hidden;margin:10px 0 18px}.proposal-pricing-breakdown>div{display:flex;justify-content:space-between;padding:12px 14px;border-bottom:1px solid #eadcc4}.signed-record{margin-top:18px;border-top:1px solid #d9c8ae;padding-top:14px;page-break-inside:avoid}.signature-image{display:block;max-width:320px;width:100%;height:auto;border-bottom:1px solid #8a765f;margin:7px 0}.signature-badge{display:inline-block;border-radius:999px;padding:5px 8px;background:#e5f0e4;color:#315b36;font-size:10px;font-weight:900}.contract-signature-block{page-break-inside:avoid}@media(max-width:640px){body{padding:16px}.contract-summary-hero{grid-template-columns:1fr}.proposal-brand{align-items:flex-start}.proposal-logo{width:105px}}@media print{body{padding:0}}`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${style}</style></head><body><main>${body}</main></body></html>`;
}
function customerEmailAddress(){return String(state.workflow?.approvedSnapshot?.project?.email||state.project?.email||'').trim()}
function customerNameForShare(){return state.workflow?.approvedSnapshot?.project?.customerName||state.project?.customerName||'Customer'}
function projectAddressForShare(){const p=state.workflow?.approvedSnapshot?.project||state.project||{};return [p.address,p.cityZip].filter(Boolean).join(' ')}
function emailCustomer(kind){
  const isContract=kind==='contract',email=customerEmailAddress(),name=customerNameForShare(),address=projectAddressForShare();
  const amount=isContract?currentContractTotal():(isApprovedProject()?Number(state.workflow?.approvedSnapshot?.totals?.sale||0):calc().sale);
  const subject=`UrbanSkyLine ${isContract?'Current Contract':'Painting Proposal'} - ${address||name}`;
  const body=`Hello ${name},\n\nAttached/shared is your ${isContract?'current customer contract':'painting proposal'} for ${address||'your project'}.\n\nCurrent investment: ${money(amount)}\n\nThank you,\nUrbanSkyLine Design & Build LLC`;
  location.href=`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
async function shareCustomerDocument(kind){
  const isContract=kind==='contract',name=customerNameForShare(),address=projectAddressForShare();
  try{
    const html=await customerDocumentHTML(kind);
    const fileName=`UrbanSkyLine_${safeFileName(name)}_${isContract?'Current_Contract':'Signed_Proposal'}.html`;
    const file=new File([html],fileName,{type:'text/html'});
    const title=`UrbanSkyLine ${isContract?'Current Customer Contract':'Painting Proposal'}`;
    const text=`${name}${address?' · '+address:''} · ${isContract?'Current contract '+money(currentContractTotal()):'Proposal document'}`;
    if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({title,text,files:[file]});return;}
    const blobUrl=URL.createObjectURL(file),a=document.createElement('a');a.href=blobUrl;a.download=fileName;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(blobUrl),1500);
    alert('The signed document was saved as a file. Attach it to your email, or use Print / Save PDF for a PDF copy.');
  }catch(err){if(err?.name==='AbortError')return;console.error(err);alert('Unable to share this document on this device. Use Print / Save PDF instead.');}
}

$('newProjectBtn').onclick=startNewEstimate;if($('historyNewEstimate'))$('historyNewEstimate').onclick=startNewEstimate;if($('saveCoDraft'))$('saveCoDraft').onclick=()=>saveChangeOrder('Draft');if($('approveCo'))$('approveCo').onclick=()=>saveChangeOrder('Approved');if($('proposalSignBtn'))$('proposalSignBtn').onclick=convertToProject;if($('subcontractorSignBtn'))$('subcontractorSignBtn').onclick=signSubcontractorWorkOrder;if($('printSubcontractor'))$('printSubcontractor').onclick=()=>{document.body.classList.add('print-subcontractor');renderSubcontractor();window.print();setTimeout(()=>document.body.classList.remove('print-subcontractor'),300)};window.addEventListener('afterprint',()=>document.body.classList.remove('print-subcontractor'));$('printProposal').onclick=()=>{const p=state.project||{};const missing=[];if(!String(p.customerName||'').trim())missing.push('customer name');if(!String(p.address||'').trim())missing.push('street address');if(missing.length){alert('Complete '+missing.join(' and ')+' before finalizing the proposal.');nav('project');return}window.print()};if($('printCurrentContract'))$('printCurrentContract').onclick=()=>{document.body.classList.add('print-current-contract');renderCurrentContractSummary();window.print();setTimeout(()=>document.body.classList.remove('print-current-contract'),300)};if($('shareProposal'))$('shareProposal').onclick=()=>shareCustomerDocument('proposal');if($('emailProposal'))$('emailProposal').onclick=()=>emailCustomer('proposal');if($('shareCurrentContract'))$('shareCurrentContract').onclick=()=>shareCustomerDocument('contract');if($('emailCurrentContract'))$('emailCurrentContract').onclick=()=>emailCustomer('contract');window.addEventListener('afterprint',()=>document.body.classList.remove('print-current-contract'));
function plural(n,one,many){return `${n} ${n===1?one:many}`}
function renderCurrentContractSummary(){
  const w=state.workflow||{},s=w.approvedSnapshot,el=$('currentContractContent');
  if(!el)return;
  if(!s){el.innerHTML='<p>No approved project is available.</p>';return;}
  const t=s.totals||{},p=s.project||{},approved=approvedChangeOrders(),net=changeOrderNet(),current=currentContractTotal();
  const originalRooms=(s.rooms||[]).filter(r=>r.selected&&scopeSummary(r)!=='None').map(r=>`<tr><td><strong>${r.name}</strong></td><td>${proposalScope(r)}</td></tr>`).join('')+(s.cabinets||[]).filter(c=>c.selected!==false&&cabinetCalc(c).hours>0).map(c=>`<tr><td><strong>${c.area}</strong></td><td>Cabinet Painting — ${cabinetScopeText(c)}</td></tr>`).join('');
  const coRows=approved.length?approved.map(co=>{const sign=co.type==='deduct'?-1:1;return `<tr><td><strong>Change Order #${co.number}</strong><br><small>${co.approvedAt?new Date(co.approvedAt).toLocaleDateString():''}</small></td><td>${co.description||'Approved change'}${co.signature?`<br><small>✓ Signed by ${co.signature.name||'customer'}</small>`:''}</td><td class="contract-amount">${sign<0?'-':'+'}${money(co.amount)}</td></tr>`}).join(''):`<tr><td colspan="3">No approved change orders.</td></tr>`;
  const coSignatureBlocks=approved.filter(co=>co.signature?.dataUrl).map(co=>`<div class="contract-signature-block"><h4>Change Order #${co.number} Approval</h4>${signatureRecordHTML(co.signature,`Customer Approval · Change Order #${co.number}`)}</div>`).join('');
  el.innerHTML=`<div class="proposal-brand"><img src="urban-skyline-logo.png" alt="UrbanSkyLine Design & Build, LLC" class="proposal-logo"><div><h2>UrbanSkyLine Design & Build LLC</h2><p><strong>Current Customer Contract</strong></p></div></div><p><strong>Customer:</strong> ${p.customerName||'—'}<br><strong>Project:</strong> ${p.address||'—'} ${p.cityZip||''}<br><strong>Estimator:</strong> ${p.estimator||'—'}</p><div class="contract-summary-hero"><div><small>Original Approved Contract</small><strong>${money(t.sale)}</strong></div><div><small>Approved Change Orders</small><strong>${net>=0?'+':''}${money(net)}</strong></div><div class="current"><small>Current Contract Total</small><strong>${money(current)}</strong></div></div><h3>Original Approved Scope</h3><p class="muted">The original approved proposal remains locked and unchanged.</p><table><thead><tr><th>Room / Area</th><th>Original Work Included</th></tr></thead><tbody>${originalRooms||'<tr><td colspan="2">Original scope unavailable</td></tr>'}</tbody></table><h3>Approved Change Orders</h3><table><thead><tr><th>Change Order</th><th>Approved Change</th><th>Amount</th></tr></thead><tbody>${coRows}</tbody></table><div class="contract-total-line"><span>Current Contract Total</span><strong>${money(current)}</strong></div>${s.customerSignature?signatureRecordHTML(s.customerSignature,'Original Proposal Approval'):''}${coSignatureBlocks?`<h3>Customer Signatures</h3>${coSignatureBlocks}`:''}<p class="muted">Original approved contract ${money(t.sale)}${approved.length?` plus approved change orders totaling ${net>=0?'+':''}${money(net)}`:''}. Draft change orders are not included.</p>`;
}

function proposalScope(r){const q=roomQty(r),items=[];if(include(r,'walls'))items.push('Walls');if(include(r,'ceiling'))items.push('Ceiling');if(include(r,'baseboards'))items.push(`${Math.round(q.baseLf)} LF baseboards`);if(include(r,'doors'))items.push(`${plural(q.doors,'interior door','interior doors')}, ${r.doorSides==='One Side'?'one side':'both sides'}${r.doorCasing?' + casing/trim':''}`);if(include(r,'windows'))items.push(plural(q.windows,'window','windows'));if(include(r,'closets')){const parts=[];if(r.closetWalls)parts.push('walls');if(r.closetCeiling)parts.push('ceiling');if(r.closetBaseboards)parts.push('baseboards');items.push(`${r.closetType||'Reach-in'} closet — ${parts.join(', ')}`)}if(include(r,'crown'))items.push(`${Math.round(q.crownLf)} LF crown molding`);if(r.primerMode&&r.primerMode!=='None')items.push(r.primerMode+(r.primerMode==='Full Prime'?' — '+(r.primerTarget||'Walls'):''));const rep=repairCalc(r);rep.items.forEach(x=>items.push(`${x.qty} × ${x.label}`));return items.join('<br>')||'No work selected'}
function proposalPaint(r){const m=materialSettings(),lines=[];if(include(r,'walls')||(include(r,'closets')&&r.closetWalls))lines.push(`Walls: ${m.wallProduct} — ${r.wallColor||'Color TBD'}${r.wallSw?' ('+r.wallSw+')':''}`);if(include(r,'ceiling')||(include(r,'closets')&&r.closetCeiling))lines.push(`Ceiling: ${m.ceilingProduct} — ${r.ceilingColor||'Color TBD'}${r.ceilingSw?' ('+r.ceilingSw+')':''}`);if(include(r,'baseboards')||include(r,'doors')||include(r,'windows')||include(r,'crown')||(include(r,'closets')&&r.closetBaseboards))lines.push(`Trim: ${m.trimProduct} — ${r.trimColor||'Color TBD'}${r.trimSw?' ('+r.trimSw+')':''}`);if(r.primerMode&&r.primerMode!=='None')lines.push(`Primer: ${materialSettings().primerProduct} — ${r.primerMode}${r.primerMode==='Full Prime'?' ('+(r.primerTarget||'Walls')+')':''}`);return lines.join('<br>')}
function renderProposal(){const c=calc(),p=state.project,hasFieldEstimate=state.rooms.some(r=>r.selected&&(+((r.repairs||{}).largeRepair)||0)>0),rows=state.rooms.filter(r=>r.selected&&scopeSummary(r)!=='None').map(r=>`<tr><td><strong>${r.name}</strong></td><td>${proposalScope(r)}</td><td>${proposalPaint(r)}</td></tr>`).join('')+(state.cabinets||[]).filter(c=>c.selected!==false&&cabinetCalc(c).hours>0).map(c=>`<tr><td><strong>${c.area}</strong></td><td>Cabinet Painting — ${cabinetScopeText(c)}${c.hardware?' • Hardware removal/reinstall':''}${c.interiorLf>0?' • Interiors included':''}</td><td>${materialSettings().primerProduct} primer + ${materialSettings().trimProduct} — ${c.color||'Cabinet Color'}${c.sw?' • '+c.sw:''}</td></tr>`).join('');const fieldWarning=hasFieldEstimate?`<div class="field-estimate-warning"><strong>IMPORTANT — LARGE DRYWALL REPAIR PRICED SEPARATELY</strong><br>Large drywall repair requires a separate field estimate and is <strong>NOT included</strong> in the investment shown below.</div>`:'';const priceNote=hasFieldEstimate?`<p class="investment-scope-note"><strong>Painting scope only.</strong> Large drywall repair priced separately.</p>`:'';const courtesy=c.courtesyCredit>0?`<div class="proposal-pricing-breakdown"><div><span>Standard Investment</span><strong>${money(c.standardInvestment)}</strong></div><div class="credit"><span>Courtesy Project Credit</span><strong>−${money(c.courtesyCredit)}</strong></div><div class="final"><span>Final Investment</span><strong>${money(c.sale)}</strong></div></div>`:`<p style="font-size:28px;font-weight:800">${money(c.sale)}</p>`;$('proposalContent').innerHTML=`<div class="proposal-brand"><img src="urban-skyline-logo.png" alt="UrbanSkyLine Design & Build, LLC" class="proposal-logo"><div><h2>UrbanSkyLine Design & Build LLC</h2><p><strong>Interior Painting Proposal</strong></p></div></div><p><strong>Customer:</strong> ${p.customerName||'—'}<br><strong>Project:</strong> ${p.address||'—'} ${p.cityZip||''}<br><strong>Estimator:</strong> ${p.estimator||'—'}</p><h3>Scope of Work</h3><p>Prepare listed surfaces as needed and apply two finish coats unless specifically noted otherwise.</p><table><thead><tr><th>Room / Area</th><th>Work Included</th><th>Paint System / Color</th></tr></thead><tbody>${rows||'<tr><td colspan="3">No work selected</td></tr>'}</tbody></table>${fieldWarning}<h3>Investment</h3>${courtesy}${priceNote}<p>Estimated duration: ${c.days} day${c.days===1?'':'s'} • Estimated paint purchase: ${c.gallons} gallon${c.gallons===1?'':'s'}</p><p><strong>Notes:</strong> ${p.notes||'Standard preparation and two finish coats unless otherwise specified.'}</p>`}
function subcontractorIncludedItems(r){
  const q=roomQty(r),items=[];
  if(include(r,'walls'))items.push('Walls — all walls, 2 finish coats');
  if(include(r,'ceiling'))items.push('Ceiling — 2 finish coats');
  if(include(r,'baseboards'))items.push(`Baseboards — ${Math.round(q.baseLf)} LF, 2 finish coats`);
  if(include(r,'doors'))items.push(`${plural(q.doors,'Interior door','Interior doors')} — ${r.doorSides==='One Side'?'one side':'both sides'}${r.doorCasing?' + casing/trim':''}`);
  if(include(r,'windows'))items.push(`${plural(q.windows,'Window','Windows')} — trim/casing`);
  if(include(r,'closets')){
    const parts=[];if(r.closetWalls)parts.push('walls');if(r.closetCeiling)parts.push('ceiling');if(r.closetBaseboards)parts.push('baseboards');
    const type=r.closetType||'Reach-in',H=Math.max(0,+r.height||0);let dims='';
    if(type==='Walk-in')dims=`${Math.max(2,+r.closetLength||6)}' × ${Math.max(2,+r.closetWidth||6)}' × ${H}' H`;
    else if(type==='Reach-in')dims=`6' W × 2' D × ${H}' H`;
    const cq=closetQty(r),baseNote=r.closetBaseboards?` · ${Math.round(cq.baseLf)} LF baseboards`:'';
    items.push(`${type} closet — ${dims} — ${parts.join(', ')}${baseNote}`);
  }
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
  const isProject=isApprovedProject(), snap=isProject?state.workflow.approvedSnapshot:null;
  const baseTotals=snap?.totals||{}, p=(snap?.project||state.project||{}), sc=state.subcontractor||{};
  const approvedCO=isProject?approvedChangeOrders():[];
  const coHours=approvedCO.reduce((sum,x)=>sum+(x.type==='deduct'?-1:1)*Number(x.hours||0),0);
  const baseHours=isProject?Number(baseTotals.hours||0):calc().hours;
  const totalHours=Math.max(0,baseHours+coHours);
  const hourly=37.5;
  const basePayout=isProject?Number(baseTotals.subcontractorPayout||baseHours*hourly):calc().subcontractorPayout;
  const coPayout=approvedCO.reduce((sum,x)=>sum+(x.type==='deduct'?-1:1)*Number(x.hours||0)*hourly,0);
  const estimatedPayout=Math.max(0,basePayout+coPayout);
  const painterDays=totalHours/8;
  const agreed=String(sc.agreedPayout||'').trim()!==''?+sc.agreedPayout:estimatedPayout;
  const actualHours=String(sc.actualHours||'').trim()!==''?+sc.actualHours:null;
  const amountPaid=+sc.amountPaid||0, balance=Math.max(0,agreed-amountPaid);
  const scopeRooms=isProject?(snap.rooms||[]):state.rooms;
  const hasFieldEstimate=scopeRooms.some(r=>r.selected&&(+((r.repairs||{}).largeRepair)||0)>0);
  const rooms=scopeRooms.filter(r=>r.selected&&scopeSummary(r)!=='None').map(r=>{
    const included=subcontractorIncludedItems(r),excluded=subcontractorExcludedItems(r),paint=subcontractorPaintLines(r);
    return `<div class="wo-room"><div class="wo-room-title"><h3>${r.name}</h3><span>${r.package||'Custom'}</span></div><div class="wo-columns"><div><h4>WORK INCLUDED</h4>${included.length?`<ul class="scope-checklist">${included.map(x=>`<li>${x}</li>`).join('')}</ul>`:'<p>None</p>'}</div><div><h4>NOT INCLUDED</h4>${excluded.length?`<ul class="scope-excluded">${excluded.map(x=>`<li>${x}</li>`).join('')}</ul>`:'<p>All standard room surfaces included.</p>'}</div></div>${paint.length?`<div class="wo-paint"><h4>PAINT / COLOR</h4>${paint.map(x=>`<div>${x}</div>`).join('')}</div>`:''}</div>`;
  }).join('');
  const cabinetSource=isProject?(state.workflow?.approvedSnapshot?.cabinets||[]):(state.cabinets||[]);
  const cabinetWork=cabinetSource.filter(c=>c.selected!==false&&cabinetCalc(c).hours>0).map(c=>{const q=cabinetCalc(c);return `<div class="wo-room"><div class="wo-room-title"><h3>${c.area}</h3><span>CABINETS</span></div><div class="wo-scope-grid"><div><div class="mini-title">WORK INCLUDED</div><ul class="scope-checklist"><li>Cabinet doors: ${q.doors}</li><li>Drawer fronts: ${q.drawers}</li><li>Boxes / frames: ${q.boxLf} LF</li>${q.ends?`<li>End panels: ${q.ends}</li>`:''}${q.interiorLf?`<li>Interior surfaces: ${q.interiorLf} LF</li>`:''}${c.hardware?'<li>Remove / reinstall existing hardware</li>':''}${c.grainFill?'<li>Wood grain filling</li>':''}<li>Prep condition: ${c.condition}</li><li>Bonding primer + 2 finish coats</li></ul></div><div><div class="mini-title">PAINT / COLOR</div><p><strong>Primer:</strong> ${materialSettings().primerProduct}<br><strong>Finish:</strong> ${materialSettings().trimProduct}<br><strong>Color:</strong> ${c.color||'Cabinet Color'}${c.sw?' · '+c.sw:''}</p></div></div></div>`}).join('');
  const coSection=isProject?`<div class="wo-scope-heading"><h2>Approved Change Orders</h2><p>These approved changes are part of the current crew execution scope. Draft change orders are excluded.</p></div>${approvedCO.length?approvedCO.map(co=>`<div class="wo-room wo-change-order"><div class="wo-room-title"><h3>Change Order #${co.number}</h3><span>${co.type==='deduct'?'REMOVE':'ADD'}</span></div><p><strong>${co.description}</strong></p><ul class="scope-checklist"><li>Area: ${co.area||'Project'}</li><li>Scope: ${co.scope||coScopesLabel(co.scopes||[])}</li>${co.length?`<li>Dimensions: ${co.length} × ${co.width} × ${co.height} ft</li>`:''}${coHasScope(co,'Doors Only')&&co.doorCount?`<li>Doors: ${co.doorCount}</li>`:''}${coHasScope(co,'Windows Only')&&co.windowCount?`<li>Windows: ${co.windowCount}</li>`:''}${co.cabinet?`<li>Cabinets: ${cabinetScopeText(co.cabinet)}</li>`:''}<li>Painter-hours adjustment: ${co.type==='deduct'?'-':'+'}${Number(co.hours||0).toFixed(1)}</li></ul><small class="muted">Approved ${co.approvedAt?new Date(co.approvedAt).toLocaleString():'—'}</small></div>`).join(''):'<div class="panel"><p>No approved change orders.</p></div>'}`:'';
  const warning=hasFieldEstimate?`<div class="field-estimate-warning"><strong>LARGE DRYWALL REPAIR — FIELD ESTIMATE REQUIRED</strong><br>This repair is outside the automatic payout calculation. Confirm scope and payout before work begins.</div>`:'';
  const hasAgreed=String(sc.agreedPayout||'').trim()!=='';
  const paidStatus=sc.paymentStatus||'Not Paid';
  const paidInfo=paidStatus==='Paid'?`Paid ${money(amountPaid||agreed)}${sc.datePaid?' · '+sc.datePaid:''}`:paidStatus==='Partial'?`Partial payment ${money(amountPaid)} · Balance ${money(balance)}`:`Not paid · Balance ${money(agreed)}`;
  const hourVariance=actualHours===null?null:actualHours-totalHours, varianceText=hourVariance===null?'':`${hourVariance>=0?'+':''}${hourVariance.toFixed(1)} hr`;
  const el=$('subcontractorContent');if(!el)return;
  el.innerHTML=`<div class="wo-header"><div><div class="eyebrow">URBANSKYLINE DESIGN &amp; BUILD, LLC</div><h2>Current Subcontractor Work Order &amp; Payout</h2><p>${isProject?'Original approved scope + all approved change orders':'Current estimate scope'}</p></div><span class="private-chip">INTERNAL</span></div><div class="wo-project"><div><strong>Customer / Project</strong><br>${p.customerName||'—'}<br>${p.address||'—'} ${p.cityZip||''}</div><div><strong>Subcontractor</strong><br>${sc.name||'—'}<br>${sc.startDate?'Start: '+sc.startDate:'Start date: —'}</div></div><div class="wo-summary"><div><small>Current painter-hours</small><strong>${totalHours.toFixed(1)}</strong>${isProject&&approvedCO.length?`<span>Original ${baseHours.toFixed(1)} · changes ${coHours>=0?'+':''}${coHours.toFixed(1)}</span>`:''}${actualHours!==null?`<span>Actual ${actualHours.toFixed(1)} · ${varianceText}</span>`:''}</div><div><small>Painter-days (8 hr)</small><strong>${painterDays.toFixed(2)}</strong></div><div><small>${hasAgreed?'Agreed payout':'Current estimated payout'}</small><strong>${money(agreed)}</strong>${hasAgreed?`<span>Current estimate ${money(estimatedPayout)}</span>`:''}</div><div><small>Payment status</small><strong>${paidStatus}</strong><span>${paidInfo}</span></div></div>${warning}<div class="wo-scope-heading"><h2>Original Approved Scope</h2><p>${isProject?'Locked original work order scope.':'Complete only the surfaces and repairs specifically listed below.'}</p></div>${rooms||(!cabinetWork?'<div class="panel"><p>No rooms selected.</p></div>':'')}${cabinetWork}${coSection}<div class="wo-final"><div><h3>Current Production &amp; Payout</h3><p>Current painter-hours: <strong>${totalHours.toFixed(1)}</strong><br>Current painter-days (8 hr): <strong>${painterDays.toFixed(2)}</strong><br>Painter rate equivalent: <strong>${money2(hourly)}/hr</strong><br>Current estimated subcontractor payout: <strong>${money(estimatedPayout)}</strong>${hasAgreed?`<br>Agreed subcontractor payout: <strong>${money(agreed)}</strong>`:''}${actualHours!==null?`<br>Actual painter-hours: <strong>${actualHours.toFixed(1)}</strong><br>Hours variance: <strong>${varianceText}</strong>`:''}</p></div><div><h3>Payment</h3><p>Status: <strong>${paidStatus}</strong><br>Amount paid: <strong>${money(amountPaid)}</strong><br>Balance: <strong>${money(balance)}</strong>${sc.datePaid?`<br>Date paid: <strong>${sc.datePaid}</strong>`:''}</p></div></div>${sc.notes?`<div class="wo-notes"><h3>Job / Crew Notes</h3><p>${String(sc.notes).replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\n','<br>')}</p></div>`:''}${sc.signature?`<div class="sub-signature-card">${signatureRecordHTML(sc.signature,'Subcontractor Work Order Acknowledgment')}</div>`:`<div class="wo-signatures"><div>Subcontractor acknowledgment / signature<br><span></span></div><div>Date<br><span></span></div></div>`}<p class="wo-private-note">Internal work order. Customer sale price, material costs, gross profit and margin are intentionally excluded.</p>`;
  const sb=$('subcontractorSignBtn');if(sb)sb.textContent=sc.signature?'Re-sign Work Order Acknowledgment':'Sign Work Order Acknowledgment';
}
function bindMaterialSettings(){const m=materialSettings();[['wallProduct','wallProduct'],['wallCost','wallCost'],['ceilingProduct','ceilingProduct'],['ceilingCost','ceilingCost'],['trimProduct','trimProduct'],['trimCost','trimCost'],['primerProduct','primerProduct'],['primerCost','primerCost'],['suppliesPct','suppliesPct']].forEach(([id,k])=>{const e=$(id);if(!e)return;e.value=m[k];e.oninput=()=>{m[k]=e.type==='number'?+e.value:e.value;save();}});}
let deferredPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').hidden=false});$('installBtn').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null;$('installBtn').hidden=true}};

window.uslShareMobileSetup=async function(){const msg=$("syncMessage");try{const u=($("syncUrl")?.value||USL_SYNC.url||"").trim();if(!validSyncUrl(u))throw Error("Enter and test the Apps Script /exec URL first.");localStorage.setItem("uslSyncUrl",u);USL_SYNC.url=u;const link=new URL(location.href);link.searchParams.set("api",u);link.hash="";const text="UrbanSkyLine mobile setup link — open this once on the iPhone or iPad to enable Google address suggestions.";if(navigator.share){await navigator.share({title:"UrbanSkyLine Mobile Setup",text,url:link.toString()});if(msg){msg.textContent="Mobile Setup Link shared. Open it once on the other device.";msg.className="sync-status success"}}else if(navigator.clipboard){await navigator.clipboard.writeText(link.toString());if(msg){msg.textContent="Mobile Setup Link copied. Send it to your iPhone/iPad and open it once.";msg.className="sync-status success"}}else{prompt("Copy this Mobile Setup Link:",link.toString())}}catch(e){if(msg){msg.textContent="SETUP LINK: "+(e.message||e);msg.className="sync-status error"}}};

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
if(syncInput){syncInput.value=USL_SYNC.url;syncInput.addEventListener("change",()=>{const u=syncInput.value.trim();if(validSyncUrl(u)){localStorage.setItem("uslSyncUrl",u);USL_SYNC.url=u;addressConnectionMessage("Google address suggestions connected on this device.","success")}else if(u){addressConnectionMessage("The Google Web App URL must end in /exec.","warning")}})}
addressConnectionMessage(USL_SYNC.url?"Google address suggestions connected on this device.":"Address suggestions need one-time Google setup on this device. Use Google Sheet Sync below.",USL_SYNC.url?"success":"warning");
$("address")?.addEventListener("input",e=>{
  clearTimeout(uslAddressTimer);
  uslAddressTimer=setTimeout(()=>uslAddressSearch(e.target.value),350);
});

$('coDescription')?.addEventListener('input',()=>{coDescriptionAuto=!String($('coDescription')?.value||'').trim();});['coLength','coWidth','coHeight','coDoorCount','coWindowCount','coCabDoors','coCabDrawers','coCabBoxLf','coCabEnds'].forEach(id=>$(id)?.addEventListener('input',()=>calculateChangeOrderAuto(false)));$('coArea')?.addEventListener('change',()=>syncCoDimensions(true));document.querySelectorAll('[data-co-type]').forEach(b=>b.addEventListener('click',()=>{if($('coType'))$('coType').value=b.dataset.coType;calculateChangeOrderAuto(true);updateCoGuidedUI()}));document.querySelectorAll('[data-co-scope]').forEach(b=>b.addEventListener('click',()=>{const chosen=b.dataset.coScope;let scopes=getCoScopes();if(chosen==='Full Room'){scopes=['Full Room'];}else{scopes=scopes.filter(x=>x!=='Full Room');if(scopes.includes(chosen))scopes=scopes.filter(x=>x!==chosen);else scopes.push(chosen);if(!scopes.length)scopes=[chosen];}setCoScopes(scopes);calculateChangeOrderAuto(true);updateCoGuidedUI()}));
bindProject();bindPhoneFormatting();bindPhotoInputs();bindMaterialSettings();bindSubcontractor();renderRooms();renderCabinets();renderColors();refreshAll();renderWorkflow();if($('viewApprovedProposal'))$('viewApprovedProposal').onclick=viewApprovedProposal;

// V6.8 — installed PWA update manager. Project/settings data remains in localStorage.
(() => {
  const CURRENT_VERSION = '7.2.5';
  const banner = () => document.getElementById('updateBanner');
  const compareVersions = (a,b) => {
    const aa=String(a).split('.').map(Number), bb=String(b).split('.').map(Number);
    for(let i=0;i<Math.max(aa.length,bb.length);i++){ const d=(aa[i]||0)-(bb[i]||0); if(d) return d; }
    return 0;
  };
  async function checkForUrbanSkyLineUpdate(){
    try{
      const res=await fetch(`version.json?t=${Date.now()}`,{cache:'no-store'});
      if(!res.ok) return;
      const info=await res.json();
      const dismissed=sessionStorage.getItem('uslDismissedUpdate');
      if(compareVersions(info.version,CURRENT_VERSION)>0 && dismissed!==info.version){
        const b=banner(); if(!b) return;
        const text=document.getElementById('updateVersionText');
        if(text) text.textContent=`Version ${info.version} is ready. Your saved projects and settings will be preserved.`;
        b.dataset.version=info.version; b.hidden=false;
      }
    }catch(e){ /* Offline: keep current installed version. */ }
  }
  async function applyUrbanSkyLineUpdate(){
    const b=banner(); if(b) b.classList.add('update-working');
    const btn=document.getElementById('updateAppBtn'); if(btn) btn.textContent='Updating…';
    try{
      if('serviceWorker' in navigator){
        const reg=await navigator.serviceWorker.getRegistration();
        if(reg){ await reg.update(); if(reg.waiting) reg.waiting.postMessage({type:'SKIP_WAITING'}); }
      }
      if('caches' in window){
        const keys=await caches.keys();
        await Promise.all(keys.filter(k=>k.startsWith('urbanskyline-')).map(k=>caches.delete(k)));
      }
    }catch(e){}
    const u=new URL(location.href); u.searchParams.set('updated',Date.now()); location.replace(u.toString());
  }
  window.addEventListener('load', async () => {
    if('serviceWorker' in navigator){
      try{
        const reg=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
        reg.addEventListener('updatefound',()=>{ const w=reg.installing; if(w) w.addEventListener('statechange',()=>{ if(w.state==='installed' && navigator.serviceWorker.controller) checkForUrbanSkyLineUpdate(); }); });
      }catch(e){}
    }
    document.getElementById('updateAppBtn')?.addEventListener('click',applyUrbanSkyLineUpdate);
    document.getElementById('dismissUpdateBtn')?.addEventListener('click',()=>{ const b=banner(); if(b){ sessionStorage.setItem('uslDismissedUpdate',b.dataset.version||''); b.hidden=true; } });
    setTimeout(checkForUrbanSkyLineUpdate,1500);
    document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') checkForUrbanSkyLineUpdate(); });
  });
})();
