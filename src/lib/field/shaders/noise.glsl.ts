/**
 * Compact procedural noise for the Intelligence Field.
 *
 * Deliberately not a full simplex implementation. Value noise with a smooth
 * interpolant costs 8 hashes per sample; the flow field below takes 3 samples,
 * so ~24 hashes per particle per frame. At 17k particles that is affordable on
 * an integrated GPU, where Ashima-style simplex (with its permutation maths and
 * gradient lookups) is not.
 *
 * The visual target is organic drift, not physical accuracy.
 */
export const NOISE_GLSL = /* glsl */ `
#define TAU 6.28318530718

float hash31(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.13));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// Trilinear value noise in [0, 1].
float noise3(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  // Quintic fade — smoother second derivative than smoothstep, which matters
  // because particles ride the gradient and cubic interpolation shows creases.
  f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

  float n000 = hash31(i + vec3(0.0, 0.0, 0.0));
  float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
  float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
  float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
  float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
  float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
  float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
  float n111 = hash31(i + vec3(1.0, 1.0, 1.0));

  return mix(
    mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
    mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
    f.z
  );
}

/**
 * Three decorrelated noise samples read as a vector field. Not divergence-free
 * like true curl noise, but visually indistinguishable at these amplitudes and
 * a third of the cost.
 */
vec3 flow(vec3 p, float t) {
  return vec3(
    noise3(p * 0.62 + vec3(0.0, t * 0.11, 0.0)),
    noise3(p * 0.62 + vec3(5.21, t * 0.13, 1.37)),
    noise3(p * 0.62 + vec3(2.13, t * 0.09, 9.44))
  ) * 2.0 - 1.0;
}

// Cheap easing shared by the assembly and morph staggering.
float easeInOut(float t) {
  t = clamp(t, 0.0, 1.0);
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

float easeOut(float t) {
  t = clamp(t, 0.0, 1.0);
  return 1.0 - pow(1.0 - t, 3.0);
}

// Rotation about Y — used for field-level drift and pointer response.
mat3 rotateY(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}

mat3 rotateX(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
}
`;
