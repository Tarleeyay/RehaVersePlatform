/* ==========================================================================
   RehaVerse — UI prototype
   ไฟล์เดียว ไม่มี dependency วางไว้ที่ repo แล้วเปิดด้วยเบราว์เซอร์ได้เลย
   ข้อมูลเก็บในหน่วยความจำ (หายเมื่อรีเฟรช) — ดูหมายเหตุเรื่อง localStorage ท้ายไฟล์
   ========================================================================== */
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const r1=v=>Math.round(v*10)/10;
const $=id=>document.getElementById(id);
/* ไอคอนทั้งหมดมาจาก sprite ใน index.html — ไม่ใช้อิโมจิ เพราะอิโมจิล้นกล่องบรรทัด
   และหน้าตาต่างกันในแต่ละระบบปฏิบัติการ */
const ico=(n,c='')=>`<svg class="ic${c?' '+c:''}" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${n}"/></svg>`;

/* ---------- มิติความยากที่ระบบปรับได้ ---------- */
const DIMS={
 target_force  :{min:20,max:70,step:5,   harder:+1,label:'แรงเป้าหมาย',        unit:'%F_work',kidUp:'บีบแรงขึ้นอีกนิด',      kidDn:'บีบเบาลงได้',        ico:'dumbbell'},
 tolerance_band:{min:4, max:20,step:2,   harder:-1,label:'ความกว้างช่วงเป้า',  unit:'±%',     kidUp:'ช่องเป้าหมายแคบลง',    kidDn:'ช่องเป้าหมายกว้างขึ้น',ico:'target'},
 hold_time     :{min:0.5,max:4,step:0.5, harder:+1,label:'เวลาค้างแรง',        unit:'วิ',     kidUp:'ค้างนานขึ้น',          kidDn:'ค้างสั้นลง',          ico:'hourglass'},
 target_size   :{min:8, max:26,step:3,   harder:-1,label:'ขนาดเป้าหมาย',       unit:'% จอ',  kidUp:'เป้าเล็กลง',           kidDn:'เป้าใหญ่ขึ้น',        ico:'circle-dot'},
 reps          :{min:3, max:12,step:1,   harder:+1,label:'จำนวนภารกิจต่อรอบ',  unit:'ครั้ง',  kidUp:'ภารกิจเยอะขึ้น',       kidDn:'ภารกิจน้อยลง',        ico:'repeat'},
 directions    :{min:1, max:6, step:1,   harder:+1,label:'ทิศทางการเคลื่อนไหว',unit:'ทิศ',    kidUp:'ต้องเอื้อมหลายทางขึ้น',kidDn:'เอื้อมทางเดียวพอ',    ico:'compass'},
 react_window  :{min:1, max:3, step:0.25,harder:-1,label:'ช่วงเวลาตอบสนอง',    unit:'วิ',     kidUp:'ต้องรีบขึ้น',          kidDn:'มีเวลาคิดนานขึ้น',    ico:'bolt'},
 contact_zones :{min:2, max:8, step:1,   harder:+1,label:'จำนวนโซนสัมผัส',     unit:'โซน',    kidUp:'ใช้มือหลายส่วนขึ้น',   kidDn:'ใช้มือน้อยส่วนลง',    ico:'hand'},
};

/* ---------- roadmap ---------- */
const LEVELS=[
 {n:1,em:'compass',th:'สำรวจและเอื้อม',name:'Explore & Reach',goal:'สร้างความคุ้นเคยกับการใช้มือ เปิดมือ เอื้อม และปล่อยวัตถุ',adapts:['target_size','reps','directions'],modes:{
   toy:{name:'Shape Explorer',desc:'กล่องหยอดรูปทรงขนาดใหญ่ หยิบบล็อก หมุนให้ตรงมุม แล้วใส่ลงช่อง เซนเซอร์ในกล่องบอกว่าใส่ถูกช่องไหมและใช้เวลาเท่าไร',skills:['Reach','Grasp','Release','Wrist rotation']},
   game:{name:'Shape Match',desc:'กล้องตรวจจับมือ เด็กเอื้อมไปหยิบรูปทรงบนหน้าจอ แล้วลากไปใส่ช่องที่ตรงกัน',skills:['Hand tracking','Visual attention','Reach']},
   both:{name:'Magic Portal',desc:'ถือบล็อกจริงในมือ กล้อง AI ตรวจจับ พอหย่อนลงกล่อง บ้านบนหน้าจอสร้างเสร็จทันที',skills:['Reach','Release','Cause–effect']}}},
 {n:2,em:'hand',th:'เริ่มบีบ',name:'Grip Control',goal:'เริ่มฝึกการบีบ ให้เด็กรู้ว่ามือตัวเองสั่งงานได้',adapts:['target_force','hold_time','reps'],modes:{
   toy:{name:'Squeeze Animal',desc:'ของเล่นนิ่ม บีบแล้วสัตว์ร้อง มี LED เปลี่ยนสีตามแรงบีบ',skills:['Grip initiation','Force awareness']},
   game:{name:'Bubble Pop',desc:'กล้องตรวจการกำมือ เด็กกำมือเพื่อแตกฟองบนหน้าจอ ใช้ได้แม้ยังถือลูกบอลไม่ได้',skills:['Hand closing','Timing'],playable:true},
   both:{name:'Bubble Rescue',desc:'บีบ RehaBall ให้ถึงช่วงแรงเป้าหมายแล้วค้างไว้ ฟองแตก สัตว์ได้รับการช่วยเหลือ',skills:['Grip initiation','Grip endurance','Force stability'],playable:true}}},
 {n:3,em:'target',th:'คุมแรงให้แม่น',name:'Force Control',goal:'ควบคุมแรงให้อยู่ในช่วงที่กำหนด ไม่ใช่บีบให้แรงที่สุด',adapts:['target_force','tolerance_band','hold_time'],modes:{
   toy:{name:'Rocket Pump',desc:'ของเล่นมีเกจแรงแบบเข็ม เด็กบีบให้เข็มค้างอยู่ในแถบสีเขียว',skills:['Graded force','Visual matching']},
   game:{name:'Rocket Simulator',desc:'กล้องวัดระดับการกำมือ ใช้บังคับความสูงของจรวดให้บินผ่านวงแหวน',skills:['Graded hand closing']},
   both:{name:'Rocket Power',desc:'แรงบีบแปลงเป็นความสูงของจรวดโดยตรง ต้องเพิ่มและลดแรงตามตำแหน่งวงแหวน',skills:['Force modulation','Controlled release']}}},
 {n:4,em:'hourglass',th:'จังหวะและการปล่อย',name:'Timing & Release',goal:'ฝึกจังหวะ บีบให้ทัน และปล่อยให้ตรงเวลา',adapts:['react_window','reps','target_size'],modes:{
   toy:{name:'Light Catch',desc:'ไฟติดขึ้นแบบสุ่ม เด็กต้องบีบและปล่อยให้ทันก่อนไฟดับ',skills:['Reaction time','Release control']},
   game:{name:'Feed Monster',desc:'กล้องตรวจการอ้า–หุบมือ ใช้เปิดปากสัตว์ประหลาดให้ตรงจังหวะ',skills:['Hand opening','Timing']},
   both:{name:'Feed Monster+',desc:'บีบเพื่อเปิดปาก ค้างไว้จนอาหารมาถึง แล้วคลายมือให้อาหารตกลงพอดี',skills:['Reaction time','Grip–release cycle']}}},
 {n:5,em:'grid',th:'รูปแบบการจับ',name:'Grip Pattern',goal:'กระจายแรงรอบมือ ไม่กระจุกอยู่จุดเดียว',adapts:['contact_zones','hold_time','reps'],modes:{
   toy:{name:'Texture Ball',desc:'ลูกบอลหลายพื้นผิวในลูกเดียว เด็กลองจับหลายแบบ',skills:['Tactile awareness','Grip diversity']},
   game:{name:'Magic Garden Lite',desc:'กล้องตรวจรูปทรงของมือ เปลี่ยนท่ามือให้พืชโตต่างชนิดกัน',skills:['Hand shaping','Finger extension']},
   both:{name:'Magic Garden',desc:'Heat Map จากเซนเซอร์ 12 จุด ต้นไม้โตตามรูปแบบการกระจายแรง ไม่ใช่ตามความแรง',skills:['Contact distribution','Grip diversity']}}},
 {n:6,em:'waves',th:'เคลื่อนแขนพร้อมคุมมือ',name:'Functional Movement',goal:'ใช้มือร่วมกับการเคลื่อนไหวแขนและลำตัว',adapts:['directions','target_size','reps'],modes:{
   toy:{name:'Treasure Box',desc:'ถือลูกบอลเดินไปวางตามจุดต่าง ๆ ที่ผู้ดูแลจัดไว้',skills:['Reach','Trunk control','Carry']},
   game:{name:'Treasure Runner',desc:'กล้องตรวจตำแหน่งมือ เอื้อมไปหยิบและย้ายสมบัติบนหน้าจอ',skills:['Reach accuracy','Shoulder movement']},
   both:{name:'Treasure Delivery',desc:'ถือลูกบอลเดินไปยังเกาะที่กำหนด กล้องตรวจตำแหน่ง IMU ตรวจการเคลื่อนที่ FSR ตรวจแรง',skills:['Grip during movement','Trunk control']}}},
 {n:7,em:'pot',th:'กิจวัตรประจำวัน',name:'Daily Living',goal:'เลียนแบบการเคลื่อนไหวที่ใช้จริงในชีวิตประจำวัน',adapts:['reps','directions','hold_time'],modes:{
   toy:{name:'Kitchen Set',desc:'ชุดครัวของเล่น คนซุป เทน้ำ หยิบของ ตามลำดับขั้นตอน',skills:['Forearm rotation','Bilateral use']},
   game:{name:'Cooking Story',desc:'กล้องตรวจการหมุนและเคลื่อนมือ ใช้ทำอาหารตามสูตรบนหน้าจอ',skills:['Wrist motion','Sequencing']},
   both:{name:'Smart Cooking',desc:'ลูกบอลแทนวัตถุดิบ เอียงเพื่อเท หมุนเพื่อคน บีบเพื่อคั้น',skills:['Forearm rotation','Functional task']}}},
 {n:8,em:'crown',th:'ภารกิจรวม',name:'Adventure Challenge',goal:'รวมทุกทักษะไว้ในภารกิจเดียว',adapts:['target_force','hold_time','directions','reps','target_size'],modes:{
   toy:{name:'Mission Board',desc:'กระดานภารกิจ หยิบ ใส่ ย้าย เรียง ตามการ์ดที่จั่วได้',skills:['Combined skills','Planning']},
   game:{name:'Adventure Island',desc:'ภารกิจหลายรูปแบบต่อเนื่องกัน ใช้ Hand Tracking อย่างเดียว',skills:['Combined skills','Endurance']},
   both:{name:'RehaVerse Quest',desc:'ด่านเดียวรวมทุกอย่าง เดิน ถือบอล บีบ คลาย วาง เอื้อม หมุน',skills:['All axes','Motor planning']}}},
];
const MODE_META={toy:{em:'blocks',label:'Toy Only',sub:'ของเล่นอย่างเดียว ไม่ต้องมีจอ'},
                 game:{em:'gamepad',label:'Game Only',sub:'กล้อง AI อย่างเดียว ไม่ต้องมีอุปกรณ์'},
                 both:{em:'layers',label:'Toy + Game',sub:'ลูกบอลจริงทำงานร่วมกับหน้าจอ'}};

/* ---------- ต้นไม้ทักษะ : re-skin ของ Ability Profile 6 แกน ที่มีอยู่แล้ว ---------- */
const SKILLS=[
 {key:'GC',icon:'hand',name:'จับแน่น',    desc:'ความสามารถในการกำและถือของ',    levels:[2,3,5,8]},
 {key:'FA',icon:'target',name:'บีบแม่น',    desc:'ควบคุมแรงให้พอดีกับเป้าหมาย',   levels:[3,5,8]},
 {key:'FS',icon:'waves',name:'มือนิ่ง',    desc:'คุมแรงให้คงที่ไม่แกว่ง',        levels:[2,3,5]},
 {key:'EN',icon:'battery',name:'ความทน',     desc:'คงแรงได้นานตามที่ต้องใช้',      levels:[2,7]},
 {key:'TM',icon:'bolt',name:'จังหวะไว',   desc:'ตอบสนองได้ทันเวลา',             levels:[4,8]},
 {key:'CD',icon:'grid',name:'จับหลากแบบ', desc:'กระจายแรงรอบมือได้หลายรูปแบบ',  levels:[5,8]},
];
const skillLevel=score=>clamp(Math.ceil(clamp(score,0,100)/20),1,5);

/* ==========================================================================
   Adaptive engine
   ========================================================================== */
const PRIORITY=['hold_time','tolerance_band','target_force'];
const stepDim=(d,k,n)=>{const m=DIMS[k];d[k]=r1(clamp(d[k]+m.harder*m.step*n,m.min,m.max));return d};
const maxedOut=(d,k)=>DIMS[k].harder>0?d[k]>=DIMS[k].max:d[k]<=DIMS[k].min;
function newEngine(start){return{diff:{...start},pi:0,up:0,panic:0,results:[],log:[]}}
function updateEngine(e){
  const w=e.results.slice(-5);
  if(w.length<5)return{action:'wait',rate:mean(w)};
  const rate=mean(w),dim=PRIORITY[Math.min(e.pi,PRIORITY.length-1)],from=e.diff[dim];
  let action='hold';
  if(rate>=.80){e.panic=0;e.up++;if(e.up>=2){stepDim(e.diff,dim,1);e.up=0;action='up';
    if(maxedOut(e.diff,dim)&&e.pi<PRIORITY.length-1)e.pi++;}}
  else if(rate<.30){e.up=0;e.panic++;if(e.panic>=2){stepDim(e.diff,dim,-2);e.panic=0;action='down2';}}
  else if(rate<.55){e.up=0;e.panic=0;stepDim(e.diff,dim,-1);action='down';}
  else{e.up=0;e.panic=0;}
  const rec={i:e.results.length,rate,action,dim,from,to:e.diff[dim]};
  e.log.push(rec);return rec;
}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hash=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const loadOf=d=>.30*((d.target_force-20)/50)+.40*((d.hold_time-.5)/3.5)+.30*(1-(d.tolerance_band-4)/16);

