precision mediump float;

out vec4 fragColor;

uniform vec3 uDownColor;
uniform vec3 uUpColor;

uniform vec3 uCameraPosition;

uniform float uGradientStart;
uniform float uGradientEnd;
uniform vec2 uScreenResolution;
varying vec3 eyeDirection;

float random(float n){return fract(sin(n) * 43758.5453123);}

float random(vec2 n) {
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float remap(float value, float start1, float stop1, float start2, float stop2)
{
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

float cremap(float value, float start1, float stop1, float start2, float stop2) {
    float r = remap(value, start1, stop1, start2, stop2);
    return clamp(r, start2, stop2);
}

void main() {
  float height = dot(normalize(eyeDirection), vec3(0., 1., 0.));
  float dist = cremap(height, uGradientStart, uGradientEnd, 0., 1.);
	vec2 uv = gl_FragCoord.xy / uScreenResolution;
  float mixValue = dist + (random(uv * 100.) - .5) / 5.;
  vec3 color = mix(uDownColor, uUpColor, mixValue);
  fragColor = vec4(color, 1.);
  // fragColor = vec4(vec3(height), 1.);
  // fragColor = vec4(eyeDirection, 1.);
}
