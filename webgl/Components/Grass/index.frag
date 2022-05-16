uniform vec3 uColor1;
uniform vec3 uColor2;
uniform sampler2D uTexture;
uniform float uHighlightStrength;

varying vec2 vUv;
varying float vNoise;
varying float vDist;
varying vec3 vDisplace;

#include <fog_pars_fragment>

void main() {
  vec4 texture = texture2D(uTexture, vUv);
  // vec3 color = mix(uColor2, uColor1, texture.g);
  vec3 color = mix(uColor1, uColor2, vUv.y);

  color *= 1.0 + (vNoise + vDisplace.x * 3.) * uHighlightStrength;
  float alpha = texture.r;
  gl_FragColor = vec4(color, alpha);

  // gl_FragColor = vec4(vec3((vDisplace.yz + 1.) / 2., 0.), alpha);
  // gl_FragColor = vec4(vec3(vDisplace.yz, 0.), texture.r);

  if (gl_FragColor.a < 0.2) discard;

  #include <fog_fragment>


  // #ifdef ALPHATEST
  //   if(gl_FragColor.a < ALPHATEST) discard;
  // #endif
}
