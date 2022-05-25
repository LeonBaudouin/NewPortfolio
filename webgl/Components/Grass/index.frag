uniform vec3 uColor1;
uniform vec3 uColor2;
uniform sampler2D uTexture;
uniform float uHighlightStrength;

varying vec2 vUv;
varying float vNoise;
varying vec3 vDisplace;
varying float vShadow;
varying vec3 vWorldPosition;

#include <fog_pars_fragment>

float remap(float value, float start1, float stop1, float start2, float stop2)
{
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

float cremap(float value, float start1, float stop1, float start2, float stop2) {
    float r = remap(value, start1, stop1, start2, stop2);
    return clamp(r, start2, stop2);
}

void main() {
  vec4 texture = texture2D(uTexture, vUv);
  // vec3 color = mix(uColor2, uColor1, texture.g);
  vec3 color = mix(uColor1, uColor2, vUv.y);

  color *= 1.0 + (vNoise + vDisplace.x * 3.) * uHighlightStrength;
  float alpha = texture.r;
  gl_FragColor = vec4(color, alpha);

  // gl_FragColor = vec4(vec3((vDisplace.yz + 1.) / 2., 0.), alpha);
  // gl_FragColor = vec4(vec3(vDisplace.yz, 0.), texture.r);
  float alphaTest = cremap(vWorldPosition.x, -20., 30., 0.2, 0.5);

  if (gl_FragColor.a < alphaTest) discard;
  // if (gl_FragColor.a < 0.2) discard;

  #include <fog_fragment>


  // #ifdef ALPHATEST
  //   if(gl_FragColor.a < ALPHATEST) discard;
  // #endif
  gl_FragColor.rbg = mix(gl_FragColor.rbg, vec3(0.), vShadow * 0.5);
}
