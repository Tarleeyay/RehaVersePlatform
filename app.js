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
   game:{name:'Shape Match',desc:'กล้องตรวจจับมือ เด็กเอื้อมไปหยิบรูปทรงบนหน้าจอ แล้วลากไปใส่ช่องที่ตรงกัน',skills:['Hand tracking','Visual attention','Reach'],playable:true,screen:'shape'},
   both:{name:'Magic Portal',desc:'ถือบล็อกจริงในมือ กล้อง AI ตรวจจับ พอหย่อนลงกล่อง บ้านบนหน้าจอสร้างเสร็จทันที',skills:['Reach','Release','Cause–effect']}}},
 {n:2,em:'hand',th:'เริ่มบีบ',name:'Grip Control',goal:'เริ่มฝึกการบีบ ให้เด็กรู้ว่ามือตัวเองสั่งงานได้',adapts:['target_force','hold_time','reps'],modes:{
   toy:{name:'Squeeze Animal',desc:'ของเล่นนิ่ม บีบแล้วสัตว์ร้อง มี LED เปลี่ยนสีตามแรงบีบ',skills:['Grip initiation','Force awareness']},
   game:{name:'Bubble Pop',desc:'กล้องตรวจการกำมือ เด็กกำมือเพื่อแตกฟองบนหน้าจอ ใช้ได้แม้ยังถือลูกบอลไม่ได้',skills:['Hand closing','Timing'],playable:true},
   both:{name:'Bubble Rescue',desc:'บีบ RehaBall ให้ถึงช่วงแรงเป้าหมายแล้วค้างไว้ ฟองแตก สัตว์ได้รับการช่วยเหลือ',skills:['Grip initiation','Grip endurance','Force stability'],playable:true}}},
 {n:3,em:'target',th:'คุมแรงให้แม่น',name:'Force Control',goal:'ควบคุมแรงให้อยู่ในช่วงที่กำหนด ไม่ใช่บีบให้แรงที่สุด',adapts:['target_force','tolerance_band','hold_time'],modes:{
   toy:{name:'Rocket Pump',desc:'ของเล่นมีเกจแรงแบบเข็ม เด็กบีบให้เข็มค้างอยู่ในแถบสีเขียว',skills:['Graded force','Visual matching']},
   game:{name:'Rocket Simulator',desc:'กล้องวัดระดับการกำมือ ใช้บังคับความสูงของจรวดให้บินผ่านวงแหวน',skills:['Graded hand closing'],playable:true,screen:'rocket'},
   both:{name:'Rocket Power',desc:'แรงบีบแปลงเป็นความสูงของจรวดโดยตรง ต้องเพิ่มและลดแรงตามตำแหน่งวงแหวน',skills:['Force modulation','Controlled release']}}},
 {n:4,em:'hourglass',th:'จังหวะและการปล่อย',name:'Timing & Release',goal:'ฝึกจังหวะ บีบให้ทัน และปล่อยให้ตรงเวลา',adapts:['react_window','reps','target_size'],modes:{
   toy:{name:'Light Catch',desc:'ไฟติดขึ้นแบบสุ่ม เด็กต้องบีบและปล่อยให้ทันก่อนไฟดับ',skills:['Reaction time','Release control']},
   game:{name:'Feed Monster',desc:'กล้องตรวจการอ้า–หุบมือ ใช้เปิดปากสัตว์ประหลาดให้ตรงจังหวะ',skills:['Hand opening','Timing'],playable:true,screen:'monster'},
   both:{name:'Feed Monster+',desc:'บีบเพื่อเปิดปาก ค้างไว้จนอาหารมาถึง แล้วคลายมือให้อาหารตกลงพอดี',skills:['Reaction time','Grip–release cycle']}}},
 {n:5,em:'grid',th:'รูปแบบการจับ',name:'Grip Pattern',goal:'กระจายแรงรอบมือ ไม่กระจุกอยู่จุดเดียว',adapts:['contact_zones','hold_time','reps'],modes:{
   toy:{name:'Texture Ball',desc:'ลูกบอลหลายพื้นผิวในลูกเดียว เด็กลองจับหลายแบบ',skills:['Tactile awareness','Grip diversity']},
   game:{name:'Magic Garden Lite',desc:'กล้องตรวจรูปทรงของมือ เปลี่ยนท่ามือให้พืชโตต่างชนิดกัน',skills:['Hand shaping','Finger extension'],playable:true,screen:'garden'},
   both:{name:'Magic Garden',desc:'Heat Map จากเซนเซอร์ 12 จุด ต้นไม้โตตามรูปแบบการกระจายแรง ไม่ใช่ตามความแรง',skills:['Contact distribution','Grip diversity']}}},
 {n:6,em:'waves',th:'เคลื่อนแขนพร้อมคุมมือ',name:'Functional Movement',goal:'ใช้มือร่วมกับการเคลื่อนไหวแขนและลำตัว',adapts:['directions','target_size','reps'],modes:{
   toy:{name:'Treasure Box',desc:'ถือลูกบอลเดินไปวางตามจุดต่าง ๆ ที่ผู้ดูแลจัดไว้',skills:['Reach','Trunk control','Carry']},
   game:{name:'Treasure Runner',desc:'กล้องตรวจตำแหน่งมือ เอื้อมไปหยิบและย้ายสมบัติบนหน้าจอ',skills:['Reach accuracy','Shoulder movement'],playable:true,screen:'trek'},
   both:{name:'Treasure Delivery',desc:'ถือลูกบอลเดินไปยังเกาะที่กำหนด กล้องตรวจตำแหน่ง IMU ตรวจการเคลื่อนที่ FSR ตรวจแรง',skills:['Grip during movement','Trunk control']}}},
 {n:7,em:'pot',th:'กิจวัตรประจำวัน',name:'Daily Living',goal:'เลียนแบบการเคลื่อนไหวที่ใช้จริงในชีวิตประจำวัน',adapts:['reps','directions','hold_time'],modes:{
   toy:{name:'Kitchen Set',desc:'ชุดครัวของเล่น คนซุป เทน้ำ หยิบของ ตามลำดับขั้นตอน',skills:['Forearm rotation','Bilateral use']},
   game:{name:'Cooking Story',desc:'กล้องตรวจการหมุนและเคลื่อนมือ ใช้ทำอาหารตามสูตรบนหน้าจอ',skills:['Wrist motion','Sequencing'],playable:true,screen:'cook'},
   both:{name:'Smart Cooking',desc:'ลูกบอลแทนวัตถุดิบ เอียงเพื่อเท หมุนเพื่อคน บีบเพื่อคั้น',skills:['Forearm rotation','Functional task']}}},
 {n:8,em:'crown',th:'ภารกิจรวม',name:'Adventure Challenge',goal:'รวมทุกทักษะไว้ในภารกิจเดียว',adapts:['target_force','hold_time','directions','reps','target_size'],modes:{
   toy:{name:'Mission Board',desc:'กระดานภารกิจ หยิบ ใส่ ย้าย เรียง ตามการ์ดที่จั่วได้',skills:['Combined skills','Planning']},
   game:{name:'Adventure Island',desc:'ภารกิจหลายรูปแบบต่อเนื่องกัน ใช้ Hand Tracking อย่างเดียว',skills:['Combined skills','Endurance'],playable:true,screen:'quest'},
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
/* prio ส่งเข้ามาได้ เพราะแต่ละด่านปรับคนละมิติ (ด่านแรงใช้ PRIORITY, ด่าน 1 ใช้ PRIORITY_REACH) */
function updateEngine(e,prio){
  const P=prio||e.prio||PRIORITY;
  const w=e.results.slice(-5);
  if(w.length<5)return{action:'wait',rate:mean(w)};
  const rate=mean(w),dim=P[Math.min(e.pi,P.length-1)],from=e.diff[dim];
  let action='hold';
  if(rate>=.80){e.panic=0;e.up++;if(e.up>=2){stepDim(e.diff,dim,1);e.up=0;action='up';
    if(maxedOut(e.diff,dim)&&e.pi<P.length-1)e.pi++;}}
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
    level:1,mode:'both',hasToy:true,seeds:0,coins:0,toys:{}};
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
/* runFrom = หลักใน H.trials ตอนเริ่มรอบ ใช้ตัดเอา trial ของรอบนี้เท่านั้น (ด่าน 2/3)
   runStats = ผลสรุป 5 ตัวชี้วัดของรอบที่เพิ่งจบ ใช้วาดบนหน้าสรุป */
const S={screen:'landing',p:null,sel:1,live:0,draft:null,editingNew:false,lastGame:null,unlocked:false,
  runStats:null,runFrom:0,coinGain:0,lastRoll:null,spinning:null};
let H={trials:[],engine:newEngine({target_force:30,tolerance_band:14,hold_time:1})};
/* ล้างผลการหมุนกับเหรียญที่เพิ่งได้ด้วย ไม่งั้นสลับเด็กแล้วจะเห็นของเด็กคนก่อน */
function loadProfile(p){S.p=p;S.sel=p.level;S.live=0;G.results=[];S.lastRoll=null;S.coinGain=0;S.spinning=null;
  const r=simulate(p);H={trials:r.trials,engine:r.engine};H.rng=r.rng}

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
  }else if(['home','game','shape','rocket','monster','garden','trek','cook','quest','reward','skills'].includes(S.screen)&&S.p){
    const m=MODE_META[S.p.mode];
    right=`<span class="pill">${ico(avKey(S.p.avatar))} ${S.p.nick}</span>
           ${S.screen!=='skills'?`<span class="pill">${ico('sparkle')} ทักษะ <button data-go="skills">ดู</button></span>`:`<span class="pill">${ico('compass')} เกาะ <button data-go="home">ดู</button></span>`}
           <span class="pill">${ico(m.em)} ${m.label} <button data-go="mode">เปลี่ยน</button></span>
           <span class="pill">${ico('leaf')} ${S.p.seeds}</span>
           <span class="pill">${ico('diamond')} ${S.p.coins||0} <button data-go="market">ร้าน</button></span>`;
  }else if(S.screen==='market'&&S.p){
    right=`<span class="pill">${ico(avKey(S.p.avatar))} ${S.p.nick}</span>
           <span class="pill">${ico('diamond')} ${S.p.coins||0}</span>`;
  }
  $('topbar').innerHTML=`<div class="mark"><b>RehaVerse</b><span>adaptive rehab platform</span></div>${right}`;
  $('foot').innerHTML=pro
    ?'ต้นแบบส่วนติดต่อผู้ใช้ · ประวัติการเล่นในแฟ้มสร้างจาก simulated learner ที่รันผ่าน adaptive engine ตัวเดียวกับที่ใช้ตอนเล่นจริง ไม่ใช่ข้อมูลผู้ป่วยจริง · ค่า GDI ในต้นแบบเป็นค่าจำลอง · ข้อมูลเก็บในหน่วยความจำ หายเมื่อรีเฟรช'
    :camScreen()
      ?'ต้นแบบส่วนติดต่อผู้ใช้ · ตรวจจับมือด้วยกล้องบนเครื่องนี้ ไม่มีการบันทึกหรือส่งภาพออกไปที่ใด'
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
    <img src="rehaball-2.png" alt="ลูกบอล RehaBall" width="960" height="969">
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

function kidAdaptChips(eng){
  const a=(eng||H.engine).log.filter(l=>['up','down','down2'].includes(l.action)).slice(-2);
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

/* ==========================================================================
   ฉากบนแผนที่ด่าน — ต้นไม้ พุ่ม ดอกไม้ กระต่าย ผีเสื้อ เมฆ
   --------------------------------------------------------------------------
   วาดด้วย SVG มือทั้งหมด ไม่ใช้ภาพ raster และไม่ใช้อิโมจิ ตามระบบดีไซน์เดิม
   ตัวละครต้องขยับได้ ภาพนิ่งจึงใช้แทนไม่ได้ (ดูหมายเหตุเรื่องตัวละครในไฟล์นี้)

   ตำแหน่งทุกชิ้นเลี่ยง "กล่องของหมุดด่าน" ซึ่งกว้าง 108 สูง 105 หน่วย viewBox
   และอยู่กึ่งกลางพิกัดใน ROAD (translate(-50%,-50%)) ช่องว่างที่ใช้ได้จริงคือ
     - แถบฟ้า y 0–88            : ไม่มีหมุดแตะเลย (หมุดด่าน 8 เริ่มที่ y 94)
     - แถบพื้น y 350–380        : ต่ำกว่าป้ายที่ลงลึกสุด (y 349)
     - ใต้หมุดยอดเนิน           : หมุด 2/4/6/8 จบที่ y 249/239/231/199
                                  ใต้นั้นจึงเป็นพื้นว่างผืนใหญ่
   ถ้าย้ายพิกัดใน ROAD หรือแก้ขนาดหมุด ต้องไล่ดูตำแหน่งพวกนี้ใหม่
   ========================================================================== */
const SC_G={d:'#3F9A26',m:'#5DBE3E',l:'#7BD256',p:'#9BE07A'};   // เขียวสี่ระดับ
/* ห่อสองชั้นทุกชิ้น : ชั้นนอกถือ transform เป็น attribute (ตำแหน่ง/ขนาด)
   ชั้นในให้ CSS ขยับ — ถ้าใส่ animation ทับชั้นนอก transform attribute จะถูกลบทิ้ง
   cls ว่าง = ไม่ใส่ชั้นในเลย ชิ้นนั้นนิ่งสนิทและไม่มี <g> เกินมา

   **จำนวน animation คือต้นทุนหลักของหน้านี้ ไม่ใช่จำนวนรูปทรง**
   วัดจริงบนเดสก์ท็อป : ไม่มีฉาก 114 fps / ฉากที่ขยับทุกชิ้น (112 animation) 50 fps /
   ฉากเดิมแต่ปิด animation 117 fps — รูปทรงเกือบ 750 ชิ้นแทบไม่มีต้นทุน
   แต่การขยับ <g> ใน SVG ทีละชิ้นกินเวลาเมนเทรดหนัก เพราะไม่ขึ้น compositor
   จึงต้องขยับ "เป็นกลุ่ม" ด้วย .sc-breeze แล้วเหลือ animation เดี่ยวไว้เฉพาะ
   ชิ้นที่คนดูจับตาได้จริง (ต้นไม้ใหญ่ เมฆ ผีเสื้อ กระต่าย)
   ถ้าจะเพิ่มของประดับ ให้เพิ่มรูปทรงในกลุ่มเดิม อย่าเพิ่ม animation ต่อชิ้น */
const scAt=(x,y,s,cls,d,inner)=>`<g transform="translate(${x} ${y}) scale(${s})">`
  +(cls?`<g class="${cls}" style="--d:${d}s">${inner}</g>`:inner)+`</g>`;
/* ลมพัดเป็นกลุ่ม : เลื่อนทั้งกลุ่มเล็กน้อย ไม่ใช้การหมุน
   ถ้าหมุนกลุ่มที่กว้าง 300 หน่วย ชิ้นปลายกลุ่มจะกวาดเป็นวงกว้างจนดูผิดธรรมชาติ */
const scBreeze=(d,inner)=>`<g class="sc-breeze" style="--d:${d}s">${inner}</g>`;

/* ต้นไม้ : พุ่มทรงกลมซ้อนกัน ไล่จากเข้มล่างไปสว่างบน ให้ดูมีปริมาตรแบบภาพแบน
   ก้อนเข้มสุด (#2E7D1C) วางเป็นฐานหลังทุกก้อน ทำหน้าที่เป็นเส้นขอบให้ทรงพุ่ม
   ถ้าไม่มีก้อนนี้ ต้นไม้จะกลืนไปกับเนินเขียวด้านหลังทันที */
const scTree=(x,y,s,v,d,cls='sc-sway')=>scAt(x,y,s,cls,d,
  `<ellipse cx="1" cy="6" rx="15" ry="3.5" fill="#2E7D1C" opacity=".2"/>
   <rect x="-4.5" y="-20" width="9" height="26" rx="4.5" fill="#A9743C"/>
   <rect x="-4.5" y="-20" width="4" height="26" rx="2" fill="#8A5A2B" opacity=".55"/>`+(v
  ?`<ellipse cx="0" cy="-39" rx="19" ry="25" fill="#2E7D1C"/>
    <ellipse cx="1" cy="-41" rx="16" ry="21" fill="${SC_G.m}"/>
    <ellipse cx="-7" cy="-33" rx="11" ry="14" fill="${SC_G.d}"/>
    <ellipse cx="6" cy="-47" rx="9.5" ry="12" fill="${SC_G.l}"/>
    <ellipse cx="-2" cy="-54" rx="6" ry="7" fill="${SC_G.p}"/>`
  :`<circle cx="0" cy="-32" r="23" fill="#2E7D1C"/>
    <circle cx="0" cy="-33" r="20" fill="${SC_G.m}"/>
    <circle cx="-13" cy="-25" r="12.5" fill="${SC_G.d}"/>
    <circle cx="13" cy="-27" r="12" fill="${SC_G.l}"/>
    <circle cx="-3" cy="-42" r="11.5" fill="${SC_G.p}"/>`));

/* พุ่มไม้เตี้ย : วางชิดขอบล่าง ก้อนกลมจะถูกขอบการ์ดตัดเองพอดี */
const scBush=(x,y,s,d,cls='')=>scAt(x,y,s,cls,d,
  `<circle cx="-11" cy="1" r="11" fill="#2E7D1C"/>
   <circle cx="7" cy="-2" r="14" fill="#2E7D1C"/>
   <circle cx="19" cy="2" r="10" fill="#2E7D1C"/>
   <circle cx="-11" cy="0" r="9.5" fill="${SC_G.d}"/>
   <circle cx="7" cy="-3" r="12.5" fill="${SC_G.m}"/>
   <circle cx="19" cy="1" r="8.5" fill="${SC_G.l}"/>
   <circle cx="2" cy="-9" r="6.5" fill="${SC_G.p}" opacity=".85"/>`);

/* ดอกไม้ : กลีบห้ากลีบวางรอบเกสร โยกจากโคนก้าน */
const SC_FL=[['#FF8FB8','#FFD98A'],['#FFC94F','#fff'],['#fff','#FFC94F'],
             ['#A99BF5','#FFF1D6'],['#FF9FD0','#FFD98A']];
const scFlower=(x,y,s,c,d,cls='')=>{const[pet,eye]=SC_FL[c];
  return scAt(x,y,s,cls,d,
    `<path d="M0 0 C -1.5 -7 1.5 -10 0 -15" stroke="${SC_G.d}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
     <ellipse cx="-4" cy="-7" rx="4" ry="2.4" fill="${SC_G.m}" transform="rotate(-18 -4 -7)"/>
     <g transform="translate(0 -17)">${
       [0,1,2,3,4].map(i=>`<ellipse cx="0" cy="-5.4" rx="3.5" ry="5.4" fill="${pet}"
         transform="rotate(${i*72})"/>`).join('')}
       <circle r="2.9" fill="${eye}"/></g>`)};

/* กระจุกหญ้า : สามใบบางโค้งคนละทาง */
const scTuft=(x,y,s,d,cls='')=>scAt(x,y,s,cls,d,
  `<path d="M0 0 Q3 -8 7 -12" stroke="${SC_G.d}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
   <path d="M0 0 Q-3 -7 -6 -11" stroke="${SC_G.m}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
   <path d="M0 0 Q0 -8 1 -14" stroke="${SC_G.d}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`);

/* เมฆในกรอบแผนที่ : ใช้การลอยขึ้นลงสั้น ๆ ไม่ใช่การไถลข้ามจอ
   เพราะถ้าปิด animation เมฆที่ไถลจะค้างนอกกรอบ ต้องมีตำแหน่งสำรองอีกชุด */
const scCloud=(x,y,s,d)=>scAt(x,y,s,'sc-drift',d,
  `<g fill="#fff" opacity=".93"><ellipse cx="-16" cy="3" rx="17" ry="11"/>
   <ellipse cx="4" cy="-4" rx="21" ry="15"/><ellipse cx="22" cy="4" rx="16" ry="10"/>
   <rect x="-30" y="2" width="56" height="10" rx="5"/></g>`);

/* ผีเสื้อ : ปีกกระพือด้วย scaleX ตัวลอยเป็นวงเล็ก ๆ
   ต้องตัวโตพอ (scale ~1.6) และหุบปีกไม่เกิน .6 — เล็กกว่านี้หรือหุบลึกกว่านี้
   จังหวะที่ปีกหุบจะเหลือแต่ลำตัว อ่านเป็นขีดเล็ก ๆ ไม่ใช่ผีเสื้อ */
const scFly=(x,y,s,c,i)=>scAt(x,y,s,`sc-fly f${i}`,0,
  `<g class="sc-wing w${i}"><ellipse cx="-7" cy="-4" rx="7.5" ry="9" fill="${c}" opacity=".95"/>
   <ellipse cx="7" cy="-4" rx="7.5" ry="9" fill="${c}" opacity=".95"/>
   <ellipse cx="-6" cy="6" rx="5.5" ry="6" fill="${c}" opacity=".72"/>
   <ellipse cx="6" cy="6" rx="5.5" ry="6" fill="${c}" opacity=".72"/>
   <circle cx="-7" cy="-5" r="2.2" fill="#fff" opacity=".55"/>
   <circle cx="7" cy="-5" r="2.2" fill="#fff" opacity=".55"/></g>
   <rect x="-1.3" y="-8" width="2.6" height="17" rx="1.3" fill="#4B3A2A"/>
   <path d="M-1 -8 q-4 -5 -6 -6 M1 -8 q4 -5 6 -6" stroke="#4B3A2A" stroke-width="1.1"
     fill="none" stroke-linecap="round"/>`);

/* กลีบดอกปลิว : ทรงหยดน้ำ ไม่ใช่วงรี วงรีเล็ก ๆ อ่านเป็นเศษผงมากกว่ากลีบดอก */
const scPetal=(x,y,s,c,d)=>scAt(x,y,s,'sc-spinslow',d,
  `<path d="M0 -6 C4.5 -3 4.5 3 0 6 C-4.5 3 -4.5 -3 0 -6Z" fill="${c}" opacity=".9"/>`);

/* รถวิ่งบนถนนข้ามเนิน : อยู่ในชั้น bg จึงลอดหลังถนนสีเหลืองและหลังหมุดด่าน
   วิ่งทางเดียวจากซ้ายไปขวา ล้อไม่หมุน — ขนาดเท่านี้ไม่มีใครเห็น จ่าย animation ไปก็เปล่า
   ตัวรถเลื่อนด้วย translate อย่างเดียว ส่วนการขึ้นลงตามเนินฝังไว้ในคีย์เฟรม
   (ไม่ใช้ offset-path เพราะมันคิดเป็น CSS px ไม่ใช่หน่วย viewBox — ดูหมายเหตุ mountRoad) */
/* สามชั้น ไม่ใช่สองชั้นเหมือนของประดับอื่น และห้ามยุบรวม :
   scale ต้องอยู่ "ข้างใน" ชั้นที่ CSS ขยับ ไม่ใช่ข้างนอก
   ถ้า scale อยู่ชั้นนอก ระยะ translate ของคีย์เฟรมจะถูกคูณด้วย scale ไปด้วย
   (ตอนแรกวางไว้ชั้นนอกที่ scale 1.25 → translate 500px ไปตกที่ 625 หน่วย viewBox
    รถจึงหลุดขอบขวาตอน 64% ของรอบ แล้วหายไปเลยราวเจ็ดวินาที) */
const scCar=(y,s,body,roof)=>`<g transform="translate(0 ${y})">
  <g class="sc-car"><g transform="scale(${s})">
    <ellipse cx="0" cy="8" rx="17" ry="2.8" fill="#2E7D1C" opacity=".2"/>
    <path d="M-8 -5 q2 -7 6 -7 h7 q4 0 6 7z" fill="${roof}"/>
    <path d="M-5.4 -5 q1.4 -4.6 4 -4.6 h2.2 v4.6z" fill="#DFF3FC"/>
    <path d="M1.4 -5 v-4.6 h2.4 q2.4 0 3.6 4.6z" fill="#DFF3FC"/>
    <rect x="-16" y="-5" width="32" height="10" rx="4.2" fill="${body}"/>
    <rect x="-16" y="-2" width="32" height="3" rx="1.5" fill="#000" opacity=".08"/>
    <circle cx="12.6" cy="-1" r="1.7" fill="#FFF1D6"/>
    <circle cx="-9" cy="6" r="3.6" fill="#33404A"/><circle cx="-9" cy="6" r="1.5" fill="#CFD9DF"/>
    <circle cx="9" cy="6" r="3.6" fill="#33404A"/><circle cx="9" cy="6" r="1.5" fill="#CFD9DF"/>
  </g></g></g>`;

/* กระจุกดอก/หญ้าเล็กบนเนินหลัง : นิ่งทั้งหมด ใช้เติมพื้นที่เขียวว่าง ๆ ให้ไม่โล่ง */
const scSpeck=(x,y,s,c)=>`<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M0 0 Q2 -5 5 -7 M0 0 Q-2 -4 -4 -6" stroke="${SC_G.d}" stroke-width="1.8"
    fill="none" stroke-linecap="round" opacity=".55"/>
  ${c?`<circle cx="0" cy="-8" r="2.4" fill="${c}" opacity=".9"/>
      <circle cx="0" cy="-8" r="1" fill="#fff" opacity=".8"/>`:''}</g>`;

/* กระต่าย : ตัวละครประจำฉาก หูกระตุก ตากะพริบ จมูกขยับ
   วาดสดไม่ใช้ <use> เพราะต้องสั่งหูกับตาแยกส่วน (เหตุผลเดียวกับมาสคอตพระอาทิตย์) */
const scRabbit=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="2" cy="2" rx="27" ry="6" fill="#3F9A26" opacity=".18"/>
  <g class="sc-hop">
    <ellipse cx="0" cy="-17" rx="19" ry="17" fill="#fff"/>
    <ellipse cx="-19" cy="-4" rx="9" ry="6" fill="#fff"/>
    <ellipse cx="15" cy="-3" rx="8" ry="5.5" fill="#fff"/>
    <circle cx="19" cy="-20" r="6" fill="#F4F9FC"/>
    <g class="sc-ear l"><ellipse cx="-9" cy="-45" rx="6" ry="16" fill="#fff" transform="rotate(-9 -9 -45)"/>
      <ellipse cx="-9" cy="-45" rx="3" ry="11" fill="#FFC2DA" transform="rotate(-9 -9 -45)"/></g>
    <g class="sc-ear r"><ellipse cx="7" cy="-46" rx="6" ry="16" fill="#fff" transform="rotate(8 7 -46)"/>
      <ellipse cx="7" cy="-46" rx="3" ry="11" fill="#FFC2DA" transform="rotate(8 7 -46)"/></g>
    <ellipse cx="-1" cy="-27" rx="15" ry="13.5" fill="#fff"/>
    <g class="sc-blink"><circle cx="-7" cy="-29" r="2.6" fill="#3A2B22"/>
      <circle cx="6" cy="-29" r="2.6" fill="#3A2B22"/></g>
    <ellipse cx="-10" cy="-23" rx="3.4" ry="2.2" fill="#FFC2DA" opacity=".75"/>
    <ellipse cx="9" cy="-23" rx="3.4" ry="2.2" fill="#FFC2DA" opacity=".75"/>
    <path d="M-1 -24 l-2.6 2.2 h5.2z" fill="#FF9FBE"/>
  </g></g>`;

/* ประกอบฉาก : bg = หลังถนน (ฟ้า เนิน เมฆ ต้นไม้ไกล) / fg = หน้าถนน (พื้น ดอกไม้ สัตว์)
   แยกสองชั้นเพื่อให้ถนนอยู่กลาง ฉากไกลจึงอยู่หลัง ฉากใกล้อยู่หน้า ได้ระยะลึก
   ทั้งสองชั้นอยู่ใต้หมุดด่าน (หมุดมี z-index 2) หมุดจึงยังกดได้ปกติ */
function roadScene(layer){
  const svg=c=>`<svg class="road${layer}" viewBox="0 0 ${RVW} ${RVH}"
    preserveAspectRatio="none" aria-hidden="true">${c}</svg>`;
  if(layer==='bg')return svg(
    /* เนินสี่ชั้น ทึบทั้งหมด ไม่ใช้ opacity — ต้องการค่าความสว่างที่แยกกันชัด
       ถ้าไล่ด้วย opacity ของเขียวเดียวกัน ทุกชั้นจะกลืนกันเป็นก้อนเดียว
       และต้นไม้ด้านหน้าจะจมหายไปในพื้น */
    /* ลำดับชั้นสำคัญ : เนินไกล -> ต้นไม้ไกล -> เนินสอง -> ทางข้ามเนิน + รถ ->
       เนินสาม/สี่ -> ดอกหน้าบนเนิน
       รถจึงดูเหมือนวิ่งอยู่บนเนินลูกที่สอง และถูกเนินหน้า
       ถนนสีเหลือง กับหมุดด่าน บังเป็นระยะ ได้ความลึกจริง */
    `<path fill="#CDF2B4" d="M0 232 q118 -26 236 -8 t236 -14 t250 6 t278 -12 V380 H0Z"/>`
    /* ต้นไม้ไกล : นิ่งสนิท ขนาดเท่านี้ไม่มีใครเห็นว่าไหว จ่าย animation ไปก็เปล่า */
    +`<g opacity=".45">${[[86,240,.42],[268,236,.38],[418,230,.44],[560,240,.4],
      [700,232,.38],[830,238,.42],[978,234,.4]]
      .map(([x,y,s],i)=>scTree(x,y,s,i%2,0,'')).join('')}</g>`
    +`<path fill="#B0E892" d="M0 268 q140 -24 280 -6 t250 -12 t240 8 t230 -8 V380 H0Z"/>`
    /* ถนนข้ามเนิน : เส้นดินบาง ๆ ให้รถมีที่วิ่ง โค้งน้อย ๆ ตรงกับคีย์เฟรมของรถ
       ห้ามใส่เส้นประกลางถนนสีขาว มันจะกลายเป็นถนนอีกสายที่มาแข่งกับถนนหลักสีเหลือง
       ซึ่งเป็นตัวเดินเรื่องของหน้านี้ ถนนเนินต้องจางและบางกว่าเสมอ */
    +`<path d="M-20 264 Q250 252 500 262 T1020 256" fill="none" stroke="#D8C39C"
       stroke-width="7" stroke-linecap="round" opacity=".6"/>`
    +scCar(262,1.25,'#E8543F','#C43A28')
    +`<path fill="#94DE72" d="M0 306 q160 -20 320 -4 t260 -10 t250 8 t170 -6 V380 H0Z"/>
      <path fill="#7BD256" d="M0 340 q180 -14 360 -2 t300 -8 t180 6 t130 -4 V380 H0Z"/>`
    /* ดอกหน้าเล็กบนสันเนิน วางหลังเนินที่มันเกาะอยู่ จึงต้องมาหลังสุดของกลุ่มเนิน */
    +[[40,300,.9,'#FFC94F'],[112,296,.8,''],[186,299,.85,'#fff'],[262,295,.9,'#FF9FD0'],
      [340,300,.8,''],[416,296,.85,'#FFC94F'],[492,299,.9,'#fff'],[566,295,.8,''],
      [644,300,.85,'#A99BF5'],[720,296,.9,'#fff'],[798,299,.8,''],[872,295,.85,'#FFC94F'],
      [948,300,.9,'#FF9FD0'],[996,296,.8,''],
      [74,334,.95,'#fff'],[158,330,.85,''],[236,333,.9,'#FFC94F'],[314,329,.8,'#fff'],
      [392,334,.95,''],[470,330,.85,'#FF9FD0'],[548,333,.9,''],[626,329,.8,'#fff'],
      [704,334,.95,'#FFC94F'],[782,330,.85,''],[860,333,.9,'#A99BF5'],[938,329,.8,''],
      [990,333,.9,'#fff']].map(([x,y,s,c])=>scSpeck(x,y,s,c)).join('')
    +[[140,50,1,0],[470,38,1.25,1.3],[792,54,.9,2.2],[300,74,.66,.7],[640,44,.8,3.1]]
      .map(([x,y,s,d])=>scCloud(x,y,s,d)).join('')
    /* ผีเสื้อสามตัว ตัวเลขท้ายคือหมายเลขเส้นทางบิน ไม่ใช่ delay
       ทั้งสามต้องใช้ @keyframes คนละชุด — ถ้าใช้ชุดเดียวแล้วเลื่อนแค่ delay
       ทุกตัวจะวาดเส้นทางเดียวกันเป๊ะ เห็นชัดว่าเป็นของก๊อปกันมา */
    +[[352,112,1.7,'#FF9FD0',1],[826,116,1.5,'#A99BF5',2],[566,92,1.3,'#FFC94F',3]]
      .map(([x,y,s,c,i])=>scFly(x,y,s,c,i)).join('')
    +[[236,148,1.3,'#FFC2DA',0],[520,136,1.15,'#FFD98A',1.6],[886,60,1.1,'#C9EFFC',2.8],
      [120,116,1.2,'#EBE8FE',4.1],[690,146,1,'#FF9FD0',5.3]]
      .map(([x,y,s,c,d])=>scPetal(x,y,s,c,d)).join(''));
  return svg(
    /* ต้นไม้หน้า — ต้นสูงวางในช่องใต้หมุดยอดเนิน ซึ่งพื้นว่างตั้งแต่ y 242–260 ลงมา
       ต้นเล็กวางในช่องแคบระหว่างหมุด ยอดต้องไม่แตะกล่องหมุด ตามที่ระบุหัวหมวด */
    /* ต้นไม้ใหญ่สี่ต้น : ชิ้นเดียวที่ได้ animation เดี่ยว เพราะโตพอให้เห็นการโยกจริง */
    [[196,374,1.45,0,0],[464,376,1.4,1,1.1],[732,374,1.4,0,.4],[958,352,1.15,1,1.4]]
      .map(([x,y,s,v,d])=>scTree(x,y,s,v,d)).join('')
    /* ต้นเล็กแบ่งสองกลุ่ม พัดคนละจังหวะ รวมสอง animation แทนแปด */
    +scBreeze(0,[[128,372,.8,1],[396,370,.8,0],[664,370,.8,1],[900,373,.7,1]]
      .map(([x,y,s,v])=>scTree(x,y,s,v,0,'')).join(''))
    +scBreeze(2.4,[[262,368,.85,1],[528,368,.85,1],[796,368,.85,0],[36,375,.72,0]]
      .map(([x,y,s,v])=>scTree(x,y,s,v,0,'')).join(''))
    +scBreeze(1.2,[[74,372,.9],[152,370,.8],[286,369,.85],[336,373,.75],[420,371,.9],
      [548,370,.8],[608,373,.75],[688,371,.85],[818,369,.9],
      [866,373,.75],[936,370,.8],[994,372,.7]]
      .map(([x,y,s])=>scBush(x,y,s,0)).join(''))
    /* ดอกไม้กระจายหลายระดับความลึก ไม่ใช่แถวเดียวติดขอบล่าง
       ชุดแรกเป็นดอกลึกในช่องใต้ยอดเนิน สองชุดหลังเรียงตามแนวพื้นหน้าสุด
       แบ่งสามกลุ่มให้พัดไม่พร้อมกัน จะได้ไม่ดูเหมือนภาพเดียวเลื่อนไปทั้งแผง */
    +scBreeze(.6,[[170,300,1,2],[216,284,.9,0],[242,310,.85,4],
      [430,292,1,1],[470,276,.9,3],[502,300,.85,2],
      [698,288,1,4],[742,272,.9,1],[774,296,.85,0],
      [930,262,.95,3],[968,286,.85,2],[990,238,.8,0]]
      .map(([x,y,s,c])=>scFlower(x,y,s,c,0)).join(''))
    +scBreeze(3.1,[[22,366,1,0],[100,364,.95,2],[232,362,.85,4],[306,364,.95,0],
      [408,362,.85,2],[516,363,.9,4],[578,364,.95,0],[712,362,.95,2],
      [846,364,1,4],[978,363,.9,1]]
      .map(([x,y,s,c])=>scFlower(x,y,s,c,0)).join(''))
    +scBreeze(1.8,[[58,358,.85,1],[186,356,1,3],[358,357,.9,1],[462,356,1,3],
      [634,357,.85,1],[770,356,.9,3],[912,358,.85,0]]
      .map(([x,y,s,c])=>scFlower(x,y,s,c,0)).join(''))
    +scBreeze(4.2,[[44,379,1],[130,378,.9],[208,377,.85],[268,379,1],[322,378,.9],
      [388,379,.85],[444,377,1],[500,379,.9],[560,378,.85],
      [620,379,1],[676,377,.9],[748,379,.85],[806,378,1],
      [880,379,.9],[948,377,.85],[1000,379,1]]
      .map(([x,y,s])=>scTuft(x,y,s,0)).join(''))
    /* กระต่ายสองตัว วางในช่องที่ไม่มีหมุดทับ ตัวใหญ่ขวา ตัวเล็กซ้ายเป็นลูก */
    +scRabbit(776,346,1)+scRabbit(246,340,.6));
}

SC.home=()=>{
  const p=S.p,lv=LEVELS.find(l=>l.n===S.sel),g=lv.modes[p.mode],
        others=Object.keys(lv.modes).filter(k=>k!==p.mode);
  /* แต่ละชนิดของด่านปรับคนละมิติ จึงต้องอ่านค่าจากเอนจินของด่านนั้นเอง */
  const eng=g.screen==='shape'?reachEngine():g.screen==='monster'?timingEngine()
           :g.screen==='garden'?gardenEngine():g.screen==='trek'?trekEngine()
           :g.screen==='cook'?cookEngine():g.screen==='quest'?questEngine():H.engine,d=eng.diff;
  const mono=g.screen==='shape' ?`SIZE ${d.target_size}% · DIRS ${d.directions} · REPS ${d.reps}`
            :g.screen==='monster'?`WINDOW ${r1(d.react_window)}s · SIZE ${d.target_size}% · REPS ${d.reps}`
            :g.screen==='garden' ?`POSES ${d.contact_zones} · HOLD ${r1(d.hold_time)}s · REPS ${d.reps}`
            :g.screen==='trek'   ?`SIZE ${d.target_size}% · DIRS ${d.directions} · REPS ${d.reps}`
            :g.screen==='cook'   ?`ACTIONS ${d.directions} · HOLD ${r1(d.hold_time)}s · STEPS ${d.reps}`
            :g.screen==='quest'  ?`FORCE ${d.target_force}% · HOLD ${r1(d.hold_time)}s · SIZE ${d.target_size}% · DIRS ${d.directions} · STATIONS ${d.reps}`
            :g.playable          ?`TARGET ${d.target_force}% ±${d.tolerance_band} · HOLD ${r1(d.hold_time)}s`:'';
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
    ${roadScene('bg')}
    <svg class="roadsvg" viewBox="0 0 ${RVW} ${RVH}" preserveAspectRatio="none" aria-hidden="true">
      <path class="roadedge" d="${dpath}"/>
      <path class="roadline" id="roadline" d="${dpath}"/>
      <path class="roaddash" d="${dpath}"/>
    </svg>
    ${roadScene('fg')}
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
      : g.playable?`<button class="big play" data-go="${g.screen||'game'}">${ico('play')} เริ่มเล่น</button>`
      :`<button class="big" disabled>ยังไม่เปิดในต้นแบบนี้</button>`}
    </div>
    <div class="questside">
      <div class="adaptbox"><b>ระบบปรับให้แล้ววันนี้</b>
        <div class="kidchips">${kidAdaptChips(eng)}</div>
        <small>ระบบดูจากอัตราสำเร็จครั้งก่อน แล้วเลื่อนความยากเองทีละมิติ
        ${mono?`<br><span class="mono">${mono} — เด็กไม่เห็นตัวเลขชุดนี้</span>`:''}</small></div>
      <div class="adaptlist"><b>สิ่งที่ระบบปรับได้</b>
        <ul class="skilllist">${lv.adapts.map(a=>`<li>${ico(DIMS[a].ico)} ${DIMS[a].label}</li>`).join('')}</ul></div>
      ${bestBars(lv.n)}
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

/* โหมด Game Only ของด่านนี้ = "Bubble Pop" วัดการกำมือด้วยกล้อง
   โหมด Toy + Game = "Bubble Rescue" ใช้แรงจากลูกบอลจริง ซึ่งต้นแบบยังจำลองด้วยเมาส์
   ทั้งสองโหมดใช้ฉากเดียวกัน ต่างกันแค่ที่มาของค่าแรง */
const gameByHand=()=>S.p&&S.p.mode==='game';

SC.game=()=>`
<div class="screen">
  ${gameByHand()?`<div class="ghead">
    <button class="back" data-go="home">${ico('arrow-left')} กลับไปที่เกาะ</button>
    <span class="eyebrow">ด่าน ${S.sel} · ${LEVELS[S.sel-1].name} · Game Only</span>
  </div>`:''}
  <div class="gamewrap${gameByHand()?' handwrap':''}" id="stage" tabindex="0" role="application"
       aria-label="${gameByHand()?'กำมือเพื่อเพิ่มระดับ แบมือเพื่อลดระดับ':'กดค้างแล้วลากขึ้นลงเพื่อบีบ'}">
    ${gameByHand()?'<video id="cam" playsinline muted aria-hidden="true"></video>':''}
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
    ${gameByHand()?'<div class="camstate" id="camstate"></div>':''}
  </div>
  <div class="gbar">
    <div class="helpline" id="helpline">กดค้างแล้วลากขึ้น–ลง &nbsp;·&nbsp; ปุ่มลูกศรขึ้น–ลง</div>
    <button class="quit" data-go="reward">จบภารกิจ</button>
  </div>
  ${gameByHand()?`<p class="privnote">${ico('camera')} ภาพจากกล้องถูกประมวลผลในเครื่องนี้เท่านั้น ไม่ถูกบันทึกและไม่ถูกส่งออกไปที่ใด
    เล่นด้วยเมาส์หรือนิ้วบนจอแทนได้ตลอดเวลา</p>`:''}
</div>`;

function mountGame(){
  const stage=$('stage'),bandR=$('band'),bandT=$('bandTop'),bandB=$('bandBot'),bandGlow=$('bandGlow'),
        bandStar=$('bandStar'),fillR=$('fill'),fishG=$('fishG'),arrow=$('arrow'),arrowIn=$('arrowIn'),
        ring=$('ring'),bub=$('bubbleC'),bg=$('bubbleG'),saved=$('saved'),tut=$('tut'),
        eyeL=$('eyeL'),eyeR=$('eyeR'),mouth=$('mouth');
  FX.attach($('fx'));
  S.lastGame='bubble';
  /* ด่านอื่นเคลียร์ G.results ตอน mount กันหมด ด่านนี้เคยตกไป ผลรอบก่อนจึงค้าง
     ทำให้หน้าสรุปนับรวมรอบเก่า และ goReward() เห็นความสำเร็จเก่าเป็นของรอบนี้ */
  G.results=[];
  S.runFrom=H.trials.length;
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
  const byHand=gameByHand();
  G.pressing=false;
  G.read=ev=>{const r=stage.getBoundingClientRect();G.target=clamp(100-((ev.clientY-r.top)/r.height)*100,0,100)};
  stage.addEventListener('pointerdown',ev=>{G.pressing=true;G.read(ev);ev.preventDefault();tut.setAttribute('opacity','0')});
  if(!G.bound){G.bound=true;
    window.addEventListener('pointermove',ev=>{if(G.pressing&&G.read){G.read(ev);ev.preventDefault()}},{passive:false});
    window.addEventListener('pointerup',()=>{G.pressing=false;if(!gameByHand())G.target=0});}
  stage.addEventListener('keydown',e=>{
    if(e.key==='ArrowUp'){G.target=clamp(G.target+4,0,100);e.preventDefault();tut.setAttribute('opacity','0')}
    if(e.key==='ArrowDown'){G.target=clamp(G.target-4,0,100);e.preventDefault()}});

  if(byHand){
    camPanel($('camstate'),$('helpline'),'บีบด้วยเมาส์: กดค้างแล้วลากขึ้น–ลง · หรือปุ่มลูกศรขึ้น–ลง');
    stage.focus({preventScroll:true});
  }

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

    /* ระหว่างที่แผงกล้องยังบังจออยู่ เด็กยังไม่ได้เริ่มเล่น ต้องหยุดจับเวลา
       ไม่งั้นภารกิจจะหมดเวลาแล้วถูกบันทึกว่าล้มเหลวทั้งที่ยังไม่ได้เริ่ม */
    const paused=byHand&&$('camstate')&&$('camstate').classList.contains('on');
    if(paused){G.tStart=now;G.target=0}
    /* กล้องเป็นแหล่งแรงหลักในโหมด Game Only : ระดับการกำมือ 0–1 -> 0–100
       ถ้ามือหลุดเฟรม ให้ค่อย ๆ ลดลงแทนที่จะตกทันที เด็กจะได้ไม่ตกใจ */
    else if(byHand&&HT.state==='ready'&&!G.pressing){
      if(HT.hand.on)G.target=clamp(HT.hand.close*100,0,100);
      else G.target=Math.max(0,G.target-dt*40);
    }

    G.force+=(G.target-G.force)*Math.min(1,dt*7);
    if(G.force<.4)G.force=Math.max(0,G.force-dt*20);
    const d=H.engine.diff,diff=G.force-d.target_force,good=Math.abs(diff)<=d.tolerance_band;
    if(byHand&&HT.state==='ready')
      paintHandChip(h=>good?'อยู่ในช่วงเป้าหมาย':h.close>.08?'กำมืออยู่':'แบมืออยู่');

    if(G.active&&!paused){
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

/* ==========================================================================
   ตัวติดตามมือด้วยกล้อง — MediaPipe Tasks Vision (HandLandmarker)
   --------------------------------------------------------------------------
   ประมวลผลบนเครื่องผู้ใช้ทั้งหมด: ไม่มี API key ไม่ต้องสมัครบัญชี ไม่มีเซิร์ฟเวอร์
   ของเราอยู่ตรงกลาง และไม่มีเฟรมภาพใดถูกบันทึกหรือส่งออกจากเบราว์เซอร์
   สิ่งที่โหลดจากอินเทอร์เน็ตมีเพียงไลบรารีกับไฟล์โมเดล ซึ่งเป็นไฟล์สาธารณะ
   จึงไม่มีค่าลับใดต้องซ่อน และไม่มีอะไรที่ห้ามอยู่ใน repo สาธารณะ
   ถ้าต้องย้ายไปโฮสต์เอง (เช่นเครือข่ายโรงพยาบาลที่ปิดทางออกอินเทอร์เน็ต)
   ให้ประกาศไว้ก่อนโหลด app.js แทนการแก้ไฟล์นี้:
     window.REHAVERSE_CONFIG={handTracking:{lib:'...',wasm:'...',model:'...'}}
   ข้อจำกัด: เบราว์เซอร์ห้ามใช้กล้องจาก file:// ต้องเปิดผ่าน https:// หรือ
   http://localhost — ถ้าเปิดผิดทาง เกมจะบอกและสลับไปเล่นด้วยเมาส์ให้เอง
   ========================================================================== */
const HT_CFG=Object.assign({
  lib  :'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs',
  wasm :'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm',
  model:'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
},(window.REHAVERSE_CONFIG||{}).handTracking||{});

/* เกณฑ์กำ/ปล่อย — รวมไว้ที่เดียวเพื่อจูนได้ง่าย
   ตั้งใจให้ "ปล่อยง่ายกว่ากำ" เพราะเป้าหมายของด่านนี้คือการฝึกปล่อยวัตถุ
   ของที่ปล่อยไม่ออกทำให้เด็กหมดกำลังใจเร็วกว่าของที่หลุดมือ */
const GRIP={grabAt:.58,releaseAt:.44,openDrop:.26,closeRise:.22,minSpan:.32,spanSpread:.14};

/* ---------- ท่ามือสำหรับด่าน 5 ----------
   เรียงจากง่ายไปยาก : contact_zones คือจำนวนท่าที่เอามาใช้ในรอบนั้น
   ยิ่งหลายท่า = ยิ่งต้องใช้มือหลายส่วน ตรงกับเป้าหมาย "กระจายแรงรอบมือ"
   f = [โป้ง, ชี้, กลาง, นาง, ก้อย] เหยียดอยู่หรือไม่ · sp = ความกางของนิ้ว */
const POSES={
  open  :{th:'แบมือ',            f:[1,1,1,1,1],sp:.45},
  fist  :{th:'กำมือ',            f:[0,0,0,0,0],sp:.30},
  spread:{th:'กางนิ้วออกให้สุด',  f:[1,1,1,1,1],sp:.95},
  flat  :{th:'หุบนิ้วให้ชิดกัน',   f:[1,1,1,1,1],sp:.05},
  thumb :{th:'ยกนิ้วโป้ง',        f:[1,0,0,0,0],sp:.30},
  two   :{th:'ชูสองนิ้ว',         f:[0,1,1,0,0],sp:.70},
  point :{th:'ชี้นิ้วเดียว',       f:[0,1,0,0,0],sp:.30},
  pinch :{th:'จีบนิ้วโป้งกับนิ้วชี้',f:[1,0,1,1,1],sp:.45}
};
const POSE_ORDER=['open','fist','spread','flat','thumb','two','point','pinch'];
/* จัดว่าเป็นท่าอะไร — เรียงเงื่อนไขจากเฉพาะเจาะจงไปกว้าง
   เงื่อนไข pinch บังคับให้ "นิ้วชี้ต้องงอ" ด้วย ไม่งั้นมือแบที่เอียงเข้าหากล้อง
   จะถูกอ่านเป็นจีบ เพราะภาพ 2 มิติทำให้นิ้วโป้งไปทับนิ้วชี้ (ปัญหาเดียวกับที่เจอในด่าน 1) */
/* sp ที่ส่งเข้ามาเป็นค่าที่ปรับสเกลตามมือเด็กแล้ว (0 = หุบสุด · 1 = กางสุด)
   ไม่ใช้ระยะดิบ เพราะระยะปลายนิ้วหารด้วยขนาดฝ่ามือของจริงอยู่ราว 0.18–0.40 เท่านั้น
   เกณฑ์ตายตัวจึงพลาดง่ายมากและต่างกันไปตามขนาดมือของเด็กแต่ละคน */
const poseOf=(f,sp,pd)=>{
  const n=(f[1]?1:0)+(f[2]?1:0)+(f[3]?1:0)+(f[4]?1:0);
  if(pd<.35&&!f[1]&&f[2]&&f[3]&&f[4])return 'pinch';
  if(n===0)return f[0]?'thumb':'fist';
  if(n===1&&f[1])return 'point';
  if(n===2&&f[1]&&f[2])return 'two';
  if(n>=4)return sp>=.66?'spread':sp<=.34?'flat':'open';
  return 'open';
};

const HT={
  /* idle | loading | ready | denied | insecure | error */
  state:'idle',msg:'',onstate:null,
  video:null,stream:null,lm:null,raf:null,lastT:-1,miss:0,
  cal:{hi:2.25,lo:1.30,n:0,shi:.34,slo:.20,sn:0},
  hand:{on:false,x:.5,y:.5,close:0,grab:false,rawx:.5,rawy:.5,rawc:0,peak:0,trough:1,
        fingers:[0,0,0,0,0],spread:0,pose:'open',poseRaw:'open',poseN:0,pts:null,
        roll:0,rollRaw:null,rollDelta:0,palmFace:.8},
  set(st,msg){this.state=st;this.msg=msg||'';if(this.onstate)this.onstate(st,this.msg)},

  async start(video){
    if(this.state==='loading'||this.state==='ready')return;
    if(!window.isSecureContext){
      this.set('insecure','เบราว์เซอร์อนุญาตให้ใช้กล้องเฉพาะหน้าเว็บที่เปิดผ่าน https:// หรือ http://localhost');return;}
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
      this.set('error','เบราว์เซอร์นี้ไม่รองรับการเรียกใช้กล้อง');return;}
    this.video=video;
    this.set('loading','กำลังขออนุญาตใช้กล้อง');
    try{
      this.stream=await navigator.mediaDevices.getUserMedia({audio:false,
        video:{width:{ideal:640},height:{ideal:480},frameRate:{ideal:30},facingMode:'user'}});
    }catch(err){
      const n=String(err&&err.name||'');
      if(/NotAllowed|Security/i.test(n))this.set('denied','ยังไม่ได้อนุญาตให้ใช้กล้อง');
      else if(/NotFound|Overconstrained/i.test(n))this.set('error','ไม่พบกล้องบนเครื่องนี้');
      else if(/NotReadable|TrackStart/i.test(n))this.set('error','กล้องถูกโปรแกรมอื่นใช้อยู่');
      else this.set('error','เปิดกล้องไม่สำเร็จ');
      return;
    }
    video.srcObject=this.stream;video.muted=true;video.playsInline=true;
    try{await video.play()}catch(e){}
    this.set('loading','กำลังโหลดตัวตรวจจับมือ');
    try{
      const V=await import(/* webpackIgnore: true */ HT_CFG.lib);
      const files=await V.FilesetResolver.forVisionTasks(HT_CFG.wasm);
      const opts=d=>({baseOptions:{modelAssetPath:HT_CFG.model,delegate:d},
        runningMode:'VIDEO',numHands:1,
        minHandDetectionConfidence:.5,minHandPresenceConfidence:.5,minTrackingConfidence:.5});
      /* GPU เร็วกว่ามาก แต่เครื่อง/ไดรเวอร์บางตัวสร้างไม่ผ่าน จึงถอยไป CPU ให้เอง */
      try{this.lm=await V.HandLandmarker.createFromOptions(files,opts('GPU'))}
      catch(e){this.lm=await V.HandLandmarker.createFromOptions(files,opts('CPU'))}
    }catch(err){
      this.stopStream();
      this.set('error','โหลดตัวตรวจจับมือไม่สำเร็จ — เครื่องนี้อาจต่ออินเทอร์เน็ตไม่ได้');
      return;
    }
    if(!this.stream){this.set('idle','');return}   /* ผู้ใช้กดปิดระหว่างโหลด */
    this.miss=0;this.lastT=-1;
    this.cal={hi:2.25,lo:1.30,n:0,shi:.34,slo:.20,sn:0};                /* เริ่มจับช่วงมือใหม่ทุกครั้งที่เปิดกล้อง */
    Object.assign(this.hand,{on:false,grab:false,close:0,peak:0,trough:1,rollRaw:null});
    this.set('ready','');
    this.loop();
  },

  stop(){
    cancelAnimationFrame(this.raf);this.raf=null;
    if(this.lm){try{this.lm.close()}catch(e){}this.lm=null}
    this.stopStream();
    this.hand.on=false;this.hand.grab=false;this.hand.close=0;
    if(this.state!=='idle')this.set('idle','');
  },
  stopStream(){
    if(this.stream){this.stream.getTracks().forEach(t=>t.stop());this.stream=null}
    if(this.video){this.video.srcObject=null;this.video=null}
  },

  loop(){
    const step=()=>{
      this.raf=requestAnimationFrame(step);
      const v=this.video;
      if(!this.lm||!v||v.readyState<2)return;
      if(v.currentTime===this.lastT)return;          /* เฟรมเดิม ไม่ต้องคิดซ้ำ */
      this.lastT=v.currentTime;
      let res;try{res=this.lm.detectForVideo(v,performance.now())}catch(e){return}
      const L=res&&res.landmarks&&res.landmarks[0];
      if(!L){if(++this.miss>10)this.hand.on=false;return}
      this.miss=0;this.read(L);
    };
    cancelAnimationFrame(this.raf);this.raf=requestAnimationFrame(step);
  },

  /* แปลง 21 จุดเป็นค่าที่เกมใช้จริง: ตำแหน่งฝ่ามือ + ระดับการกำมือ
     ทุกระยะหารด้วยขนาดฝ่ามือก่อน ค่าจึงไม่เปลี่ยนเมื่อเด็กนั่งใกล้/ไกลกล้อง */
  read(L){
    const d=(a,b)=>Math.hypot(L[a].x-L[b].x,L[a].y-L[b].y);
    const palm=Math.max(1e-4,d(0,9));
    const reach=(d(8,0)+d(12,0)+d(16,0)+d(20,0))/4/palm;

    /* ค่าอ้างอิง "แบสุด/กำสุด" ปรับตามเด็กแต่ละคนเอง ไม่ใช้ตัวเลขตายตัว
       เพราะระยะที่กล้องเห็นขึ้นกับมุมมือและช่วงที่เด็กเปิดมือได้จริง
       เด็ก CP หลายคนแบมือได้ไม่สุด ถ้าใช้เกณฑ์คงที่จะ "ปล่อยของไม่ได้เลย"
       ขยายกรอบทันทีเมื่อเจอค่าใหม่ แต่หดกลับช้า ๆ และหดจากฝั่งที่กำลังใช้งานเท่านั้น */
    const c=this.cal;
    if(!c.n){                                    /* ตั้งกรอบจากท่าแรกที่เห็นจริง ไม่ใช่ค่าเดา
                                                    ค่าเดาที่กว้างเกินจะหดกลับไม่ทัน มือเลยค้างที่ 1.00 */
      c.hi=reach+GRIP.minSpan/2;c.lo=reach-GRIP.minSpan/2;c.n=1;
    }else{
      if(reach>c.hi)c.hi=reach; else c.hi+=(reach-c.hi)*.0006;   /* กว้างขึ้นทันที แคบลงช้ามาก */
      if(reach<c.lo)c.lo=reach; else c.lo+=(reach-c.lo)*.0006;
      const span=c.hi-c.lo;                      /* กันช่วงแคบจนสั่นนิดเดียวก็สลับสถานะ */
      if(span<GRIP.minSpan){const m=(c.hi+c.lo)/2;c.hi=m+GRIP.minSpan/2;c.lo=m-GRIP.minSpan/2}
    }
    const curl=clamp((c.hi-reach)/(c.hi-c.lo),0,1);

    /* เคยรวมระยะนิ้วโป้ง–นิ้วชี้ (pinch) เข้ามาด้วย แต่เอาออกแล้ว:
       ระยะนั้นวัดจากภาพ 2 มิติ พอมือเอียงเข้าหากล้องนิ้วโป้งจะไปทับนิ้วชี้
       ทั้งที่ไม่ได้หนีบ ค่าจึงค้างที่ 1.00 ตลอด กลายเป็น "กำแล้วปล่อยไม่ออก"
       ด่านนี้ฝึกการเปิด–ปิดมือทั้งมืออยู่แล้ว สัญญาณเดียวจึงตรงกับเป้าหมายกว่า */
    const close=curl;

    /* ---------- รูปทรงของมือ (ด่าน 5) ----------
       "นิ้วเหยียดไหม" วัดจากระยะถึงข้อมือ ไม่ใช่มุม จึงไม่พังเมื่อมือหมุน
       นิ้วโป้งใช้เกณฑ์ของตัวเอง เพราะกางออกด้านข้าง ไม่ได้ชี้ไปทางเดียวกับนิ้วอื่น */
    const ext=[d(4,17)/palm>.78,
               d(8,0)>d(6,0)*1.06, d(12,0)>d(10,0)*1.06,
               d(16,0)>d(14,0)*1.06, d(20,0)>d(18,0)*1.06];
    const spread=(d(8,12)+d(12,16)+d(16,20))/3/palm;

    let cx=0,cy=0;for(const i of [0,5,9,13,17]){cx+=L[i].x;cy+=L[i].y}cx/=5;cy/=5;
    /* ใช้แค่กลางเฟรมเป็นพื้นที่เล่น เด็กจึงไม่ต้องเอื้อมจนสุดขอบภาพ
       และกลับซ้าย–ขวาให้ตรงกับภาพกระจกที่เด็กเห็น */
    const map=(v,lo,hi)=>clamp((v-lo)/(hi-lo),0,1);
    const nx=map(1-cx,.20,.80),ny=map(cy,.16,.84);
    const h=this.hand;
    h.rawx=nx;h.rawy=ny;h.rawc=close;
    /* มือเพิ่งกลับเข้าเฟรม ต้องล้างมุมอ้างอิงเดิม ไม่งั้นจะนับว่าหมุนไปทีเดียวเป็นร้อยองศา */
    if(!h.on){h.x=nx;h.y=ny;h.close=close;h.on=true;h.peak=close;h.trough=close;h.rollRaw=null}
    else{h.x+=(nx-h.x)*.34;h.y+=(ny-h.y)*.34;h.close+=(close-h.close)*.5}

    /* ตัดสินใจกำ/ปล่อยจาก "การเปลี่ยนแปลง" ไม่ใช่ค่าสัมบูรณ์อย่างเดียว
       เด็กที่กำได้แค่ 0.5 แล้วคลายเหลือ 0.25 ก็ยังนับว่าปล่อย ทั้งที่ไม่เคยลงต่ำกว่าเกณฑ์คงที่ */
    if(h.grab){
      if(close>h.peak)h.peak=close;
      if(h.close<GRIP.releaseAt||h.close<h.peak-GRIP.openDrop){h.grab=false;h.trough=h.close}
    }else{
      if(close<h.trough)h.trough=close;
      if(h.close>GRIP.grabAt&&h.close>h.trough+GRIP.closeRise){h.grab=true;h.peak=h.close}
    }

    /* ปรับสเกลความกางนิ้วตามมือเด็กเอง ด้วยวิธีเดียวกับที่ใช้กับการกำมือ
       อัปเดตเฉพาะตอนที่นิ้วเหยียดครบสี่นิ้ว เพราะตอนกำมือค่าความกางไม่มีความหมาย */
    if(ext[1]&&ext[2]&&ext[3]&&ext[4]){
      if(!c.sn){c.shi=spread+GRIP.spanSpread/2;c.slo=spread-GRIP.spanSpread/2;c.sn=1}
      else{
        if(spread>c.shi)c.shi=spread; else c.shi+=(spread-c.shi)*.0008;
        if(spread<c.slo)c.slo=spread; else c.slo+=(spread-c.slo)*.0008;
        if(c.shi-c.slo<GRIP.spanSpread){const m=(c.shi+c.slo)/2;
          c.shi=m+GRIP.spanSpread/2;c.slo=m-GRIP.spanSpread/2}
      }
    }
    const spN=clamp((spread-c.slo)/Math.max(1e-4,c.shi-c.slo),0,1);
    h.fingers=ext;h.spread=spN;h.spreadRaw=spread;h.pts=L;
    /* ท่ามือดิบสั่นเป็นเฟรม ๆ ต้องเห็นท่าเดิมติดกันก่อนจึงจะยอมเปลี่ยนสถานะ
       ไม่งั้นวงแหวนนับเวลาจะรีเซ็ตทุกครั้งที่ตัวตรวจจับกระพริบ */
    const raw=poseOf(ext,spN,d(4,8)/palm);
    if(raw===h.poseRaw){if(++h.poseN>=5)h.pose=raw}else{h.poseRaw=raw;h.poseN=1}

    /* ---------- การหมุนของมือ (ด่าน 7) ----------
       มุมของแนวฝ่ามือ จากโคนนิ้วชี้ไปโคนนิ้วก้อย — อ่านได้ตรง ๆ จากภาพ 2 มิติ
       ไม่ใช้ค่า z ของ MediaPipe เพราะเป็นค่าเชิงสัมพัทธ์และแกว่งมาก
       เกมวัด "หมุนไปเท่าไรจากตอนเริ่มขั้นตอน" ไม่ใช่มุมสัมบูรณ์
       เด็กจะได้เริ่มจากท่าไหนก็ได้ ไม่ต้องจัดมือให้ตรงมุมศูนย์ก่อน */
    const roll=Math.atan2(L[17].y-L[5].y,L[17].x-L[5].x)*180/Math.PI;
    let dr=h.rollRaw==null?0:roll-h.rollRaw;
    while(dr>180)dr-=360; while(dr<-180)dr+=360;
    h.rollRaw=roll;h.roll=roll;h.rollDelta=dr;
    h.palmFace=d(5,17)/palm;      /* ฝ่ามือหันเข้ากล้อง = กว้าง · หันข้าง = แคบ */
  }
};
addEventListener('pagehide',()=>HT.stop());

/* หน้าจอนี้ใช้กล้องหรือไม่ — ด่าน 2 ใช้เฉพาะโหมด Game Only
   โหมด Toy + Game ใช้แรงจากลูกบอลจริง จึงต้องปิดกล้องทิ้ง ไม่ใช่เปิดค้างไว้เฉย ๆ */
const camScreen=()=>['shape','rocket','monster','garden','trek','cook','quest'].includes(S.screen)||
                    (S.screen==='game'&&S.p&&S.p.mode==='game');
/* แผงสถานะกล้อง + แถบช่วยเหลือ ใช้ร่วมกันทุกด่านที่เล่นด้วยมือ
   ทุกสถานะที่ไม่ใช่ ready จะมีปุ่ม "เล่นด้วยเมาส์แทน" เสมอ เกมจึงไม่มีทางตัน */
function camPanel(panel,help,fallbackHint){
  const PANEL={
    idle:()=>({title:'เปิดกล้องเพื่อเล่นด้วยมือ',
      body:'กล้องดูว่ามือกำอยู่แค่ไหน ประมวลผลในเครื่องนี้ ไม่มีการบันทึกภาพ',
      cta:'เปิดกล้อง',alt:true}),
    loading:m=>({title:m||'กำลังเตรียมกล้อง',body:'ครั้งแรกจะโหลดตัวตรวจจับมือสักครู่',cta:null,alt:true,spin:true}),
    denied:()=>({title:'ยังไม่ได้อนุญาตให้ใช้กล้อง',
      body:'กดที่ไอคอนกล้องบนแถบที่อยู่ของเบราว์เซอร์ แล้วเลือกอนุญาต จากนั้นลองอีกครั้ง',
      cta:'ลองอีกครั้ง',alt:true}),
    insecure:m=>({title:'หน้านี้ยังใช้กล้องไม่ได้',body:m,cta:null,alt:true}),
    error:m=>({title:'เปิดกล้องไม่สำเร็จ',body:m,cta:'ลองอีกครั้ง',alt:true})
  };
  function paintPanel(){
    if(!panel)return;
    if(HT.state==='ready'){panel.classList.remove('on');panel.innerHTML='';paintHelp();return}
    const p=(PANEL[HT.state]||PANEL.idle)(HT.msg);
    panel.classList.add('on');
    panel.innerHTML=`<div class="camcard">
      <span class="camico ${p.spin?'spin':''}">${ico('camera')}</span>
      <b>${p.title}</b><p>${p.body}</p>
      <div class="camacts">
        ${p.cta?`<button class="big" id="camGo">${p.cta}</button>`:''}
        ${p.alt?`<button class="big ghost" id="camSkip">เล่นด้วยเมาส์แทน</button>`:''}
      </div></div>`;
    const go=$('camGo');if(go)go.onclick=()=>HT.start($('cam'));
    const sk=$('camSkip');if(sk)sk.onclick=()=>{panel.classList.remove('on');panel.innerHTML='';paintHelp()};
    paintHelp();
  }
  function paintHelp(){
    if(!help)return;
    help.innerHTML=HT.state==='ready'
      ?`<span class="handchip" id="handchip">${ico('hand')} <b>รอเจอมือ</b></span>
        <span class="camoff"><button id="camStop">ปิดกล้อง</button></span>`
      :`${fallbackHint}
        ${HT.state==='idle'?'· <button id="camOn" class="linkbtn">เปิดกล้องเพื่อเล่นด้วยมือ</button>':''}`;
    const st=$('camStop');if(st)st.onclick=()=>{HT.stop();paintPanel()};
    const on=$('camOn');if(on)on.onclick=()=>HT.start($('cam'));
  }
  HT.onstate=()=>{if(camScreen())paintPanel()};
  paintPanel();
  return{paintPanel,paintHelp};
}

/* --------------------------------------------------------------------------
   เคอร์เซอร์มือที่ใช้ร่วมกันในด่านที่ต้องเอื้อม (ด่าน 1 และ 6)
   ลำดับอินพุต: กล้อง -> คีย์บอร์ด -> เมาส์ ใครถูกใช้ล่าสุดได้สิทธิ์
   ผูก pointerup ที่ window ครั้งเดียวทั้งไฟล์ ไม่ต้องมีธง bound แยกรายเกม
   -------------------------------------------------------------------------- */
let PTR_DOWN=false;
addEventListener('pointerup',()=>{PTR_DOWN=false});
addEventListener('pointercancel',()=>{PTR_DOWN=false});

function handCursor(stage){
  const st={x:320,y:220,grab:false,src:'mouse',close:0,waiting:false,
            ptr:{x:320,y:220,on:false},kb:{x:320,y:220,grab:false,on:false}};
  /* svg ใช้ xMidYMid meet จึงต้องหักแถบว่างด้านข้างออก ไม่งั้นเคอร์เซอร์เยื้องจากเมาส์ */
  const toStage=ev=>{const r=stage.getBoundingClientRect();
    const sc=Math.min(r.width/640,r.height/400),w=640*sc,h=400*sc;
    return{x:clamp((ev.clientX-r.left-(r.width-w)/2)/sc,0,640),
           y:clamp((ev.clientY-r.top-(r.height-h)/2)/sc,0,400)}};
  stage.addEventListener('pointerdown',ev=>{const q=toStage(ev);
    st.ptr.x=q.x;st.ptr.y=q.y;st.ptr.on=true;st.kb.on=false;PTR_DOWN=true;
    ev.preventDefault();stage.focus()});
  stage.addEventListener('pointermove',ev=>{const q=toStage(ev);
    st.ptr.x=q.x;st.ptr.y=q.y;st.ptr.on=true;st.kb.on=false});
  /* คีย์บอร์ด: ลูกศรเลื่อน เว้นวรรคกำ/ปล่อย — เผื่อเด็กที่ใช้สวิตช์แทนเมาส์ */
  stage.addEventListener('keydown',e=>{
    const s=26;
    if(e.key==='ArrowUp')st.kb.y-=s; else if(e.key==='ArrowDown')st.kb.y+=s;
    else if(e.key==='ArrowLeft')st.kb.x-=s; else if(e.key==='ArrowRight')st.kb.x+=s;
    else if(e.key===' '||e.key==='Enter')st.kb.grab=!st.kb.grab; else return;
    st.kb.on=true;st.ptr.on=false;
    st.kb.x=clamp(st.kb.x,10,630);st.kb.y=clamp(st.kb.y,10,390);e.preventDefault()});
  st.step=dt=>{
    let cx,cy,grab,src;
    if(HT.state==='ready'&&HT.hand.on){cx=HT.hand.x*640;cy=HT.hand.y*400;grab=HT.hand.grab;src='cam'}
    else if(st.kb.on){cx=st.kb.x;cy=st.kb.y;grab=st.kb.grab;src='key'}
    else if(st.ptr.on){cx=st.ptr.x;cy=st.ptr.y;grab=PTR_DOWN;src='mouse'}
    else{cx=st.x;cy=st.y;grab=false;src=st.src}
    st.src=src;st.grab=grab;
    st.close=src==='cam'?HT.hand.close:(grab?1:0);
    const k=Math.min(1,dt*(src==='cam'?14:26));
    st.x+=(cx-st.x)*k;st.y+=(cy-st.y)*k;
    /* เปิดกล้องแล้วแต่ยังไม่เห็นมือ และยังไม่มีใครแตะเมาส์ — ซ่อนเคอร์เซอร์แล้วบอกให้ยกมือ */
    st.waiting=HT.state==='ready'&&!HT.hand.on&&!st.ptr.on&&!st.kb.on;
    return st;
  };
  return st;
}
/* วาดเคอร์เซอร์มือ : นิ้วหดเข้าเมื่อกำ เด็กจึงเห็นว่ามือตัวเองทำอะไรอยู่ */
function paintHandCursor(g,ring,fing,glow,c){
  g.setAttribute('opacity',c.waiting?'0':'1');
  g.setAttribute('transform',`translate(${r1(c.x)},${r1(c.y)})`);
  const fr=27-c.close*15;
  fing.innerHTML=[-150,-115,-80,-45,-10].map(deg=>{const a=deg*Math.PI/180;
    return `<circle cx="${r1(Math.cos(a)*fr)}" cy="${r1(Math.sin(a)*fr)}" r="${r1(6-c.close*1.6)}"/>`}).join('');
  ring.setAttribute('r',String(r1(27-c.close*7)));
  ring.setAttribute('stroke',c.grab?'#FFD98A':'#fff');
  glow.setAttribute('opacity',String(.12+c.close*.2));
}

/* แถบบอกระดับการกำมือแบบสด — ใช้ทั้งด่าน 1 และ 2
   ผู้ดูแลจะได้แยกออกว่าเด็กทำไม่ได้ หรือกล้องอ่านมือไม่เจอ */
function paintHandChip(label){
  const hc=$('handchip');if(!hc)return;
  const on=HT.hand.on,pc=Math.round(clamp(HT.hand.close,0,1)*100);
  hc.className='handchip'+(on?(HT.hand.grab?' grab':' open'):'');
  hc.innerHTML=`${ico('hand')} <b>${!on?'รอเจอมือ':label(HT.hand)}</b>`+
    `<i class="hbar"><u style="width:${on?pc:0}%"></u></i>`;
}

/* ==========================================================================
   ด่าน 1 — Shape Match (Game Only)
   --------------------------------------------------------------------------
   เป้าหมายของด่าน: เอื้อม เปิดมือ กำ และ "ปล่อย" ให้ตรงที่ — ยังไม่วัดแรงบีบ
   จึงมีเอนจินปรับความยากของตัวเอง (ขนาดเป้า / จำนวนทิศ / จำนวนครั้ง)
   แยกจากเอนจินด่านแรง และไม่เขียนทับ H.trials ที่หน้านักกายภาพใช้อยู่
   ========================================================================== */
const PRIORITY_REACH=['target_size','directions'];
const SH={raf:null,eng:null,trials:[],active:false,i:0,reps:6,ok:0,
  shape:null,slots:[],held:false,t0:0,rt:0,grabs:0,plen:0,px:0,py:0,dwell:0,assist:false,
  cur:{x:320,y:270,grab:false},src:'mouse',bound:false,keys:null,coach:'',done:false};

/* ค่าตั้งต้นของเด็กแต่ละคน: ยิ่งความสามารถน้อย เป้ายิ่งใหญ่และทิศยิ่งน้อย */
function reachStart(p){
  const a=p?p.ability:.5;
  return{target_size:a<.35?26:a<.6?23:a<.8?20:17,
         directions :a<.35?1:a<.6?2:a<.8?3:4,
         reps       :a<.35?4:a<.7?6:8};
}
/* เอนจินของด่านนี้ผูกกับแฟ้มเด็ก จึงจำความยากข้ามรอบได้เหมือนด่านแรง */
function reachEngine(){
  if(!H.reach||H.reachCode!==(S.p&&S.p.code)){
    H.reach=newEngine(reachStart(S.p));H.reach.prio=PRIORITY_REACH;H.reachCode=S.p&&S.p.code;}
  return H.reach;
}

const SHAPE_KINDS={
  circle  :{th:'วงกลม',    col:'#FFB43C',dk:'#C9791A'},
  square  :{th:'สี่เหลี่ยม',col:'#7FE3C0',dk:'#2E8C96'},
  triangle:{th:'สามเหลี่ยม',col:'#8FD8FF',dk:'#2F76A8'},
  star    :{th:'ดาว',      col:'#FF9DC4',dk:'#B03A6E'}
};
function shapePath(kind,r){
  const P=(pts)=>pts.map((p,i)=>(i?'L':'M')+r1(p[0])+','+r1(p[1])).join(' ')+' Z';
  if(kind==='circle')return `M 0,${-r} A ${r},${r} 0 1 1 0,${r} A ${r},${r} 0 1 1 0,${-r} Z`;
  if(kind==='square'){const s=r*.84;return P([[-s,-s],[s,-s],[s,s],[-s,s]])}
  if(kind==='triangle')return P([[0,-r],[r*.92,r*.7],[-r*.92,r*.7]]);
  const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.46:r;
    pts.push([Math.cos(a)*rr,Math.sin(a)*rr])}return P(pts);
}

SC.shape=()=>`
<div class="screen">
  <div class="ghead">
    <button class="back" data-go="home">${ico('arrow-left')} กลับไปที่เกาะ</button>
    <span class="eyebrow">ด่าน 1 · Explore &amp; Reach · Game Only</span>
  </div>
  <div class="gamewrap reachwrap" id="stage" tabindex="0" role="application"
       aria-label="เอื้อมมือไปที่รูปทรง กำมือเพื่อหยิบ แล้วแบมือปล่อยลงในช่องที่ตรงกัน">
    <video id="cam" playsinline muted aria-hidden="true"></video>
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="rgGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7BD256"/><stop offset="100%" stop-color="#4CA834"/></linearGradient>
        <filter id="rsoft"><feGaussianBlur stdDeviation="6"/></filter>
      </defs>
      <path d="M0,300 q80,-26 170,-8 t170,-6 t150,10 t150,-12 L640,400 L0,400 Z" fill="url(#rgGround)" opacity=".85"/>
      <g id="pips" transform="translate(24,28)"></g>
      <g id="slots"></g>
      <g id="shp" opacity="0"></g>
      <g id="cur" opacity="0">
        <circle id="curGlow" r="40" fill="#fff" opacity=".18" filter="url(#rsoft)"/>
        <circle id="curRing" r="27" fill="rgba(255,255,255,.2)" stroke="#fff" stroke-width="3.5"/>
        <g id="curFing" fill="#fff"></g>
        <circle r="11" fill="#fff"/>
      </g>
      <text id="coach" x="320" y="390" text-anchor="middle" fill="#0B3B46"
            style="font-family:var(--fd);font-weight:700;font-size:19px"></text>
    </svg>
    <canvas id="fx"></canvas>
    <div class="camstate" id="camstate"></div>
  </div>
  <div class="gbar">
    <div class="helpline" id="helpline"></div>
    <button class="quit" id="shQuit">จบภารกิจ</button>
  </div>
  <p class="privnote">${ico('camera')} ภาพจากกล้องถูกประมวลผลในเครื่องนี้เท่านั้น ไม่ถูกบันทึกและไม่ถูกส่งออกไปที่ใด
    เล่นด้วยเมาส์หรือนิ้วบนจอแทนได้ตลอดเวลา</p>
</div>`;

function mountShape(){
  const stage=$('stage'),svgSlots=$('slots'),svgShp=$('shp'),cur=$('cur'),
        curRing=$('curRing'),curFing=$('curFing'),curGlow=$('curGlow'),
        coach=$('coach'),pips=$('pips'),help=$('helpline');
  FX.attach($('fx'));
  S.lastGame='shape';
  SH.eng=reachEngine();
  const d=SH.eng.diff;
  Object.assign(SH,{trials:[],i:0,ok:0,reps:Math.round(d.reps),shape:null,held:false,done:false,
                    cur:{x:320,y:270,grab:false},src:'mouse'});
  G.results=[];

  /* ---------- ช่องหยอด ---------- */
  const KINDS=Object.keys(SHAPE_KINDS);
  const rng=mulberry32(hash((S.p?S.p.code:'X')+'reach'));
  const shuffle=a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=(rng()*(i+1))|0;[b[i],b[j]]=[b[j],b[i]]}return b};
  SH.slots=shuffle(KINDS).slice(0,3).map((k,i)=>({kind:k,x:150+i*170,y:316,filled:false}));
  /* ช่องกว้างกว่ารูปทรงที่ใหญ่ที่สุดเสมอ ไม่งั้นภาพจะดูเหมือนหยอดของใหญ่ลงรูเล็ก */
  const SLOT_R=50;
  /* target_size คือ % ของความสูงจอ แปลงเป็นรัศมี: 26% -> 46px (ง่ายสุด) · 8% -> 18px (ยากสุด) */
  const radiusOf=ts=>r1(18+(clamp(ts,8,26)-8)/18*28);
  function drawSlots(){
    svgSlots.innerHTML=SH.slots.map(s=>{
      const c=SHAPE_KINDS[s.kind];
      return `<g transform="translate(${s.x},${s.y})">
        <ellipse cy="6" rx="${SLOT_R+10}" ry="14" fill="rgba(11,59,70,.18)"/>
        <path d="${shapePath(s.kind,SLOT_R)}" fill="${s.filled?c.col:'rgba(255,255,255,.35)'}"
              stroke="${s.filled?c.dk:'#fff'}" stroke-width="4" stroke-linejoin="round"
              stroke-dasharray="${s.filled?'':'9 8'}"/>
        ${s.filled?`<use href="#i-check" x="-11" y="-11" width="22" height="22" color="${c.dk}"/>`:''}
      </g>`}).join('');
  }
  function drawPips(){
    pips.innerHTML=Array.from({length:SH.reps},(_,i)=>{
      const t=SH.trials[i];
      return t?`<circle cx="${i*26}" cy="0" r="9" fill="${t.ok?'#7BD256':'rgba(255,255,255,.45)'}" stroke="#fff" stroke-width="2.5"/>`
              :`<circle cx="${i*26}" cy="0" r="9" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.6)" stroke-width="2.5"/>`}).join('');
  }

  /* ---------- จุดเกิดของรูปทรง : กระจายตามจำนวนทิศที่ระบบตั้งไว้ ---------- */
  const HOME={x:320,y:300};
  let sectors=[];
  function spawnPoint(){
    const n=Math.max(1,Math.round(SH.eng.diff.directions));
    if(!sectors.length||sectors.n!==n){sectors=shuffle(Array.from({length:n},(_,i)=>i));sectors.n=n}
    const i=sectors[SH.i%n];
    const a0=-Math.PI*.86,a1=-Math.PI*.14;
    const a=n===1?-Math.PI/2:a0+(a1-a0)*(i/(n-1));
    return{x:clamp(HOME.x+Math.cos(a)*215,95,545),y:clamp(HOME.y+Math.sin(a)*180,80,236)};
  }

  /* ---------- เริ่มภารกิจย่อยหนึ่งครั้ง ---------- */
  function nextTrial(){
    if(SH.i>=SH.reps){endRound();return}
    const open=SH.slots.filter(s=>!s.filled);
    if(!open.length){SH.slots.forEach(s=>s.filled=false);drawSlots()}
    const pool=SH.slots.filter(s=>!s.filled);
    const pick=pool[(rng()*pool.length)|0];
    const p=spawnPoint();
    SH.shape={kind:pick.kind,x:p.x,y:p.y,hx:p.x,hy:p.y,tx:p.x,ty:p.y,
              r:radiusOf(SH.eng.diff.target_size),scale:1,placed:false};
    SH.held=false;SH.grabs=0;SH.rt=0;SH.plen=0;SH.px=null;SH.dwell=0;SH.assist=false;
    SH.t0=performance.now();SH.active=true;
    svgShp.setAttribute('opacity','1');
    drawPips();
  }

  function drawShape(){
    const s=SH.shape;if(!s)return;
    const c=SHAPE_KINDS[s.kind];
    svgShp.setAttribute('transform',`translate(${r1(s.x)},${r1(s.y)}) scale(${r1(s.scale)})`);
    svgShp.innerHTML=
      `<ellipse cy="${s.r*1.05}" rx="${s.r*.8}" ry="${s.r*.2}" fill="rgba(11,59,70,.16)"/>
       <path d="${shapePath(s.kind,s.r)}" fill="${c.col}" stroke="${c.dk}" stroke-width="5" stroke-linejoin="round"/>
       <circle cx="${-s.r*.3}" cy="${-s.r*.34}" r="${s.r*.15}" fill="#fff" opacity=".55"/>`;
  }

  /* ---------- จบภารกิจย่อย ---------- */
  function finish(ok,slot){
    if(!SH.active)return;SH.active=false;
    const s=SH.shape,ms=performance.now()-SH.t0;
    const straight=Math.hypot(s.hx-(slot?slot.x:s.x),s.hy-(slot?slot.y:s.y));
    SH.trials.push({i:SH.trials.length+1,kind:s.kind,ok,ms:Math.round(ms),
      rt:Math.round(SH.rt),grabs:SH.grabs,assisted:!!SH.assist,
      pathEff:Math.round(clamp(100*straight/Math.max(1,SH.plen),0,100)),
      size:SH.eng.diff.target_size,dirs:SH.eng.diff.directions});
    SH.eng.results.push(ok?1:0);G.results.push(ok?1:0);
    const rec=updateEngine(SH.eng,PRIORITY_REACH);
    SH.i++;drawPips();

    if(ok){
      SH.ok++;slot.filled=true;
      s.placed=true;s.tx=slot.x;s.ty=slot.y;
      FX.burst(slot.x,slot.y,44,[SHAPE_KINDS[s.kind].col,'#fff','#FFD98A','#7BD256'],210);
      FX.ring(slot.x,slot.y,'#fff');FX.ring(slot.x,slot.y,SHAPE_KINDS[s.kind].col);
      FX.shake=7;FX.glow=1;
      stage.classList.remove('flash');void stage.offsetWidth;stage.classList.add('flash');
      setTimeout(drawSlots,260);
      if(S.p){S.p.seeds=Math.min(9,S.p.seeds+(SH.ok%2===0?1:0));saveStore()}
    }else{
      FX.burst(s.x,s.y,12,['#CFE7F0'],80);
    }
    setCoach(ok?'เก่งมาก':'ไม่เป็นไร ลองใหม่');
    /* ป้ายบอกว่าระบบขยับความยาก — เป็นอนุภาค ไม่ใช่ตัวเลข */
    if(rec&&['up','down','down2'].includes(rec.action))
      setTimeout(()=>FX.burst(320,60,18,[rec.action==='up'?'#7BD256':'#FFD98A'],110),700);
    setTimeout(()=>{svgShp.setAttribute('opacity','0');nextTrial()},ok?900:700);
  }

  function endRound(){
    if(SH.done)return;SH.done=true;SH.active=false;
    cancelAnimationFrame(SH.raf);HT.stop();
    setTimeout(goReward,420);
  }

  /* ---------- ข้อความโค้ช ---------- */
  function setCoach(t){if(SH.coach!==t){SH.coach=t;coach.textContent=t}}

  /* ---------- อินพุต : กล้องเป็นหลัก เมาส์/นิ้ว/คีย์บอร์ดเป็นทางสำรองเสมอ ---------- */
  const HC=handCursor(stage);
  camPanel($('camstate'),help,'เอื้อมด้วยเมาส์หรือนิ้ว: กดค้างเพื่อหยิบ ปล่อยเพื่อวาง');

  drawSlots();drawPips();nextTrial();

  /* ---------- ลูปหลัก ---------- */
  let last=performance.now();
  function loop(now){
    SH.raf=requestAnimationFrame(loop);
    const dt=Math.min(.05,(now-last)/1000);last=now;
    const s=SH.shape;

    const c=HC.step(dt);
    SH.cur.x=c.x;SH.cur.y=c.y;SH.cur.grab=c.grab;SH.src=c.src;
    const grab=c.grab,waiting=c.waiting;
    paintHandCursor(cur,curRing,curFing,curGlow,c);

    /* แผงกล้องบังจออยู่ = ยังไม่ได้เริ่มเล่น ต้องเลื่อนเวลาเริ่มไปเรื่อย ๆ
       ไม่งั้นภารกิจจะหมดเวลาแล้วถูกบันทึกว่าล้มเหลวทั้งที่เด็กยังไม่ได้เห็นจอ */
    const paused=$('camstate')&&$('camstate').classList.contains('on');
    if(paused)SH.t0=performance.now();

    if(s&&SH.active&&!paused){
      const dist=Math.hypot(SH.cur.x-s.x,SH.cur.y-s.y);
      /* หยิบ */
      if(!SH.held&&grab&&dist<s.r+48&&!s.placed){
        SH.held=true;SH.grabs++;
        if(!SH.rt)SH.rt=performance.now()-SH.t0;
        FX.burst(s.x,s.y,10,[SHAPE_KINDS[s.kind].col],90);
      }
      /* ปล่อย */
      else if(SH.held&&!grab){
        SH.held=false;
        const near=SH.slots.filter(sl=>!sl.filled)
          .map(sl=>({sl,d:Math.hypot(s.x-sl.x,s.y-sl.y)}))
          .sort((a,b)=>a.d-b.d)[0];
        if(near&&near.d<SLOT_R+34){
          if(near.sl.kind===s.kind){finish(true,near.sl)}
          else{s.tx=s.hx;s.ty=s.hy;FX.burst(s.x,s.y,10,['#CFE7F0'],70);setCoach('ช่องนี้ไม่ตรงกัน ลองช่องอื่น')}
        }else{s.tx=s.hx;s.ty=s.hy}
      }
      if(SH.held){s.tx=SH.cur.x;s.ty=SH.cur.y-6;
        SH.plen+=SH.px==null?0:Math.hypot(SH.cur.x-SH.px,SH.cur.y-SH.py);
        SH.px=SH.cur.x;SH.py=SH.cur.y;
        /* ตาข่ายรองรับ: ถ้าค้างอยู่เหนือช่องที่ถูกต้องนานพอ ให้หย่อนลงเอง
           เด็กที่ยังคลายมือไม่ได้จริง ๆ จะได้เล่นจบด่าน แต่บันทึกไว้ว่าเป็นการช่วย
           ตั้งไว้นานกว่าการปล่อยเองมาก การปล่อยด้วยมือจึงยังเป็นทางหลักเสมอ */
        const tg=SH.slots.find(sl=>sl.kind===s.kind&&!sl.filled);
        if(tg&&Math.hypot(s.x-tg.x,s.y-tg.y)<SLOT_R+20){
          SH.dwell+=dt;
          if(SH.dwell>=1.6){SH.held=false;SH.assist=true;finish(true,tg)}
        }else SH.dwell=0;
      }
      else{SH.px=null;SH.dwell=0}

      /* หมดเวลาถือว่ายังไม่สำเร็จ — ระบบจะลดความยากให้เอง */
      if((performance.now()-SH.t0)/1000>24)finish(false,null);

      /* คำใบ้ */
      if(waiting)setCoach('ยกมือขึ้นให้กล้องเห็น');
      else if(SH.held){
        const tgt=SH.slots.find(sl=>sl.kind===s.kind&&!sl.filled);
        const over=tgt&&Math.hypot(s.x-tgt.x,s.y-tgt.y)<SLOT_R+34;
        setCoach(over?'แบมือเพื่อวางลง':'ลากไปที่ช่องรูปเดียวกัน');
      }else if(dist<s.r+58)setCoach('กำมือเพื่อหยิบ');
      else setCoach('เอื้อมไปที่'+SHAPE_KINDS[s.kind].th);
    }

    /* ช่องเป้าหมายกะพริบเบา ๆ ให้เด็กเห็นว่าจะไปไหนต่อ */
    if(s&&SH.held){
      const tgt=SH.slots.find(sl=>sl.kind===s.kind&&!sl.filled);
      if(tgt&&Math.random()<.14)FX.spark(tgt.x+(Math.random()*60-30),tgt.y+(Math.random()*40-20),SHAPE_KINDS[s.kind].col);
    }

    if(s){
      const k=Math.min(1,dt*(SH.held?18:9));
      s.x+=(s.tx-s.x)*k;s.y+=(s.ty-s.y)*k;
      const want=s.placed?.001:(SH.held?1.1:1+Math.sin(now/620)*.03);
      s.scale+=(want-s.scale)*Math.min(1,dt*9);
      drawShape();
    }

    if(HT.state==='ready')paintHandChip(h=>h.grab?'กำมืออยู่':'แบมืออยู่');

    FX.step(dt);FX.draw();
  }
  cancelAnimationFrame(SH.raf);SH.raf=requestAnimationFrame(loop);
  stage.focus({preventScroll:true});
  $('shQuit').onclick=()=>endRound();
}

