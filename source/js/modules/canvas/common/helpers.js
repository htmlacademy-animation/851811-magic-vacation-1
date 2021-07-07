export const rotateCtx = (ctx, angle, cx, cy) => {
  ctx.translate(cx, cy);
  ctx.rotate((Math.PI / 180) * angle);
  ctx.translate(-cx, -cy);
};

export const rotateCoords = (cx, cy, x, y, angle) => {
  const newX = (x - cx) * Math.cos(angle * Math.PI / 180) - (y - cy) * Math.sin(angle * Math.PI / 180) + cx;
  const newY = (x - cx) * Math.sin(angle * Math.PI / 180) + (y - cy) * Math.cos(angle * Math.PI / 180) + cy;
  return {x: newX, y: newY};
};

export const skewCtx = (ctx, x, y) => {
  ctx.transform(1, x, y, 1, 0, 0);
};
