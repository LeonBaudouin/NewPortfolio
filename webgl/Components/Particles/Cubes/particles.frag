uniform sampler2D uBlueMatcap;
uniform sampler2D uGreenMatcap;
uniform sampler2D uAo;
uniform bool uInReflection;
uniform float uTransitionProg;
uniform float uTransitionForward;

varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;

#include <fog_pars_fragment>


float remap(float value, float start1, float stop1, float start2, float stop2)
{
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

float cremap(float value, float start1, float stop1, float start2, float stop2) {
    float r = remap(value, start1, stop1, start2, stop2);
    return clamp(r, start2, stop2);
}

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

  float ao = texture2D(uAo, vUv).r;
  ao = cremap(ao, 0., 1., .2, 1.);

  gl_FragColor = vec4(color * ao, 1.);

  #include <fog_fragment>
  gl_FragColor = linearToOutputTexel( gl_FragColor );
  // gl_FragColor = vec4((normal * 0.5) + 0.5, 1.);
}
