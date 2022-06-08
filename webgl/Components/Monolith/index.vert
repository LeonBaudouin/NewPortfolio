uniform mat4 uPlaneMatrix[2];

varying vec3 vViewPosition;
varying vec3 vTextureCoords[2];
varying vec3 vNormal;
varying vec2 vCoords;

#include <fog_pars_vertex>

#define PI 3.14159265359

mat3 rotateY(float theta) {
  return mat3(
    cos(theta), 0., sin(theta),
    0., 1., 0.,
    -sin(theta), 0., cos(theta)
  );
}

void main() {

  vTextureCoords[0] = rotateY(PI * 0.5) * (0.5 - (uPlaneMatrix[0] * modelMatrix * vec4(position, 1.0)).xyz);
  vTextureCoords[1] = rotateY(PI * 0.5) * (0.5 - (uPlaneMatrix[1] * modelMatrix * vec4(position, 1.0)).xyz);

  vNormal = normalMatrix * normal;

  float frontFace = dot(normal, vec3(0., 0., 1.));

  vec4 mvPosition = modelViewMatrix * vec4((position), 1.0);
  vCoords = mix(vec2(100., 100.), position.xy, frontFace);

	vViewPosition = - mvPosition.xyz;

  gl_Position = projectionMatrix * mvPosition;

	#include <fog_vertex>
}
