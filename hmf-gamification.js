// ── HMF GAMIFICATION ENGINE ─────────────────────────────────────
// Harry Maurice Foundation · Visitor engagement system
// Architecture mirrors the Docly gamification engine

const HMF_BADGES = [
  {id:'first_visit',    icon:'🌱', name:'First Ripple',      desc:'Visited the Harry Maurice Foundation for the first time. The ripple begins.',         check: s => s.pagesVisited.length >= 1},
  {id:'full_journey',   icon:'🗺️',  name:'Full Journey',       desc:'Explored all 6 pages. You have seen everything this foundation stands for.',           check: s => ['home','about','programmes','kids','stories','get-involved'].every(p => s.pagesVisited.includes(p))},
  {id:'first_champ',    icon:'🤝', name:'First Believer',     desc:'Championed your first kid. That belief is now part of their story.',                   check: s => s.champCount >= 1},
  {id:'champ_3',        icon:'💚', name:'Growing Believer',   desc:'Three kids championed. Three futures with someone in their corner.',                    check: s => s.champCount >= 3},
  {id:'champ_all',      icon:'🏆', name:'Full Champion',      desc:'All 9 kids championed. You believe in every single one of them.',                      check: s => s.champCount >= 9},
  {id:'calc_used',      icon:'🔢', name:'Ripple Thinker',     desc:'Used the Ripple Calculator. You understand how belief multiplies.',                    check: s => s.calcUsed === true},
  {id:'calc_maxed',     icon:'🌊', name:'The Full Wave',      desc:'Took the calculator to generation 6. Sixty-four people from one moment of belief.',    check: s => s.calcMaxed === true},
  {id:'story_depth',    icon:'📖', name:'Deep Reader',        desc:'Spent real time on the Stories page. You read more carefully than most.',              check: s => s.storyDepth === true},
  {id:'about_depth',    icon:'📜', name:'Full Story',         desc:'Read the full About page. You know exactly where this all came from.',                 check: s => s.aboutDepth === true},
  {id:'quiz_done',      icon:'🔮', name:'Know Yourself',      desc:'Completed the Mentor Match quiz. You know what kind of mentor you could be.',          check: s => s.quizDone === true},
  {id:'donated',        icon:'❤️', name:'Ripple Maker',       desc:"Made a donation. Your money is now someone's turning point.",                          check: s => s.donated === true},
  {id:'mentor_applied', icon:'🎓', name:'Future Mentor',      desc:'Applied to mentor a young person. Their future is closer to changing.',                check: s => s.mentorApplied === true},
  {id:'shared',         icon:'📣', name:'The Rippler',        desc:"Shared the foundation's story. The ripple goes further because of you.",               check: s => s.shared === true},
  {id:'streak_2',       icon:'✌️', name:'Two Days Running',   desc:'Visited two days in a row. The ripple keeps going.',                                  check: s => s.streak >= 2},
  {id:'streak_3',       icon:'🔥', name:'Three Day Ripple',   desc:"Three days in a row. You're becoming part of this story.",                            check: s => s.streak >= 3},
  {id:'streak_7',       icon:'📅', name:'Week Believer',      desc:'Seven days in a row. This foundation is part of your week now.',                      check: s => s.streak >= 7},
  {id:'early',          icon:'🌅', name:'Early Believer',     desc:"Visited before 7am. The world is quiet and you're already thinking about this.",       check: s => s.earlyVisit === true},
  {id:'night',          icon:'🌙', name:'Night Watch',        desc:'Visited after 11pm. Still here, still caring.',                                       check: s => s.nightVisit === true},
  {id:'weekend',        icon:'☀️', name:'Weekend Warrior',    desc:'Visited on a weekend. You make time for things that matter.',                         check: s => s.weekendVisit === true},
  {id:'monday',         icon:'💪', name:'Monday Mission',     desc:'Visited on a Monday. Starting the week by thinking about what matters.',              check: s => s.mondayVisit === true},
  {id:'comeback',       icon:'👋', name:'Welcome Back',       desc:'Returned after over a week away. We kept the light on.',                              check: s => s.comeback === true},
];

