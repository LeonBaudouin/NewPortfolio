varying vec3 vTextureCoords;
uniform sampler2D uTexture;

#include <fog_pars_fragment>

void main() {
  vec2 uv = vTextureCoords.xy;
  uv = 1. - uv;
  vec3 color = texture2D(uTexture, uv).rgb;

  gl_FragColor = vec4(color, 1.);

  #include <fog_fragment>
  gl_FragColor = linearToOutputTexel( gl_FragColor );
}
