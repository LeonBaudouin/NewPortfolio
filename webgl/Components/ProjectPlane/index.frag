varying vec3 vTextureCoords;
uniform sampler2D uTexture;

float isNorm(vec2 _st) {
  if (_st.x > 1. || _st.y > 1. || _st.x < 0. || _st.y < 0.)
    return 0.;
  return 1.;
}

#include <fog_pars_fragment>

void main() {
  vec2 uv = vTextureCoords.xy;
  uv = 1. - uv;
  vec3 color = texture2D(uTexture, uv).rgb;

  gl_FragColor = vec4(color, 1.);
  // gl_FragColor = vec4(vec3(isNorm(vTextureCoords.xy)), 0.5);
  // gl_FragColor = vec4(vec3((vTextureCoords.xy), 1.), 1.);

  #include <fog_fragment>
  gl_FragColor = linearToOutputTexel( gl_FragColor );
}