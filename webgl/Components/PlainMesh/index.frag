uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTransitionProg;
uniform float uTransitionForward;
uniform sampler2D uTexture;

varying float vNoise;
varying vec3 vWorldPosition;

#include <fog_pars_fragment>

float remap(float value, float start1, float stop1, float start2, float stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

float exponentialIn(float t) {
  return t == 0.0 ? t : pow(2.0, 10.0 * (t - 1.0));
}

vec2 rotateUV(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}

float isNorm(vec2 _st) {
  if (_st.x > 1. || _st.y > 1. || _st.x < 0. || _st.y < 0.)
    return 0.;
  return 1.;
}

float computeAlpha(vec2 pos) {
  float scale = 20.;

  float prog = uTransitionProg * 1.13;

  float branchNumber = 10.;
  float bulgeSize = 0.700 * prog + 0.776 * exponentialIn(prog);

  vec2 center = vec2(0.);
  pos -= center;
	pos /= scale;
  pos += center;
  float rot = length(center - pos) * 1.388;
  vec2 rotatedPos = rotateUV(pos, rot, center);
  vec2 centeredPos = center - rotatedPos;

  float b = max(-pos.x, 0.);

  vec2 dir = normalize(centeredPos);
  float angleProg = atan(dir.y, dir.x);
  float bulge = (1. + sin(angleProg * branchNumber)) / 2. + b * 4.;
  float stepV = prog + bulge * bulgeSize;
  float v = smoothstep(stepV + 0.1, stepV - 0.1, length(centeredPos));
	return uTransitionForward > 0. ? 1. - v : v;
}

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {

  vec2 coords = vWorldPosition.zx * vec2(1., -1.) * 0.8;
  float grass = texture2D(uTexture, fract(coords)).g;
  grass *= smoothstep(0., 1., fract(coords.y));
  grass *= isNorm(fract(coords)) * smoothstep(0., 1., rand(floor(coords) + 0.1));

  float mixV = remap(vNoise, -1., 1., 0., 1.);
  mixV = mix(mixV, 1.-mixV, grass * 5.);

  vec3 color = mix(uColor1, uColor2, mixV);
  gl_FragColor = vec4(color, 1.);
  float shadow = computeAlpha(vWorldPosition.xz * vec2(1., -1.) + vec2(3., 3.));


  #include <fog_fragment>
  gl_FragColor.rbg = mix(gl_FragColor.rbg, vec3(0.), shadow * 0.5);
}