function hmfLoadState() {
  const def = {pagesVisited:[],streak:0,lastDate:'',earnedBadges:[],champCount:0,calcUsed:false,calcMaxed:false,storyDepth:false,aboutDepth:false,quizDone:false,donated:false,mentorApplied:false,shared:false,earlyVisit:false,nightVisit:false,weekendVisit:false,mondayVisit:false,comeback:false};
  try { return Object.assign({}, def, JSON.parse(localStorage.getItem('hmf-state') || '{}')); }
  catch { return def; }
}
function hmfSaveState(s) { localStorage.setItem('hmf-state', JSON.stringify(s)); }

window.hmfRecordVisit = function(page) {
  const s = hmfLoadState();
  const now = new Date(), today = now.toDateString(), yesterday = new Date(Date.now()-86400000).toDateString();
  if (!s.pagesVisited.includes(page)) s.pagesVisited.push(page);
  if (s.lastDate && s.lastDate !== today) {
    const days = Math.floor((Date.now()-new Date(s.lastDate).getTime())/86400000);
    if (days >= 7) s.comeback = true;
    s.streak = (s.lastDate === yesterday) ? s.streak+1 : 1;
  } else if (!s.lastDate) s.streak = 1;
  s.lastDate = today;
  const hr = now.getHours(), dy = now.getDay();
  if (hr < 7) s.earlyVisit=true; if (hr>=23) s.nightVisit=true;
  if (dy===0||dy===6) s.weekendVisit=true; if (dy===1) s.mondayVisit=true;
  hmfSaveState(s); hmfCheckBadges(s); hmfRefreshBar(s);
};

window.hmfAction = function(type) {
  const s = hmfLoadState();
  if (type==='champ') s.champCount=(s.champCount||0)+1;
  else if (type==='calc_used') s.calcUsed=true;
  else if (type==='calc_maxed') s.calcMaxed=true;
  else if (type==='story_depth') s.storyDepth=true;
  else if (type==='about_depth') s.aboutDepth=true;
  else if (type==='quiz_done') s.quizDone=true;
  else if (type==='donated') s.donated=true;
  else if (type==='mentor_applied') s.mentorApplied=true;
  else if (type==='shared') s.shared=true;
  hmfSaveState(s); hmfCheckBadges(s); hmfRefreshBar(s);
};

function hmfCheckBadges(s) {
  const n=[];
  HMF_BADGES.forEach(b=>{if(!s.earnedBadges.includes(b.id)&&b.check(s)){s.earnedBadges.push(b.id);n.push(b);}});
  if(n.length){hmfSaveState(s);n.forEach((b,i)=>setTimeout(()=>hmfBadgeToast(b),i*1400));}
}

function hmfBadgeToast(badge) {
  const ex=document.getElementById('hmf-toast');if(ex)ex.remove();
  const t=document.createElement('div');t.id='hmf-toast';
  t.style.cssText="position:fixed;top:76px;left:50%;transform:translateX(-50%) translateY(-16px);background:#1a2e22;color:#fff;font-family:'Nunito',sans-serif;font-size:.84rem;font-weight:700;padding:11px 22px;border-radius:100px;opacity:0;z-index:9999;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.2);transition:all .3s cubic-bezier(.4,0,.2,1);display:flex;align-items:center;gap:8px;pointer-events:none;border:1px solid rgba(179,230,200,.25)";
  t.innerHTML=`<span style="font-size:1.1rem">${badge.icon}</span> Badge earned: <strong style="color:#b3e6c8">${badge.name}</strong>!`;
  document.body.appendChild(t);
  requestAnimationFrame(()=>{t.style.opacity='1';t.style.transform='translateX(-50%) translateY(0)';});
  setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(-50%) translateY(-16px)';},3200);
  setTimeout(()=>t.remove(),3700);
}

