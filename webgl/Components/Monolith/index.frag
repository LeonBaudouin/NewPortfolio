uniform sampler2D uBlueMatcap;
uniform sampler2D uGreenMatcap;
uniform bool uInReflection;
uniform vec4 uShadowRemap;
uniform float uShadowDilate;
uniform vec2 uShadowOffset;
uniform float uTransitionProg;
uniform float uTransitionForward;
varying vec3 vTextureCoords[2];


varying vec3 vViewPosition;
varying vec3 vNormal;

#include <fog_pars_fragment>

float remap(float value, float start1, float stop1, float start2, float stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

float cremap(float value, float start1, float stop1, float start2, float stop2) {
  float r = remap(value, start1, stop1, start2, stop2);
  return clamp(r, min(start2, stop2), max(start2, stop2));
}

float sdBox( in vec2 p, in vec2 b ) {
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

void main() {
	vec3 normal = normalize( vNormal );

	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 matcapUv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
  if (uInReflection) matcapUv.x = 1. - matcapUv.x;

  float v = 1.;
  for (int i = 0; i < 2; i++) {
    vec2 textureCoords = vTextureCoords[i].zy;
    float d = sdBox(textureCoords - 0.5 + uShadowOffset, vec2(0.5) + uShadowDilate);
    d = cremap(d, uShadowRemap.x, uShadowRemap.y, uShadowRemap.z, uShadowRemap.w);
    v = min(d, v);
  }

  vec3 greenColor = texture2D(uGreenMatcap, matcapUv).rgb;
  vec3 blueColor = texture2D(uBlueMatcap, matcapUv).rgb;
  float mixValue = uTransitionForward > 0. ? 1. - uTransitionProg : uTransitionProg;
  vec3 color = mix(greenColor, blueColor, mixValue) * v;

  gl_FragColor = vec4(color, 1.);

  #include <fog_fragment>
  gl_FragColor = linearToOutputTexel( gl_FragColor );
}
