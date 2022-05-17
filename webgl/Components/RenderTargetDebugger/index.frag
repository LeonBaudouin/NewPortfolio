varying vec2 vUv;

uniform sampler2D uTexture;

void main() {
  gl_FragColor = vec4(texture2D(uTexture, vUv).rgb * 1000., 1.);
}