/* ==========================================================================
   ด่าน 3 — Rocket Simulator (Game Only)
   --------------------------------------------------------------------------
   เป้าหมายของด่าน: "คุมแรงให้อยู่ในช่วงที่กำหนด ไม่ใช่บีบให้แรงที่สุด"
   ระดับการกำมือ = ความสูงของจรวดโดยตรง กำสุดแรงจะพุ่งเลยห่วงไป เด็กจึงต้องคุมระดับ
   ใช้ H.engine กับ H.trials ชุดเดียวกับด่านแรง เพราะเป็นงานคุมแรงเหมือนกัน
   ต่างจากด่าน 1 ที่เป็นงานเอื้อม ตัวชี้วัดคนละชนิดจึงต้องแยกเอนจิน
   มิติทั้งสามของด่านนี้แปลงเป็นภาพตรง ๆ :
     target_force   -> ความสูงของช่องทางบิน
     tolerance_band -> ความสูงของช่องห่วง (แคบลง = ยากขึ้น)
     hold_time      -> จำนวนห่วงในหนึ่งด่านย่อย (ยาวขึ้น = ต้องนิ่งนานขึ้น)
   ========================================================================== */
const R={raf:null,gate:null,samples:[],results:[],alt:0,laneAlt:30,vy:0,t0:0,rt:0,
         passed:0,total:0,bound:false,pointer:{y:0,on:false},kb:{a:0,on:false},sparkT:0};
