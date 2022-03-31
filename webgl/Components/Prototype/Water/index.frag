uniform vec3 color;
uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
varying vec4 vUv;
varying vec3 vPosition;

#include <logdepthbuf_pars_fragment>

const float M_PI = 3.141592653589793;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// ------------
// --- MATH ---
// ------------

float remap(float value, float start1, float stop1, float start2, float stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

float cremap(float value, float start1, float stop1, float start2, float stop2) {
  float r = remap(value, start1, stop1, start2, stop2);
  return clamp(r, min(start2, stop2), max(start2, stop2));
}

float blendOverlay( float base, float blend ) {
  return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );
}

vec3 blendOverlay( vec3 base, vec3 blend ) {
  return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );
}

vec3 getDisplacedPosition(vec2 _position) {
  return  vec3(_position, texture2D(tNormal, _position + .5).r);
}

void main() {
  #include <logdepthbuf_fragment>

  float M_PI = 1.57079632679;
  float distanceA = 1. / 512.;
  float distanceB = 1. / 512.;

  vec2 position = vPosition.xy * 0.05;
  vec3 displacedPosition = getDisplacedPosition(position);

  vec2 positionA = position + vec2(distanceA, 0.);
  vec3 displacedPositionA = getDisplacedPosition(positionA);

  vec2 positionB = position + vec2(0., distanceB);
  vec3 displacedPositionB = getDisplacedPosition(positionB);

  vec3 my_normal = cross(
    displacedPositionA - displacedPosition.xyz,
    displacedPositionB - displacedPosition.xyz
  );
  my_normal = normalize(my_normal);

  // vec4 normalColor = texture2D(tNormal, vPosition.xy * 0.1);

  // vec3 tex_normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b, normalColor.g * 2.0 - 1.0 ) );

  // my_normal = tex_normal;

  vec3 lightDir = normalize(vec3(30., 20., 1.));
  // float light = cremap(dot(lightDir, my_normal), 1., 0.8, 0., 1.);
  float light = cremap(dot(lightDir, my_normal), 0.5, 1., 0., .1);

  vec4 mirrorCoord = vUv;
  mirrorCoord.xz += my_normal.xy * 0.1;
  vec4 base = texture2DProj( tDiffuse, mirrorCoord );
  gl_FragColor = vec4( blendOverlay( base.rgb, color ) + light, 1.0 );
  // gl_FragColor = vec4(my_normal, 1.);
}
