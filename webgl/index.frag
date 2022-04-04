uniform sampler2D tDiffuse;
uniform bool uSRGB;
varying vec2 vUv;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  gl_FragColor = uSRGB ? LinearTosRGB(color) : color;
}
