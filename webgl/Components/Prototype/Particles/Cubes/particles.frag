uniform sampler2D uTexture;
uniform sampler2D uMatcap;

varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec2 vImageUv;
varying float vImageAlpha;

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
  // vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
  // float alpha = step(length(uv - vec2(.5)), .5);

  // if (alpha < 0.01) discard;



  vec3 color = texture2D(uMatcap, matcapUv).rgb;
  color = mix(color, texture2D(uTexture, vImageUv).rgb, isNorm(vUv) * vImageAlpha);

  gl_FragColor = vec4(color, 1.);

  #include <fog_fragment>
  gl_FragColor = linearToOutputTexel( gl_FragColor );
  // gl_FragColor = vec4((normal * 0.5) + 0.5, 1.);
}
