export const getCoordsOfAngle = (cx, cy, radius, angle) => {
  const x = cx + radius * Math.cos(angle);
  const y = cy + radius * Math.sin(angle);
  return {x, y};
};

export const getConeRadiusFromSideWidth = (width) => Math.hypot(width, width) / 2;
