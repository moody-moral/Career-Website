import * as THREE from './assets/vendor/three/three.module.min.js';

export function mountScene(initialMode = 0) {
  const host = document.querySelector('#scene');
  const note = document.querySelector('#scene-note');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let paused = reduced.matches, mode = initialMode, visible = true, lost = false;
  let frame = 0, previous = 0, elapsed = 0, settling = 150;
  const pointer = new THREE.Vector2();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 80);
  camera.position.set(0, .15, 11.8);
  const sculpture = new THREE.Group(); scene.add(sculpture);
  // Unlit face colours preserve exact brand values; darker bevels retain depth.
  const brand = getComputedStyle(document.documentElement);
  const brandRed = brand.getPropertyValue('--red').trim() || '#ff4c3d';
  const face = color => new THREE.MeshBasicMaterial({color,toneMapped:false});
  const metal = [face('#30302d'),face('#1b1b19')];
  const coral = [face(brandRed),face('#ad2e23')];
  const slabShape = new THREE.Shape();
  const w = .76, h = 1.65, r = .32;
  slabShape.moveTo(-w/2+r,-h/2); slabShape.lineTo(w/2-r,-h/2); slabShape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r); slabShape.lineTo(w/2,h/2-r); slabShape.quadraticCurveTo(w/2,h/2,w/2-r,h/2); slabShape.lineTo(-w/2+r,h/2); slabShape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r); slabShape.lineTo(-w/2,-h/2+r); slabShape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  const slabGeometry = new THREE.ExtrudeGeometry(slabShape,{ depth:.28,bevelEnabled:true,bevelSize:.04,bevelThickness:.04,bevelSegments:3,steps:1,curveSegments:12 });
  slabGeometry.translate(0,0,-.14);
  const objects = [];
  const porcelain = [face('#f2f0e9'),face('#b9b8af')];
  const materials = [porcelain, coral, metal, porcelain, coral, metal];
  for (let i=0;i<6;i++) {
    const mesh = new THREE.Mesh(slabGeometry, materials[i]);
    sculpture.add(mesh); objects.push(mesh);
  }
  const core = new THREE.Mesh(new THREE.SphereGeometry(.28, 32, 24), coral[0]); sculpture.add(core);
  const linePositions = new Float32Array(6*6);
  const lineGeometry = new THREE.BufferGeometry(); lineGeometry.setAttribute('position',new THREE.BufferAttribute(linePositions,3));
  const lines = new THREE.LineSegments(lineGeometry,new THREE.LineBasicMaterial({color:0xc4c3ba,transparent:true,opacity:.5}));sculpture.add(lines);
  const targets = objects.map(()=>({p:new THREE.Vector3(), q:new THREE.Quaternion(), s:new THREE.Vector3(1,1,1)}));
  const rotation = new THREE.Euler();
  function configure(next) {
    mode=next;
    targets.forEach((target,i)=>{
      const angle=i/6*Math.PI*2;
      if(mode===0){
        target.p.set(Math.sin(angle)*1.22,Math.cos(angle)*1.22,0);
        rotation.set(.12*Math.cos(angle),.12*Math.sin(angle),-angle);
        target.s.setScalar(1);
      }else if(mode===1){
        target.p.set(i<3?-.9:.9,(1-i%3)*.88,0);
        rotation.set(0,0,Math.PI/2);
        target.s.set(1,.97,1);
      }else{
        target.p.set(Math.sin(angle)*1.85,Math.cos(angle)*1.85,0);
        rotation.set(0,0,Math.PI/2);
        target.s.set(.68,.68,.68);
      }
      target.q.setFromEuler(rotation);
    });
    settling=75;
    if(paused||reduced.matches) { snap(); settling=1; }
    requestDraw();
  }
  function snap(){objects.forEach((mesh,i)=>{mesh.position.copy(targets[i].p);mesh.quaternion.copy(targets[i].q);mesh.scale.copy(targets[i].s);});}
  function render(now=0){
    frame=0;if(lost||!visible||document.hidden)return;
    const dt=Math.min((now-previous)/1000||.016,.05);previous=now;
    if(!paused&&!reduced.matches)elapsed+=dt;
    const ease=1-Math.exp(-dt*5);
    objects.forEach((mesh,i)=>{mesh.position.lerp(targets[i].p,ease);mesh.quaternion.slerp(targets[i].q,ease);mesh.scale.lerp(targets[i].s,ease);});
    const moving=!paused&&!reduced.matches;
    sculpture.position.y = moving ? Math.sin(elapsed*.85)*.09 : 0;
    sculpture.rotation.y = moving ? Math.sin(elapsed*.36)*.12+pointer.x*.16-.22 : -.22;
    sculpture.rotation.x = moving ? Math.sin(elapsed*.48)*.035+pointer.y*.10+.12 : .12;
    sculpture.rotation.z += ((mode===0 ? -.14 : 0)-sculpture.rotation.z)*ease;
    core.visible=mode!==1;
    core.rotation.set(elapsed*.14,elapsed*.22,0);
    lines.visible=mode===2;
    if(mode===2){for(let j=0;j<6;j++){linePositions.set([0,0,0],j*6);objects[j].position.toArray(linePositions,j*6+3);}lineGeometry.attributes.position.needsUpdate=true;}
    camera.position.x += ((mode===1?0:.25)-camera.position.x)*ease;
    camera.lookAt(0,0,0);
    renderer.render(scene,camera);
    host.classList.add('scene-ready');
    settling--;
    if(moving || settling>0)requestDraw();
  }
  function requestDraw(){if(!frame&&!lost&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
  function resize(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.z=Math.max(9.8, 5.6 / (2 * Math.tan(THREE.MathUtils.degToRad(17)) * Math.min(camera.aspect, 1)));camera.updateProjectionMatrix();settling=2;requestDraw();}
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host);
  const observer = new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){previous=performance.now();requestDraw();}else{cancelAnimationFrame(frame);frame=0;}},{threshold:.01});observer.observe(host);
  reduced.addEventListener('change',()=>{paused=reduced.matches;pointer.set(0,0);snap();settling=2;requestDraw();});
  host.addEventListener('pointermove',event=>{if(paused||reduced.matches||!finePointer.matches)return;const rect=host.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width-.5,(event.clientY-rect.top)/rect.height-.5);settling=2;requestDraw();});
  host.addEventListener('pointerleave',()=>{pointer.set(0,0);settling=2;requestDraw();});
  document.addEventListener('visibilitychange',()=>{previous=performance.now();if(document.hidden){cancelAnimationFrame(frame);frame=0;}else requestDraw();});
  window.addEventListener('vision-mode',event=>configure(event.detail));
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;host.classList.remove('scene-ready');note.textContent='Still perspective · all content remains available.';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;settling=2;note.textContent='';requestDraw();});
  note.textContent = '';
  configure(initialMode);snap();resize();
}
