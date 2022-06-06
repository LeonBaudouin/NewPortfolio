uniform sampler2D uBlueMatcap;
uniform sampler2D uGreenMatcap;
uniform bool uInReflection;
uniform float uTransitionProg;
uniform float uTransitionForward;

varying vec3 vViewPosition;
varying vec3 vNormal;

#include <fog_pars_fragment>

void main() {
	vec3 normal = normalize( vNormal );

	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 matcapUv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
  if (uInReflection) matcapUv.x = 1. - matcapUv.x;

  vec3 greenColor = texture2D(uGreenMatcap, matcapUv).rgb;
  vec3 blueColor = texture2D(uBlueMatcap, matcapUv).rgb;
  float mixValue = uTransitionForward > 0. ? 1. - uTransitionProg : uTransitionProg;
  vec3 color = mix(greenColor, blueColor, mixValue);

  gl_FragColor = vec4(color, 1.);

  #include <fog_fragment>
  gl_FragColor = linearToOutputTexel( gl_FragColor );
  // gl_FragColor = vec4((normal * 0.5) + 0.5, 1.);
}
