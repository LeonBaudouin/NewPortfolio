precision mediump float;
uniform vec2 uScreenResolution;

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

float cubicIn(float t) {
  return t * t * t;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uScreenResolution;
  uv = adjustUvToImage(uv, vec2(.5), 1., uScreenResolution.x / uScreenResolution.y, false);
  // gl_FragColor = vec4(vec3(uv, 1.), 1.);
  float df = length(uv - 0.5);
  float circle = step(df, 0.2);
  gl_FragColor = vec4(mix(vec3(0.0, 0.0, 0.0), vec3(0.1608, 0.1098, 0.102), cubicIn(df / 0.2)), circle);
  // if (gl_FragColor.a < 0.05) discard;
  gl_FragColor = vec4(vec3(0., 1., 0.), 1.);
}