/* ---------- simulated learner : สร้างประวัติของเคสจากพารามิเตอร์ในแฟ้ม ---------- */
function simulate(p){
  const rng=mulberry32(hash(p.code)), gs=()=>(rng()+rng()+rng()-1.5)*1.15;
  const e=newEngine(p.start), tr=[]; let ab=p.ability;
  for(let i=0;i<p.nTrials;i++){
    ab=clamp(ab+p.learn+rng()*p.learn*.55,0,1);
    const ok=rng()<1/(1+Math.exp(-9*((ab+.07)-loadOf(e.diff))));
    tr.push({i:i+1,live:false,ok,diff:{...e.diff},
      GSI:Math.round(clamp(34+ab*56+gs()*5,0,100)),
      GAS:Math.round(clamp(30+ab*60+gs()*5,0,100)),
      GES:Math.round(clamp((ok?80:38)+ab*20+gs()*4,0,100)),
      RT :Math.round(clamp(1520-ab*720+gs()*70,300,2500)),
      GDI:Math.round(clamp(38+ab*40+gs()*4,0,100))});
    e.results.push(ok?1:0);updateEngine(e);
  }
  return {trials:tr,engine:e,rng};
}

/* ==========================================================================
   AI Recommendation Engine
   เลือกโหมด Toy Only / Game Only / Toy+Game ให้เหมาะกับเด็กแต่ละคน
   แทนที่จะให้เลือกเองล้วน ๆ ระบบคำนวณคะแนนจากความสามารถมือ + พฤติกรรมต่อหน้าจอ
   ========================================================================== */
const REC_W1=0.6, REC_W2=0.4;   // น้ำหนัก: ความสามารถ/ความสนใจจอ vs สมาธิ
function recommendScores(ability,screenEngagement,attentionSpan){
  return {
    toy   : REC_W1*(1-screenEngagement) + REC_W2*(1-attentionSpan),
    game  : REC_W1*(1-ability)          + REC_W2*screenEngagement,
    hybrid: REC_W1*ability              + REC_W2*attentionSpan,
  };
}
const REC_KEYMAP={toy:'toy',game:'game',hybrid:'both'};
function recommendMode(p){
  const scores=recommendScores(p.ability,p.screenEngagement,p.attentionSpan);
  let order=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  if(!p.hasToy) order=order.filter(([k])=>k==='game');   // ไม่มีลูกบอล เหลือกล้องอย่างเดียว
  const top=order[0][0];
  const reasons=[];
  if(top==='toy')    reasons.push(
    `ความสนใจต่อหน้าจอยังไม่มาก (${Math.round(p.screenEngagement*100)}%)`,
    `ช่วงสมาธิสั้น (${Math.round(p.attentionSpan*100)}%) — ของเล่นจริงในมือดึงความสนใจได้ตรงกว่า`);
  if(top==='game')   reasons.push(
    `ความสามารถกำมือยังต่ำ (${Math.round(p.ability*100)}/100)`,
    `ตอบสนองต่อภาพและเสียงบนจอดี (${Math.round(p.screenEngagement*100)}%)`);
  if(top==='hybrid') reasons.push(
    `คุมมือได้ในระดับหนึ่งแล้ว (${Math.round(p.ability*100)}/100)`,
    `มีสมาธิพอจะเชื่อมของจริงกับสิ่งที่เกิดบนจอ (${Math.round(p.attentionSpan*100)}%)`);
  if(!p.hasToy) reasons.push('วันนี้ไม่มีลูกบอล ระบบจึงจำกัดตัวเลือกไว้ที่กล้องอย่างเดียว');
  return {scores,top,mode:REC_KEYMAP[top],reasons};
}
/* จำลองว่า "ทุกสัปดาห์ระบบประเมินใหม่" จะแนะนำอย่างไรเมื่อความสามารถค่อย ๆ ขึ้น */
function weeklyRecommendationTrail(p){
  const nWeeks=Math.max(3,Math.ceil(p.nTrials/6));
  const out=[];
  for(let w=0;w<nWeeks;w++){
    const mid=w*6+3;
    const ab=clamp(p.ability+p.learn*mid,0,1);
    out.push({week:w+1,...recommendMode({...p,ability:ab})});
  }
  return out;
}

/* ==========================================================================
   แฟ้มเด็ก
   ========================================================================== */
const AVATARS=['star','moon','leaf','bolt','heart','flower','rocket','diamond'];
/* แฟ้มเก่าใน localStorage เก็บ avatar เป็นอิโมจิ จึงต้องแปลงกลับให้ใช้ต่อได้ */
const AV_OLD={'🦊':'star','🐨':'moon','🐸':'leaf','🐙':'bolt','🦄':'heart','🐧':'flower','🐢':'rocket','🦁':'diamond'};
const avKey=a=>AVATARS.includes(a)?a:(AV_OLD[a]||'star');
function blankProfile(){
  return {code:nextCode(),name:'',nick:'',avatar:'star',age:6,hand:'ขวา',dx:'Spastic hemiplegia',
    macs:3,gmfcs:2,cal:{rest:.4,comf:2.0,prf:5.0},
    ability:.30,learn:.011,nTrials:24,start:{target_force:30,tolerance_band:14,hold_time:1.0},
    screenEngagement:.5,attentionSpan:.5,
    level:1,mode:'both',hasToy:true,seeds:0};
}
let codeSeq=300;
const nextCode=()=>'CP-0'+(codeSeq++);
const SEED_PROFILES=[
 {code:'CP-0142',name:'พลอย ว.',nick:'พลอย',avatar:'star',age:7,hand:'ขวา',dx:'Spastic hemiplegia (ขวา)',
  macs:3,gmfcs:2,cal:{rest:.42,comf:2.1,prf:5.8},ability:.34,learn:.010,nTrials:32,
  start:{target_force:30,tolerance_band:14,hold_time:0.5},
  screenEngagement:.35,attentionSpan:.60,level:2,mode:'both',hasToy:true,seeds:3},
 {code:'CP-0088',name:'ต้นกล้า พ.',nick:'ต้นกล้า',avatar:'moon',age:5,hand:'ซ้าย',dx:'Spastic diplegia',
  macs:2,gmfcs:2,cal:{rest:.31,comf:2.8,prf:7.4},ability:.52,learn:.015,nTrials:30,
  start:{target_force:35,tolerance_band:12,hold_time:1.5},
  screenEngagement:.55,attentionSpan:.65,level:4,mode:'both',hasToy:true,seeds:5},
 {code:'CP-0233',name:'มีนา ส.',nick:'มีนา',avatar:'bolt',age:10,hand:'ขวา',dx:'Dyskinetic CP',
  macs:4,gmfcs:3,cal:{rest:.68,comf:1.4,prf:3.2},ability:.16,learn:.006,nTrials:22,
  start:{target_force:25,tolerance_band:18,hold_time:0.5},
  screenEngagement:.75,attentionSpan:.30,level:1,mode:'game',hasToy:false,seeds:2},
];

/* ---------- ที่เก็บถาวร : localStorage ---------- */
const STORE_KEY='rehaverse.profiles.v1';
const SEQ_KEY='rehaverse.codeSeq.v1';
function loadStore(){
  try{
    const raw=localStorage.getItem(STORE_KEY);
    if(raw){const arr=JSON.parse(raw);if(Array.isArray(arr)&&arr.length)return arr;}
  }catch(e){console.warn('อ่าน localStorage ไม่ได้ ใช้ข้อมูลตัวอย่างแทน',e);}
  return SEED_PROFILES.map(p=>({...p}));
}
function saveStore(){
  try{
    localStorage.setItem(STORE_KEY,JSON.stringify(PROFILES));
    localStorage.setItem(SEQ_KEY,String(codeSeq));
  }catch(e){console.warn('บันทึก localStorage ไม่ได้ (โหมดส่วนตัว หรือพื้นที่เต็ม)',e);}
}
const PROFILES=loadStore();
try{
  const savedSeq=localStorage.getItem(SEQ_KEY);
  if(savedSeq)codeSeq=Math.max(codeSeq,+savedSeq);
  const maxExisting=Math.max(0,...PROFILES.map(p=>{
    const m=/CP-0*(\d+)/.exec(p.code||'');return m?+m[1]:0;}));
  codeSeq=Math.max(codeSeq,maxExisting+1);
}catch(e){}


/* ==========================================================================
   สถานะ
   ========================================================================== */
const S={screen:'landing',p:null,sel:1,live:0,draft:null,editingNew:false};
let H={trials:[],engine:newEngine({target_force:30,tolerance_band:14,hold_time:1})};
function loadProfile(p){S.p=p;S.sel=p.level;S.live=0;G.results=[];const r=simulate(p);H={trials:r.trials,engine:r.engine};H.rng=r.rng}

/* ==========================================================================
   VFX : ระบบอนุภาคบน canvas
   ========================================================================== */
const FX={
  cv:null,ctx:null,W:640,Hh:400,scale:1,ox:0,oy:0,parts:[],amb:[],shake:0,glow:0,
  attach(cv){this.cv=cv;this.ctx=cv.getContext('2d');this.parts=[];this.shake=0;this.glow=0;
    this.amb=Array.from({length:26},()=>({x:Math.random()*640,y:Math.random()*400,r:1+Math.random()*4,v:6+Math.random()*16,a:.06+Math.random()*.16}));
    this.resize();},
  resize(){if(!this.cv)return;const r=this.cv.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
    this.cv.width=r.width*dpr;this.cv.height=r.height*dpr;
    this.scale=Math.min(r.width/640,r.height/400)*dpr;
    this.ox=(r.width*dpr-640*this.scale)/2;this.oy=(r.height*dpr-400*this.scale)/2;},
  burst(x,y,n,colors,spd=170){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=spd*(.25+Math.random());
    this.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-40,life:1,decay:.55+Math.random()*.7,
      r:2+Math.random()*5,c:colors[(Math.random()*colors.length)|0],t:Math.random()<.42?'star':'dot',rot:Math.random()*6})}},
  ring(x,y,c){this.parts.push({x,y,life:1,decay:1.5,r:20,c,t:'ring'})},
  spark(x,y,c){const a=Math.random()*Math.PI*2;
    this.parts.push({x,y,vx:Math.cos(a)*26,vy:Math.sin(a)*26-24,life:1,decay:1.5,r:1.6+Math.random()*2.4,c,t:'dot',rot:0})},
  fly(x,y,tx,ty,c){this.parts.push({x,y,tx,ty,life:1,decay:.85,r:6,c,t:'fly',rot:0})},
  step(dt){
    for(const p of this.parts){
      p.life-=p.decay*dt;
      if(p.t==='fly'){p.x+=(p.tx-p.x)*Math.min(1,dt*4.5);p.y+=(p.ty-p.y)*Math.min(1,dt*4.5)}
      else if(p.t!=='ring'){p.vy+=250*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.985;p.rot+=dt*7}
      else p.r+=190*dt;
    }
    this.parts=this.parts.filter(p=>p.life>0);
    for(const b of this.amb){b.y-=b.v*dt;if(b.y<-8){b.y=408;b.x=Math.random()*640}}
    this.shake=Math.max(0,this.shake-dt*22);this.glow=Math.max(0,this.glow-dt*2.2);
  },
  draw(){
    const c=this.ctx;if(!c)return;
    c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,this.cv.width,this.cv.height);
    const sx=(Math.random()-.5)*this.shake,sy=(Math.random()-.5)*this.shake;
    c.setTransform(this.scale,0,0,this.scale,this.ox+sx*this.scale,this.oy+sy*this.scale);
    c.globalCompositeOperation='lighter';
    for(const b of this.amb){c.globalAlpha=b.a;c.fillStyle='#CFF3F7';c.beginPath();c.arc(b.x,b.y,b.r,0,7);c.fill()}
    for(const p of this.parts){
      c.globalAlpha=clamp(p.life,0,1);c.fillStyle=p.c;c.strokeStyle=p.c;
      if(p.t==='ring'){c.globalAlpha=clamp(p.life,0,1)*.6;c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,p.r,0,7);c.stroke()}
      else if(p.t==='star'){c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.beginPath();
        for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?p.r*.42:p.r*1.5;c.lineTo(Math.cos(a)*r,Math.sin(a)*r)}
        c.closePath();c.fill();c.restore()}
      else{c.beginPath();c.arc(p.x,p.y,p.r,0,7);c.fill()}
    }
    c.globalAlpha=1;c.globalCompositeOperation='source-over';
  }
};
window.addEventListener('resize',()=>FX.resize());

/* ==========================================================================
   Topbar
   ========================================================================== */
function topbar(){
  const pro=['dash','editor'].includes(S.screen);
  document.body.dataset.face=pro?'pro':'child';
  $('shell').classList.toggle('wide',S.screen==='dash');
  let right='';
  if(S.screen==='dash'||S.screen==='editor'){
    right=`<span class="pill mono">${S.p?S.p.code:'—'}</span>
           <span class="pill">โหมดผู้ดูแล <button data-go="login">ออก</button></span>`;
  }else if(['home','game','reward','skills'].includes(S.screen)&&S.p){
    const m=MODE_META[S.p.mode];
    right=`<span class="pill">${ico(avKey(S.p.avatar))} ${S.p.nick}</span>
           ${S.screen!=='skills'?`<span class="pill">${ico('sparkle')} ทักษะ <button data-go="skills">ดู</button></span>`:`<span class="pill">${ico('compass')} เกาะ <button data-go="home">ดู</button></span>`}
           <span class="pill">${ico(m.em)} ${m.label} <button data-go="mode">เปลี่ยน</button></span>
           <span class="pill">${ico('leaf')} ${S.p.seeds}</span>`;
  }
  $('topbar').innerHTML=`<div class="mark"><b>RehaVerse</b><span>adaptive rehab platform</span></div>${right}`;
  $('foot').innerHTML=pro
    ?'ต้นแบบส่วนติดต่อผู้ใช้ · ประวัติการเล่นในแฟ้มสร้างจาก simulated learner ที่รันผ่าน adaptive engine ตัวเดียวกับที่ใช้ตอนเล่นจริง ไม่ใช่ข้อมูลผู้ป่วยจริง · ค่า GDI ในต้นแบบเป็นค่าจำลอง · ข้อมูลเก็บในหน่วยความจำ หายเมื่อรีเฟรช'
    :'ต้นแบบส่วนติดต่อผู้ใช้ · แรงบีบจำลองด้วยการลากเมาส์แทนเซนเซอร์จริง';
}