const RK={X:150,TOP:52,BOT:338,SP:64,V:132};
const rAltY=a=>RK.BOT-clamp(a,0,100)/100*(RK.BOT-RK.TOP);
const hoopsFor=ht=>clamp(1+Math.round(ht),2,6);

SC.rocket=()=>`
<div class="screen">
  <div class="ghead">
    <button class="back" data-go="home">${ico('arrow-left')} กลับไปที่เกาะ</button>
    <span class="eyebrow">ด่าน 3 · Force Control · Game Only</span>
  </div>
  <div class="gamewrap skywrap" id="stage" tabindex="0" role="application"
       aria-label="กำมือมากขึ้นจรวดจะบินสูงขึ้น คุมระดับให้ผ่านกลางห่วง">
    <video id="cam" playsinline muted aria-hidden="true"></video>
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="rkLane" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#7FE3C0" stop-opacity=".05"/>
          <stop offset="100%" stop-color="#7FE3C0" stop-opacity=".22"/></linearGradient>
        <filter id="rkSoft"><feGaussianBlur stdDeviation="6"/></filter>
      </defs>
      <g id="stars"></g>
      <path d="M0,356 q70,-20 150,-6 t150,-4 t170,8 t170,-10 L640,400 L0,400 Z" fill="rgba(11,59,70,.4)"/>
      <!-- ช่องทางบินเป้าหมาย : บอกว่า "ต้องอยู่แถบนี้" ไม่ใช่ "บีบให้สุด" -->
      <g id="lane">
        <rect id="laneBox" x="0" y="170" width="640" height="60" fill="url(#rkLane)"/>
        <path id="laneTop" d="M0,170 H640" stroke="#7FE3C0" stroke-width="2.5" stroke-dasharray="10 9" opacity=".75"/>
        <path id="laneBot" d="M0,230 H640" stroke="#7FE3C0" stroke-width="2.5" stroke-dasharray="10 9" opacity=".75"/>
      </g>
      <g id="gate"></g>
      <g id="rocket" transform="translate(150,240)">
        <g id="flame"><path id="flameP" d="M -6,16 q 6,22 6,22 q 0,0 6,-22 z" fill="#FFB43C"/></g>
        <g id="rkBody">
          <path d="M 0,-26 q 13,15 13,30 q 0,10 -13,10 q -13,0 -13,-10 q 0,-15 13,-30 z"
                fill="#F7E5C6" stroke="#17262E" stroke-width="3" stroke-linejoin="round"/>
          <path d="M -13,8 l -10,14 l 10,-3 z" fill="#FF9DC4" stroke="#17262E" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M 13,8 l 10,14 l -10,-3 z" fill="#FF9DC4" stroke="#17262E" stroke-width="2.5" stroke-linejoin="round"/>
          <circle cy="-4" r="6.5" fill="#8FD8FF" stroke="#17262E" stroke-width="2.5"/>
        </g>
      </g>
      <g id="score" transform="translate(24,30)"></g>
      <text id="rkCoach" x="320" y="386" text-anchor="middle" fill="#0B3B46"
            style="font-family:var(--fd);font-weight:700;font-size:18px"></text>
    </svg>
    <canvas id="fx"></canvas>
    <div class="camstate" id="camstate"></div>
  </div>
  <div class="gbar">
    <div class="helpline" id="helpline"></div>
    <button class="quit" data-go="reward">จบภารกิจ</button>
  </div>
  <p class="privnote">${ico('camera')} ภาพจากกล้องถูกประมวลผลในเครื่องนี้เท่านั้น ไม่ถูกบันทึกและไม่ถูกส่งออกไปที่ใด
    เล่นด้วยเมาส์หรือนิ้วบนจอแทนได้ตลอดเวลา</p>
</div>`;

function mountRocket(){
  const stage=$('stage'),gateG=$('gate'),rk=$('rocket'),body=$('rkBody'),flame=$('flameP'),
        laneBox=$('laneBox'),laneTop=$('laneTop'),laneBot=$('laneBot'),
        coach=$('rkCoach'),scoreG=$('score'),starsG=$('stars');
  FX.attach($('fx'));
  S.lastGame='rocket';
  Object.assign(R,{gate:null,samples:[],results:[],alt:0,vy:0,rt:0,passed:0,total:0,sparkT:0,
                   laneAlt:H.engine.diff.target_force,
                   pointer:{y:0,on:false},kb:{a:0,on:false}});
  G.results=[];
  S.runFrom=H.trials.length;                      // ด่านนี้เขียนลง H.trials เหมือนด่าน 2

  const rng=mulberry32(hash((S.p?S.p.code:'X')+'rocket'));
  starsG.innerHTML=Array.from({length:34},()=>{
    const x=rng()*640,y=rng()*300,r=.8+rng()*1.8;
    return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="#fff" opacity="${r1(.25+rng()*.5)}"/>`}).join('');

  function drawLane(alt){
    const tb=H.engine.diff.tolerance_band,yT=rAltY(alt+tb),yB=rAltY(alt-tb);
    laneBox.setAttribute('y',yT);laneBox.setAttribute('height',Math.max(8,yB-yT));
    laneTop.setAttribute('d',`M0,${yT} H640`);laneBot.setAttribute('d',`M0,${yB} H640`);
  }
  function drawScore(){
    scoreG.innerHTML=Array.from({length:Math.min(8,Math.max(5,R.total))},(_,i)=>
      i<R.passed?`<use href="#i-star-fill" x="${i*26-9}" y="-9" width="18" height="18" color="#FFD98A"/>`
                :`<circle cx="${i*26}" cy="0" r="7" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.5)" stroke-width="2"/>`).join('');
  }
  R.laneAlt=H.engine.diff.target_force;
  drawLane(R.laneAlt);drawScore();

  /* ความสูงของห่วงแต่ละชุดสุ่มรอบค่าเป้าหมาย และบังคับให้ห่างจากชุดก่อนหน้าพอสมควร
     ด่านนี้ฝึก "คุมแรงให้ได้หลายระดับ" ถ้าห่วงอยู่ความสูงเดิมทุกครั้ง
     เด็กจะจำท่ามือเดียวแล้วค้างไว้เฉย ๆ ซึ่งไม่ใช่การคุมแรง */
  const RSPREAD=24,RGAP=15;
  let lastAlt=null;
  function pickAlt(tb){
    const lo=clamp(tb+8,8,46),hi=clamp(100-tb-8,54,94);
    const base=clamp(H.engine.diff.target_force,lo,hi);
    for(let i=0;i<24;i++){
      const a=r1(clamp(base+(rng()*2-1)*RSPREAD,lo,hi));
      if(lastAlt===null||Math.abs(a-lastAlt)>=RGAP){lastAlt=a;return a}
    }
    /* สุ่มไม่ผ่านเกณฑ์ห่าง ก็บังคับให้สลับฝั่งไปเลย จะได้ไม่ซ้ำที่เดิม */
    const a=r1(clamp(lastAlt>base?base-RGAP:base+RGAP,lo,hi));lastAlt=a;return a;
  }

  /* ---------- ด่านย่อยหนึ่งชุด = ห่วงเรียงกันตาม hold_time ---------- */
  function newGate(){
    const d={...H.engine.diff},alt=pickAlt(d.tolerance_band);
    R.gate={x:700,k:hoopsFor(d.hold_time),next:0,hit:0,diff:d,alt,
            yT:rAltY(alt+d.tolerance_band),yB:rAltY(alt-d.tolerance_band)};
    R.samples=[];R.rt=0;R.t0=performance.now();
  }
  function drawGate(){
    const g=R.gate;if(!g){gateG.innerHTML='';return}
    const cy=(g.yT+g.yB)/2,ry=Math.max(14,(g.yB-g.yT)/2);
    gateG.innerHTML=Array.from({length:g.k},(_,i)=>{
      const x=g.x+i*RK.SP;
      if(x<-70||x>720)return '';
      const done=i<g.next,ok=done&&g.res&&g.res[i];
      const col=done?(ok?'#7BD256':'#FF9DC4'):'#FFD98A';
      return `<g transform="translate(${r1(x)},${r1(cy)})" opacity="${done?.45:1}">
        <ellipse rx="13" ry="${r1(ry)}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round"/>
        <ellipse rx="13" ry="${r1(ry)}" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/></g>`;
    }).join('');
  }

  /* ---------- จบด่านย่อย : เขียนลงชุดข้อมูลเดียวกับด่านแรง ---------- */
  function endGate(){
    const g=R.gate;if(!g)return;
    const d=g.diff,ok=g.hit>=Math.ceil(g.k*.75);
    /* วัดจากความสูงของชุดห่วงนั้นจริง ๆ ไม่ใช่ target_force กลาง
       เพราะแต่ละชุดสุ่มความสูงมา ถ้าวัดจากค่ากลางตัวเลขจะผิดทุกชุดที่ไม่ได้อยู่ตรงกลางพอดี */
    const aim=g.alt;
    const inb=R.samples.filter(f=>Math.abs(f-aim)<=d.tolerance_band);
    const base=inb.length?inb:R.samples,mu=mean(base)||1;
    const sd=Math.sqrt(mean(base.map(f=>(f-mu)**2))||0);
    H.trials.push({i:H.trials.length+1,live:true,ok,diff:d,alt:aim,
      GSI:Math.round(clamp(100*(1-sd/Math.max(mu,1)),0,100)),
      GAS:Math.round(clamp(100*(1-mean(R.samples.map(f=>Math.abs(f-aim)))/Math.max(1,aim)),0,100)),
      GES:Math.round(clamp(100*inb.length/Math.max(1,R.samples.length),0,100)),
      RT :Math.round(R.rt||0),
      GDI:Math.round(clamp(45+100*(1-sd/Math.max(mu,1))*.35+(Math.random()*8-4),0,100))});
    R.results.push(ok?1:0);G.results.push(ok?1:0);H.engine.results.push(ok?1:0);S.live++;
    R.total++;if(ok)R.passed++;
    const rec=updateEngine(H.engine);
    drawScore();
    setCoach(ok?'ผ่านห่วงแล้ว':'ยังไม่ผ่าน ลองคุมให้นิ่งขึ้น');
    if(ok&&S.p){S.p.seeds=Math.min(9,S.p.seeds+(R.passed%2===0?1:0));saveStore()}
    if(rec&&['up','down','down2'].includes(rec.action))
      FX.burst(320,rec.action==='up'?70:330,18,[rec.action==='up'?'#7BD256':'#FFD98A'],110);
    R.gate=null;
  }

  let coachHold='';
  function setCoach(t){if(coachHold!==t){coachHold=t;coach.textContent=t}}

  /* ---------- อินพุต ---------- */
  const toAlt=ev=>{const r=stage.getBoundingClientRect();
    const sc=Math.min(r.width/640,r.height/400),h=400*sc;
    const y=(ev.clientY-r.top-(r.height-h)/2)/sc;
    return clamp((RK.BOT-y)/(RK.BOT-RK.TOP)*100,0,100)};
  stage.addEventListener('pointerdown',ev=>{R.pointer.y=toAlt(ev);R.pointer.on=true;R.kb.on=false;
    ev.preventDefault();stage.focus()});
  stage.addEventListener('pointermove',ev=>{R.pointer.y=toAlt(ev);R.pointer.on=true;R.kb.on=false});
  stage.addEventListener('keydown',e=>{
    if(e.key==='ArrowUp'){R.kb.a=clamp(R.kb.a+5,0,100);R.kb.on=true;R.pointer.on=false;e.preventDefault()}
    else if(e.key==='ArrowDown'){R.kb.a=clamp(R.kb.a-5,0,100);R.kb.on=true;R.pointer.on=false;e.preventDefault()}});

  camPanel($('camstate'),$('helpline'),'บังคับด้วยเมาส์: เลื่อนขึ้น–ลงในจอ · หรือปุ่มลูกศรขึ้น–ลง');
  stage.focus({preventScroll:true});

  /* ---------- ลูปหลัก ---------- */
  let last=performance.now();
  function loop(now){
    R.raf=requestAnimationFrame(loop);
    const dt=Math.min(.05,(now-last)/1000);last=now;
    const paused=$('camstate')&&$('camstate').classList.contains('on');

    /* แหล่งอินพุต : กล้องก่อน แล้วค่อยเมาส์/คีย์บอร์ด */
    let want=R.alt;
    if(!paused){
      if(HT.state==='ready'&&HT.hand.on)want=clamp(HT.hand.close*100,0,100);
      else if(HT.state==='ready'&&!R.pointer.on&&!R.kb.on)want=Math.max(0,R.alt-dt*40);
      else if(R.kb.on)want=R.kb.a;
      else if(R.pointer.on)want=R.pointer.y;
    }else want=0;
    const prev=R.alt;
    R.alt+=(want-R.alt)*Math.min(1,dt*8);
    R.vy=(R.alt-prev)/Math.max(dt,1e-3);

    if(!paused&&!R.gate)newGate();
    const d=H.engine.diff;
    /* เล็งที่ความสูงของชุดห่วงที่กำลังวิ่งเข้ามา ไม่ใช่ค่ากลางของเอนจิน */
    const aim=R.gate?R.gate.alt:d.target_force;
    const good=Math.abs(R.alt-aim)<=d.tolerance_band;
    /* ช่องทางบินเลื่อนไปหาความสูงใหม่ล่วงหน้า ห่วงใช้เวลาเดินทางถึงจรวดราว 4 วินาที
       เด็กจึงเห็นว่าต้องไปที่ระดับไหนก่อนห่วงจะมาถึง ไม่ใช่รู้ตอนชนแล้ว */
    R.laneAlt+=(aim-R.laneAlt)*Math.min(1,dt*3.2);
    drawLane(R.laneAlt);

    if(!paused){
      const g=R.gate;
      g.x-=RK.V*dt;
      R.samples.push(R.alt);
      if(!R.rt&&R.alt>8)R.rt=now-R.t0;
      /* ประเมินทีละห่วงตอนที่ห่วงนั้นเลื่อนมาถึงจรวดพอดี */
      if(!g.res)g.res=[];
      while(g.next<g.k&&g.x+g.next*RK.SP<=RK.X){
        const hit=Math.abs(R.alt-g.alt)<=d.tolerance_band;
        g.res[g.next]=hit;if(hit){g.hit++;
          FX.burst(RK.X,rAltY(R.alt),16,['#7BD256','#FFD98A','#fff'],150);FX.ring(RK.X,rAltY(R.alt),'#7BD256')}
        else FX.burst(RK.X,rAltY(R.alt),6,['#FF9DC4'],70);
        g.next++;
      }
      if(g.next>=g.k&&g.x+(g.k-1)*RK.SP<RK.X-40)endGate();
    }

    /* จรวด : เอียงตามการไต่ระดับ เปลวไฟยาวตามระดับการกำมือ */
    const y=rAltY(R.alt);
    rk.setAttribute('transform',`translate(${RK.X},${r1(y)}) rotate(${r1(clamp(-R.vy*.22,-16,16))})`);
    flame.setAttribute('d',`M -6,16 q 6,${r1(14+R.alt*.34)} 6,${r1(14+R.alt*.34)} q 0,0 6,${r1(-14-R.alt*.34)} z`);
    flame.setAttribute('fill',good?'#7BD256':'#FFB43C');
    body.setAttribute('opacity',R.alt<2?'.75':'1');

    /* ประกายเมื่ออยู่ในช่องทางบิน */
    if(good&&!paused){R.sparkT+=dt;
      if(R.sparkT>.07){R.sparkT=0;FX.spark(RK.X-24+(Math.random()*20-10),y+(Math.random()*20-10),'#7FE3C0')}}

    if(!paused){
      if(HT.state==='ready'&&!HT.hand.on)setCoach('ยกมือขึ้นให้กล้องเห็น');
      else if(good)setCoach('กำลังดี คุมไว้แบบนี้');
      else if(R.alt<aim)setCoach('กำมือขึ้นอีกนิด');
      else setCoach('คลายมือลงนิดหนึ่ง');
    }
    if(HT.state==='ready')paintHandChip(()=>good?'อยู่ในช่องทางบิน':R.alt<aim?'ต่ำไป':'สูงไป');

    drawGate();
    FX.step(dt);FX.draw();
  }
  cancelAnimationFrame(R.raf);R.raf=requestAnimationFrame(loop);
}

