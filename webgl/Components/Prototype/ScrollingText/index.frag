uniform sampler2D uTexture;
uniform float uTexRatio;
uniform float uQuadRatio;
uniform bool uHollow;
uniform float uOffset;
uniform float uAlpha;
uniform float uSize;

varying vec2 vUv;

vec2 adjustUvToImage(vec2 _st, vec2 center, float texRatio, float quadRatio, bool fit) {
  float correctedRatio = quadRatio / texRatio;
  vec2 imageUv = _st - center;
  imageUv *= vec2(correctedRatio, 1.);
  if (fit)
    imageUv /= mix(1. / correctedRatio, correctedRatio, step(correctedRatio, 1.));
  imageUv /= mix(correctedRatio, 1., step(correctedRatio, 1.));
  imageUv += center;
  return imageUv;
}

void main() {
  vec2 imageUv = adjustUvToImage(vUv, vec2(0.5), uTexRatio, uQuadRatio, true);

  imageUv.x -= uOffset;
  float edge = step((- uSize / 2.) + 0.5, imageUv.x);
  edge = min(edge, step(imageUv.x, (uSize / 2.) + 0.5));

  vec4 tex = texture2D(uTexture, imageUv);

  float alpha = uHollow ? tex.g : tex.r;
  alpha *= uAlpha;

  gl_FragColor = vec4(vec3(1.), alpha * edge);
  if (gl_FragColor.a < 0.01) discard;
}
