uniform sampler2D uTexture;

varying vec2 vUv;
varying vec3 vColor;
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

  float alpha = texture.r;
  gl_FragColor = vec4(vColor, alpha);

  float alphaTest = cremap(vWorldPosition.x, 5., 15., 0.1, 0.5);

  if (gl_FragColor.a < alphaTest) discard;

  #include <fog_fragment>
}