window.hmfShowBadgeTip = function(el) {
  const ex=document.getElementById('hmf-btip');
  const prev=document.querySelector('.hmf-pb.active');
  if(prev&&prev!==el)prev.classList.remove('active');
  if(ex){ex.remove();if(ex._src===el){el.classList.remove('active');return;}}
  el.classList.add('active');
  const tip=document.createElement('div');tip.id='hmf-btip';tip._src=el;
  tip.style.cssText="position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:#1a2e22;color:#fff;border-radius:12px;padding:12px 16px;font-family:'Nunito',sans-serif;font-size:.82rem;font-weight:700;max-width:240px;z-index:9999;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.25);pointer-events:none";
  tip.innerHTML=`<div style="font-size:.88rem;font-weight:900;margin-bottom:4px">${el.dataset.name}</div><div style="opacity:.85;font-weight:600;line-height:1.4">${el.dataset.desc}</div>`;
  document.body.appendChild(tip);
  setTimeout(()=>{if(document.getElementById('hmf-btip')===tip){tip.remove();el.classList.remove('active');}},3000);
};

function hmfRefreshBar(s) {
  const g=id=>document.getElementById(id);
  if(!g('hmf-total-pages'))return;
  g('hmf-total-pages').textContent=s.pagesVisited.length+'/6';
  g('hmf-total-badges').textContent=s.earnedBadges.length;
  const sp=g('hmf-streak-pill');
  if(sp){if(s.streak>=2){sp.style.display='flex';g('hmf-streak-num').textContent=s.streak;}else sp.style.display='none';}
  const rb=g('hmf-recent-badges');
  if(rb)rb.innerHTML=s.earnedBadges.slice(-5).map(id=>{const b=HMF_BADGES.find(x=>x.id===id);return b?`<span class="hmf-badge-ico" data-name="${b.name}" data-desc="${b.desc}" onclick="hmfShowBadgeTip(this)">${b.icon}</span>`:''}).join('');
  const panel=document.getElementById('hmf-panel');
  if(panel&&panel.classList.contains('open'))hmfRenderPanel(panel,s);
}

