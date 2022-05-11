uniform mat4 textureMatrix;
varying vec4 vUv;
varying vec3 vPosition;
varying vec3 vViewDirection;

#include <common>
#include <logdepthbuf_pars_vertex>

void main() {
  vUv = textureMatrix * vec4( position, 1.0 );

	vec4 worldPosition = modelMatrix * vec4( position, 1.0);
  vViewDirection = normalize(worldPosition.xyz - cameraPosition);

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  vPosition = position;

  #include <logdepthbuf_vertex>
}