/* ==========================================================================
   หน้าจอ
   ========================================================================== */
const SC={};

SC.landing=()=>`
<div class="screen landing">
  <div class="landcopy">
    <span class="eyebrow">RehaBall · ลูกบอลเซนเซอร์</span>
    <h1>เปลี่ยนการฝึกมือ<br>ให้เป็นการผจญภัย</h1>
    <p>ลูกบอลที่วัดแรงบีบได้จริง ทำงานร่วมกับเกมบนหน้าจอ
       ระบบดูจากการเล่นครั้งก่อนแล้วปรับความยากให้เองทุกวัน</p>
    <div class="landcta"><button class="big" data-go="login">${ico('play')} เริ่มใช้งาน</button></div>
    <div class="landstats">
      <div><b>8</b><span>ด่านผจญภัย</span></div>
      <div><b>6</b><span>ทักษะที่วัดได้</span></div>
      <div><b>3</b><span>โหมดการเล่น</span></div>
    </div>
  </div>
  <div class="landart"><div class="artwrap">
    <svg class="artbg" viewBox="0 0 420 420" aria-hidden="true">
      <circle cx="210" cy="210" r="152" fill="#fff" opacity=".5"/>
      <g class="ring"><circle cx="210" cy="210" r="184" fill="none" stroke="#fff"
        stroke-width="4" stroke-dasharray="12 17" stroke-linecap="round" opacity=".8"/></g>
      <path fill="#FFB43C" d="M62 78 66 88 77 89 69 96 71 107 62 101 53 107 55 96 47 89 58 88z"/>
      <path fill="#D6206E" d="M366 296 370 306 381 307 373 314 375 325 366 319 357 325 359 314 351 307 362 306z"/>
      <circle cx="360" cy="104" r="10" fill="#0FA3A3"/>
      <circle cx="58" cy="330" r="8" fill="#6C5CE7"/>
      <circle cx="388" cy="196" r="6" fill="#5DBE3E"/>
    </svg>
    <img src="rehaball.png" alt="ลูกบอล RehaBall" width="620" height="613">
  </div></div>
</div>`;

SC.login=()=>`
<div class="center screen"><div style="width:100%;max-width:800px">
  <div class="kh" style="text-align:center">
    <span class="eyebrow">เข้าสู่ระบบ</span><h1>วันนี้ใครจะใช้งาน</h1>
    <p style="margin:var(--s2) auto 0">เลือกให้ตรงกับคนที่ถือเครื่องอยู่ ทั้งสองฝั่งใช้ข้อมูลชุดเดียวกัน</p>
  </div>
  <div class="rolegrid">
    <button class="rolecard" data-go="pick"><span class="em">${ico('user')}</span><h3>ฉันคือเด็ก</h3>
      <p>เลือกรูปของตัวเอง แล้วเข้าไปเล่นได้เลย</p></button>
    <button class="rolecard" data-go="code"><span class="em">${ico('stethoscope')}</span><h3>ผู้ปกครอง / นักกายภาพ</h3>
      <p>ดูพัฒนาการ ตัวชี้วัด และวิธีคำนวณทั้งหมด</p></button>
    <button class="rolecard" data-newprofile="1"><span class="em">${ico('folder')}</span><h3>สร้างแฟ้มใหม่</h3>
      <p>ลงทะเบียนเด็กใหม่ ระบบออกรหัสแฟ้มให้เอง</p></button>
  </div>
</div></div>`;

SC.pick=()=>`
<div class="center screen"><div style="width:100%;max-width:760px">
  <button class="back" data-go="login">${ico('arrow-left')} กลับ</button>
  <div class="kh" style="text-align:center"><h1>หนูคือใครเอ่ย</h1>
    <p style="margin:var(--s2) auto 0">แตะรูปของตัวเองได้เลย</p></div>
  <div class="avatars">
    ${PROFILES.map(p=>`<button class="av" data-kid="${p.code}"><span class="face" data-av="${avKey(p.avatar)}">${ico(avKey(p.avatar))}</span>
      <b>${p.nick}</b><span>${p.code}</span></button>`).join('')}
    <button class="av add" data-newprofile="1"><span class="face add">${ico('plus')}</span><b>สร้างใหม่</b><span>REGISTER</span></button>
  </div>
</div></div>`;

SC.code=()=>`
<div class="center screen"><div style="width:100%;max-width:430px">
  <button class="back" data-go="login">${ico('arrow-left')} กลับ</button>
  <div class="paper">
    <span class="eyebrow" >เข้าสู่ระบบผู้ดูแล</span>
    <h2 style="font-family:var(--fd);font-weight:500;font-size:21px;margin:4px 0 var(--s3)">ใส่รหัสแฟ้มของเด็ก</h2>
    <label class="field codebox"><span>รหัสแฟ้ม (Kid ID)</span><input id="codein" placeholder="CP-0000" autocomplete="off"></label>
    <p class="err" id="codeerr">ไม่พบรหัสนี้ ลองตรวจตัวอักษรอีกครั้ง</p>
    <button class="big" id="codego">เปิดแฟ้มข้อมูล</button>
    <div class="hintcodes">${PROFILES.map(p=>`<button data-fill="${p.code}">${p.code} · ${p.nick}</button>`).join('')}</div>
    <p style="margin:var(--s3) 0 0;font-size:11.5px;color:var(--ink-2);line-height:1.65">
      ระบบจริงต้องยืนยันตัวตนสองชั้น เพราะเป็นข้อมูลสุขภาพของเด็ก</p>
  </div>
</div></div>`;

SC.toy=()=>`
<div class="screen"><button class="back" data-go="pick">${ico('arrow-left')} กลับ</button>
  <div class="kh"><span class="eyebrow">ขั้นที่ 1 จาก 2</span><h1>วันนี้มีลูกบอล RehaBall อยู่ด้วยไหม</h1>
    <p>ถ้าไม่มีก็เล่นได้ ระบบจะใช้กล้องตรวจจับมือแทน</p></div>
  <div class="rolegrid" style="max-width:600px">
    <button class="rolecard" data-toy="1"><span class="em">${ico('blocks')}</span><h3>มีลูกบอล</h3>
      <p>เล่นได้ทั้งแบบมีจอและไม่มีจอ</p></button>
    <button class="rolecard" data-toy="0"><span class="em">${ico('camera')}</span><h3>วันนี้ใช้กล้องแทน</h3>
      <p>ใช้กล้องตรวจจับมืออย่างเดียว ไม่ต้องถืออุปกรณ์</p></button>
  </div></div>`;

SC.mode=()=>{
  const opts=S.p.hasToy?['toy','both']:['game'];
  const rec=recommendMode(S.p);
  return `<div class="screen"><button class="back" data-go="toy">${ico('arrow-left')} กลับ</button>
  <div class="kh"><span class="eyebrow">ขั้นที่ 2 จาก 2</span>
    <h1>${S.p.hasToy?'วันนี้อยากเล่นแบบไหน':'วันนี้เล่นด้วยกล้อง'}</h1>
    <p>${S.p.hasToy?'เลือกได้ทุกวัน ไม่ต้องเหมือนเดิม':'ไม่มีลูกบอลก็ฝึกได้ทุกด่าน'}</p></div>
  ${opts.length>1?`<div class="airow">${ico('cpu','lg')}<span>ระบบดูจากการเล่นล่าสุดแล้วคิดว่า <b>${MODE_META[rec.mode].label}</b> เหมาะกับ${S.p.nick}วันนี้ที่สุด — จะเลือกโหมดอื่นก็ได้เสมอ</span></div>`:''}
  <div class="rolegrid" style="max-width:600px">
    ${opts.map(k=>{const m=MODE_META[k],isRec=k===rec.mode&&opts.length>1;return `<button class="rolecard ${isRec?'reco':''}" data-mode="${k}">
      ${isRec?`<span class="ribbon">${ico('cpu')} แนะนำวันนี้</span>`:''}
      <span class="em">${ico(m.em)}</span><h3>${m.label}</h3><p>${m.sub}</p>
      <p style="font-family:var(--fm);font-size:10px;color:var(--ink-3);margin-top:4px">
        ${k==='toy'?'เก็บ: แรงบีบ · เวลา':k==='game'?'เก็บ: ตำแหน่งมือ · เวลา':'เก็บ: แรงบีบ · Heat Map · IMU'}</p></button>`}).join('')}
  </div></div>`;
};

function kidAdaptChips(){
  const a=H.engine.log.filter(l=>['up','down','down2'].includes(l.action)).slice(-2);
  if(!a.length)return `<span class="kidchip">${ico('sparkle')} เริ่มที่ระดับเดิมของเมื่อวาน</span>`;
  return a.map(l=>{const d=DIMS[l.dim];
    return `<span class="kidchip ${l.action==='up'?'up':''}">${ico(d.ico)} ${l.action==='up'?d.kidUp:d.kidDn}</span>`}).join('');
}

/* ==========================================================================
   แผนที่การเดินทาง : จุดหยุดของแต่ละด่านบนถนนโค้ง
   พิกัดอยู่ในระบบ viewBox 1000x380 แล้วแปลงเป็น % ตอนวาง ทำให้ย่อขยายตามจอได้
   ========================================================================== */
const RVW=1000, RVH=380;
const ROAD=[{x:62,y:292},{x:196,y:196},{x:330,y:296},{x:464,y:186},
            {x:598,y:288},{x:732,y:178},{x:862,y:272},{x:936,y:146}];
/* Catmull-Rom -> cubic bezier : ถนนลากผ่านทุกจุดหยุดพอดี */
const smoothPath=pts=>pts.reduce((d,pt,i,a)=>{
  if(!i)return `M ${pt.x} ${pt.y}`;
  const p0=a[i-2]||a[i-1],p1=a[i-1],p2=pt,p3=a[i+1]||pt;
  return d+` C ${r1(p1.x+(p2.x-p0.x)/6)} ${r1(p1.y+(p2.y-p0.y)/6)}, `
          +`${r1(p2.x-(p3.x-p1.x)/6)} ${r1(p2.y-(p3.y-p1.y)/6)}, ${p2.x} ${p2.y}`;
},'');

SC.home=()=>{
  const p=S.p,lv=LEVELS.find(l=>l.n===S.sel),g=lv.modes[p.mode],
        others=Object.keys(lv.modes).filter(k=>k!==p.mode),d=H.engine.diff;
  const dpath=smoothPath(ROAD);
  const stops=LEVELS.map((l,i)=>{
    const st=l.n<p.level?'done':l.n===p.level?'cur':l.n===p.level+1?'next':'locked';
    const pt=ROAD[i];
    return `<button class="stop ${st} ${l.n===S.sel?'sel':''}" data-level="${l.n}"
      style="left:${r1(pt.x/RVW*100)}%;top:${r1(pt.y/RVH*100)}%;--i:${i}"
      ${l.n>p.level+1?'disabled':''} aria-label="ด่าน ${l.n} ${l.th}">
      <span class="pin">${st==='done'?ico('check'):st==='locked'?ico('lock'):ico(l.em)}</span>
      <span class="tag"><i>ด่าน ${l.n}</i><b>${l.th}</b></span>
      ${st==='next'?'<span class="here">ไปต่อที่นี่</span>':''}</button>`}).join('');
  return `<div class="screen">
  <div class="homehead">
    <div class="kh"><span class="eyebrow">แผนที่ผจญภัยของ${p.nick}</span>
      <h1>ด่านที่ ${p.level} · ${LEVELS[p.level-1].th}</h1>
      <p>แตะที่ด่านบนถนนเพื่อดูว่าจะได้เล่นอะไร</p></div>
    <button class="treebtn" data-go="skills">${ico('network')} ต้นไม้ทักษะ</button>
  </div>

  <div class="roadwrap"><div class="road" id="road">
    <svg class="roadsvg" viewBox="0 0 ${RVW} ${RVH}" preserveAspectRatio="none" aria-hidden="true">
      <path class="roadedge" d="${dpath}"/>
      <path class="roadline" id="roadline" d="${dpath}"/>
      <path class="roaddash" d="${dpath}"/>
    </svg>
    ${stops}
    <div class="traveller" id="trav" data-av="${avKey(p.avatar)}">
      <span class="pop"></span>${ico(avKey(p.avatar))}</div>
  </div></div>

  <div class="paper quest">
    <div class="questmain">
      <span class="eyebrow">ด่าน ${lv.n} · ${lv.name} · ${MODE_META[p.mode].label}</span>
      <h2>${g.name}</h2>
      <p class="desc">${g.desc}</p>
      <div class="goal">${ico('target')}<div><b>เป้าหมายของด่านนี้</b><span>${lv.goal}</span></div></div>
      <div class="chips">${g.skills.map(s=>`<span class="chip">${s}</span>`).join('')}</div>
      ${p.mode==='toy'?`
      <div class="toynote">${ico('bluetooth')}<div><b>โหมดนี้ไม่ใช้หน้าจอเล่น</b>
        <span>เด็กเล่นที่ตัวของเล่นโดยตรง หน้าจอรับข้อมูลและสรุปผลเท่านั้น · เชื่อมต่อแล้ว</span></div></div>
      <button class="big" data-go="reward">ดูสรุปหลังเล่นเสร็จ</button>`
      : g.playable?`<button class="big play" data-go="game">${ico('play')} เริ่มเล่น</button>`
      :`<button class="big" disabled>ยังไม่เปิดในต้นแบบนี้</button>`}
    </div>
    <div class="questside">
      <div class="adaptbox"><b>ระบบปรับให้แล้ววันนี้</b>
        <div class="kidchips">${kidAdaptChips()}</div>
        <small>ระบบดูจากอัตราสำเร็จครั้งก่อน แล้วเลื่อนความยากเองทีละมิติ
        ${g.playable?`<br><span class="mono">TARGET ${d.target_force}% ±${d.tolerance_band} · HOLD ${r1(d.hold_time)}s — เด็กไม่เห็นตัวเลขชุดนี้</span>`:''}</small></div>
      <div class="adaptlist"><b>สิ่งที่ระบบปรับได้</b>
        <ul class="skilllist">${lv.adapts.map(a=>`<li>${ico(DIMS[a].ico)} ${DIMS[a].label}</li>`).join('')}</ul></div>
      <div class="others"><b>โหมดอื่นของด่านนี้</b>
        ${others.map(k=>`<div class="mini"><span class="em">${ico(MODE_META[k].em)}</span>
          <div><b>${lv.modes[k].name}</b><span>${MODE_META[k].label}</span></div></div>`).join('')}</div>
    </div>
  </div></div>`;
};

