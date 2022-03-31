uniform vec2 uResolution;
uniform sampler2D uMap;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  gl_FragColor = texture2D(uMap, uv);
  // gl_FragColor = vec4(uv.x, uv.y, 1., 1.);
}
