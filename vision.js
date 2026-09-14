// Content remains available even when WebGL or the module cannot load.
const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('.panels > section')];
let selectedMode = 0;
function choose(index, focus = false) {
  selectedMode = index;
  tabs.forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
    panels[i].hidden = i !== index;
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', tab.id);
    panels[i].tabIndex = 0;
  });
  window.dispatchEvent(new CustomEvent('vision-mode', { detail: index }));
  if (focus) tabs[index].focus();
}
document.querySelector('.tabs').hidden = false;
choose(0);
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => choose(i));
  tab.addEventListener('keydown', event => {
    const next = { ArrowRight: (i + 1) % 3, ArrowLeft: (i + 2) % 3, Home: 0, End: 2 }[event.key];
    if (next !== undefined) { event.preventDefault(); choose(next, true); }
  });
});
import('./vision-scene.js?v=brand-fix-2').then(module => module.mountScene(selectedMode)).catch(() => {
  document.querySelector('#scene-note').textContent = 'Still perspective · all content is available below.';
});