/* เดินทางไปตามถนน : sample จาก path จริง แล้ววางเป็น % ทำให้ตรงเสมอทุกขนาดจอ */
function mountRoad(){
  const road=$('road'),path=$('roadline'),trav=$('trav');
  if(!road||!path||!trav)return;
  const total=path.getTotalLength();
  const put=l=>{const q=path.getPointAtLength(l);
    trav.style.left=q.x/RVW*100+'%';trav.style.top=q.y/RVH*100+'%'};
  const lenOf=pt=>{let best=0,bd=Infinity;
    for(let i=0;i<=320;i++){const l=total*i/320,q=path.getPointAtLength(l),
      dd=(q.x-pt.x)**2+(q.y-pt.y)**2;if(dd<bd){bd=dd;best=l}}return best};
  const cur=clamp(S.p.level-1,0,ROAD.length-1),from=Math.max(0,cur-1);
  const L0=lenOf(ROAD[from]),L1=lenOf(ROAD[cur]);
  const done=()=>{road.classList.add('arrived')};
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||L1===L0){put(L1);done();return}
  const T=1600,t0=performance.now();
  (function step(now){
    const k=Math.min(1,(now-t0)/T),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
    put(L0+(L1-L0)*e);
    k<1?requestAnimationFrame(step):done();
  })(t0);
}

SC.skills=()=>{
  const p=S.p,sp=skillPairs();
  const cx=50,cy=50,R=36;
  const nodes=SKILLS.map((sk,i)=>{
    const a=-Math.PI/2+i*(Math.PI*2/SKILLS.length);
    const now=sp[sk.key].last,first=sp[sk.key].first;
    return {...sk,x:cx+R*Math.cos(a),y:cy+R*Math.sin(a),lvl:skillLevel(now),now,grew:now-first};
  });
  const lines=nodes.map(n=>`<line x1="${cx}" y1="${cy}" x2="${n.x}" y2="${n.y}" stroke="rgba(6,54,74,.22)" stroke-width="1" stroke-dasharray="2.5 2.5"/>`).join('');
  const dots=nodes.map(n=>`<circle cx="${n.x}" cy="${n.y}" r="1.4" fill="rgba(6,54,74,.3)"/>`).join('');
  const top=[...nodes].sort((a,b)=>b.grew-a.grew)[0];
  return `<div class="screen">
  <button class="back" data-go="home">${ico('arrow-left')} กลับไปที่เกาะ</button>
  <div class="kh"><span class="eyebrow">ต้นไม้ทักษะของ${p.nick}</span>
    <h1>มือของ${p.nick}เก่งขึ้นเรื่อย ๆ</h1>
    <p>ทุกครั้งที่เล่น ทักษะแต่ละด้านจะได้ดาวเพิ่ม</p></div>
  <div class="skilltree">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">${lines}${dots}</svg>
    <div class="stCenter" data-av="${avKey(p.avatar)}">${ico(avKey(p.avatar))}</div>
    ${nodes.map(n=>`
      <div class="stNode" style="left:${n.x}%;top:${n.y}%">
        <div class="stIcon">${ico(n.icon)}</div>
        <b>${n.name}</b>
        <div class="stars">${Array.from({length:5},(_,i)=>`<span class="${i<n.lvl?'on':''}">${ico(i<n.lvl?'star-fill':'star')}</span>`).join('')}</div>
        <span class="stTrain">ฝึกได้จากด่าน ${n.levels.join(', ')}</span>
      </div>`).join('')}
  </div>
  <div class="paper" style="margin-top:var(--s3)">
    <span class="eyebrow" >โตเร็วที่สุดตอนนี้</span>
    <h3 style="font-family:var(--fd);font-weight:500;font-size:17px;margin:2px 0 6px">${ico(top.icon)} ${top.name}</h3>
    <p style="margin:0;font-size:13.5px;color:var(--ink-2);line-height:1.7">
      ${top.grew>3?`ทักษะนี้พัฒนาชัดเจนที่สุดในช่วงหลัง ลองเล่นด่าน ${top.levels.join(', ')} ต่อเพื่อขึ้นดาวดวงถัดไป`
        :'ทุกทักษะกำลังพัฒนาไปพร้อม ๆ กัน ลองเล่นให้ครบทุกด่านเพื่อดูว่าดาวไหนจะพุ่งก่อน'}</p>
  </div>
  </div>`;
};

/* ==========================================================================
   เกม — ไม่มีตัวเลขบนหน้าจอเด็ก
   ========================================================================== */
const G={force:0,target:0,raf:null,holdT:0,tStart:0,active:false,pressing:false,
         samples:[],results:[],popping:false,rt:0,bound:false,sparkT:0,rescued:0};

SC.game=()=>`
<div class="screen">
  <div class="gamewrap" id="stage" tabindex="0" role="application" aria-label="กดค้างแล้วลากขึ้นลงเพื่อบีบ">
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="bubGrad"><stop offset="60%" stop-color="rgba(247,229,198,.10)"/><stop offset="100%" stop-color="rgba(247,229,198,.28)"/></radialGradient>
        <linearGradient id="tubeGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#2E8C96"/><stop offset="100%" stop-color="#7FE3C0"/></linearGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="7"/></filter>
      </defs>

      <!-- พื้นทะเล -->
      <path d="M0,362 q60,-22 120,-4 t120,-2 t120,6 t120,-8 t160,10 L640,400 L0,400 Z" fill="rgba(9,45,54,.55)"/>
      <g opacity=".5" fill="#0E4A56">
        <ellipse cx="70" cy="368" rx="34" ry="12"/><ellipse cx="560" cy="374" rx="42" ry="13"/></g>

      <!-- สัตว์ที่ช่วยแล้ว -->
      <g id="saved" transform="translate(26,30)"></g>

      <!-- เกจพลัง : หอปะการัง -->
      <g id="tube" transform="translate(556,0)">
        <rect x="-26" y="46" width="52" height="304" rx="26" fill="rgba(4,32,39,.5)" stroke="rgba(247,229,198,.22)" stroke-width="2"/>
        <g id="bandG">
          <rect id="bandGlow" x="-34" y="180" width="68" height="60" rx="16" fill="#F2913D" opacity=".22" filter="url(#soft)"/>
          <rect id="band" x="-26" y="180" width="52" height="60" fill="rgba(242,145,61,.34)"/>
          <path id="bandTop" d="M -26,180 H 26" stroke="#F2913D" stroke-width="3.5" stroke-linecap="round"/>
          <path id="bandBot" d="M -26,240 H 26" stroke="#F2913D" stroke-width="3.5" stroke-linecap="round"/>
          <use id="bandStar" href="#i-star" x="32" y="206" width="20" height="20" opacity=".9" color="#FFD98A"/>
        </g>
        <rect id="fill" x="-26" y="330" width="52" height="20" rx="12" fill="url(#tubeGrad)"/>
        <g id="fishG" transform="translate(0,340)">
          <ellipse rx="17" ry="12" fill="#F7E5C6" stroke="#17262E" stroke-width="2.5"/>
          <path d="M 15,0 l 13,-9 v 18 z" fill="#F7E5C6" stroke="#17262E" stroke-width="2.5" stroke-linejoin="round"/>
          <circle cx="-6" cy="-3" r="2.6" fill="#17262E"/>
        </g>
      </g>

      <!-- ลูกศรบอกทิศ -->
      <g id="arrow" transform="translate(500,200)" opacity="0">
        <g id="arrowIn">
          <path d="M 0,-30 L 22,6 L 8,6 L 8,30 L -8,30 L -8,6 L -22,6 Z" fill="#F7E5C6" stroke="#17262E" stroke-width="2.5" stroke-linejoin="round"/>
        </g>
      </g>

      <!-- ฟองอากาศกลางจอ -->
      <g id="bubbleG" transform="translate(280,200)">
        <circle id="bubbleC" r="92" fill="url(#bubGrad)" stroke="rgba(247,229,198,.9)" stroke-width="3"/>
        <circle cx="-32" cy="-44" r="14" fill="#fff" opacity=".55"/>
        <circle cx="-14" cy="-62" r="6" fill="#fff" opacity=".4"/>
        <g id="critter">
          <ellipse cx="0" cy="9" rx="36" ry="32" fill="#F7E5C6" stroke="#17262E" stroke-width="3"/>
          <circle cx="-26" cy="-20" r="12.5" fill="#F7E5C6" stroke="#17262E" stroke-width="3"/>
          <circle cx="26" cy="-20" r="12.5" fill="#F7E5C6" stroke="#17262E" stroke-width="3"/>
          <circle id="eyeL" cx="-11" cy="3" r="4.2" fill="#17262E"/><circle id="eyeR" cx="11" cy="3" r="4.2" fill="#17262E"/>
          <path id="mouth" d="M -9,18 q 9,7 18,0" fill="none" stroke="#17262E" stroke-width="3" stroke-linecap="round"/>
        </g>
        <circle id="ring" r="108" fill="none" stroke="#F2913D" stroke-width="8" stroke-linecap="round"
                stroke-dasharray="679" stroke-dashoffset="679" transform="rotate(-90)"/>
      </g>

      <!-- มือชี้นำตอนเริ่ม -->
      <g id="tut" transform="translate(556,300)" opacity="0">
        <use href="#i-hand" x="-58" y="-24" width="30" height="30" color="#F7E5C6"/>
      </g>
    </svg>
    <canvas id="fx"></canvas>
  </div>
  <div class="gbar">
    <div class="helpline">กดค้างแล้วลากขึ้น–ลง &nbsp;·&nbsp; ปุ่มลูกศรขึ้น–ลง</div>
    <button class="quit" data-go="reward">จบภารกิจ</button>
  </div>
</div>`;

