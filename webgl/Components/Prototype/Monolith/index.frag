uniform sampler2D uMatcap;
uniform bool uInReflection;

varying vec3 vViewPosition;
varying vec3 vNormal;

#include <fog_pars_fragment>

float isNorm(vec2 _st) {
  if (_st.x > 1. || _st.y > 1. || _st.x < 0. || _st.y < 0.)
    return 0.;
  return 1.;
}

void main() {
	vec3 normal = normalize( vNormal );

	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 matcapUv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
  if (uInReflection) matcapUv.x = 1. - matcapUv.x;

  vec3 color = texture2D(uMatcap, matcapUv).rgb;

  gl_FragColor = vec4(color, 1.);

  #include <fog_fragment>
  gl_FragColor = linearToOutputTexel( gl_FragColor );
}
