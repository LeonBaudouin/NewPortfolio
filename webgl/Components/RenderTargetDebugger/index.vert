varying vec2 vUv;
uniform vec2 uResolution;

void main() {
  vec2 screenCoord = position.xy / uResolution;
  gl_Position = vec4(screenCoord, 1.0, 1.0);
  vUv = uv;
}
