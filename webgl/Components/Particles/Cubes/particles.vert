attribute vec2 aPixelPosition;

uniform sampler2D uPosTexture;
uniform sampler2D uPreviousPosTexture;
uniform sampler2D uVelocityTexture;
uniform sampler2D uNormalTexture;
uniform float uSize;
uniform vec4 uSizeVariation;
uniform vec4 uTextureEdges;
uniform float uTextureAlpha;

varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec2 vImageUv;
varying float vImageAlpha;

#include <fog_pars_vertex>

vec2 adjustUvToImage(vec2 _st, vec2 center, float texRatio, float quadRatio, bool fit) {
  float correctedRatio = quadRatio / texRatio;
  vec2 imageUv = _st - center;
  imageUv *= vec2(correctedRatio, 1.);
  if (fit)
    imageUv /= mix(1. / correctedRatio, correctedRatio, step(correctedRatio, 1.));
  imageUv /= mix(correctedRatio, 1., step(correctedRatio, 1.));
  imageUv += center;
  return imageUv;
}

vec3 getTriPlanarBlend(vec3 _wNorm){
	// in wNorm is the world-space normal of the fragment
	vec3 blending = abs( _wNorm );
	blending = normalize(max(blending, 0.00001)); // Force weights to sum to 1.0
	float b = (blending.x + blending.y + blending.z);
	blending /= vec3(b, b, b);
	return blending;
}

mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
	vec3 rr = vec3(sin(roll), cos(roll), 0.0);
	vec3 ww = normalize(target - origin);
	vec3 uu = normalize(cross(ww, rr));
	vec3 vv = normalize(cross(uu, ww));

	return mat3(uu, vv, ww);
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

void main() {
  vec3 attractorNormal = texture2D(uNormalTexture, aPixelPosition).xyz;
  vec4 data = texture2D(uPosTexture, aPixelPosition);
  vec4 previousData = texture2D(uPreviousPosTexture, aPixelPosition);
  vec4 velocityData = texture2D(uVelocityTexture, aPixelPosition);
  float speed = length(velocityData.xyz);
  vec3 offset = data.rgb;
  // float scale = cremap(speed, 0.05, 0.3, 0., 1.) * uSize;
  float scale = cremap(
    speed,
    uSizeVariation.x,
    uSizeVariation.y,
    uSizeVariation.z,
    uSizeVariation.w
  ) * uSize;

  float diff = length(data.xyz - previousData.xyz);
  // vec3 normalPrevPos = data.xyz - attractorNormal;
  // float factor = cremap(diff, 0., 1., 0.1, 0.);
  // vec3 prevPos = mix(previousData.xyz, normalPrevPos, factor);
  vec3 prevPos = previousData.xyz ;
	mat4 localRotation = mat4( calcLookAtMatrix( data.xyz, prevPos.xyz, 0. ) );
  vec3 newPosition = (localRotation * vec4(position, 1.0)).xyz;

  vNormal = normalMatrix * (localRotation * vec4(normal, 0.)).rgb;

  vec4 mvPosition = modelViewMatrix * vec4((newPosition * scale + offset), 1.0);


	vViewPosition = - mvPosition.xyz;

  vec3 worldPos = (modelMatrix * vec4((newPosition * scale + offset), 1.0)).xyz;

  float triplanarFactor = getTriPlanarBlend((localRotation * vec4(normal, 0.)).rgb).x;
  vImageAlpha = triplanarFactor * cremap(diff, 0., 0.2, 1., 0.) * cremap(speed, 0., 0.1, 1., 0.) * uTextureAlpha;
  vUv.x = remap(worldPos.z, uTextureEdges.y, uTextureEdges.w, 0., 1.);
  vUv.y = remap(worldPos.y, uTextureEdges.x, uTextureEdges.z, 0., 1.);
  float quadRatio = abs(uTextureEdges.y - uTextureEdges.w) / abs(uTextureEdges.x - uTextureEdges.z);
  float texRatio = 16./9.;
  vImageUv = adjustUvToImage(vUv, vec2(0.58, 0.5), texRatio, quadRatio, false);

  vUv = uv;
  gl_Position = projectionMatrix * mvPosition;

	#include <fog_vertex>

  // Size attenuation
  // gl_PointSize = uSize;
  // gl_PointSize *= (1.0 / - mvPosition.z);
}
