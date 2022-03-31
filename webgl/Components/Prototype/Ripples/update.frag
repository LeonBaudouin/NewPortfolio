uniform sampler2D uFbo;
uniform vec2 uDelta;
varying vec2 vUv;

void main() {
  /* get vertex info */
  vec4 info = texture2D(uFbo, vUv);

  /* calculate average neighbor height */
  vec2 dx = vec2(uDelta.x, 0.0);
  vec2 dy = vec2(0.0, uDelta.y);
  float average = (
    texture2D(uFbo, vUv - dx).r +
    texture2D(uFbo, vUv - dy).r +
    texture2D(uFbo, vUv + dx).r +
    texture2D(uFbo, vUv + dy).r
  ) * 0.25;

  /* change the velocity to move toward the average */
  info.g += (average - info.r) * 2.0;

  /* attenuate the velocity a little so waves do not last forever */
  info.g *= 0.99;

  /* move the vertex along the velocity */
  info.r += info.g;

  gl_FragColor = info;
}
