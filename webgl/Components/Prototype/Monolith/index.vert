varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vCoords;

#include <fog_pars_vertex>

void main() {

  vNormal = normalMatrix * normal;

  float frontFace = dot(normal, vec3(0., 0., 1.));

  vec4 mvPosition = modelViewMatrix * vec4((position), 1.0);
  vCoords = mix(vec2(100., 100.), position.xy, frontFace);

	vViewPosition = - mvPosition.xyz;

  gl_Position = projectionMatrix * mvPosition;

	#include <fog_vertex>
}