function mountGame(){
  const stage=$('stage'),bandR=$('band'),bandT=$('bandTop'),bandB=$('bandBot'),bandGlow=$('bandGlow'),
        bandStar=$('bandStar'),fillR=$('fill'),fishG=$('fishG'),arrow=$('arrow'),arrowIn=$('arrowIn'),
        ring=$('ring'),bub=$('bubbleC'),bg=$('bubbleG'),saved=$('saved'),tut=$('tut'),
        eyeL=$('eyeL'),eyeR=$('eyeR'),mouth=$('mouth');
  FX.attach($('fx'));
  const TOP=46,BOT=350,SPAN=BOT-TOP;          // เกจในพิกัด SVG
  const yOf=f=>BOT-clamp(f,0,100)/100*SPAN;

  function drawBand(){
    const d=H.engine.diff,yTop=yOf(d.target_force+d.tolerance_band),yBot=yOf(d.target_force-d.tolerance_band);
    bandR.setAttribute('y',yTop);bandR.setAttribute('height',Math.max(6,yBot-yTop));
    bandGlow.setAttribute('y',yTop-8);bandGlow.setAttribute('height',Math.max(6,yBot-yTop)+16);
    bandT.setAttribute('d',`M -26,${yTop} H 26`);bandB.setAttribute('d',`M -26,${yBot} H 26`);
    bandStar.setAttribute('y',(yTop+yBot)/2-10);
  }
  function drawSaved(){
    saved.innerHTML=Array.from({length:5},(_,i)=>
      i<G.rescued?`<use href="#i-heart" x="${i*34-13}" y="-13" width="26" height="26" color="#FFD98A"/>`
                 :`<circle cx="${i*34+11}" cy="-8" r="11" fill="rgba(247,229,198,.12)" stroke="rgba(247,229,198,.3)" stroke-width="2"/>`).join('');
  }
  drawBand();drawSaved();

  /* อินพุต */
  G.read=ev=>{const r=stage.getBoundingClientRect();G.target=clamp(100-((ev.clientY-r.top)/r.height)*100,0,100)};
  stage.addEventListener('pointerdown',ev=>{G.pressing=true;G.read(ev);ev.preventDefault();tut.setAttribute('opacity','0')});
  if(!G.bound){G.bound=true;
    window.addEventListener('pointermove',ev=>{if(G.pressing&&G.read){G.read(ev);ev.preventDefault()}},{passive:false});
    window.addEventListener('pointerup',()=>{G.pressing=false;G.target=0});}
  stage.addEventListener('keydown',e=>{
    if(e.key==='ArrowUp'){G.target=clamp(G.target+4,0,100);e.preventDefault();tut.setAttribute('opacity','0')}
    if(e.key==='ArrowDown'){G.target=clamp(G.target-4,0,100);e.preventDefault()}});

  bg.style.transition='transform .6s cubic-bezier(.2,.9,.3,1)';
  bg.style.transform='translate(280px,200px)';
  Object.assign(G,{force:0,holdT:0,samples:[],rt:0,tStart:performance.now(),active:true,popping:false,target:0,sparkT:0});
  let tutT=0;

  function endTrial(ok){
    if(!G.active)return;G.active=false;
    const d={...H.engine.diff};
    const inb=G.samples.filter(f=>Math.abs(f-d.target_force)<=d.tolerance_band);
    const base=inb.length?inb:G.samples,mu=mean(base)||1;
    const sd=Math.sqrt(mean(base.map(f=>(f-mu)**2))||0);
    H.trials.push({i:H.trials.length+1,live:true,ok,diff:d,
      GSI:Math.round(clamp(100*(1-sd/Math.max(mu,1)),0,100)),
      GAS:Math.round(clamp(100*(1-mean(G.samples.map(f=>Math.abs(f-d.target_force)))/d.target_force),0,100)),
      GES:Math.round(clamp(100*inb.length/Math.max(1,G.samples.length),0,100)),
      RT :Math.round(G.rt||0),
      GDI:Math.round(clamp(45+100*(1-sd/Math.max(mu,1))*.35+(Math.random()*8-4),0,100))});
    G.results.push(ok?1:0);H.engine.results.push(ok?1:0);S.live++;
    const rec=updateEngine(H.engine);
    drawBand();

    if(ok){
      G.popping=true;G.rescued=Math.min(5,G.rescued+1);
      bub.setAttribute('opacity','0');ring.setAttribute('stroke-dashoffset','0');
      bg.style.transform='translate(280px,110px)';
      FX.burst(280,200,54,['#F7E5C6','#F2913D','#FFD98A','#7FE3C0'],230);
      FX.ring(280,200,'#F7E5C6');FX.ring(280,200,'#F2913D');
      FX.shake=9;FX.glow=1;
      stage.classList.remove('flash');void stage.offsetWidth;stage.classList.add('flash');
      setTimeout(()=>{FX.fly(280,110,26+(G.rescued-1)*34,30,'#FFD98A');drawSaved();
        FX.burst(26+(G.rescued-1)*34,30,14,['#FFD98A','#F7E5C6'],90);},560);
      if(S.p){S.p.seeds=Math.min(9,S.p.seeds+(G.rescued%2===0?1:0));saveStore();}
    }else{
      FX.burst(280,200,10,['#8FBFC7'],70);
      mouth.setAttribute('d','M -9,22 q 9,-7 18,0');
    }
    /* ป้ายบอกการปรับความยาก แสดงเป็นไอคอนลอย ไม่มีตัวเลข */
    setTimeout(()=>{
      if(rec&&['up','down','down2'].includes(rec.action)){
        FX.burst(556,rec.action==='up'?120:300,20,[rec.action==='up'?'#7FE3C0':'#FFD98A'],110);
      }
    },1100);
    setTimeout(()=>{
      Object.assign(G,{force:0,holdT:0,samples:[],rt:0,tStart:performance.now(),active:true,popping:false,target:0});
      bub.setAttribute('opacity','1');bg.style.transform='translate(280px,200px)';
      ring.setAttribute('stroke-dashoffset','679');mouth.setAttribute('d','M -9,18 q 9,7 18,0');
    },2100);
  }

  let last=performance.now();
  function loop(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;
    G.force+=(G.target-G.force)*Math.min(1,dt*7);
    if(G.force<.4)G.force=Math.max(0,G.force-dt*20);
    const d=H.engine.diff,diff=G.force-d.target_force,good=Math.abs(diff)<=d.tolerance_band;

    if(G.active){
      G.samples.push(G.force);
      if(!G.rt&&G.force>10)G.rt=now-G.tStart;
      if(good)G.holdT+=dt;else G.holdT=Math.max(0,G.holdT-dt*1.3);
      if(G.holdT>=d.hold_time)endTrial(true);
      else if((now-G.tStart)/1000>14)endTrial(false);
      tutT+=dt;
      if(tutT<3.2&&G.force<2){tut.setAttribute('opacity',String(.5+.5*Math.sin(now/220)));
        tut.setAttribute('transform',`translate(556,${300+Math.sin(now/220)*10})`)}
      else tut.setAttribute('opacity','0');
    }

    /* เกจ */
    const y=yOf(G.force);
    fillR.setAttribute('y',y);fillR.setAttribute('height',Math.max(6,BOT-y));
    fishG.setAttribute('transform',`translate(${Math.sin(now/380)*4},${y})`);

    /* ลูกศรบอกทิศ — แทนตัวเลขทั้งหมด */
    if(!G.active||good){arrow.setAttribute('opacity','0')}
    else{
      const upNeeded=diff<0;
      const bob=Math.sin(now/180)*7*(upNeeded?-1:1);
      arrow.setAttribute('opacity',String(clamp(Math.abs(diff)/16,.45,1)));
      arrow.setAttribute('transform',`translate(500,${clamp(y,80,330)+bob})`);
      arrowIn.setAttribute('transform',upNeeded?'rotate(0)':'rotate(180)');
    }

    /* ฟองอากาศ + หน้าตาตัวละคร */
    if(!G.popping){
      bub.setAttribute('r',String(92*(good?1+Math.sin(now/130)*.04:1)));
      bub.setAttribute('stroke',good?'#7FE3C0':'rgba(247,229,198,.9)');
      const blink=Math.sin(now/900)>.97?1.2:4.2;
      eyeL.setAttribute('r',blink);eyeR.setAttribute('r',blink);
      if(good){mouth.setAttribute('d','M -11,15 q 11,11 22,0')}
      else if(G.active){mouth.setAttribute('d','M -9,18 q 9,7 18,0')}
    }
    /* ประกายเมื่ออยู่ในช่วงเป้าหมาย */
    if(good&&G.active){G.sparkT+=dt;
      if(G.sparkT>.06){G.sparkT=0;
        const a=Math.random()*Math.PI*2;FX.spark(280+Math.cos(a)*100,200+Math.sin(a)*100,'#7FE3C0');
        FX.spark(556+(Math.random()*40-20),y,'#FFD98A');}}

    ring.setAttribute('stroke-dashoffset',String(679-679*clamp(G.holdT/d.hold_time,0,1)));
    ring.setAttribute('stroke',good?'#7FE3C0':'#F2913D');

    FX.step(dt);FX.draw();
    G.raf=requestAnimationFrame(loop);
  }
  cancelAnimationFrame(G.raf);G.raf=requestAnimationFrame(loop);
}

SC.reward=()=>{
  const ok=G.results.filter(Boolean).length,n=G.results.length;
  return `<div class="center screen"><div style="width:100%;max-width:560px;text-align:center">
  <div class="rewardmark">${ico('sprout')}</div>
  <div class="kh" style="text-align:center"><h1>ภารกิจวันนี้สำเร็จแล้ว</h1>
    <p style="margin:var(--s2) auto 0">${n?`${S.p.nick}ช่วยสัตว์ได้ ${ok} ตัวจาก ${n} ครั้ง`:'เก่งมาก แล้วพรุ่งนี้มาเล่นกันใหม่'} ได้เมล็ดพันธุ์ไปปลูกในสวนแล้ว</p></div>
  <div class="paper" style="margin:var(--s4) 0">
    <div class="seedgrid">
      ${Array.from({length:9},(_,i)=>i<S.p.seeds
        ?`<div class="seed">${ico(['flower','sprout','flower','leaf','tree','sprout','flower','leaf','flower'][i])}</div>`
        :`<div class="seed empty">${ico('plus')}</div>`).join('')}</div>
    <p style="margin:var(--s3) 0 0;font-size:13px;color:var(--ink-2)">เล่นจบได้เมล็ดพันธุ์เสมอ ไม่ว่าคะแนนจะเป็นเท่าไร</p></div>
  <button class="big" data-go="home">กลับไปที่เกาะ</button>
  <button class="big ghost" style="margin-top:var(--s2)" data-go="dash">ดูหน้านักกายภาพ (สำหรับสาธิต)</button>
</div></div>`;
};

/* ==========================================================================
   ตัวแก้ไขแฟ้ม / ลงทะเบียน
   ========================================================================== */
function edPreview(p){
  const r=simulate(p),tr=r.trials,ok=tr.filter(t=>t.ok).length;
  const rl=tr.map((_,i)=>mean(tr.slice(Math.max(0,i-4),i+1).map(t=>t.ok?1:0)));
  const W=280,Hh=64;
  const pts=rl.map((v,i)=>`${i*(W/Math.max(1,rl.length-1))},${Hh-v*Hh}`).join(' ');
  const rec=recommendMode(p);
  return `<div class="preview">
    <h4>${ico(avKey(p.avatar))} ตัวอย่างเคสนี้</h4>
    <p class="cap">ระบบจำลองการเล่น ${p.nTrials} ครั้งจากค่าที่ตั้งไว้ แล้วรันผ่าน adaptive engine ตัวจริง กราฟนี้คืออัตราสำเร็จที่ได้</p>
    <svg viewBox="0 0 ${W} ${Hh}" width="100%" style="background:#fff;border-radius:8px">
      <rect x="0" y="${Hh*.2}" width="${W}" height="${Hh*.1}" fill="rgba(23,107,119,.15)"/>
      <polyline points="${pts}" fill="none" stroke="#176B77" stroke-width="2"/></svg>
    <div style="margin-top:var(--s2)">
      <div class="kv"><span>รหัสแฟ้ม</span><b>${p.code}</b></div>
      <div class="kv"><span>F_work (PRF − F_rest)</span><b>${r1(p.cal.prf-p.cal.rest)} N</b></div>
      <div class="kv"><span>อัตราสำเร็จรวม</span><b>${Math.round(ok/tr.length*100)}%</b></div>
      <div class="kv"><span>ความยากปลายทาง</span><b>${r1(r.engine.diff.hold_time)}s · ±${r.engine.diff.tolerance_band} · ${r.engine.diff.target_force}%</b></div>
      <div class="kv"><span>engine ปรับทั้งหมด</span><b>${r.engine.log.filter(l=>l.action!=='hold').length} ครั้ง</b></div>
      <div class="kv"><span>${ico('cpu')} AI แนะนำโหมด</span><b>${MODE_META[rec.mode].label}</b></div>
    </div></div>`;
}
SC.editor=()=>{
  const p=S.draft;
  const sl=(k,path,min,max,step,fmt)=>`<div class="sl">
    <label>${k}<b id="lbl-${path}">${fmt(getPath(p,path))}</b></label>
    <input type="range" data-path="${path}" min="${min}" max="${max}" step="${step}" value="${getPath(p,path)}"></div>`;
  return `<div class="screen">
  <div class="prohead"><div>
    <span class="eyebrow">${S.editingNew?'ลงทะเบียนเด็กใหม่':'แก้ไขแฟ้ม'}</span>
    <h1>${S.editingNew?'สร้างแฟ้มข้อมูลเด็ก':'แฟ้ม '+p.code}</h1>
    <div class="meta">ค่าที่ตั้งในหน้านี้ใช้สร้างเคสสำหรับสาธิต — ในระบบจริงค่าคาลิเบรตมาจากการวัด และประวัติมาจากการเล่นจริง</div></div>
    <div class="proact">
      ${S.editingNew?'':'<button class="btn warn" id="edDel">ลบแฟ้ม</button>'}
      <button class="btn" data-go="login">ยกเลิก</button>
      <button class="btn solid" id="edSave">บันทึกแฟ้ม</button></div></div>

  <div class="edgrid">
    <div>
      <div class="procard" style="margin-bottom:var(--s2)">
        <h3>ข้อมูลเด็ก</h3>
        <div style="margin-top:var(--s3)">
          <div class="frow">
            <label class="field"><span>ชื่อ–นามสกุล</span><input data-f="name" value="${p.name}" placeholder="เช่น พลอย ว."></label>
            <label class="field"><span>ชื่อเล่น (ที่เด็กเห็น)</span><input data-f="nick" value="${p.nick}" placeholder="เช่น พลอย"></label>
          </div>
          <div class="field"><span>รูปประจำตัว</span><div class="emojipick">
            ${AVATARS.map(a=>`<button data-av="${a}" data-avk="${a}" class="${a===avKey(p.avatar)?'on':''}">${ico(a)}</button>`).join('')}</div></div>
          <div class="frow3">
            <label class="field"><span>อายุ (ปี)</span><input type="number" data-f="age" value="${p.age}" min="1" max="18"></label>
            <label class="field"><span>มือที่ฝึก</span><select data-f="hand">
              ${['ขวา','ซ้าย','สองข้าง'].map(h=>`<option ${h===p.hand?'selected':''}>${h}</option>`).join('')}</select></label>
            <label class="field"><span>มีลูกบอลไหม</span><select data-f="hasToy">
              <option value="1" ${p.hasToy?'selected':''}>มี</option><option value="0" ${!p.hasToy?'selected':''}>ไม่มี</option></select></label>
          </div>
          <div class="frow3">
            <label class="field"><span>การวินิจฉัย</span><input data-f="dx" value="${p.dx}"></label>
            <label class="field"><span>MACS</span><select data-f="macs">
              ${[1,2,3,4,5].map(v=>`<option ${v===p.macs?'selected':''}>${v}</option>`).join('')}</select></label>
            <label class="field"><span>GMFCS</span><select data-f="gmfcs">
              ${[1,2,3,4,5].map(v=>`<option ${v===p.gmfcs?'selected':''}>${v}</option>`).join('')}</select></label>
          </div>
        </div>
      </div>

      <div class="procard" style="margin-bottom:var(--s2)">
        <h3>ค่าคาลิเบรต</h3>
        <p class="note">ทุกค่าในเกมอ้างอิงจาก F_work = PRF − F_rest ไม่ใช่นิวตันดิบ การเปลี่ยนค่านี้จึงเปลี่ยนความหมายของทุกเป้าหมายในระบบ</p>
        <div style="margin-top:var(--s3)">
          ${sl('F_rest — แรงขณะถือแต่ไม่บีบ','cal.rest',0,2,.01,v=>r1(v)+' N')}
          ${sl('F_comf — แรงบีบสบาย','cal.comf',.5,6,.1,v=>r1(v)+' N')}
          ${sl('PRF — แรงสูงสุดที่ทำซ้ำได้','cal.prf',1,12,.1,v=>r1(v)+' N')}
        </div>
      </div>

      <div class="procard">
        <h3>สร้างเคสสำหรับสาธิต</h3>
        <p class="note">ค่าเหล่านี้ป้อนให้ simulated learner ไม่ได้อยู่ในระบบจริง ใช้สร้างประวัติการเล่นที่สมจริงเพื่อทดสอบว่า adaptive engine ตอบสนองอย่างไรกับเด็กที่ความสามารถต่างกัน</p>
        <div style="margin-top:var(--s3)">
          ${sl('ความสามารถเริ่มต้น','ability',.05,.85,.01,v=>Math.round(v*100)+'/100')}
          ${sl('อัตราการเรียนรู้ต่อครั้ง','learn',.002,.03,.001,v=>(v*100).toFixed(1)+'%')}
          ${sl('จำนวนครั้งที่จำลอง','nTrials',10,60,1,v=>v+' trials')}
        </div>
        <h3 style="margin-top:var(--s4)">ป้อนให้ AI Recommendation Engine</h3>
        <p class="note">สองค่านี้ใช้เลือกว่าควรแนะนำ Toy Only / Game Only / Toy+Game — ในระบบจริงควรมาจาก assessment สั้น ๆ ตอนลงทะเบียน แต่ที่นี่ปรับตามใจได้เพื่อทดสอบว่าคำแนะนำเปลี่ยนไปอย่างไร</p>
        <div style="margin-top:var(--s3)">
          ${sl('ความสนใจต่อหน้าจอ','screenEngagement',0,1,.05,v=>Math.round(v*100)+'%')}
          ${sl('ช่วงสมาธิ','attentionSpan',0,1,.05,v=>Math.round(v*100)+'%')}
        </div>
        <h3 style="margin-top:var(--s4)">ค่าเริ่มต้นของ adaptive engine</h3>
        <div style="margin-top:var(--s3)">
          ${sl('แรงเป้าหมายเริ่มต้น','start.target_force',20,70,5,v=>v+' %F_work')}
          ${sl('ความกว้างช่วงเป้าเริ่มต้น','start.tolerance_band',4,20,2,v=>'± '+v+'%')}
          ${sl('เวลาค้างแรงเริ่มต้น','start.hold_time',.5,4,.5,v=>r1(v)+' วินาที')}
          ${sl('ด่านที่เริ่ม','level',1,8,1,v=>'ด่าน '+v+' · '+LEVELS[v-1].th)}
        </div>
      </div>
    </div>
    <div id="edPrev">${edPreview(p)}</div>
  </div></div>`;
};
const getPath=(o,p)=>p.split('.').reduce((a,k)=>a[k],o);
const setPath=(o,p,v)=>{const k=p.split('.');k.slice(0,-1).reduce((a,x)=>a[x],o)[k.at(-1)]=v};

