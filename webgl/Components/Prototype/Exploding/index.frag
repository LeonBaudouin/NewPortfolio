
#include <fog_pars_fragment>

uniform sampler2D uMatcap;
uniform sampler2D uAoMap;

uniform float uAoAmount;

varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec3 vColor;
varying vec2 vUv;

void main() {
	vec3 normal = normalize( vNormal );

	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 matcapUv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;

  vec4 color = texture2D( uMatcap, matcapUv );

  vec4 ao = texture2D(uAoMap, vUv);
  ao = 1. - ((1. - ao) * uAoAmount);

  gl_FragColor = vec4(color.rgb * ao.rgb, 1.);
  gl_FragColor = LinearTosRGB( gl_FragColor );
  #include <fog_fragment>
  // gl_FragColor = vec4(vColor, 1.);
}
