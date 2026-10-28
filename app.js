const WALLET='9Jq12njYBvBYPfVfgVALtEoSPjiySeUEB9X2Mk34Uzu9',MINT='721F49hQ4pNknzLFNShLdvt5og8kPVewKLaNmQP3Gkay';
const RPCS=['https://solana-rpc.publicnode.com','https://api.mainnet-beta.solana.com'];const $=id=>document.getElementById(id);
$('wfull').textContent=WALLET;$('mfull').textContent=MINT;
$('wlink').href=$('solscan').href='https://solscan.io/account/'+WALLET;
document.querySelectorAll('.copy').forEach(b=>b.onclick=()=>{navigator.clipboard.writeText(b.dataset.c==='WALLET'?WALLET:MINT);const t=b.textContent;b.textContent='Copied';b.classList.add('ok');setTimeout(()=>{b.textContent=t;b.classList.remove('ok')},1200)});
// log (only real events)
const log=$('log');const ts=()=>new Date().toLocaleTimeString('en-GB');
function L(m,c=''){log.innerHTML+=`<span class="d">[${ts()}]</span> <span class="${c}">${m}</span>\n`;const l=log.innerHTML.split('\n');if(l.length>18)log.innerHTML=l.slice(-18).join('\n')}
async function rpc(method,params){let e;for(const u of RPCS){try{return await rpc1(u,method,params)}catch(x){e=x}}throw e}
async function rpc1(RPC,method,params){const r=await fetch(RPC,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})});const j=await r.json();if(j.error)throw j.error;return j.result}
let ticks=[];
function setTick(){$('tick').innerHTML=(ticks.join('')).repeat(2)}
async function poll(first){
 try{
  const [b,s,sl]=await Promise.all([rpc('getBalance',[WALLET]),rpc('getSignaturesForAddress',[WALLET,{limit:10}]),rpc('getSlot',[])]);
  const sol=b.value/1e9;$('bal').textContent=sol.toFixed(4);$('ntx').textContent=s.length>=10?'10+':s.length;$('slot').textContent='slot '+sl.toLocaleString();
  $('navStatus').textContent='MAINNET LIVE';
  if(first){L('connected to solana mainnet','g');L('watching '+WALLET.slice(0,8)+'…');L('balance: '+sol.toFixed(4)+' SOL');L(s.length?s.length+' signatures found':'no trades yet — experiment starting','d');L('twap → $INVEST: armed, waiting on first realized profit','d');}
  else L('slot '+sl.toLocaleString()+' · balance '+sol.toFixed(4)+' SOL','d');
  $('txlist').innerHTML=s.length?s.map(x=>`<div class="tx"><a href="https://solscan.io/tx/${x.signature}" target="_blank" rel="noopener">${x.signature.slice(0,22)}…</a><span>${x.blockTime?new Date(x.blockTime*1000).toLocaleString():''}</span><span>${x.err?'failed':'ok'}</span></div>`).join(''):'<div class="empty">No trades yet — experiment starting.</div>';
  ticks=[`<span>AGENT <b>${WALLET.slice(0,4)}…${WALLET.slice(-4)}</b></span>`,`<span>BALANCE <b>${sol.toFixed(4)} SOL</b></span>`,`<span>SIGNATURES <b>${s.length}</b></span>`,`<span>SLOT <b>${sl.toLocaleString()}</b></span>`,`<span>$INVEST <b>CA 721F…Gkay</b></span>`,`<span>TWAP → $INVEST <b>ARMED</b></span>`,`<span>PROFIT KEPT BY AGENT <b>0%</b></span>`];setTick();
 }catch(e){$('navStatus').textContent='RPC UNAVAILABLE';if(first){L('public RPC unreachable — retrying','d');$('txlist').innerHTML='<div class="empty">Couldn\'t reach Solana RPC. Retrying.</div>'}
  ticks=['<span>$INVEST <b>CA 721F…Gkay</b></span>','<span>TWAP → $INVEST <b>ARMED</b></span>'];setTick()}
}
L('booting investor-grok agent console');poll(true);setInterval(()=>poll(false),20000);
// portrait tilt
const p=document.querySelector('.portrait');addEventListener('mousemove',e=>{const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;p.style.transform=`perspective(1200px) rotateY(${-8+x*10}deg) rotateX(${3-y*8}deg)`});
// twap diagram
(function(){const c=$('twapc'),g=c.getContext('2d');function d(t){const w=c.width=c.clientWidth*2,h=c.height=320;g.clearRect(0,0,w,h);const n=40,bw=w/n;
 g.fillStyle='#2a2a2e';g.fillRect(bw*2,40,bw*1.4,h-80);g.font='22px JetBrains Mono';g.fillStyle='#8b8a86';g.fillText('LUMP BUY',bw*2,28);
 g.fillText('TWAP · same size, spread',bw*8,28);const k=(t/120|0)%(n-8);
 for(let i=0;i<n-8;i++){const on=i<=k;g.fillStyle=on?'#f1efe9':'#26262a';g.fillRect(bw*(8+i),h-40-(h-80)/(n-8)*1.6*3,bw*.6,(h-80)/(n-8)*1.6*3)}
 requestAnimationFrame(d)}requestAnimationFrame(d)})();
// shader bg
(function(){const c=$('fx'),gl=c.getContext('webgl');if(!gl)return;const vs='attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}';
const fs=`precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
void main(){vec2 u=gl_FragCoord.xy/r.y;float v=0.,a=.5;vec2 q=u*2.+vec2(t*.02,0);for(int i=0;i<5;i++){v+=a*n(q);q*=2.03;a*=.5;}
float lines=smoothstep(.97,1.,sin((u.y+v*.35)*90.))*.10;vec2 g=fract(u*24.);float dots=smoothstep(.06,.0,length(g-.5))*.05;
float glow=.18/(1.+8.*length(u-m));vec3 col=vec3(.043)+vec3(v*.05)+lines+dots+glow*vec3(.9,.88,.85);
col*=1.-.55*length(gl_FragCoord.xy/r-.5);gl_FragColor=vec4(col,1);}`;
function sh(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o}
const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);gl.useProgram(pr);
gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const l=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,0,0,0);
let mx=[.9,.5];addEventListener('mousemove',e=>{mx=[e.clientX/innerHeight,1-e.clientY/innerHeight]});
function f(t){const d=Math.min(devicePixelRatio,1.5);c.width=innerWidth*d;c.height=innerHeight*d;gl.viewport(0,0,c.width,c.height);gl.uniform2f(gl.getUniformLocation(pr,'r'),c.width,c.height);gl.uniform1f(gl.getUniformLocation(pr,'t'),t/1000);gl.uniform2f(gl.getUniformLocation(pr,'m'),mx[0]*innerHeight/innerWidth*innerWidth/innerHeight,mx[1]);gl.drawArrays(4,0,3);requestAnimationFrame(f)}requestAnimationFrame(f)})();
if(location.hash)setTimeout(()=>{const e=document.querySelector(location.hash);e&&scrollTo({top:e.offsetTop-60,behavior:'instant'})},400);