/* ==========================================================================
   Dashboard
   ========================================================================== */
const roll5=a=>a.map((_,i)=>mean(a.slice(Math.max(0,i-4),i+1)));
function chartConvergence(){
  const T=H.trials,W=760,Hh=200,P={l:36,r:14,t:12,b:34};
  const rl=roll5(T.map(t=>t.ok?1:0)),n=rl.length;
  const x=i=>P.l+i*(W-P.l-P.r)/Math.max(1,n-1),y=v=>P.t+(1-v)*(Hh-P.t-P.b);
  const li=T.findIndex(t=>t.live);
  const seed=rl.map((v,i)=>T[i].live?null:`${x(i)},${y(v)}`).filter(Boolean).join(' ');
  const live=li>0?rl.map((v,i)=>i>=li-1?`${x(i)},${y(v)}`:null).filter(Boolean).join(' '):'';
  return `<svg viewBox="0 0 ${W} ${Hh}" width="100%" role="img" aria-label="อัตราสำเร็จลู่เข้าแถบเป้าหมาย">
    <rect x="${P.l}" y="${y(.8)}" width="${W-P.l-P.r}" height="${y(.7)-y(.8)}" fill="rgba(23,107,119,.13)"/>
    <line x1="${P.l}" x2="${W-P.r}" y1="${y(.8)}" y2="${y(.8)}" stroke="#176B77" stroke-dasharray="4 4"/>
    <line x1="${P.l}" x2="${W-P.r}" y1="${y(.7)}" y2="${y(.7)}" stroke="#176B77" stroke-dasharray="4 4"/>
    ${[0,.25,.5,.75,1].map(v=>`<line x1="${P.l}" x2="${W-P.r}" y1="${y(v)}" y2="${y(v)}" stroke="var(--pro-grid)"/>
      <text x="${P.l-7}" y="${y(v)+4}" text-anchor="end" font-family="var(--fm)" font-size="10" fill="var(--pro-mute)">${v*100}</text>`).join('')}
    ${T.map((t,i)=>`<circle cx="${x(i)}" cy="${t.ok?Hh-P.b+9:Hh-P.b+16}" r="2.2" fill="${t.ok?'var(--pro-good)':'var(--pro-warn)'}" opacity="${t.live?1:.4}"/>`).join('')}
    <polyline points="${seed}" fill="none" stroke="var(--pro-ink)" stroke-width="2" stroke-linejoin="round"/>
    ${live?`<polyline points="${live}" fill="none" stroke="#F2913D" stroke-width="2.5" stroke-linejoin="round"/>`:''}
    <text x="${W-P.r}" y="${y(.75)+4}" text-anchor="end" font-family="var(--fm)" font-size="10" fill="#176B77">TARGET 70–80%</text></svg>`;
}
function chartDifficulty(){
  const T=H.trials,W=760,Hh=170,P={l:36,r:14,t:12,b:22},n=T.length;
  const x=i=>P.l+i*(W-P.l-P.r)/Math.max(1,n-1);
  const nrm=(v,k)=>{const d=DIMS[k];return d.harder>0?(v-d.min)/(d.max-d.min):1-(v-d.min)/(d.max-d.min)};
  const y=v=>P.t+(1-v)*(Hh-P.t-P.b);
  const line=(k,c,dash)=>`<path d="${T.map((t,i)=>(i?'L':'M')+` ${x(i)},${y(nrm(t.diff[k],k))}`).join(' ')}" fill="none" stroke="${c}" stroke-width="2" ${dash?'stroke-dasharray="5 4"':''}/>`;
  return `<svg viewBox="0 0 ${W} ${Hh}" width="100%" role="img" aria-label="เส้นทางการปรับความยาก">
    ${H.engine.log.filter(l=>l.action!=='hold').map(l=>`<line x1="${x(Math.min(n-1,l.i))}" x2="${x(Math.min(n-1,l.i))}" y1="${P.t}" y2="${Hh-P.b}" stroke="${l.action==='up'?'rgba(62,143,92,.32)':'rgba(196,85,58,.32)'}" stroke-width="1.5"/>`).join('')}
    <line x1="${P.l}" x2="${W-P.r}" y1="${Hh-P.b}" y2="${Hh-P.b}" stroke="var(--pro-line)"/>
    ${line('hold_time','#132430',false)}${line('tolerance_band','#C4553A',true)}${line('target_force','#176B77',true)}
    <text x="${P.l-7}" y="${y(1)+4}" text-anchor="end" font-family="var(--fm)" font-size="10" fill="var(--pro-mute)">ยาก</text>
    <text x="${P.l-7}" y="${y(0)+4}" text-anchor="end" font-family="var(--fm)" font-size="10" fill="var(--pro-mute)">ง่าย</text></svg>`;
}
function skillPairs(){
  const T=H.trials,l6=T.slice(-6),f6=T.slice(0,6);
  const pair=(fk,lk)=>({first:Math.round(mean(f6.map(fk))),last:Math.round(mean(l6.map(lk)))});
  return {
    GC:{first:Math.round(clamp(S.p.ability*100,0,100)),last:Math.round(clamp((S.p.ability+S.p.learn*T.length)*100,0,100))},
    FA:pair(t=>t.GAS,t=>t.GAS),
    FS:pair(t=>t.GSI,t=>t.GSI),
    EN:pair(t=>t.GES,t=>t.GES),
    TM:pair(t=>100-t.RT/25,t=>100-t.RT/25),
    CD:pair(t=>t.GDI,t=>t.GDI),
  };
}
function radar(){
  const sp=skillPairs();
  const ax=Object.entries(sp).map(([k,v])=>[k,v.first,v.last]);
  const cx=138,cy=132,R=90;
  const pt=(i,v)=>{const a=-Math.PI/2+i*Math.PI/3,r=R*clamp(v,0,100)/100;return[cx+r*Math.cos(a),cy+r*Math.sin(a)]};
  const poly=v=>v.map((x,i)=>pt(i,x).join(',')).join(' ');
  return `<svg viewBox="0 0 276 268" width="100%" role="img" aria-label="เรดาร์ 6 แกน">
    ${[25,50,75,100].map(r=>`<polygon points="${poly(Array(6).fill(r))}" fill="none" stroke="var(--pro-grid)"/>`).join('')}
    ${ax.map((_,i)=>{const[a,b]=pt(i,100);return `<line x1="${cx}" y1="${cy}" x2="${a}" y2="${b}" stroke="var(--pro-grid)"/>`}).join('')}
    <polygon points="${poly(ax.map(a=>a[1]))}" fill="rgba(19,36,48,.06)" stroke="var(--pro-mute)" stroke-dasharray="4 4"/>
    <polygon points="${poly(ax.map(a=>a[2]))}" fill="rgba(23,107,119,.2)" stroke="#176B77" stroke-width="2"/>
    ${ax.map((a,i)=>{const[x,y]=pt(i,124);return `<text x="${x}" y="${y+4}" text-anchor="middle" font-family="var(--fm)" font-size="10.5" fill="var(--pro-mute)">${a[0]}</text>`}).join('')}
    <g font-family="var(--fm)" font-size="9.5" fill="var(--pro-mute)">
      <rect x="12" y="243" width="16" height="3" fill="#176B77"/><text x="34" y="248">ล่าสุด</text>
      <rect x="120" y="243" width="16" height="3" fill="var(--pro-mute)"/><text x="142" y="248">ช่วงแรก</text></g></svg>`;
}
function spark(v,c){const W=120,Hh=28,mn=Math.min(...v),mx=Math.max(...v);
  return `<svg viewBox="0 0 ${W} ${Hh}" width="100%" height="28"><polyline fill="none" stroke="${c}" stroke-width="1.6"
    points="${v.map((x,i)=>`${i*(W/Math.max(1,v.length-1))},${Hh-((x-mn)/Math.max(1,mx-mn))*Hh}`).join(' ')}"/></svg>`}
function heat(week){
  const rng=mulberry32(hash(S.p.code)+week);
  const base=week===1?[.95,.9,.75,.35,.2,.15,.12,.15,.25,.5,.75,.9]:[.72,.7,.66,.55,.48,.42,.4,.45,.5,.6,.68,.7];
  return `<svg viewBox="0 0 124 124" width="100%" style="max-width:118px" role="img" aria-label="แผนที่ความร้อนการสัมผัส">
  ${base.map((b,i)=>{const a=clamp(b+(rng()*.08-.04),0,1),a0=-Math.PI/2+i*Math.PI/6,a1=a0+Math.PI/6,R=52,r=22,cx=62,cy=62;
    const p=(rad,an)=>`${cx+rad*Math.cos(an)},${cy+rad*Math.sin(an)}`;
    return `<path d="M ${p(r,a0)} L ${p(R,a0)} A ${R} ${R} 0 0 1 ${p(R,a1)} L ${p(r,a1)} A ${r} ${r} 0 0 0 ${p(r,a0)} Z"
      fill="rgb(${Math.round(23+220*a)},${Math.round(107-40*a)},${Math.round(119-60*a)})" stroke="#fff" stroke-width="1.5"/>`}).join('')}</svg>`}

