// Progressive enhancement: the navigation and all content work without JavaScript.
document.body.classList.add('js');
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
toggle.hidden = false;
function closeMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('open');
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    toggle.focus();
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
document.querySelector('#year').textContent = new Date().getFullYear();

// Continuous client loop; duplicate is visual only. Reduced motion keeps a scrollable list.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const ticker = document.querySelector('.ticker');
const tickerTrack = document.querySelector('.ticker-track');
const clientCopy = document.querySelector('.clients').cloneNode(true);
clientCopy.setAttribute('aria-hidden','true');
function syncTicker(){
  ticker.classList.toggle('continuous',!motionPreference.matches);
  if(motionPreference.matches)clientCopy.remove();else tickerTrack.append(clientCopy);
  ticker.scrollLeft=0;
}
syncTicker();
motionPreference.addEventListener('change',()=>{syncTicker();resetVision();});

// A small physical response, only for precise pointers and motion-enabled users.
const vision = document.querySelector('.vision');
const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
let visionFrame = 0;
function resetVision() {
  cancelAnimationFrame(visionFrame);
  vision.style.removeProperty('--tilt-x');
  vision.style.removeProperty('--tilt-y');
}
vision.addEventListener('pointermove', (event) => {
  if (motionPreference.matches || !precisePointer.matches) return;
  cancelAnimationFrame(visionFrame);
  visionFrame = requestAnimationFrame(() => {
    const bounds = vision.getBoundingClientRect();
    const x = Math.max(-.5, Math.min(.5, (event.clientX - bounds.left) / bounds.width - .5));
    const y = Math.max(-.5, Math.min(.5, (event.clientY - bounds.top) / bounds.height - .5));
    vision.style.setProperty('--tilt-x', `${-y * 6}deg`);
    vision.style.setProperty('--tilt-y', `${x * 6}deg`);
  });
});
vision.addEventListener('pointerleave', resetVision);
vision.addEventListener('pointercancel', resetVision);
