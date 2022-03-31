
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec3 vColor;
varying vec2 vUv;

attribute vec3 _center;
attribute vec3 _direction;

uniform float offset;

#include <fog_pars_vertex>

void main() {
  // vec3 transformed = vec3( position + _direction * 0.1 );
  // vec3 dir = _center - (modelMatrix * vec4(0.)).xyz * offset;
  vec3 dir = _direction;
  dir.y *= 0.2;
  dir = normalize(dir);
  vec3 transformed = vec3( position + dir * offset );
  vec4 mvPosition = vec4( transformed, 1.0 );
  vec4 worldPosition = mvPosition;
  mvPosition = viewMatrix * modelMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;

  vNormal = normalMatrix * normal;
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
  vColor = color.rgb;
  vUv = uv;
}
