varying vec2 vUv;
uniform sampler2D uFbo;
uniform sampler2D uPositionFbo;
uniform sampler2D uRandomForces;
uniform sampler2D uAttractorsTexture;
uniform vec3 uAttractor;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

float remap(float value, float start1, float stop1, float start2, float stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

void main() {
  vec4 positionData = texture2D(uPositionFbo, vUv);
  vec4 inputData = texture2D(uFbo, vUv);
  vec3 randomForce = texture2D(uRandomForces, vUv).xyz;

  vec3 position = positionData.xyz;


  bool useCursor = true;


  bool textureAttractors = !useCursor;
  // ------ TEXTURE ATTRACTOR
  vec3 attractor = textureAttractors
    ? texture2D(uAttractorsTexture, vUv).xyz
    : uAttractor;


  // ------ ATTRACTION
  if (length(position - attractor) == 0.) attractor.x += 0.1;
  float dist = length(position - attractor);
  dist = max(dist - 0.1, 0.);

  float G = 10.;
  float force = G * ((0.001 + rand(vUv) * 100.) / (dist * 0.01));
  force = min(force, 0.01);

  vec3 dir = normalize(attractor - position);
  inputData.xyz += force * dir;
  inputData.xyz += randomForce * remap(rand(vUv+1.5), 0., 1., 0.2, 1.2);

  float amount = length(inputData.xyz);
  vec3 velocity = normalize(inputData.xyz);


  bool capForce = useCursor;
  // ------ CAP FORCE
  float minForce = capForce
    ? remap(rand(vUv+1.), 0., 1., 0.05, 0.09)
    : 0.;
  amount = max(amount * 0.98, minForce);


  bool fixOnAttractor = !useCursor;
  // ------ FIX ON ATTRACTOR
  if (fixOnAttractor) {
    if (amount < 0.05 && length(positionData.xyz - attractor.xyz) < 0.05) {
      amount = 0.001;
      velocity = dir;
    }
    if (amount < 0.01 && length(positionData.xyz - attractor.xyz) < 0.01) {
      amount = 0.;
    }
  }

  inputData.xyz = velocity * amount;

	gl_FragColor = inputData;
}
