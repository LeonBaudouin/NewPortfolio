uniform float uTime;
uniform vec3 uCam;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uHighlightStrength;

varying vec2 vUv;
varying vec3 vColor;
varying vec3 vWorldPosition;

uniform float uNoiseSpeed;
uniform float uNoiseScale;
uniform float uNoiseStrength;
uniform mat4 uContactMatrix;
uniform sampler2D tContact;
uniform float uTransitionProg;
uniform float uTransitionForward;

#include <fog_pars_vertex>

float remap(float value, float start1, float stop1, float start2, float stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

float cremap(float value, float start1, float stop1, float start2, float stop2) {
  float r = remap(value, start1, stop1, start2, stop2);
  return clamp(r, min(start2, stop2), max(start2, stop2));
}

float cnoise(vec3 v) {
  float t = v.z * 0.3;
  v.y *= 0.8;
  float noise = 0.0;
  float s = 0.5;
  noise += remap(sin(v.x * 0.9 / s + t * 10.0) + sin(v.x * 2.4 / s + t * 15.0) + sin(v.x * -3.5 / s + t * 4.0) + sin(v.x * -2.5 / s + t * 7.1), -1.0, 1.0, -0.3, 0.3);
  noise += remap(sin(v.y * -0.3 / s + t * 18.0) + sin(v.y * 1.6 / s + t * 18.0) + sin(v.y * 2.6 / s + t * 8.0) + sin(v.y * -2.6 / s + t * 4.5), -1.0, 1.0, -0.3, 0.3);
  return noise;
}

float wave(vec3 pos) {
  // Tip is the fifth vertex drawn per blade
  // bool isTip = (gl_VertexID + 1) % 5 == 0;

  // float waveDistance = isTip ? tipDistance : centerDistance;
  // return sin((uTime / 500.0) + waveSize) * waveDistance;
  float t = uTime;
  float speed = uNoiseSpeed;
  float noise = cnoise(pos.xyz * 0.25 * uNoiseScale + vec3(-t * 0.5 * speed, t * 0.13 * speed, t * 1.3 * speed)) * 1.1;
  return noise;
}

float isNorm(vec2 _st) {
  if (_st.x > 1. || _st.y > 1. || _st.x < 0. || _st.y < 0.)
    return 0.;
  return 1.;
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


void main() {
  vec4 worldPosition = instanceMatrix * modelMatrix * vec4(position, 1.);
  float dist = cremap(length(uCam - worldPosition.xyz), 50., 60., 1., 0.);

  vUv = uv;
  float noise = wave(worldPosition.xyz);
  vWorldPosition = worldPosition.xyz;

  vec2 contactUv = (uContactMatrix * vec4(worldPosition.x, 0., worldPosition.z, 1.)).xz;
  contactUv = contactUv * vec2(1., -1.) + .5;
  vec3 contact = texture2D(tContact, contactUv).rgb * isNorm(contactUv);

  vec3 newPosition = position;
  float clampV = cremap(worldPosition.x, 6., 12., 0.3, 0.);
  // float clampV = cremap(worldPosition.x, -70., 20., 1., 0.);
  if (uv.y < 0.5) newPosition.y = clampV;

  vec4 pos = instanceMatrix * modelMatrix * vec4(newPosition * dist, 1.);
  vUv.y = (pos.y + 1.) / 0.6;
  vec3 displacement = vec3(
    mix(noise * uNoiseStrength, contact.y, contact.x),
    remap(contact.x, 0., 1., 0., -0.1),
    -contact.z
  );
  pos.xyz += displacement * vUv.y;


  float shadow = computeAlpha(pos.xz * vec2(1., -1.) + vec2(3., 3.));

  vColor = mix(uColor1, uColor2, vUv.y);
  vColor *= 1.0 + (noise + contact.x * 3.) * uHighlightStrength;
  vColor = mix(vColor, vec3(0.), shadow * 0.5);

  // vColor = vec3(clampV);

  vec4 mvPosition = viewMatrix * pos;
  gl_Position = projectionMatrix * mvPosition;

  #include <fog_vertex>
}
