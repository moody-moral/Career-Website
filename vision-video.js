// One clock owns all transitions. A failed or stalled video always returns to the atom.
const reelFrame = document.querySelector('.neutron-art');
const reel = document.querySelector('.vision-reel');
const reelReduced = matchMedia('(prefers-reduced-motion: reduce)');
let reelVisible=false, reelState='atom', reelDeadline=0, reelToken=0;
let reelWatchdog;
const NUCLEUS_TIME=10000, REEL_TIME=5000, CUT_TIME=480;
// Draw fresh monochrome grain, scan lines and tracking bands only during a cut.
const staticLayer = document.querySelector('.vision-static');
const staticCanvas = document.createElement('canvas');
staticCanvas.width=240;staticCanvas.height=160;
staticLayer.replaceChildren(staticCanvas);
const staticContext=staticCanvas.getContext('2d');
let staticFrame=0;
function endStatic(){cancelAnimationFrame(staticFrame);staticFrame=0;reelFrame.classList.remove('static-cut');}
function beginStatic(toVideo){
  endStatic();
  if(!staticContext)return;
  const started=performance.now();
  let lastPaint=-100, switched=false;
  reelFrame.classList.add('static-cut');
  function paint(now){
    const progress=Math.min((now-started)/CUT_TIME,1);
    if(progress>=.5&&!switched){reelFrame.classList.toggle('show-reel',toVideo);switched=true;}
    if(now-lastPaint>=40){
      lastPaint=now;
      const strength=Math.sin(progress*Math.PI);
      const noise=staticContext.createImageData(240,160);
      for(let i=0;i<noise.data.length;i+=4){
        const shade=28+Math.floor(Math.random()*115);
        noise.data[i]=shade;noise.data[i+1]=shade;noise.data[i+2]=shade;
        noise.data[i+3]=Math.floor((60+Math.random()*175)*strength);
      }
      staticContext.putImageData(noise,0,0);
      // Narrow tracking tears move through the image; no full-screen white flashes.
      for(let band=0;band<3;band++){
        const y=(progress*230+band*57)%160;
        staticContext.fillStyle=`rgba(18,18,17,${strength*.8})`;
        staticContext.fillRect(0,y,240,3+band*2);
        staticContext.fillStyle=`rgba(195,190,181,${strength*.45})`;
        staticContext.fillRect(Math.random()*35,y+1,170+Math.random()*70,1);
      }
      staticContext.fillStyle=`rgba(0,0,0,${strength*.3})`;
      for(let y=0;y<160;y+=3)staticContext.fillRect(0,y,240,1);
    }
    if(progress<1)staticFrame=requestAnimationFrame(paint);
    else endStatic();
  }
  staticFrame=requestAnimationFrame(paint);
}
function reelAllowed(){return reelVisible&&!document.hidden&&!reelReduced.matches;}
function atomState(){
  reelToken++;
  endStatic();
  reelState='atom';reelDeadline=performance.now()+NUCLEUS_TIME;
  reelFrame.classList.remove('show-reel','static-cut');reel.pause();
}
function resetReel(){clearInterval(reelWatchdog);atomState();if(reelAllowed())reelWatchdog=setInterval(tickReel,80);}
function tickReel(){
  if(!reelAllowed()){resetReel();return;}
  const now=performance.now();
  if(now<reelDeadline)return;
  if(reelState==='atom'){
    reelState='loading';reelDeadline=now+4000;
    const token=++reelToken;
    if(!reel.getAttribute('src'))reel.src=reel.dataset.src;
    reel.muted=true;
    reel.play().then(()=>{
      if(token!==reelToken)return;
      if(!reelAllowed()){resetReel();return;}
      reelState='cut-in';reelDeadline=performance.now()+CUT_TIME;
      beginStatic(true);
    }).catch(()=>{if(token===reelToken)atomState();});
  }else if(reelState==='cut-in'){
    reelFrame.classList.add('show-reel');reelFrame.classList.remove('static-cut');
    reelState='video';reelDeadline=now+REEL_TIME;
  }else if(reelState==='video'){
    beginStatic(false);reelState='cut-out';reelDeadline=now+CUT_TIME;
  }else atomState(); // includes loading timeout and completed cut-out
}
reel.addEventListener('error',atomState);
reel.addEventListener('ended',atomState);
reel.addEventListener('pause',()=>{if(reelState==='video'||reelState==='cut-in')atomState();});
reelReduced.addEventListener('change',resetReel);
document.addEventListener('visibilitychange',resetReel);
new IntersectionObserver(entries=>{
  const next=entries[0].isIntersecting;
  if(next!==reelVisible){reelVisible=next;resetReel();}
},{threshold:0}).observe(reelFrame);
