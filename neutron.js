// Static until enhanced; every discipline stays legible while the particles move.
const atom = document.querySelector('#neutron');
const atomReduced = matchMedia('(prefers-reduced-motion: reduce)');
let atomPaused = atomReduced.matches;
let atomVisible = true;
const svgNS = 'http://www.w3.org/2000/svg';
atom.querySelectorAll('.electron').forEach((particle,index) => {
  particle.removeAttribute('cx');particle.removeAttribute('cy');
  const movement = document.createElementNS(svgNS,'animateMotion');
  movement.setAttribute('dur',`${[14,18,22,26][index]}s`);
  movement.setAttribute('repeatCount','indefinite');
  movement.setAttribute('begin',`${-index*4}s`);
  const path = document.createElementNS(svgNS,'mpath');
  path.setAttribute('href',`#${particle.dataset.path}`);
  movement.append(path);particle.append(movement);
});
function updateAtom(){
  if(atomPaused || atomReduced.matches || !atomVisible || document.hidden) atom.pauseAnimations();
  else atom.unpauseAnimations();
}
atomReduced.addEventListener('change',()=>{atomPaused=atomReduced.matches;updateAtom();});
document.addEventListener('visibilitychange',updateAtom);
new IntersectionObserver(entries=>{atomVisible=entries[0].isIntersecting;updateAtom();},{threshold:.01}).observe(atom);
updateAtom();
