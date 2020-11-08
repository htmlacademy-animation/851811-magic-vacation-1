precision mediump float;

uniform sampler2D map;

struct optionsStruct {
  float hueShift;
  bool magnify;
};

uniform optionsStruct options;

struct bubbleStruct {
  float radius;
  float flareOffset;
  float flareAngleStart;
  float flareAngleEnd;
  vec2 position;
};

struct magnificationStruct {
  bubbleStruct bubbles[3];
  vec2 resolution;
};

uniform magnificationStruct magnification;

varying vec2 vUv;

vec3 hueShift(vec3 color, float hue) {
  const vec3 k = vec3(0.57735);
  float cosAngle = cos(hue);
  return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
}

bool isBetweenAngles(vec2 point, float flareAngleStart, float flareAngleEnd) {
  float angle = atan(point.y, point.x);
  return angle >= flareAngleStart && angle <= flareAngleEnd;
}

bool isCurrentBubble(vec2 point, vec2 circle, float radius, float outlineThickness) {
  float offset = distance(point, circle);
  return offset < radius + outlineThickness;
}

bool isInsideTheCircle(vec2 point, vec2 circle, float radius) {
  float offset = distance(point, circle);
  return offset < radius;
}

bool isOutlineOfTheCircle(vec2 point, vec2 circle, float radius, float outlineThickness) {
  float offset = distance(point, circle);
  return floor(offset) >= floor(radius) && floor(offset) <= floor(radius + outlineThickness);
}

bool isFlare(vec2 point, vec2 circle, float radius, float flareThickness, float flareAngleStart, float flareAngleEnd) {
  bool isBetweenFlareAngles = isBetweenAngles(point - circle, flareAngleStart, flareAngleEnd);
  bool isWithinFlareOutline = isOutlineOfTheCircle(point, circle, radius, flareThickness);

  return isBetweenFlareAngles && isWithinFlareOutline;
}

vec4 blendOutline(vec4 texture, vec4 outline) {
  return vec4(mix(texture.rgb, outline.rgb, outline.a), texture.a);
}

vec4 magnify(sampler2D map, magnificationStruct magnification) {
  float outlineThickness = 3.0;
  vec4 outlineColor = vec4(1, 1, 1, 0.15);

  float flareThickness = outlineThickness;
  vec4 flareColor = outlineColor;

  vec2 resolution = magnification.resolution;
  bubbleStruct bubble = magnification.bubbles[0];
  vec2 point = gl_FragCoord.xy;

  for (int index = 0; index < 3; index++) {
    bubbleStruct currentBubble = magnification.bubbles[index];

    vec2 currentPosition = currentBubble.position;
    float currentRadius = currentBubble.radius;

    if (isCurrentBubble(point, currentPosition, currentRadius, outlineThickness)) {
      bubble = currentBubble;
    }
  }

  vec2 position = bubble.position;
  float radius = bubble.radius;
  float flareAngleStart = bubble.flareAngleStart;
  float flareAngleEnd = bubble.flareAngleEnd;
  float flareOffset = bubble.flareOffset;

  float h = bubble.radius / 2.0;

  float hr = radius * sqrt(1.0 - pow((radius - h) / radius, 2.0));
  float offset = distance(point, position);

  bool pointIsInside = isInsideTheCircle(point, position, hr);
  bool pointIsOutline = isOutlineOfTheCircle(point, position, hr, outlineThickness);
  bool pointIsFlare = isFlare(point, position, hr * flareOffset, flareThickness, flareAngleStart, flareAngleEnd);

  vec2 newPoint = pointIsInside ? (point - position) * (radius - h) / sqrt(pow(radius, 2.0) - pow(offset, 2.0)) + position : point;

  vec2 newVUv = (newPoint) / resolution;

  if (pointIsOutline) {
    return blendOutline(texture2D(map, newVUv), outlineColor);
  }

  if (pointIsFlare) {
    return blendOutline(texture2D(map, newVUv), flareColor);
  }

  return texture2D(map, newVUv);
}

void main() {
  vec4 result = texture2D(map, vUv);

  if (options.magnify) {
    result = magnify(map, magnification);
  }

  vec3 hueShifted = hueShift(result.rgb, options.hueShift);
  result = vec4(hueShifted.rgb, 1);

  gl_FragColor = result;
}