function hmfInjectBar() {
  if(document.getElementById('hmf-bar'))return;
  const style=document.createElement('style');
  style.textContent=`
@keyframes hmf-slide{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
#hmf-bar{position:fixed;bottom:0;left:0;right:0;height:56px;background:#0a1a10;border-top:1px solid rgba(0,156,65,.2);display:flex;align-items:center;padding:0 4px;z-index:200;font-family:'Nunito',sans-serif;gap:0}
.hmf-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:6px 2px;text-decoration:none;cursor:pointer;background:none;border:none}
.hmf-nav-item svg{width:18px;height:18px;stroke:rgba(255,255,255,.35);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:stroke .2s}
.hmf-nav-item span{font-size:9px;color:rgba(255,255,255,.35);font-weight:700;letter-spacing:.02em;transition:color .2s;white-space:nowrap}
.hmf-nav-item.active svg{stroke:#009c41}
.hmf-nav-item.active span{color:#009c41}
.hmf-nav-divider{width:1px;height:28px;background:rgba(0,156,65,.25);flex-shrink:0;margin:0 2px}
.hmf-journey-btn{display:flex;align-items:center;gap:5px;background:rgba(0,156,65,.15);border:1px solid rgba(0,156,65,.3);border-radius:100px;padding:7px 10px;cursor:pointer;flex-shrink:0;margin-right:4px;transition:background .2s}
.hmf-journey-btn:hover{background:rgba(0,156,65,.25)}
.hmf-journey-btn svg{width:12px;height:12px;stroke:#009c41;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.hmf-journey-btn span{font-size:10px;color:#009c41;font-weight:800;letter-spacing:.02em;white-space:nowrap}
.hmf-bar-stat{display:flex;align-items:center;gap:4px;font-size:.72rem;font-weight:700;color:#7a9e8a}
.hmf-bar-stat strong{color:#1a2e22;font-weight:900}
.hmf-bar-stat-lbl{color:#7a9e8a;font-size:.7rem}
.hmf-recent-badges{display:flex;align-items:center;gap:3px}
.hmf-badge-ico{font-size:1rem;cursor:pointer;transition:transform .15s;display:inline-block}
.hmf-badge-ico:hover{transform:scale(1.2)}
.hmf-bar-right{display:flex;align-items:center;gap:10px}
#hmf-streak-pill{display:none;align-items:center;gap:5px;background:#e8f5ee;border:1.5px solid #b3e6c8;border-radius:100px;padding:4px 11px;font-size:.72rem;font-weight:800;color:#007a33}
#hmf-my-journey{padding:7px 16px;border-radius:100px;background:#e8f5ee;border:1.5px solid #b3e6c8;font-family:'Nunito',sans-serif;font-size:.74rem;font-weight:800;color:#007a33;cursor:pointer;transition:all .15s;white-space:nowrap}
#hmf-my-journey:hover{background:#009c41;color:#fff;border-color:#009c41}
.fdonate{bottom:84px!important}
#hmf-panel{position:fixed;bottom:52px;right:16px;width:360px;max-height:78vh;background:#fff;border:1.5px solid #dde8e2;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.14);z-index:300;overflow-y:auto;display:none}
#hmf-panel.open{display:block;animation:hmf-slide .25s cubic-bezier(.4,0,.2,1)}
.hmf-ph{padding:16px 20px;display:flex;align-items:center;justify-content:space-between;background:#1a2e22;border-radius:18px 18px 0 0}
.hmf-ph-title{font-family:'Nunito',sans-serif;font-size:1rem;font-weight:900;color:#fff}
.hmf-ph-close{background:none;border:none;cursor:pointer;font-size:1rem;color:rgba(255,255,255,.4);width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;transition:color .15s;font-family:'Nunito',sans-serif}
.hmf-ph-close:hover{color:#fff}
.hmf-pstats{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1.5px solid #dde8e2}
.hmf-pstat{background:#e8f5ee;padding:14px 8px;text-align:center;border-right:1px solid #dde8e2}
.hmf-pstat:last-child{border-right:none}
.hmf-pstat-n{font-family:'Varela Round',sans-serif;font-size:1.4rem;color:#1a2e22;line-height:1}
.hmf-pstat-l{font-family:'Nunito',sans-serif;font-size:.58rem;font-weight:800;color:#7a9e8a;letter-spacing:.08em;text-transform:uppercase;margin-top:3px}
.hmf-psec{padding:14px 16px;border-bottom:1.5px solid #dde8e2}
.hmf-psec:last-child{border-bottom:none}
.hmf-psec-title{font-family:'Nunito',sans-serif;font-size:.62rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#7a9e8a;margin-bottom:12px}
.hmf-badges-g{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.hmf-pb{display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer}
.hmf-pb-ico{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.25rem}
.hmf-pb-ico.earned{background:#e8f5ee;border:2px solid #b3e6c8}
.hmf-pb-ico.locked{background:#f5f8f6;border:2px solid #dde8e2;filter:grayscale(1);opacity:.4}
.hmf-pb.active .hmf-pb-ico{border-color:#009c41!important;box-shadow:0 0 0 3px rgba(0,156,65,.18);filter:none!important;opacity:1!important}
.hmf-pb-name{font-family:'Nunito',sans-serif;font-size:.52rem;font-weight:700;text-align:center;line-height:1.3;color:#7a9e8a;max-width:52px}
.hmf-pb.earned .hmf-pb-name{color:#1a2e22}
.hmf-streak-bar{height:4px;background:#e8f5ee;border-radius:100px;margin:10px 0 6px;overflow:hidden}
.hmf-streak-fill{height:100%;background:#009c41;border-radius:100px;transition:width .8s ease}
@media(max-width:600px){#hmf-bar{padding:0 14px}#hmf-streak-pill{display:none!important}.hmf-bar-stat-lbl{display:none}}
@media(max-width:400px){#hmf-panel{right:8px;left:8px;width:auto}}
.hmf-quiz-bg{position:fixed;inset:0;background:rgba(10,31,18,.88);z-index:800;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .3s;backdrop-filter:blur(10px);padding:20px;overflow-y:auto}
.hmf-quiz-bg.open{opacity:1;pointer-events:all}
.hmf-quiz-card{background:#fff;border-radius:20px;max-width:480px;width:100%;overflow:hidden;font-family:'Nunito',sans-serif;transition:opacity .18s ease,transform .18s ease}
.hmf-qhead{background:#1a2e22;padding:20px 26px 16px}
.hmf-qprog{height:4px;background:rgba(255,255,255,.12);border-radius:100px;overflow:hidden;margin-bottom:12px}
.hmf-qprog-fill{height:100%;background:#009c41;border-radius:100px;transition:width .4s ease}
.hmf-qrow{display:flex;justify-content:space-between;align-items:center}
.hmf-qlabel{font-size:.62rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#b3e6c8}
.hmf-qx{background:none;border:none;color:rgba(255,255,255,.35);font-size:1.2rem;cursor:pointer;padding:4px 6px;line-height:1;font-family:'Nunito',sans-serif;transition:color .2s}
.hmf-qx:hover{color:#fff}
.hmf-qbody{padding:24px 26px 26px}
.hmf-qq{font-family:'Varela Round',sans-serif;font-size:1.12rem;color:#1a2e22;letter-spacing:-.01em;line-height:1.35;margin-bottom:18px}
.hmf-qopts{display:flex;flex-direction:column;gap:7px}
.hmf-qopt{display:flex;align-items:center;gap:12px;padding:12px 15px;border:1.5px solid #dde8e2;border-radius:12px;cursor:pointer;transition:all .15s;background:#fff;text-align:left;width:100%;font-family:'Nunito',sans-serif}
.hmf-qopt:hover,.hmf-qopt.selected{border-color:#009c41;background:#e8f5ee}
.hmf-qopt-e{font-size:1.15rem;flex-shrink:0;width:22px;text-align:center}
.hmf-qopt-t{font-size:.84rem;font-weight:700;color:#1a2e22}
.hmf-qnext{display:block;width:100%;height:48px;background:#009c41;color:#fff;border:none;border-radius:12px;font-family:'Nunito',sans-serif;font-size:.9rem;font-weight:800;cursor:pointer;transition:background .2s;margin-top:14px}
.hmf-qnext:hover{background:#007a33}
.hmf-qnext:disabled{opacity:.38;cursor:not-allowed;background:#009c41}
.hmf-qresult{padding:30px 26px;text-align:center}
.hmf-qr-lbl{font-size:.62rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#009c41;margin-bottom:14px}
.hmf-qr-photo{width:88px;height:88px;border-radius:50%;object-fit:cover;margin:0 auto 12px;border:3px solid #b3e6c8}
.hmf-qr-name{font-family:'Varela Round',sans-serif;font-size:1.9rem;color:#1a2e22;letter-spacing:-.02em;margin-bottom:3px}
.hmf-qr-sub{font-size:.78rem;font-weight:700;color:#7a9e8a;margin-bottom:14px}
.hmf-qr-quote{border-left:3px solid #009c41;padding:11px 15px;background:#e8f5ee;border-radius:0 10px 10px 0;font-size:.86rem;font-weight:700;font-style:italic;line-height:1.65;color:#1a2e22;margin-bottom:20px;text-align:left}
.hmf-qr-apply{display:block;width:100%;height:48px;background:#009c41;color:#fff;border:none;border-radius:12px;font-family:'Nunito',sans-serif;font-size:.88rem;font-weight:800;cursor:pointer;transition:background .2s;box-shadow:0 4px 16px rgba(0,156,65,.3)}
.hmf-qr-apply:hover{background:#007a33}
.hmf-qr-again{background:none;border:none;color:#7a9e8a;font-family:'Nunito',sans-serif;font-size:.78rem;font-weight:700;cursor:pointer;margin-top:10px;display:block;width:100%}
.hmf-qr-again:hover{color:#1a2e22}
`;
  document.head.appendChild(style);
  const bar=document.createElement('div');bar.id='hmf-bar';
  bar.innerHTML=`
  <a href="index.html" class="hmf-nav-item" id="hmf-nav-home">
    <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    <span>Home</span>
  </a>
  <a href="about.html" class="hmf-nav-item" id="hmf-nav-about">
    <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
    <span>About</span>
  </a>
  <a href="programmes.html" class="hmf-nav-item" id="hmf-nav-programmes">
    <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
    <span>Programmes</span>
  </a>
  <a href="kids.html" class="hmf-nav-item" id="hmf-nav-kids">
    <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
    <span>The Kids</span>
  </a>
  <a href="stories.html" class="hmf-nav-item" id="hmf-nav-stories">
    <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
    <span>Stories</span>
  </a>
  <div class="hmf-nav-divider"></div>
  <button class="hmf-journey-btn" onclick="hmfTogglePanel()">
    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    <span>My Journey</span>
  </button>
`;
  document.body.appendChild(bar);
  // Highlight active nav item based on current page
  const pg = window.location.pathname.split('/').pop() || 'index.html';
  const map = {'index.html':'home','about.html':'about','programmes.html':'programmes','kids.html':'kids','stories.html':'stories','get-involved.html':'stories'};
  const activeId = 'hmf-nav-' + (map[pg] || 'home');
  const el = document.getElementById(activeId);
  if(el) el.classList.add('active');
  document.body.style.paddingBottom='56px';
  hmfRefreshBar(hmfLoadState());
}

