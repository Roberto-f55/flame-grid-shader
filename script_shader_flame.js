//Silueta de llama en círculo · Roberto Rodríguez Guillén

import * as THREE from "three";

let scene, renderer, camera, uniforms;
let info;
let reloj = new THREE.Clock();

init();
animationLoop();

function init() {
  camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  // Texto informativo sobre la escena (como en los ejemplos de la práctica)
  info = document.createElement("div");
  info.style.position = "absolute";
  info.style.top = "30px";
  info.style.width = "100%";
  info.style.textAlign = "center";
  info.style.color = "#fff";
  info.style.fontWeight = "bold";
  info.style.backgroundColor = "transparent";
  info.style.zIndex = "1";
  info.style.fontFamily = "Monospace";
  info.style.textShadow = "0 0 4px #000, 0 0 2px #000";   // legible sobre el naranja
  info.innerHTML = "Flame Grid · Roberto Rodríguez Guillén<br>Move the mouse horizontally to change the speed";
  document.body.appendChild(info);

  // Mismos uniforms que el editor de The Book of Shaders
  uniforms = {
    u_time: { value: 0.0 },
    u_resolution: { value: new THREE.Vector2() },
    u_mouse: { value: new THREE.Vector2() },
  };

  PlaneShader(20, 20, fragmentShader());

  onWindowResize();
  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.x = renderer.domElement.width;
  uniforms.u_resolution.value.y = renderer.domElement.height;
}

// Ratón en PÍXELES y con el origen abajo, como en el editor de The Book of Shaders,
// para que el mismo shader funcione igual en los dos sitios
document.onmousemove = function (e) {
  const dpr = renderer.getPixelRatio();
  uniforms.u_mouse.value.x = e.clientX * dpr;
  uniforms.u_mouse.value.y = (window.innerHeight - e.clientY) * dpr;
};

// Plano grande para que cubra siempre la ventana
// (el shader trabaja con gl_FragCoord, no con la geometría)
function PlaneShader(sx, sy, fragsh) {
  let geometry = new THREE.PlaneGeometry(sx, sy);
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    fragmentShader: fragsh,
    vertexShader: vertexShader(),
  });
  scene.add(new THREE.Mesh(geometry, material));
}

function animationLoop() {
  requestAnimationFrame(animationLoop);
  uniforms.u_time.value = reloj.getElapsedTime();   // segundos, como en el editor
  renderer.render(scene, camera);
}

function vertexShader() {
  return `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
}

// Shader de fragmentos minificado (473 bytes), idéntico a llama_min.frag
function fragmentShader() {
  return `precision mediump float;uniform vec2 u_resolution,u_mouse;uniform float u_time;void main(){vec2 R=u_resolution,p=gl_FragCoord.xy/R.y*3.,c=floor(p);p=fract(p)*2.-1.;vec2 q=p;q.x+=.17*(p.y+.6)*sin(5.4*p.y-u_time*(2.+6.*u_mouse.x/R.x)+c.x);q*=1.25;float r=length(p),e=1.-smoothstep(.88,.9,r),u=(q.y+.6)/1.3;gl_FragColor=vec4(mix(vec3(.08,.02,.02),mix(vec3(1.,.55,.1),vec3(.85,.1,.05),r+.2*mod(c.x+c.y,2.)),e)*(1.-smoothstep(0.,.02,1.2*sqrt(max(u,0.))*(1.-u)-abs(q.x))*e),1.);}`;
}