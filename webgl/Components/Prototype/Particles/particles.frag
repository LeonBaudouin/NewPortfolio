uniform sampler2D uPosTexture;

void main()
{
  vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
  float alpha = step(length(uv - vec2(.5)), .5);

  if (alpha < 0.01) discard;
  gl_FragColor = vec4(vec3(0., 0., 0.), 1.);
}
