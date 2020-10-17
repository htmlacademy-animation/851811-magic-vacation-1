precision mediump float;

uniform sampler2D map;

struct optionsStruct {
  float hueShift;
};

uniform optionsStruct options;

varying vec2 vUv;

vec3 hueShift(vec3 color, float hue) {
  const vec3 k = vec3(0.57735);
  float cosAngle = cos(hue);
  return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
}

void main() {
  vec4 texel = texture2D(map, vUv);
  vec4 result = texel;

  vec3 hueShifted = hueShift(result.rgb, options.hueShift);
  result = vec4(hueShifted.rgb, 1);

  gl_FragColor = result;
}