/* ==========================================================================
   ด่าน 4 — Feed Monster (Game Only)
   --------------------------------------------------------------------------
   เป้าหมายของด่าน: "ฝึกจังหวะ บีบให้ทัน และปล่อยให้ตรงเวลา"
   มือแบ = ปากอ้า · มือกำ = ปากหุบ  หนึ่งภารกิจย่อยมีสองจังหวะ:
     1) หุบปากรออาหาร แล้ว "อ้าให้ทัน" ตอนอาหารมาถึง  -> ฝึกการเปิดมือตามจังหวะ
     2) พออาหารเข้าปากแล้ว "หุบให้ทัน" เพื่อเคี้ยว      -> ฝึกการปิดมือตามจังหวะ
   จงใจให้ทั้งการอ้าค้างไว้ตลอดและการหุบค้างไว้ตลอด "ไม่ผ่าน" ทั้งคู่
   เพราะสิ่งที่ฝึกคือจังหวะ ไม่ใช่ท่ามือค้าง (armed ด้านล่างคือกลไกนี้)
   ตัวชี้วัดเป็นเวลาตอบสนอง ไม่ใช่ค่าแรง จึงแยกเอนจินและคลังข้อมูลจากด่านแรง
   ========================================================================== */
const PRIORITY_TIMING=['react_window','target_size'];
const TM={raf:null,eng:null,trials:[],i:0,reps:6,ok:0,food:null,phase:'idle',
          armed:false,openedAt:0,caughtAt:0,rtOpen:0,rtClose:0,winStart:0,
          mouth:0,open:true,pointer:{down:false,on:false},kb:{closed:false,on:false},
          coach:'',done:false,bound:false,nextAt:0};

function timingStart(p){
  const a=p?p.ability:.5;
  return{react_window:a<.35?3:a<.6?2.5:a<.8?2:1.5,
         target_size :a<.35?26:a<.6?23:a<.8?20:17,
         reps        :a<.35?4:a<.7?6:8};
}
function timingEngine(){
  if(!H.timing||H.timingCode!==(S.p&&S.p.code)){
    H.timing=newEngine(timingStart(S.p));H.timing.prio=PRIORITY_TIMING;H.timingCode=S.p&&S.p.code;}
  return H.timing;
}

const FOODS=[{col:'#FF9DC4',dk:'#B03A6E'},{col:'#FFB43C',dk:'#C9791A'},
             {col:'#7FE3C0',dk:'#2E8C96'},{col:'#8FD8FF',dk:'#2F76A8'}];
const MK={X0:60,MOUTH:452,Y:206,TRAVEL:2.0,SPREAD:1.4};

SC.monster=()=>`
<div class="screen">
  <div class="ghead">
    <button class="back" data-go="home">${ico('arrow-left')} กลับไปที่เกาะ</button>
    <span class="eyebrow">ด่าน 4 · Timing &amp; Release · Game Only</span>
  </div>
  <div class="gamewrap denwrap" id="stage" tabindex="0" role="application"
       aria-label="หุบมือรออาหาร แล้วแบมือให้ทันตอนอาหารมาถึงปาก จากนั้นหุบมือเพื่อเคี้ยว">
    <video id="cam" playsinline muted aria-hidden="true"></video>
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="mkSoft"><feGaussianBlur stdDeviation="7"/></filter>
        <clipPath id="mouthClip"><ellipse id="mouthClipE" cx="0" cy="0" rx="46" ry="30"/></clipPath>
      </defs>
      <path d="M0,318 q80,-22 160,-6 t160,-4 t160,8 t160,-10 L640,400 L0,400 Z" fill="rgba(11,59,70,.34)"/>
      <g id="pips" transform="translate(24,28)"></g>

      <!-- สัตว์ประหลาด : ปากอ้าตามมือ -->
      <g id="mon" transform="translate(510,206)">
        <ellipse id="monGlow" rx="98" ry="96" fill="#7BD256" opacity=".18" filter="url(#mkSoft)"/>
        <path id="monBody" d="M -84,26 q -6,-96 84,-96 q 90,0 84,96 q 6,66 -84,66 q -90,0 -84,-66 z"
              fill="#8FD8FF" stroke="#17262E" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="-34" cy="-46" r="15" fill="#fff" stroke="#17262E" stroke-width="3"/>
        <circle cx="34" cy="-46" r="15" fill="#fff" stroke="#17262E" stroke-width="3"/>
        <circle id="monEyeL" cx="-34" cy="-44" r="6.5" fill="#17262E"/>
        <circle id="monEyeR" cx="34" cy="-44" r="6.5" fill="#17262E"/>
        <g id="mouthG" transform="translate(-58,10)">
          <ellipse id="mouth" rx="46" ry="8" fill="#17262E"/>
          <ellipse id="tongue" cy="4" rx="26" ry="4" fill="#FF9DC4" opacity="0"/>
        </g>
      </g>

      <!-- วงแหวนนับจังหวะ : หดเข้าเมื่ออาหารใกล้ถึง = สัญญาณว่า "อ้าเดี๋ยวนี้" -->
      <circle id="cue" cx="452" cy="206" r="120" fill="none" stroke="#FFD98A"
              stroke-width="6" stroke-linecap="round" opacity="0"/>
      <g id="food" opacity="0"></g>
      <g id="score" transform="translate(24,58)"></g>
      <text id="mkCoach" x="320" y="382" text-anchor="middle" fill="#0B3B46"
            style="font-family:var(--fd);font-weight:700;font-size:18px"></text>
    </svg>
    <canvas id="fx"></canvas>
    <div class="camstate" id="camstate"></div>
  </div>
  <div class="gbar">
    <div class="helpline" id="helpline"></div>
    <button class="quit" id="mkQuit">จบภารกิจ</button>
  </div>
  <p class="privnote">${ico('camera')} ภาพจากกล้องถูกประมวลผลในเครื่องนี้เท่านั้น ไม่ถูกบันทึกและไม่ถูกส่งออกไปที่ใด
    เล่นด้วยเมาส์หรือนิ้วบนจอแทนได้ตลอดเวลา</p>
</div>`;

function mountMonster(){
  const stage=$('stage'),foodG=$('food'),cue=$('cue'),mouth=$('mouth'),mouthG=$('mouthG'),
        tongue=$('tongue'),monBody=$('monBody'),monGlow=$('monGlow'),
        eyeL=$('monEyeL'),eyeR=$('monEyeR'),coach=$('mkCoach'),pips=$('pips'),scoreG=$('score');
  FX.attach($('fx'));
  S.lastGame='monster';
  TM.eng=timingEngine();
  const d0=TM.eng.diff;
  Object.assign(TM,{trials:[],i:0,ok:0,reps:Math.round(d0.reps),food:null,phase:'idle',
                    done:false,mouth:1,open:true,coach:'',
                    pointer:{down:false,on:false},kb:{closed:false,on:false}});
  G.results=[];
  const rng=mulberry32(hash((S.p?S.p.code:'X')+'monster'));
  const sizeOf=ts=>r1(18+(clamp(ts,8,26)-8)/18*28);

  function drawPips(){
    pips.innerHTML=Array.from({length:TM.reps},(_,i)=>{
      const t=TM.trials[i];
      return t?`<circle cx="${i*26}" cy="0" r="9" fill="${t.ok?'#7BD256':'rgba(255,255,255,.45)'}" stroke="#fff" stroke-width="2.5"/>`
              :`<circle cx="${i*26}" cy="0" r="9" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.6)" stroke-width="2.5"/>`}).join('');
  }
  function drawScore(){
    scoreG.innerHTML=Array.from({length:Math.min(6,TM.reps)},(_,i)=>
      i<TM.ok?`<use href="#i-star-fill" x="${i*24-8}" y="-8" width="16" height="16" color="#FFD98A"/>`:'').join('');
  }
  drawPips();drawScore();

  /* ---------- ภารกิจย่อยหนึ่งครั้ง ---------- */
  function nextTrial(){
    if(TM.i>=TM.reps){endRound();return}
    const d=TM.eng.diff;
    const dur=(MK.TRAVEL+rng()*MK.SPREAD)*1000;          /* สุ่มเวลาเดินทาง เด็กจะได้นับจังหวะล่วงหน้าไม่ได้ */
    const win=Math.min(d.react_window,dur/1000*.6)*1000; /* ช่วงที่ยอมให้อ้าปาก */
    TM.food={t0:performance.now(),dur,r:sizeOf(d.target_size),c:FOODS[(rng()*FOODS.length)|0],x:MK.X0,y:MK.Y};
    Object.assign(TM,{phase:'travel',armed:false,openedAt:0,caughtAt:0,rtOpen:0,rtClose:0,
                      winStart:performance.now()+dur-win,win,diff:{...d}});
    foodG.setAttribute('opacity','1');
    drawPips();
  }

  function finish(ok,caught,chewed){
    if(TM.phase==='done')return;
    TM.phase='done';
    TM.trials.push({i:TM.trials.length+1,ok,caught,chewed,
      rtOpen:Math.round(TM.rtOpen),rtClose:Math.round(TM.rtClose),
      window:r1(TM.win/1000),size:TM.diff.target_size});
    TM.eng.results.push(ok?1:0);G.results.push(ok?1:0);
    const rec=updateEngine(TM.eng,PRIORITY_TIMING);
    TM.i++;if(ok)TM.ok++;
    drawPips();drawScore();
    if(ok){
      FX.burst(MK.MOUTH+40,MK.Y,40,['#7BD256','#FFD98A','#fff',TM.food.c.col],200);
      FX.ring(MK.MOUTH+40,MK.Y,'#7BD256');FX.shake=6;FX.glow=1;
      stage.classList.remove('flash');void stage.offsetWidth;stage.classList.add('flash');
      if(S.p){S.p.seeds=Math.min(9,S.p.seeds+(TM.ok%2===0?1:0));saveStore()}
    }else FX.burst(TM.food.x,TM.food.y,10,['#CFE7F0'],80);
    setCoach(ok?'อร่อยมาก':caught?'ลืมหุบปากเคี้ยว':'ยังไม่ทัน ลองใหม่');
    if(rec&&['up','down','down2'].includes(rec.action))
      setTimeout(()=>FX.burst(320,60,18,[rec.action==='up'?'#7BD256':'#FFD98A'],110),600);
    foodG.setAttribute('opacity','0');
    TM.nextAt=performance.now()+900;
  }
  function endRound(){
    if(TM.done)return;TM.done=true;TM.phase='done';
    cancelAnimationFrame(TM.raf);HT.stop();
    setTimeout(goReward,420);
  }
  function setCoach(t){if(TM.coach!==t){TM.coach=t;coach.textContent=t}}

  /* ---------- อินพุต : มือแบ = ปากอ้า ---------- */
  stage.addEventListener('pointerdown',ev=>{TM.pointer.down=true;TM.pointer.on=true;TM.kb.on=false;
    ev.preventDefault();stage.focus()});
  if(!TM.bound){TM.bound=true;
    addEventListener('pointerup',()=>{TM.pointer.down=false});
    addEventListener('pointercancel',()=>{TM.pointer.down=false});}
  stage.addEventListener('keydown',e=>{
    if(e.key===' '||e.key==='Enter'){TM.kb.closed=!TM.kb.closed;TM.kb.on=true;TM.pointer.on=false;e.preventDefault()}});

  camPanel($('camstate'),$('helpline'),'กดเมาส์ค้าง = หุบปาก · ปล่อย = อ้าปาก · หรือเว้นวรรคสลับ');
  stage.focus({preventScroll:true});

  /* ---------- ลูปหลัก ---------- */
  let last=performance.now();
  function loop(now){
    TM.raf=requestAnimationFrame(loop);
    const dt=Math.min(.05,(now-last)/1000);last=now;
    const paused=$('camstate')&&$('camstate').classList.contains('on');

    /* สถานะมือ : กล้องก่อน แล้วค่อยเมาส์/คีย์บอร์ด */
    let closed=false;
    if(HT.state==='ready'&&HT.hand.on)closed=HT.hand.grab;
    else if(TM.kb.on)closed=TM.kb.closed;
    else if(TM.pointer.on)closed=TM.pointer.down;
    const wasOpen=TM.open;
    TM.open=!closed;

    /* ปากขยับตามมือ */
    TM.mouth+=((TM.open?1:0)-TM.mouth)*Math.min(1,dt*14);
    const my=8+TM.mouth*30;
    mouth.setAttribute('ry',String(r1(my)));
    tongue.setAttribute('opacity',String(clamp(TM.mouth*1.3-.3,0,1)));
    tongue.setAttribute('cy',String(r1(my-6)));
    const blink=Math.sin(now/950)>.97?1.5:6.5;
    eyeL.setAttribute('r',blink);eyeR.setAttribute('r',blink);

    if(!paused&&!TM.done){
      if(TM.phase==='idle'||(TM.phase==='done'&&now>=TM.nextAt))nextTrial();
      const f=TM.food;
      if(f&&TM.phase!=='done'){
        const p=clamp((now-f.t0)/f.dur,0,1);
        f.x=MK.X0+(MK.MOUTH-MK.X0)*p;
        f.y=MK.Y-Math.sin(p*Math.PI)*46;                    /* โค้งเหมือนถูกโยนมา */
        const inWin=now>=TM.winStart;

        /* armed = เคยหุบปากรอไว้จริง — กันการอ้าค้างไว้ตลอดแล้วรอให้อาหารลอยเข้า */
        if(TM.phase==='travel'&&!TM.open&&!inWin)TM.armed=true;
        /* จับจังหวะที่ "เพิ่งอ้า" ไม่ใช่ "อ้าอยู่แล้ว" */
        if(TM.phase==='travel'&&TM.open&&!wasOpen&&inWin&&!TM.openedAt){
          TM.openedAt=now;TM.rtOpen=now-TM.winStart;
        }
        if(TM.phase==='travel'&&p>=1){
          const caught=TM.armed&&TM.open&&!!TM.openedAt;
          if(caught){TM.phase='chew';TM.caughtAt=now;
            FX.burst(MK.MOUTH+30,MK.Y,18,[f.c.col,'#fff'],150);foodG.setAttribute('opacity','0');
            setCoach('หุบปากเคี้ยวเลย');
          }else finish(false,false,false);
        }else if(TM.phase==='chew'){
          if(!TM.open){TM.rtClose=now-TM.caughtAt;finish(true,true,true)}
          else if(now-TM.caughtAt>TM.win)finish(false,true,false);
        }

        /* วงแหวนนับจังหวะ */
        if(TM.phase==='travel'){
          const k=clamp((now-TM.winStart)/Math.max(1,TM.win),0,1);
          cue.setAttribute('opacity',String(inWin?.95:clamp(1-(TM.winStart-now)/900,0,.35)));
          cue.setAttribute('r',String(r1(120-k*54)));
          cue.setAttribute('stroke',inWin?(TM.armed?'#7BD256':'#FF9DC4'):'#FFD98A');
        }else cue.setAttribute('opacity','0');

        /* คำใบ้ */
        if(TM.phase==='travel'){
          if(HT.state==='ready'&&!HT.hand.on)setCoach('ยกมือขึ้นให้กล้องเห็น');
          else if(!TM.armed&&TM.open)setCoach('หุบมือรออาหารก่อน');
          else if(inWin&&!TM.openedAt)setCoach('แบมือเดี๋ยวนี้');
          else if(TM.openedAt)setCoach('อ้าไว้แบบนั้น');
          else setCoach('รอจังหวะ อาหารกำลังมา');
        }
      }
    }else cue.setAttribute('opacity','0');

    /* วาดอาหาร */
    const f=TM.food;
    if(f&&TM.phase==='travel'){
      foodG.setAttribute('transform',`translate(${r1(f.x)},${r1(f.y)})`);
      foodG.innerHTML=`<circle r="${f.r}" fill="${f.c.col}" stroke="${f.c.dk}" stroke-width="4"/>
        <circle cx="${-f.r*.3}" cy="${-f.r*.3}" r="${r1(f.r*.22)}" fill="#fff" opacity=".6"/>
        <path d="M 0,${-f.r} q 6,-9 14,-10" fill="none" stroke="#5DBE3E" stroke-width="4" stroke-linecap="round"/>`;
    }
    monGlow.setAttribute('opacity',String(TM.phase==='chew'?.34:.18));
    monBody.setAttribute('fill',TM.phase==='chew'?'#A6E4FF':'#8FD8FF');

    if(HT.state==='ready')paintHandChip(h=>h.grab?'หุบปากอยู่':'อ้าปากอยู่');
    FX.step(dt);FX.draw();
  }
  cancelAnimationFrame(TM.raf);TM.raf=requestAnimationFrame(loop);
  $('mkQuit').onclick=()=>endRound();
}

/* ==========================================================================
   ด่าน 5 — Magic Garden Lite (Game Only)
   --------------------------------------------------------------------------
   เป้าหมายของด่าน: "กระจายแรงรอบมือ ไม่กระจุกอยู่จุดเดียว"
   จึงไม่วัดว่าบีบแรงแค่ไหน แต่วัดว่า "ทำรูปทรงมือได้กี่แบบ"
   contact_zones = จำนวนท่าที่เอามาใช้ในรอบนี้ (ยิ่งมาก = ต้องใช้มือหลายส่วนขึ้น)
   hold_time     = ต้องค้างท่าไว้นานเท่าไรต้นไม้จึงโต
   reps          = จำนวนต้นไม้ต่อรอบ
   ตัวชี้วัดเป็นความถูกต้องของท่า ไม่ใช่ค่าแรง จึงแยกเอนจินจากด่านแรงเช่นกัน
   หมายเหตุ: โหมด Toy + Game ของด่านนี้พูดถึง "เซนเซอร์ 12 จุด" ซึ่งยังขัดกับ
   ฮาร์ดแวร์จริง (6 จุด) — เป็นประเด็นค้างเก่า ไม่เกี่ยวกับโหมดกล้องนี้
   ========================================================================== */
const PRIORITY_GARDEN=['contact_zones','hold_time'];
const GD={raf:null,eng:null,trials:[],i:0,reps:6,ok:0,want:null,holdT:0,t0:0,
          grown:[],done:false,bound:false,nextAt:0,coach:'',
          pointer:{down:false,on:false},kb:{on:false,down:false}};

function gardenStart(p){
  const a=p?p.ability:.5;
  return{contact_zones:a<.35?2:a<.6?3:a<.8?4:5,
         hold_time    :a<.35?.5:a<.7?1:1.5,
         reps         :a<.35?4:a<.7?6:8};
}
function gardenEngine(){
  if(!H.garden||H.gardenCode!==(S.p&&S.p.code)){
    H.garden=newEngine(gardenStart(S.p));H.garden.prio=PRIORITY_GARDEN;H.gardenCode=S.p&&S.p.code;}
  return H.garden;
}
const PLANTS={open:{ic:'flower',col:'#FF9DC4'},fist:{ic:'sprout',col:'#7BD256'},
  spread:{ic:'tree',col:'#5DBE3E'},flat:{ic:'leaf',col:'#7FE3C0'},
  thumb:{ic:'flower',col:'#FFB43C'},two:{ic:'leaf',col:'#8FD8FF'},
  point:{ic:'sprout',col:'#FFD98A'},pinch:{ic:'flower',col:'#B08BFF'}};

/* วาดท่ามือแบบการ์ตูนจากสเปกของท่า — ฝ่ามือหนึ่งก้อน นิ้วห้าเส้น
   นิ้วที่เหยียดวาดยาว นิ้วที่งอวาดสั้น ความกางคุมมุมที่นิ้วแผ่ออก */
function poseGlyph(key,col){
  const P=POSES[key];if(!P)return '';
  const fan=8+P.sp*17;
  const fingers=[1,2,3,4].map(i=>{
    const a=(i-2.5)*fan*Math.PI/180,len=P.f[i]?46:15;
    const bx=(i-2.5)*15,by=-12;
    return `<line x1="${r1(bx)}" y1="${r1(by)}" x2="${r1(bx+Math.sin(a)*len)}" y2="${r1(by-Math.cos(a)*len)}"
      stroke="${col}" stroke-width="13" stroke-linecap="round"/>`}).join('');
  const ta=(P.f[0]?-58:-24)*Math.PI/180,tl=P.f[0]?38:18;
  const thumb=`<line x1="-26" y1="14" x2="${r1(-26+Math.sin(ta)*tl)}" y2="${r1(14-Math.cos(ta)*tl)}"
      stroke="${col}" stroke-width="13" stroke-linecap="round"/>`;
  const pinch=key==='pinch'?`<circle cx="-6" cy="-26" r="9" fill="none" stroke="${col}" stroke-width="4"/>`:'';
  return `<rect x="-30" y="-14" width="60" height="46" rx="18" fill="${col}"/>${fingers}${thumb}${pinch}`;
}

/* โครงมือจริงจากกล้อง — ให้เด็กเทียบมือตัวเองกับท่าเป้าหมายได้ตรง ๆ */
const BONES=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[0,9],[9,10],[10,11],[11,12],
             [0,13],[13,14],[14,15],[15,16],[0,17],[17,18],[18,19],[19,20],[5,9],[9,13],[13,17]];
function handSkeleton(pts,W,Hh,col){
  if(!pts||!pts.length)return '';
  let x0=1,y0=1,x1=0,y1=0;
  for(const p of pts){x0=Math.min(x0,p.x);y0=Math.min(y0,p.y);x1=Math.max(x1,p.x);y1=Math.max(y1,p.y)}
  const sc=Math.min(W/Math.max(.01,x1-x0),Hh/Math.max(.01,y1-y0))*.82;
  const ox=W/2,oy=Hh/2,mx=(x0+x1)/2,my=(y0+y1)/2;
  /* กลับซ้าย–ขวาให้ตรงกับภาพกระจกที่เด็กเห็น */
  const P=pts.map(p=>({x:ox-(p.x-mx)*sc,y:oy+(p.y-my)*sc}));
  return BONES.map(([a,b])=>`<line x1="${r1(P[a].x)}" y1="${r1(P[a].y)}" x2="${r1(P[b].x)}" y2="${r1(P[b].y)}"
      stroke="${col}" stroke-width="4" stroke-linecap="round" opacity=".85"/>`).join('')
    +P.map((p,i)=>`<circle cx="${r1(p.x)}" cy="${r1(p.y)}" r="${[4,8,12,16,20].includes(i)?4.5:3}" fill="${col}"/>`).join('');
}

SC.garden=()=>`
<div class="screen">
  <div class="ghead">
    <button class="back" data-go="home">${ico('arrow-left')} กลับไปที่เกาะ</button>
    <span class="eyebrow">ด่าน 5 · Grip Pattern · Game Only</span>
  </div>
  <div class="gamewrap gardenwrap" id="stage" tabindex="0" role="application"
       aria-label="ทำมือให้เหมือนท่าที่แสดง แล้วค้างไว้จนต้นไม้โต">
    <video id="cam" playsinline muted aria-hidden="true"></video>
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet">
      <defs><filter id="gdSoft"><feGaussianBlur stdDeviation="7"/></filter></defs>
      <path d="M0,296 q90,-18 180,-4 t180,-4 t150,8 t130,-8 L640,400 L0,400 Z" fill="rgba(11,59,70,.28)"/>
      <g id="pips" transform="translate(24,28)"></g>

      <!-- ท่าที่ต้องทำ -->
      <g id="wantG" transform="translate(178,168)">
        <circle id="wantGlow" r="96" fill="#7BD256" opacity=".16" filter="url(#gdSoft)"/>
        <circle r="88" fill="rgba(255,255,255,.14)" stroke="#fff" stroke-width="3"/>
        <circle id="ring" r="88" fill="none" stroke="#7BD256" stroke-width="9" stroke-linecap="round"
                stroke-dasharray="553" stroke-dashoffset="553" transform="rotate(-90)"/>
        <g id="wantIco" transform="scale(.86)"></g>
      </g>
      <text id="wantName" x="178" y="292" text-anchor="middle" fill="#0B3B46"
            style="font-family:var(--fd);font-weight:700;font-size:17px"></text>

      <!-- มือของเด็กจากกล้อง -->
      <g transform="translate(452,168)">
        <circle r="88" fill="rgba(255,255,255,.10)" stroke="rgba(255,255,255,.55)" stroke-width="2.5" stroke-dasharray="8 8"/>
        <g id="skel" transform="translate(-88,-88)"></g>
      </g>
      <text id="skelName" x="452" y="292" text-anchor="middle" fill="#0B3B46"
            style="font-family:var(--fd);font-weight:600;font-size:14px" opacity=".85"></text>

      <g id="bed" transform="translate(0,352)"></g>
      <text id="gdCoach" x="320" y="388" text-anchor="middle" fill="#0B3B46"
            style="font-family:var(--fd);font-weight:700;font-size:17px"></text>
    </svg>
    <canvas id="fx"></canvas>
    <div class="camstate" id="camstate"></div>
  </div>
  <div class="gbar">
    <div class="helpline" id="helpline"></div>
    <button class="quit" id="gdQuit">จบภารกิจ</button>
  </div>
  <p class="privnote">${ico('camera')} ภาพจากกล้องถูกประมวลผลในเครื่องนี้เท่านั้น ไม่ถูกบันทึกและไม่ถูกส่งออกไปที่ใด
    ถ้าไม่ได้ใช้กล้อง กดค้างบนจอเพื่อทำท่าแทนได้</p>
</div>`;

function mountGarden(){
  const stage=$('stage'),wantIco=$('wantIco'),wantName=$('wantName'),ring=$('ring'),
        wantGlow=$('wantGlow'),skel=$('skel'),skelName=$('skelName'),
        bed=$('bed'),coach=$('gdCoach'),pips=$('pips');
  FX.attach($('fx'));
  S.lastGame='garden';
  GD.eng=gardenEngine();
  Object.assign(GD,{trials:[],i:0,ok:0,want:null,holdT:0,grown:[],done:false,coach:'',
                    reps:Math.round(GD.eng.diff.reps),
                    pointer:{down:false,on:false},kb:{on:false,down:false}});
  G.results=[];
  const rng=mulberry32(hash((S.p?S.p.code:'X')+'garden'));

  function drawPips(){
    pips.innerHTML=Array.from({length:GD.reps},(_,i)=>{
      const t=GD.trials[i];
      return t?`<circle cx="${i*26}" cy="0" r="9" fill="${t.ok?'#7BD256':'rgba(255,255,255,.45)'}" stroke="#fff" stroke-width="2.5"/>`
              :`<circle cx="${i*26}" cy="0" r="9" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.6)" stroke-width="2.5"/>`}).join('');
  }
  function drawBed(){
    const n=GD.reps,gapW=560/Math.max(1,n);
    bed.innerHTML=Array.from({length:n},(_,i)=>{
      const x=40+gapW*(i+.5),g=GD.grown[i];
      return `<g transform="translate(${r1(x)},0)">
        <ellipse cy="6" rx="20" ry="7" fill="rgba(11,59,70,.22)"/>
        ${g?`<use href="#i-${PLANTS[g].ic}" x="-17" y="-36" width="34" height="34" color="${PLANTS[g].col}"/>`
           :`<circle cy="-5" r="5" fill="rgba(255,255,255,.25)"/>`}</g>`}).join('');
  }
  drawPips();drawBed();

  /* ---------- เลือกท่าถัดไป ---------- */
  let lastWant=null;
  function nextTrial(){
    if(GD.i>=GD.reps){endRound();return}
    const deck=POSE_ORDER.slice(0,clamp(Math.round(GD.eng.diff.contact_zones),2,POSE_ORDER.length));
    let k=deck[(rng()*deck.length)|0];
    if(deck.length>1){let g=0;while(k===lastWant&&g++<12)k=deck[(rng()*deck.length)|0]}
    lastWant=k;
    GD.want=k;GD.holdT=0;GD.t0=performance.now();GD.done2=false;
    wantIco.innerHTML=poseGlyph(k,'#fff');
    wantName.textContent=POSES[k].th;
    drawPips();
  }
  function finish(ok){
    if(GD.done2)return;GD.done2=true;
    const d=GD.eng.diff;
    GD.trials.push({i:GD.trials.length+1,pose:GD.want,ok,
      ms:Math.round(performance.now()-GD.t0),hold:r1(d.hold_time),zones:d.contact_zones});
    GD.eng.results.push(ok?1:0);G.results.push(ok?1:0);
    const rec=updateEngine(GD.eng,PRIORITY_GARDEN);
    if(ok){GD.grown[GD.i]=GD.want;GD.ok++;
      FX.burst(178,168,42,[PLANTS[GD.want].col,'#7BD256','#fff','#FFD98A'],210);
      FX.ring(178,168,'#7BD256');FX.shake=6;FX.glow=1;
      stage.classList.remove('flash');void stage.offsetWidth;stage.classList.add('flash');
      const gapW=560/Math.max(1,GD.reps),tx=40+gapW*(GD.i+.5);
      setTimeout(()=>{FX.fly(178,168,tx,340,PLANTS[GD.want].col);drawBed();
        FX.burst(tx,340,14,[PLANTS[GD.want].col,'#fff'],90)},420);
      if(S.p){S.p.seeds=Math.min(9,S.p.seeds+(GD.ok%2===0?1:0));saveStore()}
    }else FX.burst(178,168,10,['#CFE7F0'],80);
    GD.i++;drawPips();
    setCoach(ok?'ต้นไม้โตแล้ว':'ยังไม่ได้ท่านี้ ไม่เป็นไร');
    if(rec&&['up','down','down2'].includes(rec.action))
      setTimeout(()=>FX.burst(320,60,18,[rec.action==='up'?'#7BD256':'#FFD98A'],110),700);
    GD.nextAt=performance.now()+1000;
  }
  function endRound(){
    if(GD.done)return;GD.done=true;
    cancelAnimationFrame(GD.raf);HT.stop();
    setTimeout(goReward,420);
  }
  function setCoach(t){if(GD.coach!==t){GD.coach=t;coach.textContent=t}}

  /* ---------- อินพุต : ไม่มีท่ามือเทียบเท่าบนเมาส์ กดค้าง = ทำท่าถูกอยู่ ---------- */
  stage.addEventListener('pointerdown',ev=>{GD.pointer.down=true;GD.pointer.on=true;
    ev.preventDefault();stage.focus()});
  if(!GD.bound){GD.bound=true;
    addEventListener('pointerup',()=>{GD.pointer.down=false});
    addEventListener('pointercancel',()=>{GD.pointer.down=false});}
  stage.addEventListener('keydown',e=>{
    if(e.key===' '||e.key==='Enter'){GD.kb.down=!GD.kb.down;GD.kb.on=true;e.preventDefault()}});

  camPanel($('camstate'),$('helpline'),'ไม่มีกล้อง: กดค้างบนจอเพื่อทำท่า · หรือเว้นวรรคสลับ');
  stage.focus({preventScroll:true});
  nextTrial();

  /* ---------- ลูปหลัก ---------- */
  let last=performance.now();
  function loop(now){
    GD.raf=requestAnimationFrame(loop);
    const dt=Math.min(.05,(now-last)/1000);last=now;
    const paused=$('camstate')&&$('camstate').classList.contains('on');
    const d=GD.eng.diff;

    const byCam=HT.state==='ready'&&HT.hand.on;
    const match=paused?false
      :byCam?HT.hand.pose===GD.want
      :GD.kb.on?GD.kb.down:GD.pointer.down;

    /* แผงกล้องบังจออยู่ = ยังไม่ได้เริ่มเล่น ต้องเลื่อนเวลาเริ่มตามไปด้วย
       ไม่งั้นพอปิดแผง ภารกิจแรกจะนับว่าหมดเวลาไปแล้วทันที */
    if(paused)GD.t0=now;
    if(!paused&&!GD.done){
      if(GD.done2&&now>=GD.nextAt)nextTrial();
      if(!GD.done2){
        if(match)GD.holdT+=dt;else GD.holdT=Math.max(0,GD.holdT-dt*1.4);
        if(GD.holdT>=d.hold_time)finish(true);
        else if((now-GD.t0)/1000>20)finish(false);
      }
    }

    /* วงแหวนนับเวลาค้างท่า */
    const k=clamp(GD.holdT/Math.max(.1,d.hold_time),0,1);
    ring.setAttribute('stroke-dashoffset',String(r1(553-553*k)));
    ring.setAttribute('stroke',match?'#7BD256':'#FFD98A');
    wantGlow.setAttribute('opacity',String(.14+k*.3));
    wantIco.setAttribute('transform',`scale(${r1(.86+(match?Math.sin(now/180)*.02:0))})`);

    /* มือจริงจากกล้อง */
    if(byCam){
      skel.innerHTML=handSkeleton(HT.hand.pts,176,176,match?'#7BD256':'#FFF1D6');
      skelName.textContent=POSES[HT.hand.pose]?POSES[HT.hand.pose].th:'—';
    }else{
      skel.innerHTML=`<g transform="translate(88,88)">${poseGlyph(GD.pointer.down||GD.kb.down?GD.want:'fist','rgba(255,255,255,.45)')}</g>`;
      skelName.textContent=HT.state==='ready'?'ยกมือขึ้นให้กล้องเห็น':'กดค้างบนจอแทนได้';
    }

    if(!paused&&!GD.done2){
      if(byCam)setCoach(match?'ค้างไว้แบบนี้':'ทำมือให้เหมือนรูปทางซ้าย');
      else if(HT.state==='ready')setCoach('ยกมือขึ้นให้กล้องเห็น');
      else setCoach('กดค้างบนจอเพื่อทำท่า');
    }
    if(HT.state==='ready')paintHandChip(h=>POSES[h.pose]?POSES[h.pose].th:'—');
    FX.step(dt);FX.draw();
  }
  cancelAnimationFrame(GD.raf);GD.raf=requestAnimationFrame(loop);
  $('gdQuit').onclick=()=>endRound();
}

/* ==========================================================================
   ด่าน 6 — Treasure Runner (Game Only)
   --------------------------------------------------------------------------
   เป้าหมายของด่าน: "ใช้มือร่วมกับการเคลื่อนไหวแขนและลำตัว"
   ต่างจากด่าน 1 ตรงที่ไม่ได้วัดการหยิบ–ปล่อย แต่วัด "ระยะทางที่เอื้อม"
   สมบัติจึงเกิดที่ขอบพื้นที่เล่น และหีบอยู่ฝั่งตรงข้ามเสมอ
   ทุกภารกิจย่อยจึงเป็นการกวาดแขนข้ามลำตัว ไม่ใช่การขยับแค่ข้อมือ
   บันทึกเพิ่ม: ระยะเอื้อม และข้ามแนวกลางลำตัวหรือไม่ (crossed)
   ========================================================================== */
const PRIORITY_TREK=['target_size','directions'];
const TK={raf:null,eng:null,trials:[],i:0,reps:6,ok:0,gem:null,chest:null,held:false,
          t0:0,rt:0,plen:0,px:null,py:null,minX:640,maxX:0,done:false,done2:false,
          nextAt:0,coach:'',grabbedAt:null};

function trekStart(p){
  const a=p?p.ability:.5;
  return{target_size:a<.35?24:a<.6?21:a<.8?18:15,
         directions :a<.35?2:a<.6?3:a<.8?4:6,
         reps       :a<.35?4:a<.7?6:8};
}
function trekEngine(){
  if(!H.trek||H.trekCode!==(S.p&&S.p.code)){
    H.trek=newEngine(trekStart(S.p));H.trek.prio=PRIORITY_TREK;H.trekCode=S.p&&S.p.code;}
  return H.trek;
}
/* จุดยึด 8 จุดรอบพื้นที่เล่น — สมบัติเกิดจุดหนึ่ง หีบไปอยู่จุดตรงข้าม (i+4)
   ระยะระหว่างจุดตรงข้ามคือความกว้างเต็มของพื้นที่ จึงบังคับให้ต้องเอื้อมสุดแขน */
const TK_C={x:320,y:198,rx:236,ry:126};
const trekAnchor=i=>{const a=-Math.PI/2+i*Math.PI/4;
  return{x:r1(TK_C.x+Math.cos(a)*TK_C.rx),y:r1(TK_C.y+Math.sin(a)*TK_C.ry)}};
const GEMS=[{col:'#FFD98A',dk:'#C9791A'},{col:'#8FD8FF',dk:'#2F76A8'},
            {col:'#FF9DC4',dk:'#B03A6E'},{col:'#7FE3C0',dk:'#2E8C96'}];