window.hmfTogglePanel = function() {
  let p=document.getElementById('hmf-panel');
  if(!p){p=document.createElement('div');p.id='hmf-panel';document.body.appendChild(p);}
  p.classList.toggle('open');
  if(p.classList.contains('open'))hmfRenderPanel(p,hmfLoadState());
  const tip=document.getElementById('hmf-btip');if(tip)tip.remove();
};

function hmfRenderPanel(panel,s) {
  const pct=Math.min((s.streak/7)*100,100);
  panel.innerHTML=`<div class="hmf-ph"><div class="hmf-ph-title">My Journey</div><button class="hmf-ph-close" id="hmf-pc">✕</button></div><div class="hmf-pstats"><div class="hmf-pstat"><div class="hmf-pstat-n">${s.streak}</div><div class="hmf-pstat-l">Streak</div></div><div class="hmf-pstat"><div class="hmf-pstat-n">${s.earnedBadges.length}</div><div class="hmf-pstat-l">Badges</div></div><div class="hmf-pstat"><div class="hmf-pstat-n">${s.pagesVisited.length}/6</div><div class="hmf-pstat-l">Pages</div></div></div><div class="hmf-psec"><div class="hmf-psec-title">Badges (${s.earnedBadges.length} / ${HMF_BADGES.length})</div><div class="hmf-badges-g">${HMF_BADGES.map(b=>{const e=s.earnedBadges.includes(b.id);return`<div class="hmf-pb ${e?'earned':''}" data-name="${b.name}" data-desc="${b.desc}" onclick="hmfShowBadgeTip(this)"><div class="hmf-pb-ico ${e?'earned':'locked'}">${b.icon}</div><div class="hmf-pb-name">${b.name.split(' ').slice(0,2).join(' ')}</div></div>`;}).join('')}</div></div><div class="hmf-psec"><div class="hmf-psec-title">Daily Streak — ${s.streak} day${s.streak!==1?'s':''}</div><div class="hmf-streak-bar"><div class="hmf-streak-fill" style="width:${pct}%"></div></div><p style="font-size:.72rem;font-weight:700;color:#7a9e8a;margin-top:6px">${s.streak>=7?'🔥 Week Believer unlocked. You are consistent.':s.streak>=2?`Come back tomorrow to keep your streak. ${7-s.streak} more days for Week Believer.`:'Visit again tomorrow to start a streak.'}</p></div>`;
  document.getElementById('hmf-pc').addEventListener('click',()=>panel.classList.remove('open'));
}

