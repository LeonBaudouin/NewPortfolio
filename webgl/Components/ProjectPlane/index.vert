varying vec3 vTextureCoords;
uniform mat4 uLocalMatrix;
uniform mat4 uPlaneMatrix;
uniform float uPlaneRatio;
uniform float uTextureRatio;

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

void main() {
  vTextureCoords = 0.5 - (uPlaneMatrix * uLocalMatrix * vec4(position, 1.0)).xyz;
  // ivec2 t = textureSize(uTexture, 1);
  float tRatio = uTextureRatio;
  vTextureCoords.xy = adjustUvToImage(vTextureCoords.xy, vec2(0.5), tRatio, uPlaneRatio, false);


  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;

	#include <fog_vertex>
}