SC.trek=()=>`
<div class="screen">
  <div class="ghead">
    <button class="back" data-go="home">${ico('arrow-left')} กลับไปที่เกาะ</button>
    <span class="eyebrow">ด่าน 6 · Functional Movement · Game Only</span>
  </div>
  <div class="gamewrap trekwrap" id="stage" tabindex="0" role="application"
       aria-label="เอื้อมไปหยิบสมบัติ แล้วย้ายข้ามจอไปใส่หีบฝั่งตรงข้าม">
    <video id="cam" playsinline muted aria-hidden="true"></video>
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet">
      <defs><filter id="tkSoft"><feGaussianBlur stdDeviation="7"/></filter></defs>
      <path d="M0,326 q90,-20 180,-6 t170,-6 t150,10 t140,-10 L640,400 L0,400 Z" fill="rgba(11,59,70,.26)"/>
      <!-- แนวกลางลำตัว : ให้เห็นว่าภารกิจนี้ต้องข้ามฝั่ง -->
      <path d="M320,44 V352" stroke="rgba(255,255,255,.45)" stroke-width="2" stroke-dasharray="7 10"/>
      <g id="pips" transform="translate(24,28)"></g>
      <path id="route" d="" fill="none" stroke="#FFD98A" stroke-width="4"
            stroke-dasharray="10 12" stroke-linecap="round" opacity=".7"/>
      <g id="chest"></g>
      <g id="gem" opacity="0"></g>
      <g id="cur" opacity="0">
        <circle id="curGlow" r="40" fill="#fff" opacity=".18" filter="url(#tkSoft)"/>
        <circle id="curRing" r="27" fill="rgba(255,255,255,.2)" stroke="#fff" stroke-width="3.5"/>
        <g id="curFing" fill="#fff"></g>
        <circle r="11" fill="#fff"/>
      </g>
      <text id="tkCoach" x="320" y="386" text-anchor="middle" fill="#0B3B46"
            style="font-family:var(--fd);font-weight:700;font-size:18px"></text>
    </svg>
    <canvas id="fx"></canvas>
    <div class="camstate" id="camstate"></div>
  </div>
  <div class="gbar">
    <div class="helpline" id="helpline"></div>
    <button class="quit" id="tkQuit">จบภารกิจ</button>
  </div>
  <p class="privnote">${ico('camera')} ภาพจากกล้องถูกประมวลผลในเครื่องนี้เท่านั้น ไม่ถูกบันทึกและไม่ถูกส่งออกไปที่ใด
    เล่นด้วยเมาส์หรือนิ้วบนจอแทนได้ตลอดเวลา</p>
</div>`;

function mountTrek(){
  const stage=$('stage'),gemG=$('gem'),chestG=$('chest'),route=$('route'),
        cur=$('cur'),curRing=$('curRing'),curFing=$('curFing'),curGlow=$('curGlow'),
        coach=$('tkCoach'),pips=$('pips');
  FX.attach($('fx'));
  S.lastGame='trek';
  TK.eng=trekEngine();
  Object.assign(TK,{trials:[],i:0,ok:0,gem:null,chest:null,held:false,done:false,done2:false,
                    reps:Math.round(TK.eng.diff.reps),coach:''});
  G.results=[];
  const HC=handCursor(stage);
  const rng=mulberry32(hash((S.p?S.p.code:'X')+'trek'));
  const shuffle=a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=(rng()*(i+1))|0;[b[i],b[j]]=[b[j],b[i]]}return b};
  const radiusOf=ts=>r1(16+(clamp(ts,8,26)-8)/18*26);

  function drawPips(){
    pips.innerHTML=Array.from({length:TK.reps},(_,i)=>{
      const t=TK.trials[i];
      return t?`<circle cx="${i*26}" cy="0" r="9" fill="${t.ok?'#7BD256':'rgba(255,255,255,.45)'}" stroke="#fff" stroke-width="2.5"/>`
              :`<circle cx="${i*26}" cy="0" r="9" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.6)" stroke-width="2.5"/>`}).join('');
  }
  drawPips();

  /* directions = จำนวนทิศที่ใช้ในรอบนี้ เลือกมาจาก 8 จุดรอบพื้นที่เล่น
     สุ่มทีละครั้งแทนการวนตามลำดับ และเลี่ยงซ้ำจุดเดิมติดกัน
     ถ้าวนเป็น A,B,A,B เด็กจะทายทางล่วงหน้าได้แล้วเอื้อมรอ ไม่ได้ฝึกการมองหาเป้า */
  let sectors=[],sectN=0,lastSect=null;
  function pickSector(){
    const n=clamp(Math.round(TK.eng.diff.directions),1,8);
    if(sectN!==n){sectors=shuffle(Array.from({length:8},(_,i)=>i)).slice(0,n);sectN=n;lastSect=null}
    if(sectors.length===1)return sectors[0];
    let s=sectors[(rng()*sectors.length)|0],g=0;
    while(s===lastSect&&g++<12)s=sectors[(rng()*sectors.length)|0];
    lastSect=s;return s;
  }

  function nextTrial(){
    if(TK.i>=TK.reps){endRound();return}
    const d=TK.eng.diff,s=pickSector();
    const from=trekAnchor(s),to=trekAnchor((s+4)%8);
    TK.gem={x:from.x,y:from.y,hx:from.x,hy:from.y,tx:from.x,ty:from.y,
            r:radiusOf(d.target_size),c:GEMS[(rng()*GEMS.length)|0],scale:1,placed:false};
    TK.chest={x:to.x,y:to.y,r:Math.max(34,radiusOf(d.target_size)+16)};
    Object.assign(TK,{held:false,rt:0,plen:0,px:null,py:null,minX:640,maxX:0,
                      grabbedAt:null,t0:performance.now(),done2:false});
    gemG.setAttribute('opacity','1');
    route.setAttribute('d',`M${from.x},${from.y} Q${(from.x+to.x)/2},${(from.y+to.y)/2-54} ${to.x},${to.y}`);
    drawChest(false);drawPips();
  }
  function drawChest(open){
    const c=TK.chest;if(!c){chestG.innerHTML='';return}
    chestG.innerHTML=`<g transform="translate(${c.x},${c.y})">
      <ellipse cy="${r1(c.r*.62)}" rx="${r1(c.r*.92)}" ry="${r1(c.r*.24)}" fill="rgba(11,59,70,.24)"/>
      <circle r="${r1(c.r+8)}" fill="none" stroke="${open?'#7BD256':'rgba(255,255,255,.5)'}"
              stroke-width="3" stroke-dasharray="9 9"/>
      <path d="M ${-c.r},${-c.r*.1} h ${c.r*2} v ${c.r*.66} q 0,10 -10,10 h ${-(c.r*2-20)} q -10,0 -10,-10 z"
            fill="#C9791A" stroke="#17262E" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M ${-c.r},${-c.r*.1} q 0,${-c.r*.62} ${c.r},${-c.r*.62} q ${c.r},0 ${c.r},${c.r*.62} z"
            fill="${open?'#FFD98A':'#E0983A'}" stroke="#17262E" stroke-width="3.5" stroke-linejoin="round"
            transform="${open?`translate(0,${r1(-c.r*.3)}) rotate(-12)`:''}"/>
      <rect x="-7" y="-6" width="14" height="16" rx="3" fill="#FFD98A" stroke="#17262E" stroke-width="2.5"/>
    </g>`;
  }
  function drawGem(){
    const g=TK.gem;if(!g)return;
    gemG.setAttribute('transform',`translate(${r1(g.x)},${r1(g.y)}) scale(${r1(g.scale)})`);
    gemG.innerHTML=`<ellipse cy="${r1(g.r*1.05)}" rx="${r1(g.r*.75)}" ry="${r1(g.r*.2)}" fill="rgba(11,59,70,.18)"/>
      <use href="#i-diamond" x="${r1(-g.r)}" y="${r1(-g.r)}" width="${r1(g.r*2)}" height="${r1(g.r*2)}" color="${g.c.col}"/>`;
  }

  function finish(ok){
    if(TK.done2)return;TK.done2=true;
    const g=TK.gem,c=TK.chest,d=TK.eng.diff;
    const reach=Math.hypot(g.hx-c.x,g.hy-c.y);
    TK.trials.push({i:TK.trials.length+1,ok,ms:Math.round(performance.now()-TK.t0),
      rt:Math.round(TK.rt||0),reach:Math.round(reach),
      /* ข้ามแนวกลางลำตัวหรือไม่ — ตัวชี้วัดหลักของด่านนี้ */
      crossed:TK.minX<TK_C.x&&TK.maxX>TK_C.x,
      pathEff:Math.round(clamp(100*reach/Math.max(1,TK.plen),0,100)),
      size:d.target_size,dirs:d.directions});
    TK.eng.results.push(ok?1:0);G.results.push(ok?1:0);
    const rec=updateEngine(TK.eng,PRIORITY_TREK);
    TK.i++;if(ok)TK.ok++;
    drawPips();
    if(ok){
      g.placed=true;g.tx=c.x;g.ty=c.y;
      drawChest(true);
      FX.burst(c.x,c.y,44,[g.c.col,'#FFD98A','#fff','#7BD256'],210);
      FX.ring(c.x,c.y,'#FFD98A');FX.shake=7;FX.glow=1;
      stage.classList.remove('flash');void stage.offsetWidth;stage.classList.add('flash');
      if(S.p){S.p.seeds=Math.min(9,S.p.seeds+(TK.ok%2===0?1:0));saveStore()}
    }else FX.burst(g.x,g.y,10,['#CFE7F0'],80);
    setCoach(ok?'เก็บเข้าหีบแล้ว':'ยังไม่ทัน ลองใหม่');
    if(rec&&['up','down','down2'].includes(rec.action))
      setTimeout(()=>FX.burst(320,60,18,[rec.action==='up'?'#7BD256':'#FFD98A'],110),700);
    TK.nextAt=performance.now()+(ok?950:750);
  }
  function endRound(){
    if(TK.done)return;TK.done=true;TK.done2=true;
    cancelAnimationFrame(TK.raf);HT.stop();
    setTimeout(goReward,420);
  }
  function setCoach(t){if(TK.coach!==t){TK.coach=t;coach.textContent=t}}

  camPanel($('camstate'),$('helpline'),'เอื้อมด้วยเมาส์หรือนิ้ว: กดค้างเพื่อหยิบ ปล่อยเหนือหีบเพื่อวาง');
  stage.focus({preventScroll:true});
  nextTrial();

  /* ---------- ลูปหลัก ---------- */
  let last=performance.now();
  function loop(now){
    TK.raf=requestAnimationFrame(loop);
    const dt=Math.min(.05,(now-last)/1000);last=now;
    const paused=$('camstate')&&$('camstate').classList.contains('on');
    if(paused)TK.t0=now;

    const c=HC.step(dt);
    paintHandCursor(cur,curRing,curFing,curGlow,c);
    const g=TK.gem,ch=TK.chest;

    if(!paused&&!TK.done){
      if(TK.done2&&now>=TK.nextAt){gemG.setAttribute('opacity','0');nextTrial()}
      else if(!TK.done2&&g){
        const dist=Math.hypot(c.x-g.x,c.y-g.y);
        if(!TK.held&&c.grab&&dist<g.r+48&&!g.placed){
          TK.held=true;if(!TK.rt)TK.rt=now-TK.t0;TK.grabbedAt={x:c.x,y:c.y};
          FX.burst(g.x,g.y,10,[g.c.col],90);
        }else if(TK.held&&!c.grab){
          TK.held=false;
          if(Math.hypot(g.x-ch.x,g.y-ch.y)<ch.r+26)finish(true);
          else{g.tx=g.hx;g.ty=g.hy;FX.burst(g.x,g.y,8,['#CFE7F0'],70);setCoach('ยังไม่ถึงหีบ ลองอีกที')}
        }
        if(TK.held){
          g.tx=c.x;g.ty=c.y-6;
          TK.plen+=TK.px==null?0:Math.hypot(c.x-TK.px,c.y-TK.py);
          TK.px=c.x;TK.py=c.y;
          TK.minX=Math.min(TK.minX,c.x);TK.maxX=Math.max(TK.maxX,c.x);
        }else TK.px=null;
        if((now-TK.t0)/1000>26)finish(false);

        if(c.waiting)setCoach('ยกมือขึ้นให้กล้องเห็น');
        else if(TK.held)setCoach(Math.hypot(g.x-ch.x,g.y-ch.y)<ch.r+26?'แบมือเพื่อวางลงหีบ':'พาข้ามไปที่หีบฝั่งโน้น');
        else if(dist<g.r+48)setCoach('กำมือเพื่อหยิบ');
        else setCoach('เอื้อมไปที่สมบัติ');
      }
    }

    /* ประกายนำทางไปหีบตอนกำลังถือ */
    if(TK.held&&ch&&Math.random()<.16)
      FX.spark(ch.x+(Math.random()*60-30),ch.y+(Math.random()*44-22),'#FFD98A');

    if(g){
      const k=Math.min(1,dt*(TK.held?18:9));
      g.x+=(g.tx-g.x)*k;g.y+=(g.ty-g.y)*k;
      const want=g.placed?.001:(TK.held?1.12:1+Math.sin(now/620)*.04);
      g.scale+=(want-g.scale)*Math.min(1,dt*9);
      drawGem();
    }
    route.setAttribute('opacity',TK.done2?'0':(TK.held?'.85':'.5'));
    if(HT.state==='ready')paintHandChip(h=>h.grab?'กำมืออยู่':'แบมืออยู่');
    FX.step(dt);FX.draw();
  }
  cancelAnimationFrame(TK.raf);TK.raf=requestAnimationFrame(loop);
  $('tkQuit').onclick=()=>endRound();
}

/* ==========================================================================
   ด่าน 7 — Cooking Story (Game Only)
   --------------------------------------------------------------------------
   เป้าหมายของด่าน: "เลียนแบบการเคลื่อนไหวที่ใช้จริงในชีวิตประจำวัน"
   ทักษะ: การหมุนข้อมือ + การทำตามลำดับขั้นตอน
   directions = จำนวนชนิดของท่าที่อยู่ในสูตรรอบนี้ (ยิ่งมาก = ต้องทำได้หลายแบบ)
   hold_time  = ต้องทำท่านั้นค้าง/ต่อเนื่องนานเท่าไรจึงนับว่าผ่าน
   reps       = จำนวนขั้นตอนในสูตรหนึ่งจาน
   ทุกท่าที่ใช้การหมุนวัดจาก "หมุนไปเท่าไรจากตอนเริ่มขั้นตอน" ไม่ใช่มุมสัมบูรณ์
   เด็กจึงเริ่มจากท่ามือแบบไหนก็ได้ ไม่ต้องจัดมือให้ตรงศูนย์ก่อน
   ========================================================================== */
const PRIORITY_COOK=['directions','hold_time'];
const CK={raf:null,eng:null,recipe:[],trials:[],i:0,ok:0,prog:0,holdT:0,spun:0,rev:0,
          lastSign:0,roll0:0,y0:0,t0:0,done:false,done2:false,nextAt:0,coach:'',
          ptr:{down:false,on:false},kb:{on:false,down:false}};

/* เรียงจากทำง่ายไปยาก : กำ/แบ เคยฝึกมาแล้วในด่านต้น ๆ · สะบัดมือยากที่สุด */
const COOK_ACTS=[
  {k:'grab', th:'กำมือหยิบวัตถุดิบ',   kind:'hold', col:'#FFB43C'},
  {k:'open', th:'แบมือวางลงหม้อ',      kind:'hold', col:'#7FE3C0'},
  {k:'lift', th:'ยกมือขึ้นให้สูง',      kind:'hold', col:'#8FD8FF'},
  {k:'pour', th:'เอียงมือเทลงหม้อ',     kind:'roll', col:'#FF9DC4'},
  {k:'stir', th:'หมุนมือคนให้เข้ากัน',   kind:'spin', col:'#B08BFF'},
  {k:'shake',th:'สะบัดมือโรยเครื่องปรุง',kind:'shake',col:'#7BD256'}
];
const COOK_BY=Object.fromEntries(COOK_ACTS.map(a=>[a.k,a]));

function cookStart(p){
  const a=p?p.ability:.5;
  return{directions:a<.35?2:a<.6?3:a<.8?4:5,
         hold_time :a<.35?.5:a<.7?1:1.5,
         reps      :a<.35?4:a<.7?5:6};
}
function cookEngine(){
  if(!H.cook||H.cookCode!==(S.p&&S.p.code)){
    H.cook=newEngine(cookStart(S.p));H.cook.prio=PRIORITY_COOK;H.cookCode=S.p&&S.p.code;}
  return H.cook;
}

/* ภาพประกอบของแต่ละท่า วาดเป็นเส้นล้วน ไม่ใช้อิโมจิตามกติกาของโปรเจกต์ */
function actGlyph(k,col){
  if(k==='grab')return poseGlyph('fist',col);
  if(k==='open')return poseGlyph('open',col);
  if(k==='lift')return `<path d="M0,34 V-26 M-20,-8 L0,-30 L20,-8" fill="none" stroke="${col}"
      stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
  if(k==='pour')return `<g transform="rotate(-34)">
      <rect x="-24" y="-26" width="48" height="46" rx="12" fill="${col}"/>
      <path d="M24,-14 q16,4 16,18" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round"/>
      <path d="M40,10 q2,16 -6,26" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" opacity=".7"/></g>`;
  if(k==='stir')return `<path d="M 26,0 A 26,26 0 1 1 0,-26" fill="none" stroke="${col}"
      stroke-width="12" stroke-linecap="round"/><path d="M0,-38 L0,-14 L20,-26 Z" fill="${col}"/>`;
  return `<g><path d="M-30,-10 q14,-16 28,0 q14,16 28,0" fill="none" stroke="${col}"
      stroke-width="10" stroke-linecap="round"/>
      <circle cx="0" cy="20" r="7" fill="${col}"/><circle cx="-22" cy="26" r="5" fill="${col}"/>
      <circle cx="22" cy="26" r="5" fill="${col}"/></g>`;
}

SC.cook=()=>`
<div class="screen">
  <div class="ghead">
    <button class="back" data-go="home">${ico('arrow-left')} กลับไปที่เกาะ</button>
    <span class="eyebrow">ด่าน 7 · Daily Living · Game Only</span>
  </div>
  <div class="gamewrap cookwrap" id="stage" tabindex="0" role="application"
       aria-label="ทำตามขั้นตอนในสูตร หมุนและขยับมือตามที่บอก">
    <video id="cam" playsinline muted aria-hidden="true"></video>
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet">
      <defs><filter id="ckSoft"><feGaussianBlur stdDeviation="7"/></filter></defs>
      <rect x="0" y="316" width="640" height="84" fill="rgba(92,58,32,.42)"/>
      <path d="M0,316 H640" stroke="rgba(255,255,255,.35)" stroke-width="3"/>
      <g id="recipe" transform="translate(320,34)"></g>

      <!-- ท่าที่ต้องทำตอนนี้ -->
      <g id="actG" transform="translate(168,196)">
        <circle id="actGlow" r="94" fill="#FFD98A" opacity=".16" filter="url(#ckSoft)"/>
        <circle r="86" fill="rgba(255,255,255,.14)" stroke="#fff" stroke-width="3"/>
        <circle id="actRing" r="86" fill="none" stroke="#7BD256" stroke-width="9" stroke-linecap="round"
                stroke-dasharray="540" stroke-dashoffset="540" transform="rotate(-90)"/>
        <g id="needle" opacity="0">
          <path d="M0,0 L0,-70" stroke="#FFD98A" stroke-width="6" stroke-linecap="round"/>
          <circle cy="-70" r="7" fill="#FFD98A"/></g>
        <g id="actIco"></g>
      </g>
      <text id="actName" x="168" y="308" text-anchor="middle" fill="#fff"
            style="font-family:var(--fd);font-weight:700;font-size:17px"></text>

      <!-- หม้อและอาหารที่ค่อย ๆ เสร็จ -->
      <g id="potG" transform="translate(452,232)">
        <ellipse cy="72" rx="92" ry="16" fill="rgba(11,59,70,.3)"/>
        <path d="M-84,-30 h168 l-14,86 q-2,14 -16,14 h-108 q-14,0 -16,-14 z"
              fill="#5B6B78" stroke="#17262E" stroke-width="4" stroke-linejoin="round"/>
        <ellipse cy="-30" rx="84" ry="20" fill="#2E3D48" stroke="#17262E" stroke-width="4"/>
        <g id="stew"></g>
        <path d="M-84,-30 h-24 q-10,0 -10,-10 M84,-30 h24 q10,0 10,-10"
              fill="none" stroke="#17262E" stroke-width="6" stroke-linecap="round"/>
      </g>
      <g id="steam" transform="translate(452,182)" opacity="0"></g>
      <text id="ckCoach" x="320" y="386" text-anchor="middle" fill="#fff"
            style="font-family:var(--fd);font-weight:700;font-size:17px"></text>
    </svg>
    <canvas id="fx"></canvas>
    <div class="camstate" id="camstate"></div>
  </div>
  <div class="gbar">
    <div class="helpline" id="helpline"></div>
    <button class="quit" id="ckQuit">จบภารกิจ</button>
  </div>
  <p class="privnote">${ico('camera')} ภาพจากกล้องถูกประมวลผลในเครื่องนี้เท่านั้น ไม่ถูกบันทึกและไม่ถูกส่งออกไปที่ใด
    ถ้าไม่ได้ใช้กล้อง กดค้างบนจอเพื่อทำขั้นตอนแทนได้</p>
</div>`;

function mountCook(){
  const stage=$('stage'),actIco=$('actIco'),actName=$('actName'),actRing=$('actRing'),
        actGlow=$('actGlow'),needle=$('needle'),recipeG=$('recipe'),stew=$('stew'),
        steam=$('steam'),coach=$('ckCoach');
  FX.attach($('fx'));
  S.lastGame='cook';
  CK.eng=cookEngine();
  const d0=CK.eng.diff;
  Object.assign(CK,{trials:[],i:0,ok:0,prog:0,done:false,done2:false,coach:'',
                    ptr:{down:false,on:false},kb:{on:false,down:false}});
  G.results=[];
  const rng=mulberry32(hash((S.p?S.p.code:'X')+'cook'));

  /* สร้างสูตรอาหารของรอบนี้ : เลือกจากท่าที่เปิดใช้ตาม directions และไม่ให้ซ้ำติดกัน */
  const deck=COOK_ACTS.slice(0,clamp(Math.round(d0.directions),1,COOK_ACTS.length));
  CK.recipe=[];
  for(let i=0;i<Math.round(d0.reps);i++){
    let a=deck[(rng()*deck.length)|0],g=0;
    while(deck.length>1&&CK.recipe[i-1]&&a.k===CK.recipe[i-1].k&&g++<12)a=deck[(rng()*deck.length)|0];
    CK.recipe.push(a);
  }

  function drawRecipe(){
    const n=CK.recipe.length,w=46,x0=-(n-1)*w/2;
    recipeG.innerHTML=CK.recipe.map((a,i)=>{
      const st=i<CK.i?'done':i===CK.i?'now':'todo';
      return `<g transform="translate(${r1(x0+i*w)},0)">
        <circle r="17" fill="${st==='done'?a.col:st==='now'?'rgba(255,255,255,.9)':'rgba(255,255,255,.16)'}"
                stroke="#fff" stroke-width="${st==='now'?3.5:2}"/>
        <g transform="scale(.2)">${actGlyph(a.k,st==='todo'?'rgba(255,255,255,.55)':st==='now'?a.col:'#fff')}</g>
        ${st==='done'?`<use href="#i-check" x="8" y="-24" width="16" height="16" color="#7BD256"/>`:''}</g>`;
    }).join('');
  }
  function drawStew(){
    const k=CK.i/Math.max(1,CK.recipe.length);
    stew.innerHTML=k<=0?'':`<ellipse cy="${r1(-28+k*6)}" rx="${r1(76*Math.min(1,k*1.15))}" ry="${r1(16*Math.min(1,k*1.15))}"
      fill="#FFB43C" opacity=".9"/>`+
      CK.recipe.slice(0,CK.i).map((a,i)=>`<circle cx="${r1(-52+((i*37)%104))}" cy="${r1(-30+((i*13)%12))}"
        r="8" fill="${a.col}" stroke="#17262E" stroke-width="2"/>`).join('');
    steam.setAttribute('opacity',String(clamp(k*1.2,0,1)));
    steam.innerHTML=k<=0?'':[0,1,2].map(i=>`<path d="M${i*30-30},0 q10,-18 0,-34 q-10,-16 0,-30"
      fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".45"/>`).join('');
  }

  function startStep(){
    if(CK.i>=CK.recipe.length){endRound();return}
    const a=CK.recipe[CK.i];
    Object.assign(CK,{prog:0,holdT:0,spun:0,rev:0,lastSign:0,done2:false,
                      roll0:HT.hand.roll||0,t0:performance.now()});
    actIco.innerHTML=actGlyph(a.k,a.col);
    actName.textContent=a.th;
    needle.setAttribute('opacity',a.kind==='roll'||a.kind==='spin'?'.8':'0');
    drawRecipe();drawStew();
  }
  function finishStep(ok){
    if(CK.done2)return;CK.done2=true;
    const a=CK.recipe[CK.i],d=CK.eng.diff;
    CK.trials.push({i:CK.trials.length+1,act:a.k,kind:a.kind,ok,
      ms:Math.round(performance.now()-CK.t0),hold:r1(d.hold_time),acts:d.directions});
    CK.eng.results.push(ok?1:0);G.results.push(ok?1:0);
    const rec=updateEngine(CK.eng,PRIORITY_COOK);
    if(ok){CK.ok++;
      FX.burst(168,196,38,[a.col,'#FFD98A','#fff'],200);FX.ring(168,196,a.col);
      FX.shake=5;FX.glow=1;
      stage.classList.remove('flash');void stage.offsetWidth;stage.classList.add('flash');
      setTimeout(()=>{FX.fly(168,196,452,206,a.col);
        FX.burst(452,206,14,[a.col,'#fff'],90)},360);
      if(S.p){S.p.seeds=Math.min(9,S.p.seeds+(CK.ok%2===0?1:0));saveStore()}
    }else FX.burst(168,196,10,['#CFE7F0'],80);
    CK.i++;drawRecipe();drawStew();
    setCoach(ok?'ดีมาก ขั้นตอนต่อไป':'ข้ามขั้นตอนนี้ไปก่อน');
    if(rec&&['up','down','down2'].includes(rec.action))
      setTimeout(()=>FX.burst(320,66,18,[rec.action==='up'?'#7BD256':'#FFD98A'],110),700);
    CK.nextAt=performance.now()+900;
  }
  function endRound(){
    if(CK.done)return;CK.done=true;CK.done2=true;
    cancelAnimationFrame(CK.raf);HT.stop();
    setTimeout(goReward,420);
  }
  function setCoach(t){if(CK.coach!==t){CK.coach=t;coach.textContent=t}}

  /* ---------- อินพุต : ไม่มีการหมุนมือบนเมาส์ กดค้าง = กำลังทำท่านั้นอยู่ ---------- */
  stage.addEventListener('pointerdown',ev=>{CK.ptr.down=true;CK.ptr.on=true;
    ev.preventDefault();stage.focus()});
  addEventListener('pointerup',()=>{CK.ptr.down=false});
  stage.addEventListener('keydown',e=>{
    if(e.key===' '||e.key==='Enter'){CK.kb.down=!CK.kb.down;CK.kb.on=true;e.preventDefault()}});

  camPanel($('camstate'),$('helpline'),'ไม่มีกล้อง: กดค้างบนจอเพื่อทำขั้นตอน · หรือเว้นวรรคสลับ');
  stage.focus({preventScroll:true});
  startStep();

  /* ---------- ลูปหลัก ---------- */
  let last=performance.now();
  function loop(now){
    CK.raf=requestAnimationFrame(loop);
    const dt=Math.min(.05,(now-last)/1000);last=now;
    const paused=$('camstate')&&$('camstate').classList.contains('on');
    if(paused)CK.t0=now;
    const d=CK.eng.diff,a=CK.recipe[CK.i],byCam=HT.state==='ready'&&HT.hand.on;

    if(!paused&&!CK.done){
      if(CK.done2&&now>=CK.nextAt)startStep();
      else if(!CK.done2&&a){
        /* ---- ท่านี้กำลังถูกทำอยู่หรือไม่ ---- */
        let active=false,dRoll=0;
        if(byCam){
          dRoll=HT.hand.roll-CK.roll0;
          while(dRoll>180)dRoll-=360; while(dRoll<-180)dRoll+=360;
          if(a.kind==='hold'){
            /* lift วัดจากตำแหน่งจริงในพื้นที่เล่น ไม่ใช่ระยะที่ยกจากจุดเริ่มขั้นตอน
               ถ้าวัดแบบสัมพัทธ์ เด็กที่มืออยู่สูงอยู่แล้วตอนขั้นตอนเริ่ม จะต้องยกสูงขึ้นไปอีก
               จนเลยพื้นที่ที่กล้องเห็น แล้วทำท่านี้ไม่ผ่านเลย */
            active=a.k==='grab'?HT.hand.grab
                  :a.k==='open'?!HT.hand.grab
                  :HT.hand.y<=.32;                      /* lift : มืออยู่ในโซนบนของพื้นที่เล่น */
          }else if(a.kind==='roll')active=Math.abs(dRoll)>=42;
          else if(a.kind==='spin'){CK.spun+=Math.abs(HT.hand.rollDelta);active=Math.abs(HT.hand.rollDelta)>1.5}
          else if(a.kind==='shake'){
            const s=Math.sign(HT.hand.rollDelta);
            if(Math.abs(HT.hand.rollDelta)>4){if(CK.lastSign&&s!==CK.lastSign)CK.rev++;CK.lastSign=s}
            active=CK.rev>0;
          }
        }else active=CK.kb.on?CK.kb.down:CK.ptr.down;

        /* ---- ความคืบหน้า : hold_time คุมทุกชนิดของท่า ---- */
        if(byCam&&a.kind==='spin')CK.prog=clamp(CK.spun/(240+d.hold_time*60),0,1);
        else if(byCam&&a.kind==='shake')CK.prog=clamp(CK.rev/(3+Math.round(d.hold_time)),0,1);
        else{
          if(active)CK.holdT+=dt;else CK.holdT=Math.max(0,CK.holdT-dt*1.3);
          CK.prog=clamp(CK.holdT/Math.max(.1,d.hold_time),0,1);
        }
        /* ขั้นต่ำของเวลาต่อขั้นตอน — ท่าสะบัดมือนับจากจำนวนครั้งที่กลับทิศ
           ถ้าไม่กั้นเวลาไว้ การสั่นของตัวตรวจจับเพียงไม่กี่เฟรมก็ทำให้ผ่านได้ทันที */
        if(CK.prog>=1&&(now-CK.t0)>=d.hold_time*600)finishStep(true);
        else if((now-CK.t0)/1000>25)finishStep(false);

        /* ---- เข็มบอกการหมุน ---- */
        if(a.kind==='roll'||a.kind==='spin'){
          needle.setAttribute('transform',`rotate(${r1(byCam?(a.kind==='spin'?HT.hand.roll:dRoll):0)})`);
          needle.setAttribute('opacity',byCam?'.85':'.25');
        }
        if(c_waiting())setCoach('ยกมือขึ้นให้กล้องเห็น');
        else if(!byCam)setCoach('กดค้างบนจอเพื่อทำขั้นตอนนี้');
        else setCoach(active?'ทำต่อไปแบบนี้':a.th);
      }
    }
    function c_waiting(){return HT.state==='ready'&&!HT.hand.on}

    actRing.setAttribute('stroke-dashoffset',String(r1(540-540*CK.prog)));
    actRing.setAttribute('stroke',CK.prog>0?(a?a.col:'#7BD256'):'#FFD98A');
    actGlow.setAttribute('opacity',String(.14+CK.prog*.3));
    if(HT.state==='ready')paintHandChip(h=>h.grab?'กำมืออยู่':'แบมืออยู่');
    FX.step(dt);FX.draw();
  }
  cancelAnimationFrame(CK.raf);CK.raf=requestAnimationFrame(loop);
  $('ckQuit').onclick=()=>endRound();
}

/* ==========================================================================
   ด่าน 8 — Adventure Island (Game Only)
   --------------------------------------------------------------------------
   เป้าหมายของด่าน: "รวมทุกทักษะไว้ในภารกิจเดียว" + ความทน (Endurance)
   จึงไม่มีกลไกใหม่เลย — เอาแก่นของด่าน 1–7 มาต่อกันเป็นสถานีสั้น ๆ
     reach = เอื้อมและหยิบ (ด่าน 1, 6)  · hold  = คุมแรงให้อยู่ในช่วง (ด่าน 2, 3)
     beat  = ปล่อยให้ตรงจังหวะ (ด่าน 4) · shape = ทำรูปทรงมือ (ด่าน 5)
     turn  = หมุนข้อมือ (ด่าน 7)
   ใช้ครบทั้งห้ามิติที่ด่านนี้ประกาศไว้ : target_force, hold_time, directions,
   target_size, reps  (tolerance_band ไม่อยู่ในรายการ จึงตรึงไว้กว้าง ๆ)
   เดินต่อเนื่องจนจบทุกสถานี ไม่มีพัก เพื่อให้เป็นการวัดความทนจริง ๆ
   ========================================================================== */
const PRIORITY_QUEST=['hold_time','target_size','target_force','directions'];
const QS_BAND=12;                 /* ช่วงเป้าหมายกว้างคงที่ เพราะด่านนี้ไม่ได้ปรับ tolerance_band */
const QS_KINDS=['reach','hold','beat','shape','turn'];
const QS_POSES=['fist','spread','flat'];
const QS_TH={reach:'เอื้อมไปหยิบ',hold:'คุมแรงให้นิ่ง',beat:'ปล่อยให้ตรงจังหวะ',
             shape:'ทำรูปทรงมือ',turn:'หมุนข้อมือ'};
const QS={raf:null,eng:null,trials:[],i:0,ok:0,kind:null,prog:0,holdT:0,
          t0:0,done:false,done2:false,nextAt:0,coach:'',
          tgt:null,pose:null,roll0:0,armed:false,openedAt:0,winAt:0,grabbed:false};

function questStart(p){
  const a=p?p.ability:.5;
  return{target_force:a<.35?25:a<.6?30:a<.8?35:40,
         hold_time  :a<.35?.5:a<.7?1:1.5,
         directions :a<.35?2:a<.6?3:a<.8?4:5,
         target_size:a<.35?24:a<.6?21:a<.8?18:16,
         reps       :a<.35?5:a<.7?7:9};
}
function questEngine(){
  if(!H.quest||H.questCode!==(S.p&&S.p.code)){
    H.quest=newEngine(questStart(S.p));H.quest.prio=PRIORITY_QUEST;H.questCode=S.p&&S.p.code;}
  return H.quest;
}

SC.quest=()=>`
<div class="screen">
  <div class="ghead">
    <button class="back" data-go="home">${ico('arrow-left')} กลับไปที่เกาะ</button>
    <span class="eyebrow">ด่าน 8 · Adventure Challenge · Game Only</span>
  </div>
  <div class="gamewrap questwrap" id="stage" tabindex="0" role="application"
       aria-label="ภารกิจรวมทุกทักษะ ทำตามที่แต่ละสถานีบอกจนครบ">
    <video id="cam" playsinline muted aria-hidden="true"></video>
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet">
      <defs><filter id="qsSoft"><feGaussianBlur stdDeviation="7"/></filter></defs>
      <path d="M0,336 q90,-18 180,-6 t170,-6 t150,10 t140,-10 L640,400 L0,400 Z" fill="rgba(11,59,70,.28)"/>
      <!-- เส้นทางการเดินทาง : บอกว่าเหลืออีกกี่สถานี = ตัวชี้ความทน -->
      <path d="M40,52 H600" stroke="rgba(255,255,255,.32)" stroke-width="4" stroke-linecap="round"/>
      <g id="trail" transform="translate(0,52)"></g>

      <g id="chRing" transform="translate(320,214)" opacity="0">
        <circle id="ringGlow" r="98" fill="#FFD98A" opacity=".14" filter="url(#qsSoft)"/>
        <circle r="90" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3"/>
        <circle id="ringBar" r="90" fill="none" stroke="#7BD256" stroke-width="9" stroke-linecap="round"
                stroke-dasharray="566" stroke-dashoffset="566" transform="rotate(-90)"/>
      </g>

      <!-- สถานีแบบเอื้อม -->
      <g id="chReach" opacity="0"><g id="reachT"></g></g>
      <!-- สถานีคุมแรง : เกจด้านขวา -->
      <g id="chHold" opacity="0" transform="translate(556,0)">
        <rect x="-24" y="96" width="48" height="228" rx="24" fill="rgba(4,32,39,.45)"
              stroke="rgba(255,255,255,.28)" stroke-width="2"/>
        <rect id="hBand" x="-24" y="180" width="48" height="60" fill="rgba(123,210,82,.34)"/>
        <path id="hTop" d="M-24,180 H24" stroke="#7BD256" stroke-width="3.5" stroke-linecap="round"/>
        <path id="hBot" d="M-24,240 H24" stroke="#7BD256" stroke-width="3.5" stroke-linecap="round"/>
        <rect id="hFill" x="-24" y="304" width="48" height="20" rx="12" fill="#7FE3C0"/>
      </g>
      <!-- สถานีจังหวะ -->
      <g id="chBeat" opacity="0" transform="translate(320,214)">
        <circle id="beatDot" r="34" fill="#FFD98A" stroke="#17262E" stroke-width="4"/>
        <circle id="beatRing" r="120" fill="none" stroke="#FF9DC4" stroke-width="7"/>
      </g>
      <!-- สถานีรูปทรงมือ -->
      <g id="chShape" opacity="0" transform="translate(320,214) scale(.9)"></g>
      <!-- สถานีหมุนข้อมือ -->
      <g id="chTurn" opacity="0" transform="translate(320,214)">
        <circle r="66" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="3" stroke-dasharray="8 9"/>
        <path id="turnArc" d="" fill="none" stroke="#B08BFF" stroke-width="10" stroke-linecap="round"/>
        <g id="turnNeedle"><path d="M0,0 L0,-58" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
          <circle cy="-58" r="8" fill="#fff"/></g>
      </g>

      <g id="cur" opacity="0">
        <circle id="curGlow" r="40" fill="#fff" opacity=".18" filter="url(#qsSoft)"/>
        <circle id="curRing" r="27" fill="rgba(255,255,255,.2)" stroke="#fff" stroke-width="3.5"/>
        <g id="curFing" fill="#fff"></g>
        <circle r="11" fill="#fff"/>
      </g>
      <text id="qsName" x="320" y="352" text-anchor="middle" fill="#fff"
            style="font-family:var(--fd);font-weight:700;font-size:18px"></text>
      <text id="qsCoach" x="320" y="382" text-anchor="middle" fill="rgba(255,255,255,.9)"
            style="font-family:var(--fd);font-weight:600;font-size:15px"></text>
    </svg>
    <canvas id="fx"></canvas>
    <div class="camstate" id="camstate"></div>
  </div>
  <div class="gbar">
    <div class="helpline" id="helpline"></div>
    <button class="quit" id="qsQuit">จบภารกิจ</button>
  </div>
  <p class="privnote">${ico('camera')} ภาพจากกล้องถูกประมวลผลในเครื่องนี้เท่านั้น ไม่ถูกบันทึกและไม่ถูกส่งออกไปที่ใด
    เล่นด้วยเมาส์หรือนิ้วบนจอแทนได้ตลอดเวลา</p>
</div>`;

