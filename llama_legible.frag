// =====================================================================
//  "Silueta de llama en círculo"  ·  versión legible y comentada
//  Roberto Rodríguez Guillén · Informática Gráfica S9
//  Minificada: llama_min.frag (473 bytes)
// =====================================================================
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;   // tamaño de la ventana en píxeles
uniform vec2 u_mouse;        // puntero en píxeles
uniform float u_time;        // segundos

float scale = 3.0;           // celdas en vertical

void main() {
  // 1. Rejilla (sección "Patrones y generativos"): floor -> celda, fract -> posición
  vec2 st = gl_FragCoord.xy / u_resolution.y * scale;   // /y -> celdas cuadradas
  vec2 celda = floor(st);
  st = fract(st) * 2.0 - 1.0;                          // centro de la celda en (0,0)

  // 2. Ondulación de la llama: se desplaza x con una sinusoidal que
  //    avanza con el tiempo. Se multiplica por (st.y + 0.6) para que la
  //    base quede casi quieta y la punta se mueva más.
  //    La velocidad la marca la x del ratón; + celda.x desfasa columnas.
  float vel = 2.0 + 6.0 * u_mouse.x / u_resolution.x;
  vec2 q = st;
  q.x += 0.17 * (st.y + 0.6) * sin(5.4 * st.y - u_time * vel + celda.x);
  q *= 1.25;                                           // escala: llama algo más pequeña

  // 3. Círculo de fondo con degradado radial naranja -> rojo;
  //    las celdas impares (paridad con mod) son un poco más rojas
  float r = length(st);
  float par = mod(celda.x + celda.y, 2.0);
  vec3 circulo = mix(vec3(1.0, 0.55, 0.1), vec3(0.85, 0.1, 0.05), r + 0.2 * par);
  float enCirculo = 1.0 - smoothstep(0.88, 0.9, r);    // borde suave

  // 4. Forma de gota: ancho = sqrt(u) * (1-u)
  //    sqrt(u) redondea la base, (1-u) afila la punta (u: 0 abajo, 1 arriba)
  float u = (q.y + 0.6) / 1.3;
  float ancho = 1.2 * sqrt(max(u, 0.0)) * (1.0 - u);
  float llama = smoothstep(0.0, 0.02, ancho - abs(q.x));  // 1 dentro, 0 fuera

  // 5. Composición: fondo oscuro, círculo de color y la llama en negro
  //    (multiplicar por (1 - llama) oscurece donde está la llama)
  vec3 color = mix(vec3(0.08, 0.02, 0.02), circulo, enCirculo);
  color *= 1.0 - llama * enCirculo;

  gl_FragColor = vec4(color, 1.0);
}
