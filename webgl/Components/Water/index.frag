const float PI = 3.141592653589793;

uniform sampler2D tDiffuse;
uniform sampler2D tRipples;
uniform mat4 uRipplesMatrix;
uniform int uDebug;
uniform float uTime;
uniform float uNoiseIntensity; // * 0.002
uniform float uNoiseScale; // * 10.
uniform float uRipplesIntensity; // * 0.5
uniform float uFresnelPower;
uniform vec2 uFresnelRemap;
uniform vec4 uBlendRemap;
uniform vec3 uBlendColor;
uniform vec4 uRampRemap;
uniform float uTransitionProg;
uniform float uTransitionForward;

varying vec4 vUv;
varying vec3 vPosition;
varying vec3 vViewDirection;

#include <common>
#include <logdepthbuf_pars_fragment>

//	Simplex 3D Noise
//	by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
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

float distToEdge(vec2 _st) {
  return max(abs(0.5-_st.x), abs(0.5-_st.y));
}

float isNorm(vec2 _st) {
  if (_st.x > 1. || _st.y > 1. || _st.x < 0. || _st.y < 0.)
    return 0.;
  return 1.;
}
float smin1(float a, float b, float k)
{
  return pow((0.5 * (pow(a, -k) + pow(b, -k))), (-1.0 / k));
}
float smax0(float a, float b, float k)
{
  return smin1(a, b, -k);
}

float exponentialIn(float t) {
  return t == 0.0 ? t : pow(2.0, 10.0 * (t - 1.0));
}

vec2 rotateUV(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}

vec3 getDisplacedPosition(vec2 _position, vec2 basePosition) {
  vec2 uv = _position * vec2(1., -1.) + .5;
  float height = texture2D(tRipples, uv).r * uRipplesIntensity;
  // height *= cremap(distToEdge(uv), 0., .5, 1., 0.);
  float noise = (1. + snoise(vec3(basePosition * uNoiseScale, uTime * 1.5) + vec3(uTime * 1.5, 0., 0.))) * uNoiseIntensity * 0.5;
  height = smax0(noise, height, 4.);
  return vec3(_position, height);
}

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

float computeAlpha(vec2 pos) {
  float scale = 20.;

  float prog = uTransitionProg * 1.13;

  float branchNumber = 10.;
  float bulgeSize = 0.700 * prog + 0.776 * exponentialIn(prog);

  vec2 center = vec2(0.);
  pos -= center;
	pos /= scale;
  pos += center;
  float rot = length(center - pos) * 1.388;
  vec2 rotatedPos = rotateUV(pos, rot, center);
  vec2 centeredPos = center - rotatedPos;

  float b = max(-pos.x, 0.);

  vec2 dir = normalize(centeredPos);
  float angleProg = atan(dir.y, dir.x);
  float bulge = (1. + sin(angleProg * branchNumber)) / 2. + b * 4.;
  float stepV = prog + bulge * bulgeSize;
  float v = step(length(centeredPos), stepV);
	return uTransitionForward > 0. ? 1. - v : v;
}

void main() {
  #include <logdepthbuf_fragment>

  float distanceA = 1. / (512.);
  float distanceB = 1. / (512.);

  vec2 position = (uRipplesMatrix * vec4(vPosition.x, 0., -vPosition.y, 1.)).xz;
  vec2 basePosition = vPosition.xy;
  vec3 displacedPosition = getDisplacedPosition(position, basePosition);

  vec2 positionA = position + vec2(distanceA, 0.);
  vec3 displacedPositionA = getDisplacedPosition(positionA, basePosition + vec2(distanceA, 0.));

  vec2 positionB = position + vec2(0., distanceB);
  vec3 displacedPositionB = getDisplacedPosition(positionB, basePosition + vec2(0., distanceB));

  vec3 my_normal = cross(
    displacedPositionA - displacedPosition.xyz,
    displacedPositionB - displacedPosition.xyz
  );
  my_normal = normalize(my_normal);


  // vec3 lightDir = normalize(vec3(30., 20., 1.));
  // float light = cremap(dot(lightDir, my_normal), 0.5, 1., 0., .1);


  float fresnelFactor = abs(dot(vViewDirection, my_normal.rbg));
  float inversefresnelFactor = 1.0 - fresnelFactor;
  // Shaping function
  fresnelFactor = pow(fresnelFactor, uFresnelPower);
  inversefresnelFactor = pow(inversefresnelFactor, uFresnelPower);
  float f = cremap(fresnelFactor, uFresnelRemap.x, uFresnelRemap.y, 0., 1.);

  vec4 mirrorCoord = vUv;

  mirrorCoord.xy += my_normal.xy * 0.1;
  vec4 base = texture2DProj( tDiffuse, mirrorCoord );
  // base = linearToOutputTexel(base);
  float sat = 1. - rgb2hsv(base.rgb).y;
  // sat = remap(sat, 0.1, 1., 0., 1.);
  // gl_FragColor = vec4(c + f, 1.);
  sat = remap(sat, uBlendRemap.x, uBlendRemap.y, uBlendRemap.z, uBlendRemap.w);
  vec3 c = mix(base.rgb, uBlendColor, sat);
  float deepnessBlend = cremap(vUv.y, uRampRemap.x, uRampRemap.y, uRampRemap.z, uRampRemap.w);
  // c = blendOverlay( c, color );
  c = blendOverlay( c, vec3(deepnessBlend) );

  float alpha = computeAlpha(vPosition.xy);

  // gl_FragColor = vec4(vec3(sat), 1.);
  gl_FragColor = vec4(c + f, alpha);

  if (alpha < 0.5) discard;
  // gl_FragColor = vec4(vec3(deepnessBlend), 1.);



  if (uDebug == 1) gl_FragColor = vec4(my_normal, 1.);
  if (uDebug == 2) gl_FragColor = vec4(position.x + 0.5, position.y + 0.5, 1., 1.);
  if (uDebug == 3) gl_FragColor = vec4(vec3(displacedPosition.z * 100.), 1.);
}