function mountQuest(){
  const stage=$('stage'),trail=$('trail'),ring=$('chRing'),ringBar=$('ringBar'),ringGlow=$('ringGlow'),
        chReach=$('chReach'),reachT=$('reachT'),chHold=$('chHold'),hBand=$('hBand'),hTop=$('hTop'),
        hBot=$('hBot'),hFill=$('hFill'),chBeat=$('chBeat'),beatDot=$('beatDot'),beatRing=$('beatRing'),
        chShape=$('chShape'),chTurn=$('chTurn'),turnArc=$('turnArc'),turnNeedle=$('turnNeedle'),
        cur=$('cur'),curRing=$('curRing'),curFing=$('curFing'),curGlow=$('curGlow'),
        name=$('qsName'),coach=$('qsCoach');
  FX.attach($('fx'));
  S.lastGame='quest';
  QS.eng=questEngine();
  Object.assign(QS,{trials:[],i:0,ok:0,kind:null,done:false,done2:false,coach:'',
                    reps:Math.round(QS.eng.diff.reps)});
  G.results=[];
  const HC=handCursor(stage);
  const rng=mulberry32(hash((S.p?S.p.code:'X')+'quest'));
  const shuffle=a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=(rng()*(i+1))|0;[b[i],b[j]]=[b[j],b[i]]}return b};
  const TOP=96,BOT=324;
  const yOf=f=>BOT-clamp(f,0,100)/100*(BOT-TOP);
  const radiusOf=ts=>r1(16+(clamp(ts,8,26)-8)/18*26);

  function drawTrail(){
    const n=QS.reps,w=560/Math.max(1,n-1||1);
    trail.innerHTML=Array.from({length:n},(_,i)=>{
      const x=n===1?320:40+w*i,st=i<QS.i?'done':i===QS.i?'now':'todo';
      const t=QS.trials[i];
      return `<circle cx="${r1(x)}" cy="0" r="${st==='now'?11:8}"
        fill="${st==='done'?(t&&t.ok?'#7BD256':'rgba(255,255,255,.5)'):st==='now'?'#FFD98A':'rgba(255,255,255,.16)'}"
        stroke="#fff" stroke-width="${st==='now'?3.5:2}"/>`}).join('');
  }
  const hideAll=()=>{[chReach,chHold,chBeat,chShape,chTurn].forEach(e=>e.setAttribute('opacity','0'));
    ring.setAttribute('opacity','0')};

  /* ---------- เริ่มสถานีใหม่ ---------- */
  let order=[],lastKind=null;
  function nextKind(){
    if(!order.length)order=shuffle(QS_KINDS.slice());
    let k=order.shift();
    if(k===lastKind&&order.length){order.push(k);k=order.shift()}
    lastKind=k;return k;
  }
  function startStation(){
    if(QS.i>=QS.reps){endRound();return}
    const d=QS.eng.diff,k=nextKind();
    QS.kind=k;QS.prog=0;QS.holdT=0;QS.done2=false;QS.t0=performance.now();
    QS.armed=false;QS.openedAt=0;QS.grabbed=false;QS.roll0=HT.hand.roll||0;
    hideAll();
    name.textContent=QS_TH[k];
    if(k==='reach'){
      /* ทิศทางกระจายตาม directions เหมือนด่าน 6 แต่ใช้พื้นที่กลางจอ */
      const n=clamp(Math.round(d.directions),1,8),s=(rng()*n)|0;
      const a=-Math.PI/2+(s/n)*Math.PI*2;
      QS.tgt={x:clamp(320+Math.cos(a)*210,70,570),y:clamp(214+Math.sin(a)*116,96,318),
              r:radiusOf(d.target_size)};
      reachT.innerHTML=`<g transform="translate(${QS.tgt.x},${QS.tgt.y})">
        <circle r="${r1(QS.tgt.r+12)}" fill="none" stroke="#FFD98A" stroke-width="3" stroke-dasharray="8 8"/>
        <use href="#i-star-fill" x="${r1(-QS.tgt.r)}" y="${r1(-QS.tgt.r)}"
             width="${r1(QS.tgt.r*2)}" height="${r1(QS.tgt.r*2)}" color="#FFD98A"/></g>`;
      chReach.setAttribute('opacity','1');
    }else if(k==='hold'){
      const yT=yOf(d.target_force+QS_BAND),yB=yOf(d.target_force-QS_BAND);
      hBand.setAttribute('y',yT);hBand.setAttribute('height',Math.max(8,yB-yT));
      hTop.setAttribute('d',`M-24,${yT} H24`);hBot.setAttribute('d',`M-24,${yB} H24`);
      chHold.setAttribute('opacity','1');ring.setAttribute('opacity','1');
    }else if(k==='beat'){
      QS.winAt=performance.now()+1400+rng()*1600;      /* จังหวะสุ่ม นับล่วงหน้าไม่ได้ */
      chBeat.setAttribute('opacity','1');
    }else if(k==='shape'){
      /* ไม่ใช้ท่า 'open' ที่นี่ เพราะมือที่วางเฉย ๆ ก็อ่านได้เป็น 'open' อยู่แล้ว
         สถานีนั้นจะผ่านเองโดยเด็กไม่ต้องทำอะไร ซึ่งทำให้ค่าความทนของด่านนี้เพี้ยน
         เหลือสามท่าที่ต้องตั้งใจทำจริงและตรวจจับได้มั่นคงที่สุด */
      QS.pose=QS_POSES[(rng()*QS_POSES.length)|0];
      chShape.innerHTML=poseGlyph(QS.pose,'#fff');
      name.textContent=QS_TH[k]+' · '+POSES[QS.pose].th;
      chShape.setAttribute('opacity','1');ring.setAttribute('opacity','1');
    }else{
      chTurn.setAttribute('opacity','1');ring.setAttribute('opacity','1');
    }
    drawTrail();
  }
  function finishStation(ok){
    if(QS.done2)return;QS.done2=true;
    const d=QS.eng.diff;
    QS.trials.push({i:QS.trials.length+1,kind:QS.kind,ok,
      ms:Math.round(performance.now()-QS.t0),
      force:d.target_force,hold:r1(d.hold_time),size:d.target_size,dirs:d.directions});
    QS.eng.results.push(ok?1:0);G.results.push(ok?1:0);
    const rec=updateEngine(QS.eng,PRIORITY_QUEST);
    QS.i++;if(ok)QS.ok++;
    drawTrail();
    if(ok){
      FX.burst(320,214,44,['#7BD256','#FFD98A','#fff','#8FD8FF'],210);
      FX.ring(320,214,'#7BD256');FX.shake=6;FX.glow=1;
      stage.classList.remove('flash');void stage.offsetWidth;stage.classList.add('flash');
      if(S.p){S.p.seeds=Math.min(9,S.p.seeds+(QS.ok%2===0?1:0));saveStore()}
    }else FX.burst(320,214,10,['#CFE7F0'],80);
    setCoach(ok?'ผ่านสถานีนี้แล้ว':'ไม่เป็นไร ไปสถานีต่อไป');
    if(rec&&['up','down','down2'].includes(rec.action))
      setTimeout(()=>FX.burst(320,80,18,[rec.action==='up'?'#7BD256':'#FFD98A'],110),700);
    QS.nextAt=performance.now()+850;
  }
  function endRound(){
    if(QS.done)return;QS.done=true;QS.done2=true;
    cancelAnimationFrame(QS.raf);HT.stop();
    setTimeout(goReward,420);
  }
  function setCoach(t){if(QS.coach!==t){QS.coach=t;coach.textContent=t}}

  camPanel($('camstate'),$('helpline'),'เมาส์: เลื่อนเพื่อเอื้อม · กดค้างเพื่อกำมือ · ลากขึ้นลงเพื่อคุมแรง');
  stage.focus({preventScroll:true});
  drawTrail();startStation();

  /* ---------- ลูปหลัก ---------- */
  let last=performance.now();
  function loop(now){
    QS.raf=requestAnimationFrame(loop);
    const dt=Math.min(.05,(now-last)/1000);last=now;
    const paused=$('camstate')&&$('camstate').classList.contains('on');
    if(paused){QS.t0=now;QS.winAt=Math.max(QS.winAt,now+1200)}
    const d=QS.eng.diff,byCam=HT.state==='ready'&&HT.hand.on;

    const c=HC.step(dt);
    paintHandCursor(cur,curRing,curFing,curGlow,c);
    cur.setAttribute('opacity',QS.kind==='reach'&&!c.waiting?'1':'0');
    /* แรงบีบ : กล้องใช้ระดับการกำมือ · เมาส์ใช้ตำแหน่งแนวตั้งเหมือนด่าน 2 */
    const force=byCam?clamp(HT.hand.close*100,0,100):clamp((1-c.y/400)*100,0,100);

    if(!paused&&!QS.done){
      if(QS.done2&&now>=QS.nextAt)startStation();
      else if(!QS.done2){
        const k=QS.kind;
        if(k==='reach'){
          const t=QS.tgt,dist=Math.hypot(c.x-t.x,c.y-t.y);
          if(!QS.grabbed&&c.grab&&dist<t.r+48){QS.grabbed=true;finishStation(true)}
          setCoach(dist<t.r+48?'กำมือเพื่อเก็บ':'เอื้อมไปที่ดาว');
        }else if(k==='hold'){
          const good=Math.abs(force-d.target_force)<=QS_BAND;
          if(good)QS.holdT+=dt;else QS.holdT=Math.max(0,QS.holdT-dt*1.3);
          QS.prog=clamp(QS.holdT/Math.max(.1,d.hold_time),0,1);
          if(QS.prog>=1)finishStation(true);
          setCoach(good?'นิ่งไว้แบบนี้':force<d.target_force?'กำมือขึ้นอีกนิด':'คลายลงนิดหนึ่ง');
        }else if(k==='beat'){
          const closed=byCam?HT.hand.grab:c.grab;
          if(!QS.armed&&closed)QS.armed=true;              /* ต้องหุบรอก่อน กันการแบค้างไว้ */
          const left=QS.winAt-now;
          if(QS.armed&&!closed&&!QS.openedAt){
            QS.openedAt=now;
            /* ปล่อยตรงจังหวะ = อยู่ในกรอบ hold_time รอบเวลาเป้าหมาย */
            finishStation(Math.abs(left)<=Math.max(320,d.hold_time*520));
          }else if(left<-Math.max(320,d.hold_time*520))finishStation(false);
          setCoach(!QS.armed?'กำมือรอจังหวะก่อน':left>0?'รอ...':'ปล่อยเดี๋ยวนี้');
        }else if(k==='shape'){
          const match=byCam?HT.hand.pose===QS.pose:c.grab;
          if(match)QS.holdT+=dt;else QS.holdT=Math.max(0,QS.holdT-dt*1.4);
          QS.prog=clamp(QS.holdT/Math.max(.1,d.hold_time),0,1);
          if(QS.prog>=1)finishStation(true);
          setCoach(match?'ค้างไว้':'ทำมือให้เหมือนรูป');
        }else{
          let dr=0;
          if(byCam){dr=HT.hand.roll-QS.roll0;while(dr>180)dr-=360;while(dr<-180)dr+=360}
          const turning=byCam?Math.abs(dr)>=42:c.grab;
          if(turning)QS.holdT+=dt;else QS.holdT=Math.max(0,QS.holdT-dt*1.3);
          QS.prog=clamp(QS.holdT/Math.max(.1,d.hold_time),0,1);
          if(QS.prog>=1)finishStation(true);
          turnNeedle.setAttribute('transform',`rotate(${r1(byCam?dr:0)})`);
          const sweep=clamp(Math.abs(dr)/42,0,1)*Math.sign(dr||1);
          turnArc.setAttribute('d',`M0,-66 A66,66 0 ${Math.abs(sweep)>.5?1:0} ${sweep>0?1:0} ${r1(66*Math.sin(sweep*.75))},${r1(-66*Math.cos(sweep*.75))}`);
          setCoach(turning?'ค้างไว้':'หมุนข้อมือไปทางใดทางหนึ่ง');
        }
        if((now-QS.t0)/1000>22)finishStation(false);
        if(c.waiting)setCoach('ยกมือขึ้นให้กล้องเห็น');
      }
    }

    /* ภาพประกอบต่อสถานี */
    if(QS.kind==='hold'){
      const y=yOf(force);
      hFill.setAttribute('y',y);hFill.setAttribute('height',Math.max(6,BOT-y));
    }else if(QS.kind==='beat'){
      const left=QS.winAt-now,k2=clamp(1-left/2600,0,1);
      beatRing.setAttribute('r',String(r1(120-k2*84)));
      beatRing.setAttribute('stroke',Math.abs(left)<=Math.max(320,d.hold_time*520)?'#7BD256':'#FF9DC4');
      beatDot.setAttribute('fill',QS.armed?'#FFD98A':'rgba(255,217,138,.4)');
    }
    ringBar.setAttribute('stroke-dashoffset',String(r1(566-566*QS.prog)));
    ringGlow.setAttribute('opacity',String(.12+QS.prog*.3));
    if(HT.state==='ready')paintHandChip(h=>h.grab?'กำมืออยู่':'แบมืออยู่');
    FX.step(dt);FX.draw();
  }
  cancelAnimationFrame(QS.raf);QS.raf=requestAnimationFrame(loop);
  $('qsQuit').onclick=()=>endRound();
}

/* ==========================================================================
   สถิติต่อด่าน — 5 แท่งต่อด่าน เทียบครั้งนี้กับสถิติเดิม
   --------------------------------------------------------------------------
   ทุกค่าคำนวณจากสิ่งที่ด่านนั้น "บันทึกไว้จริง" ไม่ใช่ชุดเดียวกันทุกด่าน
   มีแค่ด่าน 2 กับ 3 ที่เป็นงานคุมแรง จึงใช้ GSI/GAS/GES ตามสูตรใน METHODS ได้
   ด่านอื่นเป็นงานเอื้อม จังหวะ ท่ามือ หรือหมุนข้อมือ ตัวชี้วัดแรงไม่มีความหมาย
   ถ้าใส่ค่าแรงลงไปก็จะเป็นเลขที่แต่งขึ้น และจะไหลไปปนกับหน้านักกายภาพด้วย
   GDI ไม่อยู่ในชุดนี้เลย เพราะต้องอ่านจากเซนเซอร์แรงหลายจุดในลูกบอล
   โหมดกล้องไม่มีเซนเซอร์ ค่าที่เกมคำนวณอยู่ตอนนี้จึงเป็นค่าประมาณ + สุ่ม
   ถ้าเอามาโชว์เป็น "ความก้าวหน้า" แท่งจะขยับเองทั้งที่เด็กทำเหมือนเดิม
   ========================================================================== */
const STAT_MAX=5;                                 // จำนวนแท่งต่อด่าน

/* ตัวช่วยแปลงข้อมูล trial ให้เป็นคะแนน 0–100 — คืน null เมื่อข้อมูลไม่พอ
   คืน null สำคัญมาก เพราะ mean([]) = 0 และ Math.max(...[]) = -Infinity
   ถ้าไม่ดักไว้ รอบที่ไม่มีข้อมูลจะกลายเป็น "ได้ 0 คะแนน" ซึ่งไม่จริง */
const stPc =(tr,f)=>tr.length?Math.round(100*mean(tr.map(f))):null;
const stAvg=(tr,f)=>{const v=tr.map(f).filter(x=>x!=null&&isFinite(x));
  return v.length?mean(v):null};
/* เร็ว–ช้า : lo คือเร็วจนได้เต็ม hi คือช้าจนได้ศูนย์ (ตัวเลขปรับได้) */
const stSpd=(ms,lo,hi)=>ms==null?null:Math.round(clamp(100*(hi-ms)/(hi-lo),0,100));
const stRt =ms=>stSpd(ms,200,2000);
/* ความสม่ำเสมอ = 1 − CV ของเวลาที่ใช้แต่ละครั้ง ต้องมีอย่างน้อย 2 ครั้ง */
const stCv =v=>{v=v.filter(x=>x!=null&&isFinite(x));
  if(v.length<2)return null;const m=mean(v);if(m<=0)return null;
  const sd=Math.sqrt(mean(v.map(x=>(x-m)**2)));
  return Math.round(clamp(100*(1-sd/m),0,100))};
/* ความยากที่ไปถึง : เทียบกับช่วง min–max ของมิตินั้นใน DIMS
   เป็น "ความก้าวหน้า" จริง เพราะ engine เลื่อนขึ้นให้เฉพาะเมื่อเด็กทำได้ */
const stDim=(tr,f,d)=>{const v=tr.map(f).filter(x=>x!=null&&isFinite(x));
  if(!v.length)return null;const D=DIMS[d];
  return Math.round(clamp(100*(Math.max(...v)-D.min)/(D.max-D.min),0,100))};
const stKind=(tr,k)=>{const s=tr.filter(t=>t.kind===k);
  return s.length?Math.round(100*s.filter(t=>t.ok).length/s.length):null};

/* key = ค่าของ S.lastGame ที่แต่ละ mount ตั้งไว้ (ด่าน 2 ใช้ชื่อ 'bubble') */
const STAGE_STATS={
  /* ด่าน 1 — งานเอื้อม/หยิบ/ปล่อย : SH.trials เก็บ ok, rt, grabs, assisted, pathEff */
  shape:[
    {k:'ACC',  label:'วางถูกช่อง',      get:tr=>stPc(tr,t=>t.ok?1:0)},
    {k:'RT',   label:'เริ่มเอื้อมได้ไว', get:tr=>stRt(stAvg(tr,t=>t.rt||null))},
    {k:'PATH', label:'ลากได้ตรงทาง',    get:tr=>{const v=stAvg(tr,t=>t.pathEff);
      return v==null?null:Math.round(v)}},
    /* หยิบติดครั้งเดียว = จำนวนครั้งที่ลอง ÷ จำนวนครั้งที่คว้า ยิ่งใกล้ 1 ยิ่งดี */
    {k:'GRAB', label:'คว้าติดครั้งเดียว',get:tr=>{
      const g=tr.reduce((a,t)=>a+(t.grabs||0),0);
      return g?Math.round(clamp(100*tr.length/g,0,100)):null}},
    /* ปล่อยเองได้ ไม่ต้องพึ่ง dwell-to-drop — นับเฉพาะครั้งที่วางสำเร็จ */
    {k:'INDEP',label:'ปล่อยด้วยตัวเอง',  get:tr=>{const o=tr.filter(t=>t.ok);
      return o.length?Math.round(100*o.filter(t=>!t.assisted).length/o.length):null}},
  ],
  /* ด่าน 2 และ 3 — งานคุมแรงจริง ใช้ตัวชี้วัดแรงตามเอกสารได้เต็มชุด */
  bubble:[
    {k:'GAS',  label:'ความแม่นของแรง',  sub:'GAS',get:tr=>{const v=stAvg(tr,t=>t.GAS);return v==null?null:Math.round(v)}},
    {k:'GSI',  label:'ความนิ่งของแรง',  sub:'GSI',get:tr=>{const v=stAvg(tr,t=>t.GSI);return v==null?null:Math.round(v)}},
    {k:'GES',  label:'ความทนของการกำ',  sub:'GES',get:tr=>{const v=stAvg(tr,t=>t.GES);return v==null?null:Math.round(v)}},
    {k:'RT',   label:'เริ่มบีบได้ไว',    sub:'RT', get:tr=>stRt(stAvg(tr,t=>t.RT||null))},
    {k:'ACC',  label:'ช่วยสัตว์สำเร็จ',  get:tr=>stPc(tr,t=>t.ok?1:0)},
  ],
  /* ด่าน 4 — งานจังหวะสองบีต : ต้องอ้าปากทัน แล้วปิดปากทัน */
  monster:[
    {k:'ACC',  label:'ครบทั้งสองจังหวะ',get:tr=>stPc(tr,t=>t.ok?1:0)},
    {k:'CATCH',label:'อ้าปากรับทัน',     get:tr=>stPc(tr,t=>t.caught?1:0)},
    {k:'CHEW', label:'ปิดปากเคี้ยวทัน',  get:tr=>stPc(tr,t=>t.chewed?1:0)},
    {k:'RTO',  label:'อ้าปากได้ไว',      get:tr=>stRt(stAvg(tr,t=>t.rtOpen||null))},
    {k:'RTC',  label:'ปิดปากได้ไว',      get:tr=>stRt(stAvg(tr,t=>t.rtClose||null))},
  ],
  /* ด่าน 5 — งานท่ามือ : GD.trials เก็บ ok, ms, hold, zones */
  garden:[
    {k:'ACC',  label:'ทำท่ามือถูก',      get:tr=>stPc(tr,t=>t.ok?1:0)},
    {k:'SPEED',label:'หาท่าได้ไว',       get:tr=>stSpd(stAvg(tr,t=>t.ms),800,6000)},
    {k:'STEADY',label:'ทำได้สม่ำเสมอ',   get:tr=>stCv(tr.map(t=>t.ms))},
    {k:'HOLD', label:'ค้างท่าได้นาน',    get:tr=>stDim(tr,t=>t.hold,'hold_time')},
    {k:'ZONES',label:'ใช้มือหลายส่วน',   get:tr=>stDim(tr,t=>t.zones,'contact_zones')},
  ],
  /* ด่าน 6 — งานเอื้อมไกล : ตัวชี้วัดหลักคือระยะและการข้ามแนวกลางลำตัว */
  trek:[
    {k:'ACC',  label:'เก็บเข้าหีบได้',   get:tr=>stPc(tr,t=>t.ok?1:0)},
    /* เวที 640 px กว้าง ระยะเอื้อมที่วัดได้จริงต่ำสุด 378 px จึงหาร 600 */
    {k:'REACH',label:'ระยะเอื้อม',       get:tr=>{const v=stAvg(tr,t=>t.reach);
      return v==null?null:Math.round(clamp(100*v/600,0,100))}},
    {k:'CROSS',label:'ข้ามแนวกลางตัว',   get:tr=>stPc(tr,t=>t.crossed?1:0)},
    {k:'RT',   label:'เริ่มเอื้อมได้ไว',  get:tr=>stRt(stAvg(tr,t=>t.rt||null))},
    {k:'PATH', label:'ลากได้ตรงทาง',     get:tr=>{const v=stAvg(tr,t=>t.pathEff);
      return v==null?null:Math.round(v)}},
  ],
  /* ด่าน 7 — ลำดับการหมุนข้อมือ : CK.trials เก็บ ok, ms, hold, acts */
  cook:[
    {k:'ACC',  label:'ทำตามขั้นตอนได้',  get:tr=>stPc(tr,t=>t.ok?1:0)},
    {k:'SPEED',label:'ทำได้ไว',          get:tr=>stSpd(stAvg(tr,t=>t.ms),800,8000)},
    {k:'STEADY',label:'ทำได้สม่ำเสมอ',   get:tr=>stCv(tr.map(t=>t.ms))},
    {k:'HOLD', label:'ทำได้ครบจังหวะ',   get:tr=>stDim(tr,t=>t.hold,'hold_time')},
    {k:'ACTS', label:'ท่าที่ทำได้',       get:tr=>stDim(tr,t=>t.acts,'directions')},
  ],
  /* ด่าน 8 — บทสรุป ไม่มีกลไกใหม่ จึงวัดเป็น "ผ่านสถานีไหนได้บ้าง"
     ตรงกับที่ด่านนี้เอาแกนของด่าน 1–7 มาเรียงเป็นสถานีสั้น ๆ พอดี
     สถานีที่ไม่ออกในรอบนั้นจะได้ null แล้วแสดงว่ายังไม่มีข้อมูล */
  quest:QS_KINDS.map((k,i)=>({k:'S_'+k.toUpperCase(),
    label:['สถานีเอื้อม','สถานีค้างแรง','สถานีจังหวะ','สถานีท่ามือ','สถานีหมุนมือ'][i],
    get:tr=>stKind(tr,k)})),
};
STAGE_STATS.rocket=STAGE_STATS.bubble;            // ด่าน 3 ใช้ schema เดียวกับด่าน 2

/* trial ของ "รอบนี้เท่านั้น"
   ด่านอื่นเคลียร์ trials ของตัวเองตอน mount อยู่แล้ว จึงอ่านตรง ๆ ได้
   ด่าน 2/3 เขียนลง H.trials ซึ่งมีประวัติจำลองปนอยู่และสะสมข้ามรอบ
   จึงต้องตัดจากหลักที่บันทึกไว้ตอน mount (S.runFrom) และกรองเอาแต่ live */
function roundTrials(){
  switch(S.lastGame){
    case 'bubble':
    case 'rocket':  return H.trials.slice(S.runFrom||0).filter(t=>t.live);
    case 'shape':   return SH.trials;
    case 'monster': return TM.trials;
    case 'garden':  return GD.trials;
    case 'trek':    return TK.trials;
    case 'cook':    return CK.trials;
    case 'quest':   return QS.trials;
    default:        return [];
  }
}

/* ปิดรอบ : คำนวณคะแนนของรอบนี้ เทียบกับที่เก็บไว้ แล้วอัปเดตสถิติ
   เก็บแค่ last/best/runs ต่อหนึ่งตัวชี้วัด ไม่เก็บประวัติทุกรอบ
   เพราะหน้านี้ต้องรู้แค่ "ครั้งนี้ เทียบครั้งก่อน และเทียบสถิติที่ดีที่สุด"
   อ่านค่าเดิมก่อนเขียนทับเสมอ ไม่งั้น delta จะเทียบกับตัวเองและได้ 0 ตลอด */
function commitStats(){
  S.runStats=null;
  const defs=STAGE_STATS[S.lastGame];
  if(!defs||!S.p)return;
  const tr=roundTrials();
  if(!tr.length)return;
  if(!S.p.stats)S.p.stats={};
  const key=String(S.sel);
  const rec=S.p.stats[key]||(S.p.stats[key]={runs:0,m:{}});
  const rows=defs.map(d=>{
    const v=d.get(tr),old=rec.m[d.k]||null;
    const row={k:d.k,label:d.label,sub:d.sub||'',v,
      prev:old?old.last:null,best:old?old.best:null};
    /* "สถิติใหม่" ต้องมีของเดิมให้ทุบก่อน ไม่งั้นรอบแรกจะขึ้นทั้ง 5 แท่งซึ่งไม่มีความหมาย */
    row.record=v!=null&&row.best!=null&&v>row.best;
    if(v!=null)rec.m[d.k]={last:v,best:row.best==null?v:Math.max(row.best,v)};
    return row;
  });
  rec.runs++;
  S.runStats={level:S.sel,runs:rec.runs,rows};
  saveStore();
}

/* กราฟแท่งแนวนอน : ชื่อตัวชี้วัดอยู่คอลัมน์ซ้าย แท่งงอกจากเส้นศูนย์เส้นเดียวกัน
   มีเส้นกริดที่ 0/25/50/75/100 ต่อเนื่องทุกแถว และมีแกนกำกับใต้กราฟ
   เส้นกริดกับแกนคือสิ่งที่ทำให้อ่านเป็น "กราฟ" ไม่ใช่แถบโหลด 5 อัน
   ปลายแท่งมนแค่ด้านขวา (4px) ด้านซ้ายเป็นมุมฉากติดเส้นศูนย์ ตามหลักกราฟแท่ง
   ขีดสีม่วงคือสถิติที่ดีที่สุด "ก่อนรอบนี้" แท่งวิ่งเลยขีดได้ เพื่อให้เห็นตอนทำสถิติใหม่
   มีสองสิ่งที่เข้ารหัสด้วยสี (แท่ง = รอบนี้ / ขีด = สถิติเดิม) จึงต้องมี legend กำกับ
   สีทั้งชุดผ่านการตรวจ contrast และการแยกสีสำหรับตาบอดสีแล้ว
   ใช้ step ที่เข้มของโทเคนเดิม (grass-deep / grape-deep / sun-deep)
   ค่าอ่อนอย่าง --sun (#FFB43C) ตกเกณฑ์ contrast บนพื้นขาว จึงห้ามใช้เป็นสีแท่ง */
function statBars(rows,compact){
  const axis=`<div class="sbrow sbaxis"><span></span>
    <span class="sbticks"><i>0</i><i>50</i><i>100</i></span><span></span></div>`;
  const legend=compact?'':`<div class="sblegend">
    <span><i class="k bar"></i>รอบนี้</span>
    <span><i class="k tick"></i>สถิติเดิม</span></div>`;
  const body=rows.map(r=>{
    const d=r.prev==null?null:r.v-r.prev;
    const dcls=d==null?'first':(d>0?'up':(d<0?'down':'same'));
    /* ใช้เครื่องหมาย + / − นำหน้าเสมอ ทิศทางจึงไม่ได้อยู่ที่สีอย่างเดียว */
    const dtxt=d==null?'ครั้งแรก':(d===0?'เท่าเดิม':`${d>0?'+':'−'}${Math.abs(d)}`);
    const name=`${r.label}${r.sub?` <i>${r.sub}</i>`:''}`;
    if(r.v==null)return `<div class="sbrow nodata">
      <span class="sblab"><b>${name}</b><small>ยังไม่มีข้อมูล</small></span>
      <span class="sbplot"></span>
      <span class="sbval"><b>–</b></span></div>`;
    const note=r.record?`${ico('flag')} สถิติใหม่`:(r.best!=null?`ดีที่สุด ${r.best}`:'');
    return `<div class="sbrow${r.record?' rec-new':''}"
      title="${r.label}${r.sub?' ('+r.sub+')':''} — รอบนี้ ${r.v} จาก 100${
        r.best!=null?` · ดีที่สุดก่อนรอบนี้ ${r.best}`:''}${
        r.prev!=null?` · ครั้งก่อน ${r.prev}`:''}">
      <span class="sblab"><b>${name}</b>${compact?'':`<small>${note}</small>`}</span>
      <span class="sbplot"><i class="sbbar" style="width:${r.v}%"></i>${
        r.best!=null?`<u class="sbtick" style="left:${r.best}%"></u>`:''}</span>
      <span class="sbval"><b>${r.v}</b>${compact?'':`<s class="${dcls}">${dtxt}</s>`}</span>
    </div>`}).join('');
  return `<figure class="sbchart${compact?' compact':''}">${legend}
    <div class="sbplotarea">${body}${axis}</div></figure>`;
}

/* ฉบับย่อบนการ์ดด่านในแผนที่ : ไม่มี "รอบนี้" จึงแสดงสถิติที่ดีที่สุด */
function bestBars(level){
  const defs=STAGE_STATS[gameKeyOf(level)];
  const rec=S.p&&S.p.stats&&S.p.stats[String(level)];
  if(!defs||!rec)return '';
  const rows=defs.map(d=>{const m=rec.m[d.k]||null;
    return{k:d.k,label:d.label,sub:d.sub||'',v:m?m.best:null,prev:null,best:null}});
  if(!rows.some(r=>r.v!=null))return '';
  return `<div class="statcard"><b>สถิติที่ดีที่สุดของด่านนี้</b>
    <small>เล่นไปแล้ว ${rec.runs} รอบ · แท่งคือคะแนนสูงสุดที่เคยทำได้</small>
    ${statBars(rows,true)}</div>`;
}

/* ด่าน -> key ของ STAGE_STATS โดยดูจากโหมดที่เลือกไว้
   playable กับ screen อยู่ในข้อมูลของด่าน จึงไม่ต้องมีตารางซ้ำอีกที่ */
function gameKeyOf(level){
  const lv=LEVELS[level-1],m=lv&&S.p&&lv.modes[S.p.mode];
  if(!m||!m.playable)return null;
  const scr=m.screen||'game';
  return scr==='game'?'bubble':scr;
}

/* ==========================================================================
   กราฟชุดเดียวกัน แต่ขยับสด ๆ ระหว่างที่ยังเล่นอยู่
   --------------------------------------------------------------------------
   เดิมกราฟห้าแท่งขึ้นตอนจบรอบเท่านั้น ระหว่างเล่นเด็กจึงไม่เห็นเลยว่า
   สิ่งที่กำลังทำอยู่มีผลกับอะไร แถบนี้ใช้คลาส .sb* ชุดเดิมทั้งหมด
   จะได้อ่านเป็น "กราฟเดิมที่ย่อลง" ไม่ใช่ของใหม่ที่หน้าตาไม่เหมือนกัน

   แท่งขยับสองจังหวะ
   1) ทุกครั้งที่ภารกิจย่อยจบ : คิดจาก trial ที่บันทึกแล้ว ด้วย
      STAGE_STATS[...].get() ตัวเดียวกับหน้าสรุป เลขจึงตรงกันเสมอ
   2) ระหว่างภารกิจย่อยที่ยังไม่จบ : เฉพาะตัวชี้วัดที่สูตรของมันนิยามได้
      บนข้อมูลบางส่วนจริง ๆ (ตาราง LIVE_PARTIAL) เช่นความแม่น/ความนิ่งของแรง
      ระหว่างที่ยังบีบค้างอยู่ — ใช้สูตรเดียวกับตอนปิด trial เป๊ะ ๆ
      จึงเป็น "ค่าที่จะได้ถ้าจบตรงนี้" ไม่ใช่ตัวเลขที่คิดขึ้นมาใหม่
      ตัวที่ต้องรู้ผลแพ้ชนะก่อน (ความสำเร็จ, RT) ไม่มีค่าระหว่างทาง
      จึงปล่อยให้ขยับทีละ trial ไม่ยัดตัวเลขปลอมให้มัน

   จอเด็กระหว่างเล่นไม่มีตัวเลข (ดูหมายเหตุหัวส่วนเกม) แถบนี้จึงมีแต่แท่ง
   กริด และขีดสถิติเดิม ส่วนเลข 0–100 ผลต่าง และป้ายสถิติใหม่แบบเต็ม
   ยังอยู่บนหน้าสรุปที่เด็กหยุดเล่นแล้ว
   ========================================================================== */
const LIVE={host:null,rows:[],key:null,raf:null,next:0};
const LIVE_MS=110;                                // อัปเดตราว 9 ครั้ง/วินาที ที่เหลือให้ transition ทำต่อ
const LIVE_MIN=10;                                // ตัวอย่างขั้นต่ำก่อนเริ่มโชว์ กันแท่งกระตุกตอนเพิ่งเริ่มบีบ

/* ค่าแรงระหว่างทาง — สูตรเดียวกับที่ endTrial()/endGate() ใช้ตอนปิด trial */
function forceLive(samples,aim,band){
  if(!samples||samples.length<LIVE_MIN)return null;
  const inb=samples.filter(f=>Math.abs(f-aim)<=band);
  const base=inb.length?inb:samples,mu=mean(base)||1;
  const sd=Math.sqrt(mean(base.map(f=>(f-mu)**2))||0);
  return{GSI:clamp(100*(1-sd/Math.max(mu,1)),0,100),
         GAS:clamp(100*(1-mean(samples.map(f=>Math.abs(f-aim)))/Math.max(1,aim)),0,100),
         GES:clamp(100*inb.length/samples.length,0,100)};
}
/* ความตรงของเส้นทาง = ระยะตรงจากจุดที่คว้า มาถึงตำแหน่งตอนนี้ ÷ ระยะที่ลากมาจริง
   ค่านี้ลู่เข้าหาค่าตอนปิด trial พอดี เพราะตอนนั้นตำแหน่งตอนนี้คือช่องที่วาง */
