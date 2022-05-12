uniform vec3 uColor1;
uniform vec3 uColor2;
varying vec2 vUv;

#include <fog_pars_fragment>

void main() {
  vec3 color = mix(uColor1, uColor2, vUv.y);
  gl_FragColor = vec4(color, 1.);

  #include <fog_fragment>

  #ifdef ALPHATEST
    if(gl_FragColor.a < ALPHATEST) discard;
  #endif
}