/* regression จริง เพื่อรายงาน slope + CI */
function slopeCI(v){
  const n=v.length;if(n<3)return null;
  const xs=v.map((_,i)=>i),mx=mean(xs),my=mean(v);
  const sxx=xs.reduce((s,x)=>s+(x-mx)**2,0);
  const b=xs.reduce((s,x,i)=>s+(x-mx)*(v[i]-my),0)/sxx;
  const a=my-b*mx;
  const se=Math.sqrt(v.reduce((s,y,i)=>s+(y-(a+b*xs[i]))**2,0)/(n-2)/sxx);
  const t=2.06, per=6;   // ~t(0.975) และ 6 trials ต่อสัปดาห์
  return {b:b*per,lo:(b-t*se)*per,hi:(b+t*se)*per};
}
const METHODS=[
 {k:'GSI',name:'Grip Stability Index — ความนิ่งของแรง',
  src:'แรงบีบรวมจาก FSR 12 จุด สุ่มตัวอย่าง 50 Hz เฉพาะช่วงที่แรงอยู่ในช่วงเป้าหมาย',
  f:`μ  = ค่าเฉลี่ยของแรงในช่วง in-band
σ  = ส่วนเบี่ยงเบนมาตรฐานของแรงช่วงเดียวกัน
CV = σ / μ

GSI = 100 × (1 − CV)      clamp 0–100`,
  why:'ใช้ CV แทน σ เปล่า ๆ เพราะเด็กที่บีบแรงกว่าย่อมมี σ สูงกว่าโดยธรรมชาติ การหารด้วยค่าเฉลี่ยทำให้เทียบข้ามระดับแรงและข้ามคนได้',
  range:'0–100 · ยิ่งสูงยิ่งนิ่ง',
  not:'ไม่ได้บอกว่าแรงถูกต้องหรือไม่ เด็กที่บีบนิ่งมากแต่ผิดเป้าจะได้ GSI สูงและ GAS ต่ำ ต้องอ่านคู่กันเสมอ'},
 {k:'GAS',name:'Grip Accuracy Score — ความแม่นของแรง',
  src:'แรงบีบตลอด trial เทียบกับ target_force ที่ engine กำหนดในขณะนั้น',
  f:`E = mean( |F(t) − F_target| )

GAS = 100 × (1 − E / F_target)   clamp 0–100`,
  why:'หารด้วย F_target เพื่อให้เป็นความคลาดเคลื่อนสัมพัทธ์ ผิดไป 5 หน่วยจากเป้า 20 หนักกว่าผิด 5 จากเป้า 60',
  range:'0–100 · ยิ่งสูงยิ่งเข้าเป้า',
  not:'ขึ้นกับ target_force ณ วันนั้น อ่านย้อนหลังต้องดู target ควบคู่ ไม่งั้นตีความผิดเมื่อ engine เปลี่ยนเป้า'},
 {k:'GES',name:'Grip Endurance Score — ความทนของการคงแรง',
  src:'สัดส่วนเวลาที่แรงอยู่ในแถบเป้าหมาย เทียบกับเวลาค้างที่ระบบเรียกร้องใน trial นั้น',
  f:`t_in  = เวลารวมที่ |F(t) − F_target| ≤ tolerance_band
t_req = hold_time ของ trial นั้น

GES = 100 × ( t_in / t_req )     clamp 0–100`,
  why:'ผูกกับ hold_time ที่ระบบตั้งไว้ ไม่ใช่เวลาสัมบูรณ์ เด็กที่ค้างได้ครบตามที่ขอควรได้คะแนนเท่ากันไม่ว่าเกณฑ์จะสั้นหรือยาว',
  range:'0–100 · 100 = คงแรงได้ครบตามที่ขอ',
  not:'ไม่ได้แยกว่าที่หลุดออกจากแถบเป็นเพราะแรงตกหรือแรงเกิน ต้องดูกราฟแรงดิบประกอบ'},
 {k:'RT',name:'Reaction Time — เวลาตอบสนอง',
  src:'เวลาจากสัญญาณเริ่มบนหน้าจอ จนแรงบีบข้ามเกณฑ์เริ่มต้น',
  f:`t_stim  = เวลาที่เกมแสดงสัญญาณ
t_onset = เวลาแรกที่ F(t) > 10% F_work

RT = t_onset − t_stim            (ms)`,
  why:'เกณฑ์ 10% F_work เลือกให้สูงกว่า F_rest และสัญญาณรบกวน แต่ต่ำพอจะจับ "จุดที่เด็กตั้งใจเริ่มบีบ" ไม่ใช่จุดที่บีบสำเร็จ',
  range:'มิลลิวินาที · ตัวเดียวในชุดนี้ที่ค่าต่ำ = ดี',
  not:'เกณฑ์ 10% เป็นค่าที่ทีมเลือกเอง ยังไม่ได้หาจากข้อมูลจริง ควรหา cut-off ที่แยกการตั้งใจบีบออกจากสัญญาณรบกวนได้ดีที่สุดแล้วรายงานวิธีเลือก · RT ที่ยาวขึ้นอาจมาจากความล้า ความไม่เข้าใจโจทย์ หรือ spasticity'},
 {k:'GDI',name:'Grip Distribution Index — การกระจายแรง',
  src:'แรงจาก FSR ทั้ง 12 จุดที่จุดสูงสุดของการบีบในแต่ละ trial',
  f:`pᵢ    = Fᵢ / Σ F
H     = − Σ pᵢ · log pᵢ        (Shannon entropy)
H_max = log(12)

GDI = 100 × H / H_max`,
  why:'ใช้ entropy เพราะต้องการวัด "ความกระจาย" โดยไม่สนใจว่ากระจายไปทางไหน ซึ่งเหมาะกับระบบที่ไม่บังคับวิธีจับ',
  range:'0–100 · 100 = แรงเท่ากันทุกจุด · 0 = ลงจุดเดียว',
  not:'GDI สูงไม่ได้ดีกว่าเสมอไป การหยิบแบบปลายนิ้วต้องการค่าต่ำโดยธรรมชาติ อ่านเป็นแนวโน้มของเด็กคนเดียวกัน ห้ามเทียบข้ามคน และห้ามระบุว่าเซนเซอร์ตัวใดคือนิ้วใด'},
 {k:'SLOPE',name:'อัตราการเปลี่ยนแปลงรายสัปดาห์',
  src:'ค่าตัวชี้วัดรายครั้ง อย่างน้อย 3 จุดขึ้นไป (ในหน้านี้คำนวณสดจากข้อมูลในแฟ้ม)',
  f:`b  = Σ(xᵢ−x̄)(yᵢ−ȳ) / Σ(xᵢ−x̄)²
SE = √( Σ(yᵢ−ŷᵢ)² / (n−2) ) / √( Σ(xᵢ−x̄)² )

95% CI = b ± t(0.975, n−2) × SE
แล้วคูณด้วยจำนวน trial ต่อสัปดาห์`,
  why:'รายงาน slope พร้อมช่วงความเชื่อมั่น แทน "ดีขึ้น 18%" เพราะการเทียบสองจุดไวต่อวันที่เด็กเหนื่อยหรือมีสมาธิดีเป็นพิเศษ',
  range:'จุดต่อสัปดาห์ · ถ้าช่วงความเชื่อมั่นคร่อมศูนย์ แปลว่ายังสรุปไม่ได้',
  not:'ไม่ใช่หลักฐานว่าเกิดการฟื้นฟู อาจเป็นการเรียนรู้เกม ต้องยืนยันด้วยงานที่เด็กไม่เคยเล่นหรือแบบประเมินมาตรฐาน'},
 {k:'RATE',name:'Success rate ที่ adaptive engine ใช้ตัดสิน',
  src:'ผลสำเร็จ/ล้มเหลวของ 5 trials ล่าสุด (rolling window)',
  f:`rate = Σ ผลสำเร็จ 5 ครั้งล่าสุด / 5

rate ≥ 0.80 ติดกัน 2 window → เพิ่มความยาก 1 ขั้น
0.55 ≤ rate < 0.80          → คงเดิม
0.30 ≤ rate < 0.55          → ลดความยาก 1 ขั้น ทันที
rate < 0.30 ติดกัน 2 window → ลด 2 ขั้น + เปลี่ยนเกม`,
  why:'ตั้งเป้า 70–80% ตามแนวคิด Challenge Point Framework (Guadagnoli & Lee, 2004) · ขึ้นต้องยืนยัน 2 window แต่ลงทำทันที เพราะต้นทุนของการทำให้เด็กท้อสูงกว่า',
  range:'0–1',
  not:'window 5 ครั้งเลือกให้ตอบสนองเร็วพอในเซสชันสั้น ยังไม่ได้ทดสอบว่าเป็นค่าที่เหมาะที่สุด'},
];

SC.dash=()=>{
  const p=S.p,T=H.trials,l8=T.slice(-8);
  const mk=(k,label,inv)=>{const v=T.map(t=>t[k]),s=slopeCI(v);
    const cross=s&&s.lo<0&&s.hi>0;
    const good=s&&(inv?s.b<0:s.b>0);
    return{k,label,val:Math.round(mean(l8.map(t=>t[k]))),unit:k==='RT'?' ms':'/100',
      spark:inv?v.map(x=>2500-x):v,good,
      txt:s?`${s.b>0?'+':''}${r1(s.b)}${k==='RT'?' ms':' จุด'}/สัปดาห์<br>95% CI ${r1(s.lo)} – ${r1(s.hi)}`:'ข้อมูลไม่พอ',cross}};
  const M=[mk('GSI','ความนิ่งของแรง'),mk('GAS','ความแม่นของแรง'),mk('GES','ความทนของการกำ'),
           mk('RT','เวลาตอบสนอง',true),mk('GDI','การกระจายแรง')];
  const rows=H.engine.log.slice(-9).reverse().map(l=>{
    const cls=l.action==='up'?'up':(l.action==='hold'?'hold':'down'),live=l.i>p.nTrials;
    const nm={up:'เพิ่มความยาก',down:'ลดความยาก',down2:'ลด 2 ขั้น + เปลี่ยนเกม',hold:'คงเดิม'}[l.action]||l.action;
    return `<tr><td>${l.i}</td><td>${Math.round(l.rate*100)}%</td>
      <td><span class="act ${live?'live':cls}">${nm}</span></td><td>${DIMS[l.dim].label}</td>
      <td>${l.from} → ${l.to} ${DIMS[l.dim].unit}</td></tr>`}).join('');
  const weak=M.filter(m=>m.k!=='RT').sort((a,b)=>a.val-b.val)[0];
  const sp=skillPairs();
  const recTop=recommendMode(p);

  return `<div class="screen">
  <div class="prohead"><div>
    <span class="eyebrow">แฟ้มผู้รับบริการ</span>
    <h1>${ico(avKey(p.avatar))} ${p.name||p.nick} · อายุ ${p.age} ปี · ${p.dx}</h1>
    <div class="meta">${p.code} · MACS ${p.macs} · GMFCS ${p.gmfcs} · มือที่ฝึก: ${p.hand} · ${T.length} trials สะสม<br>
    คาลิเบรต — F_rest ${r1(p.cal.rest)} N · F_comf ${r1(p.cal.comf)} N · PRF ${r1(p.cal.prf)} N · F_work ${r1(p.cal.prf-p.cal.rest)} N</div></div>
    <div class="proact"><button class="btn">ส่งออก CSV</button>
      <button class="btn" data-editprofile="1">แก้ไขแฟ้ม</button>
      <button class="btn solid">ล็อกพารามิเตอร์เอง</button></div></div>

  <nav class="subnav"><a href="#s-ov">ภาพรวม</a><a href="#s-ai">AI แนะนำโหมด</a><a href="#s-en">Adaptive engine</a>
    <a href="#s-pt">รูปแบบการจับ</a><a href="#s-me">วิธีคำนวณค่า</a><a href="#s-rc">คำแนะนำ</a></nav>

  <div id="s-ov" class="pgrid">
    <div class="procard"><h3>โปรไฟล์ความสามารถ 6 แกน</h3>
      <p class="note">GC ความสามารถกำมือ · FA ความแม่น · FS ความนิ่ง · EN ความทน · TM เวลาตอบสนอง · CD การกระจายแรง — อิงกับ calibration ของเด็กคนนี้ ไม่ใช่ค่ามาตรฐานประชากร</p>
      ${radar()}
      <div class="starlegend">${SKILLS.map(sk=>{const lvl=skillLevel(sp[sk.key].last),now=sp[sk.key].last;
        return `<div class="slcell"><span>${ico(sk.icon)} ${sk.key}</span>
          <span class="stars sm">${Array.from({length:5},(_,i)=>`<span class="${i<lvl?'on':''}">${ico(i<lvl?'star-fill':'star')}</span>`).join('')}</span>
          <span class="num">${now}/100</span></div>`}).join('')}</div>
      <p class="note" style="margin-top:8px">แถวดาวคือสิ่งที่เด็กเห็นในต้นไม้ทักษะ ตัวเลขข้างหลังคือค่าเดียวกันที่แดชบอร์ดนี้ใช้ — สองมุมมองอ่านจากข้อมูลชุดเดียวกัน</p></div>
    <div>
      <div class="mcards">${M.map(m=>`<div class="mc"><div class="k">${m.k}</div>
        <div class="v">${m.val}<span style="font-size:13px;color:var(--pro-mute)">${m.unit}</span></div>
        <div class="n">${m.label}</div>${spark(m.spark.slice(-14),m.k==='RT'?'#3E8F5C':'#176B77')}
        <div class="slope ${m.cross?'flat':''}">${m.txt}</div></div>`).join('')}</div>
      <div class="procard" style="margin-top:var(--s2)">
        <span class="eyebrow">หลักฐานว่า adaptive engine ทำงาน</span>
        <h3>อัตราสำเร็จลู่เข้าแถบเป้าหมาย 70–80%</h3>
        <p class="note">เส้นดำ = ประวัติในแฟ้ม · เส้นส้ม = trials ที่เพิ่งเล่นในมุมมองเด็ก · จุดล่างคือผลรายครั้ง — ระบบไม่ได้เลือกระดับความยาก แต่เลือกอัตราสำเร็จเป้าหมาย แล้วปล่อยให้ความยากเลื่อนตามเอง</p>
        ${chartConvergence()}</div>
    </div></div>

  <div class="procard" id="s-ai" style="margin-top:var(--s3)">
    <span class="eyebrow">AI Recommendation Engine · ระบบเสนอ ไม่ได้ตัดสินใจแทน</span>
    <h3>วันนี้ระบบแนะนำ ${MODE_META[recTop.mode].label} สำหรับ${p.nick}</h3>
    <p class="note">คำนวณจากความสามารถกำมือ (${Math.round(p.ability*100)}/100) เทียบกับความสนใจต่อหน้าจอ (${Math.round(p.screenEngagement*100)}%)
      และช่วงสมาธิ (${Math.round(p.attentionSpan*100)}%) — สองค่าหลังตั้งไว้ตอนลงทะเบียน ปรับได้ที่ปุ่ม "แก้ไขแฟ้ม"</p>
    <div class="recrows">${Object.entries(recTop.scores).map(([k,v])=>{
      const lbl=k==='toy'?'Toy Only':k==='game'?'Game Only':'Toy + Game';
      const avail=p.hasToy||k==='game', top=k===recTop.top;
      return `<div class="recrow ${top?'top':''} ${avail?'':'off'}">
        <span class="rl">${lbl}</span><div class="rbar"><i style="width:${Math.round(v*100)}%"></i></div>
        <span class="rv">${Math.round(v*100)}%</span>${!avail?'<span class="rna">ไม่มีลูกบอลวันนี้</span>':''}</div>`}).join('')}</div>
    <ul class="reclist">${recTop.reasons.map(r=>`<li>${r}</li>`).join('')}</ul>
    <span class="eyebrow" style="margin:var(--s3) 0 7px;display:block">ถ้าประเมินใหม่ทุกสัปดาห์ (จำลองจากอัตราการเรียนรู้ในแฟ้ม)</span>
    <div class="trailrow">${weeklyRecommendationTrail(p).map((w,i,arr)=>
      `<span class="trailstep ${i===arr.length-1?'now':''}" title="สัปดาห์ ${w.week} · ${MODE_META[w.mode].label}">${ico(MODE_META[w.mode].em)}</span>${i<arr.length-1?'<span class="arrow">→</span>':''}`).join('')}</div>
  </div>

  <div class="stack">
    <div class="procard" id="s-en"><span class="eyebrow">เส้นทางการปรับความยาก</span>
      <h3>ปรับได้ครั้งละ 1 มิติเท่านั้น</h3>
      <p class="note"><b style="color:#132430">━ เวลาค้างแรง</b> · <b style="color:#C4553A">┈ ความกว้างช่วงเป้า</b> · <b style="color:#176B77">┈ แรงเป้าหมาย</b> — แถบแนวตั้งคือจุดที่ engine ตัดสินใจ การล็อกให้ปรับทีละมิติทำให้ตีความได้ว่าเด็กเปลี่ยนแปลงเพราะอะไร</p>
      ${chartDifficulty()}
      <table class="log"><thead><tr><th>TRIAL</th><th>SUCCESS (5)</th><th>ACTION</th><th>DIMENSION</th><th>FROM → TO</th></tr></thead><tbody>${rows}</tbody></table></div>

    <div class="row2">
      <div class="procard" id="s-pt"><span class="eyebrow">รูปแบบการสัมผัส</span>
        <h3>การกระจายแรงรอบลูกบอล</h3>
        <p class="note">เซนเซอร์ 12 จุดรอบลูกบอล ระบบไม่ระบุว่าจุดใดคือนิ้วใด เพราะไม่ได้บังคับวิธีจับ</p>
        <div style="display:flex;gap:20px;align-items:center;margin-top:var(--s3);flex-wrap:wrap">
          <div style="text-align:center">${heat(1)}<div style="font-family:var(--fm);font-size:10px;color:var(--pro-mute);margin-top:7px">ช่วงแรก</div></div>
          <div style="text-align:center">${heat(5)}<div style="font-family:var(--fm);font-size:10px;color:var(--pro-mute);margin-top:7px">ล่าสุด</div></div>
          <p class="note" style="flex:1;min-width:160px">แรงเคยกระจุกที่ฐานนิ้วโป้งกับฝ่ามือ ตอนนี้กระจายมากขึ้น อ่านเป็นแนวโน้มของเด็กคนเดียวกันเท่านั้น</p></div></div>

      <div class="procard" id="s-rc"><span class="eyebrow">ข้อเสนอจากระบบ · ต้องให้นักบำบัดอนุมัติ</span>
        <h3>คำแนะนำสัปดาห์หน้า</h3>
        <div style="margin-top:var(--s2)">
          <div class="rec"><span class="n">01</span><div><b>เพิ่มเกมที่ฝึก ${weak.label} เป็น 3 ครั้ง/สัปดาห์</b>
            <p>${weak.k} เป็นค่าที่ต่ำที่สุดในชุดตัวชี้วัดตอนนี้ (${weak.val}/100) ${weak.cross?'และช่วงความเชื่อมั่นของอัตราการเปลี่ยนแปลงยังคร่อมศูนย์ จึงยังสรุปไม่ได้ว่าดีขึ้นจริง':''}</p></div></div>
          <div class="rec"><span class="n">02</span><div><b>คงแรงเป้าหมายไว้ที่ ${H.engine.diff.target_force}% อีก 1 สัปดาห์</b>
            <p>engine กำลังไล่ปรับ ${DIMS[PRIORITY[Math.min(H.engine.pi,2)]].label} อยู่ การเปลี่ยนหลายมิติพร้อมกันจะทำให้แยกไม่ออกว่าผลมาจากอะไร</p></div></div>
          <div class="rec"><span class="n">03</span><div><b>ตรวจสอบสัญญาณล้า</b>
            <p class="flag" style="margin-top:4px">${ico('flag')} ระบบตัดจบเซสชันเอง 1 ครั้ง — แรงสูงสุดใน block สุดท้ายตกจาก block แรกเกินร้อยละ 20</p></div></div>
        </div></div>
    </div>

    <div id="s-me">
      <div class="procard" style="margin-bottom:var(--s2)">
        <span class="eyebrow">ที่มาของข้อมูล</span><h3>จากเซนเซอร์ถึงตัวเลขบนหน้าจอนี้</h3>
        <p class="note">ทุกค่าในแฟ้มนี้คำนวณจากสัญญาณดิบ ไม่มีค่าใดที่กรอกด้วยมือ ขั้นตอนก่อนคำนวณมีดังนี้</p>
        <div class="pipe">
          <div class="st"><i>01 · SENSING</i><b>สัญญาณดิบ</b><span>FSR 12 จุด @50 Hz · IMU 6 แกน @50 Hz · กล้อง 30 fps เฉพาะโหมดที่ใช้</span></div>
          <div class="st"><i>02 · CONDITIONING</i><b>กรองสัญญาณ</b><span>Low-pass 12 Hz ตัดการสั่นของเซนเซอร์ โดยยังเก็บย่านความถี่ของ tremor ไว้วิเคราะห์ได้</span></div>
          <div class="st"><i>03 · BASELINE</i><b>หัก F_rest</b><span>ลบแรงขณะถือแต่ไม่บีบออก เพื่อไม่ให้ tone ที่ค้างอยู่ถูกนับเป็นการบีบตั้งใจ</span></div>
          <div class="st"><i>04 · NORMALISE</i><b>แปลงเป็น %F_work</b><span>F_work = PRF − F_rest = ${r1(p.cal.prf-p.cal.rest)} N สำหรับเด็กคนนี้</span></div>
          <div class="st"><i>05 · SEGMENT</i><b>ตัดเป็น trial</b><span>แบ่งตามสัญญาณเริ่ม–จบของเกม แล้วจึงคำนวณตัวชี้วัดรายครั้ง</span></div>
        </div>
        <div class="warnbox"><b>ข้อจำกัดที่ต้องอ่านคู่กับทุกค่าเสมอ</b><br>
          ค่าทั้งหมดวัด "สิ่งที่เด็กทำในเกม" ไม่ใช่ "ความสามารถของมือในชีวิตประจำวัน" การเชื่อมสองอย่างนี้ต้องอาศัยแบบประเมินมาตรฐาน เช่น Box and Block Test หรือ ABILHAND-Kids ควบคู่กัน และค่าแรงที่วัดได้อาจไม่ตรงกับความตั้งใจของเด็กเมื่อมี spasticity ให้ดู F_rest ประกอบทุกครั้ง</div>
      </div>
      ${METHODS.map(m=>`<details class="meth"><summary><span class="tagk">${m.k}</span> ${m.name}</summary>
        <div class="body"><div class="formula">${m.f}</div>
        <table class="deft">
          <tr><th>สัญญาณต้นทาง</th><td>${m.src}</td></tr>
          <tr><th>ทำไมใช้สูตรนี้</th><td>${m.why}</td></tr>
          <tr><th>ช่วงค่าและการอ่าน</th><td>${m.range}</td></tr>
          <tr><th>สิ่งที่ค่านี้ไม่ได้บอก</th><td>${m.not}</td></tr>
        </table></div></details>`).join('')}
    </div>
  </div></div>`;
};