const pathLive=(o,plen)=>!o||plen<40?null:
  {PATH:clamp(100*Math.hypot(o.hx-o.x,o.hy-o.y)/plen,0,100)};

const LIVE_PARTIAL={
  bubble:()=>G.active?forceLive(G.samples,H.engine.diff.target_force,H.engine.diff.tolerance_band):null,
  rocket:()=>R.gate?forceLive(R.samples,R.gate.alt,R.gate.diff.tolerance_band):null,
  shape :()=>SH.held?pathLive(SH.shape,SH.plen):null,
  /* ด่าน 6 การข้ามแนวกลางตัวรู้ผลได้ทันทีที่มือผ่านเส้น ไม่ต้องรอจบภารกิจ */
  trek  :()=>TK.held?{...(pathLive(TK.gem,TK.plen)||{}),
    CROSS:TK.minX<TK_C.x&&TK.maxX>TK_C.x?100:0}:null,
};

/* สร้าง DOM ครั้งเดียวตอนเข้าด่าน แล้วอัปเดตด้วยการเขียน style.width ตรง ๆ
   ไม่ประกอบ innerHTML ใหม่ทุกรอบ ไม่งั้น transition จะเริ่มนับหนึ่งใหม่ตลอด
   และขีดสถิติเดิมจะกระพริบ */
LIVE.mount=function(){
  this.stop();
  const key=S.lastGame,defs=STAGE_STATS[key],bar=document.querySelector('.gbar');
  if(!defs||!bar||!bar.parentNode)return;
  const rec=S.p&&S.p.stats&&S.p.stats[String(S.sel)];
  const bestOf=k=>rec&&rec.m[k]?rec.m[k].best:null;
  const body=defs.map(d=>{const b=bestOf(d.k);
    return `<div class="sbrow nodata" data-k="${d.k}">
      <span class="sblab"><b>${d.label}${d.sub?` <i>${d.sub}</i>`:''}</b></span>
      <span class="sbplot"><i class="sbbar" style="width:0%"></i>${
        b==null?'':`<u class="sbtick" style="left:${b}%"></u>`}</span>
      <span class="sbflag">${ico('flag')}</span></div>`}).join('');
  /* มีสามอย่างที่เข้ารหัสด้วยสี (แท่งเขียว = รอบนี้ / ขีดม่วง = สถิติเดิม /
     แท่งทอง = แซงแล้ว) จึงต้องมี legend เหมือนกราฟบนหน้าสรุป ไม่ปล่อยให้เดาจากสี
     ด่านที่ยังไม่เคยเล่น ไม่มีขีดและไม่มีทอง จึงบอกเป็นประโยคแทน ไม่ตั้ง key ลอย ๆ
     ที่ไม่มีอะไรบนกราฟให้ชี้ถึง */
  const el=document.createElement('div');
  el.className='statcard livecard';
  el.innerHTML=`<b>ผลงานรอบนี้</b>
    ${rec?`<div class="sblegend"><span><i class="k bar"></i>รอบนี้</span>
      <span><i class="k tick"></i>สถิติเดิม</span>
      <span><i class="k gold"></i>${ico('flag')} แซงแล้ว</span></div>`
        :'<small>ด่านนี้ยังไม่มีสถิติเดิมมาเทียบ รอบนี้จะกลายเป็นสถิติแรก</small>'}
    <figure class="sbchart compact live"><div class="sbplotarea">${body}
      <div class="sbrow sbaxis"><span></span>
        <span class="sbticks"><i>0</i><i>50</i><i>100</i></span><span></span></div>
    </div></figure>`;
  bar.parentNode.insertBefore(el,bar);
  this.host=el;this.key=key;
  this.rows=defs.map(d=>{const r=el.querySelector(`.sbrow[data-k="${d.k}"]`);
    return{row:r,bar:r.querySelector('.sbbar'),best:bestOf(d.k),w:-1,over:false,cheered:false}});
  /* rAF ของตัวเอง ไม่ไปแทรกใน loop ของเกมทั้งแปด (แปดที่ = แปดที่ที่จะเพี้ยนแยกกัน)
     หน่วงเป็นช่วง ๆ เพราะแท่งมีไว้ให้ชำเลืองมอง ไม่ต้องเขียน DOM ทุกเฟรม */
  const step=now=>{this.raf=requestAnimationFrame(step);
    if(now<this.next)return;this.next=now+LIVE_MS;this.tick()};
  this.raf=requestAnimationFrame(step);
};
LIVE.stop=function(){
  cancelAnimationFrame(this.raf);this.raf=null;
  if(this.host&&this.host.parentNode)this.host.parentNode.removeChild(this.host);
  this.host=null;this.rows=[];this.key=null;this.next=0;
};
LIVE.tick=function(){
  if(!this.host)return;
  const defs=STAGE_STATS[this.key];if(!defs)return;
  const done=roundTrials(),n=done.length;
  const pf=LIVE_PARTIAL[this.key],part=pf?pf():null;
  defs.forEach((d,i)=>{
    const r=this.rows[i];if(!r)return;
    const base=d.get(done),p=part&&part[d.k]!=null?part[d.k]:null;
    /* รวมภารกิจที่ยังทำอยู่เข้าไปเป็นอีกหนึ่งครั้ง = ค่าเฉลี่ยที่จะได้ถ้าจบตรงนี้ */
    let v=p==null?base:(base==null?p:(base*n+p)/(n+1));
    v=v==null?null:Math.round(clamp(v,0,100));
    const w=v==null?0:v;
    if(w!==r.w){r.w=w;r.bar.style.width=w+'%'}
    r.row.classList.toggle('nodata',v==null);
    /* แซงสถิติเดิม : ทองทั้งแท่ง + ธง + ประกายบนจอเกม ไม่ใช้สีอย่างเดียวเป็นตัวบอก
       เข้าที่ v>best แต่ถอยออกที่ v<best-2 (hysteresis) ไม่งั้นค่าที่แกว่งอยู่
       ตรงเส้นพอดีจะสลับสีวินาทีละหลายครั้ง ซึ่งกวนสายตามากกว่าเป็นรางวัล */
    const over=v!=null&&r.best!=null&&(r.over?v>=r.best-2:v>r.best);
    if(over!==r.over){r.over=over;r.row.classList.toggle('rec-new',over)}
    if(over&&!r.cheered){r.cheered=true;
      r.row.classList.remove('lvpop');void r.row.offsetWidth;r.row.classList.add('lvpop');
      if(FX.cv)FX.burst(320,372,18,['#FFD98A','#F7E5C6','#7BD256'],120);
    }
  });
};

/* ==========================================================================
   เหรียญ · ตู้กาชา · ของเล่นสะสมที่เดินอยู่ในพื้นหลัง
   --------------------------------------------------------------------------
   ตัวละครในตู้เป็นของที่ออกแบบขึ้นใหม่ทั้งหมด ไม่ใช่มีมที่มีชื่อเจ้าของอยู่แล้ว
   เพราะเว็บนี้ถูกดีพลอยจริงเป็นสาธารณะและเป็นผลิตภัณฑ์ด้านสุขภาพ
   การเอาตัวละครของคนอื่นมาใส่จึงเป็นความเสี่ยงที่ไม่ควรฝังไว้ในโค้ด
   แต่คงอารมณ์เดิมไว้ครบ : สัตว์ผสมสิ่งของ ชื่ออ่านเล่นลิ้น สุ่มได้จากตู้
   ถ้าจะเปลี่ยนชื่อหรือเพิ่มตัว แก้ที่ตาราง TOYS ที่เดียว
   ========================================================================== */
const ROLL_COST=60;
const TOY_SHOWCASE=10;                            // จำนวนตัวที่เดินในฉากพร้อมกันได้มากที่สุด
const SPIN_MS=1500;                               // เวลาหมุนก่อนเฉลย
/* น้ำหนักการสุ่มและค่าชดเชยเมื่อได้ตัวซ้ำ — ซ้ำแล้วต้องได้อะไรกลับ
   ไม่งั้นเด็กที่หมุนแล้วได้ตัวเดิมจะรู้สึกว่าเสียเหรียญเปล่า */
const RARITY={1:{th:'ธรรมดา',    w:40,  back:10, col:'#7BD256'},
              2:{th:'หายาก',     w:26,  back:22, col:'#8FD8FF'},
              3:{th:'หายากมาก',  w:16,  back:50, col:'#A99BF5'},
              4:{th:'ตำนาน',     w:10,  back:95, col:'#FFC94F'},
              5:{th:'ลับเฉพาะ',  w:6,   back:180,col:'#FF9FD0'},
              6:{th:'OG',        w:2,   back:320,col:'#E8543F'}};
/* kind = รูปทรงลำตัว · c = สีหลัก/สีเงา · a = สีของประดับ */
const TOYS=[
 {id:'kak',n:'Cactusso Miaowino',th:'แคคตัสเหมียว',r:1,kind:'cactus',c:['#5DBE3E','#3F9A26'],a:'#FF9FD0'},
 {id:'toa',n:'Toastino Bearoni',th:'ขนมปังหมี',    r:1,kind:'toast', c:['#F0C070','#D19A45'],a:'#8A5A2B'},
 {id:'sok',n:'Sockolo Froggini', th:'ถุงเท้ากบ',   r:1,kind:'sock',  c:['#8FD8FF','#4FA3D9'],a:'#7BD256'},
 {id:'don',n:'Donutto Wormello', th:'โดนัทหนอน',   r:1,kind:'donut', c:['#FF9FD0','#E8548F'],a:'#FFF1D6'},
 {id:'tea',n:'Teapotto Turtelli',th:'กาน้ำเต่า',    r:2,kind:'teapot',c:['#0FA3A3','#0A7A7A'],a:'#FFD98A'},
 {id:'lam',n:'Lampino Giraffoni',th:'โคมไฟยีราฟ',  r:2,kind:'lamp',  c:['#FFC94F','#C87A00'],a:'#6C5CE7'},
 {id:'umb',n:'Umbrello Duckini', th:'ร่มเป็ด',      r:2,kind:'umbra', c:['#6C5CE7','#4F41C4'],a:'#FFB43C'},
 {id:'ket',n:'Kettolo Bunnyssimo',th:'กาต้มกระต่าย',r:3,kind:'kettle',c:['#F4F9FC','#CFD9DF'],a:'#FF9FD0'},
 {id:'mus',n:'Mushrino Owletto', th:'เห็ดนกฮูก',    r:3,kind:'shroom',c:['#D6206E','#A81555'],a:'#FFF1D6'},
 {id:'ban',n:'Bananini Croccolo',th:'กล้วยจอมงับ',  r:4,kind:'banana',c:['#FFD24F','#D9A400'],a:'#5DBE3E'},
 /* ---- เติมชุดพื้นฐานให้ตู้มีของหลากหลายขึ้น ---- */
 {id:'clo',n:'Nuvolino Sheepini', th:'เมฆแกะ',      r:1,kind:'cloudy',c:['#F4F9FC','#CFD9DF'],a:'#8FD8FF'},
 {id:'pen',n:'Pencilino Foxxo',   th:'ดินสอจิ้งจอก',r:1,kind:'pencil',c:['#FFB43C','#C87A00'],a:'#FF8A5B'},
 {id:'mel',n:'Melonini Pandolo',  th:'แตงโมแพนด้า', r:2,kind:'melon', c:['#5DBE3E','#3F9A26'],a:'#FF6B8A'},
 {id:'roc',n:'Rockettino Space',  th:'จรวดน้อย',    r:2,kind:'rocketp',c:['#F4F9FC','#8FD8FF'],a:'#E8543F'},
 {id:'cro',n:'Crownini Regalino', th:'มงกุฎจอมกวน', r:3,kind:'crown', c:['#FFD24F','#C87A00'],a:'#6C5CE7'},
 {id:'sta',n:'Stellina Brillino', th:'ดาวกะพริบ',   r:4,kind:'starry',c:['#FFC94F','#FF9F1C'],a:'#fff'},
 /* ---- ชุด OG brainrot : อยู่ในระดับหายากที่สุดสองระดับ ----
    วาดใหม่เป็นเวกเตอร์แบนตามสไตล์ของเว็บนี้ ไม่ได้ลอกภาพเรนเดอร์ต้นฉบับ
    ตัวไหนมีหัวเป็นเอกลักษณ์จะตั้ง nf:1 เพื่อไม่ให้วาดหน้ากลมมาตรฐานทับ */
 {id:'tri',n:'Trippi Troppi',      th:'กุ้งแมว',      r:5,kind:'shrimpcat',c:['#FF8A5B','#E8543F'],a:'#FFD98A',nf:1},
 {id:'bon',n:'Boneca Ambalabu',    th:'กบล้อยาง',    r:5,kind:'frogtire', c:['#5DBE3E','#3F9A26'],a:'#33404A',nf:1},
 {id:'chi',n:'Chimpanzini Bananini',th:'ลิงกล้วย',   r:5,kind:'monkeyban',c:['#FFD24F','#D9A400'],a:'#8A5A2B',nf:1},
 {id:'cap',n:'Ballerina Cappuccina',th:'บัลเลต์กาแฟ',r:5,kind:'cupdancer',c:['#F4F9FC','#CFD9DF'],a:'#8A5A2B',nf:1},
 {id:'tun',n:'Tung Tung Tung Sahur',th:'ท่อนไม้ตีกลอง',r:6,kind:'logbat',c:['#C89B63','#8A5A2B'],a:'#5E3A17',nf:1},
 {id:'tra',n:'Tralalero Tralala',  th:'ฉลามรองเท้า', r:6,kind:'sharksnk',c:['#4FA3D9','#2F7CB0'],a:'#fff',nf:1},
 {id:'bom',n:'Bombardiro Crocodilo',th:'จระเข้บินได้',r:6,kind:'crocplane',c:['#5DBE3E','#3F9A26'],a:'#8A5A2B',nf:1},
];
const TOY_BY_ID=Object.fromEntries(TOYS.map(t=>[t.id,t]));

/* ลำตัวของแต่ละตัว : วาดในกรอบ 100x100 โดยให้เท้าอยู่ที่ y=92 เสมอ
   ทุกตัวจึงยืนบนพื้นเส้นเดียวกันเวลาเอาไปเดินในพื้นหลัง */
const toyBody=(k,c,a)=>({
  cactus:`<rect x="-16" y="-30" width="32" height="62" rx="15" fill="${c[0]}"/>
    <rect x="-16" y="-30" width="12" height="62" rx="6" fill="${c[1]}" opacity=".45"/>
    <rect x="-30" y="-14" width="14" height="9" rx="4.5" fill="${c[0]}"/>
    <rect x="16" y="-22" width="14" height="9" rx="4.5" fill="${c[0]}"/>
    <circle cx="0" cy="-34" r="5" fill="${a}"/>`,
  toast:`<path d="M-19 -28q0 -10 8 -10t8 4h6q8 -4 8 6v56q0 4 -4 4h-22q-4 0 -4 -4z" fill="${c[0]}"/>
    <path d="M-13 -20h20v42h-20z" fill="${c[1]}" opacity=".4"/>
    <ellipse cx="4" cy="-6" rx="8" ry="6" fill="${a}" opacity=".55"/>`,
  sock:`<path d="M-12 -30h20q4 0 4 5v34l10 10q4 5 -2 9l-10 6q-6 3 -9 -3l-15 -22q-2 -3 -2 -8z" fill="${c[0]}"/>
    <rect x="-12" y="-30" width="24" height="11" rx="5" fill="${c[1]}"/>
    <rect x="-12" y="-8" width="24" height="6" fill="${a}" opacity=".6"/>`,
  donut:`<circle cx="0" cy="0" r="30" fill="${c[0]}"/><circle cx="0" cy="0" r="11" fill="#EAF9FF"/>
    <path d="M-30 -3q10 -9 20 -2t20 -3v8q-10 8 -20 2t-20 3z" fill="${c[1]}"/>
    ${[[-18,-16],[14,-18],[20,10],[-14,16],[2,-24]].map(([x,y])=>
      `<rect x="${x}" y="${y}" width="8" height="3.4" rx="1.7" fill="${a}" transform="rotate(${x*3} ${x} ${y})"/>`).join('')}`,
  teapot:`<ellipse cx="0" cy="4" rx="28" ry="24" fill="${c[0]}"/>
    <path d="M24 -2q14 2 12 14t-14 8" fill="none" stroke="${c[1]}" stroke-width="6" stroke-linecap="round"/>
    <path d="M-26 -4l-14 -8q-4 -2 -2 4l8 12z" fill="${c[1]}"/>
    <rect x="-9" y="-30" width="18" height="9" rx="4.5" fill="${c[1]}"/>
    <circle cx="0" cy="-32" r="5" fill="${a}"/>`,
  lamp:`<path d="M-22 -26h44l-8 26h-28z" fill="${c[0]}"/>
    <path d="M-22 -26h16l-4 26h-4z" fill="${c[1]}" opacity=".5"/>
    <rect x="-4" y="0" width="8" height="26" rx="3" fill="${c[1]}"/>
    <ellipse cx="0" cy="30" rx="18" ry="5" fill="${c[1]}"/>
    <circle cx="0" cy="4" r="6" fill="${a}" opacity=".85"/>`,
  umbra:`<path d="M-30 -6q4 -26 30 -26t30 26q-14 -6 -15 2 -1 -8 -15 -2 -14 -6 -15 2 -1 -8 -15 -2z" fill="${c[0]}"/>
    <path d="M0 -32v56q0 8 -9 8t-9 -6" fill="none" stroke="${c[1]}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="0" cy="-34" r="4" fill="${a}"/>`,
  kettle:`<path d="M-24 -6q0 -20 24 -20t24 20v14q0 12 -24 12t-24 -12z" fill="${c[0]}"/>
    <path d="M-24 -2l-13 -12q-4 -4 1 -6l14 8z" fill="${c[1]}"/>
    <path d="M-12 -26q12 -14 24 0" fill="none" stroke="${c[1]}" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="0" cy="-24" rx="7" ry="3.4" fill="${a}"/>`,
  shroom:`<path d="M-30 -2q0 -28 30 -28t30 28z" fill="${c[0]}"/>
    <rect x="-11" y="-4" width="22" height="34" rx="9" fill="${a}"/>
    ${[[-18,-12,5],[6,-16,6],[16,-6,4],[-6,-22,4.4]].map(([x,y,r])=>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="${a}" opacity=".9"/>`).join('')}
    <path d="M-30 -2q0 -12 8 -20 -2 12 2 20z" fill="${c[1]}" opacity=".5"/>`,
  banana:`<path d="M-24 18q-10 -34 10 -46t28 4q-4 22 -14 34t-24 8z" fill="${c[0]}"/>
    <path d="M-24 18q-6 -22 4 -34 -2 18 6 30z" fill="${c[1]}" opacity=".55"/>
    <path d="M12 -26l6 -8q3 -4 5 1l-4 9z" fill="${a}"/>
    <path d="M-18 12q10 6 22 -2 -4 12 -14 12t-8 -10z" fill="#fff" opacity=".85"/>`,
  cloudy:`<ellipse cx="-15" cy="4" rx="15" ry="12" fill="${c[0]}"/>
    <ellipse cx="6" cy="-6" rx="20" ry="17" fill="${c[0]}"/>
    <ellipse cx="21" cy="4" rx="14" ry="11" fill="${c[0]}"/>
    <rect x="-28" y="0" width="52" height="12" rx="6" fill="${c[0]}"/>
    <ellipse cx="6" cy="8" rx="24" ry="6" fill="${c[1]}" opacity=".5"/>
    <path d="M-8 -22q4 -7 10 -3" stroke="${a}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  pencil:`<path d="M-11 -34h22v50h-22z" fill="${c[0]}"/>
    <path d="M-11 -34h8v50h-8z" fill="${c[1]}" opacity=".5"/>
    <path d="M-11 16h22l-11 16z" fill="${a}"/>
    <path d="M-4.5 26h9l-4.5 6z" fill="#33404A"/>
    <rect x="-12" y="-40" width="24" height="8" rx="3" fill="#FF9FD0"/>`,
  melon:`<path d="M-28 -4a28 28 0 0 1 56 0v6a28 28 0 0 1 -56 0z" fill="${c[0]}"/>
    <path d="M-24 -2a24 24 0 0 1 48 0v4a24 24 0 0 1 -48 0z" fill="${a}"/>
    ${[-14,-4,6,16].map(x=>`<ellipse cx="${x}" cy="6" rx="2.4" ry="3.6" fill="#33404A"/>`).join('')}
    <path d="M-28 -4a28 28 0 0 1 56 0" fill="none" stroke="${c[1]}" stroke-width="5"/>`,
  rocketp:`<path d="M0 -38q13 12 13 30v14h-26v-14q0 -18 13 -30z" fill="${c[0]}"/>
    <path d="M0 -38q-13 12 -13 30v14h9v-44z" fill="${c[1]}" opacity=".55"/>
    <circle cx="0" cy="-12" r="7" fill="${c[1]}"/>
    <path d="M-13 0l-11 12h11z" fill="${a}"/><path d="M13 0l11 12h-11z" fill="${a}"/>
    <path d="M-7 6h14l-7 14z" fill="${a}" opacity=".85"/>`,
  crown:`<path d="M-26 10l-4 -36 14 12 16 -18 16 18 14 -12 -4 36z" fill="${c[0]}"/>
    <path d="M-26 10l-4 -36 14 12 6 -7v31z" fill="${c[1]}" opacity=".45"/>
    <rect x="-26" y="8" width="52" height="12" rx="4" fill="${c[1]}"/>
    <circle cx="-16" cy="-2" r="3.6" fill="${a}"/><circle cx="16" cy="-2" r="3.6" fill="${a}"/>
    <circle cx="0" cy="-6" r="4.4" fill="${a}"/>`,
  starry:`<path d="M0 -36 8.6 -12 34 -12 13.6 3 21.4 27 0 12 -21.4 27 -13.6 3 -34 -12 -8.6 -12z" fill="${c[0]}"/>
    <path d="M0 -36 8.6 -12 34 -12 13.6 3 0 -6z" fill="${c[1]}" opacity=".4"/>
    <circle cx="-14" cy="14" r="2.6" fill="${a}" opacity=".9"/>
    <circle cx="16" cy="12" r="2" fill="${a}" opacity=".8"/>`,
  /* ---- ชุด OG : มีหัวของตัวเอง (nf:1) จึงวาดตาและปากไว้ในนี้เลย ---- */
  shrimpcat:`<path d="M-26 8q-6 -22 8 -30t28 2q8 8 6 20t-14 16z" fill="${c[0]}"/>
    <path d="M-26 8q-4 -16 4 -24 -2 14 4 24z" fill="${c[1]}" opacity=".5"/>
    ${[0,1,2].map(i=>`<path d="M${-14+i*11} -20q5 -6 10 0" stroke="${c[1]}" stroke-width="2.6" fill="none"/>`).join('')}
    <path d="M-20 -22l-8 -14q-2 -5 3 -3l9 12z" fill="${c[1]}"/>
    <path d="M-6 -22l-3 -15q-1 -5 4 -2l3 13z" fill="${c[1]}"/>
    <circle cx="-8" cy="-8" r="3.2" fill="#22323C"/><circle cx="8" cy="-9" r="3.2" fill="#22323C"/>
    <path d="M-4 0q4 4 8 0" stroke="#22323C" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M20 6q10 4 12 14" stroke="${a}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  frogtire:`<circle cx="0" cy="4" r="27" fill="${a}"/><circle cx="0" cy="4" r="15" fill="#4A5A66"/>
    ${Array.from({length:8},(_,i)=>{const ang=i*45*Math.PI/180;
      return `<rect x="-2.4" y="-27" width="4.8" height="8" rx="2" fill="#5A6B78"
        transform="rotate(${i*45} 0 4)"/>`}).join('')}
    <ellipse cx="0" cy="-20" rx="20" ry="15" fill="${c[0]}"/>
    <circle cx="-11" cy="-30" r="8" fill="${c[0]}"/><circle cx="11" cy="-30" r="8" fill="${c[0]}"/>
    <circle cx="-11" cy="-31" r="5" fill="#fff"/><circle cx="11" cy="-31" r="5" fill="#fff"/>
    <circle cx="-10" cy="-30" r="2.6" fill="#22323C"/><circle cx="12" cy="-30" r="2.6" fill="#22323C"/>
    <path d="M-9 -16q9 6 18 0" stroke="#22323C" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  monkeyban:`<path d="M-20 16q-8 -28 8 -40t26 2q6 10 0 24t-18 16z" fill="${c[0]}"/>
    <path d="M-20 16q-5 -18 3 -28 -2 15 5 26z" fill="${c[1]}" opacity=".5"/>
    <path d="M10 -26l5 -8q3 -4 5 1l-4 8z" fill="#5DBE3E"/>
    <ellipse cx="-2" cy="-8" rx="13" ry="12" fill="${a}"/>
    <ellipse cx="-2" cy="-4" rx="9" ry="7" fill="#D9B08C"/>
    <circle cx="-14" cy="-12" r="5" fill="${a}"/><circle cx="10" cy="-12" r="5" fill="${a}"/>
    <circle cx="-6" cy="-11" r="2.6" fill="#22323C"/><circle cx="2" cy="-11" r="2.6" fill="#22323C"/>
    <path d="M-5 -2q3 3 6 0" stroke="#5E3A17" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  cupdancer:`<path d="M-16 -2h32l-4 22a6 6 0 0 1 -6 5h-12a6 6 0 0 1 -6 -5z" fill="${c[0]}"/>
    <path d="M-16 -2h12l-3 27h-3a6 6 0 0 1 -6 -5z" fill="${c[1]}" opacity=".5"/>
    <ellipse cx="0" cy="-2" rx="16" ry="5" fill="${a}"/>
    <path d="M16 4q10 1 9 9t-10 6" stroke="${c[1]}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="0" cy="-20" r="12" fill="${c[0]}"/>
    <path d="M-12 -22q4 -14 12 -14t12 14q-6 -5 -12 -5t-12 5z" fill="${a}"/>
    <circle cx="-4.5" cy="-20" r="2.4" fill="#22323C"/><circle cx="4.5" cy="-20" r="2.4" fill="#22323C"/>
    <path d="M-3 -14q3 3 6 0" stroke="#22323C" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M-22 22q-8 6 -6 14h56q2 -8 -6 -14z" fill="#FF9FD0" opacity=".9"/>`,
  logbat:`<rect x="-15" y="-34" width="30" height="58" rx="8" fill="${c[0]}"/>
    <rect x="-15" y="-34" width="11" height="58" rx="6" fill="${c[1]}" opacity=".5"/>
    <ellipse cx="0" cy="-34" rx="15" ry="6" fill="${a}"/>
    ${[-18,-6,8].map(y=>`<path d="M-15 ${y}q15 4 30 0" stroke="${c[1]}" stroke-width="1.8" fill="none" opacity=".6"/>`).join('')}
    <circle cx="-6" cy="-20" r="5.4" fill="#fff"/><circle cx="7" cy="-20" r="5.4" fill="#fff"/>
    <circle cx="-5" cy="-19" r="2.8" fill="#22323C"/><circle cx="8" cy="-19" r="2.8" fill="#22323C"/>
    <path d="M-7 -8q7 7 14 0" stroke="#22323C" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <rect x="18" y="-26" width="7" height="40" rx="3.5" fill="${a}" transform="rotate(18 21 -6)"/>`,
  sharksnk:`<path d="M-30 4q4 -26 26 -30t30 12q4 12 -6 20t-32 8z" fill="${c[0]}"/>
    <path d="M-30 4q3 -18 18 -25 -8 12 -8 25z" fill="${c[1]}" opacity=".45"/>
    <path d="M2 -30l6 -18q2 -6 6 0l4 16z" fill="${c[1]}"/>
    <path d="M-30 4q16 8 34 2 -4 8 -18 9t-16 -11z" fill="${a}"/>
    <path d="M-24 6q6 3 12 3 -2 4 -7 3z" fill="#fff"/>
    ${[0,1,2,3].map(i=>`<path d="M${-20+i*10} 7l4 6 4 -6z" fill="#fff"/>`).join('')}
    <circle cx="-4" cy="-14" r="5" fill="#fff"/><circle cx="-3" cy="-14" r="2.6" fill="#22323C"/>
    <path d="M22 -6q8 2 8 10" stroke="${c[1]}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  crocplane:`<path d="M-34 6q6 -16 26 -18t34 6q8 4 6 12t-16 10 -34 0 -16 -10z" fill="${c[0]}"/>
    <path d="M-34 6q5 -12 20 -15 -8 8 -9 15z" fill="${c[1]}" opacity=".45"/>
    <path d="M-30 -12l-14 -10q-4 -3 0 -6l16 8z" fill="${c[1]}"/>
    <path d="M-8 -14q10 -3 20 0" stroke="${c[1]}" stroke-width="3" fill="none"/>
    <path d="M-34 12q22 8 48 2 -4 8 -24 9t-24 -11z" fill="#CDEBB4"/>
    ${[0,1,2,3,4].map(i=>`<path d="M${-26+i*11} 13l4 6 4 -6z" fill="#fff"/>`).join('')}
    <circle cx="-16" cy="-16" r="6" fill="${c[0]}"/><circle cx="-15" cy="-17" r="3.4" fill="#fff"/>
    <circle cx="-14" cy="-17" r="1.8" fill="#22323C"/>
    <rect x="-6" y="-4" width="46" height="7" rx="3.5" fill="${a}" transform="rotate(-12 17 0)"/>
    <rect x="-40" y="0" width="34" height="6" rx="3" fill="${a}" transform="rotate(-12 -23 3)"/>
    <circle cx="30" cy="16" r="4.6" fill="#33404A"/>`,
}[k]||'');

/* ตัวละครหนึ่งตัว : ขา -> ลำตัว -> แขน -> หน้า
   หน้าตาใช้ชุดเดียวกันทุกตัว เพื่อให้ดูเป็นของสะสมชุดเดียวกัน
   คลาส .tw ครอบไว้ให้ CSS ทำท่าเดิน (เด้ง + เอียง) ชั้นเดียว ไม่ใช่ต่ออวัยวะ */
function toySvg(t,cls=''){
  const[c1,c2]=t.c;
  return `<svg class="toy${cls?' '+cls:''}" viewBox="-50 -56 100 106" aria-hidden="true">
    <ellipse cx="0" cy="46" rx="26" ry="4.5" fill="#123A4D" opacity=".16"/>
    <g class="tw">
      <rect x="-13" y="26" width="9" height="17" rx="4.5" fill="${c2}"/>
      <rect x="4" y="26" width="9" height="17" rx="4.5" fill="${c2}"/>
      <ellipse cx="-8.5" cy="43" rx="8" ry="4.4" fill="#33404A"/>
      <ellipse cx="8.5" cy="43" rx="8" ry="4.4" fill="#33404A"/>
      ${toyBody(t.kind,t.c,t.a)}
      <ellipse cx="-25" cy="6" rx="5.5" ry="9" fill="${c2}" transform="rotate(-16 -25 6)"/>
      <ellipse cx="25" cy="6" rx="5.5" ry="9" fill="${c2}" transform="rotate(16 25 6)"/>
      ${t.nf?'':`<g>
        <ellipse cx="-8" cy="-6" rx="7" ry="7.6" fill="#fff"/>
        <ellipse cx="8" cy="-6" rx="7" ry="7.6" fill="#fff"/>
        <circle cx="-7" cy="-4.5" r="3.4" fill="#22323C"/>
        <circle cx="9" cy="-4.5" r="3.4" fill="#22323C"/>
        <circle cx="-8.4" cy="-6.4" r="1.2" fill="#fff"/>
        <circle cx="7.6" cy="-6.4" r="1.2" fill="#fff"/>
        <path d="M-5 6q5 5 10 0" fill="none" stroke="#22323C" stroke-width="2.4" stroke-linecap="round"/>
        <ellipse cx="-17" cy="4" rx="4" ry="2.6" fill="#FF9FD0" opacity=".5"/>
        <ellipse cx="17" cy="4" rx="4" ry="2.6" fill="#FF9FD0" opacity=".5"/>
      </g>`}
    </g></svg>`;
}

/* เหรียญที่ได้ต่อรอบ : ผูกกับ "ทำได้ดีแค่ไหน" ไม่ใช่แค่ "เล่นจบ"
   แต่พื้นฐานต้องได้เสมอ เพราะหน้าสรุปสัญญาไว้ว่าเล่นจบได้รางวัลทุกครั้ง
   เด็กที่ทำได้น้อยจึงยังสะสมได้ ช้ากว่าเท่านั้น */
function coinsFor(){
  const wins=G.results.filter(Boolean).length;
  let c=10+wins*6;
  const rows=S.runStats?S.runStats.rows.filter(r=>r.v!=null):[];
  if(rows.length)c+=Math.round(mean(rows.map(r=>r.v))/4);
  c+=rows.filter(r=>r.record).length*12;
  return Math.max(10,Math.min(140,Math.round(c)));
}

/* สุ่มตามน้ำหนักของระดับความหายาก แล้วสุ่มตัวในระดับนั้น
   ระดับที่เด็กยังไม่มีตัวไหนเลยจะถูกหยิบก่อน เพื่อให้การหมุนแรก ๆ ได้ตัวใหม่
   (กันความรู้สึกแย่จากการได้ตัวซ้ำสามครั้งติดตอนยังมีของสะสมแค่ตัวเดียว) */
function rollToy(){
  const total=Object.values(RARITY).reduce((s,r)=>s+r.w,0);
  let x=Math.random()*total,tier=1;
  for(const k of Object.keys(RARITY)){x-=RARITY[k].w;if(x<=0){tier=+k;break}}
  const pool=TOYS.filter(t=>t.r===tier);
  const owned=S.p.toys||{};
  const fresh=pool.filter(t=>!owned[t.id]);
  const pick=(fresh.length?fresh:pool)[Math.floor(Math.random()*(fresh.length?fresh.length:pool.length))];
  return pick;
}

/* วงล้อตอนหมุน : ไล่ตัวอย่างของเล่นขึ้นไปเรื่อย ๆ แล้วค่อย ๆ ช้าลงจนหยุดที่ตัวที่ได้
   ตัวสุดท้ายของแถบคือผลจริง ผลถูกสุ่มไว้ตั้งแต่ตอนกดปุ่มแล้ว ไม่ได้สุ่มตอนหยุด
   ช่วงท้ายใช้ ease-out ยาว ๆ ให้รู้สึกลุ้น ไม่ใช่หยุดกึก
   ไม่มีการกะพริบถี่ในสเต็ปนี้ ด้วยเหตุผลเดียวกับพลุ (ดูหมายเหตุที่ hpFirework) */
function spinReel(win){
  const strip=[];
  for(let i=0;i<13;i++)strip.push(TOYS[Math.floor(Math.random()*TOYS.length)]);
  strip.push(win);
  return `<div class="rollout spinning">
    <div class="reelbox"><div class="reelstrip" style="--n:${strip.length}">
      ${strip.map(t=>`<div class="reelcell">${toySvg(t)}</div>`).join('')}
    </div><div class="reelfade"></div></div>
    <span>กำลังสุ่ม...</span></div>`;
}

SC.market=()=>{
  const p=S.p,owned=p.toys||{},nOwn=Object.keys(owned).length;
  const last=S.lastRoll;
  return `<div class="screen">
  <button class="back" data-go="home">${ico('arrow-left')} กลับไปที่เกาะ</button>
  <div class="kh"><span class="eyebrow">ร้านของสะสม</span>
    <h1>ตู้สุ่มของเล่นเพี้ยน</h1>
    <p>เล่นภารกิจให้ได้เหรียญ แล้วเอามาหมุนตู้ ของเล่นที่ได้จะออกไปเดินเล่นอยู่ในฉากหลัง</p></div>
  <div class="mkgrid">
    <div class="paper mkroll">
      <div class="coinrow">${ico('diamond')}<b>${p.coins||0}</b><span>เหรียญ</span></div>
      ${S.spinning?spinReel(S.spinning):
        last?`<div class="rollout ${last.dup?'dup':'new'} t${last.toy.r}">
        <div class="rayring">${Array.from({length:12},(_,i)=>
          `<i style="--a:${i*30}deg"></i>`).join('')}</div>
        ${toySvg(last.toy,'xl')}
        <b>${last.toy.n}</b><span>${last.toy.th}</span>
        <span class="rtag" style="--rc:${RARITY[last.toy.r].col}">${RARITY[last.toy.r].th}</span>
        <em>${last.dup?`มีตัวนี้แล้ว คืนเหรียญให้ +${RARITY[last.toy.r].back}`:'ได้ตัวใหม่แล้ว!'}</em>
      </div>`:`<div class="rollout idle"><div class="capsule">${ico('sparkle')}</div>
        <span>กดหมุนเพื่อสุ่มของเล่นหนึ่งตัว</span></div>`}
      <button class="big" data-roll="1" ${S.spinning||(p.coins||0)<ROLL_COST?'disabled':''}>
        ${ico('sparkle')} ${S.spinning?'กำลังหมุน...':`หมุน ${ROLL_COST} เหรียญ`}</button>
      ${(p.coins||0)<ROLL_COST?`<p class="mkhint">ยังไม่พอ เล่นอีกหนึ่งภารกิจก็ได้เพิ่มแล้ว</p>`:''}
    </div>
    <div class="paper mkbook">
      <b>สมุดของสะสม <i>${nOwn}/${TOYS.length}</i></b>
      <div class="toygrid">
        ${TOYS.map(t=>{const have=owned[t.id];
          return `<div class="toycard ${have?'have':'miss'}" style="--rc:${RARITY[t.r].col}">
            <div class="toypic">${have?toySvg(t):`<span class="qm">?</span>`}</div>
            <b>${have?t.th:'ยังไม่พบ'}</b>
            <span>${have?t.n:RARITY[t.r].th}</span>
            ${have>1?`<i class="dupn">x${have}</i>`:''}</div>`}).join('')}
      </div>
    </div>
  </div></div>`;
};

/* วาดชั้นของเล่นที่เดินอยู่ในพื้นหลัง
   สร้างใหม่เฉพาะเมื่อ "ชุดที่ครอบครอง" เปลี่ยน ไม่ใช่ทุกครั้งที่เปลี่ยนหน้า
   ถ้าสร้างใหม่ทุกครั้ง animation จะรีสตาร์ต ตัวละครจะกระโดดกลับไปตั้งต้นทุกครั้งที่กดปุ่ม */
function paintToys(){
  const layer=$('toylayer');if(!layer)return;
  const owned=(S.p&&S.p.toys)||{};
  const sig=Object.keys(owned).sort().join(',');
  if(layer.dataset.sig===sig)return;
  layer.dataset.sig=sig;
  /* จำกัดจำนวนตัวที่เดินพร้อมกัน — ของเล่นหนึ่งตัวกิน 2 animation
     สะสมครบ 23 ตัวจะกลายเป็น 46 ตัวบวกกับฉากเดิม ซึ่งเคยวัดแล้วว่าเริ่มกินเฟรม
     เลือกโชว์ตัวที่หายากที่สุดที่มี เพราะนั่นคือของที่เด็กอยากอวด
     ทุกตัวยังเห็นได้ครบในสมุดของสะสมที่หน้าร้าน */
  const ids=TOYS.filter(t=>owned[t.id])
    .sort((a,b)=>b.r-a.r).slice(0,TOY_SHOWCASE).map(t=>t.id),n=ids.length;
  layer.innerHTML=ids.map((id,i)=>{
    const t=TOY_BY_ID[id];
    const dur=26+(i%5)*7, dly=-(i*4.6)%dur, dir=i%2?'rl':'lr';
    const bottom=6+(i%4)*5, size=58+(t.r*7);
    /* --park = ที่จอดตอนปิด animation ใช้กฎ CSS เดียวคุมทุกตัว
       กระจายตามจำนวนที่มีจริง ไม่ใช่ระยะคงที่ต่อตัว ไม่งั้นพอสะสมครบ
       ตัวท้าย ๆ จะถูกดันออกนอกจอและเด็กจะไม่เห็นของที่อุตส่าห์สุ่มมาได้ */
    const park=n>1?(6+i/(n-1)*80).toFixed(1):40;
    return `<div class="toywalk ${dir}" style="--d:${dur}s;--dly:${dly}s;
      --park:${park}%;bottom:${bottom}%;width:${size}px">${toySvg(t)}</div>`;
  }).join('');
}

