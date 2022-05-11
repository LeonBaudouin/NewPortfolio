varying vec3 eyeDirection;
void main() {
  gl_Position = vec4(position, 1.0);

  // https://stackoverflow.com/questions/60132588/i-need-help-converting-this-2d-sky-shader-to-3d
  vec3 proj_ray = vec3(inverse(projectionMatrix) * vec4(position.xyz, 1.0));
  eyeDirection   = vec3(inverse(viewMatrix) * vec4(proj_ray.xyz, 0.0));
}
