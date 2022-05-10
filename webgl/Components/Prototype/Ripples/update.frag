const float PI = 3.141592653589793;

uniform sampler2D uFbo;
uniform vec2 uDelta;
uniform vec3 uPosition;
uniform float uPlaneScale;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uStrength;

varying vec2 vUv;


float isNorm(vec2 _st) {
  if (_st.x > 1. || _st.y > 1. || _st.x < 0. || _st.y < 0.)
    return 0.;
  return 1.;
}

vec4 sampleFbo(vec2 coord) {
  return mix(vec4(0.), texture2D(uFbo, coord), isNorm(coord));
}

void main() {
  /* get vertex info */
  vec2 uv = vUv + ((-uPosition.xz * vec2(1., -1.)) / uPlaneScale);
  // vec2 uv = vUv;

  vec4 info = sampleFbo(uv);

  /* calculate average neighbor height */
  vec2 dx = vec2(uDelta.x, 0.0);
  vec2 dy = vec2(0.0, uDelta.y);
  float average = (
    sampleFbo(uv - dx).r +
    sampleFbo(uv - dy).r +
    sampleFbo(uv + dx).r +
    sampleFbo(uv + dy).r
  ) * 0.25;

  /* change the velocity to move toward the average */
  info.g += (average - info.r) * 2.0;

  /* attenuate the velocity a little so waves do not last forever */
  info.g *= 0.91;

  /* move the vertex along the velocity */
  info.r += info.g;

  /* add the drop to the height */
  float drop = max(0.0, 1.0 - length(uCenter - vUv) / uRadius);
  drop = 0.5 - cos(drop * PI) * 0.5;
  info.r += drop * uStrength;

  gl_FragColor = info;
}
