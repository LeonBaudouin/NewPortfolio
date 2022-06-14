varying vec3 eyeDirection;

uniform mat4 inverseProjectionMatrix;
uniform mat4 inverseViewMatrix;

void main() {
  gl_Position = vec4(position, 1.0);

  // https://stackoverflow.com/questions/60132588/i-need-help-converting-this-2d-sky-shader-to-3d
  vec3 proj_ray = vec3(inverseProjectionMatrix * vec4(position.xyz, 1.0));
  eyeDirection   = vec3(inverseViewMatrix * vec4(proj_ray.xyz, 0.0));
}
