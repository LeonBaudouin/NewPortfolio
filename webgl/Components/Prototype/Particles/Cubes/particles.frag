uniform sampler2D uPosTexture;
uniform sampler2D uMatcap;

varying vec3 vViewPosition;
varying vec3 vNormal;

void main()
{
	vec3 normal = normalize( vNormal );

	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 matcapUv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
  // vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
  // float alpha = step(length(uv - vec2(.5)), .5);

  // if (alpha < 0.01) discard;
  gl_FragColor = vec4(texture2D(uMatcap, matcapUv).rgb, 1.);
  gl_FragColor = linearToOutputTexel( gl_FragColor );
  // gl_FragColor = vec4((normal * 0.5) + 0.5, 1.);
}
