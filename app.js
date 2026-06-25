/* app.js — Aurora Weather UI (mock/demo) */
const cities = [
  'San Francisco, US','New York, US','London, UK','Paris, FR','Tokyo, JP','Sydney, AU','Mumbai, IN','Cairo, EG','Rio de Janeiro, BR','Toronto, CA'
];

const state = { recent: [], theme: null };

/* Quick DOM refs */
const cityInput = document.getElementById('cityInput');
const suggestions = document.getElementById('suggestions');
const recentList = document.getElementById('recentList');
const loadingOverlay = document.getElementById('loadingOverlay');
const mainCard = document.getElementById('mainCard');
const bgEffects = document.getElementById('bgEffects');
const particlesCanvas = document.getElementById('particlesCanvas');
const hourlyCarousel = document.getElementById('hourlyCarousel');
const dailyList = document.getElementById('dailyList');
const weatherIcon = document.getElementById('weatherIcon');

/* Simple city autocomplete */
cityInput.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  suggestions.innerHTML = '';
  if (!q) return;
  const matches = cities.filter(c => c.toLowerCase().includes(q)).slice(0,6);
  matches.forEach(m=>{
    const el = document.createElement('div');
    el.className='suggestion';
    el.textContent = m;
    el.onclick = ()=>selectCity(m);
    suggestions.appendChild(el);
  });
});

cityInput.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter') selectCity(cityInput.value || cities[0]);
});

function selectCity(name){
  if(!name) return;
  cityInput.value = '';
  suggestions.innerHTML = '';
  pushRecent(name);
  loadWeatherMock(name);
}

function pushRecent(name){
  state.recent = [name,...state.recent.filter(r=>r!==name)].slice(0,6);
  localStorage.setItem('aurora_recent',JSON.stringify(state.recent));
  renderRecent();
}
function renderRecent(){
  recentList.innerHTML='';
  (state.recent||[]).forEach(r=>{
    const b=document.createElement('button');b.textContent=r;b.onclick=()=>selectCity(r);recentList.appendChild(b);
  });
}

/* Mock fetch and UI update */
function loadWeatherMock(city){
  setLoading(true);
  // simulate network
  setTimeout(()=>{
    const conds=['Sunny','Cloudy','Rain','Snow','Thunderstorm','Partly Cloudy'];
    const condition = conds[Math.floor(Math.random()*conds.length)];
    const temp = Math.round(10 + Math.random()*20);
    const mock = {
      city, condition, temp, feelsLike: temp-1, humidity: Math.round(30+Math.random()*60), wind: Math.round(1+Math.random()*12), pressure:1000+Math.round(Math.random()*40), uv:Math.round(1+Math.random()*9), visibility:Math.round(3+Math.random()*10), sunrise:'05:43', sunset:'20:21'
    };
    updateUI(mock);
    setLoading(false);
  }, 900 + Math.random()*900);
}

function setLoading(active){
  loadingOverlay.classList.toggle('active', !!active);
}

