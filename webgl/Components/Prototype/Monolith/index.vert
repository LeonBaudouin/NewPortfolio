varying vec3 vViewPosition;
varying vec3 vNormal;

#include <fog_pars_vertex>

void main() {

  vNormal = normalMatrix * normal;

  vec4 mvPosition = modelViewMatrix * vec4((position), 1.0);

	vViewPosition = - mvPosition.xyz;

  gl_Position = projectionMatrix * mvPosition;

	#include <fog_vertex>
}