document.addEventListener('click',e=>{
  const p=document.getElementById('hmf-panel'),b=document.getElementById('hmf-my-journey');
  if(p&&p.classList.contains('open')&&!p.contains(e.target)&&b&&!b.contains(e.target))p.classList.remove('open');
});

// ── Mentor Match Quiz (uses addEventListener — never inline onclick inside innerHTML) ──
const _KIDS=[
  {id:'mariam',   n:'Mariam',   age:17,prog:'Roots & Rise', dream:'Future Architect',    q:'"I will design a building that every Ugandan is proud of."',         ph:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80'},
  {id:'emmanuel', n:'Emmanuel', age:19,prog:'Roots & Rise', dream:'Future Doctor',        q:'"I will come back and serve the communities that raised me."',        ph:'https://images.unsplash.com/photo-1507152927626-3b1d50c76af5?w=200&q=80'},
  {id:'aisha',  n:'Aisha',  age:16,prog:'Diane Health', dream:'Future Nurse',         q:'"No one should die from something that could be treated."',           ph:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80'},
  {id:'david',  n:'David',  age:18,prog:'Roots & Rise', dream:'Future Engineer',      q:'"Bridges and roads are not just concrete. They are dignity."',         ph:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80'},
  {id:'grace',  n:'Grace',  age:17,prog:'Diane Health', dream:'Future Health Worker', q:'"If the clinic cannot come to us, we will go to the clinic."',         ph:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80'},
  {id:'ibrahim',n:'Ibrahim',age:20,prog:'Roots & Rise', dream:'Future Entrepreneur',  q:'"I do not want to leave Uganda to succeed. I want to succeed here."',  ph:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80'},
  {id:'joy',    n:'Joy',    age:15,prog:'Diane Health', dream:'Future Teacher',        q:'"Every child I teach will carry something forward."',                  ph:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80'},
  {id:'moses',  n:'Moses',  age:19,prog:'Roots & Rise', dream:'Future Journalist',    q:"\"Uganda's story deserves to be told by Ugandans.\"",                 ph:'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&q=80'},
  {id:'sarah',  n:'Sarah',  age:17,prog:'Roots & Rise', dream:'Future Lawyer',        q:'"The law is only as strong as the people willing to use it."',         ph:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80'},
];
const _QS=[
  {q:'What best describes your professional background?',opts:[{e:'🏥',t:'Healthcare & Medicine',k:'emmanuel'},{e:'⚙️',t:'Engineering & Technology',k:'david'},{e:'📐',t:'Architecture & Design',k:'mariam'},{e:'⚖️',t:'Law & Human Rights',k:'sarah'},{e:'📰',t:'Media & Communication',k:'moses'},{e:'📚',t:'Education & Teaching',k:'joy'},{e:'💼',t:'Business & Entrepreneurship',k:'ibrahim'},{e:'❤️',t:'Community & Health Work',k:'grace'}]},
  {q:'What kind of mentor would you naturally be?',opts:[{e:'🎯',t:'Practical — clear goals and tracking progress',k:'david'},{e:'👂',t:'Listening — helping them find their own answers',k:'grace'},{e:'🌐',t:'Connecting — opening doors through your network',k:'ibrahim'},{e:'🔭',t:'Visionary — helping them see further than they can',k:'emmanuel'}]},
  {q:'How available could you realistically be?',opts:[{e:'📆',t:'Weekly — a session every week',k:null},{e:'🗓',t:'Bi-weekly — every two weeks',k:null},{e:'📅',t:'Monthly — meaningful time once a month',k:null},{e:'🌊',t:'Flexible — whatever they need most',k:null}]},
];
let _qa=[],_qs=0,_sk=null;

window.hmfOpenQuiz=function(){
  _qa=[];_qs=0;_sk=null;
  let bg=document.getElementById('hmf-quiz-bg');
  if(!bg){bg=document.createElement('div');bg.id='hmf-quiz-bg';bg.className='hmf-quiz-bg';bg.innerHTML='<div class="hmf-quiz-card" id="hmf-quiz-card"></div>';bg.addEventListener('click',e=>{if(e.target===bg)hmfCloseQuiz();});document.body.appendChild(bg);}
  requestAnimationFrame(()=>bg.classList.add('open'));
  _qRender(0);
};
window.hmfCloseQuiz=function(){const bg=document.getElementById('hmf-quiz-bg');if(bg)bg.classList.remove('open');};

function _qRender(step){
  const card=document.getElementById('hmf-quiz-card');if(!card)return;
  _sk=null;
  const q=_QS[step],pct=(step/3)*100;
  card.innerHTML=`<div class="hmf-qhead"><div class="hmf-qprog"><div class="hmf-qprog-fill" style="width:${pct}%"></div></div><div class="hmf-qrow"><span class="hmf-qlabel">Question ${step+1} of 3</span><button class="hmf-qx" id="_qx">✕</button></div></div><div class="hmf-qbody"><div class="hmf-qq">${q.q}</div><div class="hmf-qopts" id="_qopts"></div><button class="hmf-qnext" id="_qnext" disabled>${step<2?'Next →':'See my match →'}</button></div>`;
  const wrap=document.getElementById('_qopts');
  q.opts.forEach(opt=>{
    const btn=document.createElement('button');btn.className='hmf-qopt';
    btn.innerHTML=`<span class="hmf-qopt-e">${opt.e}</span><span class="hmf-qopt-t">${opt.t}</span>`;
    btn.addEventListener('click',function(){
      wrap.querySelectorAll('.hmf-qopt').forEach(b=>b.classList.remove('selected'));
      this.classList.add('selected');_sk=opt.k;
      document.getElementById('_qnext').disabled=false;
    });
    wrap.appendChild(btn);
  });
  document.getElementById('_qx').addEventListener('click',hmfCloseQuiz);
  document.getElementById('_qnext').addEventListener('click',function(){
    if(_sk)_qa.push(_sk);_qs++;
    if(_qs>=3){_qResult();return;}
    card.style.opacity='0';card.style.transform='scale(.97)';
    setTimeout(()=>{card.style.transition='none';card.style.opacity='1';card.style.transform='scale(1)';_qRender(_qs);},180);
  });
}

function _qResult(){
  const counts={};_qa.filter(Boolean).forEach(k=>{counts[k]=(counts[k]||0)+1;});
  let top='emmanuel',max=0;Object.entries(counts).forEach(([id,c])=>{if(c>max){max=c;top=id;}});
  const kid=_KIDS.find(k=>k.id===top)||_KIDS[1];
  const card=document.getElementById('hmf-quiz-card');
  card.style.transition='none';card.style.opacity='1';card.style.transform='scale(1)';
  card.innerHTML=`<div class="hmf-qhead"><div class="hmf-qprog"><div class="hmf-qprog-fill" style="width:100%"></div></div><div class="hmf-qrow"><span class="hmf-qlabel">🎉 Your match</span><button class="hmf-qx" id="_qx2">✕</button></div></div><div class="hmf-qresult"><div class="hmf-qr-lbl">You would be a great mentor for</div><img class="hmf-qr-photo" src="${kid.ph}" alt="${kid.n}"/><div class="hmf-qr-name">${kid.n}</div><div class="hmf-qr-sub">${kid.age} years old · ${kid.prog} · ${kid.dream}</div><div class="hmf-qr-quote">${kid.q}</div><button class="hmf-qr-apply" id="_qapply">Apply to mentor ${kid.n} →</button><button class="hmf-qr-again" id="_qagain">Take the quiz again</button></div>`;
  document.getElementById('_qx2').addEventListener('click',hmfCloseQuiz);
  document.getElementById('_qapply').addEventListener('click',function(){hmfCloseQuiz();hmfAction('quiz_done');const m=document.getElementById('mentor');if(m)m.scrollIntoView({behavior:'smooth'});});
  document.getElementById('_qagain').addEventListener('click',()=>hmfOpenQuiz());
}

document.addEventListener('DOMContentLoaded',hmfInjectBar);