SC.reward=()=>{
  const ok=G.results.filter(Boolean).length,n=G.results.length;
  return `<div class="center screen"><div style="width:100%;max-width:560px;text-align:center">
  <div class="rewardmark">${ico('sprout')}</div>
  <div class="kh" style="text-align:center"><h1>ภารกิจวันนี้สำเร็จแล้ว</h1>
    <p style="margin:var(--s2) auto 0">${n?({
      shape :`${S.p.nick}หยิบรูปทรงใส่ช่องได้ถูก ${ok} ครั้งจาก ${n} ครั้ง`,
      rocket :`จรวดของ${S.p.nick}ผ่านห่วงได้ ${ok} ชุดจาก ${n} ชุด`,
      monster:`${S.p.nick}ป้อนอาหารได้ตรงจังหวะ ${ok} ครั้งจาก ${n} ครั้ง`,
      garden :`${S.p.nick}ปลูกต้นไม้ได้ ${ok} ต้นจาก ${n} ท่ามือ`,
      trek   :`${S.p.nick}เก็บสมบัติเข้าหีบได้ ${ok} ชิ้นจาก ${n} ชิ้น`,
      cook   :`${S.p.nick}ทำอาหารสำเร็จ ${ok} ขั้นตอนจาก ${n} ขั้นตอน`,
      quest  :`${S.p.nick}ผ่านสถานีบนเกาะได้ ${ok} สถานีจาก ${n} สถานี`
    }[S.lastGame]||`${S.p.nick}ช่วยสัตว์ได้ ${ok} ตัวจาก ${n} ครั้ง`):'เก่งมาก แล้วพรุ่งนี้มาเล่นกันใหม่'} ได้เมล็ดพันธุ์ไปปลูกในสวนแล้ว</p></div>
  ${S.unlocked?`<div class="unlock">${ico('flag')}<div>
    <b>ปลดล็อกด่าน ${S.p.level} แล้ว</b>
    <span>${LEVELS[S.p.level-1].th} · ${LEVELS[S.p.level-1].modes[S.p.mode].name}</span></div></div>`:''}
  ${S.coinGain?`<div class="coinwin">${ico('diamond')}<div>
    <b>ได้ ${S.coinGain} เหรียญ</b>
    <span>รวมมีอยู่ ${S.p.coins} เหรียญ · ${(S.p.coins>=ROLL_COST)?'พอหมุนตู้ของเล่นแล้ว':`อีก ${ROLL_COST-S.p.coins} เหรียญจะหมุนตู้ได้`}</span></div>
    <button class="mkgo" data-go="market">ไปที่ร้าน</button></div>`:''}
  ${S.runStats?`<div class="paper statcard" style="margin:var(--s4) 0;text-align:left">
    <b>ความก้าวหน้าของด่าน ${S.runStats.level}</b>
    <small>รอบที่ ${S.runStats.runs} ของด่านนี้ · แท่งคือคะแนนรอบนี้ ขีดคือสถิติที่ดีที่สุดก่อนรอบนี้</small>
    ${statBars(S.runStats.rows)}</div>`:''}
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
/* ภาพเคลื่อนไหว: ค่าปกติตามค่า prefers-reduced-motion ของเครื่อง
   ผู้ใช้กดปุ่มมุมขวาล่างเพื่อบังคับเปิด/ปิดเองได้ และจำค่าไว้ (?motion=1 / 0 ก็ได้)
   ไม่ตั้งค่าเริ่มต้นเป็นเปิดเสมอ เพราะเด็ก CP บางคนไวต่อการเคลื่อนไหวและแสงกะพริบ */
const MOTION_KEY='rehaverse.motion';
(function motionPref(){
  const q=new URLSearchParams(location.search).get('motion');
  let v=null;try{v=localStorage.getItem(MOTION_KEY)}catch(e){}
  if(q==='1')v='on'; else if(q==='0')v='off'; else if(q==='auto')v=null;
  if(v==='on'||v==='off'){
    document.documentElement.dataset.motion=v;
    try{localStorage.setItem(MOTION_KEY,v)}catch(e){}
  }else{
    delete document.documentElement.dataset.motion;
    try{localStorage.removeItem(MOTION_KEY)}catch(e){}
  }
})();
function stillMode(){
  const m=document.documentElement.dataset.motion;
  if(m==='on')return false;
  if(m==='off')return true;
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function paintMotionBtn(){
  const b=$('motionbtn');if(!b)return;
  const on=!stillMode();
  b.innerHTML=ico(on?'sparkle':'moon');
  b.classList.toggle('off',!on);
  b.setAttribute('aria-pressed',String(on));
  const label=on?'ปิดภาพเคลื่อนไหว':'เปิดภาพเคลื่อนไหว';
  b.setAttribute('aria-label',label);b.title=label;
}

function paint(){
  cancelAnimationFrame(G.raf);cancelAnimationFrame(SH.raf);
  cancelAnimationFrame(R.raf);cancelAnimationFrame(TM.raf);cancelAnimationFrame(GD.raf);cancelAnimationFrame(TK.raf);cancelAnimationFrame(CK.raf);cancelAnimationFrame(QS.raf);
  /* ออกจากด่านกล้องเมื่อไร ปิดกล้องทันที ไฟกล้องจะได้ไม่ค้างติด */
  /* ล้าง callback ทุกครั้ง เพราะมันชี้ไปที่ DOM ของหน้าเดิมที่กำลังจะถูกเขียนทับ
     ฟังก์ชัน mount ของหน้าใหม่จะลงทะเบียนใหม่เองถ้าหน้านั้นใช้กล้อง */
  HT.onstate=null;
  if(!camScreen())HT.stop();
  /* แถบกราฟสดถือ ref ไปที่ DOM ของหน้าเดิม ต้องปลดก่อนเขียนทับ
     mount ใหม่อยู่ท้ายฟังก์ชัน หลังจาก mount ของเกมตั้ง S.lastGame แล้ว */
  LIVE.stop();
  /* บอกโซนและชื่อหน้าปัจจุบันให้ CSS รู้ โซนใช้ตาราง ZONES ตัวเดียวกับม่านเปลี่ยนหน้า
     ฉากพื้นหลังจะหรี่ลงในโซน play เพราะแผนที่และจอเกมมีภาพของตัวเองอยู่แล้ว
     ต้องมี data-screen แยกด้วย เพราะหน้าสรุปอยู่โซน play แต่ควรได้ฉากเต็ม
     (ย้าย reward ออกจากโซน play ใน ZONES ไม่ได้ เดี๋ยวม่านจะกลับมาขึ้นตอน
      แผนที่ -> ด่าน -> สรุป -> แผนที่ ซึ่งเป็นสิ่งที่เพิ่งเอาออกไป) */
  document.body.dataset.zone=zoneOf(S.screen);
  document.body.dataset.screen=S.screen;
  paintToys();                                    // มี guard ภายใน ไม่วาดซ้ำถ้าของสะสมไม่เปลี่ยน
  $('root').innerHTML=SC[S.screen]();
  topbar();
  if(S.screen==='game')mountGame();
  if(S.screen==='shape')mountShape();
  if(S.screen==='rocket')mountRocket();
  if(S.screen==='monster')mountMonster();
  if(S.screen==='garden')mountGarden();
  if(S.screen==='trek')mountTrek();
  if(S.screen==='cook')mountCook();
  if(S.screen==='quest')mountQuest();
  if(S.screen==='home')mountRoad();
  /* ต้องอยู่หลัง mount ของเกม เพราะอ่าน S.lastGame กับ S.runFrom ที่ mount ตั้งไว้
     ตัวมันเช็ค .gbar เอง หน้าที่ไม่ใช่จอเกมจึงไม่มีอะไรเกิดขึ้น */
  LIVE.mount();
  window.scrollTo({top:0,behavior:'instant'});
}
/* เปลี่ยนหน้าด้วยม่าน : สลับเนื้อหาตอนที่ม่านบังจออยู่ จึงไม่เห็นการกระพริบ
   ใช้ timer แทน animationend เพราะถ้า animation ถูกปิด event จะไม่ยิงแล้วค้าง
   สุ่มรูปแบบและสีทุกครั้ง แต่ไม่ซ้ำอันเดิมติดกัน จะได้ไม่จำเจ */
const WIPE=300;
const WIPE_STYLES=['curtain','iris','doors','blob','stripes'];
const WIPE_TINTS=['var(--grape)','var(--sun)','var(--berry)','var(--aqua)','var(--grass)'];
/* ม่านขึ้นเฉพาะตอน "ข้ามหมวด" ไม่ใช่ทุกครั้งที่เปลี่ยนหน้า
   เดิมทุกการเปลี่ยนหน้ามีม่านหมด รอบเล่นหนึ่งรอบ (แผนที่ -> ด่าน -> สรุป -> แผนที่)
   จึงเจอม่านสามครั้ง ซึ่งถี่เกินไปจนกลายเป็นสิ่งกวนใจแทนที่จะช่วยเล่าเรื่อง
   หน้าที่อยู่หมวดเดียวกันสลับทันทีด้วย paint()
   หน้าไหนไม่ได้ระบุไว้ถือเป็นหมวด play ทั้งหมด (แผนที่ ด่านทั้งแปด และหน้าสรุป)
   ถ้าอยากให้ตอนเข้าด่านมีม่านด้วย ย้ายชื่อหน้าเกมออกมาเป็นหมวดของตัวเองในตารางนี้ */
const ZONES={landing:'intro',login:'login',pick:'login',code:'login',
  toy:'setup',mode:'setup',dash:'pro',editor:'pro'};
const zoneOf=s=>ZONES[s]||'play';
let prevScreen=null,wiping=false,lastWipe=-1,lastTint=-1;
const pickNot=(n,last)=>{let i;do{i=Math.floor(Math.random()*n)}while(n>1&&i===last);return i};
function render(){
  const changed=prevScreen!==null&&zoneOf(S.screen)!==zoneOf(prevScreen);
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

/* จบรอบการเล่น -> ปลดล็อกด่านถัดไปถ้าทำสำเร็จอย่างน้อยหนึ่งครั้ง
   เกณฑ์ต่ำโดยตั้งใจ ให้ตรงกับหน้าสรุปที่บอกว่า "เล่นจบได้เมล็ดพันธุ์เสมอ"
   เด็กที่ทำได้ครั้งเดียวก็ควรได้เห็นด่านถัดไป ไม่ใช่ต้องทำถูกทุกครั้งก่อน
   ก่อนหน้านี้ไม่มีอะไรเพิ่ม p.level เลย แผนที่จึงล็อกค้างอยู่ที่ค่าในแฟ้มตลอด */
function goReward(){
  S.unlocked=false;
  /* ต้องเก็บสถิติก่อนบล็อกปลดล็อกด้านล่าง เพราะบล็อกนั้นเขียน S.sel ใหม่
     ถ้าสลับลำดับ คะแนนจะไปลงด่านที่เพิ่งปลดล็อก ไม่ใช่ด่านที่เพิ่งเล่นจบ */
  commitStats();
  /* ให้เหรียญหลัง commitStats เพราะสูตรอ่านจาก S.runStats (สถิติใหม่ = โบนัส) */
  S.coinGain=0;
  if(S.p){
    S.coinGain=coinsFor();
    S.p.coins=(S.p.coins||0)+S.coinGain;
    /* โหมด toy เล่นที่ตัวของเล่น ไม่มีผลบนจอให้ตัดสิน จึงถือว่าเล่นจบคือผ่าน */
    const won=S.p.mode==='toy'?1:G.results.filter(Boolean).length;
    if(won>=1&&S.sel>=S.p.level&&S.p.level<LEVELS.length){
      S.p.level=Math.min(LEVELS.length,S.sel+1);
      S.sel=S.p.level;S.unlocked=true;
    }
    /* บันทึกครั้งเดียวตรงนี้ ครอบคลุมทั้งเหรียญ ด่านที่ปลดล็อก และสถิติ
       เดิมบันทึกเฉพาะตอนปลดล็อกด่าน ส่วน commitStats() ก็บันทึกก่อนบวกเหรียญ
       จบรอบที่ไม่ได้ปลดล็อกอะไรจึงได้เหรียญแค่ในหน่วยความจำ แล้วหายตอนรีเฟรช */
    saveStore();
  }
  S.screen='reward';render();
}

document.addEventListener('click',e=>{
  const go=e.target.closest('[data-go]');
  if(go){const t=go.dataset.go;
    if(t==='reward'){goReward();return}
    if(t==='login'){S.screen='login';S.p=null}else S.screen=t;
    render();return;}
  /* หมุนตู้ : หักเหรียญ -> สุ่ม -> บันทึก -> วาดชั้นของเล่นใหม่
     ใช้ paint() ไม่ใช่ render() จะได้ไม่มีม่านคั่นระหว่างหมุนติด ๆ กัน */
  if(e.target.closest('[data-roll]')){
    if(!S.p||S.spinning||(S.p.coins||0)<ROLL_COST)return;
    S.p.coins-=ROLL_COST;
    if(!S.p.toys)S.p.toys={};
    /* สุ่มผลทันทีตั้งแต่กด แล้วค่อยเล่นภาพหมุนให้ดู
       ถ้าสุ่มตอนวงล้อหยุด ผลจะขึ้นกับจังหวะการเรนเดอร์ ซึ่งไม่ควร */
    const t=rollToy(),dup=!!S.p.toys[t.id];
    S.p.toys[t.id]=(S.p.toys[t.id]||0)+1;
    if(dup)S.p.coins+=RARITY[t.r].back;
    S.lastRoll={toy:t,dup,at:Date.now()};
    saveStore();
    /* ปิดภาพเคลื่อนไหวอยู่ = เฉลยเลย ไม่ต้องรอวงล้อที่ไม่หมุน */
    if(stillMode()){paint();return}
    S.spinning=t;paint();
    setTimeout(()=>{S.spinning=null;if(S.screen==='market')paint()},SPIN_MS);
    return;
  }
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

/* ==========================================================================
   ฉากพื้นหลังของเว็บ — ชั้นที่อยู่หลังกล่อง UI ทั้งหมด (.scene ใน index.html)
   --------------------------------------------------------------------------
   เดิมชั้นนี้มีแค่ดวงอาทิตย์ เมฆสี่ก้อน และแถบเนินเขียวเปล่า ๆ สามแถบ
   คนละอันกับฉากในกรอบแผนที่ด่าน (roadScene) ซึ่งอยู่ในการ์ดของตัวเอง

   ข้อจำกัดที่กำหนดว่าอะไรวางได้ที่ไหน
   1) ชั้นนี้ position:fixed จึงอยู่หลัง "ทุกหน้า" ของฝั่งเด็ก รวมถึงจอเกมทั้งแปด
      ของประดับจึงต้องเงียบพอที่จะไม่แย่งความสนใจจากการ์ดและจากตัวเกม
   2) หัวเรื่องวางทับพื้นหลังนี้ตรง ๆ (ตัวอักษรขาวบนฟ้าอ่อนวัดได้ 1.52:1
      จึงต้องใช้ --ink + เงาขาว) ของประดับต้องเลี่ยงแถบกลางบนที่หัวเรื่องลง
      เก็บไว้ริมขอบและด้านล่างเท่านั้น
   3) ของที่ไถลข้ามจอต้องมีตำแหน่งสำรองตอนปิด animation เหมือนเมฆ .c1–.c4
      นก/บอลลูนที่นี่จึงเคลื่อนเป็นวงกลับที่เดิม ไม่ไถลข้ามจอ จะได้ไม่ต้องมีสำรอง

   ของบนเนิน "นิ่งทั้งหมด" โดยตั้งใจ : ชั้นนี้แสดงอยู่ตลอดเวลาทุกหน้า
   ถ้าให้ไหวด้วยจะเสีย animation ทิ้งไว้ตลอดการใช้งาน ทั้งที่เป็นฉากไกล
   ความมีชีวิตมาจากนก บอลลูน และเมฆ ซึ่งใช้ animation รวมกันไม่ถึงสิบตัว
   ========================================================================== */
/* กระจุกต้นไม้/พุ่ม/ดอกไม้บนไหล่เนิน — ประกอบจากตัวช่วยชุดเดียวกับฉากแผนที่
   ไม่วาดซ้ำในไฟล์ index.html เพราะสองชุดจะเพี้ยนออกจากกันเมื่อแก้ทีหลัง */
const hpCluster=v=>[
  scTree(38,88,1.05,0,0,'')+scTree(120,88,.8,1,0,'')+scBush(74,89,.9,0)
   +scFlower(16,88,.95,0,0)+scFlower(96,88,.85,2,0)+scFlower(152,88,.9,4,0)
   +scTuft(58,89,.9,0)+scTuft(136,89,.8,0),
  scTree(64,88,1.15,1,0,'')+scBush(24,89,1,0)+scBush(126,89,.85,0)
   +scFlower(44,88,.9,1,0)+scFlower(104,88,.95,3,0)+scFlower(160,88,.8,0,0)
   +scTuft(12,89,.85,0)+scTuft(88,89,.9,0),
  scTree(30,88,.9,1,0,'')+scTree(104,88,1.1,0,0,'')+scTree(154,88,.75,1,0,'')
   +scBush(66,89,.95,0)+scFlower(80,88,.9,2,0)+scFlower(130,88,.85,4,0)
   +scTuft(46,89,.9,0)+scTuft(120,89,.8,0),
][v];

/* ---- ระบบกลางวัน–กลางคืน ----
   วงรอบเดียว 360 วิ : กลางวัน -> พลบ -> กลางคืนเต็มที่นาทีที่ 3 (50%) -> รุ่งสาง -> กลางวัน
   ทุกชิ้นที่ต้องรู้เวลา (ม่านคืน ดาว พระจันทร์ ดวงอาทิตย์ ไฟบ้าน พลุ) ใช้ duration
   360s เท่ากันหมด จึงตรงกันเองโดยไม่ต้องมี timer ใน JS คอยสั่ง
   ผลพลอยได้ที่สำคัญ : ปิด animation แล้วทุกอย่างค้างที่ 0% = กลางวันเสมอ
   ไม่มีพลุ ไม่มีท้องฟ้ามืดค้าง จึงไม่ต้องเขียนตำแหน่งสำรองให้ระบบนี้เลย */
const DAYNIGHT_S=360;
/* ดาว : สุ่มครั้งเดียวตอนสร้าง ไม่ให้กระพริบทีละดวง (กระพริบ = ต้นทุน animation ต่อดวง)
   ใช้ค่าคงที่แบบ deterministic เพื่อให้ตำแหน่งเดิมทุกครั้งที่โหลด */
const hpStars=()=>{const r=mulberry32(20260730);let s='';
  for(let i=0;i<64;i++){const x=r()*100,y=r()*58,rad=(r()*1.3+.5).toFixed(2),o=(r()*.55+.35).toFixed(2);
    s+=`<circle cx="${x.toFixed(2)}%" cy="${y.toFixed(2)}%" r="${rad}" fill="#fff" opacity="${o}"/>`}
  return s};

/* พลุ : บานช้าแล้วจางหาย ไม่ใช่แฟลชกระพริบ
   ผู้ใช้จริงคือเด็กสมองพิการ ซึ่งมีภาวะลมชักร่วมราวหนึ่งในสาม แสงวาบถี่ ๆ จึงเป็นความเสี่ยง
   แต่ละดอกใช้เวลาบานและจางรวมเกือบสองวินาที และทั้งจอมีไม่เกินสองดอกพร้อมกัน
   อัตราการวาบจึงต่ำกว่าเกณฑ์ WCAG 2.3.1 (สามครั้งต่อวินาที) อยู่มาก
   และพลุถูกปิดสนิทในโซนเล่น เด็กจะได้ไม่เสียสมาธิระหว่างทำภารกิจ */
const hpFirework=(x,y,s,c1,c2,i)=>`<svg class="fw f${i}" aria-hidden="true"
  style="left:${x}%;top:${y}%;width:${s}px" viewBox="-50 -50 100 100">
  <g class="fw-burst">
    ${Array.from({length:12},(_,k)=>{const a=k*30*Math.PI/180;
      return `<line x1="${(Math.cos(a)*12).toFixed(1)}" y1="${(Math.sin(a)*12).toFixed(1)}"
        x2="${(Math.cos(a)*40).toFixed(1)}" y2="${(Math.sin(a)*40).toFixed(1)}"
        stroke="${k%2?c1:c2}" stroke-width="2.6" stroke-linecap="round"/>`}).join('')}
    ${Array.from({length:12},(_,k)=>{const a=(k*30+15)*Math.PI/180;
      return `<circle cx="${(Math.cos(a)*33).toFixed(1)}" cy="${(Math.sin(a)*33).toFixed(1)}"
        r="2.4" fill="${k%2?c2:c1}"/>`}).join('')}
    <circle r="4" fill="#fff" opacity=".9"/>
  </g></svg>`;

/* เครื่องบิน : ลำเล็กพร้อมควันจาง ๆ ข้ามฟ้าไปทางขวา */
const hpPlane=()=>`<svg class="plane" viewBox="0 0 120 34" aria-hidden="true">
  <path d="M2 19 q30 -3 58 -4" stroke="#fff" stroke-width="4" fill="none"
    stroke-linecap="round" opacity=".38"/>
  <path d="M32 20 q18 -4 34 -5" stroke="#fff" stroke-width="5.5" fill="none"
    stroke-linecap="round" opacity=".22"/>
  <path d="M66 14 l24 1 q10 .5 12 3.5 -2 3 -12 3.5 l-24 1 -8 -4.5z" fill="#F4F9FC"/>
  <path d="M74 15 l-7 -9 h6 l11 9z" fill="#DCEAF1"/>
  <path d="M74 21 l-7 9 h6 l11 -9z" fill="#C9DDE7"/>
  <path d="M96 16 h7 l4 3 -4 3 h-7z" fill="#8FD8FF"/>
  <circle cx="88" cy="19" r="1.5" fill="#5E7C8B"/><circle cx="82" cy="19" r="1.5" fill="#5E7C8B"/>
</svg>`;

/* กระท่อมบนเนิน : หน้าต่างสว่างเป็นสีส้มอุ่นตอนกลางคืน ผูกกับวงรอบ 360 วิเดียวกัน
   เป็นวิธีบอกเวลาที่อ่านง่ายกว่าท้องฟ้าอย่างเดียว โดยไม่ต้องเพิ่มแสงวาบ */
const hpHouse=(w,roof)=>`<g>
  <ellipse cx="0" cy="30" rx="34" ry="4.5" fill="#2E7D1C" opacity=".2"/>
  <rect x="-24" y="-2" width="48" height="32" rx="3" fill="${w}"/>
  <path d="M-30 -2 L0 -26 L30 -2z" fill="${roof}"/>
  <path d="M-30 -2 L0 -26 L0 -2z" fill="#000" opacity=".07"/>
  <rect x="12" y="-24" width="8" height="12" rx="2" fill="${roof}"/>
  <rect x="-6" y="10" width="12" height="20" rx="1.5" fill="#8A5A2B"/>
  <circle cx="3" cy="20" r="1.2" fill="#FFD98A"/>
  <g><rect x="-19" y="4" width="11" height="10" rx="1.5" fill="#3E5A68"/>
     <rect class="lit" x="-19" y="4" width="11" height="10" rx="1.5" fill="#FFC94F"/>
     <rect x="-19" y="4" width="11" height="10" rx="1.5" fill="none" stroke="${roof}" stroke-width="1.6"/></g>
  <g><rect x="9" y="4" width="11" height="10" rx="1.5" fill="#3E5A68"/>
     <rect class="lit" x="9" y="4" width="11" height="10" rx="1.5" fill="#FFC94F"/>
     <rect x="9" y="4" width="11" height="10" rx="1.5" fill="none" stroke="${roof}" stroke-width="1.6"/></g>
</g>`;

/* รถบนถนนชนบทหลังแนวต้นไม้ */
const hpCar=(body,roof)=>`<svg class="gcar" viewBox="0 0 44 26" aria-hidden="true">
  <ellipse cx="22" cy="22" rx="17" ry="3" fill="#2E7D1C" opacity=".22"/>
  <path d="M13 10 q2 -7 6 -7h7q4 0 6 7z" fill="${roof}"/>
  <rect x="5" y="10" width="34" height="10" rx="4.4" fill="${body}"/>
  <rect x="5" y="13" width="34" height="3" rx="1.5" fill="#000" opacity=".08"/>
  <circle cx="35" cy="14" r="1.8" fill="#FFF1D6"/>
  <circle cx="13" cy="20" r="3.8" fill="#33404A"/><circle cx="13" cy="20" r="1.6" fill="#CFD9DF"/>
  <circle cx="31" cy="20" r="3.8" fill="#33404A"/><circle cx="31" cy="20" r="1.6" fill="#CFD9DF"/>
</svg>`;

/* นกสามตัวบินเป็นฝูง : ทั้งฝูงวนเป็นวงรีกลับมาที่เดิม ปีกกระพือแยกอีกชั้น
   รวมสอง animation ต่อฝูง ไม่ใช่ต่อตัว */
const hpBird=(x,y,s,i)=>`<g transform="translate(${x} ${y}) scale(${s})">
  <path class="hp-wing b${i}" d="M-9 0 Q-4.5 -5 0 0 Q4.5 -5 9 0" fill="none"
    stroke="#5E7C8B" stroke-width="2.2" stroke-linecap="round" opacity=".75"/></g>`;

/* บอลลูน : ลอยขึ้นลงและเอนเล็กน้อยอยู่กับที่ ไม่ลอยข้ามจอ */
const hpBalloon=()=>`<svg class="balloon" viewBox="0 0 70 100" aria-hidden="true">
  <g class="hp-float">
    <path d="M35 4C50 4 60 17 60 30 60 45 46 58 35 68 24 58 10 45 10 30 10 17 20 4 35 4Z" fill="#FF9FD0"/>
    <path d="M35 4C42 4 47 17 47 30 47 45 41 58 35 68 35 58 35 17 35 4Z" fill="#FFC2DA" opacity=".85"/>
    <path d="M22 8C27 18 27 52 30 66 24 57 12 44 12 30 12 21 16 12 22 8Z" fill="#E8548F" opacity=".55"/>
    <path d="M28 68h14l-2 6H30z" fill="#C87A00"/>
    <path d="M30 74h10v8a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2z" fill="#A9743C"/>
    <path d="M31 74 34 68 M39 74 36 68" stroke="#8A5A2B" stroke-width="1.2" fill="none"/>
  </g></svg>`;

/* ตำแหน่งกระจุกบนเนิน : left/bottom เป็น % จึงเลื่อนตามความสูงของแถบเนินเสมอ
   (แถบเนินสูง min(30vh,250px) เปลี่ยนตามจอ ถ้าใช้ px ต้นไม้จะลอยหลุดสันเนิน) */
const HP_POS=[[1,9,150,0],[12,13,120,1],[23,8,165,2],[34,12,130,0],[45,9,155,1],
              [56,13,125,2],[67,8,160,0],[78,12,135,1],[88,9,150,2],[95,14,115,0]];
function mountPageScene(){
  const sc=document.querySelector('.scene');
  if(!sc||sc.dataset.props)return;                 // ผูกครั้งเดียว .scene อยู่นอก #root
  sc.dataset.props='1';
  const props=HP_POS.map(([l,b,w,v])=>`<svg class="hp" viewBox="0 0 180 96"
    style="left:${l}%;bottom:${b}%;width:${w}px" aria-hidden="true">${hpCluster(v)}</svg>`).join('');
  const flock=`<svg class="flock" viewBox="0 0 120 60" aria-hidden="true"><g class="hp-circle">
    ${hpBird(24,30,1,1)}${hpBird(60,18,.8,2)}${hpBird(86,38,.9,3)}</g></svg>`;
  /* เมฆเพิ่มอีกสองก้อนใช้คลาสเดิม .cl จึงได้ drift/wave และตำแหน่งสำรองชุดเดียวกัน */
  const clouds=`<span class="cl c5"><i></i></span><span class="cl c6"><i></i></span>`;
  /* ม่านกลางคืน : วางไว้ "หน้า" ท้องฟ้าแต่ "หลัง" ของประดับทุกชิ้น
     ดาวอยู่ในม่านเดียวกัน จึงจางเข้าออกพร้อมกันโดยไม่ต้องมี animation ของตัวเอง */
  const night=`<svg class="nightsky" preserveAspectRatio="none" aria-hidden="true">
    <rect width="100%" height="100%" fill="url(#nightgrad)"/>
    <defs><linearGradient id="nightgrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#132A4D"/><stop offset="55%" stop-color="#27406B"/>
      <stop offset="100%" stop-color="#3C5580"/></linearGradient></defs>
    ${hpStars()}</svg>
    <svg class="moon" viewBox="0 0 90 90" aria-hidden="true">
      <circle cx="45" cy="45" r="27" fill="#FFF6D6"/>
      <circle cx="36" cy="38" r="4.5" fill="#EADFB8" opacity=".8"/>
      <circle cx="53" cy="52" r="6" fill="#EADFB8" opacity=".65"/>
      <circle cx="52" cy="33" r="3" fill="#EADFB8" opacity=".7"/>
    </svg>`;
  const fw=[[16,17,150,'#FFD98A','#FF9FD0',1],[74,13,170,'#8FD8FF','#FFC94F',2],
            [43,9,140,'#FF9FD0','#fff',3],[88,24,130,'#A99BF5','#FFD98A',4],
            [30,26,120,'#7BD256','#FFF1D6',5]]
    .map(a=>hpFirework(...a)).join('');
  /* ถนนชนบท + รถ : ถนนยืดเต็มความกว้างได้ (ถนนที่ยืดก็ยังเป็นถนน)
     แต่ตัวรถเป็น svg ของตัวเองจึงไม่ถูกยืดตาม */
  const ground=`<div class="groundprops" aria-hidden="true">
    <svg class="growrap" viewBox="0 0 1440 60" preserveAspectRatio="none">
      <path d="M-20 40 Q360 22 720 34 T1460 26" fill="none" stroke="#D8C39C"
        stroke-width="13" stroke-linecap="round" opacity=".65"/></svg>
    ${hpCar('#4FA3D9','#2F7CB0')}
    <svg class="house h1" viewBox="-40 -34 80 74">${hpHouse('#FFF1D6','#E8543F')}</svg>
    <svg class="house h2" viewBox="-40 -34 80 74">${hpHouse('#F4F9FC','#6C5CE7')}</svg>
  </div>`;
  /* ชั้นของเล่นสะสม อยู่หน้าสุดของฉาก (แต่ยังหลัง #root) เด็กจะได้เห็นตัวที่สุ่มได้ชัด ๆ */
  sc.insertAdjacentHTML('beforeend',
    `${night}<div class="hillprops" aria-hidden="true">${props}</div>${ground}`
    +`${flock}${hpBalloon()}${clouds}${hpPlane()}${fw}`
    +`<div class="toylayer" id="toylayer" aria-hidden="true"></div>`);
}
mountPageScene();

/* บอก CSS ว่าตอนนี้กลางวันหรือกลางคืน เพื่อสลับสีตัวอักษรที่วางบนพื้นหลังโดยตรง
   --ink (#123A4D) บนท้องฟ้ากลางคืนได้ contrast ราว 1.3:1 คือ อ่านไม่ออก
   จึงต้องเปลี่ยนเป็นตัวอักษรสว่างพร้อมเงาเข้มเมื่อฟ้ามืด

   อ่านค่าความทึบของม่านคืน "ที่เรนเดอร์จริง" แทนการจับเวลาเอง
   เพราะ animation จะถูกหยุดเมื่อแท็บไม่ได้แสดงผล ถ้าตั้งนาฬิกาแยกไว้จะเพี้ยนกัน
   เช็คทุก 2 วิก็พอ การเปลี่ยนกลางวัน–กลางคืนกินเวลาเป็นสิบวินาทีอยู่แล้ว */
(function watchDayNight(){
  const sky=document.querySelector('.nightsky');if(!sky)return;
  let cur='';
  const tick=()=>{
    const t=+getComputedStyle(sky).opacity>=.55?'night':'day';
    if(t!==cur){cur=t;document.body.dataset.time=t}
  };
  tick();setInterval(tick,2000);
})();

/* ปุ่มสลับภาพเคลื่อนไหว — อยู่นอก #root จึงผูก listener ครั้งเดียวพอ */
paintMotionBtn();
$('motionbtn').addEventListener('click',()=>{
  const next=stillMode()?'on':'off';
  document.documentElement.dataset.motion=next;
  try{localStorage.setItem(MOTION_KEY,next)}catch(e){}
  paintMotionBtn();
});

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