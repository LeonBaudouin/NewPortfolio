uniform sampler2D uFbo;
uniform vec3 uPosition;
uniform float uPlaneScale;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uStrength;

varying vec2 vUv;


float isNorm(vec2 _st) {
  if (_st.x > 1. || _st.y > 1. || _st.x < 0. || _st.y < 0.)
    return 0.;
  return 1.;
}

float remap(float value, float start1, float stop1, float start2, float stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

float cremap(float value, float start1, float stop1, float start2, float stop2) {
  float r = remap(value, start1, stop1, start2, stop2);
  return clamp(r, min(start2, stop2), max(start2, stop2));
}

vec4 sampleFbo(vec2 coord) {
  return mix(vec4(0.), texture2D(uFbo, coord), isNorm(coord));
}

vec3 sdgCircle( in vec2 p, in float r )
{
    float d = length(p);
    return vec3( d-r, p/d );
}

void main() {
  /* get vertex info */
  vec2 uv = vUv + ((-uPosition.xz * vec2(1., -1.)) / uPlaneScale);
  // vec2 uv = vUv;

  vec4 info = sampleFbo(uv);

  /* add the drop to the height */
  // float drop = max(0.0, 1.0 - length(uCenter - vUv) / uRadius);
  vec3 drop = sdgCircle(vUv - uCenter, uRadius);
  drop.x = cremap(drop.x, -uRadius, 0., 1., 0.);
  drop.yz *= drop.x;
  drop *= uStrength;

  info.r = min(info.r + drop.x, 1.);
  info.g = mix(info.g, drop.y, drop.x);
  info.b = mix(info.b, drop.z, drop.x);
  info.rgb *= 0.99;
  gl_FragColor = info;
}