function updateUI(d){
  document.getElementById('cityName').textContent = d.city;
  document.getElementById('temp').textContent = d.temp + '°';
  document.getElementById('condition').textContent = d.condition;
  document.getElementById('feelsLike').textContent = d.feelsLike + '°';
  document.getElementById('humidity').textContent = d.humidity + '%';
  document.getElementById('wind').textContent = d.wind + ' km/h';
  document.getElementById('pressure').textContent = d.pressure + ' hPa';
  document.getElementById('uv').textContent = d.uv;
  document.getElementById('visibility').textContent = d.visibility + ' km';
  document.getElementById('cardHumidity').textContent = d.humidity + '%';
  document.getElementById('cardWind').textContent = d.wind + ' km/h';
  document.getElementById('cardPressure').textContent = d.pressure + ' hPa';
  document.getElementById('sunrise').textContent = d.sunrise;document.getElementById('sunset').textContent = d.sunset;document.getElementById('cardUV').textContent = d.uv;

  // update date/time
  document.getElementById('currentDate').textContent = new Date().toLocaleString([], {weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'});

  // background & particles
  applyThemeForCondition(d.condition);
  renderIconForCondition(d.condition);
  populateHourly();
  populateDaily();
}

/* Map conditions to dynamic gradient and particle effect */
function applyThemeForCondition(condition){
  const el = document.documentElement;
  bgEffects.style.background='';
  stopParticles();
  if(/sunny|clear/i.test(condition)){
    bgEffects.style.background='radial-gradient(ellipse at top left, rgba(255,220,120,0.12), transparent 30%), linear-gradient(135deg,#ffe29f 0%, #ffa99f 100%)';
    startParticles('sunny');
  }else if(/cloud|partly/i.test(condition)){
    bgEffects.style.background='linear-gradient(180deg,#1f2a44,#1a2233)';
    startParticles('cloud');
  }else if(/rain/i.test(condition)){
    bgEffects.style.background='linear-gradient(180deg,#003b6f,#001827)';
    startParticles('rain');
  }else if(/snow/i.test(condition)){
    bgEffects.style.background='linear-gradient(180deg,#e6f2ff,#dfefff)';
    startParticles('snow');
  }else if(/thunder/i.test(condition)){
    bgEffects.style.background='linear-gradient(180deg,#0b1020,#072034)';
    startParticles('thunder');
  }else{
    bgEffects.style.background='linear-gradient(180deg,#0f1724,#071129)';
  }
}

/* Animated SVG icons for conditions */
function renderIconForCondition(cond){
  weatherIcon.innerHTML='';
  if(/sunny|clear/i.test(cond)){
    weatherIcon.innerHTML = `
      <svg viewBox="0 0 64 64"><g>
        <circle cx="32" cy="28" r="10" fill="#FFD166" class="sun"/>
        <g stroke="#FFD166" stroke-width="2" stroke-linecap="round">
          <line x1="32" y1="4" x2="32" y2="12"/>
          <line x1="32" y1="44" x2="32" y2="52"/>
          <line x1="4" y1="28" x2="12" y2="28"/>
          <line x1="52" y1="28" x2="60" y2="28"/>
        </g>
      </g></svg>`;
  }else if(/cloud/i.test(cond)){
    weatherIcon.innerHTML = `
      <svg viewBox="0 0 64 64"><g fill="#dfe7f3">
        <ellipse cx="36" cy="34" rx="18" ry="11" />
        <ellipse cx="22" cy="34" rx="12" ry="9" />
      </g></svg>`;
  }else if(/rain/i.test(cond)){
    weatherIcon.innerHTML = `
      <svg viewBox="0 0 64 64"><g fill="#cfe8ff">
        <ellipse cx="36" cy="26" rx="18" ry="10" />
        <g stroke="#9fd1ff" stroke-width="2" stroke-linecap="round">
          <line x1="26" y1="44" x2="24" y2="50"/>
          <line x1="34" y1="44" x2="32" y2="52"/>
          <line x1="42" y1="44" x2="40" y2="50"/>
        </g>
      </g></svg>`;
  }else if(/snow/i.test(cond)){
    weatherIcon.innerHTML = `
      <svg viewBox="0 0 64 64"><g fill="#f8fbff">
        <ellipse cx="36" cy="26" rx="18" ry="10" />
        <g stroke="#cde6ff" stroke-width="2" stroke-linecap="round">
          <text x="22" y="48" font-size="18" fill="#cde6ff">✻</text>
        </g>
      </g></svg>`;
  }else{
    weatherIcon.textContent = '';
  }
}

/* Populate hourly and daily mock */
function populateHourly(){
  hourlyCarousel.innerHTML='';
  const now = new Date();
  for(let i=0;i<24;i++){
    const hour = new Date(now.getTime()+i*3600000);
    const t = 10 + Math.round(Math.sin(i/3)*6 + Math.random()*4);
    const it = document.createElement('div');it.className='hourly-item';it.innerHTML=`<div>${hour.getHours()}:00</div><div style="font-size:20px">${t}°</div><div style="opacity:0.7">${['☀️','🌤️','🌧️','❄️'][Math.floor(Math.random()*4)]}</div>`;
    hourlyCarousel.appendChild(it);
  }
}
function populateDaily(){
  dailyList.innerHTML='';
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  for(let i=0;i<7;i++){
    const hi = 18 + Math.round(Math.random()*10);
    const lo = 6 + Math.round(Math.random()*6);
    const el = document.createElement('div');el.className='daily-item';el.innerHTML=`<strong>${days[(new Date().getDay()+i)%7]}</strong><canvas width="120" height="30" class="spark"></canvas><div style="display:flex;justify-content:space-between"><span>${lo}°</span><span>${hi}°</span></div>`;
    dailyList.appendChild(el);
    drawSparkline(el.querySelector('canvas'));
  }
}
function drawSparkline(canvas){
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle='rgba(255,255,255,0.85)';ctx.lineWidth=2;ctx.beginPath();
  const points=12;for(let i=0;i<points;i++){const x=i*(canvas.width/(points-1));const y=10+Math.sin(i/2+Math.random())*6; if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
}

/* Particles (simple canvas system) */
const P = particlesCanvas;const pCtx = P.getContext('2d');let particles=[];let partMode='';
function resizeCanvas(){P.width=innerWidth;P.height=innerHeight;}resizeCanvas();window.addEventListener('resize',resizeCanvas);
function startParticles(mode){partMode=mode;particles=[];animateParticles();}
function stopParticles(){partMode='';particles=[];}
function animateParticles(){cancelAnimationFrame(window.__partAnim);
  if(!partMode) return;const w=P.width,h=P.height;pCtx.clearRect(0,0,w,h);
  // create
  if(partMode==='rain'){for(let i=0;i<6;i++){particles.push({x:Math.random()*w,y:-10+Math.random()*50,vx:-0.3+Math.random()*0.6,vy:4+Math.random()*4,len:6+Math.random()*10})}}
  if(partMode==='snow'){for(let i=0;i<4;i++){particles.push({x:Math.random()*w,y:-10+Math.random()*50,vx:-0.4+Math.random()*0.8,vy:1+Math.random()*1.8,r:1+Math.random()*3})}}
  if(partMode==='sunny'){for(let i=0;i<1;i++){particles.push({x:Math.random()*w,y:Math.random()*h*0.4,vx:0,vy:0,alpha:0.06,r:120})}}
  if(partMode==='cloud'){for(let i=0;i<2;i++){particles.push({x:Math.random()*w,y:Math.random()*h*0.25,vx:0.2+Math.random()*0.6,vy:0,r:80,alpha:0.04})}}
  if(partMode==='thunder'){for(let i=0;i<3;i++){particles.push({x:Math.random()*w,y:Math.random()*h*0.3,vx:0,vy:0,flash:true,ttl:Math.random()*30})}}

  for(let i=particles.length-1;i>=0;i--){const p=particles[i];
    if(p.len){p.x+=p.vx;p.y+=p.vy;pCtx.strokeStyle='rgba(160,200,255,0.9)';pCtx.beginPath();pCtx.moveTo(p.x,p.y);pCtx.lineTo(p.x+p.vx*p.len,p.y+p.vy*p.len);pCtx.stroke();if(p.y>h+50 || p.x<-50)particles.splice(i,1)}
    else if(p.r){p.x+=p.vx;p.y+=p.vy;pCtx.fillStyle=`rgba(255,255,255,${p.alpha||0.1})`;pCtx.beginPath();pCtx.ellipse(p.x,p.y,p.r,p.r*0.6,0,0,Math.PI*2);pCtx.fill();if(p.y>h+80 || p.x> w+80)particles.splice(i,1)}
    else if(p.flash){p.ttl-=1;if(Math.random()<0.02){pCtx.fillStyle='rgba(255,255,255,0.9)';pCtx.fillRect(0,0,w,h);}
      if(p.ttl<0)particles.splice(i,1)}
  }
  window.__partAnim=requestAnimationFrame(animateParticles);
}

/* Theme toggle */
const themeToggle = document.getElementById('themeToggle');themeToggle.addEventListener('click', ()=>{document.documentElement.classList.toggle('light');});

/* Init */
(function init(){
  try{state.recent = JSON.parse(localStorage.getItem('aurora_recent'))||[];}catch(e){state.recent=[]}
  renderRecent();
  // initial render
  loadWeatherMock(cities[0]);
})();

/* Small polish: mock loading skeleton when switching cities via code */
function simulateSwitchTo(city){setLoading(true);setTimeout(()=>{selectCity(city);},600);}