/* ==========================================================================
   Router
   ========================================================================== */
/* พรีวิว animation ได้โดยไม่ต้องไปแก้ค่าใน OS: เปิด ?motion=1 ปิด ?motion=0
   ค่าปกติยังเคารพ prefers-reduced-motion ของผู้ใช้จริงเหมือนเดิม */
(function motionPref(){
  const q=new URLSearchParams(location.search).get('motion');
  if(q==='1')try{localStorage.setItem('rehaverse.motion','on')}catch(e){}
  if(q==='0')try{localStorage.removeItem('rehaverse.motion')}catch(e){}
  let on=false;try{on=localStorage.getItem('rehaverse.motion')==='on'}catch(e){}
  if(on)document.documentElement.dataset.motion='on';
})();
const stillMode=()=>matchMedia('(prefers-reduced-motion: reduce)').matches
                 && document.documentElement.dataset.motion!=='on';

function paint(){
  cancelAnimationFrame(G.raf);
  $('root').innerHTML=SC[S.screen]();
  topbar();
  if(S.screen==='game')mountGame();
  if(S.screen==='home')mountRoad();
  window.scrollTo({top:0,behavior:'instant'});
}
/* เปลี่ยนหน้าด้วยม่าน : สลับเนื้อหาตอนที่ม่านบังจออยู่ จึงไม่เห็นการกระพริบ
   ใช้ timer แทน animationend เพราะถ้า animation ถูกปิด event จะไม่ยิงแล้วค้าง
   สุ่มรูปแบบและสีทุกครั้ง แต่ไม่ซ้ำอันเดิมติดกัน จะได้ไม่จำเจ */
const WIPE=300;
const WIPE_STYLES=['curtain','iris','doors','blob','stripes'];
const WIPE_TINTS=['var(--grape)','var(--sun)','var(--berry)','var(--aqua)','var(--grass)'];
let prevScreen=null,wiping=false,lastWipe=-1,lastTint=-1;
const pickNot=(n,last)=>{let i;do{i=Math.floor(Math.random()*n)}while(n>1&&i===last);return i};
function render(){
  const changed=prevScreen!==null&&S.screen!==prevScreen;
  prevScreen=S.screen;
  if(!changed||wiping||stillMode()){paint();return}
  wiping=true;
  lastWipe=pickNot(WIPE_STYLES.length,lastWipe);
  lastTint=pickNot(WIPE_TINTS.length,lastTint);
  const w=$('wipe'),style='s-'+WIPE_STYLES[lastWipe];
  w.style.setProperty('--tint',WIPE_TINTS[lastTint]);
  w.className='wipe on '+style+' in';
  setTimeout(()=>{
    paint();
    w.className='wipe on '+style+' out';
    setTimeout(()=>{w.className='wipe';wiping=false},WIPE);
  },WIPE);
}
function openEditor(p,isNew){S.draft=p;S.editingNew=isNew;S.screen='editor';render()}

document.addEventListener('click',e=>{
  const go=e.target.closest('[data-go]');
  if(go){const t=go.dataset.go;
    if(t==='login'){S.screen='login';S.p=null}else S.screen=t;
    render();return;}
  if(e.target.closest('[data-newprofile]')){openEditor(blankProfile(),true);return}
  if(e.target.closest('[data-editprofile]')){openEditor(S.p,false);return}
  const kid=e.target.closest('[data-kid]');
  if(kid){loadProfile(PROFILES.find(x=>x.code===kid.dataset.kid));S.screen='toy';render();return}
  const fill=e.target.closest('[data-fill]');
  if(fill){$('codein').value=fill.dataset.fill;return}
  if(e.target.closest('#codego')){
    const c=($('codein').value||'').trim().toUpperCase();
    const p=PROFILES.find(x=>x.code.toUpperCase()===c);
    if(!p){$('codeerr').classList.add('on');return}
    loadProfile(p);S.screen='dash';render();return;}
  const toy=e.target.closest('[data-toy]');
  if(toy){S.p.hasToy=toy.dataset.toy==='1';if(!S.p.hasToy)S.p.mode='game';S.screen='mode';render();return}
  const md=e.target.closest('[data-mode]');
  if(md){S.p.mode=md.dataset.mode;S.screen='home';render();return}
  const lv=e.target.closest('[data-level]');
  if(lv){S.sel=+lv.dataset.level;render();return}
  const av=e.target.closest('[data-av]');
  if(av){S.draft.avatar=av.dataset.av;render();return}
  if(e.target.closest('#edSave')){
    const d=S.draft;
    if(!d.nick)d.nick=d.name||'เด็กใหม่';
    if(S.editingNew)PROFILES.push(d);
    saveStore();
    loadProfile(d);S.screen='dash';render();return;}
  if(e.target.closest('#edDel')){
    const i=PROFILES.indexOf(S.draft);if(i>=0)PROFILES.splice(i,1);
    saveStore();
    S.p=null;S.screen='login';render();return;}
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.path){
    const v=+t.value;setPath(S.draft,t.dataset.path,v);
    const lb=$('lbl-'+t.dataset.path);
    if(lb){const fmts={'cal.rest':v=>r1(v)+' N','cal.comf':v=>r1(v)+' N','cal.prf':v=>r1(v)+' N',
      'ability':v=>Math.round(v*100)+'/100','learn':v=>(v*100).toFixed(1)+'%','nTrials':v=>v+' trials',
      'screenEngagement':v=>Math.round(v*100)+'%','attentionSpan':v=>Math.round(v*100)+'%',
      'start.target_force':v=>v+' %F_work','start.tolerance_band':v=>'± '+v+'%','start.hold_time':v=>r1(v)+' วินาที',
      'level':v=>'ด่าน '+v+' · '+LEVELS[v-1].th};
      lb.textContent=(fmts[t.dataset.path]||(x=>x))(v);}
    $('edPrev').innerHTML=edPreview(S.draft);return;
  }
  if(t.dataset.f){
    const k=t.dataset.f;
    S.draft[k]=(k==='age'||k==='macs'||k==='gmfcs')?+t.value:(k==='hasToy'?t.value==='1':t.value);
  }
});
render();

/* ดวงอาทิตย์มองตามเมาส์ — ผูกครั้งเดียว เพราะ .mascot อยู่นอก #root จึงไม่ถูก render ทับ
   ไม่ปิดตาม prefers-reduced-motion เพราะเป็นการตอบสนองต่อการชี้ ไม่ใช่ animation ที่เล่นเอง */
(function eyesFollowCursor(){
  const m=document.querySelector('.mascot');if(!m)return;
  const pupils=m.querySelectorAll('.pupil');if(!pupils.length)return;
  /* เขียน transform ตรง ๆ ไม่ผ่าน rAF — แค่ 2 setAttribute ต่อครั้ง ราคาถูกกว่าการคิวไว้
     และถ้าแท็บถูกซ่อน rAF จะไม่ทำงาน ทำให้ตาค้างอยู่ที่เดิม */
  addEventListener('pointermove',e=>{
    const b=m.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2;
    const ang=Math.atan2(e.clientY-cy,e.clientX-cx);
    const reach=Math.min(1,Math.hypot(e.clientX-cx,e.clientY-cy)/420)*3.4;
    const tx=r1(Math.cos(ang)*reach),ty=r1(Math.sin(ang)*reach);
    pupils.forEach(p=>p.setAttribute('transform',`translate(${tx} ${ty})`));
  },{passive:true});
})();

/* --------------------------------------------------------------------------
   ที่เก็บถาวร
   แฟ้มเด็กทั้งหมดถูกบันทึกลง localStorage ของเบราว์เซอร์ (คีย์ 'rehaverse.profiles.v1')
   ทุกครั้งที่: สร้างแฟ้มใหม่, แก้ไขแฟ้ม, หรือลบแฟ้ม ผ่านฟังก์ชัน saveStore()
   ข้อมูลนี้อยู่เฉพาะเบราว์เซอร์/เครื่องนี้เท่านั้น ไม่ได้ซิงก์ไปที่ไหน
   ถ้าต้องการล้างข้อมูลตัวอย่างทั้งหมดกลับไปเริ่มใหม่ ให้เปิด console แล้วรัน:
     localStorage.removeItem('rehaverse.profiles.v1'); localStorage.removeItem('rehaverse.codeSeq.v1');
   แล้วรีเฟรชหน้า
   -------------------------------------------------------------------------- */