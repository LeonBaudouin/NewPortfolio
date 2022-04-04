
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec3 vColor;
varying vec2 vUv;

#include <fog_pars_vertex>

void main() {
  vec3 transformed = vec3( position );
  vec4 mvPosition = vec4( transformed, 1.0 );
  vec4 worldPosition = mvPosition;
  mvPosition = viewMatrix * modelMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;

	#include <fog_vertex>
  vNormal = normalMatrix * normal;
	vViewPosition = - mvPosition.xyz;
  vColor = color.rgb;
  vUv = uv;
}
