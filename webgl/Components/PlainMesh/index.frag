uniform vec3 uColor1;
uniform vec3 uColor2;

varying float vNoise;

#include <fog_pars_fragment>

float remap(float value, float start1, float stop1, float start2, float stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

void main() {
  vec3 color = mix(uColor1, uColor2, remap(vNoise, -1., 1., 0., 1.));
  gl_FragColor = vec4(color, 1.);

  #include <fog_fragment>
}
