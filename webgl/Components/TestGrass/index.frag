varying vec3 vNormal;
varying float vNoise;
varying float vProg;

uniform float uHighlightStrength;

void main() {
  vec3 color = mix(vec3(0.109, 0.388, 0.180), vec3(0.2, 0.6, 0.301), vProg);

  color *= 1.0 + vNoise * uHighlightStrength;
  gl_FragColor = vec4(color, 1.0);
  gl_FragColor = vec4(mix(vec3(1.), vec3(1., 0., 0.), vProg), 1.0);
}
