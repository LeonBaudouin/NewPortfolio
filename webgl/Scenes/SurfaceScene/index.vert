void main() {
  vec3 transformed = vec3( position );
  vec4 mvPosition = vec4( transformed, 1.0 );
  vec4 worldPosition = mvPosition;
  mvPosition = viewMatrix * modelMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;
}
