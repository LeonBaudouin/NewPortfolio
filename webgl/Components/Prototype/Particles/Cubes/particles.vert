attribute vec2 aPixelPosition;

uniform sampler2D uPosTexture;
uniform sampler2D uPreviousPosTexture;
uniform sampler2D uVelocityTexture;
uniform sampler2D uNormalTexture;
uniform float uSize;

varying vec3 vViewPosition;
varying vec3 vNormal;

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
  float scale = cremap(speed, 0.1, 0.3, 0.8, 1.2) * uSize;

  float diff = length(data.xyz - previousData.xyz);
  vec3 prevPos = diff == 0. ? data.xyz - attractorNormal : previousData.xyz ;
  // attractorNormal
	mat4 localRotation = mat4( calcLookAtMatrix( data.xyz, prevPos.xyz, 0. ) );
  vec3 newPosition = (localRotation * vec4(position, 1.0)).xyz;
  vec4 mvPosition = modelViewMatrix * vec4((newPosition * scale + offset), 1.0);

  vNormal = normalMatrix * (localRotation * vec4(normal, 0.)).rgb;
	vViewPosition = - mvPosition.xyz;

  gl_Position = projectionMatrix * mvPosition;

  // Size attenuation
  // gl_PointSize = uSize;
  // gl_PointSize *= (1.0 / - mvPosition.z);
}
