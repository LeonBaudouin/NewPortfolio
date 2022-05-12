uniform float uTime;
attribute float height;

varying vec3 vPosition;
varying vec3 vNormal;
varying float vNoise;
varying float vProg;

uniform float uNoiseSpeed;
uniform float uNoiseScale;
uniform float uNoiseStrength;

float remap(float value, float start1, float stop1, float start2, float stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
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

void main() {
  vPosition = position;
  vNormal = normalize(normalMatrix * normal);

  vNoise = wave(vPosition);

  vProg = vPosition.y / height;

  vPosition.x += vNoise * uNoiseStrength * vProg * 0.;
  // if (vPosition.y < 0.0) {
  //   vPosition.y = 0.0;
  // } else {
  //   vPosition.x += wave(uv.x * 10.0, 0.3, 0.1);
  // }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}
